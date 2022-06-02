/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 * Licensed under the MIT License.
 */
 */
import { Permissions } from '@microsoft/mixed-reality-extension-sdk';
import { Permissions, WebHost } from '@microsoft/mixed-reality-extension-sdk';
import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import dotenv from 'dotenv';
import dotenv from 'dotenv';
import { resolve as resolvePath } from 'path';
import { resolve as resolvePath } from 'path';
import App from './app';
import App from './app';
// add some generic error handlers here, to log any exceptions we're not expecting
/* eslint-disable no-console */
process.on('uncaughtException', err => console.log('uncaughtException', err));
process.on('uncaughtException', err => console.log('uncaughtException', err));
process.on('unhandledRejection', reason => console.log('unhandledRejection', reason));
process.on('unhandledRejection', reason => console.log('unhandledRejection', reason));
/* eslint-enable no-console */
// Read .env if file exists
// Read .env if file exists
dotenv.config();
dotenv.config();
// This function starts the MRE server. It will be called immediately unless
// This function starts the MRE server. It will be called immediately unless
// we detect that the code is running in a debuggable environment. If so, a
// we detect that the code is running in a debuggable environment. If so, a
// small delay is introduced allowing time for the debugger to attach before
// small delay is introduced allowing time for the debugger to attach before
// the server starts accepting connections.
// the server starts accepting connections.
function runApp() {
function runApp() {
        // Start listening for connections, and serve static files.
  // Start listening for connections, and serve static files.
        const server = new MRE.WebHost({
  const server = new WebHost({
                // baseUrl: 'http://<ngrok-id>.ngrok.io',
    // baseUrl: 'http://<ngrok-id>.ngrok.io',
                baseDir: resolvePath(__dirname, '../public'),
    baseDir: resolvePath(__dirname, '../public'),
                permissions: [Permissions.UserInteraction, Permissions.UserTracking]
    permissions: [Permissions.UserInteraction, Permissions.UserTracking]
        });
  });
        // Handle new application sessions
  // Handle new application sessions
        server.adapter.onConnection((context, params) => new App(context, params));
  server.adapter.onConnection((context, params) => new App(context, params, server.baseUrl));
}
}
// Check whether code is running in a debuggable watched filesystem
// Check whether code is running in a debuggable watched filesystem
// environment and if so, delay starting the app by one second to give
// environment and if so, delay starting the app by one second to give
// the debugger time to detect that the server has restarted and reconnect.
// the debugger time to detect that the server has restarted and reconnect.
// The delay value below is in milliseconds so 1000 is a one second delay.
// The delay value below is in milliseconds so 1000 is a one second delay.
// You may need to increase the delay or be able to decrease it depending
// You may need to increase the delay or be able to decrease it depending
// on the speed of your machine.
// on the speed of your machine.
const delay = 1000;
const delay = 1000;
const argv = process.execArgv.join();
const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');
const isDebug = argv.includes('inspect') || argv.includes('debug');
if (isDebug) {
if (isDebug) {
        setTimeout(runApp, delay);
  setTimeout(runApp, delay);
} else {
} else {
        runApp();
  runApp();
}
}
