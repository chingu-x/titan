# Titan
![Static Badge](https://img.shields.io/badge/14.14.1-purple?style=for-the-badge&logo=discord&logoColor=white&label=discord.js&labelColor=%235865f2&color=%232c2f33)![Static Badge](https://img.shields.io/badge/1.0.0-white?style=for-the-badge&label=Titan&labelColor=%23000)

Titan is named after one of Saturns moons, Titan, which also looks green and therfore fit with the Chingu theme.
#### Titan is a discord bot made for Chingu
___
### Titans Functions
* Ticket system
* Temporary private voice channels
* User information both for users and admins
* Purge channels
* Broadcast function
* Standup function

### Admin Commands
* /purgechannels `<category ID>`
  * Removes all channels in the given category ID
* /userCheck `<user ID>`
  * Takes the DiscordID and checks if the users discord name matches with the one in the application table. Takes the DiscordID and checks if the user has passed any Solo Projects. If there are no projects with the value Passed, it returns the last one. Takes the DiscordID and checks if the email and discord name in the voyage signup table matches with the application. Since this shows the users email, it's only usable in certain admin channels.
* /broadcast `<category ID> <header (optional)>`
  * Sends a message to all channels in the given category. If the channel is a forum channel, it looks for the `Welcome to your team channel` thread, and send the message there. And also use the optional `<header>` to for example ping members or role  
* /greeting
  * Posts a morning greeting to all Chingu's into the channel the command is issued from

### User Commands
* /user
  * Takes the DiscordID and checks if the users discord name matches with the one in the application table. Takes the DiscordID and checks if the user has passed any Solo Projects. If there are no projects with the value Passed, it returns the last one. Takes the DiscordID and checks if the email and discord name in the voyage signup table matches with the application. This reply is only viewable by the user. Lets the user know if their email and Discord account match with what's currently recorded on their profile in the database
___
### Ticket System
To open a ticket, the user can either click a button in a ticket channel, or send it DM. Titan then opens a thread inside a channel of your choosing with the name of the user as well as their ID. Titan then lets the user know that they've opened a ticket.

The moderation team can disccuss the ticket inside the thread, and nothing will be sent to the user. To reply to the user simply use `.reply <your-message>`. Titan will then send your message to the user in a DM, and the user can just continue to respond to Titan in order to update the ticket. A mail reaction icon on the message you tried to send, will signal that the message was actually sent to the user. 

To close the ticket you can use `.close` This will change the name of the thread to `Closed - <user.name> <user.id>`. This also notifies the user that the ticket has been closed.

### Temporary private voice channels
Temporary private voice channels are created by the user inside a dedicated text channel. The text channel has a select menu (dropdown menu) for each category. The user selects their team text channel from the select menu, and the bot copies all permissions from the team channel that the user chose, and applies them to the new voice channel. The voice channel will appear just below the text channel it was created from, in the same category. The private voice channel will be removed if nobody uses it for 1min

### Standup
* `/standup`
  * Shows a modal to the user with 3 textboxes, `Yesterday`, `Today` and ``Blockers`. It then posts the standup in the channel for the team to review.

### Voyage Duplicates
* `/voyageduplicates`
  * Checks if there are any duplicate signups for the next voyage
#### How to run
1. `npm install` to install dependencies 
2. Set up environment variables:
    * Create an `.env` file in the root directory of your project.
    * Add the following environment variables to `.env` file:<br>
    Token and Client ID can be found in the [Discord Developer Portal](https://discord.com/developers/)<br>
    `DISCORD_TOKEN = <your-discord-token>`<br>
    `CLIENT_ID = <your-client-id>`<br>
    `GUILD_ID = <your-server-id>`<br>
    `OPEN_TICKET_CHANNEL_ID = <channel-to-open-ticket>`<br>
    `PROCESS_TICKET_CHANNEL_ID = <channel-to-open-threads>`<br>
    `TEMP_VOICE_ID = <channel-to-open-voice-channels>`<br>
    `AIRTABLE_BASE_ID = <your-airtable-base-id>`<br>
    `AIRTABLE_API_KEY = <your-airtable-api-key>`<br>
    `CATEGORY_TIER_1_ID = <voice-channel-category-1>`<br>
    `CATEGORY_TIER_2_ID = <voice-channel-category-2>`<br>
    `CATEGORY_TIER_3_ID = <voice-channel-category-3>`<br>
    `ADMIN_ROLE_ID = <admin-role-id>`<br>
3. `node index.js` to run the bot
4. When new commands are added, run `node deploy-commands.js.` This will update the server with the new changes. Only needed regarding commands. As of right now, this bot has no commands, so it's not neccessary to use. 
#### Dev server
1. `npm run dev` to start development server

#### Dependencies
* airtable - ^0.12.2
* discord.js - 14.14.1
* dotenv - 16.3.1

#### Dev Dependencies
* nodemon - ^3.1.4

### Development
#### Branch naming
* lowercase and hyphen inplace of space. For example `feature/discord-bot`
* Only alphanumeric characters, dont use period, space, underscores etc. and dont use multiple hyphens after another, or trailing hyphens.

1. `feature/` for all features.
2. `bugfix/` for all bugfixes.
3. `hotfix/` for all quick emergency fixes.
4. `docs/` for udates to documentation.
5. `refactor/` for refactoring.

#### Commit messages
* all commit messages should be short (50 characters or less), but descriptive. Example `feat: add admin dashboard ` The description should also be what the commit does, not what you did. Notice the example above said `add` not `added`
* We use the following prefixes:
  * `feat:` for features
  * `fix:` for bugfixes and hotfixes
  * `docs:` for ducumentaion
  * `refactor:` for refactoring
___
## Todo
* Refactor, refactor, refactor
* Add more functionality:
  * Improve server.js
  * Improve user.js
    * Maybe add airtable stats
  * Reward system
    * Users can give eachother reactions as a reward for helping
  * Message scheduling system
    * Schedule weekly messages
  * Probably more....
  * Maybe a web-interface