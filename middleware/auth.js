/*
    Authentication Middleware
    Implements security requirements 2.1.1 and 2.1.2
    - Require authentication for all pages and resources, except those specifically intended to be public
    - All authentication controls should fail securely
*/

const authMiddleware = {
    // Define public routes that don't require authentication
    publicRoutes: [
        '/',
        '/staff-login',
        '/customer-registration',
        '/password-reset-1',
        '/password-reset-2',
        '/password-reset-3',
        '/password-reset-final',
        '/menu-public',
        '/validate-password'
    ],

    // Check if route is public
    isPublicRoute: function(path) {
        return this.publicRoutes.includes(path) || 
               path.startsWith('/public/') || 
               path.startsWith('/css/') || 
               path.startsWith('/js/') || 
               path.startsWith('/images/');
    },

    // Main authentication middleware
    requireAuth: function(req, res, next) {
        try {
            // Allow public routes to pass through
            if (authMiddleware.isPublicRoute(req.path)) {
                return next();
            }

            // Check if user is authenticated
            if (!req.session || !req.session.user) {
                // Authentication control fails securely - redirect to login
                return res.redirect('/staff-login');
            }

            // Check if session is valid and user position exists
            if (!req.session.position) {
                // Destroy invalid session and redirect to login
                req.session.destroy(function(err) {
                    if (err) {
                        console.error('Session destruction error:', err);
                    }
                    return res.redirect('/staff-login');
                });
                return;
            }

            // Authentication successful, proceed to next middleware
            next();
        } catch (error) {
            // Fail securely on any error
            console.error('Authentication middleware error:', error);
            return res.redirect('/staff-login');
        }
    },

    // Check if user is authenticated (for use in controllers)
    isAuthenticated: function(req) {
        return req.session && req.session.user && req.session.position;
    },

    // Get current user info
    getCurrentUser: function(req) {
        if (authMiddleware.isAuthenticated(req)) {
            return {
                username: req.session.user,
                position: req.session.position
            };
        }
        return null;
    }
};

module.exports = authMiddleware;
