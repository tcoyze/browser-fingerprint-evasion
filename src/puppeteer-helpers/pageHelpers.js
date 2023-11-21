/* eslint-disable max-len */

/**
 * Returns a random value between min and max
 *
 * @param {number} [min=10]
 * @param {number} [max=100]
 */
const randomRange = (min = 10, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Validates the presence of the page argument
 *
 * @param {*} page
 * @returns {boolean}
 */
const validatePage = (page) => {
  if (page) {
    return true;
  }
  throw new Error('page is required');
};

/**
 * Performs a random wait on the page between a minWait and maxWait time
 *
 * @param {*} page
 * @param {number} [minWait=10]
 * @param {number} [maxWait=100]
 */
const randomPageWait = async (page, minWait = 10, maxWait = 100) => {
  if (!Number.isInteger(minWait)) {
    throw new Error('minWait needs to be supplied as an integer value');
  }

  if (!Number.isInteger(maxWait)) {
    throw new Error('maxWait needs to be supplied as an integer value');
  }

  if (validatePage(page)) {
    // await page.waitFor(randomRange(minWait, maxWait));
    await page.waitForTimeout(randomRange(minWait, maxWait));
  }
};

/**
 * Performs a fixed time wait on the page
 *
 * @param {*} page
 * @param {number} [waitTime=100]
 */
const pageWait = async (page, waitTime = 100) => {
  if (!Number.isInteger(waitTime)) {
    throw new Error('waitTime needs to be supplied as an integer value');
  }

  if (validatePage(page)) {
    // await page.waitFor(waitTime);
    await page.waitForTimeout(waitTime);
  }
};

/**
 * Returns the url of the current page. Equivalent to calling `window.location.href` in a browser.
 *
 * @param {*} page
 * @returns {string|undefined}
 */
const getCurrentUrl = async (page) => {
  if (validatePage(page)) {
    // eslint-disable-next-line no-undef
    const url = await page.evaluate(() => window.location.href);
    return url;
  }

  return null;
};

/**
 * Attempt to navigate to a provided url
 *
 * @param {*} page
 * @param {string} url
 * @param {string} [waitUntil='networkidle2']
 */
const navigateToUrl = async (page, url, waitUntil = 'networkidle2') => {
  if (validatePage(page) && url) {
    await page.goto(url, {
      waitUntil,
    });
  }
};

/**
 * Attempts to capture the innerHTML of a specified selector on the page
 *
 * @param {*} page
 * @param {string} selector
 * @returns {string|undefined}
 */
const captureHtml = async (page, selector) => {
  const elementExists = await page.$(selector);
  if (elementExists) {
    const elementHandle = await page.$(selector);
    const html = await page.evaluate((el) => el.innerHTML, elementHandle);
    return html;
  }

  return null;
};

/**
 * Attempts to scroll to an element on the page, specified by a puppeteer `ElementHandle` object
 *
 * @param {*} page
 * @param {Object} elementHandle
 */
const scrollToElement = async (page, elementHandle) => {
  if (validatePage(page) && elementHandle) {
    await page.evaluate(
      (element) => element.scrollIntoView({
        behavior: 'smooth',
      }),
      elementHandle,
    );
  }
};

/**
 * Attempts to click on a link on the page,
 * as specified by a puppeteer `ElementHandle` object
 *
 * @param {*} page
 * @param {Object} elementHandle
 * @param {number} [minWait=75]
 * @param {number} [maxWait=150]
 * @param {boolean} [waitForNavigation=true]
 * @param {*} [consoleMessage=null]
 */
const clickLinkElement = async (
  page,
  elementHandle,
  minWait = 75,
  maxWait = 150,
  waitForNavigation = true,
  consoleMessage = null,
) => {
  if (!Number.isInteger(minWait)) {
    throw new Error('minWait needs to be supplied as an integer value');
  }

  if (!Number.isInteger(maxWait)) {
    throw new Error('maxWait needs to be supplied as an integer value');
  }

  if (validatePage(page) && elementHandle) {
    await scrollToElement(page, elementHandle);

    if (maxWait > 0) {
      await randomPageWait(page, minWait, maxWait);
    }

    if (consoleMessage) {
      // eslint-disable-next-line no-console
      console.log(consoleMessage);
    }

    if (waitForNavigation) {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle2',
        }),
        await page.evaluate((el) => {
          el.click();
        }, elementHandle),
      ]);
    } else {
      await Promise.all([
        await page.evaluate((el) => {
          el.click();
        }, elementHandle),
      ]);
    }
  }
};

/**
 * Attempts to click on a link on the page that opens content in a new tab,
 * as specified by a puppeteer `ElementHandle` object
 *
 * @param {*} page
 * @param {Object} elementHandle
 * @param {number} [minWait=75]
 * @param {number} [maxWait=150]
 * @param {*} [consoleMessage=null]
 * @returns {Object|null}
 */
const clickLinkElementBlankTarget = async (
  page,
  elementHandle,
  minWait = 75,
  maxWait = 150,
  consoleMessage = null,
) => {
  if (!Number.isInteger(minWait)) {
    throw new Error('minWait needs to be supplied as an integer value');
  }

  if (!Number.isInteger(maxWait)) {
    throw new Error('maxWait needs to be supplied as an integer value');
  }

  if (validatePage(page) && elementHandle) {
    await scrollToElement(page, elementHandle);

    if (maxWait > 0) {
      await randomPageWait(page, minWait, maxWait);
    }

    if (consoleMessage) {
      // eslint-disable-next-line no-console
      console.log(consoleMessage);
    }

    const [newPage] = await Promise.all([
      new Promise((resolve) => page.once('popup', resolve)),
      await page.evaluate((el) => {
        el.click();
      }, elementHandle),
    ]);

    return newPage;
  }

  return null;
};

module.exports = {
  randomRange,
  randomPageWait,
  pageWait,
  getCurrentUrl,
  navigateToUrl,
  captureHtml,
  scrollToElement,
  clickLinkElement,
  clickLinkElementBlankTarget,
};
