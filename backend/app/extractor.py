from app.constants import JSON_FILE_PATH, DATA_DIR
from app.api import get_data
from collections import defaultdict

import pandas as pd
import json
import csv
import os

def load_json_data_local():
    # Check if the file exists
    if not os.path.exists(JSON_FILE_PATH):
        print("data.json does not exist. Fetching data...")
        result = get_data()
        if result.get("status") != "success":
            raise Exception("Failed to fetch data. Cannot proceed.")
    
    # Check if the file is empty
    if os.path.getsize(JSON_FILE_PATH) == 0:
        print("data.json is empty. Fetching data...")
        result = get_data()
        if result.get("status") != "success":
            raise Exception("Failed to fetch data. Cannot proceed.")

    # Load JSON data
    print("Loading data from:", JSON_FILE_PATH)
    try:
        with open(JSON_FILE_PATH, "r") as file:
            data = json.load(file)
    except json.JSONDecodeError:
        raise Exception("Failed to parse data.json. The file might be corrupted.")

    return data

def extract_data(data):
    print("Extracting data...")
    workout_logs = data['_embedded']['log']
    exercises = data['_embedded']['measurement']
    weight = data['_embedded']['measuredValue']
    tags = data['_embedded']['tag']
    print("length of workout_logs: ", len(workout_logs))
    print("length of exercises: ", len(exercises))
    print("length of weight: ", len(weight))
    return workout_logs, exercises, weight

def extract_exercises(exercises):
    exercise_dict = {}
    for exercise in exercises:
        tag = None
        if "tag" in exercise["_links"]:
            tag = exercise["_links"]["tag"][0]["href"].split("/")[-1]
        name = exercise["name"]["en"]
        id = exercise["id"]
        exercise_dict[id] = {"tag": tag, "name": name}
    # save to json file
    # with open("exercises.json", "w") as file:
    #     json.dump(exercise_dict, file, indent=4)
    return exercise_dict

def extract_workout_logs(exercise_id, exercise_dict, logs):
    exercise_data = []
    # Goal is to extract all data for a specific exercise into csv file
    for workout in logs:
        if workout['logType'] == "WORKOUT":
            if "isHidden" in workout and workout["isHidden"]:
                continue
            timestamp = workout['startDate']
            for sets in workout['_embedded']['cellSetGroup']:
                if "measurement" not in sets['_links']:
                    continue
                exercise_id_local = sets['_links']['measurement']['href'].split("/")[-1]
                if exercise_id_local == exercise_id:
                    for set in sets['cellSets']:
                        weight, reps = None, None
                        for cell in set['cells']:
                            if "isHidden" in cell and cell["isHidden"]:
                                continue
                            if cell['cellType'] == "BARBELL_WEIGHT":
                                weight = float(cell['value'])
                                # convert weight to Lbs
                                weight *= 2.20462
                            elif cell['cellType'] == "REPS":
                                reps = cell['value']
                        # Ensure both weight and reps exist before storing
                        if weight is not None and reps is not None:
                            exercise_data.append([timestamp, weight, reps])
    
    exercise_data.sort(key=lambda x: x[0])
    
    # Save to CSV file
    file_name = os.path.join(DATA_DIR, f"{(exercise_dict[exercise_id]['name']).strip()}.csv")
    with open(file_name, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "weight", "reps"])  # CSV Headers
        writer.writerows(exercise_data)  # Write extracted workout data
            
    return exercise_data

def extract_bodyweight_logs(bodyweight):
    print("Extracting bodyweight logs...")
    bodyweight_data = []
    for weight in bodyweight:
        if "isHidden" in weight and weight["isHidden"]:
            continue
        if weight['measurementTypeValue'] == "WEIGHT":
            timestamp = weight['startDate']
            value = weight['value']
            # convert weight to Lbs
            value *= 2.20462
            bodyweight_data.append([timestamp, value])

    file_path = os.path.join(DATA_DIR, "Bodyweight.csv")
    with open(file_path, "w", newline="") as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "weight"])  # CSV Headers
        writer.writerows(bodyweight_data)

def calculate_weekly_volume(exercise_dict, logs):
    """
    Calculates weekly volume for muscle groups
    """
    all_volumes = []
    for workout in logs:
        if workout['logType'] == "WORKOUT":
            if "isHidden" in workout and workout["isHidden"]:
                continue
            timestamp = workout['startDate']
            volume = defaultdict(int)
            for sets in workout['_embedded']['cellSetGroup']:
                if "measurement" not in sets['_links']:
                    continue
                exercise_id_local = sets['_links']['measurement']['href'].split("/")[-1]
                tag = exercise_dict[exercise_id_local]["tag"]
                
                if not tag:
                    continue
                
                for set in sets['cellSets']:
                    if set.get("cellSetTag") == "WARM_UP" or set.get("isHidden", False):
                        continue
                    volume[tag] += 1

            if volume:
                all_volumes.append({'timestamp': timestamp, **volume})        
    
      # Convert to DataFrame
    df = pd.DataFrame(all_volumes)

    # Convert 'timestamp' to datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')

    # Drop rows with invalid timestamps
    df = df.dropna(subset=['timestamp'])

    # Sort by timestamp
    df = df.sort_values(by='timestamp')

    # Set 'timestamp' as index
    df.set_index('timestamp', inplace=True)

    # Resample data by week and sum the sets for each muscle group
    weekly_volume_df = df.resample('W').sum().fillna(0)
    
    output_path = os.path.join(DATA_DIR, 'Weekly_volume.csv')
    weekly_volume_df.to_csv(output_path)  
    

def main():
    data_local = load_json_data_local()
    workout_logs, exercises, bodyweight = extract_data(data_local)
    exercise_dict  = extract_exercises(exercises)
    extract_workout_logs('ca9ee259-a69f-4839-bbf9-46ba8cf0d7d6', exercise_dict, workout_logs)
    extract_workout_logs('b748103d-3014-4cae-a349-cec433528c3a', exercise_dict, workout_logs)
    extract_workout_logs('b2f5a2de-c684-4e94-a6e5-581e0695fcac', exercise_dict, workout_logs)
    extract_workout_logs('5974b925-ff0f-40de-9385-e6ccac763ddd', exercise_dict, workout_logs)
    calculate_weekly_volume(exercise_dict, workout_logs)
    extract_bodyweight_logs(bodyweight)
    