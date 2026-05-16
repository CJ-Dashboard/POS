import openpyxl  
  
file_path = r"raw/POS RAW.xlsx"  
wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)  
ws = wb['범례']  
  
cat_map = {}  
for row in ws.iter_rows(min_row=3, max_row=200, values_only=True):  
    cat_detail = row[14]  
    cat1 = row[13]  
    if cat_detail is not None and cat1 is not None:  
        if cat1 in ['식품', '신선', 'FI']:  
            cat_map[cat_detail] = cat1  
  
print("=== CAT2 → CAT1 매핑 ===")  
for k, v in sorted(cat_map.items()):  
    print(f"  '{k}': '{v}',")  
print(f"\n총 {len(cat_map)}개")  
