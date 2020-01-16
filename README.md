# GUC Client

[![NPM Version](https://img.shields.io/npm/v/guc-client.svg)](https://npmjs.org/package/guc-client)
[![NPM Downloads](https://img.shields.io/npm/dm/guc-client.svg)](https://npmjs.org/package/guc-client)
[![LICENSE](https://img.shields.io/npm/l/guc-client)](https://github.com/AbdullahKady/guc-client/blob/master/LICENSE)
[![ISSUES](https://img.shields.io/github/issues/AbdullahKady/guc-client)](https://github.com/AbdullahKady/guc-client/issues)

A [node](http://nodejs.org) library that provides a programmatic API for GUC students, implementing the functionality of the admin system (currently for students).

<!-- TOC depthFrom:2 -->

- [1. Introduction](#1-introduction)
  - [1.1. Features](#11-features)
- [2. Installation](#2-installation)
- [3. Usage](#3-usage)
  - [3.1. Important Notes](#31-important-notes)
  - [3.2. API](#32-api)
- [4. Configuration](#4-configuration)
  - [4.1. Skipping Chromium Download](#41-skipping-chromium-download)
  - [4.2. Configuring Puppeteer Options](#42-configuring-puppeteer-options)
- [5. Errors](#5-errors)
- [6. Contribution](#6-contribution)
- [7. License](#7-license)

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

Note: When you install the package, it installs Puppeteer, which in turn downloads a recent version of Chromium (~170MB Mac, ~282MB Linux, ~280MB Win) that is guaranteed to work with the API. To skip the download, please check [Skipping Chromium Download](#41-skipping-chromium-download).

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

#### 3.2.4 GucClient.getSchedule()

Returns the logged in user's current semester schedule.

## 4. Configuration

### 4.1 Skipping Chromium Download

When running `npm install`, you can skip the download of the chromium binaries by setting the following environment variable:

```bash
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

However you **must** provide an executable path to a chromium binary (which is done via the `CHROMIUM_EXECUTABLE_PATH` environment variable). In the following example, it's assumed the default path to google-chrome, on an Ubuntu machine.

```bash
export CHROMIUM_EXECUTABLE_PATH=/usr/bin/google-chrome
```

This can be done via a `.env` file for easier configuration.

### 4.2 Configuring Puppeteer Options

When creating a client instance, you can provide an optional puppeteer browser instance, this will allow you to set any options you would like to the browser instance (and this can be used to specify the executable path without the use of `env` as mentioned above).

So for example, if you would like to run the library in a non-headless mode (see the browser interaction being rendered), you can run the following:

```javascript
const { GucClient } = require('guc-client');
const puppeteer = require('puppeteer');
const customOptions = {
  headless: true
  // any other options ...
};
(async () => {
  const browser = await puppeteer.launch(customOptions);
  const client = GucClient.create({ username: 'john.doe', password: '123' }, browser);
  // Use the client instance regularly ...
})();
```

## 5. Errors

The following errors can be thrown, you should try your best to handle each of them, and be as specific as possible:

### 5.1 InvalidCredentialsError

Thrown when the provided credentials fail to login. No further data is associated with the error.

### 5.2 SystemError

Thrown whenever the system faces a handled error (for instance, trying to access a page you are not authorized to).

The error object has the following properties:

- `message`: A string containing the title displayed on the error page
- `details`: A string containing further details displayed on the error page

### 5.2 UnknownSystemError

The error gets thrown whenever the system raises an exception that was not handled (500 on the GUC server basically).

The error object doesn't contain any further metadata, for the sake of privacy, since such errors dump the stacktrace (as of the time of writing this).

### 5.3 EvaluationRequiredError

The error is thrown only from the `getTranscript` function. Whenever course evaluation is required before accessing the transcript page.

It contains a `details` object in the following format:

```json
{
  "evaluationUrl": "url/to/evaluation",
  "courses": ["list", "of", "strings"]
}
```

## 6. Contribution

For any feedback or issues, feel free to open an [issue](https://github.com/AbdullahKady/guc-client/issues), make sure to keep it as detailed as possible.

If you would like to contribute, feel free to fork the repo, and open a PR. However, please _create an issue first_ with the feature/bug-fix you would like to implement, since it might be in-work already.

## 7. License

[![LICENSE](https://img.shields.io/npm/l/guc-client)](https://github.com/AbdullahKady/guc-client/blob/master/LICENSE)

The library is open source under the [MIT License](https://github.com/AbdullahKady/guc-client/blob/master/LICENSE).

DISCLAIMER: This library is in no way legally associated with the GUC. It is simply a personal project for automating day-to-day tasks involving the GUC system.
