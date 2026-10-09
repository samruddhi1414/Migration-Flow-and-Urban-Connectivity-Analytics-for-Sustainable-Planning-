import pandas as pd
import json
import os

raw_dir = r"C:\Users\Amey\Desktop\raw"

print("--- 1. GEOJSON ANALYSIS ---")
with open(os.path.join(raw_dir, "maharashtra_districts.geojson"), "r", encoding="utf-8") as f:
    geo = json.load(f)

geo_dists = {}
for feat in geo["features"]:
    props = feat["properties"]
    dt_code = str(props.get("dt_code", "")).strip()
    name = props.get("district", "").strip()
    geo_dists[dt_code] = name

print(f"Total GeoJSON districts: {len(geo_dists)}")
for k, v in sorted(geo_dists.items(), key=lambda x: x[0]):
    print(f"  Code {k}: {v}")

print("\n--- 2. TOWN DATA ANALYSIS ---")
df_town = pd.read_excel(os.path.join(raw_dir, "town_dchb.xlsx"), sheet_name="Town_2700")
print(f"Town rows: {len(df_town)}, cols: {len(df_town.columns)}")
print("Town district codes unique:", df_town['District Code'].unique())
print("Town district names count:", df_town['District Name'].nunique())

print("\n--- 3. MIGRATION DATA ANALYSIS ---")
df_mig = pd.read_excel(os.path.join(raw_dir, "migration_d03.xlsx"), sheet_name="D-03", skiprows=4)
print("Migration shape:", df_mig.shape)
print("Migration cols:", df_mig.columns.tolist()[:15])

print("\n--- 4. VILLAGE DATA QUICK INSPECT ---")
# Read only first 100 rows to see columns fast
df_vil_sample = pd.read_excel(os.path.join(raw_dir, "village_dchb.xlsx"), sheet_name="Village_Data_2700", nrows=50)
print(f"Village cols count: {len(df_vil_sample.columns)}")
for col in df_vil_sample.columns:
    if any(k in str(col).lower() for k in ['district', 'population', 'road', 'bus', 'rail', 'tap', 'drain', 'sanitat', 'waste', 'school', 'health', 'bank', 'market', 'mobile', 'csc', 'icds', 'pds']):
        print(f"  Col: {col}")
