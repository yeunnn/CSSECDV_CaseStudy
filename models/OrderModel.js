const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  }
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema], // Square brackets indicate an array of embedded documents
  total: {
    type: Number,
    required: true,
  },
  orderType: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  orderID: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  payment: {
    type: String,
    required: true,
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;