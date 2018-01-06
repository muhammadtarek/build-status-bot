# changelog-bot

Small node.js script to send last version changelog to a slack channel

## Getting Started

### Prerequisites

* node

### Installing

```bash
git clone https://github.com/muhammadtarek/changelog-bot.git
cd changelog-bot
yarn
```

Set OAuth token

```bash
export SLACK_OAUTH_ACCESS_TOKEN=xoxp-XXXXXXXXXX
```

### Usage

```bash
node index.js <repository-name> <changelog file path> <channel name> <slack OAuth token [optional]>
```

## Built With

* [@slack/client](https://github.com/slackapi/node-slack-sdk/)
* [chalk](https://github.com/chalk/chalk/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
