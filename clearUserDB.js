// import module `database` from `../models/db.js`
const db = require('./models/db.js');

// import module `User` from `../models/UserModel.js`
const User = require('./models/UserModel.js'); 

const bcrypt = require('bcrypt');
const saltRounds = 10;

db.connect();
add();
async function add(){
    var clear = await db.deleteMany(User, {});

    console.log(clear)
}
