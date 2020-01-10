require('dotenv').config();

export const LOGIN = {
  username: process.env.GUC_USERNAME,
  password: process.env.GUC_PASSWORD
};
export const TRANSCRIPT_URL = 'http://student.guc.edu.eg/external/student/grade/Transcript.aspx';
export const GRADES_URL = 'http://student.guc.edu.eg/external/student/grade/CheckGrade.aspx';
