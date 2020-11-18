const { pathToFileURL } = require("url");

var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mysql       = require('./dbcon.js'),
//    port        = process.env.port || 9229;  // port for OSU flip
    port        = process.env.port || 3003;   // port for local

var hbs = require("express-handlebars").create({
    defaultLayout: "main",
    helpers: {
        comp: function(condition) {
                if (condition == 1) {
                    return "Loved to Pieces (Rips, Water-Damage, Weak Bindings Present)";
                } else if (condition == 2) {
                    return "Highlight Frenzy (Marks Present)";
                } else if (condition == 3) {
                    return "Dog-Eared (Slightly Worn)";
                } else if (condition == 4) {
                    return "Delicately Read (Like New)";
                } else {
                    return "Fresh off the press! (New)";
                }
        },
        ckPts: function(avb, cost) {
            if (avb <= cost) {
                return true;
            } else {
                return false;
            }
        },
    },
});

    app.use(express.static('public'));
    app.engine("handlebars", hbs.engine);
    app.set("view engine", "handlebars");
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());


    // SQL Queries for calling in various app.post routes

    const newUser = 'INSERT INTO users (`username`, `email`, `password`, `firstName`, `lastName`, `street`, `city`, `state`, `zipCode`, `availablePoints`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const loginID = 'SELECT id FROM users WHERE username = ? AND password = ?';
    const newBook = 'INSERT IGNORE INTO books (`title`, `author`, `isbn`, `condition`) VALUES (?, ?, ?, ?)';
    const addBookToUser = 'INSERT INTO user_books (`userID`, `bookID`, `points`) VALUES (?, (SELECT id FROM books WHERE `title`=? AND `author`=? AND `condition`=?), ?)';
    const addBookBack = 'INSERT INTO user_books (`userID`, `bookID`, `points`) VALUES (?, ?, ?)';
    const getUserBooks = 'SELECT tbl2.userID, s.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition FROM users s INNER JOIN (SELECT u.userID, u.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition FROM user_books u INNER JOIN (SELECT * FROM books b) as tbl1 ON u.bookID = tbl1.id WHERE u.userID = ?) as tbl2 ON s.id = tbl2.userID';
    const getShippingAddress = 'SELECT u.firstName, u.lastName, u.street, u.city, u.state, u.zipCode FROM users u WHERE u.id = ?';
    const getPendingSwaps = 'SELECT tbl2.id, tbl2.senderID, tbl2.receiverID, tbl2.reqName, tbl2.bookID, b.title, b.author, b.condition, tbl2.pointsTraded, tbl2.swapDate FROM books b INNER JOIN (SELECT tbl1.id, tbl1.senderID, tbl1.receiverID, u.userName AS reqName, tbl1.bookID, tbl1.pointsTraded, tbl1.swapDate FROM users u INNER JOIN (SELECT * FROM pending_swaps WHERE senderID=?) as tbl1 ON u.id = tbl1.receiverID) as tbl2 ON b.id=tbl2.bookID';
    const getPendReceipt = 'SELECT tbl2.id, tbl2.senderID, u1.username AS senderName, tbl2.receiverID, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.pointsTraded, tbl2.swapDate, tbl2.received from users u1 INNER JOIN (SELECT c.id, c.senderID, c.receiverID, c.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, c.pointsTraded, c.swapDate, c.received FROM completed_swaps c INNER JOIN (SELECT * FROM books) as tbl1 ON c.bookID = tbl1.id WHERE c.receiverID = ? AND c.received = 0) as tbl2 ON u1.id = tbl2.senderID';
    const addPending = 'INSERT INTO pending_swaps (`senderID`, `receiverID`, `bookID`, `pointsTraded`, `swapDate`) VALUES (?, ?, ?, ?, ?)';
    const addAccepted = 'INSERT INTO `completed_swaps`(`senderID`, `receiverID`, `bookID`, `pointsTraded`, `swapDate`) VALUES (?,?,?,?,?)';
    const updtRec = 'UPDATE `completed_swaps` SET `received`= 1 WHERE `id`= ?';
    const delCompSwap = 'DELETE FROM `completed_swaps` WHERE `id` = ?';
    const delPendSwap = 'DELETE FROM `pending_swaps` WHERE id=?';
    const delUserBook = 'DELETE FROM `user_books` WHERE `userID`=? AND `bookID`=? AND `points`=? LIMIT 1';
    const addAvbPts = 'UPDATE `users` SET `availablePoints`=`availablePoints` + ? WHERE `id`=?';
    const addPndPts = 'UPDATE `users` SET `pendingPoints`=`pendingPoints` + ? WHERE `id`= ?';
    const subAvbPts = 'UPDATE `users` SET `availablePoints`=`availablePoints` - ? WHERE `id`=?';
    const subPndPts = 'UPDATE `users` SET `pendingPoints`=`pendingPoints` - ? WHERE `id`= ?';
    const pendingID = 'SELECT tbl2.id, tbl2.senderID, tbl2.receiverID, u.username AS reqName, tbl2.bookID, tbl2.title, tbl2.author, tbl2.condition, tbl2.pointsTraded FROM users u INNER JOIN (SELECT tbl1.id, tbl1.senderID, tbl1.receiverID, tbl1.bookID, b.title, b.author, b.condition, tbl1.pointsTraded FROM books b INNER JOIN (SELECT * FROM pending_swaps WHERE id=?) as tbl1 ON b.id = tbl1.bookID) as tbl2 ON u.id = tbl2.receiverID';
    const compID = 'SELECT tbl2.id, tbl2.senderID, u.username AS senderName, tbl2.receiverID, tbl2.bookID, tbl2.title, tbl2.author, tbl2.condition, tbl2.pointsTraded FROM users u INNER JOIN (SELECT tbl1.id, tbl1.senderID, tbl1.receiverID, tbl1.bookID, b.title, b.author, b.condition, tbl1.pointsTraded FROM books b INNER JOIN (SELECT * FROM completed_swaps WHERE id=?) as tbl1 ON b.id = tbl1.bookID) as tbl2 ON u.id = tbl2.senderID';
    const selectAll = 'SELECT tbl2.userID, u.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.points FROM users u INNER JOIN (SELECT ub1.userID, ub1.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, ub1.points FROM user_books ub1 INNER JOIN (SELECT * FROM `books`) as tbl1 ON ub1.bookID=tbl1.id) as tbl2 ON u.id=tbl2.userID';
    const searchTitle = 'SELECT tbl2.userID, u.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.points FROM users u INNER JOIN (SELECT ub1.userID, ub1.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, ub1.points FROM user_books ub1 INNER JOIN (SELECT * FROM `books` WHERE title=?) as tbl1 ON ub1.bookID=tbl1.id) as tbl2 ON u.id=tbl2.userID';
    const searchAuthor = 'SELECT tbl2.userID, u.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.points FROM users u INNER JOIN (SELECT ub1.userID, ub1.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, ub1.points FROM user_books ub1 INNER JOIN (SELECT * FROM `books` WHERE author=?) as tbl1 ON ub1.bookID=tbl1.id) as tbl2 ON u.id=tbl2.userID';
    const searchPoints = 'SELECT tbl2.userID, u.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.points FROM users u INNER JOIN (SELECT ub1.userID, ub1.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, ub1.points FROM user_books ub1 INNER JOIN (SELECT * FROM `books`) as tbl1 ON ub1.bookID=tbl1.id WHERE ub1.points=?) as tbl2 ON u.id=tbl2.userID';
    const searchAll = 'SELECT tbl2.userID, u.username, tbl2.bookID, tbl2.title, tbl2.author, tbl2.isbn, tbl2.condition, tbl2.points FROM users u INNER JOIN (SELECT ub1.userID, ub1.bookID, tbl1.title, tbl1.author, tbl1.isbn, tbl1.condition, ub1.points FROM user_books ub1 INNER JOIN (SELECT * FROM `books` WHERE title=? OR author=?) as tbl1 ON ub1.bookID=tbl1.id) as tbl2 ON u.id=tbl2.userID';
    const nevRec = 'UPDATE `users` SET `notReceived`=`notReceived` + 1 WHERE `id`= ?';
    const nevSent = 'UPDATE `users` SET `notSent`=`notSent` + 1 WHERE `id`= ?';

    // ROOT ROUTE
    app.get("/", function(req, res, next){
        res.render('home');
    });  

    // REGISTRATION ROUTE
    app.get("/signup", function(req, res, next){
        res.render('signup');
    });  

    // LOGIN ROUTE FOR DB
    app.post("/login", function(req, res, next) {
        let contents = {};
        // retrieve user info for login
        mysql.pool.query(loginID, [req.body.username, req.body.password], (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.userInfo = result;
                    res.send(contents);    
            }
        });
    });

    // SIGN UP ROUTE FOR DB
    app.post("/createUser", function(req, res, next) {
        let contents = {};
        // retrieve user info for login
        mysql.pool.query(newUser, [req.body.username, req.body.email, req.body.password, req.body.firstName, req.body.lastName, req.body.street, req.body.city, req.body.state, req.body.zipCode, 15], (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                mysql.pool.query(loginID, [req.body.username, req.body.password], (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                    } else {
                            contents.userInfo = result;
                            res.send(contents);    
                    }
                });
            }
        });
    });

    // USER'S ACCOUNT ROUTE
    app.get("/:userID/account", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;

        mysql.pool.query('SELECT * FROM users WHERE id=?', req.params.userID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.userInfo = result;
                    console.log(result);
                    res.render('account', contents);
            }
        });    
    });

    // USER'S PERSONAL BOOKSHELF ROUTE
    app.get("/:userID/shelf", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;

        mysql.pool.query(getUserBooks, req.params.userID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.bookList = result;
                    contents.username = result[0].username;
                    res.render('shelf', contents);
            }
        });    
    });
    
    // PUBLIC VIEW OF A USER'S SHELF
    app.get("/:userID/viewshelf/:viewID", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        contents.viewID = req.params.viewID;
    
        mysql.pool.query(getUserBooks, req.params.viewID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.bookList = result;
                    contents.username = result[0].username;
                    res.render('viewshelf', contents);
            }
        });    
    });    

    // ADD BOOK ROUTE FOR DB
    app.post("/addbook", function(req, res, next) {
        let contents = {};
        contents.userID = req.body.user;        // add book to books table then add book and user to user_books table in DB
        mysql.pool.query(newBook, [req.body.title, req.body.author, req.body.isbn, req.body.condition], (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                mysql.pool.query(addBookToUser, [req.body.user, req.body.title, req.body.author, req.body.condition, req.body.condition], (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                    } else {
                        res.send(contents);    
                    }
                });
            }
        });
    });

    // REMOVE BOOK ROUTE FOR DB
    app.post("/removebook", function(req, res, next) {
        let contents = {};
        contents.userID = req.body.user;
        // remove book from user_books table in DB
        mysql.pool.query(delUserBook, [req.body.user, req.body.book, req.body.pointAmt], (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                res.send(contents);    
            }
        });
    });

    // USER'S SEARCH ROUTE
    app.get("/:userID/browse", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;

        // retrieve user info for processing requests
        mysql.pool.query('SELECT `id`, `availablePoints` FROM users WHERE id=?', req.params.userID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.userInfo = result;
                    mysql.pool.query(selectAll, (err, result) => {
                        if (err) {
                            console.log('error: ', err);
                        } else {
                                contents.bookList = result;
                                console.log(result);
                                res.render('browse', contents);    
                        }
                    });    
                }
            });
    });

    // POST ROUTE FOR DB SEARCH TO RETURN SEARCH RESULTS
    app.post("/search", function(req, res, next) {

        // retrieve books based on search criteria
        // for a return of all books
        if (req.body.type == "all") {
            mysql.pool.query(searchAll, [req.body.criteria, req.body.criteria], (err, result) => {
                if (err) {
                    console.log('error: ', err);
                } else {
                    contents.searchResults = result;
                    console.log(result);
                    res.send(contents);    
                }
            });        
        // for a search in title
         } else if (req.body.type == "title") {
            mysql.pool.query(searchTitle, req.body.criteria, (err, result) => {
                if (err) {
                    console.log('error: ', err);
                } else {
                    contents.searchResults = result;
                    console.log(result);
                    res.send(contents);    
                }
            });        
        // for a search in author
        } else if (req.body.type == "author") {
            mysql.pool.query(searchAuthor, req.body.criteria, (err, result) => {
                if (err) {
                    console.log('error: ', err);
                } else {
                    contents.searchResults = result;
                    console.log(result);
                    res.send(contents);    
                }
            });        
        // for a search in points
        } else {
            mysql.pool.query(searchPoints, req.body.criteria, (err, result) => {
                if (err) {
                    console.log('error: ', err);
                } else {
                        contents.searchResults = result;
                        console.log(result);

                        res.send(contents);    
                }
            });        
        }
    });

    // REQUEST ROUTE FOR DB
    app.post("/request", function(req, res, next) {
        let contents = {};

        // retrieve user info for processing requests
        mysql.pool.query(subAvbPts, [req.body.pointAmt, req.body.recipient], (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                mysql.pool.query(addPending, [req.body.sender, req.body.recipient, req.body.book, req.body.pointAmt, req.body.swapDate], (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                    } else {
                            contents.request = result;
                            console.log(result);
                            res.render('browse', contents);    
                    }
                });    
            }
        });
    });

