// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `Order` from `../models/OrderModel.js`
const Order = require('../models/OrderModel.js');

// import Module `passwordValidation` from `../models/validationHelper.js`
const pV = require('../models/validationHelper.js');
const Log = require('../models/serverLog.js');

// import module `bcrypt`
const bcrypt = require('bcrypt');

const dashboardController= {

    getAdminDashbaord: async function (req, res) {
        //user must already be logged in
        if(req.session.user) {
            var username = req.session.user;
            var position = req.session.position;

            //validate
            var response = await db.findOne(User, {username: username}, 'username position');
            if (response) {
                //user exists
                if(username == response.username && position == response.position && response.position == 'Admin') {
                    //validated
                    //no additional information
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Success',
                        functionType: 'getAdminDashboard',
                        description: `${username} has accessed the dashboard`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('admin-dashboard');
                } else {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'getAdminDashboard',
                        description: `Non-admin attempted to access the dashboard.`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('error', {error: 'Invalid Credentials.'});
                }
            } else {
                var logEntry = {
                    username: 'Guest',
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'getAdminDashboard',
                    description: `User not found in database`
                };
            
                var logged = await db.insertOne(Log, logEntry);
                res.render('error', {error: 'Invalid Credentials.'});
            }
        } else {
            //not logged in or invalid user
            var logEntry = {
                username: 'Guest',
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'getAdminDashboard',
                description: `User's credentials are invalid`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('error', {error: 'Invalid Credentials.'});
        }
    },

    getAccounts: async function (req, res) {
        if(req.session.user) {
            var username = req.session.user;
            var position = req.session.position;

            //validate
            var response = await db.findOne(User, {username: username}, 'username position');
            if (response) {
                //user exists
                if(username == response.username && position == response.position && response.position == 'Admin') {
                    //validated
                    var accounts = await db.findMany(User, {position: {$in: ['Admin', 'Staff']}}, 'username position deletedAt');
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Success',
                        functionType: 'getAccounts',
                        description: `${username} has successfully queried the database for Staff and Admin accounts`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.json( accounts );
                } else {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'getAccounts',
                        description: `Non-admin attempted to access the dashboard.`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('error', {error: 'Invalid Credentials.'});
                }
            } else {
                var logEntry = {
                    username: 'Guest',
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'getAccounts',
                    description: `User not found in database`
                };
            
                var logged = await db.insertOne(Log, logEntry);
                res.render('error', {error: 'Invalid Credentials.'});
            }
        } else {
            //not logged in or invalid user
            var logEntry = {
                username: 'Guest',
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'getAccounts',
                description: `User's credentials are invalid`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('error', {error: 'Invalid Credentials.'});
        }
        
    },

    getLogs: async function (req, res) {
        if(req.session.user) {
            var username = req.session.user;
            var position = req.session.position;

            //validate
            var response = await db.findOne(User, {username: username}, 'username position');
            if (response) {
                //user exists
                if(username == response.username && position == response.position && response.position == 'Admin') {
                    //validated
                    var logs = await db.findMany(Log, {}, 'username logType timestamp functionType description');
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Success',
                        functionType: 'getLogs',
                        description: `${username} has queried the database for the Logs`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.json( logs );
                } else {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'getLogs',
                        description: `Non-admin attempted to access the dashboard.`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('error', {error: 'Invalid Credentials.'});
                }
            } else {
                var logEntry = {
                    username: 'Guest',
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'getLogs',
                    description: `User not found in database`
                };
            
                var logged = await db.insertOne(Log, logEntry);
                res.render('error', {error: 'Invalid Credentials.'});
            }
        } else {
            //not logged in or invalid user
            var logEntry = {
                username: 'Guest',
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'getLogs',
                description: `User's credentials are invalid`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('error', {error: 'Invalid Credentials.'});
        }
        
    },

    postChangeRoles: async function (req, res) {
        //TO-DO: Error Handlers and Logging
        if(req.session.user) {
            var username = req.session.user;
            var position = req.session.position;
            var role = req.body.roles;
            var updateUser = req.body.modalUsername;

            //validate
            var response = await db.findOne(User, {username: username}, 'username position');
            if (response) {
                //user exists
                if(username == response.username && position == response.position && response.position == 'Admin') {
                    //validated
                    //check for vlaue of roles
                    if (role == 'Staff' || role == 'Admin') {
                        var checkUser = await db.findOne(User, {username: updateUser}, 'position');
                        if(checkUser.position != role) {
                            var update = await db.updateOne(User, {username: updateUser}, {$set: {position: role}});
                            if (update) {
                                var logEntry = {
                                    username: username,
                                    timestamp: Date.now(),
                                    logType: 'Success',
                                    functionType: 'postChangeRoles',
                                    description: `${username} has had their role changed from ${response.position} to ${role}.`
                                };
                            
                                var logged = await db.insertOne(Log, logEntry);
                                res.render('admin-dashboard', {success: 'User Role has been successfully updated.'});
                            } else {
                                var logEntry = {
                                    username: username,
                                    timestamp: Date.now(),
                                    logType: 'Failure',
                                    functionType: 'postChangeRoles',
                                    description: `${username} has failed to change their role to ${role}.`
                                };
                            
                                var logged = await db.insertOne(Log, logEntry);
                                res.render('admin-dashboard', {success: 'User Role update has failed.'});
                            }
                        } else {
                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Success',
                                functionType: 'postChangeRoles',
                                description: `${username} role is already that role, cannot change.`
                            };
                        
                            var logged = await db.insertOne(Log, logEntry);
                            res.render('admin-dashboard', {success: 'User has the same role.'});
                        }
                    } else {
                        var logEntry = {
                            username: username,
                            timestamp: Date.now(),
                            logType: 'Failure',
                            functionType: 'postChangeRoles',
                            description: `Invalid value has been transferred in the request body.`
                        };
                    
                        var logged = await db.insertOne(Log, logEntry);
                        res.render('admin-dashboard', {errorMessage: 'Invalid values.'});
                    }
                } else {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'postChangeRoles',
                        description: `Non-admin attempted to access the dashboard.`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('error', {error: 'Invalid Credentials.'});
                }
            } else {
                var logEntry = {
                    username: 'Guest',
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'postChangeRoles',
                    description: `User not found in database`
                };
            
                var logged = await db.insertOne(Log, logEntry);
                res.render('error', {error: 'Invalid Credentials.'});
            }
        }  else {
            //not logged in or invalid user
            var logEntry = {
                username: 'Guest',
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'postChangeRoles',
                description: `User's credentials are invalid`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('error', {error: 'Invalid Credentials.'});
        }
    },

    postAddAccount: async function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var position = req.body.roles;
        
        // Security questions
        var secQ1 = req.body.secQ1;
        var secQ1Ans = req.body.secQ1Ans;
        var secQ2 = req.body.secQ2;
        var secQ2Ans = req.body.secQ2Ans;

        //secondary checks
        var validated = pV.validatePassword(password);

        const allTrue = validated.every(value => value === true);

        var user = {
            username: username
        };
        var response = await db.findOne(User,user,'username password position');

        var projection = 'items orderType status orderID timestamp payment';
        var result = await db.findMany(Order, {}, projection);

        if (response == null) {
            if (allTrue) {
                const saltRounds = 10;
                
                try {
                    // Hash password
                    const hash = await bcrypt.hash(password, saltRounds);
                    var passwordSchema = {
                        password: hash
                    };
                    
                    // Hash security answers
                    const secAns1Hash = await bcrypt.hash(secQ1Ans, saltRounds);
                    const secAns2Hash = await bcrypt.hash(secQ2Ans, saltRounds);
                    
                    var securityQuestions = [
                        {
                            question: secQ1,
                            answer: secAns1Hash
                        },
                        {
                            question: secQ2,
                            answer: secAns2Hash
                        }
                    ];
                    
                    //Store as new user
                    var UserSchema = {
                        username: username,
                        password: passwordSchema,
                        position: position,
                        security: securityQuestions
                    };
        
                    var response = await db.insertOne(User, UserSchema);
                    if(response){
                        var logEntry = {
                            username: username,
                            timestamp: Date.now(),
                            logType: 'Success',
                            functionType: 'postAddAccount',
                            description: `Successfully created ${username} as a new ${position}!`
                        };
                    
                        var logged = await db.insertOne(Log, logEntry);
                        res.render('admin-dashboard', {success: `${username} has been created as a ${position}!`});
                    }else{
                        var logEntry = {
                            username: username,
                            timestamp: Date.now(),
                            logType: 'Failure',
                            functionType: 'postAddAccount',
                            description: 'Creation of account ended in failure for unknown reasons.'
                        };
                    
                        var logged = await db.insertOne(Log, logEntry);
                        res.render('admin-dashboard', {errorMessage: `${username} has failed.`});
                    }
                } catch (error) {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'postAddAccount',
                        description: 'Creation of account failed due to a system error.'
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('admin-dashboard', {errorMessage: 'An error occurred while creating the account.'});
                }
            } else {
                var logEntry = {
                    username: username,
                    timestamp: Date.now(),
                    logType: 'Failed',
                    functionType: 'postAddAccount',
                    description: 'Password does not conform to policy.'
                };
                
                var logged = await db.insertOne(Log, logEntry);
                res.render('admin-dashboard', {errorMessage: 'Invalid username or password.'});
            }
        } else {
            var logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Failed',
                functionType: 'postAddAccount',
                description: 'Username already exists '
            };
            
            var logged = await db.insertOne(Log, logEntry);
            res.render('admin-dashboard', {errorMessage: 'Invalid username or password.'});
        }
    },

    postDeleteAccount: async function (req, res) {
        //TO-DO: Error Handlers and Logging
        if(req.session.user) {
            var username = req.session.user;
            var position = req.session.position;

            var updateUser = req.body.modalUsername;

            //validate
            var response = await db.findOne(User, {username: username}, 'username position deletedAt');
            if (response && response.deletedAt == null) {
                //user exists
                if(username == response.username && position == response.position && response.position == 'Admin') {
                    //validated
                    var checkUser = await db.findOne(User, {username: updateUser}, 'username deletedAt');
                    if(!checkUser.deletedAt) {
                        const currTime = Date.now();
                        var update = await db.updateOne(User, {username: updateUser}, {$set: {deletedAt: currTime}});
                        if(update) {
                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Success',
                                functionType: 'postDeleteAccount',
                                description: `${updateUser} has been deleted.`
                            };
                        
                            var logged = await db.insertOne(Log, logEntry);
                            res.render('admin-dashboard', {success: 'User has been successfully deleted.'});
                        } else {
                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Failure',
                                functionType: 'postDeleteAccount',
                                description: `${updateUser} has not been delete for unknown reasons.`
                            };
                        
                            var logged = await db.insertOne(Log, logEntry);
                            res.render('admin-dashboard', {errorMessage: 'User has not been deleted.'});
                        }
                    } else {
                        var logEntry = {
                            username: username,
                            timestamp: Date.now(),
                            logType: 'Failure',
                            functionType: 'postDeleteAccount',
                            description: `Attempted to delete a deleted user.`
                        };
                    
                        var logged = await db.insertOne(Log, logEntry);
                        res.render('admin-dashboard', {errorMessage: 'User has already been deleted.'});
                    }
                } else {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'postDeleteAccount',
                        description: `Non-admin attempted to access the dashboard.`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('error', {error: 'Invalid Credentials.'});
                }
            } else {
                var logEntry = {
                    username: username,
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'postDeleteAccount',
                    description: 'Username could not be found'
                };
                
                var logged = await db.insertOne(Log, logEntry);
                res.render('admin-dashboard', {errorMessage: 'User does not exist or has already been deleted.'});
            }
        } else {
            //not logged in or invalid user
            var logEntry = {
                username: 'Guest',
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'postDeleteAccount',
                description: `User's credentials are invalid`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('error', {error: 'Invalid Credentials.'});
        }
    }
}

/*
    exports the object `staffloginController` (defined above)
    when another script exports from this file
*/
module.exports = dashboardController;