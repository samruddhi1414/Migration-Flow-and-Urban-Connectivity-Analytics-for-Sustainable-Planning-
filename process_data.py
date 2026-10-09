import os
import json
import numpy as np
from python_calamine import CalamineWorkbook

raw_dir = r"C:\Users\Amey\Desktop\raw"

print("--- Step 1: Processing Migration D-03 ---")
wb_mig = CalamineWorkbook.from_path(os.path.join(raw_dir, "migration_d03.xlsx"))
rows_mig = wb_mig.get_sheet_by_name("D-03").to_python()

# Row 1 is header, row 5 is start of data
# Let's inspect rows to find district totals
# In Census D-03:
# col 0: Table name ('D0603')
# col 1: State ('27')
# col 2: District Code ('000' for state, or '497'..'531')
# col 3: Area Name (e.g. 'District - NANDURBAR (01)')
# col 4: Place of enumeration ('Total', 'Rural', 'Urban')
# col 5: Duration of residence ('All durations of residence')
# col 6: Last residence ('Total', 'Last residence within India', etc.)
# col 7: Last residence Total/Rural/Urban ('Total', 'Rural', 'Urban')
# col 8: Total migrants - Persons
# col 9: Males, 10: Females
# col 11: Work/employment - Persons, 12: Males, 13: Females
# col 14: Business - Persons, 15: Males, 16: Females
# col 17: Education - Persons, 18: Males, 19: Females
# col 20: Marriage - Persons, 21: Males, 22: Females
# col 23: Moved after birth - Persons, 24: Males, 25: Females
# col 26: Moved with household - Persons, 27: Males, 28: Females
# col 29: Others - Persons, 30: Males, 31: Females

migration_by_district = {}

for r in rows_mig:
    if len(r) > 30 and str(r[0]).strip() == 'D0603' and str(r[1]).strip() == '27':
        dcode_raw = str(r[2]).strip()
        if dcode_raw == '000' or dcode_raw == 'None':
            continue
        dcode = dcode_raw.zfill(3)
        area_name = str(r[3]).strip()
        enum_type = str(r[4]).strip() # Total, Rural, Urban
        duration = str(r[5]).strip()
        last_res = str(r[6]).strip()
        last_res_tru = str(r[7]).strip()
        
        # We want: duration == 'All durations of residence' and last_res == 'Total' and last_res_tru == 'Total'
        if 'All durations' in duration and last_res == 'Total' and last_res_tru == 'Total':
            if dcode not in migration_by_district:
                migration_by_district[dcode] = {
                    "districtCode": dcode,
                    "districtNameRaw": area_name,
                    "total": {},
                    "rural": {},
                    "urban": {}
                }
            
            mig_data = {
                "totalMigrants": int(r[8] or 0),
                "totalMaleMigrants": int(r[9] or 0),
                "totalFemaleMigrants": int(r[10] or 0),
                "workEmployment": int(r[11] or 0),
                "business": int(r[14] or 0),
                "education": int(r[17] or 0),
                "marriage": int(r[20] or 0),
                "movedAfterBirth": int(r[23] or 0),
                "movedWithHousehold": int(r[26] or 0),
                "others": int(r[29] or 0)
            }
            
            if enum_type == 'Total':
                migration_by_district[dcode]["total"] = mig_data
            elif enum_type == 'Rural':
                migration_by_district[dcode]["rural"] = mig_data
            elif enum_type == 'Urban':
                migration_by_district[dcode]["urban"] = mig_data

print(f"Loaded migration data for {len(migration_by_district)} districts.")
sample_dcode = list(migration_by_district.keys())[0]
print(f"Sample district ({sample_dcode}):", migration_by_district[sample_dcode]["total"])

print("\n--- Step 2: Processing Town DCHB ---")
wb_town = CalamineWorkbook.from_path(os.path.join(raw_dir, "town_dchb.xlsx"))
rows_town = wb_town.get_sheet_by_name("Town_2700").to_python()
headers_town = rows_town[0]
town_records = rows_town[1:]

