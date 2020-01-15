// ==================================== //
// ============ Transcript ============ //
// ==================================== //
interface TranscriptCourse {
  name: string;
  grade: {
    numeric: number;
    letter: string;
  };
  creditHours: number;
}

export interface TranscriptSemester {
  name: string;
  gpa: number;
  courses: TranscriptCourse;
}

export interface TranscriptYear {
  year: string;
  semesters: TranscriptSemester[];
}

// ==================================== //
// ============== Grades ============== //
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

// ==================================== //
// ============= Schedule ============= //
// ==================================== //

interface Slot {
  period: number;
  type: string;
  location: string;
  course: string;
  group: string;
}

export interface DaySchedule {
  day: 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday';
  slots: Array<Slot | null>;
}
