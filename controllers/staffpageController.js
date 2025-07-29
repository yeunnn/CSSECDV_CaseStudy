// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `User` from `../models/UserModel.js`
const Order = require('../models/OrderModel.js');

/*
    defines an object which contains functions executed as callback
    when a client requests for `staff-page` paths in the server
*/
const staffpageController = {

    getStaffPage: async function (req, res) {
        if (req.session.position === 'Admin' || req.session.position === 'Staff') {
            var projection = 'items orderType status orderID timestamp payment';

            var result = await db.findMany(Order, {}, projection);

            // Assuming `results` is an array of orders
            result.sort((a, b) => b.orderID - a.orderID);

            res.render('staff-page', {result, active:'staff-page'});
        }
        else{
            res.redirect('/');
        }
    },

    updateOrderStatus: async function (req, res) {
        const orderId = req.params.orderId;
        const newStatus = req.body.status;

        // Update the order status in the database
        await db.updateOne(Order, { orderID: orderId }, { status: newStatus });

        // Send a JSON response
        res.json({ message: 'Order status updated successfully' });
    },

    deleteOrder: async function (req, res) {
        const orderId = req.params.orderId;

        // Delete the order from the database
        await db.deleteOne(Order, { orderID: orderId });

        // Send a JSON response
        res.json({ message: 'Order deleted successfully' });
    }
}

/*
    exports the object `staffpageController` (defined above)
    when another script exports from this file
*/
module.exports = staffpageController;