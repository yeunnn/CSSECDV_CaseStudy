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

const passwordResetController= {

    getPasswordResetStep1: function (req, res) {
        // Pass user session information for proper navigation context
        res.render('password-reset-step1', {
            user: req.session.user,
            position: req.session.position
        });
    },

    postPasswordResetStep2: async function (req, res) {
        //check if user exists
        var username = req.body.username;

        var response = await db.findOne(User, {username: username}, 'username password security');

        if (response) {
            //check if a day has passed since the last reset
            var passwordArr = response.password;
            passwordArr.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            const msInOneDay = 24 * 60 * 60 * 1000;
            var latestPasswordTS = new Date(passwordArr[0].timestamp)
            console.log('Latest Pass TS: ' + latestPasswordTS.getTime());
            console.log('Now: ' + Date.now())

            if(latestPasswordTS.getTime() + msInOneDay > Date.now()) {
                //re-render and tell user they cannot reset yet
                console.log('Not a day has passed.');
                res.render('password-reset-step1', {errorMessage: 'Cannot reset account\'s password.', user: req.session.user, position: req.session.position});
                return;
            } 
            var logEntry = {
                username: response.username,
                timestamp: Date.now(),
                logType: 'Success',
                functionType: 'postPasswordResetStep2',
                description: `${username} step 1 of password reset complete.`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('password-reset-step2', {username: username, secQ1: response.security[0].question, secQ2: response.security[1].question});
        } else {
            var logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'postPasswordResetStep2',
                description: `Username entered does not exist.`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('password-reset-step1', {
                errorMessage: 'Invalid username.',
                user: req.session.user,
                position: req.session.position
            });
        }
    },

    postPasswordResetStep3: async function (req, res) {
        //checks if answers match
        //implement locking mechanism here as well
        var username = req.body.username;
        var secQ1Ans = req.body.secQ1Ans;
        var secQ2Ans = req.body.secQ2Ans;
        console.log(username);

        if(username != null) {
            var response = await db.findOne(User, {username: username}, 'username security');
        }
        if (response) {
            console.log(response);
            var q1 = await bcrypt.compare(secQ1Ans, response.security[0].answer);
            var q2 = await bcrypt.compare(secQ2Ans, response.security[1].answer)
            if(q1 && q2) {
                //answers are correct
                console.log("Correct Security Answers.");
                var logEntry = {
                    username: response.username,
                    timestamp: Date.now(),
                    logType: 'Success',
                    functionType: 'postPasswordResetStep3',
                    description: `${response.username} step 2 of password reset complete.`
                };
            
                var logged = await db.insertOne(Log, logEntry);
                res.render('password-reset-step3', {username: response.username, user: req.session.user, position: req.session.position});
            } else {
                var logEntry = {
                    username: response.username,
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'postPasswordResetStep3',
                    description: `${response.username} step 2 of password reset failed.`
                };
            
                var logged = await db.insertOne(Log, logEntry);
                res.render('password-reset-step2', {username: response.username, errorMessage: 'Atleast one of the answers are wrong.', user: req.session.user, position: req.session.position});
            }
        }
    },

    postPasswordResetFinal: async function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var confirmPassword = req.body.confirmPassword;

        if (password != confirmPassword) {
            var logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'postPasswordResetStepFinal',
                description: `${username} step 3 of password reset failed.`
            };
        
            var logged = await db.insertOne(Log, logEntry);
            res.render('password-reset-step3', {errorMessage: 'Password and Confirm Password are not matching.'})
        }

        var response = await db.findOne(User, {username: username}, 'username password failedAttempts lockedUntil');
        if (response) {
            //do checks
            //check for password reuse
            var passwordArr = response.password;
            passwordArr.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
            for (let index = 0; index < passwordArr.length; index++) {
                const prevPassword = passwordArr[index].password;
                var match = await bcrypt.compare(password, prevPassword);
                if(match) {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failure',
                        functionType: 'postPasswordResetStepFinal',
                        description: `${username} attempted to reuse passwords.`
                    };
                
                    var logged = await db.insertOne(Log, logEntry);
                    console.log(logged);
                    res.render('password-reset-step3', {username: username, errorMessage: 'Cannot reset account\'s password.', user: req.session.user, position: req.session.position } );
                    return;
                }
            }
            const saltRounds = 10;
            var hash = await bcrypt.hash(password, saltRounds);
            var update = {
                password: hash
            }

            var newPassword = await db.updateOne(User, {username: username},{$push: {password: update}})
            if(newPassword) { 
                if(response.failedAttempts > 0 && response.lockedUntil == null) {
                    var unfail = await db.updateOne(User, {username: username}, {$set: {failedAttempts: 0}});
                }
                if(response.lockedUntil > Date.now()) {
                    //if there's a lock then remove
                    var unlocked = await db.updateOne(User, {username: username}, {$set: {lockedUntil: null}});
                }
                var logEntry = {
                    username: response.username,
                    timestamp: Date.now(),
                    logType: 'Success',
                    functionType: 'postPasswordResetStepFinal',
                    description: `${response.username} step 3 of password reset success. New password added.`
                };
            
                console.log(newPassword);

                var logged = await db.insertOne(Log, logEntry);
                res.render('staff-login');
            }
            else {
                var logEntry = {
                    username: response.username,
                    timestamp: Date.now(),
                    logType: 'Failure',
                    functionType: 'postPasswordResetStepFinal',
                    description: `${response.username} step 3 of password reset failure.`
                };
        

                var logged = await db.insertOne(Log, logEntry);
                res.render('password-reset-step3', {username: username, user: req.session.user, position: req.session.position});
                return;
            }
            
            

            
        }
    }
}

/*
    exports the object `staffloginController` (defined above)
    when another script exports from this file
*/
module.exports = passwordResetController;