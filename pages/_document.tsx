import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';

class MyDocument extends Document<{ locale: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    // locale จาก context
    return { ...initialProps, locale: ctx.locale || 'th' };
  }

  render() {
    // @ts-ignore
    const { locale } = this.props;
    return (
      <Html lang={locale}>
        <Head>
          {/* Preload font (ตัวอย่าง) */}
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
}
export default MyDocument;
