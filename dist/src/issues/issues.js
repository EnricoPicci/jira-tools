"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeMultiProjectIssues$ = exports.fetchMultiProjectIssues$ = exports.fetchProjectStories$ = exports.fetchProjectIssues$ = void 0;
const axios_1 = __importDefault(require("axios"));
const rxjs_1 = require("rxjs");
const issues_model_1 = require("./issues.model");
const observable_fs_1 = require("observable-fs");
const csv_tools_1 = require("@enrico.piccinin/csv-tools");
//********************************************************************************************************************** */
//****************************   APIs                               **************************************************** */
//********************************************************************************************************************** */
/**
 * This function fetches issues from a Jira project using the Jira REST API and returns an Observable stream of the issues.
 * It first defines a list of basic fields to fetch for each issue, then combines these basic fields with the keys of the
 * `customFieldNames` object to get the complete list of fields to fetch.
 * It constructs a `postBody` object that includes a JQL query to select the project, the start point, the maximum number of results,
 * and the fields to fetch.
 * It defines a `postFactory$` function that makes a POST request to the Jira REST API's search endpoint, passing the `postBody`
 * and the authentication details. The response from this request is an Observable that is transformed to extract the issues
 * and some metadata from the response.
 * Finally, it calls `postFactory$` with the initial `postBody`, and uses the `expand` operator to recursively fetch all pages of issues.
 * It uses the `concatMap` operator to flatten the paged issues into a single stream of issues, and the `map` operator to transform
 * each issue into a more compact form.
 *
 * @param {string} jiraUrl - The URL of the Jira instance.
 * @param {string} username - The username for authenticating with the Jira instance.
 * @param {string} password - The password for authenticating with the Jira instance.
 * @param {string} projectId - The ID of the Jira project from which to fetch issues.
 * @param {Object} customFieldNames - An object mapping custom field IDs to their names.
 * @param {FetchProjectIssuesOptions} options - An optional parameter that sets the starting point (startAt) and the maximum number of results (maxResults) for the fetch operation.
 *
 * @returns {Observable} An Observable stream of the issues from the Jira project.
 */
