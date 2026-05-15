'use client';  
  
import { useParams, useRouter } from 'next/navigation';  
import { useEffect, useState } from 'react';  
import { RegionCat } from '@/types';  
  
const SUMMARY_CATS = ['전제품', '식품', 'FI', '신선'];  
  
const CAT2_LIST = [  
  '햇반', '컵반', '소프트밀', '국물요리전체', '만두', '냉장면', '냉동면', '냉동밥',  
  '피자류', '핫도그류', '까스류', '치킨류', '중화류', '베이커리류', '양식반찬류', '한식반찬류',  
  'B2B조리냉동', 'B2C스팸', '화이트미트', '냉장편의식', 'B2B조리육', '어묵', '유부',  
  '생선구이', '두부', '콩나물', '계란', '김치', '찬류', '조미김', '웰빙간식',  
  '디저트', '고추장', '된장', '쌈장', '양념장', '액젓', '다시다', '소금',   
  '식초', '맛술', 'Natural Seasoning', '국판당', '헬시스위트', '요리당', '올리고당', '물엿',  
  '밀가루', '프리믹스', '상온면', '대두유', '옥수수유', '고급유', '참기름', '바이오',  
  '시즈닝', '다담', '백설햄',  
  '소스', '프로틴스낵'  
];  

export default function RegionPage() {  
  const params = useParams();  
  const router = useRouter();  
  const region = decodeURIComponent(params.region as string);  
  
  const [summaryCats, setSummaryCats] = useState<RegionCat[]>([]);  
  const [cat2Cats, setCat2Cats] = useState<RegionCat[]>([]);  
  const [filteredCat2, setFilteredCat2] = useState<RegionCat[]>([]);  
  const [search, setSearch] = useState('');  
  const [showSuggestions, setShowSuggestions] = useState(false);  
  const [loading, setLoading] = useState(true);  
  
  useEffect(() => {  
    const loadData = async () => {  
      try {  
        const res = await fetch('/data/regions.json');  
        const allData = await res.json();  
        const regionData: RegionCat[] = allData[region] || [];  
  
        const summaryData = SUMMARY_CATS  
          .map((cat) => regionData.find((item) => item.cat === cat))  
          .filter(Boolean) as RegionCat[];  
  
        const cat2Data = CAT2_LIST  
          .map((cat) => regionData.find((item) => item.cat === cat))  
          .filter(Boolean) as RegionCat[];  
  
        setSummaryCats(summaryData);  
        setCat2Cats(cat2Data);  
        setFilteredCat2(cat2Data);  
      } catch (error) {  
        console.error('데이터 로드 실패:', error);  
      } finally {  
        setLoading(false);  
      }  
    };  
    loadData();  
  }, [region]);  
  
  const handleInput = (value: string) => {  
    setSearch(value);  
    setShowSuggestions(true);  
    if (value === '') {  
      setFilteredCat2(cat2Cats);  
    } else {  
      setFilteredCat2(  
        cat2Cats.filter((item) =>  
          item.cat.toLowerCase().includes(value.toLowerCase())  
        )  
      );  
    }  
  };  
  
  const handleSelect = (cat: string) => {  
    setSearch(cat);  
    setFilteredCat2(cat2Cats.filter((item) => item.cat === cat));  
    setShowSuggestions(false);  
  };  
  
  const handleReset = () => {  
    setSearch('');  
    setFilteredCat2(cat2Cats);  
    setShowSuggestions(false);  
  };  
  
  const suggestions = search  
    ? cat2Cats.filter((item) =>  
        item.cat.toLowerCase().includes(search.toLowerCase())  
      )  
    : [];  
  
  if (loading) {  
    return (  
      <div style={{  
        display: 'flex', alignItems: 'center', justifyContent: 'center',  
        height: '100vh', fontSize: '18px', color: '#666',  
        fontFamily: "'Noto Sans KR', sans-serif"  
      }}>  
        로딩 중...  
      </div>  
    );  
  }  
  
  const renderRow = (item: RegionCat, idx: number, clickable: boolean) => {  
    const msDiff = item.ms_diff ?? 0;  
    const isNegative = msDiff < 0;  
    return (  
      <tr  
        key={idx}  
        onClick={() => clickable && router.push(`/${encodeURIComponent(region)}/${encodeURIComponent(item.cat)}`)}  
        style={{  
          borderBottom: '1px solid #f0f0f0',  
          cursor: clickable ? 'pointer' : 'default',  
          background: clickable  
            ? (idx % 2 === 0 ? 'white' : '#fafafa')  
            : '#f4f6fb',  
          transition: 'background 0.15s'  
        }}  
        onMouseEnter={(e) => {  
          if (clickable) e.currentTarget.style.background = '#eef2ff';  
        }}  
        onMouseLeave={(e) => {  
          if (clickable) e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa';  
        }}  
      >  
        <td style={{  
          padding: '12px 10px', fontWeight: '700',  
          color: clickable ? '#1a1a2e' : '#444',  
          fontSize: '13px', whiteSpace: 'nowrap'  
        }}>  
          {item.cat}  
        </td>  
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '13px', color: '#555' }}>  
          {item.cj?.toFixed(0) ?? '-'}  
        </td>  
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '13px', color: '#555' }}>  
          {item.competitor?.toFixed(0) ?? '-'}  
        </td>  
        <td style={{  
          padding: '12px 10px', textAlign: 'center',  
          fontWeight: '700', fontSize: '13px', color: '#667eea'  
        }}>  
          {item.ms != null ? (item.ms * 100).toFixed(1) + '%' : '-'}  
        </td>  
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '13px', color: '#555' }}>  
          {item.cj_ref?.toFixed(0) ?? '-'}  
        </td>  
        <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '13px', color: '#555' }}>  
          {item.competitor_ref?.toFixed(0) ?? '-'}  
        </td>  
        <td style={{  
          padding: '12px 10px', textAlign: 'center',  
          fontWeight: '700', fontSize: '13px', color: '#667eea'  
        }}>  
          {item.ms_ref != null ? (item.ms_ref * 100).toFixed(1) + '%' : '-'}  
        </td>  
        <td style={{  
          padding: '12px 10px', textAlign: 'center',  
          fontWeight: '700', fontSize: '13px',  
          color: isNegative ? '#e53e3e' : '#38a169'  
        }}>  
          {msDiff != null ? (msDiff > 0 ? '+' : '') + (msDiff * 100).toFixed(1) + '%' : '-'}  
        </td>  
      </tr>  
    );  
  };  
  
  return (  
    <div style={{  
      minHeight: '100vh', background: '#f4f6fb', padding: '20px',  
      fontFamily: "'Noto Sans KR', sans-serif"  
    }}>  
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>  
  
        <button  
          onClick={() => router.back()}  
          style={{  
            marginBottom: '16px', padding: '10px 20px',  
            background: '#667eea', color: 'white', border: 'none',  
            borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'  
          }}  
        >  
          ← 돌아가기  
        </button>  
  
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>  
          📍 {region} MS 현황  
        </h1>  
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>  
          분류2를 클릭하면 SKU 상세를 볼 수 있어요  
        </p>  
  
        {/* 검색창 */}  
        <div style={{ position: 'relative', marginBottom: '20px' }}>  
          <div style={{  
            background: 'white', borderRadius: '14px', padding: '12px 16px',  
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',  
            display: 'flex', alignItems: 'center', gap: '10px',  
            border: showSuggestions && search ? '2px solid #667eea' : '2px solid transparent'  
          }}>  
            <span style={{ fontSize: '18px' }}>🔍</span>  
            <input  
              type="text"  
              value={search}  
              onChange={(e) => handleInput(e.target.value)}  
              onFocus={() => setShowSuggestions(true)}  
              placeholder="분류2 검색 (예: 햇반, 만두, 스팸...)"  
              style={{  
                flex: 1, border: 'none', outline: 'none',  
                fontSize: '15px', color: '#1a1a2e', background: 'transparent'  
              }}  
            />  
            {search && (  
              <button  
                onClick={handleReset}  
                style={{  
                  padding: '6px 12px', background: '#f0f0f0', border: 'none',  
                  borderRadius: '8px', cursor: 'pointer', fontSize: '12px',  
                  fontWeight: '600', color: '#666'  
                }}  
              >  
                초기화  
              </button>  
            )}  
          </div>  
  
          {showSuggestions && search && suggestions.length > 0 && (  
            <div style={{  
              position: 'absolute', top: '100%', left: 0, right: 0,  
              background: 'white', borderRadius: '12px',  
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',  
              zIndex: 100, maxHeight: '240px', overflowY: 'auto', marginTop: '6px'  
            }}>  
              {suggestions.map((item, idx) => (  
                <div  
                  key={idx}  
                  onClick={() => handleSelect(item.cat)}  
                  style={{  
                    padding: '13px 18px', cursor: 'pointer', fontSize: '14px',  
                    fontWeight: '500', color: '#1a1a2e',  
                    borderBottom: idx < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none',  
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'  
                  }}  
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}  
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}  
                >  
                  <span>{item.cat}</span>  
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#667eea' }}>  
                    {item.ms != null ? (item.ms * 100).toFixed(1) + '%' : '-'}  
                  </span>  
                </div>  
              ))}  
            </div>  
          )}  
        </div>  
  
        {/* 테이블 */}  
        <div style={{ overflowX: 'auto' }} onClick={() => setShowSuggestions(false)}>  
          <table style={{  
            width: '100%', borderCollapse: 'collapse',  
            background: 'white', borderRadius: '16px',  
            overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'  
          }}>  
            <thead>  
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>  
                {['분류', 'CJ', '경쟁사', 'MS', '영본CJ', '영본경쟁사', '영본MS', '영본比'].map((h) => (  
                  <th key={h} style={{  
                    padding: '14px 10px', color: 'white',  
                    fontSize: '13px', fontWeight: '700',  
                    textAlign: 'center', whiteSpace: 'nowrap'  
                  }}>  
                    {h}  
                  </th>  
                ))}  
              </tr>  
            </thead>  
            <tbody>  
              {/* 요약 4개 고정 - 클릭 불가 */}  
              {summaryCats.map((item, idx) => renderRow(item, idx, false))}  
  
              {/* 구분선 */}  
              <tr>  
                <td colSpan={8} style={{  
                  padding: '8px 12px',  
                  background: '#1a1a2e',  
                  color: 'white',  
                  fontSize: '12px',  
                  fontWeight: '700',  
                  textAlign: 'left'  
                }}>  
                  📂 분류2 상세 ({filteredCat2.length}개) · 클릭하면 SKU 상세 확인  
                </td>  
              </tr>  
  
              {/* 78개 분류2 - 클릭 가능 */}  
              {filteredCat2.map((item, idx) => renderRow(item, idx, true))}  
            </tbody>  
          </table>  
        </div>  
  
        <p style={{ fontSize: '13px', color: '#888', marginTop: '12px' }}>  
          총 {filteredCat2.length}개 분류2  
        </p>  
      </div>  
    </div>  
  );  
}  
