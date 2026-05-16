import json  
  
with open(r"public/data/skus/부산/고추장.json", "r", encoding="utf-8") as f:  
    data = json.load(f)  
  
total_pos = sum(s.get('pos', 0) for s in data)  
cj_pos = sum(s.get('pos', 0) for s in data if s.get('mk') == 'CJ')  
  
print(f"총 SKU 수: {len(data)}")  
print(f"총 POS: {total_pos:.2f}")  
print(f"CJ POS: {cj_pos:.2f}")  
print(f"계산 MS: {cj_pos/total_pos*100:.1f}%" if total_pos > 0 else "계산 불가")  
  
with open(r"public/data/regions.json", "r", encoding="utf-8") as f:  
    regions = json.load(f)  
  
for item in regions.get("부산", []):  
    if item["cat"] == "고추장":  
        print(f"공식 MS: {item['ms']*100:.1f}%")  
        print(f"공식 CJ POS: {item['cj']:.2f}")  
        print(f"공식 경쟁 POS: {item['competitor']:.2f}")  
        print(f"공식 총 POS: {item['cj']+item['competitor']:.2f}")  
