import openpyxl  
  
file_path = r"raw/POS RAW.xlsx"  
wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)  
  
ws = wb["raw1"]  
  
su_to_jijeom = {}  
  
for row in ws.iter_rows(min_row=3, max_row=ws.max_row, min_col=5, max_col=6, values_only=True):  
    su = row[0]  
    jijeom = row[1]  
    if su is None or jijeom is None:  
        continue  
    if su not in su_to_jijeom:  
        su_to_jijeom[su] = set()  
    su_to_jijeom[su].add(jijeom)  
  
print("=== SU(영업본부) → 지점 매핑 ===")  
for su, jijeoms in sorted(su_to_jijeom.items()):  
    print(f"  {su}: {sorted(jijeoms)}")  
