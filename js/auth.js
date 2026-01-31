/**
 * Authentication Module
 * Handles login, logout, and role-based access control
 */

// Demo Users Database
const USERS_DB = [
    {
        email: 'user@demo.com',
        password: 'user123',
        role: 'user',
        name: 'User Demo'
    },
    {
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator'
    }
];

// Storage Keys
const STORAGE_KEY = 'nexaventure_user';

/**
 * Get current logged in user
 */
function getCurrentUser() {
    const userData = localStorage.getItem(STORAGE_KEY);
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }
    return null;
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * Check if current user is admin
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

/**
 * Login user
 */
function login(email, password) {
    const user = USERS_DB.find(u => u.email === email && u.password === password);

    if (user) {
        const userData = {
            email: user.email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
    }

    return { success: false, error: 'Email atau password salah' };
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem(STORAGE_KEY);
    updateUIForRole();
    updateAuthButton();
    closeLoginModal();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Open login modal
 */
function openLoginModal() {
    const user = getCurrentUser();

    if (user) {
        // If already logged in, show logout confirmation
        if (confirm(`Logged in sebagai ${user.name}\n\nApakah Anda ingin logout?`)) {
            logout();
        }
        return;
    }

    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) emailInput.focus();
        }, 300);
    }
}

/**
 * Close login modal
 */
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';

        // Reset form
        const form = document.getElementById('loginForm');
        if (form) form.reset();

        // Hide error
        const error = document.getElementById('loginError');
        if (error) error.classList.add('hidden');
    }
}

/**
 * Handle login form submission
 */
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    const result = login(email, password);

    if (result.success) {
        closeLoginModal();
        updateUIForRole();
        updateAuthButton();

        // Show success notification
        showNotification(`Selamat datang, ${result.user.name}!`, 'success');

        // If admin, scroll to first admin section
        if (result.user.role === 'admin') {
            setTimeout(() => {
                const adminSection = document.getElementById('analisis-pasar');
                if (adminSection) {
                    adminSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        }
    } else {
        if (errorEl) {
            errorEl.textContent = result.error;
            errorEl.classList.remove('hidden');
        }
    }
}

/**
 * Update UI based on user role
 */
function updateUIForRole() {
    const user = getCurrentUser();
    const body = document.body;

    // Remove all role classes
    body.classList.remove('role-user', 'role-admin', 'role-guest');

    if (user) {
        if (user.role === 'admin') {
            body.classList.add('role-admin');
        } else {
            body.classList.add('role-user');
        }
    } else {
        body.classList.add('role-guest');
    }

    // Update navigation
    updateAdminNavLinks();
}

/**
 * Update admin navigation links visibility
 */
function updateAdminNavLinks() {
    const adminLinks = document.querySelectorAll('.nav-link.admin-only');
    const isAdminUser = isAdmin();

    adminLinks.forEach(link => {
        if (isAdminUser) {
            link.style.display = '';
        } else {
            link.style.display = 'none';
        }
    });
}

/**
 * Update auth button state
 */
function updateAuthButton() {
    const authBtn = document.getElementById('authBtn');
    const userBadge = document.getElementById('userBadge');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const user = getCurrentUser();

    if (user) {
        // Update button to logout
        if (authBtn) {
            authBtn.innerHTML = '<span>🚪</span> Logout';
            authBtn.onclick = () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    logout();
                    showNotification('Anda telah logout', 'info');
                }
            };
        }

        // Show user badge
        if (userBadge) {
            userBadge.classList.remove('hidden');
            if (userAvatar) {
                userAvatar.textContent = user.name.charAt(0).toUpperCase();
                // Different color for admin
                if (user.role === 'admin') {
                    userAvatar.style.background = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
                } else {
                    userAvatar.style.background = 'var(--primary-gradient)';
                }
            }
            if (userName) {
                userName.textContent = user.name;
                if (user.role === 'admin') {
                    userName.innerHTML = `${user.name} <small style="color: #f59e0b;">(Admin)</small>`;
                }
            }
        }
    } else {
        // Update button to login
        if (authBtn) {
            authBtn.innerHTML = '<span>🔐</span> Login';
            authBtn.onclick = openLoginModal;
        }

        // Hide user badge
        if (userBadge) {
            userBadge.classList.add('hidden');
        }
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--bg-card)'};
        color: white;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;

    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Close modal when clicking outside
 */
document.addEventListener('click', (e) => {
    const modal = document.getElementById('loginModal');
    if (modal && e.target === modal) {
        closeLoginModal();
    }
});

/**
 * Close modal with Escape key
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUIForRole();
    updateAuthButton();
});
