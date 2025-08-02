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

    getPasswordReset: function (req, res) {
        res.render('password-reset');
    },

    postPasswordReset: async function (req, res) {

            /*
                when submitting forms using HTTP POST method
                the values in the input fields are stored in `req.body` object
                each <input> element is identified using its `name` attribute
                Example: the value entered in <input type="text" name="fName">
                can be retrieved using `req.body.fName`
            */
            var username = req.body.username;
            var password = req.body.password;

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
                    const position = 'Customer';
                    bcrypt.hash(password, saltRounds, async function(err, hash) {
                        // Store hash in your password DB.
                        var passwordSchema = {
                            password: hash
                        }
                        var UserSchema = {
                            username: username,
                            password: passwordSchema,
                            position: position
                        }
            
                        var response = await db.insertOne(User, UserSchema);
                        if(response){
                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Success',
                                functionType: 'postCustomerRegistration',
                                description: `Successfully registered ${username} as a new user!`
                            };
                        
                            var logged = await db.insertOne(Log, logEntry);
                            console.log("added 1 doc");
                            console.log(response);
                        }else{
                            var logEntry = {
                                username: username,
                                timestamp: Date.now(),
                                logType: 'Failure',
                                functionType: 'postCustomerRegistration',
                                description: 'Registration ended in failure for unknown reasons.'
                            };
                        
                            var logged = await db.insertOne(Log, logEntry);
                            console.log("failed");
                        }
                    });

                    //store data into session
                    req.session.user = username;
                    req.session.position = position;

                    res.render('index', {active:'index', position: position});
                } else {
                    var logEntry = {
                        username: username,
                        timestamp: Date.now(),
                        logType: 'Failed',
                        functionType: 'postCustomerRegistration',
                        description: 'Password does not conform to policy.'
                    };
                    
                    var logged = await db.insertOne(Log, logEntry);
                    res.render('customer-registration', {errorMessage: 'Invalid username or password.'})
                }
            } else {
                var logEntry = {
                    username: username,
                    timestamp: Date.now(),
                    logType: 'Failed',
                    functionType: 'postCustomerRegistration',
                    description: 'Username already exists '
                };
                
                var logged = await db.insertOne(Log, logEntry);
                res.render('customer-registration', {errorMessage: 'Invalid username or password.'})
            }
    }
}

/*
    exports the object `staffloginController` (defined above)
    when another script exports from this file
*/
module.exports = registrationController;