import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head />
        {/* mathjaxを読み込む */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-AMS_CHTML"
        ></Script>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
