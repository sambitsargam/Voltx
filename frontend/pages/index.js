import Head from 'next/head'
import LandingPage from '../components/LandingPage'

export default function Home() {
  return (
    <>
      <Head>
        <title>Voltx - The Future of Renewable Energy Certificates</title>
        <meta name="description" content="Trade, mint, and retire renewable energy certificates on Hedera's enterprise-grade blockchain. Join the revolution in sustainable energy trading." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Voltx - The Future of Renewable Energy Certificates" />
        <meta property="og:description" content="Trade, mint, and retire renewable energy certificates on Hedera's enterprise-grade blockchain." />
        <meta property="og:url" content="https://voltx-app.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Voltx - Renewable Energy Certificates on Hedera" />
        <meta name="twitter:description" content="Trade, mint, and retire renewable energy certificates on Hedera's enterprise-grade blockchain." />
      </Head>
      <LandingPage />
    </>
  )
}
