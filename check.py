import json  
  
with open(r"public/data/regions.json", "r", encoding="utf-8") as f:  
    regions = json.load(f)  
  
gyeongbuk = regions.get("경북", [])  
for item in gyeongbuk:  
    if item["cat"] == "양념장":  
        print(f"양념장 CJ: {item['cj']}")  
        print(f"양념장 경쟁: {item['competitor']}")  
        print(f"양념장 MS: {item['ms']}")  
        total = item['cj'] + item['competitor']  
        print(f"총 POS: {total:.2f}")  
