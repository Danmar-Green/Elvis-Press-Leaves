const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

//setup the db
const db = require("./models");

//do this the first time

db.sequelize.sync({force: true}).then(() => {
	console.log('Drop and Resync Db');
	initial(); //run the initial setup
});


function initial() {
	const Condition = db.condition;
	Condition.create({type: 'Good', value: 4});
	Condition.create({type: 'Poor', value: 3});

	const BookStatus = db.bookstatus;
	BookStatus.create({id: 1, type: 'Not Available'});
	BookStatus.create({id: 2, type: 'Available'});

	const ApprovalStatus = db.approvalstatus;
	ApprovalStatus.create({id: 1, type: 'Un-Approved'});
	ApprovalStatus.create({id: 2, type: 'Approved'});
	ApprovalStatus.create({id: 3, type: 'Declined'});
}


//db.sequelize.sync();

var corsOptions = {
	origin: "http://localhost:3345"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
	res.sendFile('./public/index.html', { root: __dirname });
});

app.use(express.static('public'))

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/list.routes')(app);
require('./routes/book.routes')(app);
require('./routes/profile.routes')(app);
require('./routes/request.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 3345;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
