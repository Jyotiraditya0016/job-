from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from datetime import datetime
import bcrypt
from config import Config

class Database:
    def __init__(self):
        try:
            # Connect to MongoDB
            self.client = MongoClient(Config.MONGO_URI)
            self.db = self.client[Config.MONGO_DB]
            
            # Test connection
            self.client.admin.command('ping')
            print("✅ Connected to MongoDB successfully!")
            print(f"📊 Database: {Config.MONGO_DB}")
            
            # Create indexes
            self.create_indexes()
            
        except ConnectionFailure as e:
            print(f"❌ MongoDB connection failed: {e}")
            print("Please make sure MongoDB is running (mongod)")
            raise e
    
    def create_indexes(self):
        # Users collection indexes
        self.db.users.create_index('email', unique=True)
        self.db.users.create_index('username', unique=True, sparse=True)
        
        # Jobs collection indexes
        self.db.jobs.create_index('recruiter_id')
        self.db.jobs.create_index([('title', 'text'), ('description', 'text')])
        self.db.jobs.create_index('status')
        self.db.jobs.create_index('created_at')
        
        # Applications collection indexes
        self.db.applications.create_index([('user_id', 1), ('job_id', 1)], unique=True)
        self.db.applications.create_index('status')
        self.db.applications.create_index('applied_at')
        
        # Resumes collection indexes
        self.db.resumes.create_index('user_id', unique=True)
        
        print("✅ Database indexes created successfully")

# Create database instance
try:
    db = Database().db
    print("✅ Database ready to use")
except Exception as e:
    print(f"❌ Failed to initialize database: {e}")
    db = None