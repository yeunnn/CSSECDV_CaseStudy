// import module `express`
const express = require('express');

// import module `hbs`
const hbs = require('hbs');

// import module `express-session`
const session = require('express-session');

// import module `mongoose`
const mongoose = require('mongoose');

// import module `connect-mongo`
const MongoStore = require('connect-mongo')(session);;

// import module `routes` from `./routes/routes.js`
const routes = require('./routes/routes.js');

// import module `database` from `./model/db.js`
const db = require('./models/db.js');

// import authentication middleware
const authMiddleware = require('./middleware/auth.js');

const app = express();
const port = 3000;

// set `hbs` as view engine
app.set('view engine', 'hbs');

// sets `/views/partials` as folder containing partial hbs files
hbs.registerPartials(__dirname + '/views/partials');

/* Function Helpers */
hbs.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
});

hbs.registerHelper('ifCondN', function(v1, v2, options) {
    if(v1 !== v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

hbs.registerHelper('add1', function(v) {
    return Number(v)+1;
});

// connects to the database
db.connect();

// use `express-session`` middleware and set its options
// use `MongoStore` as server-side session storage
app.use(session({
  'secret': process.env.SESSION_SECRET || 'restaurant-session-secure-key-2024',
  'resave': false,
  'saveUninitialized': false,
  'cookie': {
    'secure': false, // Set to true in production with HTTPS
    'httpOnly': true,
    'maxAge': 24 * 60 * 60 * 1000 // 24 hours
  },
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

// parses incoming requests with urlencoded payloads
app.use(express.urlencoded({extended: true}));

// set the folder `public` as folder containing static assets
// such as css, js, and image files
app.use(express.static('public'));

// Apply authentication middleware to all routes
app.use(authMiddleware.requireAuth);

// define the paths contained in `./routes/routes.js`
app.use('/', routes);

// if the route is not defined in the server, render `../views/error.hbs`
// always define this as the last middleware
app.use(function (req, res) {
    res.render('error');
});

// binds the server to a specific port
app.listen(port, function () {
    console.log('app listening at port ' + port);
});