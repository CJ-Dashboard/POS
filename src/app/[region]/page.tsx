'use client';  
  
import { useParams, useRouter } from 'next/navigation';  
import { useEffect, useState } from 'react';  
import { RegionCat } from '@/types';  
  
const SUMMARY_CATS = ['전제품', '식품', 'FI', '신선'];  
  
const CAT2_LIST = [  
  '햇반', '컵반', '밀키트', 'HMR 기타', '만두', '냉장면', '수프', '냉동면', '냉동밥',  
  '피자류', '핫도그류', '까스류', '치킨류', '중화류', '베이커리류', '양식반찬류', '한식반찬류',  
  'B2B조리냉동', 'B2C스팸', 'B2B스팸', '화이트미트', '냉장편의식', 'B2B조리육', '어묵', '유부',  
  '생선구이', '수산기타', '두부', '콩나물', '계란', '김치', '찬류', '조미김', '웰빙간식',  
  '디저트', '고추장', '된장', '쌈장', '양념장', '액젓', '다시다', '소금', '미초', '밥이랑',  
  '식초', '맛술', 'Natural Seasoning', '국판당', '헬시스위트', '요리당', '올리고당', '물엿',  
  '카페소재', '밀가루', '프리믹스', '상온면', '대두유', '옥수수유', '고급유', '참기름', '바이오',  
  '국물', '죽',  
  '붕어빵', '상온떡볶이', '스팸닭가슴살', '다담', '리턴업', '백설햄',  
  '소스', '츄러스', '튀김/전', '프로틴스낵', '한뿌리', '호떡'  
];  
  
const CAT_MAP: Record<string, string> = {  
  'FI': 'FI',  
  '계란': '신선', '고급유': 'FI', '고추장소물': '식품', '교자만두': '신선',  
  '국물': '신선', '국산콩나물': '신선', '국산콩두부': '신선', '국수': 'FI',  
  '국판당': 'FI', '군만두': '신선', '김밥햄': '신선', '김치': '신선',  
  '냉면': '신선', '냉장면': '신선', '다담(신선)': '신선', '다시다소물': '식품',  
  '당대물': 'FI', '당면': 'FI', '당소물': 'FI', '대두유가정용': 'FI',  
  '된장소물': '식품', '두부': '신선', '만두': '신선', '맛김치': '신선',  
  '물만두': '신선', '미니소시지': '신선', '백설소스': '식품', '베이컨': '신선',  
  '별미김치': '신선', '부침/튀김': 'FI', '분소물': 'FI', '비엔나': '신선',  
  '사각햄': '신선', '상온면': 'FI', '생면떡': '신선', '수입콩나물': '신선',  
  '수입콩두부': '신선', '수제만두': '신선', '식품': '식품', '신선': '신선',  
  '쌈장소물': '식품', '액젓': '식품', '양념장': '식품', '어묵': '신선',  
  '올리고당': 'FI', '올리브유': 'FI', '왕만두': '신선', '우동': '신선',  
  '유부': '신선', '장류소물': '식품', '조리냉동': '신선', '조리육': '신선',  
  '조미김': '신선', '죽': '식품', '참기름': 'FI', '치킨류': '신선',  
  '카놀라유': 'FI', '캔햄': '식품', '컵반': '식품', '콩나물전체': '신선',  
  '포기김치': '신선', '포도씨유': 'FI', '피자류': '신선', '한식반찬류': '신선',  
  '햇반': '식품', '화이트미트': '신선', '후랑크': '신선',  
  '밀키트': '식품', 'HMR 기타': '식품', '냉동면': '신선', '냉동밥': '식품',  
  '핫도그류': '신선', '까스류': '신선', '중화류': '신선', '베이커리류': '신선',  
  '양식반찬류': '신선', 'B2B조리냉동': '신선', 'B2C스팸': '식품', 'B2B스팸': '식품',  
  '냉장편의식': '신선', 'B2B조리육': '신선', '생선구이': '신선', '수산기타': '신선',  
  '콩나물': '신선', '찬류': '신선', '웰빙간식': '식품', '디저트': '식품',  
  '고추장': '식품', '된장': '식품', '쌈장': '식품', '다시다': '식품',  
  '소금': 'FI', '미초': 'FI', '밥이랑': '식품', '식초': 'FI', '맛술': 'FI',  
  'Natural Seasoning': 'FI', '헬시스위트': 'FI', '요리당': 'FI', '물엿': 'FI',  
  '카페소재': 'FI', '밀가루': 'FI', '프리믹스': 'FI', '대두유': 'FI',  
  '옥수수유': 'FI', '바이오': 'FI', '붕어빵': '신선', '상온떡볶이': '식품',  
  '스팸닭가슴살': '식품', '다담': '식품', '리턴업': 'FI', '백설햄': '신선',  
  '소스': '식품', '츄러스': '신선', '튀김/전': '신선', '프로틴스낵': 'FI',  
  '한뿌리': 'FI', '호떡': '신선',  
};  
  
