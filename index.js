const chalk = require('chalk');
const { WebClient } = require('@slack/client');
const commandLineArgs = require('command-line-args'); // Command args tokenizer
const markdownParser = require('./MarkdownParser');

const optionDefinitions = [
  {
    name: 'package-name',
    alias: 'n',
    type: String,
    defaultOption: true,
  },
  {
    name: 'message',
    alias: 'm',
    type: String,
    defaultValue: undefined,
  },
  {
    name: 'server',
    alias: 's',
    type: String,
    defaultValue: undefined,
  },
  {
    name: 'build',
    alias: 'b',
    type: String,
    defaultValue: undefined,
  },
  {
    name: 'path',
    alias: 'p',
    type: String,
    defaultValue: 'CHANGELOG.md',
  },
  {
    name: 'channel',
    alias: 'c',
    type: String,
  },
  {
    name: 'auth',
    alias: 'a',
    type: String,
  },
  {
    name: 'repo-url',
    alias: 'u',
    type: String,
    defaultValue: undefined,
  },
  {
    name: 'pull-request',
    alias: 'r',
    type: String,
    defaultValue: undefined,
  },
  {
    name: 'source-branch',
    alias: 'g',
    type: String,
    defaultValue: undefined,
  },
  {
    name: 'requested-for',
    alias: 'f',
    type: String,
    defaultValue: 'VSTS CI',
  },
];

const userOptions = commandLineArgs(optionDefinitions); // User options
const packageName = userOptions['package-name'] || process.env.REPO;
const message = userOptions.message;
const server = userOptions.server;
const buildId = userOptions.build || process.env.BUILD;
const packageChangelogPath = userOptions.path;
const channelName = userOptions.channel || process.env.CHANNEL;
const slackOAuth = userOptions.auth;
const repoUrl = userOptions['repo-url'] || process.env.REPO_URL;
const pullRequest = userOptions['pr-number'] || process.env.PULL_REQUEST;
const sourceBranch = userOptions['source-branch'] || process.env.SOURCE_BRANCH;
const requestedFor = userOptions['requested-for'];
const versionChangelog = markdownParser.getLastVersion(packageChangelogPath);
const bulletPoints = versionChangelog.versionPoints.map(point => `• ${point}`);
const styledPoints = `${bulletPoints.join('\n')}`;
const attachments = {
  attachments: [
    {
      color: 'good',
      mrkdwn_in: ['text', 'fields'],
      fields: [
        {
          title: 'Repository',
          value: `\`<${repoUrl}|${packageName}>\``,
          short: true,
        },
        {
          title: 'Version',
          value: `\`<${repoUrl}?version=GTv${versionChangelog.version}|${versionChangelog.version}>\``,
          short: true,
        },
        {
          title: 'Pull Request',
          value: `<${repoUrl}/pullrequest/${pullRequest}|${pullRequest}>`,
          short: true,
        },
        {
          title: 'Source Branch',
          value: `<${repoUrl}/?version=GB${sourceBranch}|${sourceBranch}>`,
          short: true,
        },
        {
          title: 'Server',
          value: `\`${server}\``,
          short: true,
        },
        {
          title: 'VSTS Build Definition',
          value: `\`${buildId}\``,
          short: true,
        },
        {
          title: 'Changelog',
          value: styledPoints,
        },
      ],
      footer: `Request by: ${requestedFor}`,
    },
  ],
};

// Removing fields with undefined value or with empty strings
const fieldsWithValue = attachments.attachments[0].fields
  .filter(field => field.value.indexOf('undefined') === -1)
  .filter(field => field.value !== '');
attachments.attachments[0].fields = fieldsWithValue;

// Getting access token from slack.com
const token = process.env.SLACK_OAUTH_ACCESS_TOKEN || slackOAuth;
const client = new WebClient(token);
const channel = `#${channelName}`;

// See: https://api.slack.com/methods/chat.postMessage
client.chat
  .postMessage(channel, message, attachments)
  .then(() => {
    console.log(chalk.green('Message posted successfully'));
  })
  .catch(err => console.log(chalk.red(err)));
