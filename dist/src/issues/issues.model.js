"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCustomJiraIssue = exports.newIssueCompact = void 0;
const remark_1 = require("remark");
const strip_markdown_1 = __importDefault(require("strip-markdown"));
function newIssueCompact(jiraIssue, customFieldNames) {
    var _a, _b;
    const customFields = Object.entries(customFieldNames)
        .reduce((acc, [customfield_name, real_name]) => {
        const field = jiraIssue.fields[customfield_name];
        const customFieldValue = field ? {
            id: field.id,
            name: customfield_name,
            value: Array.isArray(field) ? field.map(f => f.value).join(' - ') : field.value
        } : {
            id: '',
            name: customfield_name,
            value: ''
        };
        acc[real_name] = customFieldValue;
        return acc;
    }, {});
    const issue = {
        id: jiraIssue.id,
        key: jiraIssue.key,
        description: (_a = jiraIssue.fields.description) !== null && _a !== void 0 ? _a : '-',
        status: jiraIssue.fields.status ? jiraIssue.fields.status.name : '-',
        assignee: jiraIssue.fields.assignee ? jiraIssue.fields.assignee.name : '-',
        issuetype: jiraIssue.fields.issuetype ? jiraIssue.fields.issuetype.name : '-',
        project: jiraIssue.fields.project ? jiraIssue.fields.project.name : '-',
        created: jiraIssue.fields.created,
        updated: jiraIssue.fields.updated,
        creator: jiraIssue.fields.creator ? jiraIssue.fields.creator.name : '-',
        reporter: jiraIssue.fields.reporter ? jiraIssue.fields.reporter.name : '-',
        priority: jiraIssue.fields.priority ? jiraIssue.fields.priority.name : '-',
        labels: (_b = jiraIssue.fields.labels) !== null && _b !== void 0 ? _b : [],
        customFields
    };
    return issue;
}
exports.newIssueCompact = newIssueCompact;
function toCustomJiraIssue(jiraIssue, costumFieldNames, removeDescription = true) {
    const issue = {
        id: jiraIssue.id,
        key: jiraIssue.key,
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
    };
    // maybe remove description since it is too long and has newlines chars and commas
    if (!removeDescription) {
        // const strippedDesc = remark().use(require('strip-markdown')).processSync(jiraIssue.description)
        const strippedDesc = (0, remark_1.remark)().use(strip_markdown_1.default).processSync(jiraIssue.description);
        issue.description = strippedDesc;
    }
    // retrieve each custom field value from the customFields object
    Object.entries(costumFieldNames).forEach(([_, realFieldName]) => {
        issue[realFieldName] = jiraIssue.customFields[realFieldName].value;
    });
    return issue;
}
exports.toCustomJiraIssue = toCustomJiraIssue;
//# sourceMappingURL=issues.model.js.map