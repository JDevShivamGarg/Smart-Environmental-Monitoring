import os
import json
import time
import requests
from datetime import datetime, timezone
from pathlib import Path
from pydantic import ValidationError
from typing import List, Dict, Any

# Import our validation models
from validation import OpenWeatherResponse, AQICNResponse, CombinedIngestionModel

# --- Configuration ---
# In a real app, these would come from env variables or a config file
OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "YOUR_API_KEY")
AQICN_API_KEY = os.environ.get("AQICN_API_KEY", "YOUR_API_KEY")

CITIES = {
    "Delhi": {"lat": 28.7041, "lon": 77.1025},
    "Mumbai": {"lat": 19.0760, "lon": 72.8777},
    "Bengaluru": {"lat": 12.9716, "lon": 77.5946}
}

# Phase 1: Write to local filesystem (simulating S3)
# The Airflow DAG will look for files here
RAW_DATA_PATH = Path(os.environ.get("RAW_DATA_PATH", "./data/raw"))
RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)

# --- API Clients ---

def get_openweather_data(city: str, lat: float, lon: float) -> dict:
    """Returns dummy weather data."""
    return {
        "coord": {"lon": lon, "lat": lat, "city": city},
        "weather": [{"id": 800, "main": "Clear", "description": "clear sky", "icon": "01d"}],
        "base": "stations",
        "main": {"temp": 25, "feels_like": 26, "temp_min": 24, "temp_max": 26, "pressure": 1012, "humidity": 50},
        "visibility": 10000,
        "wind": {"speed": 1.5, "deg": 360},
        "clouds": {"all": 0},
        "dt": int(time.time()),
        "sys": {"type": 1, "id": 9027, "country": "IN", "sunrise": 1609459642, "sunset": 1609500000},
        "timezone": 19800,
        "id": 1273294,
        "name": city,
        "cod": 200
    }

def get_aqicn_data(city: str, lat: float, lon: float) -> dict:
    """Returns dummy air quality data."""
    return {
        "status": "ok",
        "data": {
            "aqi": 150,
            "idx": 12345,
            "attributions": [],
            "city": {"geo": [lat, lon], "name": city, "url": ""},
            "dominentpol": "pm25",
            "iaqi": {},
            "time": {"s": "2025-11-02 10:00:00", "tz": "+05:30", "v": int(time.time())},
            "forecast": {}
        }
    }

# --- Normalization & Validation ---

def normalize_data(raw_weather: dict, raw_aqi: dict) -> dict:
    """
    Validates raw API responses and transforms them into our
    single, unified CombinedIngestionModel.
    """
    try:
        # 1. Validate raw responses
        weather = OpenWeatherResponse(**raw_weather)
        aqi = AQICNResponse(**raw_aqi)

        # 2. Combine and normalize into our target schema
        combined_data = CombinedIngestionModel(
            source_api="OpenWeather+AQICN",
            city=weather.name,
            lat=weather.coord.lat,
            lon=weather.coord.lon,
            temperature_celsius=weather.main.temp,
            feels_like_celsius=weather.main.feels_like,
            pressure_hpa=weather.main.pressure,
            humidity_percent=weather.main.humidity,
            wind_speed_ms=weather.wind.speed,
            wind_direction_deg=weather.wind.deg,
            aqi=aqi.data.aqi,
            dominant_pollutant=aqi.data.dominentpol,
            api_timestamp=datetime.fromtimestamp(weather.dt, tz=timezone.utc)
        )
        
        # Return as a dictionary, ready for JSON serialization
        return combined_data.model_dump(mode="json")

    except ValidationError as e:
        print(f"Data validation error for {raw_weather.get('name', 'Unknown')}: {e}")
        return None
    except Exception as e:
        print(f"Error normalizing data: {e}")
        return None

# --- Main Execution ---

def run_ingestion():
    """
    Main ingestion loop. Fetches data for all cities,
    normalizes it, and saves it to the raw data path.
    This function will be triggered by Airflow.
    """
    print(f"Starting ingestion run at {datetime.utcnow()} UTC...")
    all_data: List[Dict[str, Any]] = []

    for city, coords in CITIES.items():
        print(f"Fetching data for {city}...")
        raw_weather = get_openweather_data(city, **coords)
        raw_aqi = get_aqicn_data(city, **coords)

        if raw_weather and raw_aqi:
            normalized_data = normalize_data(raw_weather, raw_aqi)
            if normalized_data:
                all_data.append(normalized_data)
        
        time.sleep(1) # Small delay to avoid hammering APIs

    if not all_data:
        print("No data collected in this run.")
        return

    # Phase 1: Save to a timestamped JSON file in the raw directory
    # This simulates writing to s3://.../raw/YYYY-MM-DD/HH-MM-SS.json
    run_timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H-%M-%S')
    output_filename = f"ingestion_run_{run_timestamp}.json"
    output_path = RAW_DATA_PATH / output_filename

    try:
        with open(output_path, 'w') as f:
            json.dump(all_data, f, indent=2)
        print(f"Successfully saved raw data to {output_path}")
    except IOError as e:
        print(f"Error writing raw data to file: {e}")

if __name__ == "__main__":
    # This allows us to run the script manually for testing
    if "YOUR_API_KEY" in [OPENWEATHER_API_KEY, AQICN_API_KEY]:
        print("="*50)
        print("WARNING: API keys not set.")
        print("Please set OPENWEATHER_API_KEY and AQICN_API_KEY env variables.")
        print("="*50)
    
    run_ingestion()
