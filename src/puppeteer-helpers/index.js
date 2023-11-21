/* eslint-disable max-len */
/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

// out of date security mocks
// const {mockChromeRuntime} = require('./securityMocks/chromeRuntime');
// const {mockConsoleDebug} = require('./securityMocks/consoleDebug');
// const {
//   coverVariableDetection,
// } = require('./securityMocks/coverVariableDetection');
// const {
//   mockIframeContentWindow,
// } = require('./securityMocks/iframeContentWindow');
// const {mockLanguages} = require('./securityMocks/languages');
// const {mockMediaCodecs} = require('./securityMocks/mediaCodecs');
// const {mockPermissionsCheck} = require('./securityMocks/permissions');
// const {mockPlatform} = require('./securityMocks/platform');
// const {mockPlugins} = require('./securityMocks/plugins');
// const {mockVendor} = require('./securityMocks/vendor');
// const {mockWebDriver} = require('./securityMocks/webDriver');
// const {mockWebGLVendor} = require('./securityMocks/webGL');
// const {mockWindowDimensions} = require('./securityMocks/windowDimensions');

const {
  randomRange,
  randomPageWait,
  pageWait,
  getCurrentUrl,
  navigateToUrl,
  selectorExists,
  captureHtml,
  scrollToElement,
  clickLinkElement,
  clickLinkElementBlankTarget,
} = require('./pageHelpers');

const defaultWidth = 2560;
const defaultHeight = 1440;
const sloMoTiming = 225;

/**
 * Returns the default user agent
 *
 * @returns {string}
 */
const defaultUserAgent = () => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36';
// see https://techblog.willshouse.com/2012/01/03/most-common-user-agents/ for generally accurate user agent breakdown

/**
 * Returns the default platform
 *
 * @returns {string}
 */
const defaultPlatform = () => 'Win32';

/**
 * Builds the headless chrome command line arguments.
 *
 * Accepts optional additional arguments.
 *
 * @param {boolean} [proxyUrl=false]
 * @param {Array} [additionalArgs=[]]
 * @returns
 */
// eslint-disable-next-line arrow-body-style
const buildChromeArgs = (proxyUrl = false, additionalArgs = []) => {
  const chromeArgs = proxyUrl
    ? [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      `--proxy-server=${proxyUrl}`,
      '--deterministic-fetch',
      `--window-size=${defaultWidth},${defaultHeight}`,
      '--window-position=0,0',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
    ]
    : [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--deterministic-fetch',
      `--window-size=${defaultWidth},${defaultHeight}`,
      '--window-position=0,0',
      '--ignore-certificate-errors',
      '--ignore-certificate-errors-spki-list',
    ];

  return chromeArgs.concat(additionalArgs);
};

/**
 * Builds the headless chrome launch arguments
 *
 * @param {Array} chromeArgs
 * @param {boolean} [debugMode=false]
 * @param {number} [timeout=40000]
 * @returns {Object}
 */
// eslint-disable-next-line arrow-body-style
const buildLaunchArgs = (chromeArgs, debugMode = false, timeout = 40000) => {
  return debugMode
    ? {
      args: chromeArgs,
      timeout,
      ignoreHTTPSErrors: true,
      headless: false,
      sloMoTiming,
      devtools: true,
    }
    : {
      args: chromeArgs,
      timeout,
      ignoreHTTPSErrors: true,
      headless: true,
    };
};

/**
 * Opens a new puppeteer / headless chrome instance and returns the page and browser objects.
 *
 * Additional launch arguments for the chrome process can be specified
 * in `additionalLaunchArgs`
 *
 * See `https://peter.sh/experiments/chromium-command-line-switches` for a list command line args
 *
 * @param {*} puppeteer
 * @param {string} userAgent
 * @param {string} navPlatform
 * @param {boolean} [proxyUrl=false]
 * @param {boolean} [debugMode=false]
 * @param {number} [timeout=40000]
 * @param {string} [vendor='Google Inc.']
 * @param {Object} [languageOptions=null]
 * @param {string} [additionalLaunchArgs=['--site-per-process']]
 * @returns {Object}
 */
const openPuppeteerConnection = async (
  puppeteer,
  userAgent,
  navPlatform,
  proxyUrl = false,
  debugMode = false,
  timeout = 40000,
  vendor = 'Google Inc.',
  languageOptions = null,
  additionalLaunchArgs = ['--site-per-process'],
) => {
  if (!Number.isInteger(timeout)) {
    throw new Error('timeout needs to be supplied as an integer value');
  }

  if (puppeteer) {
    const chromeArgs = buildChromeArgs(proxyUrl, additionalLaunchArgs);
    const launchArgs = buildLaunchArgs(chromeArgs, debugMode, timeout);
    const browser = await puppeteer.launch(launchArgs);
    const page = await browser.newPage();

    await page.setUserAgent(userAgent || defaultUserAgent());

    await page.setViewport({
      width: defaultWidth,
      height: defaultHeight,
    });

    page.setDefaultNavigationTimeout(timeout);

    // most of these did not improve score ...
    // await mockChromeRuntime(page);
    // await mockConsoleDebug(page);
    // await mockPlatform(page, navPlatform || defaultPlatform());
    // await mockWebDriver(page);
    // await mockMediaCodecs(page);
    // await mockPermissionsCheck(page);
    // await mockLanguages(page, languageOptions);
    // await mockPlugins(page);
    // await mockVendor(page, vendor);
    // await mockWindowDimensions(page);
    // await mockWebGLVendor(page);
    // await mockIframeContentWindow(page);
    // await coverVariableDetection(page);

    return {
      browser,
      page,
    };
  }

  throw new Error('puppeteer is undefined');
};

/**
 * Attempt to close the puppeteer page and browser objects
 *
 * @param {*} page
 * @param {*} browser
 */
const closePuppeteerConnection = async (page, browser) => {
  page && (await page.close());
  browser && (await browser.close());

  page = null;
  browser = null;
};

/**
 * Authenticate for proxy usage
 *
 * @param {*} page
 * @param {boolean} [proxyUrl=false]
 * @param {boolean} [proxyUser=false]
 * @param {boolean} [proxyPassword=false]
 */
const authenticateProxyUser = async (
  page,
  proxyUrl = false,
  proxyUser = false,
  proxyPassword = false,
) => {
  if (proxyUrl && proxyUser && proxyPassword) {
    await page.authenticate({
      username: proxyUser,
      password: proxyPassword,
    });
  }
};

module.exports = {
  openPuppeteerConnection,
  closePuppeteerConnection,
  authenticateProxyUser,
  defaultUserAgent,
  defaultPlatform,
  randomRange,
  randomPageWait,
  pageWait,
  getCurrentUrl,
  navigateToUrl,
  selectorExists,
  captureHtml,
  scrollToElement,
  clickLinkElement,
  clickLinkElementBlankTarget,
};
