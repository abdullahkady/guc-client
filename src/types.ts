interface TranscriptCourse {
  name: string;
  grade: {
    numeric: string;
    letter: string;
  };
  creditHours: string;
}

export interface TranscriptSemester {
  name: string;
  gpa: string;
  creditHours: string;
  courses: TranscriptCourse;
}

export interface TranscriptYear {
  year: string;
  semesters: TranscriptSemester[];
}
