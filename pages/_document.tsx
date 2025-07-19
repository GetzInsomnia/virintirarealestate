import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentProps,
} from 'next/document';

interface MyDocumentProps extends DocumentProps {
  locale?: string;
}
class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = (await Document.getInitialProps(ctx)) as DocumentProps;
    const lang = (ctx.query?.lang as string) || 'th';
    return {
      ...initialProps,
      locale: lang,
    };
  }

  render() {
    // Determine the language for the <Html> tag so our CSS selectors
    // (e.g. html[lang="en"]) can apply the correct font family.
    const lang = this.props.locale ?? this.props.__NEXT_DATA__.locale ?? 'th';
    return (
      <Html lang={lang}>
        <Head>
          {/* Preload font (ตัวอย่าง) */}
          <link
            rel="preload"
            href="/fonts/Prompt/Prompt-Regular.ttf"
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/Inter/Inter-Regular.ttf"
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
