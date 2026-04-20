// Job Seeker Dashboard Functions

// Upload Resume Handler
class ResumeUploader {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.uploadProgress = document.getElementById('uploadProgress');
        this.uploadResult = document.getElementById('uploadResult');
        this.parsedData = document.getElementById('parsedData');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.fileInfo = document.getElementById('fileInfo');
        
        this.init();
    }
    
    init() {
        if (!this.uploadArea) return;
        
        // Drag and drop handlers
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });
        
        // Click to select file
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        if (this.selectFileBtn) {
            this.selectFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fileInput.click();
            });
        }
        
        // File input change handler
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFile(e.target.files[0]);
            }
        });
        
        // Upload another button
        const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
        if (uploadAnotherBtn) {
            uploadAnotherBtn.addEventListener('click', () => {
                this.resetUpload();
            });
        }
    }
    
    handleFile(file) {
        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (!validTypes.includes(file.type)) {
            alert('Please upload a PDF or DOC/DOCX file');
            return;
        }
        
        // Validate file size (16MB)
        if (file.size > 16 * 1024 * 1024) {
            alert('File size must be less than 16MB');
            return;
        }
        
        // Show file info
        this.fileInfo.innerHTML = `
            <strong>${file.name}</strong><br>
            <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
        `;
        
        // Show progress bar
        this.uploadArea.style.display = 'none';
        this.uploadProgress.style.display = 'block';
        
        // Upload file
        this.uploadFile(file);
    }
    
    async uploadFile(file) {
        const token = localStorage.getItem('token');
        
        const result = await api.resume.upload(file, token, (progress) => {
            this.progressFill.style.width = `${progress}%`;
            this.progressText.textContent = `${progress}% Uploaded`;
        });
        
        if (result.success) {
            // Show success
            this.progressFill.style.width = '100%';
            this.progressText.textContent = 'Upload Complete!';
            
            setTimeout(() => {
                this.uploadProgress.style.display = 'none';
                this.uploadResult.style.display = 'block';
                
                // Display parsed data
                this.displayParsedData(result.data.resume_data);
            }, 500);
        } else {
            alert('Upload failed: ' + result.error);
            this.resetUpload();
        }
    }
    
    displayParsedData(data) {
        this.parsedData.style.display = 'block';
        
        // Display skills
        const skillsContainer = document.getElementById('skillsContainer');
        if (skillsContainer && data.skills) {
            skillsContainer.innerHTML = data.skills.map(skill => 
                `<span class="skill-tag">${skill}</span>`
            ).join('');
        }
        
        // Display experience
        const expContainer = document.getElementById('experienceContainer');
        if (expContainer && data.experience) {
            expContainer.innerHTML = data.experience.map(exp => `
                <div class="experience-item">
                    <strong>${exp.role}</strong>
                    <p>${exp.description.substring(0, 100)}...</p>
                </div>
            `).join('');
        }
        
        // Display education
        const eduContainer = document.getElementById('educationContainer');
        if (eduContainer && data.education) {
            eduContainer.innerHTML = data.education.map(edu => `
                <div class="education-item">
                    <strong>${edu.degree}</strong>
                </div>
            `).join('');
        }
        
        // Display score
        const scoreSpan = document.querySelector('#resumeScore span');
        if (scoreSpan) {
            // Calculate mock score for demo
            const score = Math.floor(Math.random() * 30) + 70;
            scoreSpan.textContent = score;
            
            // Update progress circle
            const circle = document.querySelector('.score-circle');
            const degrees = (score * 360) / 100;
            circle.style.background = `conic-gradient(var(--primary-color) 0deg ${degrees}deg, var(--gray-200) ${degrees}deg 360deg)`;
        }
    }
    
    resetUpload() {
        this.uploadArea.style.display = 'block';
        this.uploadProgress.style.display = 'none';
        this.uploadResult.style.display = 'none';
        this.parsedData.style.display = 'none';
        this.fileInput.value = '';
        this.progressFill.style.width = '0%';
    }
}

