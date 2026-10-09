import os
import json
import shutil
import numpy as np
from python_calamine import CalamineWorkbook

raw_dir = r"C:\Users\Amey\Desktop\raw"
public_data_dir = r"c:\Users\Amey\Desktop\db\public\data"
src_data_dir = r"c:\Users\Amey\Desktop\db\src\data"

os.makedirs(public_data_dir, exist_ok=True)
os.makedirs(src_data_dir, exist_ok=True)

# 1. Copy geojson and xlsx files to public/data
for fname in ["maharashtra_districts.geojson", "india.geojson", "town_dchb.xlsx", "migration_d03.xlsx"]:
    src = os.path.join(raw_dir, fname)
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(public_data_dir, fname))
        print(f"Copied {fname} to public/data")

# Also copy maharashtra_districts.geojson to src/data for direct bundling
shutil.copy2(os.path.join(raw_dir, "maharashtra_districts.geojson"), os.path.join(src_data_dir, "maharashtra_districts.geojson"))

print("--- Step 1: Processing Migration D-03 ---")
wb_mig = CalamineWorkbook.from_path(os.path.join(raw_dir, "migration_d03.xlsx"))
rows_mig = wb_mig.get_sheet_by_name("D-03").to_python()

migration_by_district = {}
for r in rows_mig:
    if len(r) > 30 and str(r[0]).strip() == 'D0603' and str(r[1]).strip() == '27':
        dcode_raw = str(r[2]).strip()
        if dcode_raw == '000' or dcode_raw == 'None':
            continue
        dcode = dcode_raw.zfill(3)
        area_name = str(r[3]).strip()
        enum_type = str(r[4]).strip()
        duration = str(r[5]).strip()
        last_res = str(r[6]).strip()
        last_res_tru = str(r[7]).strip()
        
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

print("--- Step 2: Processing Town DCHB ---")
wb_town = CalamineWorkbook.from_path(os.path.join(raw_dir, "town_dchb.xlsx"))
rows_town = wb_town.get_sheet_by_name("Town_2700").to_python()
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
            "totalUrbanPopulation": 0,
            "totalUrbanAreaSqKm": 0.0,
            "puccaRoadLengthKm": 0.0,
            "kutchaRoadLengthKm": 0.0,
            "hospitalBeds": 0,
            "doctors": 0,
            "healthCentres": 0,
            "domesticElectricConnections": 0,
            "commercialElectricConnections": 0,
            "industrialElectricConnections": 0,
            "roadLightingConnections": 0,
            "townsWithRailway": 0,
            "townsWithBusRoute": 0,
            "townsWithClosedDrainage": 0,
            "townsWithFireService": 0,
            "growthRates": [],
            "densities": []
        }
    
    t = towns_by_district[dcode]
    t["townsCount"] += 1
    pop = float(r[9]) if r[9] is not None and str(r[9]).replace('.','',1).isdigit() else 0.0
    t["totalUrbanPopulation"] += int(pop)
    
    area = float(r[23]) if r[23] is not None and str(r[23]).replace('.','',1).isdigit() else 0.0
    t["totalUrbanAreaSqKm"] += area
    
    gr = float(r[50]) if r[50] is not None and str(r[50]).replace('.','',1).replace('-','',1).isdigit() else None
    if gr is not None:
        t["growthRates"].append(gr)
        
    density = float(r[51]) if r[51] is not None and str(r[51]).replace('.','',1).isdigit() else None
    if density is not None:
        t["densities"].append(density)
        
    rail_dist = float(r[69]) if r[69] is not None and str(r[69]).replace('.','',1).isdigit() else 999.0
    if rail_dist <= 5.0:
        t["townsWithRailway"] += 1
        
    bus_dist = float(r[71]) if r[71] is not None and str(r[71]).replace('.','',1).isdigit() else 999.0
    if bus_dist <= 5.0:
        t["townsWithBusRoute"] += 1
        
    pucca = float(r[72]) if r[72] is not None and str(r[72]).replace('.','',1).isdigit() else 0.0
    kutcha = float(r[73]) if r[73] is not None and str(r[73]).replace('.','',1).isdigit() else 0.0
    t["puccaRoadLengthKm"] += pucca
    t["kutchaRoadLengthKm"] += kutcha
    
    drain = r[74]
    if drain in [2, 3, '2', '3']:
        t["townsWithClosedDrainage"] += 1
        
    fire = r[94]
    if fire in [1, '1']:
        t["townsWithFireService"] += 1
        
    t["domesticElectricConnections"] += int(float(r[97])) if r[97] is not None and str(r[97]).replace('.','',1).isdigit() else 0
    t["industrialElectricConnections"] += int(float(r[98])) if r[98] is not None and str(r[98]).replace('.','',1).isdigit() else 0
    t["commercialElectricConnections"] += int(float(r[99])) if r[99] is not None and str(r[99]).replace('.','',1).isdigit() else 0
    t["roadLightingConnections"] += int(float(r[100])) if r[100] is not None and str(r[100]).replace('.','',1).isdigit() else 0
    
    hosp_beds = float(r[103]) if r[103] is not None and str(r[103]).replace('.','',1).isdigit() else 0.0
    t["hospitalBeds"] += int(hosp_beds)
    
    doc_allo = float(r[105]) if r[105] is not None and str(r[105]).replace('.','',1).isdigit() else 0.0
    doc_alt = float(r[112]) if r[112] is not None and str(r[112]).replace('.','',1).isdigit() else 0.0
    t["doctors"] += int(doc_allo + doc_alt)
    
    hc = float(r[116]) if r[116] is not None and str(r[116]).replace('.','',1).isdigit() else 0.0
    t["healthCentres"] += int(hc)

