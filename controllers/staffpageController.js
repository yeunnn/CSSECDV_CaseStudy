// import module `database` from `../models/db.js`
const db = require('../models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('../models/UserModel.js');

// import module `Order` from `../models/OrderModel.js`
const Order = require('../models/OrderModel.js');

// import module `Log` from `../models/serverLog.js`
const Log = require('../models/serverLog.js');

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

            // Redirect to login page if not authenticated
            var details = {
                active: 'staff-page',
                position: req.session.position
              };

            res.render('staff-page', {result, active:'staff-page', details});
        }
        else{
            res.redirect('/');
        }
    },

    updateOrderStatus: async function (req, res) {
        try {
            const orderId = req.params.orderId;
            const newStatus = req.body.status;
            const username = req.session.user || 'Unknown';

            // Update the order status in the database
            const result = await db.updateOne(Order, { orderID: parseInt(orderId) }, { status: newStatus });
            
            // Check if the update was successful
            if (result.matchedCount === 0) {
                console.log("Order with ID not found");
                throw new Error(`Order with ID ${orderId} not found`);
            }
            
            if (result.modifiedCount === 0) {
                console.log("Order status for order ${orderId} was not modified");
                throw new Error(`Order status for order ${orderId} was not modified`);
            }

            // Log the action
            const logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Success',
                functionType: 'updateOrderStatus',
                description: `${username} updated order ${orderId} status to ${newStatus}`
            };
            
            await db.insertOne(Log, logEntry);

            // Send a JSON response
            res.json({ message: 'Order status updated successfully' });
        } catch (error) {
            const username = req.session.user || 'Unknown';
            const orderId = req.params.orderId;
            const newStatus = req.body.status;
            
            // Log the error
            const logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'updateOrderStatus',
                description: `${username} failed to update order ${orderId} status to ${newStatus}. Error: ${error.message}`
            };
            
            try {
                await db.insertOne(Log, logEntry);
            } catch (logError) {
                console.error('Error logging updateOrderStatus failure:', logError);
            }
            
            console.error('Error updating order status:', error);
            res.status(500).json({ message: 'Error updating order status: ' + error.message });
        }
    },

    deleteOrder: async function (req, res) {
        try {
            const orderId = req.params.orderId;
            const username = req.session.user || 'Unknown';

            // Delete the order from the database
            const result = await db.deleteOne(Order, { orderID: parseInt(orderId) });
            
            // Check if the delete was successful
            if (result.deletedCount === 0) {
                throw new Error(`Order with ID ${orderId} not found or already deleted`);
            }

            // Log the action
            const logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Success',
                functionType: 'deleteOrder',
                description: `${username} deleted order ${orderId}`
            };
            
            await db.insertOne(Log, logEntry);

            // Send a JSON response
            res.json({ message: 'Order deleted successfully' });
        } catch (error) {
            const username = req.session.user || 'Unknown';
            const orderId = req.params.orderId;
            
            // Log the error
            const logEntry = {
                username: username,
                timestamp: Date.now(),
                logType: 'Failure',
                functionType: 'deleteOrder',
                description: `${username} failed to delete order ${orderId}. Error: ${error.message}`
            };
            
            try {
                await db.insertOne(Log, logEntry);
            } catch (logError) {
                console.error('Error logging deleteOrder failure:', logError);
            }
            
            console.error('Error deleting order:', error);
            res.status(500).json({ message: 'Error deleting order: ' + error.message });
        }
    }
}

/*
    exports the object `staffpageController` (defined above)
    when another script exports from this file
*/
module.exports = staffpageController;