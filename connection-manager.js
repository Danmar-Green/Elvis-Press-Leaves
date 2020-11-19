'use strict';

const { Pool, TimeoutError } = require('sequelize-pool');
const _ = require('lodash');
const semver = require('semver');
const errors = require('../../errors');
const { logger } = require('../../utils/logger');
const deprecations = require('../../utils/deprecations');
const debug = logger.debugContext('pool');

/**
 * Abstract Connection Manager
 *
 * Connection manager which handles pooling & replication.
 * Uses sequelize-pool for pooling
 *
 * @private
 */
class ConnectionManager {
  constructor(dialect, sequelize) {
    const config = _.cloneDeep(sequelize.config);

    this.sequelize = sequelize;
    this.config = config;
    this.dialect = dialect;
    this.versionPromise = null;
    this.dialectName = this.sequelize.options.dialect;

    if (config.pool === false) {
      throw new Error('Support for pool:false was removed in v4.0');
    }

    config.pool = _.defaults(config.pool || {}, {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 60000,
      evict: 1000,
      validate: this._validate.bind(this)
    });

    this.initPools();
  }

  refreshTypeParser(dataTypes) {
    _.each(dataTypes, dataType => {
      if (Object.prototype.hasOwnProperty.call(dataType, 'parse')) {
        if (dataType.types[this.dialectName]) {
          this._refreshTypeParser(dataType);
        } else {
          throw new Error(`Parse function not supported for type ${dataType.key} in dialect ${this.dialectName}`);
        }
      }
    });
  }

  /**
   * Try to load dialect module from various configured options.
   * Priority goes like dialectModulePath > dialectModule > require(default)
   *
   * @param {string} moduleName Name of dialect module to lookup
   *
   * @private
   * @returns {object}
   */
  _loadDialectModule(moduleName) {
    try {
      if (this.sequelize.config.dialectModulePath) {
        return require(this.sequelize.config.dialectModulePath);
      }
      if (this.sequelize.config.dialectModule) {
        return this.sequelize.config.dialectModule;
      }
      return require(moduleName);

    } catch (err) {
      if (err.code === 'MODULE_NOT_FOUND') {
        if (this.sequelize.config.dialectModulePath) {
          throw new Error(`Unable to find dialect at ${this.sequelize.config.dialectModulePath}`);
        }
        throw new Error(`Please install ${moduleName} package manually`);
      }

      throw err;
    }
  }

  /**
   * Handler which executes on process exit or connection manager shutdown
   *
   * @private
   * @returns {Promise}
   */
  async _onProcessExit() {
    if (!this.pool) {
      return;
    }

    await this.pool.drain();
    debug('connection drain due to process exit');

    return await this.pool.destroyAllNow();
  }

  /**
   * Drain the pool and close it permanently
   *
   * @returns {Promise}
   */
  async close() {
    // Mark close of pool
    this.getConnection = async function getConnection() {
      throw new Error('ConnectionManager.getConnection was called after the connection manager was closed!');
    };

    return await this._onProcessExit();
  }

  /**
   * Initialize connection pool. By default pool autostart is set to false, so no connection will be
   * be created unless `pool.acquire` is called.
   */
  initPools() {
    const config = this.config;

    if (!config.replication) {
      this.pool = new Pool({
        name: 'sequelize',
        create: () => this._connect(config),
        destroy: async connection => {
          const result = await this._disconnect(connection);
          debug('connection destroy');
          return result;
        },
        validate: config.pool.validate,
        max: config.pool.max,
        min: config.pool.min,
        acquireTimeoutMillis: config.pool.acquire,
        idleTimeoutMillis: config.pool.idle,
        reapIntervalMillis: config.pool.evict,
        maxUses: config.pool.maxUses
      });

      debug(`pool created with max/min: ${config.pool.max}/${config.pool.min}, no replication`);

      return;
    }

    if (!Array.isArray(config.replication.read)) {
      config.replication.read = [config.replication.read];
    }

    // Map main connection config
    config.replication.write = _.defaults(config.replication.write, _.omit(config, 'replication'));

    // Apply defaults to each read config
    config.replication.read = config.replication.read.map(readConfig =>
      _.defaults(readConfig, _.omit(this.config, 'replication'))
    );

    // custom pooling for replication (original author @janmeier)
    let reads = 0;
    this.pool = {
      release: client => {
        if (client.queryType === 'read') {
          this.pool.read.release(client);
        } else {
          this.pool.write.release(client);
        }
      },
      acquire: (queryType, useMaster) => {
        useMaster = useMaster === undefined ? false : useMaster;
        if (queryType === 'SELECT' && !useMaster) {
          return this.pool.read.acquire();
        }
        return this.pool.write.acquire();
      },
      destroy: connection => {
        this.pool[connection.queryType].destroy(connection);
        debug('connection destroy');
      },
      destroyAllNow: async () => {
        await Promise.all([
          this.pool.read.destroyAllNow(),
          this.pool.write.destroyAllNow()
        ]);

        debug('all connections destroyed');
      },
      drain: async () => Promise.all([
        this.pool.write.drain(),
        this.pool.read.drain()
      ]),
      read: new Pool({
        name: 'sequelize:read',
        create: async () => {
          // round robin config
          const nextRead = reads++ % config.replication.read.length;
          const connection = await this._connect(config.replication.read[nextRead]);
          connection.queryType = 'read';
          return connection;
        },
        destroy: connection => this._disconnect(connection),
        validate: config.pool.validate,
        max: config.pool.max,
        min: config.pool.min,
        acquireTimeoutMillis: config.pool.acquire,
        idleTimeoutMillis: config.pool.idle,
        reapIntervalMillis: config.pool.evict,
        maxUses: config.pool.maxUses
      }),
      write: new Pool({
        name: 'sequelize:write',
        create: async () => {
          const connection = await this._connect(config.replication.write);
          connection.queryType = 'write';
          return connection;
        },
        destroy: connection => this._disconnect(connection),
        validate: config.pool.validate,
        max: config.pool.max,
        min: config.pool.min,
        acquireTimeoutMillis: config.pool.acquire,
        idleTimeoutMillis: config.pool.idle,
        reapIntervalMillis: config.pool.evict,
        maxUses: config.pool.maxUses
      })
    };

    debug(`pool created with max/min: ${config.pool.max}/${config.pool.min}, with replication`);
  }

  /**
   * Get connection from pool. It sets database version if it's not already set.
   * Call pool.acquire to get a connection
   *
   * @param {object}   [options]                 Pool options
   * @param {string}   [options.type]            Set which replica to use. Available options are `read` and `write`
   * @param {boolean}  [options.useMaster=false] Force master or write replica to get connection from
   *
   * @returns {Promise<Connection>}
   */
  async getConnection(options) {
    options = options || {};