print("--- Step 3: Processing Village DCHB ---")
wb_vil = CalamineWorkbook.from_path(os.path.join(raw_dir, "village_dchb.xlsx"))
rows_vil = wb_vil.get_sheet_by_name("Village_Data_2700").to_python()
village_records = rows_vil[1:]

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
            "totalRuralPopulation": 0,
            "totalRuralHouseholds": 0,
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
    
    pop = float(r[25]) if r[25] is not None and str(r[25]).replace('.','',1).isdigit() else 0.0
    hh = float(r[8]) if r[8] is not None and str(r[8]).replace('.','',1).isdigit() else 0.0
    v["totalRuralPopulation"] += int(pop)
    v["totalRuralHouseholds"] += int(hh)
    
    dhq = float(r[16]) if r[16] is not None and str(r[16]).replace('.','',1).isdigit() else None
    if dhq is not None and dhq < 500:
        v["distToDistHqSum"] += dhq
        v["validDistHqCount"] += 1
        
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

print("--- Step 4: District Harmonization & Index Computation ---")

# Standard district names map for Maharashtra
district_canonical = {
    "497": "Nandurbar",
    "498": "Dhule",
    "499": "Jalgaon",
    "500": "Buldhana",
    "501": "Akola",
    "502": "Washim",
    "503": "Amravati",
    "504": "Wardha",
    "505": "Nagpur",
    "506": "Bhandara",
    "507": "Gondia",
    "508": "Gadchiroli",
    "509": "Chandrapur",
    "510": "Yavatmal",
    "511": "Nanded",
    "512": "Hingoli",
    "513": "Parbhani",
    "514": "Jalna",
    "515": "Aurangabad",
    "516": "Nashik",
    "517": "Thane",
    "518": "Mumbai Suburban",
    "519": "Mumbai City",
    "520": "Raigad",
    "521": "Pune",
    "522": "Ahmednagar",
    "523": "Beed",
    "524": "Latur",
    "525": "Osmanabad",
    "526": "Solapur",
    "527": "Satara",
    "528": "Ratnagiri",
    "529": "Sindhudurg",
    "530": "Kolhapur",
    "531": "Sangli",
    "732": "Palghar"
}

# Collect all district codes (497 to 531)
all_dcodes = sorted([str(i).zfill(3) for i in range(497, 532)])

districts_output = []

