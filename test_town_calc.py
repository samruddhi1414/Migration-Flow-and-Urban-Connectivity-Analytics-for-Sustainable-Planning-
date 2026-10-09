from python_calamine import CalamineWorkbook
import json

wb_town = CalamineWorkbook.from_path('public/data/town_dchb.xlsx')
rows_town = wb_town.get_sheet_by_name('Town_2700').to_python()

def to_num(val):
    if val is None:
        return 0.0
    try:
        return float(val)
    except:
        return 0.0

town_districts = {}

for r in rows_town[1:]:
    if r[2] is None:
        continue
    try:
        dcode = str(int(float(r[2]))).zfill(3)
    except:
        continue
    dname = str(r[3]).strip()
    
    if dcode not in town_districts:
        town_districts[dcode] = {
            'code': dcode,
            'name': dname,
            'totalTowns': 0,
            'urbanPop': 0,
            'urbanArea': 0.0,
            'puccaKm': 0.0,
            'kutchaKm': 0.0,
            'hospitalBeds': 0,
            'doctors': 0,
            'healthCentres': 0,
            'railDistSum': 0.0,
            'busDistSum': 0.0,
            'townsWithRail': 0,
            'townsWithBus': 0,
            'densities': [],
            'growthRates': []
        }
    
    td = town_districts[dcode]
    td['totalTowns'] += 1
    td['urbanPop'] += int(to_num(r[9]))
    td['urbanArea'] += to_num(r[23])
    td['puccaKm'] += to_num(r[72])
    td['kutchaKm'] += to_num(r[73])
    td['hospitalBeds'] += int(to_num(r[103]))
    td['doctors'] += int(to_num(r[105]) + to_num(r[112]))
    td['healthCentres'] += int(to_num(r[116]))
    
    rd = to_num(r[69])
    td['railDistSum'] += rd
    if rd <= 5.0:
        td['townsWithRail'] += 1
        
    bd = to_num(r[71])
    td['busDistSum'] += bd
    if bd <= 5.0:
        td['townsWithBus'] += 1
        
    dens = to_num(r[51])
    if dens > 0:
        td['densities'].append(dens)
        
    gr = to_num(r[50])
    td['growthRates'].append(gr)

print(f"Computed town metrics for {len(town_districts)} districts:")
for dcode in sorted(town_districts.keys())[:8]:
    td = town_districts[dcode]
    t_cnt = td['totalTowns']
    avg_dens = sum(td['densities'])/len(td['densities']) if td['densities'] else 0
    print(f"District {dcode} ({td['name']}): Towns={t_cnt}, UrbanPop={td['urbanPop']:,}, PuccaKm={td['puccaKm']:.1f}, Beds={td['hospitalBeds']}, AvgDensity={avg_dens:.1f}")
