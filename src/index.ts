import puppeteer, { Browser } from 'puppeteer';
import { HOMEPAGE_URL } from './constants';
import { chromiumExecutablePath } from './config';
import { getTranscript } from './services/transcript';
import { getGrades } from './services/grades';
import { getSchedule } from './services/schedule';
import { createSlimPage } from './utils';
import { InvalidCredentials, SystemError, UnknownSystemError } from './errors';
import { TranscriptYear, CourseWorkGrades, MidtermGrade, DaySchedule } from './services/types';

export default class GucClient {
  private credentials: { username: string; password: string };
  private browser: Browser;
  /**
   * Creates a client instance asynchronously, which can throw an error if
   * invalid credentials are provided, or if the system is down.
   */
  public static create = async (
    credentials: { username: string; password: string },
    browser?: Browser
  ): Promise<GucClient> => {
    const instance = new GucClient();
    if (!browser) {
      browser = await puppeteer.launch({ executablePath: chromiumExecutablePath });
    }
    instance.browser = browser;

    await instance.login(credentials);

    return instance;
  };

  private async login(credentials: { username: string; password: string }): Promise<void> {
    const page = await createSlimPage(this.browser);
    await page.authenticate(credentials);
    await page.goto(HOMEPAGE_URL);
    const error = await page.evaluate(() => {
      const title = document.querySelector('title').innerText.trim();
      if (title === "GUC Students' Services") {
        return false;
      }

      // In the case of a handled exception, the message is stored in h2, and details in an h3?
      const message = document.querySelector('h2');
      const details = document.querySelector('h3');

      return {
        title,
        message: message ? message.innerText.trim() : null,
        details: details ? details.innerText.trim() : null
      };
    });
    await page.close();
    if (error) {
      const { title, message, details } = error;
      if (title === '401 - Unauthorized: Access is denied due to invalid credentials.') {
        throw new InvalidCredentials();
      }

      if (title === 'The state information is invalid for this page and might be corrupted.') {
        // True error from the system (shows the stacktrace \_0_/)
        throw new UnknownSystemError();
      }

      if (message && details) {
        throw new SystemError(message, details);
      }
      throw new UnknownSystemError();
    }

    // Credentials only assigned if the login was successful (ie no error thrown).
    this.credentials = credentials;
  }

  getTranscript(): Promise<Array<TranscriptYear>> {
    return getTranscript(this.credentials, this.browser);
  }

  getGrades(): Promise<{ courseWork: CourseWorkGrades[]; midterms: MidtermGrade[] }> {
    return getGrades(this.credentials, this.browser);
  }

  getSchedule(): Promise<Array<DaySchedule>> {
    return getSchedule(this.credentials, this.browser);
  }

  /**
   * This method should always be called at the end of your code, or else your code will
   * never terminate (as the browser will stay open).
   */
  terminate(): Promise<void> {
    return this.browser.close();
  }
}