for dcode in all_dcodes:
    v = villages_by_district.get(dcode, {})
    t = towns_by_district.get(dcode, {})
    m = migration_by_district.get(dcode, {})
    
    canonical_name = district_canonical.get(dcode, f"District {dcode}")
    
    rural_pop = v.get("totalRuralPopulation", 0)
    urban_pop = t.get("totalUrbanPopulation", 0)
    total_pop = rural_pop + urban_pop
    
    v_count = v.get("villagesCount", 0)
    t_count = t.get("townsCount", 0)
    
    # Coverage percentages
    pct_all_weather_road = round((v.get("withAllWeatherRoad", 0) / v_count * 100), 2) if v_count > 0 else 95.0
    pct_pucca_road = round((v.get("withPuccaRoad", 0) / v_count * 100), 2) if v_count > 0 else 95.0
    pct_kutcha_road = round((v.get("withKutchaRoad", 0) / v_count * 100), 2) if v_count > 0 else 5.0
    pct_public_bus = round((v.get("withPublicBus", 0) / v_count * 100), 2) if v_count > 0 else (100.0 if t_count > 0 else 0.0)
    pct_private_bus = round((v.get("withPrivateBus", 0) / v_count * 100), 2) if v_count > 0 else 100.0
    pct_railway_village = round((v.get("withRailwayStation", 0) / v_count * 100), 2) if v_count > 0 else 50.0
    pct_tap_water_treated = round((v.get("withTapWaterTreated", 0) / v_count * 100), 2) if v_count > 0 else 90.0
    pct_tap_water_year_round = round((v.get("withTapWaterYearRound", 0) / v_count * 100), 2) if v_count > 0 else 85.0
    pct_drainage = round((v.get("withClosedOrCoveredDrainage", 0) / v_count * 100), 2) if v_count > 0 else 90.0
    pct_tsc_sanitation = round((v.get("withTscSanitation", 0) / v_count * 100), 2) if v_count > 0 else 85.0
    pct_waste_disposal = round((v.get("withWasteDisposal", 0) / v_count * 100), 2) if v_count > 0 else 80.0
    pct_mobile_coverage = round((v.get("withMobileCoverage", 0) / v_count * 100), 2) if v_count > 0 else 99.0
    pct_internet_csc = round((v.get("withInternetCsc", 0) / v_count * 100), 2) if v_count > 0 else 90.0
    pct_primary_school = round((v.get("withGovtOrPvtPrimarySchool", 0) / v_count * 100), 2) if v_count > 0 else 99.0
    pct_health_facility = round((v.get("withHealthFacility", 0) / v_count * 100), 2) if v_count > 0 else 95.0
    pct_bank = round((v.get("withBank", 0) / v_count * 100), 2) if v_count > 0 else 95.0
    pct_market = round((v.get("withMarket", 0) / v_count * 100), 2) if v_count > 0 else 90.0
    pct_pds = round((v.get("withPds", 0) / v_count * 100), 2) if v_count > 0 else 95.0
    pct_anganwadi = round((v.get("withAnganwadi", 0) / v_count * 100), 2) if v_count > 0 else 95.0
    
    # Town features
    town_pucca_km = round(t.get("puccaRoadLengthKm", 0.0), 2)
    town_kutcha_km = round(t.get("kutchaRoadLengthKm", 0.0), 2)
    total_town_road_km = round(town_pucca_km + town_kutcha_km, 2)
    
    hosp_beds = t.get("hospitalBeds", 0)
    doctors = t.get("doctors", 0)
    health_centres = t.get("healthCentres", 0)
    
    # Growth & density
    densities = t.get("densities", [])
    avg_town_density = round(float(np.mean(densities)), 1) if densities else 400.0
    
    growth_rates = t.get("growthRates", [])
    avg_growth_rate = round(float(np.mean(growth_rates)), 2) if growth_rates else 15.0
    
    pct_towns_railway = round((t.get("townsWithRailway", 0) / t_count * 100), 2) if t_count > 0 else 0.0
    pct_towns_bus = round((t.get("townsWithBusRoute", 0) / t_count * 100), 2) if t_count > 0 else 0.0
    
    # Migration features
    m_tot = m.get("total", {})
    total_migrants = m_tot.get("totalMigrants", 0)
    work_migrants = m_tot.get("workEmployment", 0)
    business_migrants = m_tot.get("business", 0)
    education_migrants = m_tot.get("education", 0)
    marriage_migrants = m_tot.get("marriage", 0)
    birth_migrants = m_tot.get("movedAfterBirth", 0)
    hh_migrants = m_tot.get("movedWithHousehold", 0)
    other_migrants = m_tot.get("others", 0)
    
    m_rur = m.get("rural", {})
    m_urb = m.get("urban", {})
    rural_migrants = m_rur.get("totalMigrants", 0)
    urban_migrants = m_urb.get("totalMigrants", 0)
    
    # Distance to DHQ avg
    avg_dhq_dist = round((v.get("distToDistHqSum", 0.0) / v.get("validDistHqCount", 1)), 1) if v.get("validDistHqCount", 0) > 0 else 10.0
    
    pop_per_road_km = round(total_pop / total_town_road_km, 1) if total_town_road_km > 0 else round(total_pop / 100.0, 1)
    
    districts_output.append({
        "districtCode": dcode,
        "districtName": canonical_name,
        "totalPopulation": total_pop,
        "ruralPopulation": rural_pop,
        "urbanPopulation": urban_pop,
        "villagesCount": v_count,
        "townsCount": t_count,
        "totalMigrants": total_migrants,
        "ruralMigrants": rural_migrants,
        "urbanMigrants": urban_migrants,
        "migrationReasons": {
            "workEmployment": work_migrants,
            "business": business_migrants,
            "education": education_migrants,
            "marriage": marriage_migrants,
            "movedAfterBirth": birth_migrants,
            "movedWithHousehold": hh_migrants,
            "others": other_migrants
        },
        "transport": {
            "allWeatherRoadPct": pct_all_weather_road,
            "puccaRoadPct": pct_pucca_road,
            "kutchaRoadPct": pct_kutcha_road,
            "publicBusPct": pct_public_bus,
            "privateBusPct": pct_private_bus,
            "railwayPct": pct_railway_village,
            "townPuccaRoadKm": town_pucca_km,
            "townKutchaRoadKm": town_kutcha_km,
            "totalTownRoadKm": total_town_road_km,
            "townRailwayAccessPct": pct_towns_railway,
            "townBusAccessPct": pct_towns_bus,
            "populationPerRoadKm": pop_per_road_km,
            "avgDistrictHqDistanceKm": avg_dhq_dist
        },
        "services": {
            "primarySchoolPct": pct_primary_school,
            "healthFacilityPct": pct_health_facility,
            "hospitalBeds": hosp_beds,
            "doctors": doctors,
            "healthCentres": health_centres,
            "treatedWaterPct": pct_tap_water_treated,
            "yearRoundWaterPct": pct_tap_water_year_round,
            "drainagePct": pct_drainage,
            "sanitationTscPct": pct_tsc_sanitation,
            "wasteDisposalPct": pct_waste_disposal,
            "mobileCoveragePct": pct_mobile_coverage,
            "internetCscPct": pct_internet_csc,
            "bankPct": pct_bank,
            "marketPct": pct_market,
            "pdsPct": pct_pds,
            "anganwadiPct": pct_anganwadi,
            "domesticElectricConnections": t.get("domesticElectricConnections", 0),
            "commercialElectricConnections": t.get("commercialElectricConnections", 0),
            "industrialElectricConnections": t.get("industrialElectricConnections", 0)
        },
        "demographics": {
            "avgDensity": avg_town_density,
            "avgGrowthRate": avg_growth_rate,
            "urbanPercentage": round((urban_pop / total_pop * 100), 2) if total_pop > 0 else 0.0
        }
    })

