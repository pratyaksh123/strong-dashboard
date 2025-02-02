from flask import Blueprint, jsonify, request
from app.utils import read_csv
from app.extractor import main
from app.constants import (
    BENCH_PRESS_PATH,
    DEADLIFT_PATH,
    SQUAT_PATH,
    OVERHEAD_PRESS_PATH,
    BODYWEIGHT_PATH,
    WEEKLY_VOLUME_PATH
)

from app.api import get_data, get_auth, refresh_auth_token

api = Blueprint("api", __name__)

@api.route("/", methods=["GET"])
def home():
    """Root route that returns a greeting."""
    return "Welcome to the Workout Data API!"

@api.route("/refresh_data", methods=["GET"])
def refresh_data():
    """Refreshes the data.json"""
    result = get_data()
    return jsonify(result)

@api.route("/fetch_data", methods=["GET"])
def fetch_data():
    """Fetches workout data from extracted CSVs and returns JSON."""
    main()  # Runs the extractor script

    data = {
        "bench_press": read_csv(BENCH_PRESS_PATH) or [],
        "deadlift": read_csv(DEADLIFT_PATH) or [],
        "squat": read_csv(SQUAT_PATH) or [],
        "overhead_press": read_csv(OVERHEAD_PRESS_PATH) or [],
        "weekly_volume": read_csv(WEEKLY_VOLUME_PATH) or [],
        "bodyweight": read_csv(BODYWEIGHT_PATH) or [],
    }

    return jsonify(data)

@api.route("/get_access_token", methods=["POST"])
def get_access_token():
    """Gets the access token using provided credentials."""
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    auth_data = get_auth(email, password)

    if auth_data.get("error"):
        return jsonify({"error": auth_data["error"]}), 401
    else:
        return jsonify(auth_data), 200

@api.route("/refresh_token", methods=["POST"])
def refresh_token():
    """Refreshes the access token using the refresh token."""
    data = request.get_json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")

    if not refresh_token:
        return jsonify({"error": "Refresh token is required."}), 400

    refreshed_data = refresh_auth_token(access_token, refresh_token)
    if refreshed_data:
        return jsonify(refreshed_data)
    else:
        return jsonify({"error": "Failed to refresh access token."}), 401