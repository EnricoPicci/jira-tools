export interface IssueCompact {
    id: number;
    key: string;
    description: string;
    status: string;
    assignee: string;
    issuetype: string;
    project: string;
    created: string;
    updated: string;
    creator: string;
    reporter: string;
    priority: string;
    labels: string[];
}
export interface IssueCompactWithCustomFields extends IssueCompact {
    customFields: {
        [name: string]: CustomField;
    };
}
export declare function newIssueCompact(jiraIssue: any, customFieldNames: {
    [customfield: string]: string;
}): IssueCompactWithCustomFields;
export declare function toCustomJiraIssue(jiraIssue: IssueCompactWithCustomFields, costumFieldNames: {
    [customfield: string]: string;
}): any;
export interface CustomField {
    id: string;
    name: string;
    value: string;
}