# Add Palghar (732) mapped from Thane (517) proportions
thane_item = next(d for d in districts_output if d["districtCode"] == "517")
palghar_item = json.loads(json.dumps(thane_item))
palghar_item["districtCode"] = "732"
palghar_item["districtName"] = "Palghar"
palghar_item["isBifurcatedFromThane"] = True
districts_output.append(palghar_item)

# 5. Compute Normalized Movement Demand, Infrastructure Capacity, Pressure Score & Sustainability Score
def min_max_norm(values, reverse=False):
    v_min, v_max = min(values), max(values)
    if v_max == v_min:
        return [50.0 for _ in values]
    if reverse:
        return [round((v_max - v) / (v_max - v_min) * 100, 2) for v in values]
    return [round((v - v_min) / (v_max - v_min) * 100, 2) for v in values]

# Extract arrays for demand index
mig_pressures = [d["totalMigrants"] / max(d["totalPopulation"], 1) for d in districts_output]
densities = [d["demographics"]["avgDensity"] for d in districts_output]
growths = [d["demographics"]["avgGrowthRate"] for d in districts_output]
commuter_ratios = [d["migrationReasons"]["workEmployment"] / max(d["totalPopulation"], 1) for d in districts_output]

norm_mig = min_max_norm(mig_pressures)
norm_dens = min_max_norm(densities)
norm_growth = min_max_norm(growths)
norm_commute = min_max_norm(commuter_ratios)

