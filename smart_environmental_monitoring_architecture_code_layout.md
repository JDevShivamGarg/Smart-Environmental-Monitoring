# Smart Environmental Monitoring System

**Deliverable:** system architecture diagram, component responsibilities, data flow, infra choices, file layout, and key script skeletons for an advanced portfolio project demonstrating data scientist and data analyst skills.

---

## Objective
Real-time ingestion of environmental and weather data. Fully automated ETL. Analytical layer with forecasting and anomaly detection. Interactive dashboard with geospatial visuals and alerts. Production-ready repo and deployment artifacts.

---

## High-level architecture (Mermaid)

```mermaid
flowchart LR
  subgraph Sources
    A[OpenWeatherMap] -->|REST| Ingest
    B[AQICN] -->|REST| Ingest
    C[Open-Meteo] -->|REST| Ingest
  end

  subgraph Ingestion
    Ingest[Ingest Service (Python)] --> Kafka[Kafka Topic(s)]
  end

  subgraph Processing
    Kafka --> StreamProc[Spark Structured Streaming]
    StreamProc --> DataLake[(S3 raw/curated)]
    StreamProc --> DB[(Postgres / TimescaleDB)]
  end

  subgraph Analytics
    DB --> FeatureStore[Feature Store (MLflow or Feast)]
    FeatureStore --> ModelTrain[Model Training (Airflow)]
    ModelTrain --> ModelRegistry[MLflow Model Registry]
    StreamProc --> RealTimeModels[Serving (FastAPI + Redis cache)]
  end

  subgraph Presentation
    DB --> Dashboard[Streamlit / Plotly Dash / React]
    RealTimeModels --> Dashboard
    AlertsService[Alerts (SMTP / Twilio)] -->|Notifications| Users[Users]
    Dashboard --> Users
  end

  subgraph Orchestration
    Airflow[Airflow] --> Ingest
    Airflow --> StreamProc
    Airflow --> ModelTrain
  end

  DataLake --> Notebook[Exploration Notebooks (Jupyter)]
```
```

---

## Component responsibilities

- **Ingest Service**: Poll APIs (5m default). Normalize JSON. Validate schema. Push messages to Kafka. Implement exponential backoff and rate limit handling.
- **Message Bus (Kafka)**: Buffer, decouple, and enable replays for historical reprocessing.
- **Stream Processing (Spark Structured Streaming)**: Parse, enrich (geo, local timezone), clean (interpolate/mask outliers), and write to S3 (raw/curated) and TimescaleDB/Postgres for time-series queries.
- **Data Lake (S3)**: Immutable raw, partitioned by date/source. Curated parquet for analytics.
- **Database (TimescaleDB/Postgres)**: Time-series optimized storage for dashboard queries and backtests. Add hypertables.
- **Feature Store (Feast or MLflow artifacts)**: Serve features for training and online inference.
- **Orchestration (Airflow)**: DAGs for daily backfills, model retrain, and scheduled dataset refreshes.
- **Model Training**: Forecasting (Prophet and LSTM), Anomaly Detection (IsolationForest or Autoencoder), Clustering (KMeans). Register models to MLflow.
- **Serving**: FastAPI microservice exposing prediction endpoints and health checks. Use Redis for low-latency cache.
- **Dashboard**: Streamlit (quick) or React + FastAPI for production. Map visualization with Mapbox or Folium.
- **Alerts**: Threshold-based rules plus model-based anomalies. Send email/SMS/Slack.
- **Monitoring**: Prometheus + Grafana for infra. Sentry for app errors. Data quality monitors (Great Expectations).

---

## Data flow (step-by-step)

1. Ingest service polls APIs and emits normalized JSON messages to Kafka.
2. Spark Streaming consumes Kafka topics, applies validation and transformations, enriches records, and writes to S3 (raw/curated) and TimescaleDB.
3. Airflow schedules daily aggregation jobs and triggers model retraining when data volume or drift thresholds are met.
4. Models trained in notebooks or training jobs are versioned to MLflow and deployed to model registry.
5. FastAPI serves predictions using the model and reads features from Feature Store or DB.
6. Dashboard queries DB and prediction endpoints to render near-real-time visuals.
7. Alerts service listens to DB or streamed anomaly topic and pushes notifications.

---

## Infra & deployment choices

- **Cloud**: AWS (S3, EKS for k8s, RDS Postgres/Timescale, MSK for Kafka) or managed alternatives (Confluent Cloud, GCP PubSub).
- **Kubernetes**: Deploy StreamProc, FastAPI, and dashboard as k8s deployments. Use Helm charts.
- **CI/CD**: GitHub Actions for lint, unit tests, and image build. Terraform for infra.
- **Secrets**: AWS Secrets Manager or Vault.

---

## Repo file layout

```
env-monitoring/
├─ infra/
│  ├─ terraform/           # terraform modules for infra
│  └─ k8s/                 # helm charts, kustomize
├─ src/
│  ├─ ingest_service/      # polls APIs, publishes to Kafka
│  │  ├─ app.py
│  │  ├─ config.py
│  │  ├─ api_clients.py
│  │  └─ requirements.txt
│  ├─ stream_processing/   # Spark jobs
│  │  ├─ spark_job.py
│  │  ├─ transformations.py
│  │  └─ requirements.txt
│  ├─ models/              # training and model utils
│  │  ├─ train.py
│  │  ├─ features.py
│  │  └─ model_utils.py
│  ├─ serving/             # FastAPI model serving
│  │  ├─ main.py
│  │  ├─ predict.py
│  │  └─ Dockerfile
│  ├─ dashboard/           # Streamlit or React + API
│  │  ├─ streamlit_app.py
│  │  └─ docker-compose.yml
│  └─ alerts/              # notification microservice
│     ├─ alerts.py
│     └─ rules.yaml
├─ notebooks/              # EDA and experiments
├─ tests/
│  ├─ unit/
│  └─ integration/
├─ airflow/
│  ├─ dags/
│  │  ├─ ingest_dag.py
│  │  └─ train_dag.py
│  └─ Dockerfile
├─ mlflow/                 # mlflow tracking config
├─ docs/
│  └─ architecture.md
├─ .github/workflows/
└─ README.md
```

---

## Key scripts (skeletons)

### src/ingest_service/app.py

```python
import time
from api_clients import OpenWeatherClient, AQIClient
from kafka import KafkaProducer
import json

