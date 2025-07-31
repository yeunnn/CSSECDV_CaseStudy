// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `Order` from `../models/OrderModel.js`
const Order = require('../models/OrderModel.js');

// import Module `passwordValidation` from `../models/validationHelper.js`
const pV = require('../models/validationHelper.js');

// import module `bcrypt`
const bcrypt = require('bcrypt');

const registrationController= {

    getCustomerRegistration: function (req, res) {
        res.render('customer-registration');
    },

    postPasswordValidation: function(req, res) {
        const { password } = req.body;

        var validated = pV.validatePassword(password);

        console.log(validated);

        res.json( { validated } );

    },

    postCustomerRegistration: async function (req, res) {

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

            if (response == null && allTrue) {
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
                        console.log("added 1 doc");
                        console.log(response);
                    }else{
                        console.log("failed");
                    }
                });

                //store data into session
                req.session.user = username;
                req.session.position = position;

                res.render('index', {active:'index', position: position});
            } else {
                res.render('customer-registration', {errorMessage: 'Invalid username or password.'})
            }

            // if (response != null && (response.position == 'Admin' || response.position == 'Staff' || response.position == 'Customer')){
                
            //     bcrypt.compare(password, response.password, function(err, equal) {
            //         if(equal) {
            //             // Store user information in the session
            //             req.session.user = response.username;
            //             req.session.position = response.position;

            //             if(response.position == 'Customer') {
            //                 res.render('index', {active:'index', position:response.position});
            //             }
            //             else{
            //                 // Assuming `results` is an array of orders
            //                 result.sort((a, b) => b.orderID - a.orderID);

            //                 res.render('staff-page', {result, active:'staff-page', position:response.position});
            //             }
            //         }
            //         else {
            //             // Set error message and render the login view again
            //             res.render('staff-login', { errorMessage: 'Wrong password.' });
            //         }
            //     });
            // }else{
            //     // Set error message and render the login view again
            //     res.render('staff-login', { errorMessage: 'This user was not found.' });
            // }
    }
}

/*
    exports the object `staffloginController` (defined above)
    when another script exports from this file
*/
module.exports = registrationController;