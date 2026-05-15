export interface RegionCat {  
  cat: string;  
  cj: number;  
  competitor: number;  
  ms: number;  
  cj_ref: number;  
  competitor_ref: number;  
  ms_ref: number;  
  ms_diff: number;  
}  
  
export interface SKU {  
  r2: string;  
  pc: string;  
  pn: string;  
  pos: number;  
  qty: number;  
  mk: string;  
  c2: string;  
  c3: string;  
  mr: number;  
  mr3: number;  
  pr: number;  
  pr3: number;  
}  
  
export interface CatHierarchy {  
  [cat: string]: {  
    level: 'cat2' | 'cat3';  
    children?: string[];  
    parent?: string;  
  };  
}  
