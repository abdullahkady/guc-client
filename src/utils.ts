import { Browser, BrowserContext, Page } from 'puppeteer';

/**
 * Creates a page that blocks all unnecessary requests (images/css/scripts)
 */
export const createSlimPage = async (instance: Browser | BrowserContext): Promise<Page> => {
  const page = await instance.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
      request.abort();
    } else {
      request.continue();
    }
  });
  return page;
};
