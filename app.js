// Main Application JavaScript

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Load featured jobs on homepage
    const featuredJobs = document.getElementById('featuredJobs');
    if (featuredJobs) {
        loadFeaturedJobs();
    }
});

// Load featured jobs
async function loadFeaturedJobs() {
    const result = await api.jobs.getAll({ limit: 6 });
    
    if (result.success) {
        const jobsGrid = document.getElementById('featuredJobs');
        jobsGrid.innerHTML = result.data.jobs.map(job => createJobCard(job)).join('');
    }
}

// Create job card HTML
function createJobCard(job) {
    return `
        <div class="job-card">
            <div class="job-header">
                <div class="job-icon">
                    <i class="fas fa-briefcase"></i>
                </div>
                <div>
                    <h3 class="job-title">${job.title}</h3>
                    <p class="job-company">${job.company}</p>
                </div>
            </div>
            <div class="job-details">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-clock"></i> ${job.employment_type}</span>
            </div>
            <p class="job-description">${job.description.substring(0, 100)}...</p>
            <div class="job-footer">
                <span class="job-salary">$${job.salary_min} - $${job.salary_max}</span>
                <a href="pages/jobseeker/job-matches.html" class="btn btn-outline">View Job</a>
            </div>
        </div>
    `;
}

// Utility functions
const utils = {
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    showToast: (message, type = 'info') => {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },
    
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePhone: (phone) => {
        const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        return re.test(phone);
    }
};

// Export for use in other files
window.utils = utils;