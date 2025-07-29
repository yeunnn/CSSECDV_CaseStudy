// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const Order = require('../models/OrderModel.js');

/*
    defines an object which contains functions executed as callback
    when a client requests for `order-status` paths in the server
*/
const orderstatusController = {

    getOrderStatus: async function (req, res) {
        if (req.session.position === 'Customer') {
            var projection = 'items orderType status orderID timestamp';

            var result = await db.findMany(Order, {}, projection);
            // Assuming `results` is an array of orders
            result.sort((a, b) => b.orderID - a.orderID);

            res.render('order-status', {result, active:'order-status'});
        }
        else{
            res.redirect('/');
        }
    }
}

/*
    exports the object `orderstatusController` (defined above)
    when another script exports from this file
*/
module.exports = orderstatusController;