const CAT1_COLOR: Record<string, { bg: string; color: string }> = {  
  '식품': { bg: '#eef2ff', color: '#667eea' },  
  '신선': { bg: '#f0fff4', color: '#38a169' },  
  'FI':   { bg: '#fff8f0', color: '#dd6b20' },  
};  
  
export default function RegionPage() {  
  const params = useParams();  
  const router = useRouter();  
  const region = decodeURIComponent(params.region as string);  
  
  const [summaryCats, setSummaryCats] = useState<RegionCat[]>([]);  
  const [cat2Cats, setCat2Cats] = useState<RegionCat[]>([]);  
  const [filteredCat2, setFilteredCat2] = useState<RegionCat[]>([]);  
  const [search, setSearch] = useState('');  
  const [showSuggestions, setShowSuggestions] = useState(false);  
  const [activeCat1, setActiveCat1] = useState('전체');  
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
  
  const applyFilter = (cat1: string, searchVal: string, data: RegionCat[]) => {  
    let result = data;  
    if (cat1 !== '전체') {  
      result = result.filter((item) => CAT_MAP[item.cat] === cat1);  
    }  
    if (searchVal) {  
      result = result.filter((item) =>  
        item.cat.toLowerCase().includes(searchVal.toLowerCase())  
      );  
    }  
    setFilteredCat2(result);  
  };  
  
  const handleInput = (value: string) => {  
    setSearch(value);  
    setShowSuggestions(true);  
    applyFilter(activeCat1, value, cat2Cats);  
  };  
  
  const handleSelect = (cat: string) => {  
    setSearch(cat);  
    setShowSuggestions(false);  
    applyFilter(activeCat1, cat, cat2Cats);  
  };  
  
  const handleReset = () => {  
    setSearch('');  
    setActiveCat1('전체');  
    setFilteredCat2(cat2Cats);  
    setShowSuggestions(false);  
  };  
  
  const handleCat1Filter = (cat1: string) => {  
    setActiveCat1(cat1);  
    applyFilter(cat1, search, cat2Cats);  
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
        height: '100vh', fontSize: '16px', color: '#666',  
        fontFamily: "'Noto Sans KR', sans-serif"  
      }}>  
        로딩 중...  
      </div>  
    );  
  }  
  
  const renderRow = (item: RegionCat, idx: number, clickable: boolean) => {  
    const msDiff = item.ms_diff ?? 0;  
    const isNegative = msDiff < 0;  
    const cat1 = CAT_MAP[item.cat];  
    const cat1Style = cat1 ? CAT1_COLOR[cat1] : null;  
  
    return (  
      <tr  
        key={idx}  
        onClick={() => clickable && router.push(`/${encodeURIComponent(region)}/${encodeURIComponent(item.cat)}`)}  
        style={{  
          borderBottom: '1px solid #f0f0f0',  
          cursor: clickable ? 'pointer' : 'default',  
          background: clickable  
            ? (idx % 2 === 0 ? 'white' : '#fafafa')  
            : '#f0f4ff',  
        }}  
        onMouseEnter={(e) => { if (clickable) e.currentTarget.style.background = '#eef2ff'; }}  
        onMouseLeave={(e) => { if (clickable) e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'; }}  
      >  
        <td style={{  
          padding: '7px 8px', fontWeight: clickable ? '700' : '800',  
          color: '#1a1a2e', fontSize: '12px',  
          position: 'sticky', left: 0,  
          background: clickable ? (idx % 2 === 0 ? 'white' : '#fafafa') : '#f0f4ff',  
          borderRight: '2px solid #e0e0e0'  
        }}>  
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>  
            <span style={{ whiteSpace: 'nowrap' }}>{item.cat}</span>  
            {cat1Style && (  
              <span style={{  
                fontSize: '9px', fontWeight: '700', padding: '1px 5px',  
                borderRadius: '6px', whiteSpace: 'nowrap',  
                background: cat1Style.bg, color: cat1Style.color  
              }}>  
                {cat1}  
              </span>  
            )}  
          </div>  
        </td>  
        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: '#667eea' }}>  
          {item.ms != null ? (item.ms * 100).toFixed(1) + '%' : '-'}  
        </td>  
        <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: '700', fontSize: '12px', color: '#38a169' }}>  
          {item.ms_ref != null ? (item.ms_ref * 100).toFixed(1) + '%' : '-'}  
        </td>  
        <td style={{  
          padding: '7px 6px', textAlign: 'center',  
          fontWeight: '700', fontSize: '12px',  
          color: isNegative ? '#e53e3e' : '#3182ce'  
        }}>  
          {msDiff != null ? (msDiff > 0 ? '▲' : '▼') + Math.abs(msDiff * 100).toFixed(1) + '%' : '-'}  
        </td>  
      </tr>  
    );  
  };  
  
  return (  
    <div style={{  
      minHeight: '100vh', background: '#f4f6fb',  
      padding: '12px', fontFamily: "'Noto Sans KR', sans-serif",  
      boxSizing: 'border-box', width: '100%', overflowX: 'hidden'  
    }}>  
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>  
  
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
  
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a2e', marginBottom: '4px' }}>  
          📍 {region} MS 현황  
        </h1>  
        <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>  
          분류2를 클릭하면 SKU 상세를 볼 수 있어요  
        </p>  
  
        {/* 검색창 */}  
        <div style={{ position: 'relative', marginBottom: '10px' }}>  
          <div style={{  
            background: 'white', borderRadius: '12px', padding: '10px 14px',  
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',  
            display: 'flex', alignItems: 'center', gap: '8px',  
            border: showSuggestions && search ? '2px solid #667eea' : '2px solid transparent'  
          }}>  
            <span>🔍</span>  
            <input  
              type="text"  
              value={search}  
              onChange={(e) => handleInput(e.target.value)}  
              onFocus={() => setShowSuggestions(true)}  
              placeholder="분류2 검색..."  
              style={{  
                flex: 1, border: 'none', outline: 'none',  
                fontSize: '14px', color: '#1a1a2e', background: 'transparent'  
              }}  
            />  
            {(search || activeCat1 !== '전체') && (  
              <button  
                onClick={handleReset}  
                style={{  
                  padding: '4px 10px', background: '#f0f0f0', border: 'none',  
                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#666'  
                }}  
              >  
                초기화  
              </button>  
            )}  
          </div>  
  
          {showSuggestions && search && suggestions.length > 0 && (  
            <div style={{  
              position: 'absolute', top: '100%', left: 0, right: 0,  
              background: 'white', borderRadius: '10px',  
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',  
              zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '4px'  
            }}>  
              {suggestions.map((item, idx) => (  
                <div  
                  key={idx}  
                  onClick={() => handleSelect(item.cat)}  
                  style={{  
                    padding: '12px 16px', cursor: 'pointer', fontSize: '14px',  
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
  
        {/* 식품/신선/FI 필터 버튼 */}  
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>  
          {['전체', '식품', '신선', 'FI'].map((cat1) => {  
            const style = cat1 !== '전체' ? CAT1_COLOR[cat1] : null;  
            const isActive = activeCat1 === cat1;  
            return (  
              <button  
                key={cat1}  
                onClick={() => handleCat1Filter(cat1)}  
                style={{  
                  padding: '6px 14px', borderRadius: '20px', border: 'none',  
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',  
                  background: isActive  
                    ? (style ? style.color : '#1a1a2e')  
                    : (style ? style.bg : '#f0f0f0'),  
                  color: isActive ? 'white' : (style ? style.color : '#555'),  
                  transition: 'all 0.15s'  
                }}  
              >  
                {cat1}  
                {cat1 !== '전체' && (  
                  <span style={{ marginLeft: '4px', fontSize: '10px', opacity: 0.8 }}>  
                    ({cat2Cats.filter(c => CAT_MAP[c.cat] === cat1).length})  
                  </span>  
                )}  
              </button>  
            );  
          })}  
        </div>  
  
        {/* 테이블 */}  
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} onClick={() => setShowSuggestions(false)}>  
          <table style={{  
            width: '100%', borderCollapse: 'collapse',  
            background: 'white', borderRadius: '14px',  
            overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)'  
          }}>  
            <thead>  
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>  
                <th style={{  
                  padding: '10px 8px', color: 'white',  
                  fontSize: '12px', fontWeight: '700',  
                  textAlign: 'left', whiteSpace: 'nowrap',  
                  position: 'sticky', left: 0, background: '#667eea'  
                }}>  
                  분류  
                </th>  
                <th style={{ padding: '10px 8px', color: 'white', fontSize: '12px', fontWeight: '700', textAlign: 'center', whiteSpace: 'nowrap' }}>MS</th>  
                <th style={{ padding: '10px 8px', color: 'white', fontSize: '12px', fontWeight: '700', textAlign: 'center', whiteSpace: 'nowrap' }}>영본MS</th>  
                <th style={{ padding: '10px 8px', color: 'white', fontSize: '12px', fontWeight: '700', textAlign: 'center', whiteSpace: 'nowrap' }}>영본比</th>  
              </tr>  
            </thead>  
            <tbody>  
              {summaryCats.map((item, idx) => renderRow(item, idx, false))}  
              <tr>  
                <td colSpan={4} style={{  
                  padding: '6px 10px', background: '#1a1a2e',  
                  color: 'white', fontSize: '11px', fontWeight: '700'  
                }}>  
                  📂 분류2 상세 ({filteredCat2.length}개)  
                  {activeCat1 !== '전체' && (  
                    <span style={{  
                      marginLeft: '6px', fontSize: '10px',  
                      background: CAT1_COLOR[activeCat1]?.color,  
                      color: 'white', padding: '1px 8px', borderRadius: '8px'  
                    }}>  
                      {activeCat1} 필터 중  
                    </span>  
                  )}  
                </td>  
              </tr>  
              {filteredCat2.map((item, idx) => renderRow(item, idx, true))}  
            </tbody>  
          </table>  
        </div>  
  
        <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>  
          총 {filteredCat2.length}개 분류2  
        </p>  
      </div>  
    </div>  
  );  
}  
