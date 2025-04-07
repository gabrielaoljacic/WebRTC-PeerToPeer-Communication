import os
import requests
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend can access this API

# Load your secret key and domain from the .env file
METERED_SECRET_KEY = os.environ.get("METERED_SECRET_KEY")
METERED_DOMAIN = os.environ.get("METERED_DOMAIN")


# API: Create a meeting room
@app.route("/api/create/room", methods=['POST'])
def create_room():
    r = requests.post(f"https://{METERED_DOMAIN}/api/v1/room?secretKey={METERED_SECRET_KEY}")
    return r.json()


# API: Validate a meeting room by roomName
@app.route("/api/validate-meeting")
def validate_meeting():
    roomName = request.args.get("roomName")
    if roomName:
        r = requests.get(f"https://{METERED_DOMAIN}/api/v1/room/{roomName}?secretKey={METERED_SECRET_KEY}")
        data = r.json()
        if data.get("roomName"):
            return {"roomFound": True}
        else:
            return {"roomFound": False}
    else:
        return {
            "success": False,
            "message": "Please specify roomName"
        }


# API: Return Metered Domain
@app.route("/api/metered-domain")
def get_metered_domain():
    return {"METERED_DOMAIN": METERED_DOMAIN}


# Root endpoint
@app.route("/")
def index():
    return "Backend"
