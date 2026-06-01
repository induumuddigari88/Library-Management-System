import os
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv

from routes.auth import auth_bp

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY", os.urandom(24))

bcrypt = Bcrypt(app)

CORS(app, supports_credentials=True)

app.register_blueprint(auth_bp)

@app.route("/")
def home():
    return {
        "message": "Library Management System API Running"
    }

if __name__ == "__main__":
    app.run(debug=True)