// Job Matches Handler
class JobMatches {
    constructor() {
        this.container = document.getElementById('matchesContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.noMatches = document.getElementById('noMatches');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.currentFilter = 'all';
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.loadMatches();
        
        // Filter buttons
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.filterMatches();
            });
        });
    }
    
    async loadMatches() {
        this.showLoading();
        
        const token = localStorage.getItem('token');
        const result = await api.resume.analyze(token);
        
        this.hideLoading();
        
        if (result.success) {
            this.matches = result.data.matches;
            if (this.matches.length > 0) {
                this.displayMatches(this.matches);
            } else {
                this.showNoMatches();
            }
        } else {
            this.showError(result.error);
        }
    }
    
    displayMatches(matches) {
        this.container.style.display = 'block';
        this.noMatches.style.display = 'none';
        
        const filteredMatches = this.filterMatchesByScore(matches);
        
        this.container.innerHTML = filteredMatches.map(match => this.createMatchCard(match)).join('');
        
        // Add event listeners to apply buttons
        document.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.dataset.jobId;
                this.applyForJob(jobId);
            });
        });
        
        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const jobId = e.target.dataset.jobId;
                this.showJobDetails(jobId);
            });
        });
    }
    
    createMatchCard(match) {
        const job = match.job;
        const score = match.match_percentage;
        const scoreClass = score >= 80 ? 'score-high' : (score >= 50 ? 'score-medium' : 'score-low');
        
        return `
            <div class="match-card">
                <div class="match-header">
                    <div>
                        <h3 class="match-title">${job.title}</h3>
                        <p class="match-company">${job.company}</p>
                    </div>
                    <div class="match-score">
                        <div class="score-percentage ${scoreClass}">${score}%</div>
                        <div class="score-label">Match</div>
                    </div>
                </div>
                
                <div class="match-details">
                    <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                    <span><i class="fas fa-clock"></i> ${job.employment_type}</span>
                    <span><i class="fas fa-briefcase"></i> ${job.required_experience_years}+ years</span>
                </div>
                
                <div class="match-progress">
                    <div class="progress-label">
                        <span>Skills Match</span>
                        <span>${match.skill_analysis.skill_match_percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${match.skill_analysis.skill_match_percentage}%"></div>
                    </div>
                </div>
                
                <div class="skills-section">
                    <h4 class="skills-title">Skills Analysis</h4>
                    <div class="skills-grid">
                        <div>
                            <div class="skills-list">
                                ${match.skill_analysis.matched_skills.map(skill => 
                                    `<span class="skill-matched">${skill}</span>`
                                ).join('')}
                            </div>
                        </div>
                        <div>
                            <div class="skills-list">
                                ${match.skill_analysis.missing_skills.map(skill => 
                                    `<span class="skill-missing">${skill}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${match.skill_analysis.suggestions.length > 0 ? `
                    <div class="suggestions-box">
                        <h4><i class="fas fa-lightbulb"></i> Improvement Suggestions</h4>
                        <p>${match.skill_analysis.suggestions[0]}</p>
                    </div>
                ` : ''}
                
                <div class="match-actions">
                    <button class="btn btn-outline view-details-btn" data-job-id="${job._id}">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary apply-btn" data-job-id="${job._id}">
                        <i class="fas fa-paper-plane"></i> Apply Now
                    </button>
                </div>
            </div>
        `;
    }
    
    filterMatchesByScore(matches) {
        switch(this.currentFilter) {
            case 'high':
                return matches.filter(m => m.match_percentage >= 80);
            case 'medium':
                return matches.filter(m => m.match_percentage >= 50 && m.match_percentage < 80);
            case 'low':
                return matches.filter(m => m.match_percentage < 50);
            default:
                return matches;
        }
    }
    
    filterMatches() {
        if (!this.matches) return;
        const filtered = this.filterMatchesByScore(this.matches);
        this.displayMatches(filtered);
    }
    
    async applyForJob(jobId) {
        if (!confirm('Are you sure you want to apply for this job?')) {
            return;
        }
        
        const token = localStorage.getItem('token');
        const result = await api.resume.apply(jobId, token);
        
        if (result.success) {
            alert('Application submitted successfully!');
            
            // Update button state
            const btn = document.querySelector(`.apply-btn[data-job-id="${jobId}"]`);
            if (btn) {
                btn.textContent = 'Applied';
                btn.disabled = true;
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            }
        } else {
            alert('Failed to apply: ' + result.error);
        }
    }
    
    async showJobDetails(jobId) {
        const token = localStorage.getItem('token');
        const result = await api.jobs.getById(jobId);
        
        if (result.success) {
            const modal = document.getElementById('jobModal');
            const jobDetails = document.getElementById('jobDetails');
            
            jobDetails.innerHTML = this.createJobDetailsHTML(result.data);
            modal.classList.add('active');
            
            // Close modal
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            // Click outside to close
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }
    
    createJobDetailsHTML(job) {
        return `
            <h2>${job.title}</h2>
            <p class="company">${job.company}</p>
            
            <div class="job-meta">
                <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                <p><i class="fas fa-clock"></i> ${job.employment_type}</p>
                <p><i class="fas fa-money-bill"></i> $${job.salary_min} - $${job.salary_max}</p>
            </div>
            
            <h3>Job Description</h3>
            <p>${job.description}</p>
            
            <h3>Required Skills</h3>
            <div class="skills-list">
                ${job.required_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            
            <h3>Requirements</h3>
            <ul>
                <li>Experience: ${job.required_experience_years}+ years</li>
                <li>Education: ${job.required_education || 'Not specified'}</li>
            </ul>
        `;
    }
    
    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.container.style.display = 'none';
        this.errorMessage.style.display = 'none';
        this.noMatches.style.display = 'none';
    }
    
    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.container.style.display = 'none';
        this.noMatches.style.display = 'none';
    }
    
    showNoMatches() {
        this.noMatches.style.display = 'block';
        this.container.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
}

// Applications Handler
class ApplicationsManager {
    constructor() {
        this.container = document.getElementById('applicationsContainer');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        this.loadApplications();
    }
    
    async loadApplications() {
        this.showLoading();
        
        const token = localStorage.getItem('token');
        const result = await api.resume.getApplications(token);
        
        this.hideLoading();
        
        if (result.success) {
            this.displayApplications(result.data);
        } else {
            this.showError(result.error);
        }
    }
    
    displayApplications(applications) {
        if (applications.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>No Applications Yet</h3>
                    <p>Start applying for jobs to see your applications here.</p>
                    <a href="job-matches.html" class="btn btn-primary">Find Jobs</a>
                </div>
            `;
            return;
        }
        
        this.container.innerHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Applied Date</th>
                            <th>Match Score</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applications.map(app => this.createApplicationRow(app)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    createApplicationRow(app) {
        const date = new Date(app.applied_at).toLocaleDateString();
        const statusClass = `status-${app.status}`;
        
        return `
            <tr>
                <td>${app.job_details?.title || 'N/A'}</td>
                <td>${app.job_details?.company || 'N/A'}</td>
                <td>${date}</td>
                <td>
                    <span class="${app.match_score?.overall_score >= 80 ? 'score-high' : 
                                  app.match_score?.overall_score >= 50 ? 'score-medium' : 'score-low'}">
                        ${app.match_score?.overall_score || 0}%
                    </span>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${app.status}</span>
                </td>
                <td>
                    <button class="action-btn view" onclick="viewApplication('${app._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }
    
    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.container.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
    
    hideLoading() {
        this.loadingSpinner.style.display = 'none';
        this.container.style.display = 'block';
    }
    
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.container.style.display = 'none';
    }
}

// Initialize modules when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }
    
    // Initialize resume uploader
    new ResumeUploader();
    
    // Initialize job matches
    new JobMatches();
    
    // Initialize applications
    new ApplicationsManager();
    
    // Sidebar toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }
    
    // User profile dropdown
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            // Toggle dropdown
        });
    }
});