/*
    Re-authentication Middleware
    Implements security requirement 2.1.13
    - Re-authenticate users prior to performing critical operations such as password change
*/

const bcrypt = require('bcrypt');
const db = require('../models/db.js');
const User = require('../models/UserModel.js');

const reauthMiddleware = {
    // Define critical operations that require re-authentication
    criticalOperations: [
        '/change-password',
        '/password-reset-1',
        '/password-reset-2', 
        '/password-reset-3',
        '/password-reset-final'
        /*
        '/update-password',
        '/delete-account',
        '/change-security-questions',
        '/admin-user-management'
        */
    ],

    // Check if the current route requires re-authentication
    requiresReauth: function(path) {
        return this.criticalOperations.some(operation => 
            path.includes(operation) || path.startsWith(operation)
        );
    },

    // Middleware to check for recent authentication
    checkRecentAuth: function(req, res, next) {
        try {
            // Skip if not a critical operation
            if (!reauthMiddleware.requiresReauth(req.path)) {
                return next();
            }

            // Check if user is authenticated
            if (!req.session || !req.session.user) {
                return res.redirect('/staff-login');
            }

            // Check if recent authentication exists (within last 5 minutes)
            const recentAuthTime = req.session.recentAuth;
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);

            if (!recentAuthTime || recentAuthTime < fiveMinutesAgo) {
                // Store the original URL to redirect back after re-authentication
                req.session.originalUrl = req.originalUrl;
                return res.redirect('/reauth-required');
            }

            // Recent authentication exists, proceed
            next();
        } catch (error) {
            console.error('Re-authentication check error:', error);
            return res.redirect('/staff-login');
        }
    },

    // Handle re-authentication form display
    showReauthForm: function(req, res) {
        try {
            if (!req.session || !req.session.user) {
                return res.redirect('/staff-login');
            }

            res.render('reauth-form', {
                username: req.session.user,
                position: req.session.position,
                originalUrl: req.session.originalUrl || '/',
                active: 'reauth'
            });
        } catch (error) {
            console.error('Re-authentication form display error:', error);
            return res.redirect('/staff-login');
        }
    },

    // Process re-authentication
    processReauth: async function(req, res) {
        try {
            const { password } = req.body;
            const username = req.session.user;

            if (!username || !password) {
                return res.render('reauth-form', {
                    username: username,
                    position: req.session.position,
                    originalUrl: req.session.originalUrl || '/',
                    errorMessage: 'Password is required for re-authentication.',
                    active: 'reauth'
                });
            }

            // Get user from database
            const user = await db.findOne(User, { username: username }, 'password');
            
            if (!user || !user.password || user.password.length === 0) {
                return res.render('reauth-form', {
                    username: username,
                    position: req.session.position,
                    originalUrl: req.session.originalUrl || '/',
                    errorMessage: 'Re-authentication failed. Please try again.',
                    active: 'reauth'
                });
            }

            // Get the most recent password
            const passwordArr = user.password.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const currentPassword = passwordArr[0].password;

            // Verify password
            bcrypt.compare(password, currentPassword, function(err, isValid) {
                if (err) {
                    console.error('Password comparison error:', err);
                    return res.render('reauth-form', {
                        username: username,
                        position: req.session.position,
                        originalUrl: req.session.originalUrl || '/',
                        errorMessage: 'Re-authentication failed. Please try again.',
                        active: 'reauth'
                    });
                }

                if (isValid) {
                    // Set recent authentication timestamp
                    req.session.recentAuth = Date.now();
                    
                    // Special handling for change-password flow
                    const originalUrl = req.session.originalUrl || '/';
                    delete req.session.originalUrl; // Clean up
                    
                    if (originalUrl === '/change-password') {
                        // For change password, redirect directly to password reset step 1
                        return res.redirect('/password-reset-1?mode=change');
                    }
                    
                    // For other operations, redirect to original URL
                    return res.redirect(originalUrl);
                } else {
                    return res.render('reauth-form', {
                        username: username,
                        position: req.session.position,
                        originalUrl: req.session.originalUrl || '/',
                        errorMessage: 'Invalid password. Please try again.',
                        active: 'reauth'
                    });
                }
            });
        } catch (error) {
            console.error('Re-authentication processing error:', error);
            return res.redirect('/staff-login');
        }
    },

    // Clear recent authentication (for logout or session timeout)
    clearRecentAuth: function(req) {
        if (req.session) {
            delete req.session.recentAuth;
        }
    }
};

module.exports = reauthMiddleware;
