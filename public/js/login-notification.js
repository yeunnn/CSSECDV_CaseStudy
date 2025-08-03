/*
    Login Notification Script
    Implements security requirement 2.1.12
    - Display last login information to user upon successful login
*/

document.addEventListener('DOMContentLoaded', function() {
    // Check if login notification should be shown
    if (window.showLoginNotification && window.lastLoginInfo) {
        showLastLoginPopup(window.lastLoginInfo);
    }
});

function showLastLoginPopup(loginInfo) {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'login-notification-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;

    // Create popup content
    const popup = document.createElement('div');
    popup.id = 'login-notification-popup';
    popup.style.cssText = `
        background-color: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        max-width: 450px;
        width: 90%;
        text-align: center;
        position: relative;
        animation: slideIn 0.3s ease-out;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        .login-info-item {
            margin: 10px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            border-left: 4px solid #007bff;
        }
        .login-info-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .login-info-value {
            color: #666;
            font-family: monospace;
        }
        .close-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 15px;
        }
        .close-btn:hover {
            background-color: #0056b3;
        }
        .security-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
    `;
    document.head.appendChild(style);

    // Create popup HTML content
    popup.innerHTML = `
        <div class="security-icon">🔐</div>
        <h3 style="color: #333; margin-bottom: 20px;">Last Account Activity</h3>
        <p style="color: #666; margin-bottom: 20px;">
            For your security, here is information about your last login:
        </p>
        
        <div class="login-info-item">
            <div class="login-info-label">Last Successful Login:</div>
            <div class="login-info-value">${loginInfo.date}</div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 4px; border: 1px solid #ffeaa7;">
            <small style="color: #856404;">
                <strong>Security Tip:</strong> If you don't recognize this activity, please change your password immediately and contact your administrator.
            </small>
        </div>
        
        <button class="close-btn" onclick="closeLoginNotification()">
            Got it, thanks!
        </button>
    `;

    // Add popup to overlay
    overlay.appendChild(popup);
    
    // Add overlay to page
    document.body.appendChild(overlay);

    // Auto-close after 30 seconds
    setTimeout(function() {
        if (document.getElementById('login-notification-overlay')) {
            closeLoginNotification();
        }
    }, 30000);

    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeLoginNotification();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('login-notification-overlay')) {
            closeLoginNotification();
        }
    });
}

function closeLoginNotification() {
    const overlay = document.getElementById('login-notification-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(function() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// Add fadeOut animation
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(fadeOutStyle);
