// import module `mongoose`
var mongoose = require('mongoose');

var passwordSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    }
})

var resetQuestions = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type:String,
        required: true
    }   
});

// defines the schema for collection `users`
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: [passwordSchema],
    position: {
        type: String,
        enum: ['Staff', 'Admin', 'Customer'],
        required: true
    },
    security: [resetQuestions],
    failedAttempts: {
        type: Number,
        default: 0,
    },
    lockedUntil: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

/*
    exports a mongoose.model object based on `UserSchema` (defined above)
    when another script exports from this file
    This model executes CRUD operations
    to collection `users` -> plural of the argument `User`
*/
module.exports = mongoose.model('User', UserSchema);