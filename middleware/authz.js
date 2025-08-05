/*
    Authorization Middleware
    Implements security requirements 2.2.1, 2.2.2, and 2.2.3
    - Use a single site-wide component to check access authorization
    - Access controls should fail securely
    - Enforce application logic flows to comply with business rules
*/

const authzMiddleware = {
    // Define role-based access control rules
    rolePermissions: {
        'Admin': {
            routes: ['*'],
            actions: ['*']
        },
        'Staff': {
            routes: [
                '/staff-page',
                '/order-status',
                '/update-order-status/:orderId',
                '/delete-order/:orderId',
                '/logout',
                '/index',
                '/change-password'
            ],
            actions: ['view_orders', 'update_orders', 'delete_orders']
        },
        'Customer': {
            routes: [
                '/menu',
                '/submit-order',
                '/order-receipt',
                '/order-status',
                '/logout',
                '/index',
                '/change-password'
            ],
            actions: ['place_orders', 'view_own_orders']
        }
    },

    // Check if user has permission to access route
    hasRoutePermission: function(userRole, route) {
        try {
            if (!userRole || !this.rolePermissions[userRole]) {
                return false; // Fail securely
            }

            const permissions = this.rolePermissions[userRole];
            
            // Admin has access to everything
            if (permissions.routes.includes('*')) {
                return true;
            }

            // Check exact route match
            if (permissions.routes.includes(route)) {
                return true;
            }

            // Check route patterns (for dynamic routes like /update-order-status/:orderId)
            return permissions.routes.some(allowedRoute => {
                if (allowedRoute.includes(':')) {
                    // Convert route pattern to regex (e.g., /update-order-status/:orderId -> /update-order-status/[^/]+)
                    const pattern = allowedRoute.replace(/:[^/]+/g, '[^/]+');
                    const regex = new RegExp(`^${pattern}$`);
                    return regex.test(route);
                }
                return false;
            });
        } catch (error) {
            console.error('Route permission check error:', error);
            return false; // Fail securely
        }
    },

    // Check if user has permission to perform action
    hasActionPermission: function(userRole, action) {
        try {
            if (!userRole || !this.rolePermissions[userRole]) {
                return false; // Fail securely
            }

            const permissions = this.rolePermissions[userRole];
            return permissions.actions.includes('*') || permissions.actions.includes(action);
        } catch (error) {
            console.error('Action permission check error:', error);
            return false; // Fail securely
        }
    },

    // Main authorization middleware
    requireRole: function(allowedRoles) {
        return function(req, res, next) {
            try {
                // Check if user is authenticated first
                if (!req.session || !req.session.user || !req.session.position) {
                    return res.redirect('/staff-login'); // Fail securely
                }

                const userRole = req.session.position;

                // Check if user role is in allowed roles
                if (!allowedRoles.includes(userRole)) {
                    // Access control fails securely - redirect to appropriate page
                    return authzMiddleware.handleUnauthorizedAccess(req, res, userRole);
                }

                // Check route-level permissions
                if (!authzMiddleware.hasRoutePermission(userRole, req.path)) {
                    return authzMiddleware.handleUnauthorizedAccess(req, res, userRole);
                }

                // Authorization successful
                next();
            } catch (error) {
                console.error('Authorization middleware error:', error);
                return res.redirect('/staff-login'); // Fail securely
            }
        };
    },

    // Handle unauthorized access attempts
    handleUnauthorizedAccess: function(req, res, userRole) {
        try {
            // Business rule: redirect users to their appropriate home page
            switch (userRole) {
                case 'Admin':
                case 'Staff':
                    return res.redirect('/staff-page');
                case 'Customer':
                    return res.redirect('/index');
                default:
                    return res.redirect('/staff-login');
            }
        } catch (error) {
            console.error('Unauthorized access handling error:', error);
            return res.redirect('/staff-login'); // Fail securely
        }
    },

    // Middleware for specific actions
    requireAction: function(requiredAction) {
        return function(req, res, next) {
            try {
                if (!req.session || !req.session.position) {
                    return res.redirect('/staff-login');
                }

                if (!authzMiddleware.hasActionPermission(req.session.position, requiredAction)) {
                    return authzMiddleware.handleUnauthorizedAccess(req, res, req.session.position);
                }

                next();
            } catch (error) {
                console.error('Action authorization error:', error);
                return res.redirect('/staff-login');
            }
        };
    },

    // Business rule enforcement for order operations
    enforceOrderBusinessRules: function(req, res, next) {
        try {
            const userRole = req.session.position;
            const orderId = req.params.orderId;

            // Business rule: Only staff and admin can modify orders
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
                if (!['Admin', 'Staff'].includes(userRole)) {
                    return authzMiddleware.handleUnauthorizedAccess(req, res, userRole);
                }
            }

            next();
        } catch (error) {
            console.error('Business rule enforcement error:', error);
            return res.redirect('/staff-login');
        }
    }
};

module.exports = authzMiddleware;
