import zipfile
import xml.etree.cElementTree as ET
import pandas as pd
import json
import os
import re

raw_dir = r"C:\Users\Amey\Desktop\raw"

def parse_xlsx_fast(file_path, sheet_name=None):
    with zipfile.ZipFile(file_path, 'r') as z:
        # 1. Read shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            with z.open('xl/sharedStrings.xml') as f:
                for event, elem in ET.iterparse(f):
                    if elem.tag.endswith('}t') or elem.tag == 't':
                        shared_strings.append(elem.text or '')
                    elif elem.tag.endswith('}si') or elem.tag == 'si':
                        elem.clear()

        # 2. Find target sheet
        sheet_target = 'xl/worksheets/sheet1.xml'
        # Read workbook to match sheet name if provided
        if sheet_name and 'xl/workbook.xml' in z.namelist():
            with z.open('xl/workbook.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                # find sheet
                for s in root.iter():
                    if s.tag.endswith('sheet') and s.attrib.get('name') == sheet_name:
                        rId = s.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                        # look up in rels
                        with z.open('xl/_rels/workbook.xml.rels') as rf:
                            rtree = ET.parse(rf)
                            for rel in rtree.getroot().iter():
                                if rel.attrib.get('Id') == rId:
                                    target = rel.attrib.get('Target')
                                    if target.startswith('/'):
                                        sheet_target = target[1:]
                                    elif not target.startswith('xl/'):
                                        sheet_target = 'xl/' + target
                                    else:
                                        sheet_target = target
                        break

        print(f"Parsing {sheet_target} in {os.path.basename(file_path)}...")
        rows = []
        with z.open(sheet_target) as f:
            for event, elem in ET.iterparse(f):
                if elem.tag.endswith('}row') or elem.tag == 'row':
                    row_data = {}
                    for c in elem.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c') or elem.findall('c'):
                        ref = c.attrib.get('r', '')
                        col_letters = "".join(re.findall(r'[A-Za-z]+', ref))
                        # convert col_letters to 0-based col index
                        col_idx = 0
                        for char in col_letters:
                            col_idx = col_idx * 26 + (ord(char.upper()) - ord('A') + 1)
                        col_idx -= 1
                        
                        t = c.attrib.get('t')
                        v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        if v is None:
                            v = c.find('v')
                        
                        val = None
                        if v is not None and v.text is not None:
                            if t == 's':
                                val = shared_strings[int(v.text)] if int(v.text) < len(shared_strings) else None
                            else:
                                val = v.text
                        elif t == 'inlineStr':
                            is_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}is')
                            if is_elem is not None:
                                t_elem = is_elem.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                                if t_elem is not None:
                                    val = t_elem.text
                        row_data[col_idx] = val
                    
                    if row_data:
                        max_c = max(row_data.keys())
                        row_arr = [row_data.get(i) for i in range(max_c + 1)]
                        rows.append(row_arr)
                    elem.clear()
        return rows

print("Testing fast parser on village_dchb.xlsx...")
v_rows = parse_xlsx_fast(os.path.join(raw_dir, "village_dchb.xlsx"), "Village_Data_2700")
print(f"Parsed {len(v_rows)} village rows!")
print("Header row length:", len(v_rows[0]))
print("First row:", v_rows[0][:10])