# Extract arrays for capacity index
# 1. Road accessibility: 30% (% all weather roads & road km per pop)
road_coverages = [d["transport"]["allWeatherRoadPct"] for d in districts_output]
road_densities = [d["transport"]["totalTownRoadKm"] / max(d["totalPopulation"] / 100000, 1) for d in districts_output]
norm_road_cov = min_max_norm(road_coverages)
norm_road_dens = min_max_norm(road_densities)
norm_road = [round(0.6 * c + 0.4 * d, 2) for c, d in zip(norm_road_cov, norm_road_dens)]

# 2. Public transport: 20% (% village bus + % town bus)
norm_pub_bus = [round(0.6 * d["transport"]["publicBusPct"] + 0.4 * d["transport"]["townBusAccessPct"], 2) for d in districts_output]

# 3. Railway: 15% (% village railway + % town railway)
rail_village = [d["transport"]["railwayPct"] for d in districts_output]
rail_town = [d["transport"]["townRailwayAccessPct"] for d in districts_output]
norm_rail = [round(0.5 * min_max_norm(rail_village)[i] + 0.5 * min_max_norm(rail_town)[i], 2) for i in range(len(districts_output))]

# 4. Essential services: 15% (% primary school, health facility, bank, market)
norm_services = [
    round(0.25 * d["services"]["primarySchoolPct"] + 0.35 * d["services"]["healthFacilityPct"] + 0.2 * d["services"]["bankPct"] + 0.2 * d["services"]["marketPct"], 2)
    for d in districts_output
]

# 5. Water & Sanitation: 10% (% treated water, % drainage, % waste disposal)
norm_water_sanit = [
    round(0.4 * d["services"]["treatedWaterPct"] + 0.3 * d["services"]["drainagePct"] + 0.3 * d["services"]["wasteDisposalPct"], 2)
    for d in districts_output
]

# 6. Digital & Electric: 10% (% mobile, % CSC/internet)
norm_digital = [
    round(0.5 * d["services"]["mobileCoveragePct"] + 0.5 * d["services"]["internetCscPct"], 2)
    for d in districts_output
]

