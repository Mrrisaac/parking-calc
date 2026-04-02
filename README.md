# Glenwood Parking Contract Calculator

This project provides a small in-browser calculator for Glenwood parking contracts along with automated tests that verify the monthly and prorated charge logic.

## Prerequisites

* [Node.js](https://nodejs.org/) 18 or newer (for the test runner and local web server)

## Install dependencies

No npm packages are required for the calculator or its tests, so there is nothing to install after cloning the repository.

## Run the automated tests

```bash
npm test
```

This executes the Node test suite located in `test/calculator.test.js`.

## Try the calculator locally

You can launch a lightweight static server that serves `index.html` and the supporting JavaScript files:

```bash
npm start
```

By default the server listens on [http://localhost:4173](http://localhost:4173). Once running, open that URL in your browser to interact with the calculator UI.

To stop the server, press <kbd>Ctrl</kbd> + <kbd>C</kbd> in the terminal.

## Version details

When the calculator runs through `npm start`, the footer automatically loads `version.json` from the Node server. That endpoint
combines the `package.json` version with the date of the latest Git commit so you can confirm you are looking at the newest 
build. If Git metadata is unavailable, the UI falls back to the current date or shows a brief "Version information is unavailable"
message.

## Project structure

* `index.html` – The calculator form and result markup.
* `app.js` – Browser controller logic that reads the form, calls the calculator, and renders the summary table.
* `calculator.js` – Shared calculation logic for prorated amounts and taxes.
* `serve.js` – Simple Node HTTP server for local testing.
* `test/` – Automated tests that cover the calculation edge cases.
