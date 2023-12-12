import { Observable } from "rxjs";
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
export declare function fetchProjectIssues$(jiraUrl: string, username: string, password: string, projectId: string, customFieldNames: {
    [customfield: string]: string;
}, options?: FetchProjectIssuesOptions): Observable<any>;
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
export declare function fetchMultiProjectIssues$(jiraUrl: string, username: string, password: string, projectIds: string[], customFieldNames: {
    [customfield: string]: string;
}): Observable<any>;
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
export declare function writeMultiProjectIssues$(jiraUrl: string, username: string, password: string, projectIds: string[], customFieldNames: {
    [customfield: string]: string;
}, outdir: string): Observable<string>;
declare class FetchProjectIssuesOptions {
    startAt: number;
    maxResults: number;
}
export {};
