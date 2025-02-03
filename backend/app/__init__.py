from flask import Flask
from app.routes import api
import firebase_admin
from firebase_admin import credentials, firestore
from app.constants import FIREBASE_ADMIN_PATH

import os

def create_app():
    app = Flask(__name__)
    app.register_blueprint(api)
    
    # Initialize Firebase Admin SDK
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_ADMIN_PATH)  # Replace with your JSON key file path

        # Use emulator if in development
        if os.getenv('FLASK_ENV') == 'development':
            os.environ["FIRESTORE_EMULATOR_HOST"] = "localhost:8080"
            
        firebase_admin.initialize_app(cred)
        
    # Initialize Firestore DB
    app.db = firestore.client()
    
    return app
