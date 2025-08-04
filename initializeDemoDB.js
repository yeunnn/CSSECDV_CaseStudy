// import module `database` from `../models/db.js`
const db = require('./models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('./models/UserModel.js'); 

const bcrypt = require('bcrypt');
const saltRounds = 10;

db.connect();
add();
async function add(){
    var user1 = 'newAdmin';
    var pw1 = 'qwerty';
    var pos1 = 'Admin';

    bcrypt.hash(pw1, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        var passwordSchema = {
            password: hash
        }
        var UserSchema = {
            username: user1,
            password: passwordSchema,
            position: pos1
        }

        var response = await db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });

    var user2 = 'passCha';
    var pw2 = 'qwerty';
    var pos2 = 'Admin';

    const msInOneDay = 24 * 60 * 60 * 1000;
    
    bcrypt.hash(pw2, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        var passwordSchema = {
            password: hash,
            timestamp: Date.now() - (msInOneDay * 2)
        }
        var UserSchema = {
            username: user2,
            password: passwordSchema,
            position: pos2
        }

        var response = await db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });
}
