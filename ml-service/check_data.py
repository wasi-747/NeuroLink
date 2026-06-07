import pandas as pd
import os
import glob

data_dir = r"D:\Study\Projects\NeuroLink\ml-service\Datasets\Datasets CSV"
csv_files = glob.glob(os.path.join(data_dir, "*.csv"))

for file_path in csv_files:
    file_name = os.path.basename(file_path)
    print(f"==================================================")
    print(f"File name: {file_name}")
    try:
        df = pd.read_csv(file_path)
        print(f"Shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        print("Head (2 rows):")
        print(df.head(2).to_string())
        print("Missing values (isnull().sum()):")
        print(df.isnull().sum().to_string())
    except Exception as e:
        print(f"Error reading file: {e}")
    print(f"==================================================\n")