producer = KafkaProducer(bootstrap_servers='kafka:9092')

def normalize_weather(resp):
    # extract fields: timestamp, city, lat, lon, temp, humidity, pressure
    return {}

def run():
    ow = OpenWeatherClient()
    aqi = AQIClient()
    while True:
        for city in ['Delhi','Mumbai','Bengaluru']:
            w = ow.get(city)
            a = aqi.get(city)
            msg = normalize_weather({**w, **a})
            producer.send('env.raw', json.dumps(msg).encode('utf-8'))
        time.sleep(300)

if __name__ == '__main__':
    run()
```

### src/stream_processing/spark_job.py

```python
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName('env-stream').getOrCreate()

df = spark.readStream.format('kafka')... # read topic
# deserialize, cast types, drop nulls
# enrich (city -> region)
# writeStream to parquet (S3) and to JDBC (TimescaleDB)
```

### src/models/train.py

```python
# load curated parquet
# feature engineering: rolling means, lags, weather interactions
# train Prophet and LSTM ensemble
# evaluate and log to MLflow
```

### src/serving/main.py

```python
from fastapi import FastAPI
from predict import load_model, predict
app = FastAPI()
model = load_model()

@app.get('/health')
def health():
    return {'status':'ok'}

@app.post('/predict')
def predict_endpoint(payload: dict):
    features = payload['features']
    return predict(model, features)
```

---

## Tests and validation

- Unit tests for API clients and transformation functions.
- Integration tests for Kafka <-> Spark <-> DB pipeline using Docker Compose.
- Data quality checks using Great Expectations with scheduled runs in Airflow.

---

## Deliverables to include in portfolio

- README with architecture and setup
- Docker Compose for local end-to-end demo
- Airflow DAGs and sample runs
- Jupyter notebooks showing EDA, feature engineering, and model evaluation
- Live or recorded demo of dashboard and alert flow
- Terraform or k8s manifests used to deploy

---

## Next step
Open the code structure section you want expanded. Options: specific DAGs, full Streamlit app, Spark transformations, or trained model notebook.

