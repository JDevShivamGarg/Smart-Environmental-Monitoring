import pandas as pd

def analyze_data():
    """Reads the curated data and prints some basic statistics."""
    try:
        df = pd.read_parquet("data/curated/environmental_data.parquet")
        print("Curated Data Head:")
        print(df.head())
        print("\nCurated Data Info:")
        df.info()
        print("\nCurated Data Description:")
        print(df.describe())
    except FileNotFoundError:
        print("Curated data file not found. Please run the transformation script first.")

if __name__ == "__main__":
    analyze_data()

