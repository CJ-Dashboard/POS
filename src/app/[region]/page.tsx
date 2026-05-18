'use client';  
  
import { useParams, useRouter } from 'next/navigation';  
import { useEffect, useState, useMemo } from 'react';  
import { RegionCat } from '@/types';  
  
interface CatHierarchyItem {  
  level: 'cat2' | 'cat3';  
  children?: string[];  
  parent?: string;  
}  
  
export default function RegionPage() {  
  const params = useParams();  
  const router = useRouter();  
  const region = decodeURIComponent(params.region as string);  
  
  const [catList, setCatList] = useState<RegionCat[]>([]);  
  const [catHierarchy, setCatHierarchy] = useState<Record<string, CatHierarchyItem>>({});  
  const [loading, setLoading] = useState(true);  
  const [searchQuery, setSearchQuery] = useState('');  
  
  useEffect(() => {  
    const loadData = async () => {  
      try {  
        const [regionRes, hierarchyRes] = await Promise.all([  
          fetch('/data/regions.json'),  
          fetch('/data/cat_hierarchy.json')  
        ]);  
  
        const regionAll = await regionRes.json();  
        const hierarchy: Record<string, CatHierarchyItem> = await hierarchyRes.json();  
  
        setCatHierarchy(hierarchy);  
        setCatList(regionAll[region] || []);  
      } catch (error) {  
        console.error('데이터 로드 실패:', error);  
      } finally {  
        setLoading(false);  
      }  
    };  
    loadData();  
  }, [region]);  
  
  // cat2(부모) 카테고리만 필터링  
  const cat2List = useMemo(() => {  
    return catList.filter((item) => {  
      const h = catHierarchy[item.cat];  
      return !h || h.level === 'cat2';  
    });  
  }, [catList, catHierarchy]);  
  
  // 검색 필터 적용  
  const filteredList = useMemo(() => {  
    if (!searchQuery) return cat2List;  
    return cat2List.filter((item) =>  
      item.cat.toLowerCase().includes(searchQuery.toLowerCase())  
    );  
  }, [cat2List, searchQuery]);  
  
  // 전체 CJ MS 평균  
  const overallMs = useMemo(() => {  
    if (catList.length === 0) return null;  
    const total = catList.reduce((sum, c) => sum + (c.ms || 0), 0);  
    return total / catList.length;  
  }, [catList]);  
  
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
  
  return (  
    <div style={{  
      minHeight: '100vh', background: '#f4f6fb',  
      padding: '12px', fontFamily: "'Noto Sans KR', sans-serif",  
      boxSizing: 'border-box', width: '100%', overflowX: 'hidden'  
    }}>  
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>  
  
        {/* 뒤로가기 */}  
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
  
        {/* 헤더 */}  
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '2px' }}>  
          📍 {region}  
        </h1>  
        <p style={{ fontSize: '11px', color: '#888', marginBottom: '12px' }}>  
          총 {filteredList.length}개 카테고리  
        </p>  
  
        {/* 전체 요약 카드 */}  
        {overallMs != null && (  
          <div style={{  
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',  
            borderRadius: '12px', padding: '14px 16px', marginBottom: '12px',  
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'  
          }}>  
            <div>  
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginBottom: '4px' }}>  
                {region} 전체 평균 CJ MS  
              </div>  
              <div style={{ fontSize: '26px', fontWeight: '800', color: 'white' }}>  
                {(overallMs * 100).toFixed(1)}%  
              </div>  
            </div>  
            <div style={{ fontSize: '32px' }}>🏪</div>  
          </div>  
        )}  
  
        {/* 검색 */}  
        <div style={{  
          background: 'white', borderRadius: '12px', padding: '10px 14px',  
          marginBottom: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',  
          display: 'flex', alignItems: 'center', gap: '8px'  
        }}>  
          <span style={{ fontSize: '14px' }}>🔍</span>  
          <input  
            type="text"  
            placeholder="카테고리 검색..."  
            value={searchQuery}  
            onChange={(e) => setSearchQuery(e.target.value)}  
            style={{  
              flex: 1, border: 'none', outline: 'none',  
              fontSize: '13px', color: '#1a1a2e', background: 'transparent'  
            }}  
          />  
        </div>  
  
        {/* 카테고리 목록 */}  
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>  
          {filteredList.map((item) => {  
            const msDiff = item.ms_diff ?? (item.ms != null && item.ms_ref != null ? item.ms - item.ms_ref : 0);  
            const isPos = msDiff >= 0;  
  
            return (  
              <div  
                key={item.cat}  
                onClick={() => router.push(`/${encodeURIComponent(region)}/${encodeURIComponent(item.cat)}`)}  
                style={{  
                  background: 'white', borderRadius: '12px', padding: '14px 16px',  
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)', cursor: 'pointer',  
                  display: 'grid', gridTemplateColumns: '1fr 72px 72px 72px',  
                  alignItems: 'center', gap: '8px',  
                  transition: 'box-shadow 0.2s',  
                  border: '1.5px solid #f0f0f0'  
                }}  
              >  
                {/* 카테고리명 */}  
                <div>  
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1a1a2e' }}>  
                    {item.cat}  
                  </div>  
                  <div style={{ fontSize: '9px', color: '#aaa', marginTop: '2px' }}>  
                    탭하여 상세보기 →  
                  </div>  
                </div>  
  
                {/* 지점 MS */}  
                <div style={{ textAlign: 'center' }}>  
                  <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>지점 MS</div>  
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#667eea' }}>  
                    {item.ms != null ? (item.ms * 100).toFixed(1) + '%' : '-'}  
                  </div>  
                </div>  
  
                {/* 영본 MS */}  
                <div style={{ textAlign: 'center' }}>  
                  <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>영본 MS</div>  
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#38a169' }}>  
                    {item.ms_ref != null ? (item.ms_ref * 100).toFixed(1) + '%' : '-'}  
                  </div>  
                </div>  
  
                {/* 영본 比 */}  
                <div style={{ textAlign: 'center' }}>  
                  <div style={{ fontSize: '9px', color: '#aaa', marginBottom: '2px' }}>영본 比</div>  
                  <div style={{ fontSize: '13px', fontWeight: '800', color: isPos ? '#3182ce' : '#e53e3e' }}>  
                    {isPos ? '▲' : '▼'}{Math.abs(msDiff * 100).toFixed(1)}%  
                  </div>  
                </div>  
              </div>  
            );  
          })}  
        </div>  
  
        {filteredList.length === 0 && (  
          <div style={{  
            textAlign: 'center', padding: '40px', color: '#aaa', fontSize: '14px'  
          }}>  
            검색 결과가 없어요 😅  
          </div>  
        )}  
  
        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '16px', textAlign: 'center' }}>  
          {region} · 26년 4월 누계 기준  
        </p>  
      </div>  
    </div>  
  );  
}  
