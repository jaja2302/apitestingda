const chromium = require("@sparticuz/chromium")
const puppeteer = require("puppeteer-core")

export default async function handler(request, response) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
    headless: true,
    ignoreHTTPSErrors: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--single-process",
    ],
    ignoreDefaultArgs: ["--disable-extensions"],
    ignoreHTTPSErrors: true,
  })
  const page = await browser.newPage()
  await page.goto("https://srs-ssms.com/rekap_pdf/convert_taksasi_pdf_get.php?datetime=2024-03-14&estate=NBE")
  const title = await page.title()

  await page.close()

  await browser.close()

  response.status(200).json({
    body: request.body,
    cookies: request.cookies,
    title,
    chromium: await chromium.executablePath,
  })
}
