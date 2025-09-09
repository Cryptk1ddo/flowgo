import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Flowgo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', padding: 24}}>
        <h1>Welcome to Flowgo (Next.js + TypeScript)</h1>
        <p>This repository was converted to a minimal Next.js + TypeScript scaffold prepared for Vercel deployment.</p>
      </main>
    </>
  )
}
