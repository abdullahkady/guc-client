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

// ==================================== //
// ==================================== //

export interface CourseWorkEntry {
  name: string;
  elements: { name: string; professor: string; grade: number; maxGrade: number }[];
}

export interface CourseWorkGrades {
  name: string;
  courseWork: CourseWorkEntry[];
}

export interface MidtermGrade {
  courseName: string;
  grade: number;
}
