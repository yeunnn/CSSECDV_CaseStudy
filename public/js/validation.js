// Client-side validation for CSSECDV Case Study
// Provides real-time feedback and prevents invalid input submission

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
};

class FormValidator {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupValidation();
            this.setupPasswordToggle();
            this.setupCharacterCounters();
        });
    }

    setupValidation() {
        // Find all forms and add validation
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.validateForm(e, form));
        });

        // Add real-time validation to inputs
        const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    setupPasswordToggle() {
        const showButtons = document.querySelectorAll('.show');
        showButtons.forEach(button => {
            button.addEventListener('click', () => {
                const passwordInput = button.parentElement.querySelector('.pass-key, input[type="password"]');
                if (passwordInput) {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        button.textContent = 'HIDE';
                    } else {
                        passwordInput.type = 'password';
                        button.textContent = 'SHOW';
                    }
                }
            });
        });
    }

    getFieldValidationType(input) {
        const name = input.name;
        if (name === 'username') return 'username';
        if (name === 'password') return 'password';
        if (name === 'secQ1Ans' || name === 'secQ2Ans') return 'securityAnswer';
        return null;
    }

    validateField(input) {
        const fieldType = this.getFieldValidationType(input);
        if (!fieldType || !validationRules[fieldType]) return true;

        const value = input.value.trim();
        const rule = validationRules[fieldType];
        
        // Remove existing error messages
        this.clearFieldError(input);
        
        // Validate field
        const errors = [];
        
        if (value.length === 0) {
            errors.push(`${fieldType} is required`);
        } else {
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(rule.errorMessage);
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(rule.errorMessage);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(rule.errorMessage);
            }
        }
        
        // Display validation result
        if (errors.length > 0) {
            this.showFieldError(input, errors[0]);
            input.classList.add('invalid');
            input.classList.remove('valid');
            return false;
        } else if (value.length > 0) {
            input.classList.add('valid');
            input.classList.remove('invalid');
            
            // Special handling for password requirements display
            if (fieldType === 'password') {
                this.updatePasswordRequirements(value);
            }
            return true;
        }
        
        return true;
    }

    updatePasswordRequirements(password) {
        const requirements = {
            'validatePL': password.length >= 15,
            'validateLC': /[a-z]/.test(password),
            'validateUC': /[A-Z]/.test(password),
            'validateNC': /\d/.test(password)
        };

        Object.keys(requirements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = requirements[id] ? '✅' : '❌';
            }
        });
    }

    showFieldError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.setAttribute('data-field-error', input.name);
        
        // Find the input-group container (parent of the input-field) to insert error message below the entire input group
        const inputGroup = input.closest('.input-group');
        if (inputGroup) {
            // Insert at the end of the input-group container
            inputGroup.appendChild(errorDiv);
        } else {
            // Fallback: insert after the input field (or after character counter if it exists)
            const counter = input.parentElement.querySelector('.char-counter');
            if (counter) {
                counter.parentElement.insertBefore(errorDiv, counter.nextSibling);
            } else {
                input.parentElement.appendChild(errorDiv);
            }
        }
    }

    clearFieldError(input) {
        // Find error message within the input-group container
        const inputGroup = input.closest('.input-group');
        if (inputGroup) {
            const existingError = inputGroup.querySelector(`[data-field-error="${input.name}"]`);
            if (existingError) {
                existingError.remove();
            }
        } else {
            // Fallback: search in the input's parent element
            const existingError = input.parentElement.querySelector(`[data-field-error="${input.name}"]`);
            if (existingError) {
                existingError.remove();
            }
        }
    }

    validateForm(event, form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[type="text"], input[type="password"]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault();
            
            // Focus on first invalid field
            const firstInvalid = form.querySelector('input.invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            
            // Show general error message
            this.showFormError(form, 'Please correct the errors below before submitting.');
        }

        return isValid;
    }

    showFormError(form, message) {
        // Remove existing form error
        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error form-error';
        errorDiv.textContent = message;
        
        // Insert at the beginning of the form
        form.insertBefore(errorDiv, form.firstChild);
    }
}

// Initialize validation when page loads
new FormValidator();
