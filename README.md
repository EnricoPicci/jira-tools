# jira-tools

jira-tools is a node app configured to use Typescript scaffolded using the package `@enrico.piccinin/create-node-ts-app`.

jira-tools can be published as a package on the public NPM registry.

Contains a configuration for `eslint` and `prettier`.

Testing is based on the `mocha` and `chai` libraries.

In the `src` folder there is a `package-core.ts` file containing a sample of a function which is exported by the package via the `index.ts` file.

## test

Run the tests using the command

`npm run test`

## Publish on NPM registry

To publish on NPM registry the package rune the command

`npm publish`
