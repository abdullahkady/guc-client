import { Browser, Page } from 'puppeteer';
import { DaySchedule } from './types';
import { createSlimPage } from '../utils';
import { SCHEDULE_URL } from '../constants';

const extractSchedule = (page: Page): Promise<Array<DaySchedule>> =>
  page.$eval('#scdTbl', (table: any) =>
    [...table.firstElementChild.children].slice(1, -1).map(row => {
      const slots = [...row.children];
      const day = slots.shift().innerText.trim();

      // Days off don't have the same structure in the table.
      if (slots.length !== 5) {
        return {
          day,
          slots: Array(5).fill(null)
        };
      }

      const result = slots.map((slot, i) => {
        if (slot.innerText.trim() === 'Free') {
          return null;
        }

        const rawName = slot.innerText.trim();
        let [group, course, courseLocation, type] = ['', '', '', ''];

        if (slot.querySelectorAll('td').length > 1) {
          [group, courseLocation, course] = [...slot.querySelectorAll('td')].map(
            td => td.innerText
          );
          group = group.split(' ').pop();
          type = course.split(' ').pop() === 'Tut' ? 'TUTORIAL' : 'LAB';
          course = course // Remove the Lab/Tut suffix
            .split(' ')
            .slice(0, -1)
            .join(' ');
        } else {
          type = 'LECTURE';
          courseLocation = slot.innerText.split('\n').pop();
          [course, group] = slot.innerText
            .split('\n')
            .shift()
            .split('Lecture');
          group = group.trim().slice(1, -1); // Remove excess brackets
        }

        return {
          period: i + 1, // Will be useful if the schema of nulls is dropped in the future.
          type,
          course: course.trim(),
          group: group.trim(),
          location: courseLocation,
          rawName
        };
      });

      return {
        day,
        slots: result
      };
    })
  );

const getSchedule = async (
  { username, password }: { username: string; password: string },
  browser: Browser
): Promise<Array<DaySchedule>> => {
  const page = await createSlimPage(browser);
  await page.authenticate({ username, password });
  await page.goto(SCHEDULE_URL);

  return extractSchedule(page);
};

export { getSchedule };
