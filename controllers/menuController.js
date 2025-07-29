// import module `database` from `../models/db.js`
const db = require('../models/db.js');

const Order = require('../models/OrderModel.js');
const OrderCounter = require('../models/orderCounter.js');

const menuController = {
  getMenu: async function (req, res) {
    if (req.session.position === 'Customer') {
      // Redirect to login page if not authenticated
      var details = {
        active: 'menu',
        position: req.session.position
      };
      res.render('menu', details);
    }
    else{
      res.redirect('/');
    }
  },

  submitOrder: async function (req, res) {
    try {
      var orderItems = JSON.parse(req.body.orderItems); // Parse the orderItems string into an array of objects
      var totalPrice = Number(req.body.totalPrice);
      var status = 'Preparing';
      var orderType = req.body.orderType; // Get the selected order type
      var paymentType = req.body.paymentOption;
  
      //debugging console
      //console.log('orderItems = ' + orderItems + ', totalPrice = ' + totalPrice + ', orderType = ' + orderType);
  
      // Validate and handle missing values
      if (!orderItems || !orderType || !totalPrice || !paymentType) {
        //return res.status(400).json({ error: 'Missing Data: orderItems = ' + orderItems + ', totalPrice = ' + totalPrice + ', tableNo = ' + tableNo });
        res.render('menu', {active:'menu'});
      }
      else {
        // Convert order items to match orderItemSchema
        const formattedOrderItems = orderItems.map(item => ({
          food: item.food,
          quantity: item.quantity,
          price: item.price
        }));

        // Get the current order number from the counter collection
        const counter = await OrderCounter.findOneAndUpdate({}, { $inc: { count: 1 } }, { new: true, upsert: true });
        var orderNumber = counter.count;
        
        // Process the order data
        const order = new Order({
          items: formattedOrderItems,
          total: totalPrice,
          orderType: orderType,
          status: status,
          orderID: orderNumber,
          timestamp: new Date(),
          payment: paymentType,
        });
        
        // Save the order to the database
        await db.insertOne(Order, order);
    
        // Send a success status of 201 (Created) instead of 200 (OK)
        //res.status(201).json({ message: 'Order submitted successfully' });
        res.render('order-receipt', order);
      }
    } catch (err) {
      // Log the error for debugging purposes
      console.error(err);
      res.status(500).json({ error: 'An error occurred while submitting the order' });
    }
  }
}

module.exports = menuController;