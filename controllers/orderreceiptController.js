// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

/*
    defines an object which contains functions executed as callback
    when a client requests for `order-receipts` paths in the server
*/
const orderreceiptController = {

    getOrderReceipt: async function (req, res) {
        if (req.session.position === 'Customer') {
            var details = {
                active:'order-receipt'
            };
            res.render('order-receipt',details);
        }
        else{
            res.redirect('/');
        }
    }
}

/*
    exports the object `orderreceiptController` (defined above)
    when another script exports from this file
*/
module.exports = orderreceiptController;