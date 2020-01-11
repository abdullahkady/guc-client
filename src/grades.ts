import { Browser, Page } from 'puppeteer';
import { GRADES_URL } from './constants';
import { CourseWorkGrades, MidtermGrade, CourseWorkEntry } from './types';
import { createSlimPage } from './utils';

const extractMidtermGrades = (page: Page): Promise<MidtermGrade[]> =>
  page.$eval('#midDg', table =>
    [...table.querySelectorAll('tr')].slice(1).map(tr => {
      const [name, grade] = tr.querySelectorAll('td');
      return {
        courseName: name.innerText
          .split('-')
          .slice(1)
          .join('-')
          .trim(),
        grade: Number(grade.innerText.trim())
      };
    })
  );

/**
 * Given a page that is already navigated to a course's grades, it extracts all the
 * coursework for that course, while grouping questions belonging to the same quiz/assignment
 */
const extractCourseWorkEntries = async (page: Page): Promise<CourseWorkEntry[]> => {
  return page.$eval('#nttTr', t => {
    const result: CourseWorkEntry[] = [];
    [...t.querySelectorAll('tr')]
      .slice(1)
      .filter(row => row.innerText.trim() !== '')
      .forEach(row => {
        const [entry, element, gradeResult, professor] = [...row.querySelectorAll('td')].map(e =>
          e.innerText.trim()
        );
        const [grade, maxGrade] = gradeResult.split('/').map(n => Number(n.trim()));
        const currentElement = {
          name: element,
          grade,
          maxGrade,
          professor
        };
        if (entry === '') {
          result[result.length - 1].elements.push(currentElement);
        } else {
          result.push({
            name: entry,
            elements: [currentElement]
          });
        }
      });
    return result;
  });
};

const getGrades = async (
  { username, password }: { username: string; password: string },
  browser: Browser
): Promise<{ courseWork: CourseWorkGrades[]; midterms: MidtermGrade[] }> => {
  const context = await browser.createIncognitoBrowserContext();
  const page = await createSlimPage(context);
  await page.authenticate({ username, password });
  await page.goto(GRADES_URL);
  const midterms = await extractMidtermGrades(page);

  const availableCourses = await page.$$eval('option', (nodes: Array<HTMLOptionElement>) =>
    nodes
      .map(n => ({
        name: n.text
          .split('-')
          .slice(1)
          .join('-')
          .trim(),
        value: n.value
      }))
      .slice(1)
  );

  const courseWork: CourseWorkGrades[] = await Promise.all(
    availableCourses.map(async ({ name, value }) => {
      const page = await createSlimPage(context);
      await page.goto(GRADES_URL);
      await page.select('#smCrsLst', value);
      await page.waitForSelector('#nttTr');
      const courseWork = await extractCourseWorkEntries(page);
      page.close();
      return {
        name,
        courseWork
      };
    })
  );

  return {
    courseWork,
    midterms
  };
};

export { getGrades };