function fetchProjectIssues$(jiraUrl, username, password, projectId, customFieldNames, options = new FetchProjectIssuesOptions()) {
    // define the basic fields to fetch for each issue and then combine them with the custom field names
    const basicFields = [
        "summary",
        "description",
        "created",
        "updated",
        "creator",
        "reporter",
        "priority",
        "labels",
        "status",
        "assignee",
        "issuetype",
        "project",
    ];
    const fields = [...basicFields, ...Object.keys(customFieldNames)];
    // define the body to be sent in the POST request
    const postBody = {
        "jql": `project=${projectId}`,
        startAt: options.startAt,
        maxResults: options.maxResults,
        fields
    };
    // postFactory$ is an function, internal to fetchProjectIssues$, that makes a POST request to the Jira REST API's search endpoint
    // passing the postBody and the authentication details. The response from this request is an Observable that is transformed to
    // extract the issues and some metadata from the response.
    // In particular the data notified contain the updated value of startAt, so that the next request will start from the correct point.
    const postFactory$ = (postBody) => {
        return (0, rxjs_1.from)(axios_1.default.post(`https://${jiraUrl}/rest/api/2/search`, postBody, {
            auth: { username, password },
            headers: {
                "Content-Type": "application/json",
            }
        })).pipe((0, rxjs_1.map)(resp => {
            const issuesPaged = resp.data.issues;
            const startAt = resp.data.startAt + issuesPaged.length;
            const total = resp.data.total;
            console.log(`>>>>> read ${startAt} of ${total} total issues for project ${projectId}`);
            return { issuesPaged, startAt, total };
        }));
    };
    // call postFactory$ with the initial postBody, and use the expand operator to recursively fetch all pages of issues
    return postFactory$(postBody).pipe(
    // use expand to recursively fetch all pages of issues until the startAt is greater than or equal to the total number of issues
    (0, rxjs_1.expand)(({ startAt, total }) => {
        if (startAt >= total) {
            console.log(`>>>>> Reading of issues completed for project ${projectId}`);
            return rxjs_1.EMPTY;
        }
        const _postBody = Object.assign({}, postBody);
        _postBody.startAt = startAt;
        // recursivly call postFactory$ to fetch the next page of issues
        return postFactory$(_postBody);
    }), (0, rxjs_1.catchError)((err) => {
        var _a, _b;
        if (err.response && err.response.status === 400) {
            const errorMessages = (_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errorMessages;
            const msg = errorMessages ? errorMessages.join('\n') : 'Status 400 received from Jira server for project ${projectId}';
            console.warn(msg);
            return rxjs_1.EMPTY;
        }
        throw err;
    }), (0, rxjs_1.concatMap)(({ issuesPaged }) => {
        return issuesPaged;
    }), (0, rxjs_1.map)((issue) => {
        return (0, issues_model_1.newIssueCompact)(issue, customFieldNames);
    }), (0, rxjs_1.map)(jiraIssue => {
        return (0, issues_model_1.toCustomJiraIssue)(jiraIssue, customFieldNames);
    }));
}
exports.fetchProjectIssues$ = fetchProjectIssues$;
function fetchProjectStories$(jiraUrl, username, password, projectId, customFieldNames, options = new FetchProjectIssuesOptions()) {
    // define the basic fields to fetch for each issue and then combine them with the custom field names
    const basicFields = [
        "summary",
        "description",
        "created",
        "updated",
        "creator",
        "reporter",
        "priority",
        "labels",
        "status",
        "assignee",
        "issuetype",
        "project",
    ];
    const fields = [...basicFields, ...Object.keys(customFieldNames)];
    // define the body to be sent in the POST request
    const postBody = {
        "jql": `project=${projectId} AND type=Story`,
        startAt: options.startAt,
        maxResults: options.maxResults,
        fields
    };
    // postFactory$ is an function, internal to fetchProjectIssues$, that makes a POST request to the Jira REST API's search endpoint
    // passing the postBody and the authentication details. The response from this request is an Observable that is transformed to
    // extract the issues and some metadata from the response.
    // In particular the data notified contain the updated value of startAt, so that the next request will start from the correct point.
    const postFactory$ = (postBody) => {
        return (0, rxjs_1.from)(axios_1.default.post(`https://${jiraUrl}/rest/api/2/search`, postBody, {
            auth: { username, password },
            headers: {
                "Content-Type": "application/json",
            }
        })).pipe((0, rxjs_1.map)(resp => {
            const issuesPaged = resp.data.issues;
            const startAt = resp.data.startAt + issuesPaged.length;
            const total = resp.data.total;
            console.log(`>>>>> read ${startAt} of ${total} total issues for project ${projectId}`);
            return { issuesPaged, startAt, total };
        }));
    };
    // call postFactory$ with the initial postBody, and use the expand operator to recursively fetch all pages of issues
    return postFactory$(postBody).pipe(
    // use expand to recursively fetch all pages of issues until the startAt is greater than or equal to the total number of issues
    (0, rxjs_1.expand)(({ startAt, total }) => {
        if (startAt >= total) {
            console.log(`>>>>> Reading of issues completed for project ${projectId}`);
            return rxjs_1.EMPTY;
        }
        const _postBody = Object.assign({}, postBody);
        _postBody.startAt = startAt;
        // recursivly call postFactory$ to fetch the next page of issues
        return postFactory$(_postBody);
    }), (0, rxjs_1.catchError)((err) => {
        var _a, _b;
        if (err.response && err.response.status === 400) {
            const errorMessages = (_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.errorMessages;
            const msg = errorMessages ? errorMessages.join('\n') : 'Status 400 received from Jira server for project ${projectId}';
            console.warn(msg);
            return rxjs_1.EMPTY;
        }
        throw err;
    }), (0, rxjs_1.concatMap)(({ issuesPaged }) => {
        return issuesPaged;
    }), (0, rxjs_1.map)((issue) => {
        return (0, issues_model_1.newIssueCompact)(issue, customFieldNames);
    }), (0, rxjs_1.map)(jiraIssue => {
        return (0, issues_model_1.toCustomJiraIssue)(jiraIssue, customFieldNames, false);
    }));
}
exports.fetchProjectStories$ = fetchProjectStories$;
/**
 * This function fetches issues from multiple Jira projects using the Jira REST API and returns an Observable stream of the issues.
 * It receives a list of project IDs and for each project ID, it calls the `fetchProjectIssues$` function.
 * All the resulting streams of issues are flattened into a single stream of issues using the `concatMap` operator.
 *
 * @param {string} jiraUrl - The URL of the Jira instance.
 * @param {string} username - The username for authenticating with the Jira instance.
 * @param {string} password - The password for authenticating with the Jira instance.
 * @param {string[]} projectIds - An array of the IDs of the Jira projects from which to fetch issues.
 * @param {Object} customFieldNames - An object mapping custom field IDs to their names.
 *
 * @returns {Observable} An Observable stream of the issues from the Jira projects.
 */
function fetchMultiProjectIssues$(jiraUrl, username, password, projectIds, customFieldNames) {
    return (0, rxjs_1.from)(projectIds).pipe((0, rxjs_1.concatMap)(projectId => fetchProjectIssues$(jiraUrl, username, password, projectId, customFieldNames)));
}
exports.fetchMultiProjectIssues$ = fetchMultiProjectIssues$;
/**
 * This function fetches issues from multiple Jira projects and writes them to a CSV file.
 * It first calls the `fetchMultiProjectIssues$` function to fetch the issues, then it calls the `writeCustomIssuesToCsv$` function
 * to write the issues to a CSV file.
 *
 * @param {string} jiraUrl - The URL of the Jira instance.
 * @param {string} username - The username for authenticating with the Jira instance.
 * @param {string} password - The password for authenticating with the Jira instance.
 * @param {string[]} projectIds - An array of the IDs of the Jira projects from which to fetch issues.
 * @param {Object} customFieldNames - An object mapping custom field IDs to their names.
 * @param {string} outdir - The directory where the CSV file will be written.
 *
 * @returns {Observable} An Observable that completes when the CSV file has been written.
 */
function writeMultiProjectIssues$(jiraUrl, username, password, projectIds, customFieldNames, outdir) {
    const issues$ = fetchMultiProjectIssues$(jiraUrl, username, password, projectIds, customFieldNames);
    const prefix = projectIds.join('-');
    return writeCustomIssuesToCsv$(issues$, outdir, prefix + '-');
}
exports.writeMultiProjectIssues$ = writeMultiProjectIssues$;
//********************************************************************************************************************** */
//****************************   Internal                           **************************************************** */
//********************************************************************************************************************** */
class FetchProjectIssuesOptions {
    constructor() {
        this.startAt = 0;
        this.maxResults = 1000;
    }
}
function writeCustomIssuesToCsv$(customIssues$, outdir, filePrefix = '') {
    const filePath = `${outdir}/${filePrefix}jira-issues.csv`;
    return (0, observable_fs_1.deleteFileObs)(filePath).pipe((0, rxjs_1.catchError)((err) => {
        if (err.code === 'ENOENT') {
            // complete so that the next operation can continue
            return (0, rxjs_1.of)(null);
        }
        throw new Error(err);
    }), (0, rxjs_1.concatMap)(() => customIssues$), (0, csv_tools_1.toCsvObs)(), (0, rxjs_1.concatMap)(csv => {
        return (0, observable_fs_1.appendFileObs)(filePath, csv + '\n');
    }), (0, rxjs_1.ignoreElements)(), (0, rxjs_1.defaultIfEmpty)(filePath));
}
//# sourceMappingURL=issues.js.map