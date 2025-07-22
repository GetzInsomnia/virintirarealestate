import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document<{ locale?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    // Next.js 14+ สามารถอ่าน ctx.locale ได้ตรงๆ (ถ้าใช้ next-i18next config ถูกต้อง)
    const locale = ctx.locale || 'th';
    return { ...initialProps, locale };
  }

  render() {
    // locale จาก props (ถ้าไม่มี fallback เป็น 'th')
    const locale = this.props.locale || 'th';
    return (
      <Html lang={locale}>
        <Head>
          {/* Preload Fonts - เลือก preload font หลักที่ใช้บ่อย */}
          <link
            rel="preload"
            href="/fonts/Prompt/Prompt-Regular.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/Inter/Inter_18pt-Regular.ttf"
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
}

export default MyDocument;
