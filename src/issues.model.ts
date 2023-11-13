

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
}
export interface IssueCompactWithCustomFields extends IssueCompact {
    customFields: { [name: string]: CustomField };
}

export function newIssueCompact(jiraIssue: any, customFieldNames: { [customfield: string]: string }) {
    // _customrFields is an object whose keys are the customfield names and whose values are the customfield values
    // example:
    // if we have customfield_21500 = 'layer' and customfield_21500 = 'subsidiaries' then the _customFields will be:
    // {
    //     layer: 'layer value',
    //     subsidiaries: 'subsidiaries value'
    // }
    const customFields = Object.entries(customFieldNames)
        .reduce((acc, [customfield_name, real_name]) => {
            const field = jiraIssue.fields[customfield_name]
            const customFieldValue = field ? {
                id: field.id,
                name: customfield_name,
                value: field.value
            } : {
                id: '',
                name: customfield_name,
                value: ''
            }
            acc[real_name] = customFieldValue
            return acc
        }, {} as { [name: string]: CustomField })

    const issue: IssueCompactWithCustomFields = {
        id: jiraIssue.id,
        key: jiraIssue.key,
        description: jiraIssue.fields.description ?? '-',
        status: jiraIssue.fields.status ? jiraIssue.fields.status.name : '-',
        assignee: jiraIssue.fields.assignee ? jiraIssue.fields.assignee.name : '-',
        issuetype: jiraIssue.fields.issuetype ? jiraIssue.fields.issuetype.name : '-',
        project: jiraIssue.fields.project ? jiraIssue.fields.project.name : '-',
        created: jiraIssue.fields.created,
        updated: jiraIssue.fields.updated,
        creator: jiraIssue.fields.creator ? jiraIssue.fields.creator.name : '-',
        reporter: jiraIssue.fields.reporter ? jiraIssue.fields.reporter.name : '-',
        priority: jiraIssue.fields.priority ? jiraIssue.fields.priority.name : '-',
        customFields
    }
    return issue
}

export interface CustomField {
    id: string;
    name: string;
    value: string;
}