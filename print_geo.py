import json
import os

raw_dir = r"C:\Users\Amey\Desktop\raw"
with open(os.path.join(raw_dir, "maharashtra_districts.geojson"), "r", encoding="utf-8") as f:
    geo = json.load(f)

for f in geo["features"]:
    props = f["properties"]
    print(props)
