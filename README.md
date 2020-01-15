# GUC Client

A [node](http://nodejs.org) library that provides a programmatic API for GUC students, implementing the functionality of the admin system (currently for students).

<p align="center">
    <a href="https://npmjs.org/package/guc-client" alt="NPM">
        <img src="https://img.shields.io/npm/v/guc-client.svg" />
    </a>
    <a href="https://npmjs.org/package/guc-client" alt="NPM Downloads">
        <img src="https://img.shields.io/npm/dm/guc-client.svg" />
    </a>
    <a href="https://github.com/AbdullahKady/guc-client/blob/master/LICENSE" alt="MIT LICENSE">
        <img src="https://img.shields.io/npm/l/guc-client" />
    </a>
    <a href="https://github.com/AbdullahKady/guc-client/blob/master/LICENSE" alt="Open Issues">
        <img src="https://img.shields.io/github/issues/AbdullahKady/guc-client" />
    </a>
</p>

<!-- TOC depthFrom:2 -->

- [1. Introduction](#1-introduction)
  - [1.1. Features](#11-features)
- [2. Installation](#2-installation)
- [3. Usage](#3-usage)
  - [3.1. Important Notes](#31-important-notes)
  - [3.2. API](#32-api)
- [4. Configuration](#4-configuration)
  - [4.1. Default Settings](#41-default-settings)
  - [4.2. Unique Settings](#42-unique-settings)
- [5. Errors](#5-errors)
- [6. Contribution](#6-contribution)
- [7. Question](#7-question)
- [8. License](#8-license)
- [9. Links](#9-links)

<!-- /TOC -->

## 1. Introduction

The library uses [puppeteer](https://github.com/puppeteer/puppeteer), a chromium _headless browser_. Since the GUC has no API (as of the time of writing this), this solution might not be the fastest, but it is the best that can be done for now.

The implementation covers the perspective of a **student**, if any staff members would like to contribute to include their own functionalities, please check the [contribution](#6-contribution) section.

### 1.1. Features

- Full transcript of the student in a relatively fast time (without having to wait a minute between requests)
- Current semester's grades (Course work & Midterms)
- Current semester schedule
- Reports specific errors when the GUC system is down, course evaluation is required, etc.

## 2. Installation

Requires Node _8.9.0+_ due to puppeteer's [requirements](https://github.com/puppeteer/puppeteer#usage).

```bash
npm i guc-client
```

Note: When you install the package, it installs Puppeteer, which in turn downloads a recent version of Chromium (~170MB Mac, ~282MB Linux, ~280MB Win) that is guaranteed to work with the API. To skip the download, please check [Configuration](#4-configuration).

## 3. Usage

First require the client class, and set the credentials object

```javascript
const { GucClient, errors } = require('guc-client');
const credentials = { username: 'john.doe', password: '123' };
```

The following is a basic example for fetching the grades, while catching an error if the authentication failed.
The implementation is based on promises, it is recommended to use `async/await` for easier syntax

```javascript
(async () => {
  try {
    const client = await GucClient.create(credentials);
    const grades = await client.getGrades();
    console.log(grades);
    await client.terminate();
  } catch (error) {
    if (error instanceof errors.InvalidCredentialsError) {
      console.log('Invalid username or password!');
    }
  }
})();
```

Or using normal `then/catch` syntax as so

```javascript
GucClient.create(credentials)
  .then(instance => {
    instance.getGrades().then(grades => {
      console.log(grades);
      instance.terminate();
    });
  })
  .catch(error => {
    if (error instanceof errors.InvalidCredentialsError) {
      console.log('Invalid username or password!');
    }
  });
```

### 3.1. Important Notes

- The `GucClient.create` is asynchronous, and it can throw an error, mainly for invalid credentials, but also if the GUC system is down. You **should** always handle such errors as described in the [errors-section](#5-errors).
- You **must** call the `.terminate()` function after your code is no longer using the client, and `await` it, or else the application process won't stop (the spawned browser process won't be closed otherwise).

### 3.2. API

Since the library is written in TypeScript, the typing will be skipped in the docs as they can be inferred (use an editor with Intellisense for easier development)

#### 3.2.1 GucClient.create()

A factory function that **asynchronously** creates a client instance (given the user's login information), it tests the system by logging in with the provided credentials, and can throw any of the following system errors:

- `InvalidCredentialsError`
- `SystemError`
- `UnknownSystemError`

#### 3.2.2 GucClient.getTranscript()

Returns the full transcript (all available years) for the logged in student. The function may throw `EvaluationRequiredError` if the GUC system is requiring evaluation before showing the transcript.

#### 3.2.3 GucClient.getGrades()

Returns the logged in user's semester grades: both the coursework of all current courses, as well as the midterm grades if any.

#### 3.2.4

============================================
DISCLAIMER: This library is in no way legally associated with the GUC. It is simply a personal project for automating day-to-day tasks involving the GUC, by providing a programmatic API.
