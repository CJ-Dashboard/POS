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
  
export default function SkuPage() {  
  const params = useParams();  
  const router = useRouter();  
  const region = decodeURIComponent(params.region as string);  
  const cat = decodeURIComponent(params.cat as string);  
  
  const [allData, setAllData] = useState<SKU[]>([]);  
  const [catSummary, setCatSummary] = useState<RegionCat | null>(null);  
  const [searchProduct, setSearchProduct] = useState('');  
  const [searchMaker, setSearchMaker] = useState('');  
  const [selectedRegion2, setSelectedRegion2] = useState('');  
  const [selectedSubCat, setSelectedSubCat] = useState('');  
  const [catHierarchy, setCatHierarchy] = useState<Record<string, CatHierarchyItem>>({});  
  const [showProductSugg, setShowProductSugg] = useState(false);  
  const [displayCount, setDisplayCount] = useState(10);  
  const [loading, setLoading] = useState(true);  
  
  useEffect(() => {  
    const loadData = async () => {  
      try {  
        const safeCat = cat.replace(/\//g, '_').replace(/ /g, '_');  
  
        const [regionRes, hierarchyRes] = await Promise.all([  
          fetch('/data/regions.json'),  
          fetch('/data/cat_hierarchy.json')  
        ]);  
  
        const regionAll = await regionRes.json();  
        const hierarchy: Record<string, CatHierarchyItem> = await hierarchyRes.json();  
        setCatHierarchy(hierarchy);  
  
        let catData: SKU[] = [];  
  
        const skuRes = await fetch(`/data/skus/${region}/${safeCat}.json`);  
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
  
    // 공식 MS 기준으로 정규화  
    // CJ SKU 합계 = 공식 CJ MS, 경쟁사 SKU 합계 = 공식 경쟁사 MS  
    const officialCjMs = catSummary?.ms || 0;  
    const officialCompMs = 1 - officialCjMs;  
  
    const cjTotalPos = source  
      .filter((s) => s.mk === 'CJ')  
      .reduce((sum, s) => sum + (s.pos || 0), 0);  
    const compTotalPos = source  
      .filter((s) => s.mk !== 'CJ')  
      .reduce((sum, s) => sum + (s.pos || 0), 0);  
  
    return source  
      .map((s) => {  
        const isCJ = s.mk === 'CJ';  
        let ms = 0;  
        if (isCJ && cjTotalPos > 0) {  
          ms = (s.pos / cjTotalPos) * officialCjMs;  
        } else if (!isCJ && compTotalPos > 0) {  
          ms = (s.pos / compTotalPos) * officialCompMs;  
        }  
        return {  
          ...s,  
          ms,  
          price: s.qty && s.qty > 0 ? (s.pos / s.qty) * 1000000 : 0  
        };  
      })  
      .sort((a, b) => b.pos - a.pos);  
  }, [allData, selectedRegion2, selectedSubCat, catSummary]);   
  
  const filtered = useMemo(() => {  
    let result = computedData;  
    if (searchProduct) {  
      result = result.filter((s) =>  
        s.pn?.toLowerCase().includes(searchProduct.toLowerCase())  
      );  
    }  
    if (searchMaker) {  
      result = result.filter((s) => s.mk === searchMaker);  
    }  
    return result;  
  }, [computedData, searchProduct, searchMaker]);  
  
  const displayedData = filtered.slice(0, displayCount);  
  
  const productSuggestions = useMemo(() => {  
    if (!searchProduct) return [];  
    return Array.from(  
      new Set(  
        computedData  
          .filter((s) => s.pn?.toLowerCase().includes(searchProduct.toLowerCase()))  
          .map((s) => s.pn)  
      )  
    ).slice(0, 8);  
  }, [searchProduct, computedData]);  
  
  const makerList = useMemo(() => {  
    return Array.from(new Set(computedData.map((s) => s.mk).filter(Boolean)));  
  }, [computedData]);  
  
  const handleReset = () => {  
    setSearchProduct('');  
    setSearchMaker('');  
    setSelectedRegion2('');  
    setSelectedSubCat('');  
    setDisplayCount(10);  
    setShowProductSugg(false);  
  };  
  
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
  
  const msLocal = catSummary?.ms != null ? (catSummary.ms * 100).toFixed(1) + '%' : '-';  
  const msRef = catSummary?.ms_ref != null ? (catSummary.ms_ref * 100).toFixed(1) + '%' : '-';  
  const msDiff = catSummary?.ms_diff ?? 0;  
  const isPositive = msDiff >= 0;  
  
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
          ← 경쟁사 분석으로  
        </button>  
  
        <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a2e', marginBottom: '2px' }}>  
          📦 {region} · {cat} · SKU 분석  
        </h1>  
        <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>  
          {selectedRegion2 ? selectedRegion2 : `${region} 전체 합산`} · {selectedSubCat ? selectedSubCat : '전체'} · POS 내림차순  
        </p>  
  
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>  
          <div style={{  
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  
            borderRadius: '10px', padding: '10px 8px', textAlign: 'center'  
          }}>  
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>{region} MS</div>  
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'white' }}>{msLocal}</div>  
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>  
              CJ {catSummary?.cj?.toFixed(0)} / 경쟁 {catSummary?.competitor?.toFixed(0)}  
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
              {isPositive ? '+' : ''}{(msDiff * 100).toFixed(1)}%  
            </div>  
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>  
              {isPositive ? '▲ 영본 상회' : '▼ 영본 하회'}  
            </div>  
          </div>  
        </div>  
  
        <div style={{  
          background: 'white', borderRadius: '12px', padding: '12px',  
          marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',  
          display: 'flex', flexDirection: 'column', gap: '8px'  
        }}>  
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>  
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#444', whiteSpace: 'nowrap' }}>📌 지역2</span>  
            <select  
              value={selectedRegion2}  
              onChange={(e) => { setSelectedRegion2(e.target.value); setDisplayCount(10); }}  
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
                  onChange={(e) => { setSelectedSubCat(e.target.value); setDisplayCount(10); }}  
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
  
          <div style={{ position: 'relative' }}>  
            <div style={{  
              display: 'flex', alignItems: 'center', gap: '8px',  
              border: '1.5px solid #e0e0e0', borderRadius: '8px',  
              padding: '7px 10px', background: '#f9f9f9'  
            }}>  
              <span>🔍</span>  
              <input  
                type="text"  
                value={searchProduct}  
                onChange={(e) => { setSearchProduct(e.target.value); setShowProductSugg(true); setDisplayCount(10); }}  
                onFocus={() => setShowProductSugg(true)}  
                placeholder="상품명 검색..."  
                style={{  
                  flex: 1, border: 'none', outline: 'none',  
                  fontSize: '13px', color: '#1a1a2e', background: 'transparent'  
                }}  
              />  
              {(searchProduct || searchMaker || selectedRegion2 || selectedSubCat) && (  
                <button  
                  onClick={handleReset}  
                  style={{  
                    padding: '3px 8px', background: '#fff0f0', border: 'none',  
                    borderRadius: '6px', cursor: 'pointer', fontSize: '11px',  
                    color: '#e53e3e', fontWeight: '600'  
                  }}  
                >  
                  초기화  
                </button>  
              )}  
            </div>  
            {showProductSugg && productSuggestions.length > 0 && (  
              <div style={{  
                position: 'absolute', top: '100%', left: 0, right: 0,  
                background: 'white', borderRadius: '8px',  
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',  
                zIndex: 100, maxHeight: '180px', overflowY: 'auto', marginTop: '4px'  
              }}>  
                {productSuggestions.map((name, idx) => (  
                  <div  
                    key={idx}  
                    onClick={() => { setSearchProduct(name); setShowProductSugg(false); }}  
                    style={{  
                      padding: '9px 12px', cursor: 'pointer', fontSize: '12px',  
                      color: '#1a1a2e', borderBottom: '1px solid #f5f5f5'  
                    }}  
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}  
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}  
                  >  
                    {name}  
                  </div>  
                ))}  
              </div>  
            )}  
          </div>  
  
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>  
            <button  
              onClick={() => { setSearchMaker(''); setDisplayCount(10); }}  
              style={{  
                padding: '5px 10px', borderRadius: '16px', border: 'none',  
                cursor: 'pointer', fontSize: '11px', fontWeight: '700',  
                background: searchMaker === '' ? '#667eea' : '#f0f0f0',  
                color: searchMaker === '' ? 'white' : '#555'  
              }}  
            >  
              전체  
            </button>  
            {makerList.map((maker) => (  
              <button  
                key={maker}  
                onClick={() => { setSearchMaker(maker); setDisplayCount(10); }}  
                style={{  
                  padding: '5px 10px', borderRadius: '16px', border: 'none',  
                  cursor: 'pointer', fontSize: '11px', fontWeight: '700',  
                  background: searchMaker === maker  
                    ? (maker === 'CJ' ? '#667eea' : '#e53e3e')  
                    : '#f0f0f0',  
                  color: searchMaker === maker ? 'white' : '#555'  
                }}  
              >  
                {maker}  
              </button>  
            ))}  
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>  
              <span style={{ fontSize: '10px', color: '#888' }}>표시</span>  
              <select  
                value={displayCount}  
                onChange={(e) => setDisplayCount(Number(e.target.value))}  
                style={{  
                  padding: '4px 8px', borderRadius: '6px',  
                  border: '1.5px solid #e0e0e0', fontSize: '11px',  
                  fontWeight: '600', color: '#1a1a2e',  
                  background: '#f9f9f9', outline: 'none', cursor: 'pointer'  
                }}  
              >  
                <option value={10}>10개</option>  
                <option value={30}>30개</option>  
                <option value={50}>50개</option>  
              </select>  
            </div>  
          </div>  
        </div>  
  
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} onClick={() => setShowProductSugg(false)}>  
          <table style={{  
            width: '100%', borderCollapse: 'collapse',  
            background: 'white', borderRadius: '12px',  
            overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',  
            fontSize: '11px', minWidth: '480px'  
          }}>  
            <thead>  
              <tr style={{ background: '#1a1a2e', color: 'white' }}>  
                <th rowSpan={2} style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #333', width: '30px' }}>No</th>  
                <th rowSpan={2} style={{ padding: '8px 6px', textAlign: 'left', borderRight: '1px solid #333' }}>자재명</th>  
                <th rowSpan={2} style={{ padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #333' }}>제조사</th>  
                <th style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #333', background: '#2d3a6b', whiteSpace: 'nowrap' }}>POS</th>  
                <th colSpan={3} style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #333', background: '#1a4a7a' }}>MS</th>  
                <th colSpan={2} style={{ padding: '8px 4px', textAlign: 'center', background: '#1e4d8c' }}>판가</th>  
              </tr>  
              <tr style={{ background: '#2a2a3e', color: '#ccc', fontSize: '10px' }}>  
                <th style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid #3a3a5e', whiteSpace: 'nowrap' }}>백만</th>  
                <th style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid #3a3a5e', whiteSpace: 'nowrap' }}>영본</th>  
                <th style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid #3a3a5e', whiteSpace: 'nowrap' }}>지점</th>  
                <th style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid #3a3a5e', whiteSpace: 'nowrap' }}>영본比</th>  
                <th style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid #3a3a5e', whiteSpace: 'nowrap' }}>지점</th>  
                <th style={{ padding: '6px 4px', textAlign: 'center', whiteSpace: 'nowrap' }}>영본</th>  
              </tr>  
            </thead>  
            <tbody>  
              {displayedData.map((sku, idx) => {  
                const isCJ = sku.mk === 'CJ';  
                const rankNum = idx + 1;  
                const msRefVal = selectedSubCat ? sku.mr3 : sku.mr;  
                const priceRefVal = selectedSubCat ? sku.pr3 : sku.pr;  
                const msPercent = (sku.ms * 100).toFixed(1);  
                const msRefPercent = (msRefVal * 100).toFixed(1);  
                const msDiffSku = sku.ms - msRefVal;  
                const isSkuPositive = msDiffSku >= 0;  
  
                return (  
                  <tr  
                    key={idx}  
                    style={{  
                      borderBottom: '1px solid #f0f0f0',  
                      background: isCJ  
                        ? (idx % 2 === 0 ? '#f8f9ff' : '#f0f4ff')  
                        : (idx % 2 === 0 ? 'white' : '#fafafa')  
                    }}  
                  >  
                    <td style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #eee' }}>  
                      <div style={{  
                        width: '20px', height: '20px', borderRadius: '50%',  
                        display: 'flex', alignItems: 'center', justifyContent: 'center',  
                        margin: '0 auto',  
                        background: rankNum === 1 ? '#f6c90e' : rankNum === 2 ? '#b0b0b0' : rankNum === 3 ? '#cd7f32' : '#e8e8e8',  
                        color: rankNum <= 3 ? 'white' : '#666',  
                        fontSize: '9px', fontWeight: '800'  
                      }}>  
                        {rankNum}  
                      </div>  
                    </td>  
                    <td style={{ padding: '8px 6px', borderRight: '1px solid #eee' }}>  
                      <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '11px', lineHeight: '1.4' }}>  
                        {sku.pn}  
                      </div>  
                      <div style={{ fontSize: '9px', color: '#aaa', marginTop: '1px' }}>  
                        {sku.c3} · {sku.pc}  
                      </div>  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #eee' }}>  
                      <span style={{  
                        display: 'inline-block', padding: '1px 6px', borderRadius: '8px',  
                        fontSize: '10px', fontWeight: '800',  
                        background: isCJ ? '#eef2ff' : '#fff5f5',  
                        color: isCJ ? '#667eea' : '#e53e3e'  
                      }}>  
                        {sku.mk}  
                      </span>  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'right', borderRight: '1px solid #eee', fontWeight: '600', color: '#1a1a2e' }}>  
                      {sku.pos != null ? sku.pos.toFixed(0) : '-'}  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #eee' }}>  
                      <span style={{ fontWeight: '700', fontSize: '11px', color: '#38a169' }}>  
                        {msRefPercent}%  
                      </span>  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #eee' }}>  
                      <span style={{ fontWeight: '800', fontSize: '12px', color: isCJ ? '#667eea' : '#e53e3e' }}>  
                        {msPercent}%  
                      </span>  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'center', borderRight: '1px solid #eee' }}>  
                      <span style={{ fontWeight: '800', fontSize: '11px', color: isSkuPositive ? '#3182ce' : '#e53e3e' }}>  
                        {isSkuPositive ? '▲' : '▼'}{Math.abs(msDiffSku * 100).toFixed(1)}%  
                      </span>  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'right', borderRight: '1px solid #eee', fontWeight: '700', color: '#1a1a2e' }}>  
                      {sku.price != null && sku.price > 0 ? Math.round(sku.price).toLocaleString() : '-'}  
                    </td>  
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '600', color: '#555' }}>  
                      {priceRefVal != null && priceRefVal > 0 ? Math.round(priceRefVal).toLocaleString() : '-'}  
                    </td>  
                  </tr>  
                );  
              })}  
            </tbody>  
          </table>  
        </div>  
  
        {filtered.length > displayCount && (  
          <button  
            onClick={() => setDisplayCount((prev) => Math.min(prev + 20, filtered.length))}  
            style={{  
              width: '100%', marginTop: '12px', padding: '11px',  
              background: 'white', border: '2px solid #667eea',  
              borderRadius: '10px', cursor: 'pointer',  
              fontSize: '12px', fontWeight: '700', color: '#667eea'  
            }}  
          >  
            더보기 ({filtered.length - displayCount}개 남음)  
          </button>  
        )}  
  
        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '10px', textAlign: 'center' }}>  
          전체 {filtered.length}개 SKU · POS 내림차순 · 단위: 백만  
        </p>  
      </div>  
    </div>  
  );  
}  
