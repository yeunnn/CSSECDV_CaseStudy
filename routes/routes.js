// import module `express`
const express = require('express');
const bodyParser = require('body-parser');

// import module `controller` from `../controllers/controller.js`
const controller = require('../controllers/controller.js');

// import module `signupController` from `../controllers/signupController.js`
const menuController = require('../controllers/menuController.js');
const orderreceiptController = require('../controllers/orderreceiptController.js');
const orderstatusController = require('../controllers/orderstatusController.js');
const staffloginController = require('../controllers/staffloginController.js');
const staffpageController = require('../controllers/staffpageController.js');

// import module `logoutController` from `../controllers/logoutController.js`
const logoutController = require('../controllers/logoutController.js');

const menupublicController = require('../controllers/menupublicController.js');
const registrationController = require('../controllers/registrationController.js');
const passwordResetController = require('../controllers/passwordResetController.js');
const dashboardController = require('../controllers/adminDashboardController.js');

// import middleware
const authzMiddleware = require('../middleware/authz.js');
const reauthMiddleware = require('../middleware/reauth.js');
const validationMiddleware = require('../middleware/validation.js');

const app = express();

// Parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());

/*
    execute function getIndex()
    defined in object `controller` in `../controllers/controller.js`
    when a client sends an HTTP GET request for `/`
*/
app.get('/', controller.getIndex);
app.get('/index', authzMiddleware.requireRole(['Customer']), controller.userIndex);

app.get('/logout', logoutController.getLogOut);

//Menu Controller - with authorization
app.get('/menu', authzMiddleware.requireRole(['Customer', 'Admin']), menuController.getMenu);
app.get('/menu-public', menupublicController.getMenuPublic);
app.post('/submit-order', authzMiddleware.requireRole(['Customer', 'Admin']), authzMiddleware.requireAction('place_orders'), menuController.submitOrder);

app.get('/order-receipt', authzMiddleware.requireRole(['Customer', 'Admin']), orderreceiptController.getOrderReceipt);

app.get('/order-status', authzMiddleware.requireRole(['Customer', 'Staff', 'Admin']), orderstatusController.getOrderStatus);

app.get('/staff-login', staffloginController.getStaffLogin);
app.post('/staff-login', validationMiddleware.validateLogin, staffloginController.postStaffLogin);

//registration
app.get('/customer-registration', registrationController.getCustomerRegistration)
app.post('/customer-registration', validationMiddleware.validateRegistration, registrationController.postCustomerRegistration)
app.post('/validate-password', registrationController.postPasswordValidation)

//password reset - critical operations require re-authentication
app.get('/password-reset-1', passwordResetController.getPasswordResetStep1)
app.post('/password-reset-2', validationMiddleware.validatePasswordReset, passwordResetController.postPasswordResetStep2)
app.post('/password-reset-3', validationMiddleware.validatePasswordReset, passwordResetController.postPasswordResetStep3)
app.post('/password-reset-final', validationMiddleware.validatePasswordReset, passwordResetController.postPasswordResetFinal)

app.get('/admin-dashboard', dashboardController.getAdminDashbaord);
app.get('/get-accounts', dashboardController.getAccounts);
app.get('/get-logs', dashboardController.getLogs);
app.post('/update-roles', dashboardController.postChangeRoles);
app.post('/delete-account', dashboardController.postDeleteAccount);
app.post('/create-account', dashboardController.postAddAccount);

app.get('staff-page', staffpageController.getStaffPage);

// Update order status
app.post('/update-order-status/:orderId', validationMiddleware.validateOrderStatus, staffpageController.updateOrderStatus);
// Delete order
app.delete('/delete-order/:orderId', validationMiddleware.validateOrderStatus, staffpageController.deleteOrder);
// Change password routes for logged-in users (requires re-authentication)
app.get('/change-password', 
    authzMiddleware.requireRole(['Customer', 'Staff', 'Admin']), 
    (req, res) => {
        // Always require re-authentication for change password
        // Store the original URL to redirect back after re-authentication
        req.session.originalUrl = '/change-password';
        res.redirect('/reauth-required');
    }
);

// Staff page - with authorization
app.get('/staff-page', authzMiddleware.requireRole(['Staff', 'Admin']), staffpageController.getStaffPage);

// Update order status - with authorization and business rules
app.post('/update-order-status/:orderId', 
    authzMiddleware.requireRole(['Staff', 'Admin']), 
    authzMiddleware.requireAction('update_orders'),
    authzMiddleware.enforceOrderBusinessRules,
    validationMiddleware.validateOrderStatus,
    staffpageController.updateOrderStatus
);

// Delete order - with authorization and business rules  
app.delete('/delete-order/:orderId', 
    authzMiddleware.requireRole(['Staff', 'Admin']), 
    authzMiddleware.requireAction('delete_orders'),
    authzMiddleware.requireAction('update_orders'),
    authzMiddleware.enforceOrderBusinessRules,
    validationMiddleware.validateOrderStatus,
    staffpageController.deleteOrder
);

// Re-authentication routes
app.get('/reauth-required', reauthMiddleware.showReauthForm);
app.post('/reauth-required', validationMiddleware.validateReauth, reauthMiddleware.processReauth);

/*
    exports the object `app` (defined above)
    when another script exports from this file
*/
module.exports = app;