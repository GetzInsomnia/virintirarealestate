import { Html, Head, Main, NextScript, DocumentContext } from "next/document";

export default function Document(props: any) {
  // ปรับ logic ถ้าอยากแยก th/en จาก pathname หรือดึง locale จาก cookies ก็ได้
  // อันนี้เซต "th" เป็น default ถ้า url มี /th, อย่างอื่น "en"
  let locale = "en";
  try {
    const pathname = props.__NEXT_DATA__?.page || "/";
    if (pathname.startsWith("/th")) locale = "th";
  } catch {}
  return (
    <Html lang={locale}>
      <Head>
        {/* Preload ฟอนต์หลัก (แนะนำแค่ regular/bold) */}
        <link rel="preload" href="/fonts/Inter_18pt-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Inter_18pt-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Prompt-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Prompt-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body style={{ fontFamily: locale === "th"
        ? "'Prompt', 'Inter', sans-serif"
        : "'Inter', 'Prompt', sans-serif"
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
