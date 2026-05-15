import type { Metadata } from 'next'  
  
export const metadata: Metadata = {  
  title: 'POS MS 대시보드',  
  description: 'CJ CheilJedang POS MS Dashboard',  
}  
  
export default function RootLayout({  
  children,  
}: {  
  children: React.ReactNode  
}) {  
  return (  
    <html lang="ko">  
      <head>  
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />  
      </head>  
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}>  
        {children}  
      </body>  
    </html>  
  )  
}  
