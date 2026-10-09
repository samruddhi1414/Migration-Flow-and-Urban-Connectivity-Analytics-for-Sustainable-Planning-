import time
from python_calamine import CalamineWorkbook
import os

t0 = time.time()
raw_dir = r"C:\Users\Amey\Desktop\raw"

wb_vil = CalamineWorkbook.from_path(os.path.join(raw_dir, "village_dchb.xlsx"))
print(f"Village sheets: {wb_vil.sheet_names} (loaded in {time.time()-t0:.2f}s)")
t1 = time.time()
rows_vil = wb_vil.get_sheet_by_name("Village_Data_2700").to_python()
print(f"Read {len(rows_vil)} village rows in {time.time()-t1:.2f}s!")

t2 = time.time()
wb_town = CalamineWorkbook.from_path(os.path.join(raw_dir, "town_dchb.xlsx"))
rows_town = wb_town.get_sheet_by_name("Town_2700").to_python()
print(f"Read {len(rows_town)} town rows in {time.time()-t2:.2f}s!")

t3 = time.time()
wb_mig = CalamineWorkbook.from_path(os.path.join(raw_dir, "migration_d03.xlsx"))
rows_mig = wb_mig.get_sheet_by_name("D-03").to_python()
print(f"Read {len(rows_mig)} migration rows in {time.time()-t3:.2f}s!")
