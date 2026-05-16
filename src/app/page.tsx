'use client';  
  
import { useRouter } from 'next/navigation';  
import { useState } from 'react';  
  
const REGIONS = [  
  "서울", "강원", "경기", "인천", "경남", "경북",  
  "광주", "대구", "대전", "부산", "세종", "울산",  
  "전남", "전북", "제주", "충남", "충북"  
];  
  
const LAST_UPDATED = "2026년 4월 누계";  
  
export default function HomePage() {  
  const router = useRouter();  
  const [search, setSearch] = useState('');  
  const [showSugg, setShowSugg] = useState(false);  
  
  const filtered = REGIONS.filter((r) =>  
    r.toLowerCase().includes(search.toLowerCase())  
  );  
  
  const handleSelect = (region: string) => {  
    setSearch('');  
    setShowSugg(false);  
    router.push(`/${encodeURIComponent(region)}`);  
  };  
  
  return (  
    <div style={{  
      minHeight: '100vh',  
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',  
      display: 'flex', flexDirection: 'column',  
      alignItems: 'center', justifyContent: 'center',  
      padding: '20px', fontFamily: "'Noto Sans KR', sans-serif"  
    }}>  
      <div style={{ width: '100%', maxWidth: '480px' }}>  
  
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>  
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>📊</div>  
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>  
            POS MS 대시보드  
          </h1>  
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>  
            지점을 선택하면 카테고리별 MS를 확인할 수 있어요  
          </p>  
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>  
            <span style={{  
              fontSize: '12px', color: 'rgba(255,255,255,0.4)',  
              background: 'rgba(255,255,255,0.08)',  
              padding: '4px 12px', borderRadius: '20px'  
            }}>  
              
            </span>  
            <span style={{  
              fontSize: '12px', color: 'rgba(255,255,255,0.4)',  
              background: 'rgba(255,255,255,0.08)',  
              padding: '4px 12px', borderRadius: '20px'  
            }}>  
              🕒 {LAST_UPDATED} 기준  
            </span>  
          </div>  
        </div>  
  
        <div style={{ position: 'relative' }}>  
          <div style={{  
            background: 'rgba(255,255,255,0.10)',  
            borderRadius: '16px', padding: '14px 18px',  
            display: 'flex', alignItems: 'center', gap: '10px',  
            border: showSugg && search ? '1.5px solid rgba(102,126,234,0.8)' : '1.5px solid rgba(255,255,255,0.15)',  
            backdropFilter: 'blur(10px)'  
          }}>  
            <span style={{ fontSize: '20px' }}>🔍</span>  
            <input  
              type="text"  
              value={search}  
              onChange={(e) => { setSearch(e.target.value); setShowSugg(true); }}  
              onFocus={() => setShowSugg(true)}  
              placeholder="지점명 검색 (예: 서울, 부산, 경기...)"  
              style={{  
                flex: 1, border: 'none', outline: 'none',  
                fontSize: '15px', color: 'white',  
                background: 'transparent',  
              }}  
            />  
            {search && (  
              <button  
                onClick={() => { setSearch(''); setShowSugg(false); }}  
                style={{  
                  background: 'rgba(255,255,255,0.15)', border: 'none',  
                  borderRadius: '8px', padding: '4px 10px',  
                  color: 'white', cursor: 'pointer', fontSize: '12px'  
                }}  
              >  
                초기화  
              </button>  
            )}  
          </div>  
  
          {showSugg && (  
            <div style={{  
              position: 'absolute', top: '100%', left: 0, right: 0,  
              background: 'white', borderRadius: '14px',  
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',  
              zIndex: 100, marginTop: '8px',  
              overflow: 'hidden'  
            }}>  
              {filtered.length > 0 ? (  
                filtered.map((region, idx) => (  
                  <div  
                    key={region}  
                    onClick={() => handleSelect(region)}  
                    style={{  
                      padding: '14px 18px', cursor: 'pointer',  
                      fontSize: '15px', fontWeight: '600', color: '#1a1a2e',  
                      borderBottom: idx < filtered.length - 1 ? '1px solid #f0f0f0' : 'none',  
                      display: 'flex', alignItems: 'center', gap: '10px'  
                    }}  
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f4ff')}  
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}  
                  >  
                    <span>📍</span>  
                    {region}  
                  </div>  
                ))  
              ) : (  
                <div style={{ padding: '20px', textAlign: 'center', color: '#aaa', fontSize: '14px' }}>  
                  검색 결과가 없어요  
                </div>  
              )}  
            </div>  
          )}  
        </div>  
  
        {!showSugg && (  
          <div style={{  
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',  
            gap: '8px', marginTop: '20px'  
          }}>  
            {REGIONS.map((region) => (  
              <button  
                key={region}  
                onClick={() => handleSelect(region)}  
                style={{  
                  padding: '12px 8px',  
                  background: 'rgba(255,255,255,0.07)',  
                  border: '1px solid rgba(255,255,255,0.12)',  
                  borderRadius: '12px', cursor: 'pointer',  
                  color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '600',  
                  transition: 'all 0.2s'  
                }}  
                onMouseEnter={(e) => {  
                  e.currentTarget.style.background = 'rgba(102,126,234,0.35)';  
                  e.currentTarget.style.color = 'white';  
                }}  
                onMouseLeave={(e) => {  
                  e.currentTarget.style.background = 'rgba(255,255,255,0.07)';  
                  e.currentTarget.style.color = 'rgba(255,255,255,0.8)';  
                }}  
              >  
                {region}  
              </button>  
            ))}  
          </div>  
        )}  
  
        <p style={{ marginTop: '32px', fontSize: '11px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>  
          CJ CheilJedang · 식품영업본부 👤 이동현
        </p>  
      </div>  
    </div>  
  );  
}  
