from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
import re
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6 or len(password) > 16:
        return False, "Password must be between 6 and 16 characters"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Check if user already exists
        existing_user = User.find_by_email(data['email'])
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Prepare user data
        user_data = {
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'email': data['email'],
            'password': data['password'],
            'role': data['role'],
            'phone': data.get('phone', ''),
            'created_at': datetime.utcnow()
        }
        
        # Add recruiter-specific fields
        if data['role'] == 'recruiter':
            if 'company' not in data or not data['company']:
                return jsonify({'error': 'Company name required for recruiters'}), 400
            user_data['company'] = data['company']
            user_data['company_verified'] = False
        
        # Create user
        user_id = User.create(user_data)
        
        # Create access token
        access_token = create_access_token(identity=str(user_id))
        
        # Get user without password
        user = User.find_by_id(user_id)
        if user:
            user.pop('password', None)
            user['_id'] = str(user['_id'])
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': user
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.find_by_email(data['email'])
        
        if not user or not User.verify_password(user['password'], data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 403
        
        # Update last login
        User.update(user['_id'], {'last_login': datetime.utcnow()})
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        # Remove password from response
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        
        return jsonify(user), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500