/*     // ROUTE FOR USER'S COMPLETED SWAPS
    app.get("/:userID/history", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;

        mysql.pool.query(getPendReceipt, req.params.userID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.receipt = result;
                    console.log(result);
                    res.render('swaphistory', contents);
            }
        });    
    });

    // USER'S PENDING SWAP REQUEST PAGE
    app.get("/:userID/swaps", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        // retrieve swaps from db
        mysql.pool.query(getPendingSwaps, req.params.userID, (err, result) => {
                if (err) {
                    console.log('error: ', err);
                } else {
                        contents.swaps = result;
                        res.render('pendingswaps', contents);    
                }
            }
        );
    }); */

    // ROUTE FOR TABBED PAGE WITH PENDING ACCEPT/REJECT AND RECEIVED
    app.get("/:userID/manage", function(req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        // retrieve swaps from db
        mysql.pool.query(getPendingSwaps, req.params.userID, (err, result) => {
                if (err) {
                    console.log('error: ', err);
                } else {
                    contents.swaps = result;
                    mysql.pool.query(getPendReceipt, req.params.userID, (err, result) => {
                        if (err) {
                            console.log('error: ', err);
                        } else {
                                contents.receipt = result;
                                console.log(result);
                                res.render('manage', contents);
                        }
                    });    
                }
            }
        );
    });

    // ACCEPT ROUTE
    app.get("/:userID/accept/:swapID", function (req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        contents.swapID = req.params.swapID;

        // retrieve selected swap from db
        mysql.pool.query(pendingID, req.params.swapID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.swaps = result;
                    res.render('accept', contents);    

                }
            }
        );
    });

    // POST ACCEPTED SWAP TO DB
    app.post("/postAccept", function(req, res, next) {
        let contents = {};
        contents.userID = req.body.senderID;

        // retrieve selected swap from db
        mysql.pool.query(addAccepted, [req.body.senderID, req.body.receiverID, req.body.bookID, req.body.pointsTraded, req.body.swapDate], (err, result) => {
            if (err) {
                console.log('error: ', err);
                res.send(err);
            } else {
                mysql.pool.query('DELETE FROM `pending_swaps` WHERE id = ?', req.body.swapID, (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                        res.send(err);
                    } else {        
                        mysql.pool.query(delUserBook, [req.body.senderID, req.body.bookID, req.body.pointsTraded], (err, result) => {
                            if (err) {
                                console.log('error: ', err);
                                res.send(err);
                            } else {        
                                mysql.pool.query(addPndPts, [req.body.pointsTraded, req.body.senderID], (err, result) => {
                                    if (err) {
                                        console.log('error: ', err);
                                        res.send(err);
                                    } else {        
                                        mysql.pool.query(getShippingAddress, req.body.receiverID, (err, result) => {
                                            if (err) {
                                                console.log('error: ', err);
                                                res.send(err);
                                            } else {        
                                                contents.shipping = result;
                                                res.send(contents);    
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    // REJECT ROUTE
    app.get("/:userID/reject/:swapID", function (req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        contents.swapID = req.params.swapID;

        // retrieve selected swap from db
        mysql.pool.query(pendingID, req.params.swapID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                    contents.swaps = result;
                    res.render('reject', contents);    

                }
            }
        );
    });

    // POST REJECTED SWAP TO DB
    app.post("/postReject", function(req, res, next) {
        let contents = {};
        contents.userID = req.body.senderID;

        // retrieve selected swap from db
        mysql.pool.query(delPendSwap, req.body.swapID, (err, result) => {
            if (err) {
                console.log('error: ', err);
                res.send(err);
            } else {
                mysql.pool.query(addAvbPts, [req.body.pointsTraded, req.body.receiverID], (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                        res.send(err);
                    } else {        
                        res.send(contents);    
                    }
                });
            }
        });
    });

    // RECEIVE BOOK ROUTE
    app.get("/:userID/received/:swapID", function (req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        contents.swapID = req.params.swapID;

        // retrieve selected swap from db
        mysql.pool.query(compID, req.params.swapID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                contents.swaps = result;
                res.render('received', contents);    
            }
        });
    });

    // POST RECEIVED SWAP TO DB
    app.post("/postReceipt", function(req, res, next) {
        let contents = {};
        contents.userID = req.body.recipient;

        // retrieve selected swap from db
        mysql.pool.query(subPndPts, [req.body.pointsTraded, req.body.sender], (err, result) => {
            if (err) {
                console.log('error: ', err);
                res.send(err);
            } else {
                mysql.pool.query(addAvbPts, [req.body.pointsTraded, req.body.sender], (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                        res.send(err);
                    } else {        
                        mysql.pool.query(updtRec, req.body.swapID, (err, result) => {
                            if (err) {
                                console.log('error: ', err);
                                res.send(err);
                            } else {        
                                contents.receipt = result;
                                res.send(contents);    
                            }
                        });
                    }
                });
            }
        });
    });

    // MARK AS NEVER RECEIVED ROUTE
    app.get("/:userID/notreceived/:swapID", function (req, res, next) {
        let contents = {};
        contents.userID = req.params.userID;
        contents.swapID = req.params.swapID;

        // retrieve selected swap from db
        mysql.pool.query(compID, req.params.swapID, (err, result) => {
            if (err) {
                console.log('error: ', err);
            } else {
                contents.swaps = result;
                res.render('not_received', contents);    
            }
        });
    });

    // POST NEVER RECEIVED SWAP TO DB
    app.post("/postNever", function(req, res, next) {
        let contents = {};
        contents.userID = req.body.recipient;

        // retrieve selected swap from db
        mysql.pool.query(subPndPts, [req.body.pointsTraded, req.body.sender], (err, result) => {
            if (err) {
                console.log('error: ', err);
                res.send(err);
            } else {
                mysql.pool.query(addAvbPts, [req.body.pointsTraded, req.body.recipient], (err, result) => {
                    if (err) {
                        console.log('error: ', err);
                        res.send(err);
                    } else {        
                        mysql.pool.query(addBookBack, [req.body.sender, req.body.book, req.body.pointsTraded], (err, result) => {
                            if (err) {
                                console.log('error: ', err);
                                res.send(err);
                            } else {        
                                mysql.pool.query(nevRec, req.body.recipient, (err, result) => {
                                    if (err) {
                                        console.log('error: ', err);
                                        res.send(err);
                                    } else {        
                                        mysql.pool.query(nevSent, req.body.sender, (err, result) => {
                                            if (err) {
                                                console.log('error: ', err);
                                                res.send(err);
                                            } else {        
                                                mysql.pool.query(delCompSwap, req.body.swapID, (err, result) => {
                                                    if (err) {
                                                        console.log('error: ', err);
                                                        res.send(err);
                                                    } else {        
                                                        contents.receipt = result;
                                                        res.send(contents);    
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    // 404 ROUTE
    app.use(function(req, res){
        res.status(404);
        res.render('404');
    });

    // 500 ROUTE
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.status(500);
        res.render('500');
    });

    app.listen(port, function(){
        console.log(`Express started on http://${process.env.HOSTNAME}:9229; press Ctrl-C to terminate.`);
    });
