import axios from "axios"
import { EMPTY, concatMap, expand, from, map, } from "rxjs"
import { newIssueCompact } from "./issues.model"


export function fetchProjectIssues$(
    jiraUrl: string,
    username: string,
    password: string,
    projectId: string,
    customFieldNames: { [customfield: string]: string },
    options = new FetchProjectIssuesOptions(),
) {
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

    const postBody = {
        "jql": `project=${projectId}`,
        startAt: options.startAt,
        maxResults: options.maxResults,
        fields
    }

    const postFactory$ = (postBody: any, numIssuesRead = 0) => {
        return from(axios.post(`https://${jiraUrl}/rest/api/2/search`, postBody, {
            auth: { username, password },
            headers: {
                "Content-Type": "application/json",
            }
        })).pipe(
            map(resp => {
                const issuesPaged = resp.data.issues
                numIssuesRead += resp.data.issues.length
                const total = resp.data.total
                console.log(`>>>>> read ${numIssuesRead} of ${total} total issues`)
                const startAt = resp.data.startAt + resp.data.maxResults
                return { issuesPaged, startAt, total, numIssuesRead }
            }),
        )
    }

    return postFactory$(postBody).pipe(
        expand(({ startAt, total, numIssuesRead }) => {
            if (startAt >= total) {
                console.log(`>>>>> Reading of issues completed`)
                return EMPTY
            }
            const _postBody = { ...postBody }
            _postBody.startAt = startAt

            return postFactory$(_postBody, numIssuesRead)
        }),
        concatMap(({ issuesPaged }) => {
            return issuesPaged
        }),
        map((issue) => {
            return newIssueCompact(issue, customFieldNames)
        }),
    )
}

class FetchProjectIssuesOptions {
    startAt = 0
    maxResults = 1000
}