from python_calamine import CalamineWorkbook
import json

wb_vil = CalamineWorkbook.from_path('public/data/village_dchb.xlsx')
rows_vil = wb_vil.get_sheet_by_name('Village_Data_2700').to_python()

def is_1(val):
    if val is None:
        return False
    try:
        return int(float(val)) == 1
    except:
        return str(val).strip() == '1'

def to_num(val):
    if val is None:
        return 0.0
    try:
        return float(val)
    except:
        return 0.0

village_districts = {}

for r in rows_vil[1:]:
    if r[2] is None:
        continue
    try:
        dcode = str(int(float(r[2]))).zfill(3)
    except:
        continue
    dname = str(r[3]).strip()
    
    if dcode not in village_districts:
        village_districts[dcode] = {
            'code': dcode,
            'name': dname,
            'totalVillages': 0,
            'pop': 0,
            'households': 0,
            'bus': 0,
            'pvtBus': 0,
            'rail': 0,
            'allWeather': 0,
            'pucca': 0,
            'kutcha': 0,
            'treatedWater': 0,
            'yearRoundWater': 0,
            'sanitation': 0,
            'drainage': 0,
            'waste': 0,
            'mobile': 0,
            'csc': 0,
            'primarySchool': 0,
            'healthFacility': 0,
            'bank': 0,
            'market': 0,
            'pds': 0
        }
    
    vd = village_districts[dcode]
    vd['totalVillages'] += 1
    vd['pop'] += int(to_num(r[25]))
    vd['households'] += int(to_num(r[8]))
    
    if is_1(r[271]): vd['bus'] += 1
    if is_1(r[273]): vd['pvtBus'] += 1
    if is_1(r[275]): vd['rail'] += 1
    if is_1(r[307]): vd['allWeather'] += 1
    if is_1(r[301]): vd['pucca'] += 1
    if is_1(r[303]): vd['kutcha'] += 1
    if is_1(r[207]): vd['treatedWater'] += 1
    if is_1(r[208]): vd['yearRoundWater'] += 1
    if is_1(r[244]): vd['sanitation'] += 1
    if is_1(r[237]) or is_1(r[240]): vd['drainage'] += 1
    if is_1(r[249]): vd['waste'] += 1
    if is_1(r[265]): vd['mobile'] += 1
    if is_1(r[267]): vd['csc'] += 1
    if is_1(r[41]) or is_1(r[43]): vd['primarySchool'] += 1
    
    # Health: CHC, PHC, MHC or doctors
    if to_num(r[132]) > 0 or to_num(r[138]) > 0 or to_num(r[186]) > 0:
        vd['healthFacility'] += 1
        
    if is_1(r[315]) or is_1(r[317]): vd['bank'] += 1
    if is_1(r[325]): vd['market'] += 1
    if is_1(r[323]): vd['pds'] += 1

print(f"Computed village coverage for {len(village_districts)} districts:")
for dcode in sorted(village_districts.keys())[:8]:
    vd = village_districts[dcode]
    v_cnt = vd['totalVillages']
    print(f"District {dcode} ({vd['name']}): Villages={v_cnt}, Bus={vd['bus']/v_cnt*100:.1f}%, Road={vd['allWeather']/v_cnt*100:.1f}%, TreatedWater={vd['treatedWater']/v_cnt*100:.1f}%, Mobile={vd['mobile']/v_cnt*100:.1f}%, CSC={vd['csc']/v_cnt*100:.1f}%")
