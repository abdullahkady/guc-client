import { LOGIN } from './constants';
import { getTranscript } from './transcript';
import { writeFileSync } from 'fs';

getTranscript(LOGIN).then(val => {
  writeFileSync('./output/transcript.json', JSON.stringify(val, null, 2));
});
