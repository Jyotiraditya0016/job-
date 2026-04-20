from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
import os

from config import Config
from auth import auth_bp

# Initialize Flask app
app = Flask(__name__, 
            static_folder='../frontend', 
            static_url_path='')
app.config.from_object(Config)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Test route
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({'message': 'API is working!'})

# Serve frontend
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_frontend(path):
    file_path = os.path.join(app.static_folder, path)
    if os.path.exists(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("🚀 Starting AI Job Portal Server...")
    print(f"📍 Frontend: http://localhost:5000")
    print(f"📍 API: http://localhost:5000/api")
    print("Press Ctrl+C to stop")
    app.run(debug=True, host='0.0.0.0', port=5000)