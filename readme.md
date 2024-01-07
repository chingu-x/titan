# Titan
Titan is named after one of Saturns moons, Titan, which also looks green and therfore fit in with the Chingu theme.
#### Titan is a discord bot that currently only has a ticket function
___
#### How it functions
Titan is simple. To open a ticket, the user can either click a button in a ticket channel, or send it DM. Titan then opens a thread inside a channel of your choosing with the name of the user as well as their ID. Titan then lets the user know that they've opened a ticket.

The moderation team can disccuss the ticket inside the thread, and nothing will be sent to the user. To reply to the user simply use `.reply <your-message>`. Titan will then send your message to the user in a DM, and the user can just continue to respond to Titan in order to update the ticket.

To close the ticket you can use `.close.` This will change the name of the thread to `Closed - <user.name> <user.id>`. This also notifies the user that the ticket has been closed.

#### Commands - (They're not really commands)
* `.reply <your-message>` - Sends your message to the user. The user is also shown who sent the message.
* `.close` - closes the thread, sends a message to the user that the ticket has been closed. Changes the name of the thread to `Closed - <user.name> <user.id>` to indicate that the mater has been taken care of.
#### How to run
* `npm install` to install the dependencies 
* You also need to set your bot token in a `.env` file, and pass it in through the `token` variable

* When commands are updated or new commands are added, run `node deploy-commands.js`. This will update the server with the new changes. Only needed regarding commands.

#### Dependencies
* discord.js version 14.14.1
* dotenv

#### .env
Your .env should contain the following:
* `DISCORD_TOKEN = <your-discord-token>`
* `CLIENT_ID = <your-client-id>`
* `GUILD_ID = <your-server-id>`

Both can be found in the [Discord Developer Portal](https://discord.com/developers/)

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