

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
    customFields: { [name: string]: CustomField };
}

export function newIssueCompact(jiraIssue: any, customFieldNames: { [customfield: string]: string }) {
    const customFields = Object.entries(customFieldNames)
        .reduce((acc, [customfield_name, real_name]) => {
            const field = jiraIssue.fields[customfield_name]
            const customFieldValue = field ? {
                id: field.id,
                name: customfield_name,
                value: Array.isArray(field) ? field.map(f => f.value).join(' - ') : field.value
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
        labels: jiraIssue.fields.labels ?? [],
        customFields
    }
    return issue
}

export function toCustomJiraIssue(jiraIssue: IssueCompactWithCustomFields, costumFieldNames: { [customfield: string]: string }) {
    const issue: any = {
        id: jiraIssue.id,
        key: jiraIssue.key,
        // remove description from csv since it is too long and has newlines chars and commas
        description: '',
        status: jiraIssue.status,
        assignee: jiraIssue.assignee,
        issuetype: jiraIssue.issuetype,
        project: jiraIssue.project,
        created: jiraIssue.created,
        updated: jiraIssue.updated,
        creator: jiraIssue.creator,
        reporter: jiraIssue.reporter,
        priority: jiraIssue.priority,
        labels: jiraIssue.labels,
        // customFields
        layer: jiraIssue.customFields.layer.value,
        subsidiaries: jiraIssue.customFields.subsidiaries.value,
        convergence: jiraIssue.customFields.convergence.value,
        phase: jiraIssue.customFields.phase.value,
        wave: jiraIssue.customFields.wave.value,
        line_of_business: jiraIssue.customFields.line_of_business.value,
    }
    // retrieve each custom field value from the customFields object
    Object.entries(costumFieldNames).forEach(([_, realFieldName]) => {
        issue[realFieldName] = jiraIssue.customFields[realFieldName].value
    })
    return issue
}

export interface CustomField {
    id: string;
    name: string;
    value: string;
}