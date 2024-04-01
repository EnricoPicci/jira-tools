#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const launch_write_issues_1 = require("../apps/write-issues/launch-write-issues");
const command = process.argv[2];
const commandsAvailable = {
    'write-issues': launch_write_issues_1.launchWriteIssues,
};
const functionForCommand = commandsAvailable[command];
if (functionForCommand) {
    functionForCommand();
}
else {
    if (command) {
        console.log(`Command ${command} not found`);
    }
    console.log(`Commands allowed:`);
    Object.keys(commandsAvailable).forEach(command => {
        console.log('- ' + command);
    });
}
//# sourceMappingURL=command.js.map