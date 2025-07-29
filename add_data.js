// import module `database` from `../models/db.js`
const db = require('./models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('./models/UserModel.js'); 

const bcrypt = require('bcrypt');
const saltRounds = 10;

db.connect();
add();
async function add(){
    var user1 = 'Admin';
    var pw1 = 'ossuAdmin15';
    var pos1 = 'Admin';

    bcrypt.hash(pw1, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        var UserSchema = {
            username: user1,
            password: hash,
            position: pos1
        }

        var response = db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });

    var user2 = 'Staff';
    var pw2 = 'ossuStaff20';
    var pos2 = 'Staff';

    bcrypt.hash(pw2, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        var UserSchema = {
            username: user2,
            password: hash,
            position: pos2
        }

        var response = db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });

    /* Customer Accounts */
    var user3 = 'Customer1';
    var pw3 = 'ossuCustomer1';
    var pos3 = 'Customer';

    bcrypt.hash(pw3, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        var UserSchema = {
            username: user3,
            password: hash,
            position: pos3
        }

        var response = db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });

    var user4 = 'Customer2';
    var pw4 = 'ossuCustomer2';
    var pos4 = 'Customer';

    bcrypt.hash(pw4, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        var UserSchema = {
            username: user4,
            password: hash,
            position: pos4
        }

        var response = db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });

    var user5 = 'Customer3';
    var pw5 = 'ossuCustomer3';
    var pos5 = 'Customer';

    bcrypt.hash(pw5, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        var UserSchema = {
            username: user5,
            password: hash,
            position: pos5
        }

        var response = db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });
}
