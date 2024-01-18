# Titan
![Static Badge](https://img.shields.io/badge/14.14.1-purple?style=for-the-badge&logo=discord&logoColor=white&label=discord.js&labelColor=%235865f2&color=%232c2f33)![Static Badge](https://img.shields.io/badge/1.0.0-white?style=for-the-badge&label=Titan&labelColor=%23000)

Titan is named after one of Saturns moons, Titan, which also looks green and therfore fit with the Chingu theme.
#### Titan is a discord bot made for Chingu
___
### Titans Functions
* Ticket system
* Temporary private voice channels
* User information both for users and admins
* Remove all channels in a given category

### Admin Commands
* /purgechannels `<category ID>`
  * Removes all channels in the given category ID
* /userCheck `<user ID>`
  * Takes the DiscordID and checks if the users discord name matches with the one in the application table. Takes the DiscordID and checks if the user has passed any Solo Projects. If there are no projects with the value Passed, it returns the last one. Takes the DiscordID and checks if the email and discord name in the voyage signup table matches with the application. Since this shows the users email, it's only usable in certain admin channels.

### User Commands
* /user
  * Takes the DiscordID and checks if the users discord name matches with the one in the application table. Takes the DiscordID and checks if the user has passed any Solo Projects. If there are no projects with the value Passed, it returns the last one. Takes the DiscordID and checks if the email and discord name in the voyage signup table matches with the application. This reply is only viewable by the user.
___
### Ticket System
To open a ticket, the user can either click a button in a ticket channel, or send it DM. Titan then opens a thread inside a channel of your choosing with the name of the user as well as their ID. Titan then lets the user know that they've opened a ticket.

The moderation team can disccuss the ticket inside the thread, and nothing will be sent to the user. To reply to the user simply use `.reply <your-message>`. Titan will then send your message to the user in a DM, and the user can just continue to respond to Titan in order to update the ticket.

To close the ticket you can use `.close.` This will change the name of the thread to `Closed - <user.name> <user.id>`. This also notifies the user that the ticket has been closed.

#### Commands - (They're not really commands)
* `.reply <your-message>` - Sends your message to the user. The user is also shown who sent the message.
* `.close` - closes the thread, sends a message to the user that the ticket has been closed. Changes the name of the thread to `Closed - <user.name> <user.id>` to indicate that the mater has been taken care of.

### Temporary private voice channels
Temporary private voice channels are created by the user inside a dedicated text channel. The text channel has a select menu (dropdown menu) for each category. The user selects their team text channel from the select menu, and the bot copies all permissions from the team channel that the user chose, and applies them to the new voice channel. The voice channel will appear just below the text channel it was created from, in the same category.

### User Information
Lets the user know if their email and Discord account match with what's currently recorded on their profile in the database

#### How to run
* `npm install` to install the dependencies 
* You also need to set your bot token in a `.env` file, and pass it in through the `token` variable

* When new commands are added, run `node deploy-commands.js`. This will update the server with the new changes. Only needed regarding commands.

#### Dependencies
* discord.js - 14.14.1
* dotenv - 16.3.1

#### .env
Your .env should contain the following:
* `DISCORD_TOKEN = <your-discord-token>`
* `CLIENT_ID = <your-client-id>`
* `GUILD_ID = <your-server-id>`
* `OPEN_TICKET_CHANNEL_ID = <channel-to-open-ticket>`
* `PROCESS_TICKET_CHANNEL_ID = <channel-to-open-threads>`
* `TEMP_VOICE_ID = <channel-to-open-voice-channels>`
* `CATEGORY_TIER_1_ID = <voice-channel-category-1>`
* `CATEGORY_TIER_2_ID = <voice-channel-category-2>`
* `CATEGORY_TIER_3_ID = <voice-channel-category-3>`
* `ADMIN_ROLE_ID = <admin-role-id>`
* `AIRTABLE_API_KEY = <airtable-api-key>`
* `AIRTABLE_BASE = <airtable-base-id>`

Token and Client ID can be found in the [Discord Developer Portal](https://discord.com/developers/)

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