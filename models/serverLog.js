const mongoose = require('mongoose');


const logSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
    functionType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;