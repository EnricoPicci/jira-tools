#!/usr/bin/env node

import { launchWriteIssues } from "../apps/write-issues/launch-write-issues";

const command = process.argv[2];

const commandsAvailable: { [command: string]: () => void } = {
    'write-issues': launchWriteIssues,
}

const functionForCommand = commandsAvailable[command];

if (functionForCommand) {
    functionForCommand();
} else {
    if (command) {
        console.log(`Command ${command} not found`);
    }

    console.log(`Commands allowed:`)

    Object.keys(commandsAvailable).forEach(command => {
        console.log('- ' + command);
    })
}