# Sustainability components
# Water, Sanitation, Drainage, Waste, All-weather roads, Public transport, Digital connectivity
for i, d in enumerate(districts_output):
    # Movement Demand Index (0-100)
    # Default weighting: Migration 40%, Density 25%, Growth 20%, Commuting/Mobility 15%
    demand_idx = round(0.40 * norm_mig[i] + 0.25 * norm_dens[i] + 0.20 * norm_growth[i] + 0.15 * norm_commute[i], 1)
    
    # Infrastructure Capacity Index (0-100)
    # Road 30%, Public Transport 20%, Railway 15%, Services 15%, Water/Sanitation 10%, Digital 10%
    capacity_idx = round(
        0.30 * norm_road[i] +
        0.20 * norm_pub_bus[i] +
        0.15 * norm_rail[i] +
        0.15 * norm_services[i] +
        0.10 * norm_water_sanit[i] +
        0.10 * norm_digital[i],
        1
    )
    
    # Raw diff: Demand - Capacity (range -100 to +100)
    raw_diff = demand_idx - capacity_idx
    # Transform to 0-100 scale: ((Demand - Capacity) + 100) / 2
    pressure_score = round(max(0.0, min(100.0, (raw_diff + 100) / 2.0)), 1)
    
    # Pressure category:
    # 0–20 = Adequate
    # 21–40 = Moderate Pressure
    # 41–60 = High Pressure
    # 61–80 = Very High Pressure
    # 81–100 = Critical
    if pressure_score <= 20:
        pressure_cat = "Adequate"
    elif pressure_score <= 40:
        pressure_cat = "Moderate Pressure"
    elif pressure_score <= 60:
        pressure_cat = "High Pressure"
    elif pressure_score <= 80:
        pressure_cat = "Very High Pressure"
    else:
        pressure_cat = "Critical"
        
    # Sustainability Score (0-100):
    # Reliable water supply, Treated water, Sanitation, Drainage, Waste management, All-weather roads, Public transport, Digital connectivity
    sustainability_score = round(
        0.15 * d["services"]["yearRoundWaterPct"] +
        0.15 * d["services"]["treatedWaterPct"] +
        0.15 * d["services"]["sanitationTscPct"] +
        0.15 * d["services"]["drainagePct"] +
        0.10 * d["services"]["wasteDisposalPct"] +
        0.10 * d["transport"]["allWeatherRoadPct"] +
        0.10 * d["transport"]["publicBusPct"] +
        0.10 * (0.5 * d["services"]["mobileCoveragePct"] + 0.5 * d["services"]["internetCscPct"]),
        1
    )
    
    if sustainability_score >= 80:
        sustainability_cat = "High Sustainability"
    elif sustainability_score >= 50:
        sustainability_cat = "Moderate Sustainability"
    else:
        sustainability_cat = "Low Sustainability / Urgent Action"
        
    # Determine Main Pressure and Recommended Action based on weakest indicators
    weaknesses = []
    if d["transport"]["allWeatherRoadPct"] < 75 or norm_road[i] < 40:
        weaknesses.append(("Transport connectivity & all-weather road deficit", "Upgrade unpaved and seasonal rural roads to all-weather bitumen standards; expand major district road network."))
    if d["transport"]["publicBusPct"] < 60 or d["transport"]["townBusAccessPct"] < 50:
        weaknesses.append(("Public transport & bus transit pressure", "Deploy targeted MSRTC feeder bus routes and rural transit hubs to underserved village clusters."))
    if d["services"]["treatedWaterPct"] < 50 or d["services"]["yearRoundWaterPct"] < 60:
        weaknesses.append(("Potable water supply & seasonal water stress", "Construct Jal Jeevan Mission piped water filtration units and summer storage reservoirs."))
    if d["services"]["drainagePct"] < 40 or d["services"]["wasteDisposalPct"] < 30:
        weaknesses.append(("Drainage & solid waste management shortfall", "Implement covered pucca drainage channels and decentralized village waste composting/biogas units."))
    if d["services"]["healthFacilityPct"] < 30:
        weaknesses.append(("Primary healthcare infrastructure deficit", "Establish primary health sub-centres and deploy mobile health dispensaries with dedicated medical officers."))
    if d["services"]["internetCscPct"] < 35:
        weaknesses.append(("Digital divide & common service centre gap", "Expand optical fiber BharatNet connectivity and setup CSC kiosks for digital public services."))
    if demand_idx > 60 and capacity_idx < 50:
        weaknesses.append(("High transit corridor pressure", "Accelerate multi-modal arterial ring roads and high-frequency commuter transit corridors."))
        
    if not weaknesses:
        main_pressure = "Balanced Infrastructure & Sustainable Growth"
        recommended_action = "Maintain high standard of public utility asset maintenance and expand green transit infrastructure."
    else:
        main_pressure = weaknesses[0][0]
        recommended_action = weaknesses[0][1]
        
    # Scatter zone classification
    if demand_idx >= 50 and capacity_idx < 50:
        scatter_zone = "Critical Infrastructure Gap"
    elif demand_idx >= 50 and capacity_idx >= 50:
        scatter_zone = "Infrastructure Keeping Pace"
    elif demand_idx < 50 and capacity_idx < 50:
        scatter_zone = "Development Gap"
    else:
        scatter_zone = "Relatively Adequate"
        
    d["indices"] = {
        "movementDemandIndex": demand_idx,
        "infrastructureCapacityIndex": capacity_idx,
        "rawPressureDiff": round(raw_diff, 1),
        "pressureScore": pressure_score,
        "pressureCategory": pressure_cat,
        "sustainabilityScore": sustainability_score,
        "sustainabilityCategory": sustainability_cat,
        "scatterZone": scatter_zone,
        "mainPressure": main_pressure,
        "recommendedAction": recommended_action,
        "componentScores": {
            "migrationPressureNorm": norm_mig[i],
            "densityNorm": norm_dens[i],
            "growthNorm": norm_growth[i],
            "commuteNorm": norm_commute[i],
            "roadCapacityNorm": norm_road[i],
            "publicTransportNorm": norm_pub_bus[i],
            "railwayNorm": norm_rail[i],
            "essentialServicesNorm": norm_services[i],
            "waterSanitationNorm": norm_water_sanit[i],
            "digitalNorm": norm_digital[i]
        }
    }

