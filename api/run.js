const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");
const querystring = require("querystring");

module.exports = async function handler(request, response) {
  if (request.method === "POST") {
    let body = '';

    // Collect the data from the request stream
    request.on('data', (chunk) => {
      body += chunk.toString();
    });

    // Parse the collected data when the request stream ends
    request.on('end', async () => {
      try {
        // Extract values of estate and datetime using regular expressions
        const estateMatch = /name="estate"\r\n\r\n(.+?)\r\n/.exec(body);
        const datetimeMatch = /name="datetime"\r\n\r\n(.+?)\r\n/.exec(body);

        // Extract estate and datetime from the matches
        const estate = estateMatch ? estateMatch[1] : null;
        const datetime = datetimeMatch ? datetimeMatch[1] : null;

        // Respond with a JSON object containing the received data
        const browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--single-process",
          ],
          executablePath: process.env.CHROME_EXECUTABLE_PATH || (await chromium.executablePath),
          headless: true,
          ignoreDefaultArgs: ["--disable-extensions"],
          ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.goto(`https://srs-ssms.com/rekap_pdf/convert_taksasi_pdf_get.php?estate=${estate}`);
        const title = await page.title();

        // Delay for 5 seconds before closing the page
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.close();
        await browser.close();

        response.status(200).json({
          body: request.body,
          cookies: request.cookies,
          response: 'success',
          chromium: await chromium.executablePath,
        });
      } catch (error) {
        // Handle errors
        console.error('Error occurred:', error);
        response.status(500).json({
          error: 'Internal server error'
        });
      }
    });
  } else {
    response.status(500).json({
      response: 'not allowed'
    });
  }
};
