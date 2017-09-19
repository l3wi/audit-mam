import Document, { Head, Main, NextScript } from "next/document"
import { ServerStyleSheet, injectGlobal } from "styled-components"

export default class MyDocument extends Document {
  render() {
    const sheet = new ServerStyleSheet()
    const main = sheet.collectStyles(<Main />)
    const styleTags = sheet.getStyleElement()
    return (
      <html>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="stylesheet"
            href="//cdn.jsdelivr.net/chartist.js/latest/chartist.min.css"
          />
          <script src={"/static/curl.min.js"} />
          <script src="//cdn.jsdelivr.net/chartist.js/latest/chartist.min.js" />
          <title>Audit Trail - Dashboard</title>
          {styleTags}
        </Head>
        <body>
          <div className="root">{main}</div>
          <NextScript />
        </body>
      </html>
    )
  }
}

injectGlobal`
  body {
    margin: 0 auto;
    font-family: "Helvetica","Arial",sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    letter-spacing: 2px;
    color: #444;
    -webkit-font-smoothing: antialiased;
    padding: 0;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
`
