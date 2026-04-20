// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Service
const api = {
    // Auth endpoints
    auth: {
        login: async (email, password) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Login failed');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        register: async (userData) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Registration failed');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        getProfile: async (token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to get profile');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        changePassword: async (currentPassword, newPassword, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to change password');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },
    
    // Jobs endpoints
    jobs: {
        getAll: async (filters = {}) => {
            try {
                const queryParams = new URLSearchParams(filters).toString();
                const url = `${API_BASE_URL}/jobs${queryParams ? '?' + queryParams : ''}`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch jobs');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        getById: async (jobId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch job');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        create: async (jobData, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/jobs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create job');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        update: async (jobId, jobData, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData)
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to update job');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        delete: async (jobId, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete job');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },
    
    // Resume endpoints
    resume: {
        upload: async (file, token, onProgress) => {
            try {
                const formData = new FormData();
                formData.append('resume', file);
                
                const xhr = new XMLHttpRequest();
                
                const promise = new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable && onProgress) {
                            const percentComplete = Math.round((e.loaded * 100) / e.total);
                            onProgress(percentComplete);
                        }
                    });
                    
                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.responseText));
                        } else {
                            reject(new Error(JSON.parse(xhr.responseText).error || 'Upload failed'));
                        }
                    });
                    
                    xhr.addEventListener('error', () => {
                        reject(new Error('Network error'));
                    });
                    
                    xhr.open('POST', `${API_BASE_URL}/resume/upload`);
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(formData);
                });
                
                const data = await promise;
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        analyze: async (token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Analysis failed');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        apply: async (jobId, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/apply/${jobId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Application failed');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        getApplications: async (token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/resume/applications`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch applications');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },
    
    // Recruiter endpoints
    recruiter: {
        getJobs: async (token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/recruiter/jobs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch jobs');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        getApplications: async (jobId, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/recruiter/jobs/${jobId}/applications`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch applications');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        updateApplicationStatus: async (applicationId, status, notes, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/recruiter/applications/${applicationId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status, notes })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to update status');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        getTopCandidates: async (token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/recruiter/applications/top-candidates`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch top candidates');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    },
    
    // Admin endpoints
    admin: {
        getUsers: async (token, page = 1, role = null) => {
            try {
                let url = `${API_BASE_URL}/admin/users?page=${page}`;
                if (role) url += `&role=${role}`;
                
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch users');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        deleteUser: async (userId, token) => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete user');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },
        
        getAnalytics: async (token, days = 30) => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/analytics?days=${days}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch analytics');
                }
                
                return { success: true, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    }
};