towns_by_district = {}
for r in town_records:
    if not r or r[2] is None:
        continue
    dcode = str(r[2]).strip().zfill(3)
    dname = str(r[3]).strip()
    
    if dcode not in towns_by_district:
        towns_by_district[dcode] = {
            "districtCode": dcode,
            "districtName": dname,
            "townsCount": 0,
            "totalPopulation": 0,
            "totalAreaSqKm": 0.0,
            "puccaRoadLengthKm": 0.0,
            "kutchaRoadLengthKm": 0.0,
            "hospitalBeds": 0,
            "doctors": 0,
            "healthCentres": 0,
            "domesticElectricConnections": 0,
            "commercialElectricConnections": 0,
            "industrialElectricConnections": 0,
            "roadLightingConnections": 0,
            "townsWithRailway": 0, # distance == 0 or within 5km
            "townsWithBusRoute": 0,
            "townsWithClosedDrainage": 0,
            "townsWithFireService": 0,
            "growthRates": [],
            "densities": []
        }
    
    t = towns_by_district[dcode]
    t["townsCount"] += 1
    pop = float(r[9]) if r[9] is not None and str(r[9]).replace('.','',1).isdigit() else 0.0
    t["totalPopulation"] += int(pop)
    
    area = float(r[23]) if r[23] is not None and str(r[23]).replace('.','',1).isdigit() else 0.0
    t["totalAreaSqKm"] += area
    
    # Growth rate 2011
    gr = float(r[50]) if r[50] is not None and str(r[50]).replace('.','',1).replace('-','',1).isdigit() else None
    if gr is not None:
        t["growthRates"].append(gr)
        
    density = float(r[51]) if r[51] is not None and str(r[51]).replace('.','',1).isdigit() else None
    if density is not None:
        t["densities"].append(density)
        
    # Railway distance
    rail_dist = float(r[69]) if r[69] is not None and str(r[69]).replace('.','',1).isdigit() else 999.0
    if rail_dist <= 5.0:
        t["townsWithRailway"] += 1
        
    # Bus route distance
    bus_dist = float(r[71]) if r[71] is not None and str(r[71]).replace('.','',1).isdigit() else 999.0
    if bus_dist <= 5.0:
        t["townsWithBusRoute"] += 1
        
    # Pucca & Kutcha road length
    pucca = float(r[72]) if r[72] is not None and str(r[72]).replace('.','',1).isdigit() else 0.0
    kutcha = float(r[73]) if r[73] is not None and str(r[73]).replace('.','',1).isdigit() else 0.0
    t["puccaRoadLengthKm"] += pucca
    t["kutchaRoadLengthKm"] += kutcha
    
    # Drainage (1: Open, 2: Closed, 3: Both, 4: No)
    drain = r[74]
    if drain in [2, 3, '2', '3']:
        t["townsWithClosedDrainage"] += 1
        
    # Fire service (1: Available, 2: Not available)
    fire = r[94]
    if fire in [1, '1']:
        t["townsWithFireService"] += 1
        
    # Electricity connections
    t["domesticElectricConnections"] += int(float(r[97])) if r[97] is not None and str(r[97]).replace('.','',1).isdigit() else 0
    t["industrialElectricConnections"] += int(float(r[98])) if r[98] is not None and str(r[98]).replace('.','',1).isdigit() else 0
    t["commercialElectricConnections"] += int(float(r[99])) if r[99] is not None and str(r[99]).replace('.','',1).isdigit() else 0
    t["roadLightingConnections"] += int(float(r[100])) if r[100] is not None and str(r[100]).replace('.','',1).isdigit() else 0
    
    # Health: Hospital beds, doctors, health centres
    hosp_beds = float(r[103]) if r[103] is not None and str(r[103]).replace('.','',1).isdigit() else 0.0
    t["hospitalBeds"] += int(hosp_beds)
    
    doc_allo = float(r[105]) if r[105] is not None and str(r[105]).replace('.','',1).isdigit() else 0.0
    doc_alt = float(r[112]) if r[112] is not None and str(r[112]).replace('.','',1).isdigit() else 0.0
    t["doctors"] += int(doc_allo + doc_alt)
    
    hc = float(r[116]) if r[116] is not None and str(r[116]).replace('.','',1).isdigit() else 0.0
    t["healthCentres"] += int(hc)

