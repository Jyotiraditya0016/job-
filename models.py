from datetime import datetime
from bson import ObjectId
from flask_bcrypt import Bcrypt
from database import db

bcrypt = Bcrypt()

class User:
    collection = db.users
    
    @staticmethod
    def create(user_data):
        """Create a new user"""
        # Hash password
        if 'password' in user_data:
            user_data['password'] = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
        
        # Add timestamps
        user_data['created_at'] = datetime.utcnow()
        user_data['updated_at'] = datetime.utcnow()
        user_data['is_active'] = True
        user_data['profile_complete'] = False
        
        # Insert user
        result = User.collection.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        return User.collection.find_one({'email': email})
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        try:
            return User.collection.find_one({'_id': ObjectId(user_id)})
        except:
            return None
    
    @staticmethod
    def update(user_id, update_data):
        """Update user information"""
        update_data['updated_at'] = datetime.utcnow()
        return User.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify password"""
        return bcrypt.check_password_hash(stored_password, provided_password)

class Job:
    collection = db.jobs
    
    @staticmethod
    def create(job_data):
        """Create a new job posting"""
        job_data['created_at'] = datetime.utcnow()
        job_data['updated_at'] = datetime.utcnow()
        job_data['status'] = 'active'
        job_data['views'] = 0
        job_data['applications_count'] = 0
        
        result = Job.collection.insert_one(job_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_recruiter(recruiter_id):
        """Find all jobs by recruiter"""
        return list(Job.collection.find(
            {'recruiter_id': recruiter_id}
        ).sort('created_at', -1))
    
    @staticmethod
    def find_active(filters=None):
        """Find all active jobs"""
        query = {'status': 'active'}
        if filters:
            query.update(filters)
        return list(Job.collection.find(query).sort('created_at', -1))
    
    @staticmethod
    def find_by_id(job_id):
        """Find job by ID"""
        try:
            return Job.collection.find_one({'_id': ObjectId(job_id)})
        except:
            return None
    
    @staticmethod
    def update(job_id, update_data):
        """Update job information"""
        update_data['updated_at'] = datetime.utcnow()
        return Job.collection.update_one(
            {'_id': ObjectId(job_id)},
            {'$set': update_data}
        )
    
    @staticmethod
    def delete(job_id):
        """Delete a job"""
        return Job.collection.delete_one({'_id': ObjectId(job_id)})

class Application:
    collection = db.applications
    
    @staticmethod
    def create(application_data):
        """Create a new application"""
        application_data['applied_at'] = datetime.utcnow()
        application_data['updated_at'] = datetime.utcnow()
        application_data['status'] = 'pending'
        application_data['notes'] = []
        
        result = Application.collection.insert_one(application_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_user(user_id):
        """Find all applications by user"""
        pipeline = [
            {'$match': {'user_id': user_id}},
            {'$lookup': {
                'from': 'jobs',
                'localField': 'job_id',
                'foreignField': '_id',
                'as': 'job_details'
            }},
            {'$unwind': '$job_details'},
            {'$sort': {'applied_at': -1}}
        ]
        return list(Application.collection.aggregate(pipeline))
    
    @staticmethod
    def find_by_job(job_id):
        """Find all applications for a job"""
        pipeline = [
            {'$match': {'job_id': job_id}},
            {'$lookup': {
                'from': 'users',
                'localField': 'user_id',
                'foreignField': '_id',
                'as': 'user_details'
            }},
            {'$unwind': '$user_details'},
            {'$lookup': {
                'from': 'resumes',
                'localField': 'user_id',
                'foreignField': 'user_id',
                'as': 'resume_details'
            }},
            {'$sort': {'match_score.overall_score': -1}}
        ]
        return list(Application.collection.aggregate(pipeline))
    
    @staticmethod
    def update_status(application_id, status, notes=None):
        """Update application status"""
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow()
        }
        if notes:
            update_data['notes'] = notes
        
        return Application.collection.update_one(
            {'_id': ObjectId(application_id)},
            {'$set': update_data}
        )
    
    @staticmethod
    def check_exists(user_id, job_id):
        """Check if application already exists"""
        return Application.collection.find_one({
            'user_id': user_id,
            'job_id': job_id
        })

class Resume:
    collection = db.resumes
    
    @staticmethod
    def create(resume_data):
        """Create a new resume entry"""
        resume_data['uploaded_at'] = datetime.utcnow()
        resume_data['updated_at'] = datetime.utcnow()
        
        result = Resume.collection.insert_one(resume_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_user(user_id):
        """Find resume by user ID"""
        return Resume.collection.find_one({'user_id': user_id})
    
    @staticmethod
    def update(user_id, update_data):
        """Update resume information"""
        update_data['updated_at'] = datetime.utcnow()
        return Resume.collection.update_one(
            {'user_id': user_id},
            {'$set': update_data},
            upsert=True
        )