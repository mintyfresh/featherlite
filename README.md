# Featherlite

Lightweight swiss tournament software for MLPCCG, runs in electron or the browser.

## Setup

Install NPM dependencies

    npm ci

## Running in the browser

To run the development server

    npm run dev

### Production in the browser

Build the application

    npm run build

Run the webserver

    npx serve -d dist

## Running in electron

To run electron in development

    npm run electron:dev

### Production with electron

Build the application

    npm run electron:build

Run the app

    npm run electron:preview

To build release executables (optional)

    npm run electron:release
