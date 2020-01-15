export class EvaluationRequiredError extends Error {
  details: { evaluationUrl: string; courses: string[] };
  constructor(evaluationUrl: string, courses: string[]) {
    super();
    this.message = 'You need to finish the required evaluations before accessing the transcript';
    this.details = {
      evaluationUrl: evaluationUrl,
      courses: courses
    };
  }
}
