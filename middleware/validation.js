// Data Validation Middleware for CSSECDV Case Study
// All validation failures result in input rejection (no sanitization)

const validationRules = {
    // Username validation
    username: {
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        errorMessage: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens'
    },
    
    // Password validation
    password: {
        minLength: 15,
        maxLength: 30,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
        errorMessage: 'Password must be 15-30 characters long with at least 1 lowercase, 1 uppercase, and 1 numeric character'
    },
    
    // Security question answers
    securityAnswer: {
        minLength: 2,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9\s.,'-]+$/,
        errorMessage: 'Security answer must be 2-30 characters long and contain only letters, numbers, spaces, and basic punctuation'
    },
    
    // Order status updates
    orderStatus: {
        allowedValues: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled', 'Served'],
        errorMessage: 'Invalid order status'
    },
    
    // Order ID validation - updated to match Number type in OrderModel
    orderId: {
        pattern: /^\d+$/,
        errorMessage: 'Invalid order ID format'
    }
};

const validateField = (fieldName, value, rules) => {
    const rule = rules[fieldName];
    if (!rule) return null; // No validation rule defined
    
    // Check if value exists for required fields
    if (!value || typeof value !== 'string') {
        return `${fieldName} is required`;
    }
    
    // Trim whitespace for validation
    const trimmedValue = value.trim();
    
    // Check allowed values (for enums)
    if (rule.allowedValues && !rule.allowedValues.includes(trimmedValue)) {
        return rule.errorMessage;
    }
    
    // Check length constraints
    if (rule.minLength && trimmedValue.length < rule.minLength) {
        return rule.errorMessage;
    }
    
    if (rule.maxLength && trimmedValue.length > rule.maxLength) {
        return rule.errorMessage;
    }
    
    // Check pattern constraints
    if (rule.pattern && !rule.pattern.test(trimmedValue)) {
        return rule.errorMessage;
    }
    
    return null; // Validation passed
};

const validationMiddleware = {
    // Login form validation
    validateLogin: (req, res, next) => {
        const errors = {};
        
        const usernameError = validateField('username', req.body.username, validationRules);
        if (usernameError) errors.username = usernameError;
        
        const passwordError = validateField('password', req.body.password, validationRules);
        if (passwordError) errors.password = passwordError;
        
        if (Object.keys(errors).length > 0) {
            return res.render('staff-login', { 
                errorMessage: 'Validation failed. Please check your input.',
                fieldErrors: errors,
                formData: req.body
            });
        }
        
        next();
    },
    
    // Registration form validation
    validateRegistration: (req, res, next) => {
        const errors = {};
        
        const usernameError = validateField('username', req.body.username, validationRules);
        if (usernameError) errors.username = usernameError;
        
        const passwordError = validateField('password', req.body.password, validationRules);
        if (passwordError) errors.password = passwordError;
        
        const secQ1AnsError = validateField('securityAnswer', req.body.secQ1Ans, validationRules);
        if (secQ1AnsError) errors.secQ1Ans = secQ1AnsError;
        
        const secQ2AnsError = validateField('securityAnswer', req.body.secQ2Ans, validationRules);
        if (secQ2AnsError) errors.secQ2Ans = secQ2AnsError;
        
        if (Object.keys(errors).length > 0) {
            return res.render('customer-registration', { 
                errorMessage: 'Validation failed. Please check your input.',
                fieldErrors: errors,
                formData: req.body
            });
        }
        
        next();
    },
    
    // Password reset validation
    validatePasswordReset: (req, res, next) => {
        const errors = {};
        
        if (req.body.username) {
            const usernameError = validateField('username', req.body.username, validationRules);
            if (usernameError) errors.username = usernameError;
        }
        
        if (req.body.password) {
            const passwordError = validateField('password', req.body.password, validationRules);
            if (passwordError) errors.password = passwordError;
        }
        
        if (req.body.secQ1Ans) {
            const secQ1AnsError = validateField('securityAnswer', req.body.secQ1Ans, validationRules);
            if (secQ1AnsError) errors.secQ1Ans = secQ1AnsError;
        }
        
        if (req.body.secQ2Ans) {
            const secQ2AnsError = validateField('securityAnswer', req.body.secQ2Ans, validationRules);
            if (secQ2AnsError) errors.secQ2Ans = secQ2AnsError;
        }
        
        if (Object.keys(errors).length > 0) {
            const step = req.path.includes('step1') ? 'password-reset-step1' :
                        req.path.includes('step2') ? 'password-reset-step2' :
                        'password-reset-step3';
            
            return res.render(step, { 
                errorMessage: 'Validation failed. Please check your input.',
                fieldErrors: errors,
                formData: req.body,
                user: req.session.user,
                position: req.session.position
            });
        }
        
        next();
    },
    
    // Re-authentication validation
    validateReauth: (req, res, next) => {
        const errors = {};
        
        const passwordError = validateField('password', req.body.password, validationRules);
        if (passwordError) errors.password = passwordError;
        
        if (Object.keys(errors).length > 0) {
            return res.render('reauth-form', { 
                errorMessage: 'Validation failed. Please check your input.',
                fieldErrors: errors,
                username: req.session.user,
                position: req.session.position,
                originalUrl: req.body.originalUrl
            });
        }
        
        next();
    },
    
    // Order status validation
    validateOrderStatus: (req, res, next) => {
        const errors = {};
        
        if (req.body.status) {
            const statusError = validateField('orderStatus', req.body.status, validationRules);
            if (statusError) errors.status = statusError;
        }
        
        if (req.params.orderId) {
            const orderIdError = validateField('orderId', req.params.orderId, validationRules);
            if (orderIdError) errors.orderId = orderIdError;
        }
        
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ 
                error: 'Validation failed',
                fieldErrors: errors
            });
        }
        
        next();
    }
};

module.exports = validationMiddleware;
