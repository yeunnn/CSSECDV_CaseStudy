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
        // Check if user is already logged in
        if (req.session && req.session.user) {
            // Redirect based on user role
            if (req.session.position === 'Customer') {
                return res.redirect('/index');
            } else if (req.session.position === 'Staff' || req.session.position === 'Admin') {
                return res.redirect('/staff-page');
            }
        }
        
        res.render('staff-login');
    },

    getUpdateSecurity: async function(req) {
        console.log('getUpdateSecurity');
        res.render('security-questions')
    },

    postUpdateSecurity: async function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var secQ1 = req.body.secQ1;
        var secQ1Ans = req.body.secQ1Ans;
        var secQ2 = req.body.secQ2;
        var secQ2Ans = req.body.secQ2Ans;

        //console.log('HELLO WORLD');
        var response = await db.findOne(User, {username: username}, 'username password');
        var passwordArr = response.password;
        if (passwordArr > 1) {
            passwordArr.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
        }
        if(response) {
            bcrypt.compare(password, passwordArr[0].password, async function () {
                const saltRounds = 10;
                const firstAns = await bcrypt.hash(secQ1Ans, saltRounds);
                const secondAns = await bcrypt.hash(secQ2Ans, saltRounds);
            
                var resetQuestions1 = {
                    question: secQ1,
                    answer: firstAns
                };
                var resetQuestions2 = {
                    question: secQ2,
                    answer: secondAns
                };

                var update1 = await db.updateOne(User, {username: username}, {$push: {security: resetQuestions1}});
                var update2 = await db.updateOne(User, {username: username}, {$push: {security: resetQuestions2}});
                if(update1 && update2) {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Success',
                        functionType: 'postUpdateSecurity',
                        description: `${username} now has security questions.`
                    };
                    console.log(response);
                    console.log("hello");
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('staff-login', {errorMessage: 'Required to Login again.'});
                }
            });
        }
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
            var response = await db.findOne(User,user,'username password position security failedAttempts lockedUntil lastSuccessfulLogin lastLoginAttempt deletedAt');

            // Update last login attempt timestamp
            await db.updateOne(User, {username: username}, {
                $set: { lastLoginAttempt: new Date() }
            });

            var projection = 'items orderType status orderID timestamp payment';
            var result = await db.findMany(Order, {}, projection);

            // Check if account exists and is not soft deleted
            if (response != null && (response.position == 'Admin' || response.position == 'Staff' || response.position == 'Customer')){
                // Check if account is soft deleted
                if (response.deletedAt != null) {
                    // Account is soft deleted, prevent login
                    return res.render('staff-login', { errorMessage: 'Invalid username or password.'});
                }
                
                //lock check
                //console.log(response);
                if(response.lockedUntil != null && response.lockedUntil >= Date.now()) {
                    res.render('staff-login', { errorMessage: 'Account is locked, you are currently unable to attempt to login.'});
                } else {
                    if (response.lockedUntil != null && response.lockedUntil < Date.now()) {
                        //set to null - basic reset
                        var unlock = await db.updateOne(User, {username: username}, {$set: {lockedUntil: null}});
                        var unfail = await db.updateOne(User, { username: username}, {$set: {failedAttempts: 0}});

                        var logEntry = {
                            username: username,
                            timestamp: Date.now(),
                            logType: 'Success',
                            functionType: 'postStaffLogin',
                            description: 'Lock Expired | Reset locked and failedAttempts'
                        };
                        
                        var logged = await db.insertOne(Log, logEntry);
                    }
                    //sort password
                    var passwordArr = response.password;
                    passwordArr.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
                    //if (passwordArr > 1) {
                        //passwordArr.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
                    //}
                    console.log(passwordArr[0].password);

                    bcrypt.compare(password, passwordArr[0].password, async function(err, equal) {
                        if(equal) {
                            // Store user information in the session
                            if(response.failedAttempts > 0) {
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

                            // Prepare last login information for display (requirement 2.1.12)
                            var lastLoginInfo = null;
                            if (response.lastSuccessfulLogin) {
                                lastLoginInfo = {
                                    date: response.lastSuccessfulLogin.toLocaleString()
                                };
                            }

                            // Update login tracking information
                            await db.updateOne(User, {username: username}, {
                                $set: { 
                                    lastSuccessfulLogin: new Date(),
                                    failedAttempts: 0
                                }
                            });

                            req.session.user = response.username;
                            req.session.position = response.position;

                            if(response.security.length != 2) {
                                //user exists but no security questions
                                return res.render('security-questions', {username: username});
                            }

                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Success',
                                functionType: 'postStaffLogin',
                                description: 'Redirecting User to Home Page'
                            };
                            
                            var logged = await db.insertOne(Log, logEntry);

                            if(response.position == 'Customer') {
                                res.render('index', {
                                    active:'index', 
                                    position:response.position,
                                    lastLoginInfo: lastLoginInfo,
                                    showLoginNotification: lastLoginInfo !== null
                                });
                            }
                            else{
                                // Assuming `results` is an array of orders
                                result.sort((a, b) => b.orderID - a.orderID);

                                res.render('staff-page', {
                                    result, 
                                    active:'staff-page', 
                                    position:response.position,
                                    lastLoginInfo: lastLoginInfo,
                                    showLoginNotification: lastLoginInfo !== null
                                });
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