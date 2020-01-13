export class InvalidCredentials extends Error {
  constructor() {
    super();
    this.message = 'Credentials provided are invalid';
  }
}

export class SystemException extends Error {
  details: string;
  constructor(message: string, details: string) {
    super();
    this.message = message;
    this.details = details;
  }
}

export class UnknownSystemException extends Error {
  constructor() {
    super();
    this.message = 'The GUC system experienced an unhandled exception';
  }
}
