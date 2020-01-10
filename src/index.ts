import puppeteer from 'puppeteer';
import { LOGIN } from './constants';
import { getTranscript } from './transcript';
import { getGrades } from './grades';
import { writeFileSync } from 'fs';

const main = async (): Promise<void> => {
  const browser = await puppeteer.launch({ headless: false });

  await Promise.all([
    getTranscript(LOGIN, browser).then(val => {
      writeFileSync('./output/transcript.json', JSON.stringify(val, null, 2));
    }),
    getGrades(LOGIN, browser).then(val => {
      writeFileSync('./output/grades.json', JSON.stringify(val, null, 2));
    })
  ]);
  await browser.close();
  console.log('Done, thank you :)');
};

main();
