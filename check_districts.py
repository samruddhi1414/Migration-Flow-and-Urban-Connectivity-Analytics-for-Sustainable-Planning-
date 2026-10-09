import pandas as pd
import json
import os

raw_dir = r"C:\Users\Amey\Desktop\raw"

# Load GeoJSON
with open(os.path.join(raw_dir, "maharashtra_districts.geojson"), "r", encoding="utf-8") as f:
    geo = json.load(f)

geo_list = []
for f in geo["features"]:
    geo_list.append({
        "dt_code": str(f["properties"].get("dt_code", "")).strip(),
        "district": str(f["properties"].get("district", "")).strip(),
        "st_code": str(f["properties"].get("st_code", "")).strip()
    })
df_geo = pd.DataFrame(geo_list)
print("GEOJSON DISTRICTS (count:", len(df_geo), "):")
print(df_geo.to_string())

# Load Town
df_town = pd.read_excel(os.path.join(raw_dir, "town_dchb.xlsx"), sheet_name="Town_2700")
town_dists = df_town[['District Code', 'District Name']].drop_duplicates()
town_dists['District Code'] = town_dists['District Code'].astype(str).str.zfill(3)
print("\nTOWN DISTRICTS (count:", len(town_dists), "):")
print(town_dists.to_string())

# Load Migration
df_mig_raw = pd.read_excel(os.path.join(raw_dir, "migration_d03.xlsx"), sheet_name="D-03")
# Inspect header rows
print("\nMigration top 10 rows:")
print(df_mig_raw.iloc[:10, :8])

