'use client';  
  
import { useRouter } from 'next/navigation';  
  
const REGIONS = [  
  "서울", "강원", "경기", "인천", "경남", "경북",  
  "광주", "대구", "대전", "부산", "세종", "울산",  
  "전남", "전북", "제주", "충남", "충북"  
];  
  
export default function HomePage() {  
  const router = useRouter();  
  
  return (  
    <div style={{  
      minHeight: '100vh',  
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',  
      display: 'flex', flexDirection: 'column',  
      alignItems: 'center', justifyContent: 'center',  
      padding: '20px', fontFamily: "'Noto Sans KR', sans-serif"  
    }}>  
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>  
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>  
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '8px' }}>  
          POS MS 대시보드  
        </h1>  
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>  
          지점을 선택하면 카테고리별 MS를 확인할 수 있어요  
        </p>  
      </div>  
  
      <div style={{  
        display: 'grid',  
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',  
        gap: '12px', maxWidth: '700px', width: '100%'  
      }}>  
        {REGIONS.map((region) => (  
          <button  
            key={region}  
            onClick={() => router.push(`/${encodeURIComponent(region)}`)}  
            style={{  
              padding: '18px 12px',  
              background: 'rgba(255,255,255,0.08)',  
              border: '1px solid rgba(255,255,255,0.15)',  
              borderRadius: '14px', cursor: 'pointer',  
              color: 'white', fontSize: '15px', fontWeight: '700',  
              transition: 'all 0.2s',  
              backdropFilter: 'blur(10px)'  
            }}  
            onMouseEnter={(e) => {  
              e.currentTarget.style.background = 'rgba(102,126,234,0.4)';  
              e.currentTarget.style.border = '1px solid rgba(102,126,234,0.8)';  
              e.currentTarget.style.transform = 'translateY(-2px)';  
            }}  
            onMouseLeave={(e) => {  
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';  
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)';  
              e.currentTarget.style.transform = 'translateY(0)';  
            }}  
          >  
            📍 {region}  
          </button>  
        ))}  
      </div>  
  
      <p style={{ marginTop: '40px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>  
        CJ CheilJedang · 식품영업 기획팀  
      </p>  
    </div>  
  );  
}  
