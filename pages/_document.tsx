// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document(props) {
  // ปรับ logic lang/dir ให้เหมาะสมถ้าต้องการ
  return (
    <Html lang="th">
      <Head>
        {/* preload fonts */}
        <link
          rel="preload"
          href="/fonts/Prompt-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