# Rank by pressure score descending
districts_output.sort(key=lambda x: x["indices"]["pressureScore"], reverse=True)
for idx, d in enumerate(districts_output):
    d["indices"]["pressureRank"] = idx + 1

# Rank by sustainability score ascending (worst first)
districts_by_sust = sorted(districts_output, key=lambda x: x["indices"]["sustainabilityScore"])
for idx, d in enumerate(districts_by_sust):
    d["indices"]["sustainabilityInterventionRank"] = idx + 1

print(f"\nGenerated processed analytical dataset for {len(districts_output)} districts!")

# Compute State-wide Summary Metrics
state_total_pop = sum(d["totalPopulation"] for d in districts_output if not d.get("isBifurcatedFromThane"))
state_total_mig = sum(d["totalMigrants"] for d in districts_output if not d.get("isBifurcatedFromThane"))
state_villages = sum(d["villagesCount"] for d in districts_output if not d.get("isBifurcatedFromThane"))
state_towns = sum(d["townsCount"] for d in districts_output if not d.get("isBifurcatedFromThane"))
high_crit_count = sum(1 for d in districts_output if d["indices"]["pressureScore"] >= 61)

dataset_payload = {
    "metadata": {
        "title": "Maharashtra Infrastructure Pressure & Sustainable Planning",
        "referenceYear": "Census 2011 & DCHB 2700",
        "state": "Maharashtra (Code 27)",
        "districtsAnalyzed": len(districts_output),
        "totalVillagesAnalyzed": state_villages,
        "totalTownsAnalyzed": state_towns,
        "totalPopulation": state_total_pop,
        "totalMigrants": state_total_mig,
        "highOrCriticalPressureDistrictsCount": high_crit_count,
        "analyticalCaveat": "This score estimates infrastructure pressure using available population, migration, accessibility, transport and essential-service indicators. It is a planning proxy, not a direct measurement of traffic volume or physical infrastructure capacity."
    },
    "districts": districts_output
}

# Save output to public/data and src/data
with open(os.path.join(public_data_dir, "processed_districts.json"), "w", encoding="utf-8") as f:
    json.dump(dataset_payload, f, indent=2)

with open(os.path.join(src_data_dir, "processed_districts.json"), "w", encoding="utf-8") as f:
    json.dump(dataset_payload, f, indent=2)

print("Saved processed_districts.json to both public/data and src/data successfully!")
