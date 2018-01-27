const chalk = require('chalk');
const { WebClient } = require('@slack/client');
const commandLineArgs = require('command-line-args'); // Command args tokenizer
const getUsage = require('command-line-usage'); // Command options help
const markdownParser = require('./MarkdownParser');

const optionDefinitions = [
  {
    name: 'package-name',
    alias: 'n',
    type: String,
    defaultOption: true
  },
  {
    name: 'message',
    alias: 'm',
    type: String,
    defaultValue: undefined
  },
  {
    name: 'server',
    alias: 's',
    type: String,
    defaultValue: undefined
  },
  {
    name: 'path',
    alias: 'p',
    type: String,
    defaultValue: 'CHANGELOG.md'
  },
  {
    name: 'channel',
    alias: 'c',
    type: String
  },
  {
    name: 'auth',
    alias: 'a',
    type: String
  },
  {
    name: 'help',
    alias: 'h',
    type: Boolean,
    lazyMultiple: false,
    multiple: false
  }
];

const userOptions = commandLineArgs(optionDefinitions); // User options
const packageName = userOptions['package-name'];
let message = userOptions['message'];
const server = userOptions['server'];
const packageChangelogPath = userOptions['path'];
const channelName = userOptions['channel'];
const slackOAuth = userOptions['auth'];
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
          value: `\`${packageName}\``,
          short: true
        },
        {
          title: 'Version',
          value: `\`${versionChangelog.version}\``,
          short: true
        },
        {
          title: 'Changelog',
          value: styledPoints
        }
      ]
    }
  ]
};

// Adding server section
if (server) {
  attachments.attachments[0].fields.splice(2, 0, {
    title: 'Server',
    value: `\`${server}\``,
    short: true
  });
}

// Adding :tada: emoji before the message
if (message) {
  message = `:tada: ${message}`;
}

// Getting access token from slack.com
const authUrl = 'https://slack.com/oauth/authorize';
const token = process.env.SLACK_OAUTH_ACCESS_TOKEN || slackOAuth;
const client = new WebClient(token);
const channel = `#${channelName}`;

// See: https://api.slack.com/methods/chat.postMessage
client.chat
  .postMessage(channel, message, attachments)
  .then(res => {
    console.log(chalk.green('Message posted successfully'));
  })
  .catch(console.error);