print(f"Aggregated town data for {len(towns_by_district)} districts (total towns: {len(town_records)}).")

print("\n--- Step 3: Processing Village DCHB ---")
wb_vil = CalamineWorkbook.from_path(os.path.join(raw_dir, "village_dchb.xlsx"))
rows_vil = wb_vil.get_sheet_by_name("Village_Data_2700").to_python()
headers_vil = rows_vil[0]
village_records = rows_vil[1:]

# Village columns map:
# 2: District Code
# 3: District Name
# 8: Total Households
# 25: Total Population of Village
# 14: Sub District HQ distance
# 16: District HQ distance
# 41: Govt Primary School (1/2)
# 43: Private Primary School (1/2)
# 48: Govt Middle School (1/2)
# 55: Govt Secondary School (1/2)
# 62: Govt Sr Secondary School (1/2)
# 132: Community Health Centre (Numbers)
# 138: Primary Health Centre (Numbers)
# 186: Mobile Health Clinic (Numbers)
# 207: Tap Water-Treated (1/2)
# 208: Tap Water-Treated Functioning All round year (1/2)
# 210: Tap Water Untreated (1/2)
# 237: Closed Drainage (1/2)
# 238: Open Drainage (1/2)
# 240: Open Pucca Drainage Covered (1/2)
# 244: Total Sanitation Campaign (TSC) (1/2)
# 249: Community waste disposal system (1/2)
# 265: Mobile Phone Coverage (1/2)
# 267: Internet / CSC (1/2)
# 271: Public Bus Service (1/2)
# 273: Private Bus Service (1/2)
# 275: Railway Station (1/2)
# 297: Major District Road (1/2)
# 299: Other District Road (1/2)
# 301: Black Topped (pucca) Road (1/2)
# 303: Gravel (kutcha) Road (1/2)
# 307: All Weather Road (1/2)
# 315: Commercial Bank (1/2)
# 317: Cooperative Bank (1/2)
# 323: PDS Shop (1/2)
# 325: Mandis / Regular Market (1/2)
# 333: Anganwadi Centre (1/2)

villages_by_district = {}

def is_avail(val):
    return val == 1 or val == '1' or str(val).strip() == '1'

