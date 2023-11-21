/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable no-console */
const fs = require('fs');

const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');

dayjs.extend(utc);

const {
  openPuppeteerConnection,
  closePuppeteerConnection,
  defaultUserAgent,
  defaultPlatform,
  pageWait,
  randomPageWait,
  navigateToUrl,
} = require('./puppeteer-helpers');

const botCheckUrl = 'https://abrahamjuliot.github.io/creepjs/';
const fingerprintUrl = 'https://creepjs-api.web.app/fp';
const analysisUrl = 'https://creepjs-api.web.app/analysis';
const defaultProxyHost = '127.0.0.1:24000';
const debug = false;
const timeout = 40000;

// chose not to use selectors ...

const makeCrawlId = () => {
  const dateString = dayjs.utc().format('YYYYMMDD');
  const timeString = dayjs.utc().format('HH_mm_ss');

  return `${dateString}_${timeString}`;
};

const makeSnapshotFolder = (crawlId) => {
  const snapshotFolder = `./snapshots/creepjs-${crawlId}`;
  fs.mkdirSync(snapshotFolder, { recursive: true });

  return snapshotFolder;
};

(async () => {
  const { browser, page } = await openPuppeteerConnection(
    puppeteer,
    defaultUserAgent(),
    defaultPlatform(),
    defaultProxyHost,
    debug,
    timeout,
  );

  const crawlId = makeCrawlId();
  const snapshotFolder = makeSnapshotFolder(crawlId);

  try {
    await page.setExtraHTTPHeaders({
      'x-lpm-session': crawlId,
    });

    console.log(await page.authenticate());
    await pageWait(page, 500);

    console.log('Running tests..');

    await page.on('response', async (response) => {
      if (response.url() === fingerprintUrl && response.request().method() === 'POST') {
        const data = await response.json();
        fs.writeFileSync(
          `${snapshotFolder}/fingerprint.json`,
          JSON.stringify(data, null, 2),
        );

        console.log('Saved fingerprint..');
      }

      if (response.url() === analysisUrl && response.request().method() === 'POST') {
        const data = await response.json();
        fs.writeFileSync(
          `${snapshotFolder}/analysis.json`,
          JSON.stringify(data, null, 2),
        );

        console.log('Saved analysis..');
      }
    });

    await navigateToUrl(page, botCheckUrl);
    await randomPageWait(page, 5000, 5500);

    await page.screenshot({
      path: `${snapshotFolder}/screenshot.png`,
      fullPage: true,
    });

    console.log('Saved screenshot..');

    await page.pdf({
      path: `${snapshotFolder}/printout.pdf`,
      format: 'A4',
    });

    console.log('Saved pdf printout..');

    const htmlContent = await page.content();

    fs.writeFileSync(`${snapshotFolder}/content.html`, htmlContent);

    console.log('Saved html content..');

    await pageWait(page, 500);
    await closePuppeteerConnection(page, browser);
  } catch (err) {
    console.error(err);
  }
})();
