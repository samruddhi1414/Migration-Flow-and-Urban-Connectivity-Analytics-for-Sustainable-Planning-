import json

with open('public/data/processed_districts.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"{'Rank':<5} {'District':<16} {'Demand':<8} {'Infra':<8} {'Pressure':<10} {'Category':<16} {'Sustain':<8} {'Main Pressure'}")
print("-" * 95)
for d in data['districts'][:15]:
    print(f"{d['rank']:<5} {d['districtName']:<16} {d['demandIndex']:<8.1f} {d['infrastructureIndex']:<8.1f} {d['pressureScore']:<10.1f} {d['pressureCategory']:<16} {d['sustainabilityScore']:<8.1f} {d['mainPressure']}")