for r in village_records:
    if not r or r[2] is None:
        continue
    dcode = str(r[2]).strip().zfill(3)
    dname = str(r[3]).strip()
    
    if dcode not in villages_by_district:
        villages_by_district[dcode] = {
            "districtCode": dcode,
            "districtName": dname,
            "villagesCount": 0,
            "totalPopulation": 0,
            "totalHouseholds": 0,
            "distToSubDistHqSum": 0.0,
            "distToDistHqSum": 0.0,
            "validDistHqCount": 0,
            "withGovtOrPvtPrimarySchool": 0,
            "withSecondarySchool": 0,
            "withHealthFacility": 0,
            "chcCount": 0,
            "phcCount": 0,
            "withTapWaterTreated": 0,
            "withTapWaterYearRound": 0,
            "withTapWaterUntreated": 0,
            "withClosedOrCoveredDrainage": 0,
            "withTscSanitation": 0,
            "withWasteDisposal": 0,
            "withMobileCoverage": 0,
            "withInternetCsc": 0,
            "withPublicBus": 0,
            "withPrivateBus": 0,
            "withRailwayStation": 0,
            "withAllWeatherRoad": 0,
            "withPuccaRoad": 0,
            "withKutchaRoad": 0,
            "withMajorDistrictRoad": 0,
            "withBank": 0,
            "withPds": 0,
            "withMarket": 0,
            "withAnganwadi": 0
        }
        
    v = villages_by_district[dcode]
    v["villagesCount"] += 1
    
    # Population & Households
    pop = float(r[25]) if r[25] is not None and str(r[25]).replace('.','',1).isdigit() else 0.0
    hh = float(r[8]) if r[8] is not None and str(r[8]).replace('.','',1).isdigit() else 0.0
    v["totalPopulation"] += int(pop)
    v["totalHouseholds"] += int(hh)
    
    # Distances
    dhq = float(r[16]) if r[16] is not None and str(r[16]).replace('.','',1).isdigit() else None
    if dhq is not None and dhq < 500:
        v["distToDistHqSum"] += dhq
        v["validDistHqCount"] += 1
        
    # Infrastructure status fields (1=available, 2=not available)
    if is_avail(r[41]) or is_avail(r[43]):
        v["withGovtOrPvtPrimarySchool"] += 1
    if is_avail(r[55]) or is_avail(r[62]):
        v["withSecondarySchool"] += 1
        
    chc = float(r[132]) if r[132] is not None and str(r[132]).replace('.','',1).isdigit() else 0.0
    phc = float(r[138]) if r[138] is not None and str(r[138]).replace('.','',1).isdigit() else 0.0
    mhc = float(r[186]) if r[186] is not None and str(r[186]).replace('.','',1).isdigit() else 0.0
    if chc > 0 or phc > 0 or mhc > 0:
        v["withHealthFacility"] += 1
    v["chcCount"] += int(chc)
    v["phcCount"] += int(phc)
    
    if is_avail(r[207]):
        v["withTapWaterTreated"] += 1
    if is_avail(r[208]):
        v["withTapWaterYearRound"] += 1
    if is_avail(r[210]):
        v["withTapWaterUntreated"] += 1
        
    if is_avail(r[237]) or is_avail(r[240]):
        v["withClosedOrCoveredDrainage"] += 1
        
    if is_avail(r[244]):
        v["withTscSanitation"] += 1
    if is_avail(r[249]):
        v["withWasteDisposal"] += 1
        
    if is_avail(r[265]):
        v["withMobileCoverage"] += 1
    if is_avail(r[267]):
        v["withInternetCsc"] += 1
        
    if is_avail(r[271]):
        v["withPublicBus"] += 1
    if is_avail(r[273]):
        v["withPrivateBus"] += 1
    if is_avail(r[275]):
        v["withRailwayStation"] += 1
        
    if is_avail(r[307]):
        v["withAllWeatherRoad"] += 1
    if is_avail(r[301]):
        v["withPuccaRoad"] += 1
    if is_avail(r[303]):
        v["withKutchaRoad"] += 1
    if is_avail(r[297]) or is_avail(r[299]):
        v["withMajorDistrictRoad"] += 1
        
    if is_avail(r[315]) or is_avail(r[317]):
        v["withBank"] += 1
    if is_avail(r[323]):
        v["withPds"] += 1
    if is_avail(r[325]):
        v["withMarket"] += 1
    if is_avail(r[333]):
        v["withAnganwadi"] += 1

print(f"Aggregated village data for {len(villages_by_district)} districts (total villages: {len(village_records)}).")

print("\n--- Step 4: Merge & Calculate District Analytical Indices ---")
# Load GeoJSON
with open(os.path.join(raw_dir, "maharashtra_districts.geojson"), "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# Normalize district name mapping
# Note: Mumbai Suburban (518) and Mumbai (519) in 2011 Census:
# In GeoJSON: 519 is Mumbai, 517 is Thane, 732 is Palghar (Palghar was carved from Thane in 2014)
# Let's map all 35 Census 2011 districts perfectly to GeoJSON features!

geojson_features = geojson_data["features"]
print(f"GeoJSON feature count: {len(geojson_features)}")

# Let's inspect district codes in GeoJSON
geojson_by_code = {str(f["properties"].get("dt_code")).zfill(3): f for f in geojson_features}
print("GeoJSON dt_codes:", sorted(geojson_by_code.keys()))

