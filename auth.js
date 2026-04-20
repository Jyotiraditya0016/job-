// Authentication Manager
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.init();
    }
    
    async init() {
        if (this.token) {
            await this.loadUser();
        }
        this.updateUI();
    }
    
    async loadUser() {
        const result = await api.auth.getProfile(this.token);
        if (result.success) {
            this.user = result.data;
        } else {
            this.logout();
        }
    }
    
    async login(email, password) {
        const result = await api.auth.login(email, password);
        
        if (result.success) {
            this.token = result.data.access_token;
            this.user = result.data.user;
            localStorage.setItem('token', this.token);
            this.updateUI();
            
            // Show success message
            this.showPopup('Login successful! Redirecting...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                this.redirectToDashboard();
            }, 1500);
        }
        
        return result;
    }
    
    async register(userData) {
        const result = await api.auth.register(userData);
        
        if (result.success) {
            this.token = result.data.access_token;
            this.user = result.data.user;
            localStorage.setItem('token', this.token);
            this.updateUI();
            
            // Show success message with user ID
            const userId = this.user._id || this.user.id;
            this.showPopup(`Account created successfully! Your User ID: ${userId}. Redirecting...`, 'success');
            
            // Redirect based on role
            setTimeout(() => {
                this.redirectToDashboard();
            }, 2000);
        }
        
        return result;
    }
    
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.updateUI();
        this.showPopup('Logged out successfully', 'success');
        window.location.href = '/';
    }
    
    showPopup(message, type = 'success') {
        // Remove any existing popup
        const existingPopup = document.querySelector('.popup-message');
        if (existingPopup) {
            existingPopup.remove();
        }
        
        // Create popup
        const popup = document.createElement('div');
        popup.className = `popup-message popup-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        
        popup.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(popup);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
    
    redirectToDashboard() {
        switch (this.user?.role) {
            case 'job_seeker':
                window.location.href = 'pages/jobseeker/dashboard.html';
                break;
            case 'recruiter':
                window.location.href = 'pages/recruiter/dashboard.html';
                break;
            case 'admin':
                window.location.href = 'pages/admin/dashboard.html';
                break;
            default:
                window.location.href = '/';
        }
    }
    
    isAuthenticated() {
        return !!this.token;
    }
    
    hasRole(role) {
        return this.user?.role === role;
    }
    
    // Middleware to check authentication for protected pages
    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    }
    
    // Middleware to check role for protected pages
    checkRole(allowedRoles) {
        if (!this.user) return false;
        return allowedRoles.includes(this.user.role);
    }
}

// Initialize auth manager
const auth = new AuthManager();

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            const loginBtn = document.getElementById('loginBtn');
            const btnText = loginBtn.querySelector('.btn-text');
            const btnLoader = loginBtn.querySelector('.btn-loader');
            
            // Show loading state
            loginBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            errorDiv.style.display = 'none';
            
            const result = await auth.login(email, password);
            
            // Hide loading state
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            
            if (!result.success) {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
                
                // Show error popup
                auth.showPopup(result.error, 'error');
            }
        });
    }
    
    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                first_name: document.getElementById('firstName').value,
                last_name: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                role: document.querySelector('input[name="role"]:checked')?.value || 'job_seeker',
                company: document.getElementById('company')?.value,
                phone: document.getElementById('phone')?.value
            };
            
            const errorDiv = document.getElementById('errorMessage');
            const registerBtn = document.getElementById('registerBtn');
            const btnText = registerBtn.querySelector('.btn-text');
            const btnLoader = registerBtn.querySelector('.btn-loader');
            
            // Validate passwords match
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            if (confirmPassword && formData.password !== confirmPassword) {
                errorDiv.textContent = 'Passwords do not match';
                errorDiv.style.display = 'block';
                auth.showPopup('Passwords do not match', 'error');
                return;
            }
            
            // Show loading state
            registerBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
            errorDiv.style.display = 'none';
            
            const result = await auth.register(formData);
            
            // Hide loading state
            registerBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            
            if (!result.success) {
                errorDiv.textContent = result.error;
                errorDiv.style.display = 'block';
                
                // Show error popup
                auth.showPopup(result.error, 'error');
            }
        });
    }
    
    // Logout button handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.logout();
        });
    }
    
    // Role selection in registration
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const companyField = document.getElementById('companyField');
    
    if (roleRadios && companyField) {
        roleRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'recruiter') {
                    companyField.style.display = 'block';
                    document.getElementById('company').required = true;
                } else {
                    companyField.style.display = 'none';
                    document.getElementById('company').required = false;
                }
            });
        });
    }
    
    // Check authentication for protected pages
    const protectedPages = [
        '/pages/jobseeker/',
        '/pages/recruiter/',
        '/pages/admin/'
    ];
    
    const currentPath = window.location.pathname;
    const isProtected = protectedPages.some(page => currentPath.includes(page));
    
    if (isProtected) {
        auth.checkAuth();
    }
});