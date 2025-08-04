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
    var pw1 = 'ossuAdmin123456789';
    var pos1 = 'Admin';

    // Security questions and answers
    var secQ1 = 'What is your mother\'s maiden name?';
    var secQ1Ans = 'Smith';
    var secQ2 = 'What was the name of your first pet?';
    var secQ2Ans = 'Buddy';

    var msInOneDay = 24 * 60 * 60 * 1000;
    
    bcrypt.hash(pw1, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        var passwordSchema = {
            password: hash,
            timestamp: Date.now() - (msInOneDay * 2)
        }
        
        // Hash security answers
        const secAns1Hash = await bcrypt.hash(secQ1Ans, saltRounds);
        const secAns2Hash = await bcrypt.hash(secQ2Ans, saltRounds);
        
        var securityQuestions = [
            {
                question: secQ1,
                answer: secAns1Hash
            },
            {
                question: secQ2,
                answer: secAns2Hash
            }
        ];
        
        var UserSchema = {
            username: user1,
            password: passwordSchema,
            position: pos1,
            security: securityQuestions
        }

        var response = await db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });

    //-------------------------------------------------------------//
    
    var user2 = 'Customer2Day';
    var pw2 = 'ossuCustomer123456789';
    var pos2 = 'Customer';

    // Security questions and answers
    var secQ1 = 'What is your mother\'s maiden name?';
    var secQ1Ans = 'Smith';
    var secQ2 = 'What was the name of your first pet?';
    var secQ2Ans = 'Buddy';

    msInOneDay = 24 * 60 * 60 * 1000;
    
    bcrypt.hash(pw2, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        var passwordSchema = {
            password: hash,
            timestamp: Date.now() - (msInOneDay * 2)
        }
        
        // Hash security answers
        const secAns1Hash = await bcrypt.hash(secQ1Ans, saltRounds);
        const secAns2Hash = await bcrypt.hash(secQ2Ans, saltRounds);
        
        var securityQuestions = [
            {
                question: secQ1,
                answer: secAns1Hash
            },
            {
                question: secQ2,
                answer: secAns2Hash
            }
        ];
        
        var UserSchema = {
            username: user2,
            password: passwordSchema,
            position: pos2,
            security: securityQuestions
        }

        var response = await db.insertOne(User, UserSchema);
        if(response){
            console.log("added 1 doc");
        }else{
            console.log("failed");
        }
    });
}
