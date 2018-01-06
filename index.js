const chalk = require('chalk');
const { WebClient } = require('@slack/client');
const markdownParser = require('./MarkdownParser');

const args = process.argv.slice(2);
let packageName;
let packageChangelogPath;
let channelName;
let slackOAuth;
let versionChangelog;
let counter = 0;

if (args.length < 3) {
  console.log(chalk.red('You should enter package name and changelog file path'));
  return;
}

// Assigning package name and changelog.md path
args.forEach(arg => {
  if (counter === 0) {
    packageName = arg;
  } else if (counter === 1) {
    packageChangelogPath = arg;
  } else if (counter === 2) {
    channelName = arg;
  } else {
    slackOAuth = arg;
  }
  counter++;
});

// Getting last version changelog
versionChangelog = markdownParser.getLastVersion(packageChangelogPath);
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

// Getting access token from slack.com
const authUrl = 'https://slack.com/oauth/authorize';
const token = process.env.SLACK_OAUTH_ACCESS_TOKEN || slackOAuth;
const client = new WebClient(token);
const channel = `#${channelName}`;

// See: https://api.slack.com/methods/chat.postMessage
client.chat
  .postMessage(channel, null, attachments)
  .then(res => {
    // `res` contains information about the posted message
  })
  .catch(console.error);
