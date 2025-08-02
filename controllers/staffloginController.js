// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `User` from `../models/UserModel.js`
const Order = require('../models/OrderModel.js');

const Log = require('../models/serverLog.js');
// import module `bcrypt`
const bcrypt = require('bcrypt');

const staffloginController= {

    getStaffLogin: function (req, res) {
        res.render('staff-login');
    },

    postStaffLogin: async function (req, res) {

            /*
                when submitting forms using HTTP POST method
                the values in the input fields are stored in `req.body` object
                each <input> element is identified using its `name` attribute
                Example: the value entered in <input type="text" name="fName">
                can be retrieved using `req.body.fName`
            */
            var username = req.body.username;
            var password = req.body.password;
            
            var user = {
                username: username
            };
            var response = await db.findOne(User,user,'username password position resetQuestions failedAttempts lockedUntil');

            //check if locked
            var projection = 'items orderType status orderID timestamp payment';
            var result = await db.findMany(Order, {}, projection);

            if (response != null && (response.position == 'Admin' || response.position == 'Staff' || response.position == 'Customer')){
                //lock check
                console.log(response);
                if(response.lockedUntil != null && response.lockedUntil >= Date.now()) {
                    res.render('staff-login', { errorMessage: 'Account is locked, you are currently unable to attempt to login.'});
                } else {
                    // console.log(response);
                    //check for locks and failedAttempts reset
                    if (response.lockedUntil != null && response.lockedUntil < Date.now()) {
                        //set to null - basic reset
                        var unlock = await db.updateOne(User, {username: username}, {$set: {lockedUntil: null}});
                        var unfail = await db.updateOne(User, { username: username}, {$set: {failedAttempts: 0}});

                        var logEntry = {
                            username: username,
                            timestamp: Date.now(),
                            logType: 'Success',
                            functionType: 'postStaffLogin',
                            description: 'Successful Login | Reset locked and failedAttempts'
                        };
                        
                        var logged = await db.insertOne(Log, logEntry);
                    }
                    bcrypt.compare(password, response.password[0].password, async function(err, equal) {
                        if(equal) {
                            // Store user information in the session
                            if(response.failedAttempts > 0 && response.lockedUntil == null) {
                                var failed = await db.updateOne(User, {username: username}, {$set: {failedAttempts: 0}});
                            }
                            req.session.user = response.username;
                            req.session.position = response.position;

                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Success',
                                functionType: 'postStaffLogin',
                                description: 'Redirecting User to Home Page'
                            };
                            
                            var logged = await db.insertOne(Log, logEntry);

                            if(response.position == 'Customer') {
                                res.render('index', {active:'index', position:response.position});
                            }
                            else{
                                // Assuming `results` is an array of orders
                                result.sort((a, b) => b.orderID - a.orderID);

                                res.render('staff-page', {result, active:'staff-page', position:response.position});
                            }
                        }
                        else {
                            // Set error message and render the login view again
                            if (response.failedAttempts >= 4 && response.lockedUntil == null) {
                                //lock the account
                                var lock = await db.updateOne(User, {username: username}, {$set: {lockedUntil: Date.now() + 30 * 60 * 1000}});
                                var logEntry = {
                                    username: username,
                                    timestamp: Date.now(),
                                    logType: 'Failure',
                                    functionType: 'postStaffLogin',
                                    description: `${username} account has been locked until ${Date.now()}`
                                };
                                
                                var logged = await db.insertOne(Log, logEntry);
                            } else {
                                var failed = await db.updateOne(User, {username: username}, {$inc: {failedAttempts: 1}});
                                var logEntry = {
                                    username: username,
                                    timestamp: Date.now(),
                                    logType: 'Failure',
                                    functionType: 'postStaffLogin',
                                    description: 'Failed Login Attempt | Updated failedAttempts incremented.'
                                };
                                
                                var logged = await db.insertOne(Log, logEntry);
                            }
                            res.render('staff-login', { errorMessage: 'Invalid username or password.' });
                        }
                    });
                }
            }else{
                // Set error message and render the login view again
                res.render('staff-login', { errorMessage: 'Invalid username or password.' });
            }
    }
}

/*
    exports the object `staffloginController` (defined above)
    when another script exports from this file
*/
module.exports = staffloginController;