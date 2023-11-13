import axios from "axios"
import { EMPTY, Observable, catchError, concatMap, defaultIfEmpty, expand, from, ignoreElements, map, of, } from "rxjs"
import { newIssueCompact, toCustomJiraIssue } from "./issues.model"
import { appendFileObs, deleteFileObs } from "observable-fs"
import { toCsvObs } from "@enrico.piccinin/csv-tools"

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
export function fetchProjectIssues$(
    jiraUrl: string,
    username: string,
    password: string,
    projectId: string,
    customFieldNames: { [customfield: string]: string },
    options = new FetchProjectIssuesOptions(),
) {
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
    ]
    const fields = [...basicFields, ...Object.keys(customFieldNames)]

    // define the body to be sent in the POST request
    const postBody = {
        "jql": `project=${projectId}`,
        startAt: options.startAt,
        maxResults: options.maxResults,
        fields
    }

    // postFactory$ is an function, internal to fetchProjectIssues$, that makes a POST request to the Jira REST API's search endpoint
    // passing the postBody and the authentication details. The response from this request is an Observable that is transformed to
    // extract the issues and some metadata from the response.
    // In particular the data notified contain the updated value of startAt, so that the next request will start from the correct point.
    const postFactory$ = (postBody: any) => {
        return from(axios.post(`https://${jiraUrl}/rest/api/2/search`, postBody, {
            auth: { username, password },
            headers: {
                "Content-Type": "application/json",
            }
        })).pipe(
            map(resp => {
                const issuesPaged = resp.data.issues
                const startAt = resp.data.startAt + issuesPaged.length
                const total = resp.data.total
                console.log(`>>>>> read ${startAt} of ${total} total issues for project ${projectId}`)
                return { issuesPaged, startAt, total }
            }),
        )
    }

    // call postFactory$ with the initial postBody, and use the expand operator to recursively fetch all pages of issues
    return postFactory$(postBody).pipe(
        // use expand to recursively fetch all pages of issues until the startAt is greater than or equal to the total number of issues
        expand(({ startAt, total }) => {
            if (startAt >= total) {
                console.log(`>>>>> Reading of issues completed for project ${projectId}`)
                return EMPTY
            }
            const _postBody = { ...postBody }
            _postBody.startAt = startAt

            // recursivly call postFactory$ to fetch the next page of issues
            return postFactory$(_postBody)
        }),
        catchError((err) => {
            if (err.response && err.response.status === 400) {
                const errorMessages = err.response?.data?.errorMessages
                const msg = errorMessages ? errorMessages.join('\n') : 'Status 400 received from Jira server for project ${projectId}'
                console.warn(msg)
                return EMPTY
            }
            throw err
        }),
        concatMap(({ issuesPaged }) => {
            return issuesPaged
        }),
        map((issue) => {
            return newIssueCompact(issue, customFieldNames)
        }),
        map(jiraIssue => toCustomJiraIssue(jiraIssue, customFieldNames)),
    )
}

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
export function fetchMultiProjectIssues$(
    jiraUrl: string,
    username: string,
    password: string,
    projectIds: string[],
    customFieldNames: { [customfield: string]: string }
) {
    return from(projectIds).pipe(
        concatMap(projectId => fetchProjectIssues$(jiraUrl, username, password, projectId, customFieldNames)),
    )
}

export function writeMultiProjectIssues$(
    jiraUrl: string,
    username: string,
    password: string,
    projectIds: string[],
    customFieldNames: { [customfield: string]: string },
    outdir: string,
) {
    const issues$ = fetchMultiProjectIssues$(jiraUrl, username, password, projectIds, customFieldNames)
    const prefix = projectIds.join('-')
    return writeCustomIssuesToCsv$(issues$, outdir, prefix + '-')
}

//********************************************************************************************************************** */
//****************************   Internal                           **************************************************** */
//********************************************************************************************************************** */


class FetchProjectIssuesOptions {
    startAt = 0
    maxResults = 1000
}

function writeCustomIssuesToCsv$(customIssues$: Observable<any>, outdir: string, filePrefix = '') {
    const filePath = `${outdir}/${filePrefix}jira-issues.csv`
    return deleteFileObs(filePath).pipe(
        catchError((err) => {
            if (err.code === 'ENOENT') {
                // complete so that the next operation can continue
                return of(null);
            }
            throw new Error(err);
        }),
        concatMap(() => customIssues$),
        toCsvObs(),
        concatMap(csv => {
            return appendFileObs(filePath, csv + '\n')
        }),
        ignoreElements(),
        defaultIfEmpty(filePath),
    )
}