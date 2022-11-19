import Script from 'next/script'
import { ThemeProvider } from 'next-themes'
import '../styles/global.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=G-YGP5NEHQZL`} />
      <Script
        id='google-analytics'
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YGP5NEHQZL');
        `,
        }}
      />
      <ThemeProvider attribute="class">
        <Component {...pageProps} />
      </ThemeProvider>
    </>

  )
}

export default MyApp
