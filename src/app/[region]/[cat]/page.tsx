'use client';  
  
import { useParams, useRouter } from 'next/navigation';  
import { useEffect, useState, useMemo } from 'react';  
import { SKU, RegionCat } from '@/types';  
  
interface ComputedSKU extends SKU {  
  ms: number;  
  price: number;  
}  
  
interface CatHierarchyItem {  
  level: 'cat2' | 'cat3';  
  children?: string[];  
  parent?: string;  
}  
  
interface MakerSummary {  
  maker: string;  
  ms: number;  
  ms_ref: number;  
  pos: number;  
}  
  
export default function CatPage() {  
  const params = useParams();  
  const router = useRouter();  
  const region = decodeURIComponent(params.region as string);  
  const cat = decodeURIComponent(params.cat as string);  
  
  const [allData, setAllData] = useState<SKU[]>([]);  
  const [catSummary, setCatSummary] = useState<RegionCat | null>(null);  
  const [selectedRegion2, setSelectedRegion2] = useState('');  
  const [selectedSubCat, setSelectedSubCat] = useState('');  
  const [catHierarchy, setCatHierarchy] = useState<Record<string, CatHierarchyItem>>({});  
  const [loading, setLoading] = useState(true);  
  
  useEffect(() => {  
    const loadData = async () => {  
      try {  
        const safeCat = cat.replace(/\//g, '_').replace(/ /g, '_');  
        const [skuRes, regionRes, hierarchyRes] = await Promise.all([  
          fetch(`/data/skus/${region}/${safeCat}.json`),  
          fetch('/data/regions.json'),  
          fetch('/data/cat_hierarchy.json')  
        ]);  
  
        const regionAll = await regionRes.json();  
        const hierarchy: Record<string, CatHierarchyItem> = await hierarchyRes.json();  
        setCatHierarchy(hierarchy);  
  
        let catData: SKU[] = [];  
        if (skuRes.ok) {  
          const skuArr = await skuRes.json();  
          catData = skuArr.filter((sku: SKU) => sku.r2 !== null);  
        }  
  
        if (catData.length === 0 && hierarchy[cat]?.children?.length) {  
          const children = hierarchy[cat].children || [];  
          await Promise.all(  
            children.map(async (child) => {  
              const safeChild = child.replace(/\//g, '_').replace(/ /g, '_');  
              const res = await fetch(`/data/skus/${region}/${safeChild}.json`);  
              if (res.ok) {  
                const arr = await res.json();  
                catData = catData.concat(arr.filter((sku: SKU) => sku.r2 !== null));  
              }  
            })  
          );  
        }  
  
        setAllData(catData);  
        const regionCats: RegionCat[] = regionAll[region] || [];  
        const found = regionCats.find((item) => item.cat === cat) || null;  
        setCatSummary(found);  
      } catch (error) {  
        console.error('데이터 로드 실패:', error);  
      } finally {  
        setLoading(false);  
      }  
    };  
    loadData();  
  }, [cat, region]);  
  
  const region2List = useMemo(() => {  
    return Array.from(new Set(allData.map((s) => s.r2).filter(Boolean))).sort();  
  }, [allData]);  
  
  const subCatList = useMemo(() => {  
    if (catHierarchy[cat]?.level === 'cat2' && catHierarchy[cat]?.children?.length) {  
      return catHierarchy[cat].children || [];  
    }  
    return [];  
  }, [cat, catHierarchy]);  
  
  const computedData = useMemo((): ComputedSKU[] => {  
    let source = allData;  
  
    if (selectedRegion2) {  
      source = source.filter((s) => s.r2 === selectedRegion2);  
    } else {  
      const map = new Map<string, SKU & { pos: number; qty: number }>();  
      source.forEach((sku) => {  
        const key = `${sku.pn}__${sku.mk}__${sku.c3}__${sku.pc}`;  
        if (!map.has(key)) {  
          map.set(key, { ...sku, pos: 0, qty: 0 });  
        }  
        const entry = map.get(key)!;  
        entry.pos += sku.pos || 0;  
        entry.qty = (entry.qty || 0) + (sku.qty || 0);  
        entry.mr = sku.mr || 0;  
        entry.mr3 = sku.mr3 || 0;  
        entry.pr = sku.pr || 0;  
        entry.pr3 = sku.pr3 || 0;  
      });  
      source = Array.from(map.values());  
    }  
  
    if (selectedSubCat) {  
      source = source.filter((s) => s.c3 === selectedSubCat || s.c2 === selectedSubCat);  
    }  
  
    const totalPos = source.reduce((sum, s) => sum + (s.pos || 0), 0);  
  
    return source  
      .map((s) => ({  
        ...s,  
        ms: totalPos > 0 ? s.pos / totalPos : 0,  
        price: s.qty && s.qty > 0 ? (s.pos / s.qty) * 1000000 : 0  
      }))  
      .sort((a, b) => b.pos - a.pos);  
  }, [allData, selectedRegion2, selectedSubCat]);  
  
  const dynamicSummary = useMemo(() => {  
    if (!selectedRegion2) return null;  
    const totalPos = computedData.reduce((sum, s) => sum + (s.pos || 0), 0);  
    const cjPos = computedData.filter((s) => s.mk === 'CJ').reduce((sum, s) => sum + (s.pos || 0), 0);  
    const compPos = totalPos - cjPos;  
    return { cj: cjPos, competitor: compPos, ms: totalPos > 0 ? cjPos / totalPos : 0 };  
  }, [selectedRegion2, computedData]);  
  
      const makerSummary = useMemo((): MakerSummary[] => {  
    if (!catSummary) return [];  
  
    const totalPos = computedData.reduce((sum, s) => sum + (s.pos || 0), 0);  
    if (totalPos === 0) return [];  
  
    const makerMap = new Map<string, { pos: number; mr_sum: number }>();  
    computedData.forEach((sku) => {  
      if (!makerMap.has(sku.mk)) {  
        makerMap.set(sku.mk, { pos: 0, mr_sum: 0 });  
      }  
      const entry = makerMap.get(sku.mk)!;  
      entry.pos += sku.pos || 0;  
      entry.mr_sum += sku.mr || 0;  
    });  
  
    return Array.from(makerMap.entries())  
      .map(([maker, val]) => ({  
        maker,  
        ms: val.pos / totalPos,  
        ms_ref: val.mr_sum,  
        pos: val.pos  
      }))  
      .sort((a, b) => b.ms - a.ms);  
  }, [computedData, catSummary]);  
  
  if (loading) {  
    return (  
      <div style={{  
        display: 'flex', alignItems: 'center', justifyContent: 'center',  
        height: '100vh', fontSize: '16px', color: '#666',  
        fontFamily: "'Noto Sans KR', sans-serif"  
      }}>  
        로딩 중...  
      </div>  
    );  
  }  
  
  const displayMs = selectedRegion2 && dynamicSummary ? dynamicSummary.ms : catSummary?.ms;  
  const displayCj = selectedRegion2 && dynamicSummary ? dynamicSummary.cj : catSummary?.cj;  
  const displayComp = selectedRegion2 && dynamicSummary ? dynamicSummary.competitor : catSummary?.competitor;  
  const msLocal = displayMs != null ? (displayMs * 100).toFixed(1) + '%' : '-';  
  const msRef = catSummary?.ms_ref != null ? (catSummary.ms_ref * 100).toFixed(1) + '%' : '-';  
  const msDiffVal = displayMs != null && catSummary?.ms_ref != null ? displayMs - catSummary.ms_ref : catSummary?.ms_diff ?? 0;  
  const isPositive = msDiffVal >= 0;  
  
  return (  
    <div style={{  
      minHeight: '100vh', background: '#f4f6fb',  
      padding: '12px', fontFamily: "'Noto Sans KR', sans-serif",  
      boxSizing: 'border-box', width: '100%', overflowX: 'hidden'  
    }}>  
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>  
  
        <button  
          onClick={() => router.back()}  
          style={{  
            marginBottom: '12px', padding: '8px 16px',  
            background: '#667eea', color: 'white', border: 'none',  
            borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'  
          }}  
        >  
          ← 돌아가기  
        </button>  
  
        <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e', marginBottom: '2px' }}>  
          📍 {region} · {cat}  
        </h1>  
        <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>  
          {selectedRegion2 ? selectedRegion2 : `${region} 전체 합산`} · {selectedSubCat ? selectedSubCat : '전체'}  
        </p>  
  
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>  
          <div style={{  
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center'  
          }}>  
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>  
              {selectedRegion2 ? selectedRegion2 : region} MS  
            </div>  
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{msLocal}</div>  
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>  
              CJ {displayCj?.toFixed(0)} / 경쟁 {displayComp?.toFixed(0)}  
            </div>  
          </div>  
          <div style={{  
            background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',  
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center'  
          }}>  
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>영본 MS</div>  
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{msRef}</div>  
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>  
              CJ {catSummary?.cj_ref?.toFixed(0)} / 경쟁 {catSummary?.competitor_ref?.toFixed(0)}  
            </div>  
          </div>  
          <div style={{  
            background: isPositive  
              ? 'linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)'  
              : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',  
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center'  
          }}>  
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>영본 比</div>  
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>  
              {isPositive ? '+' : ''}{(msDiffVal * 100).toFixed(1)}%  
            </div>  
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>  
              {isPositive ? '▲ 영본 상회' : '▼ 영본 하회'}  
            </div>  
          </div>  
        </div>  
  
        <div style={{  
          background: 'white', borderRadius: '12px', padding: '12px',  
          marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',  
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'  
        }}>  
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#444', whiteSpace: 'nowrap' }}>📌 지역2</span>  
          <select  
            value={selectedRegion2}  
            onChange={(e) => setSelectedRegion2(e.target.value)}  
            style={{  
              flex: 1, padding: '7px 10px', borderRadius: '8px',  
              border: '1.5px solid #e0e0e0', fontSize: '12px',  
              fontWeight: '600', color: selectedRegion2 ? '#1a1a2e' : '#aaa',  
              background: '#f9f9f9', outline: 'none', cursor: 'pointer'  
            }}  
          >  
            <option value="">전체</option>  
            {region2List.map((r2) => (  
              <option key={r2} value={r2}>{r2}</option>  
            ))}  
          </select>  
  
          {subCatList.length > 0 && (  
            <>  
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#444', whiteSpace: 'nowrap' }}>📂 소분류</span>  
              <select  
                value={selectedSubCat}  
                onChange={(e) => setSelectedSubCat(e.target.value)}  
                style={{  
                  flex: 1, padding: '7px 10px', borderRadius: '8px',  
                  border: '1.5px solid #e0e0e0', fontSize: '12px',  
                  fontWeight: '600', color: selectedSubCat ? '#1a1a2e' : '#aaa',  
                  background: '#f9f9f9', outline: 'none', cursor: 'pointer'  
                }}  
              >  
                <option value="">전체</option>  
                {subCatList.map((subCat) => (  
                  <option key={subCat} value={subCat}>{subCat}</option>  
                ))}  
              </select>  
            </>  
          )}  
        </div>  
  
        <div style={{  
          background: 'white', borderRadius: '12px', padding: '14px',  
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px'  
        }}>  
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a2e', marginBottom: '12px' }}>  
            🏆 제조사별 MS 분석  
          </div>  
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>  
            {makerSummary.map((m, idx) => {  
              const isCJ = m.maker === 'CJ';  
              const diff = m.ms - m.ms_ref;  
              const isPos = diff >= 0;  
              const rank = idx + 1;  
              return (  
                <div  
                  key={idx}  
                  style={{  
                    background: isCJ ? '#f0f4ff' : '#fafafa',  
                    borderRadius: '10px', padding: '12px 14px',  
                    border: isCJ ? '1.5px solid #667eea' : '1.5px solid #eee',  
                    display: 'grid',  
                    gridTemplateColumns: '28px 1fr 1fr 1fr 1fr',  
                    alignItems: 'center', gap: '8px'  
                  }}  
                >  
                  <div style={{  
                    width: '24px', height: '24px', borderRadius: '50%',  
                    background: rank === 1 ? '#f6c90e' : rank === 2 ? '#b0b0b0' : rank === 3 ? '#cd7f32' : '#e8e8e8',  
                    display: 'flex', alignItems: 'center', justifyContent: 'center',  
                    fontSize: '10px', fontWeight: '800', color: rank <= 3 ? 'white' : '#666'  
                  }}>  
                    {rank}  
                  </div>  
                  <div>  
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isCJ ? '#667eea' : '#1a1a2e' }}>  
                      {m.maker}  
                    </div>  
                    <div style={{ fontSize: '9px', color: '#aaa', marginTop: '1px' }}>  
                      POS {m.pos.toFixed(0)}  
                    </div>  
                  </div>  
                  <div style={{ textAlign: 'center' }}>  
                    <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>지점 MS</div>  
                    <div style={{ fontSize: '14px', fontWeight: '800', color: isCJ ? '#667eea' : '#e53e3e' }}>  
                      {(m.ms * 100).toFixed(1)}%  
                    </div>  
                  </div>  
                  <div style={{ textAlign: 'center' }}>  
                    <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>영본 MS</div>  
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#38a169' }}>  
                      {(m.ms_ref * 100).toFixed(1)}%  
                    </div>  
                  </div>  
                  <div style={{ textAlign: 'center' }}>  
                    <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>영본 比</div>  
                    <div style={{ fontSize: '13px', fontWeight: '800', color: isPos ? '#3182ce' : '#e53e3e' }}>  
                      {isPos ? '▲' : '▼'}{Math.abs(diff * 100).toFixed(1)}%  
                    </div>  
                  </div>  
                </div>  
              );  
            })}  
          </div>  
        </div>  
  
        <button  
          onClick={() => router.push(`/${encodeURIComponent(region)}/${encodeURIComponent(cat)}/sku`)}  
          style={{  
            width: '100%', padding: '16px',  
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  
            border: 'none', borderRadius: '14px', cursor: 'pointer',  
            color: 'white', fontSize: '15px', fontWeight: '800',  
            boxShadow: '0 4px 20px rgba(102,126,234,0.4)'  
          }}  
        >  
          📦 SKU 상세 분석 보기 →  
        </button>  
  
        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '12px', textAlign: 'center' }}>  
          총 {makerSummary.length}개 제조사  
        </p>  
      </div>  
    </div>  
  );  
}  
