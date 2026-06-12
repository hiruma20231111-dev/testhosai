const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const out = process.argv[2] || path.resolve(__dirname, "MediAgent_商談資料.pdf");
  const fileUrl = "file://" + path.resolve(__dirname, "index.html").replace(/\\/g, "/");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });
  try {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: "networkidle0" });
    await page.pdf({
      path: out,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    console.log("PDF generated: " + out);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
