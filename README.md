# jira-tools

jira-tools is both a library that provides APIs to work with Jira servers (see [index.ts](./src/index.ts) for the list of APIs offered) and a set of node apps that allows to work with Jira from the command line.

The apps can be launched with the command

`npx jira-tools <app-name> <params>`

or, if we have cloned jira-tools repo, from the jira-tools repo folder launching the command

`node ./dist/lib/command.js <app-name> <params>`

Executing `npx jira-tools` prints on the console the list of available apps.

Executing `npx jira-tools <app-name> -h` prints on the console the help for the specific app.

## commands
- [**write-issues**](./src/apps/write-issues/launch-write-issues.ts): fetches the Jira issues related to the project ids provided and writes them in a csv file