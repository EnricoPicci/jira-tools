"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchWriteIssues = void 0;
const fs_1 = __importDefault(require("fs"));
const commander_1 = require("commander");
const issues_1 = require("../../issues/issues");
function launchWriteIssues() {
    console.log('====>>>> Launching Write Issues');
    const { jiraUrl, username, password, projectIds, costumFieldNames, outdir } = readParams();
    (0, issues_1.writeMultiProjectIssues$)(jiraUrl, username, password, projectIds, costumFieldNames, outdir)
        .subscribe({
        next: (filePath) => {
            console.log(`Jira issues written in file ${filePath}`);
        },
        error: (err) => {
            console.log(err);
        }
    });
}
exports.launchWriteIssues = launchWriteIssues;
function readParams() {
    const program = new commander_1.Command();
    program
        .description('A command to fetch issues from Jira and write them to a CSV file')
        .requiredOption('--jiraUrl <string>', `url pointing to Jira instance (e.g. support.my_company.com)`)
        .requiredOption('--username <string>', `username to authenticate with Jira instance`).requiredOption('--password <string>', `password to authenticate with Jira instance`).option('--projectIds <string...>', `a space separated list of project IDs to fetch issues from (e.g. --projectIds "ABC" "XYZ") - 
            the default is the empty list, which means that no issues will be read`).option('--costumFieldNamesJson <string>', `path to a JSON file containing the custom field names that have to be read (e.g. --costumFieldNamesJson "./custom-field-names.json") -
        the JSON file must contain an object mapping custom field IDs to their real names -
        each custom field name must be a property of the json whose value is the real name of the field, i.e. the 
        the name that will be used in the CSV header -
        if no json file is provided and the --costumFieldNames option is not used, then no custom fields will be read`).option('--costumFieldNames <string...>', `a space separated list of custom field names that have to be read (e.g. --projectIds "customfield_11520: line_of_business" "customfield_18714: customers") -
        each custom field name must be in the form "customfield_XXXXX: real_name" where customfield_XXXXX is the ID of the custom field and 
        real_name is the name that will be used in the CSV header -
        the default is the empty list, which means that no custom fields will be read unless the --costumFieldNamesJson option is used`).option('--outdir <string>', `directory where the output files will be written (e.g. ./data) - default is the current directory`);
    const _options = program.parse(process.argv).opts();
    const outdir = _options.outdir || process.cwd();
    const projectIds = _options.projectIds || [];
    const _costumFieldNames = _options.costumFieldNames || [];
    let costumFieldNames;
    costumFieldNames = _options.costumFieldNamesJson ?
        // if the --costumFieldNamesJson option is used, then the costumFieldNames object is read from the JSON file
        JSON.parse(fs_1.default.readFileSync(_options.costumFieldNamesJson, 'utf8')) :
        // if the --costumFieldNamesJson option is not used, then the costumFieldNames object is built from the --costumFieldNames option
        // _costumFieldNames is an array of strings in the form "customfield_XXXXX: real_name" which has to be converted to an object
        // with the form { customfield_XXXXX: real_name }
        _costumFieldNames.reduce((acc, curr) => {
            const [customfield, real_name] = curr.split(':');
            acc[customfield] = real_name.trim();
            return acc;
        }, {});
    return { jiraUrl: _options.jiraUrl, username: _options.username, password: _options.password, projectIds, costumFieldNames, outdir };
}
//# sourceMappingURL=launch-write-issues.js.map