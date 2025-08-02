const { model } = require("mongoose");

const passwordValidation = {

    validatePassword: function (password) {
        return [
          password.length >= 12,                     // at least 12 characters
          /(?=.*[a-z])/.test(password),                   // at least one lowercase
          /(?=.*[A-Z])/.test(password),                   // at least one uppercase
          /(?=.*\d)/.test(password),                      // at least one numerical number
        ];
      }
}

module.exports = passwordValidation;