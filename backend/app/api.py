import os
import requests
from flask import Flask, jsonify
from dotenv import load_dotenv
from app.constants import STRONG_API_BASE_URL, JSON_FILE_PATH

load_dotenv()
import json

def get_auth(email, password):
    """Fetches the access token from the Strong App API."""
    if not email or not password:
        print("❌ Missing email or password.")
        return {"error": "Email and password are required."}

    try:
        print("🔑 Requesting new access token...")
        response = requests.post(
            f"{STRONG_API_BASE_URL}/auth/login",
            json={"usernameOrEmail": email, "password": password},
            headers={
                "Content-Type": "application/json",
                "accept-encoding": "gzip, deflate, br",
                "x-client-platform": "ios",
                "accept-language": "en-US,en;q=0.9",
                "User-Agent": "Strong iOS",
            },
        )

        if response.status_code == 200:
            auth_data = response.json()
            if auth_data.get("accessToken"):
                print("✅ Access token retrieved successfully.")
                return {
                    "access_token": auth_data["accessToken"],
                    "refresh_token": auth_data.get("refreshToken"),
                    "user_id": auth_data["userId"],
                }
            else:
                print("❌ Access token missing in response.")
                return {"error": "Access token missing in response."}
        else:
            print(f"❌ Invalid credentials: {response.text}")
            return {"error": "Invalid credentials."}

    except requests.RequestException as e:
        print(f"❌ Request failed: {e}")
        return {"error": "Failed to connect to Strong API."}
    
def refresh_auth_token(access_token, refresh_token):
    """Refreshes the access token using the provided refresh token."""
    try:
        print("🔄 Refreshing access token...")
        response = requests.post(
            f"{STRONG_API_BASE_URL}/auth/login/refresh",
            json={"accessToken": access_token, "refreshToken": refresh_token},
            headers={
                "Content-Type": "application/json",
                "accept-encoding": "gzip, deflate, br",
                "x-client-platform": "ios",
                "accept-language": "en-US,en;q=0.9",
                "User-Agent": "Strong iOS",
            },
        )

        if response.status_code == 200:
            refreshed_data = response.json()
            print("✅ Access token refreshed successfully.")
            return {
                "access_token": refreshed_data["accessToken"],
                "refresh_token": refreshed_data.get("refreshToken"),
            }
        else:
            print(f"❌ Failed to refresh token: {response.status_code} - {response.text}")
            return None

    except requests.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None
    
def get_data():
    """Fetches all the data from Strong App API."""
    auth_data = get_auth()
    access_token = auth_data['access_token']
    user_id= auth_data['user_id']
    if not auth_data:
        print("❌ No access token. Aborting data fetch.")
        return
    
    url = f"https://back.strong.app/api/users/{user_id}/?continuation=&limit=300&include=template&include=log&include=measurement&include=widget&include=tag&include=folder&include=metric&include=measuredValue"

    payload = ""
    headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'accept-encoding': 'gzip, deflate, br',
    'x-client-platform': 'ios',
    'accept-language': 'en-US,en;q=0.9',
    'User-Agent': 'Strong iOS',
    'Authorization': 'Bearer ' + access_token
    }
    try:
        response = requests.get(url, headers=headers, data=payload)
        if response.status_code == 200:
            print("✅ Data fetched successfully.")
            try:
                with open(JSON_FILE_PATH, "w") as file:
                    json.dump(response.json(), file, indent=4)
                print(f"✅ Data saved at {JSON_FILE_PATH}")
                return {"status": "success", "message": "Data fetched and saved successfully."}
                return                 
            except Exception as e:
                print(f"❌ Failed to save data.json: {e}")
                return {"status": "error", "message": f"Failed to save data: {e}"}
        else:
            print(f"❌ Failed to fetch data. Status: {response.status_code} - {response.text}")
            return {"status": "error", "message": f"Failed to fetch data. Status: {response.status_code}"}

    except requests.RequestException as e:
        print(f"❌ Request failed: {e}")
        return {"status": "error", "message": f"Request failed: {e}"}

if __name__ == "__main__":
    get_data()