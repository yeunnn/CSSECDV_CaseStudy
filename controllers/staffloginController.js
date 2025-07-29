// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `User` from `../models/UserModel.js`
const Order = require('../models/OrderModel.js');

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
            var response = await db.findOne(User,user,'username password position');

            var projection = 'items orderType status orderID timestamp payment';
            var result = await db.findMany(Order, {}, projection);

            if (response != null && (response.position == 'Admin' || response.position == 'Staff' || response.position == 'Customer')){
                
                bcrypt.compare(password, response.password, function(err, equal) {
                    if(equal) {
                        // Store user information in the session
                        req.session.user = response.username;
                        req.session.position = response.position;

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
                        res.render('staff-login', { errorMessage: 'Wrong password.' });
                    }
                });
            }else{
                // Set error message and render the login view again
                res.render('staff-login', { errorMessage: 'This user was not found.' });
            }
    }
}

/*
    exports the object `staffloginController` (defined above)
    when another script exports from this file
*/
module.exports = staffloginController;