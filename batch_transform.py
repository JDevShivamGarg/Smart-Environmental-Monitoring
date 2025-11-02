import os
import pandas as pd
from pathlib import Path
from typing import List
from datetime import datetime

# --- Configuration ---
# Phase 1: Read from local filesystem (simulating S3)
RAW_DATA_PATH = Path(os.environ.get("RAW_DATA_PATH", "./data/raw"))
CURATED_DATA_PATH = Path(os.environ.get("CURATED_DATA_PATH", "./data/curated"))
CURATED_DATA_PATH.mkdir(parents=True, exist_ok=True)

# State file to track processed files
PROCESSED_FILES_LOG = CURATED_DATA_PATH / "_processed_files.log"

def get_new_raw_files() -> List[Path]:
    """
    Finds raw JSON files that have not been processed yet.
    """
    if not PROCESSED_FILES_LOG.exists():
        processed_files = set()
    else:
        with open(PROCESSED_FILES_LOG, 'r') as f:
            processed_files = set(line.strip() for line in f)

    all_raw_files = set(str(p) for p in RAW_DATA_PATH.glob("*.json"))
    new_files = [Path(f) for f in (all_raw_files - processed_files)]
    
    print(f"Found {len(new_files)} new raw files to process.")
    return new_files

def update_processed_log(processed_files: List[Path]):
    """Adds file paths to the processed log."""
    with open(PROCESSED_FILES_LOG, 'a') as f:
        for file_path in processed_files:
            f.write(f"{str(file_path)}\n")

def transform_data(raw_files: List[Path]) -> pd.DataFrame:
    """
    Reads raw JSON files, concatenates them, and performs
    cleaning and transformation using pandas.
    """
    if not raw_files:
        print("No new files to transform.")
        return None

    df_list = []
    for file_path in raw_files:
        try:
            # Each JSON file is a list of records
            df_list.append(pd.read_json(file_path))
        except Exception as e:
            print(f"Error reading {file_path}: {e}. Skipping.")
    
    if not df_list:
        print("No data loaded from new files.")
        return None

    df = pd.concat(df_list, ignore_index=True)

    # --- Transformations ---
    
    # 1. Convert timestamp fields to datetime objects
    df['ingestion_timestamp'] = pd.to_datetime(df['ingestion_timestamp'], utc=True)
    df['api_timestamp'] = pd.to_datetime(df['api_timestamp'], utc=True)

    # 2. Drop any exact duplicates
    df = df.drop_duplicates(subset=['city', 'api_timestamp'])

    # 3. Handle missing data (example: forward fill)
    # This is a simple approach; more complex imputation could go here.
    df = df.sort_values(by=['city', 'api_timestamp'])
    # df['temperature_celsius'] = df.groupby('city')['temperature_celsius'].ffill()
    
    # 4. Feature Engineering Example: Add time-based features
    df['hour_of_day_utc'] = df['api_timestamp'].dt.hour
    df['day_of_week_utc'] = df['api_timestamp'].dt.dayofweek
    
    # 5. Set a proper index for time-series analysis
    df = df.set_index('api_timestamp').sort_index()

    print(f"Transformed {len(df)} total records.")
    return df

def save_curated_data(df: pd.DataFrame):
    """
    Saves the transformed DataFrame to a Parquet file.
    In Phase 1, we just append to a single Parquet file.
    In a "real" S3 setup, we would partition by date.
    """
    output_path = CURATED_DATA_PATH / "environmental_data.parquet"
    
    try:
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            # Read existing data, concatenate, and overwrite
            existing_df = pd.read_parquet(output_path)
            combined_df = pd.concat([existing_df, df])
            combined_df.to_parquet(output_path, engine='pyarrow', index=True)
        else:
            # Create new parquet file
            df.to_parquet(output_path, engine='pyarrow', index=True)
            
        print(f"Successfully saved/appended curated data to {output_path}")
    except Exception as e:
        print(f"Error saving curated data: {e}")


def run_transformation():
    """
    Main transformation function.
    This will be triggered by Airflow after the ingestion task.
    """
    print(f"Starting transformation run at {datetime.utcnow()} UTC...")
    new_files = get_new_raw_files()
    if not new_files:
        return

    df_transformed = transform_data(new_files)

    if df_transformed is not None and not df_transformed.empty:
        save_curated_data(df_transformed)
        update_processed_log(new_files)
    else:
        print("No data was transformed in this run.")

if __name__ == "__main__":
    # This allows us to run the script manually for testing
    run_transformation()
