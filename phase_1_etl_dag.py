from airflow.decorators import dag, task
from airflow.utils.dates import days_ago
from datetime import datetime, timedelta
import os

# --- DAG Configuration ---

# Get paths from environment variables, with defaults
# These must be set in the Airflow environment
PYTHON_PATH = os.environ.get("APP_PYTHON_PATH", "/opt/airflow/app/src") # Path to our app's src folder
INGEST_SCRIPT_PATH = f"{PYTHON_PATH}/ingest_service/app.py"
TRANSFORM_SCRIPT_PATH = f"{PYTHON_PATH}/processing/batch_transform.py"

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=1),
}

@dag(
    dag_id='phase_1_etl_pipeline',
    default_args=default_args,
    description='10-minute batch ETL for environmental data (Phase 1)',
    schedule_interval=timedelta(minutes=10), # Run every 10 minutes
    start_date=days_ago(0), # Start as soon as possible
    catchup=False, # Don't backfill
    tags=['env-monitoring', 'phase-1'],
)
def phase_1_etl_pipeline():
    """
    This DAG orchestrates the Phase 1 (batch) ETL pipeline.
    It runs two tasks:
    1. Ingest: Calls the ingestion script to fetch API data and save to raw.
    2. Transform: Calls the transformation script to process new raw files.
    """

    @task(
        task_id='run_ingestion',
        doc_md="""
        Runs the Python script to fetch data from OpenWeatherMap and
        AQICN APIs and save the raw JSON files to the raw data layer.
        """
    )
    def run_ingestion_task():
        import subprocess
        
        # We need to run the script using 'python' and pass the
        # required environment variables for the API keys.
        # Ensure the Airflow worker has access to these variables.
        env = os.environ.copy()
        print(f"Running ingestion script: {INGEST_SCRIPT_PATH}")
        
        # We assume the Python environment has 'requests' and 'pydantic' installed.
        result = subprocess.run(
            ['python', INGEST_SCRIPT_PATH],
            capture_output=True,
            text=True,
            env=env,
            check=False # Don't raise error, we'll check returncode
        )
        
        print("Ingestion STDOUT:", result.stdout)
        if result.returncode != 0:
            print("Ingestion STDERR:", result.stderr)
            raise Exception(f"Ingestion script failed with return code {result.returncode}")
        
        print("Ingestion script completed successfully.")

    @task(
        task_id='run_transformation',
        doc_md="""
        Runs the Python script to transform new raw JSON files
        into a curated Parquet dataset.
        """
    )
    def run_transformation_task():
        import subprocess
        
        env = os.environ.copy()
        print(f"Running transformation script: {TRANSFORM_SCRIPT_PATH}")

        # Assumes 'pandas' and 'pyarrow' are installed.
        result = subprocess.run(
            ['python', TRANSFORM_SCRIPT_PATH],
            capture_output=True,
            text=True,
            env=env,
            check=False
        )
        
        print("Transformation STDOUT:", result.stdout)
        if result.returncode != 0:
            print("Transformation STDERR:", result.stderr)
            raise Exception(f"Transformation script failed with return code {result.returncode}")
        
        print("Transformation script completed successfully.")

    # --- Define Task Dependencies ---
    run_ingestion_task() >> run_transformation_task()

# Instantiate the DAG
phase_1_etl_pipeline()
