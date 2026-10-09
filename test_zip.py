import zipfile
import xml.etree.cElementTree as ET
import json
import time

t0 = time.time()
raw_dir = r"C:\Users\Amey\Desktop\raw"
xlsx_path = os_path = r"C:\Users\Amey\Desktop\raw\village_dchb.xlsx"

print("Opening zip archive...")
with zipfile.ZipFile(xlsx_path, 'r') as z:
    namelist = z.namelist()
    print("Files in xlsx:", [n for n in namelist if 'sheet' in n or 'shared' in n or 'workbook' in n])
    
    # Read shared strings if any
    shared_strings = []
    if 'xl/sharedStrings.xml' in namelist:
        print("Reading shared strings...")
        with z.open('xl/sharedStrings.xml') as f:
            for event, elem in ET.iterparse(f):
                if elem.tag.endswith('}t') or elem.tag == 't':
                    shared_strings.append(elem.text or '')
                elif elem.tag.endswith('}si') or elem.tag == 'si':
                    elem.clear()
        print(f"Loaded {len(shared_strings)} shared strings in {time.time()-t0:.2f}s")
