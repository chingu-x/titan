# Titan
![Static Badge](https://img.shields.io/badge/14.14.1-purple?style=for-the-badge&logo=discord&logoColor=white&label=discord.js&labelColor=%235865f2&color=%232c2f33)![Static Badge](https://img.shields.io/badge/1.0.0-white?style=for-the-badge&label=Titan&labelColor=%23000)

Titan is named after one of Saturn's moons, Titan, which also looks green and therefore fit with the Chingu theme.

## Titan is a discord bot made for Chingu

___

### Titan Functions

* Ticket system
* Temporary private voice channels
* User information both for users and admins
* Purge channels
* Broadcast function
* Standup function

### Admin Commands

* /purgechannels `<category ID>`
  * Removes all channels in the given category ID
* /checkuser `<user ID>`
  * Takes the DiscordID and checks if the users discord name matches with the one in the application table. Takes the DiscordID and checks if the user has passed any Solo Projects. If there are no projects with the value Passed, it returns the last one. Takes the DiscordID and checks if the email and discord name in the voyage sign up table matches with the application. Since this shows the users email, it's only usable in certain admin channels.
* /broadcast `<category ID> <header (optional)>`
  * Sends a message to all channels in the given category. If the channel is a forum channel, it looks for the `Welcome to your team channel` thread, and send the message there. And also use the optional `<header>` to for example ping members or role  

### User Commands

* /user
  * Displays comprehensive user information (ephemeral - only visible to the user):
    * Verifies Discord account matches application data
    * Shows Solo Project evaluation status and tier
    * Displays current and next voyage participation status
    * Shows team information (name, number, role)
    * Displays selected time blocks (primary and alternate availability)
    * Shows availability in both UTC and local timezone
    * Validates email and Discord name consistency across systems

___

### Ticket System

To open a ticket, the user can either click a button in a ticket channel, or send it DM. Titan then opens a thread inside a channel of your choosing with the name of the user as well as their ID. Titan then lets the user know that they've opened a ticket.

The moderation team can discuss the ticket inside the thread, and nothing will be sent to the user. To reply to the user simply use `.reply <your-message>`. Titan will then send your message to the user in a DM, and the user can just continue to respond to Titan in order to update the ticket. A mail reaction icon on the message you tried to send, will signal that the message was actually sent to the user. 

To close the ticket you can use `.close` This will change the name of the thread to `Closed - <user.name> <user.id>`. This also notifies the user that the ticket has been closed.

### Temporary private voice channels

Temporary private voice channels are created by the user inside a dedicated text channel. The text channel has a select menu (dropdown menu) for each category. The user selects their team text channel from the select menu, and the bot copies all permissions from the team channel that the user chose, and applies them to the new voice channel. The voice channel will appear just below the text channel it was created from, in the same category. The private voice channel will be removed if nobody uses it for 1min

### Standup

* `/standup`
  * Shows a modal to the user with 3 text boxes, `Yesterday`, `Today` and ``Blockers`. It then posts the standup in the channel for the team to review.

### Voyage Duplicates

* `/voyageduplicates`
  * Checks if there are any duplicate sign ups for the next voyage

## How to run

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
    `AIRTABLE_BASE = <your-airtable-base-id>`<br>
    `AIRTABLE_API_KEY = <your-airtable-api-key>`<br>
    `CATEGORY_TIER_1_ID = <voice-channel-category-1>`<br>
    `CATEGORY_TIER_2_ID = <voice-channel-category-2>`<br>
    `CATEGORY_TIER_3_ID = <voice-channel-category-3>`<br>
    `ADMIN_ROLE_ID = <admin-role-id>`<br>
    `VOYAGE_CONFIRMATION_FORM=https://forms.gle/p5bhpoKFVBatQhnCA`
    `VOYAGE_SIGNUP_FORM=https://forms.gle/w2kAUmNcz8shPAXS9`
3. `node index.js` to run the bot
4. When new commands are added, run `node deploy-commands.js.` This will update the server with the new changes. Only needed regarding commands. As of right now, this bot has no commands, so it's not necessary to use. 

### Dev server

1. `npm run dev` to start development server

### Testing

Tests use [Vitest](https://vitest.dev/) and live in the `__tests__/` directory, which mirrors the source layout. Settings are in `vitest.config.mjs`: Vitest's globals (`describe`, `test`, `expect`, `vi`) are enabled, so test files don't import them, and fake `AIRTABLE_API_KEY` / `AIRTABLE_BASE` values are provided so no `.env` file is needed.

Discord and Airtable are never contacted. Each test file mocks the layer below the code it tests:

* **Commands** (`__tests__/commands/`) pass a fake Discord interaction (`__tests__/helpers/mockInteraction.js`) and replace `MemberContext.create` with a mock, so only the command's own logic is tested.
* **`MemberContext`** (`__tests__/MemberContext.test.js`) auto-mocks `utils/functions.js` and every module in `services/`, then either builds a context with known state or runs `MemberContext.create` against mocked service results.
* **Voyage utilities** (`__tests__/utils/functions.test.js`) mock `handlers/airtable.js` so `base('Schedules')` returns fake schedule records, and use Vitest fake timers to pin the current date.

| Command | What it does |
| --- | --- |
| `npm test` | Run the whole suite once |
| `npx vitest` | Re-run tests as files change |
| `npx vitest run __tests__/utils/functions.test.js` | Run a single test file |

#### `/checkuser` - `__tests__/commands/checkUser.test.js`

| Test | Objective |
| --- | --- |
| replies with error when Discord ID format is invalid | Confirm an invalid Discord ID gets a "not a valid Discord ID" reply and no lookup happens |
| replies with error when user lacks Administrator permission | Confirm non-admins get a permission error and no user data is fetched |
| calls MemberContext.create with the target discordId when user is admin | Confirm the lookup uses the ID typed in, not the ID of the admin running the command |
| replies with the embed when user is admin | Confirm a successful lookup replies with the user info embed |
| replies with error message when MemberContext.create throws and not deferred | Confirm a failed lookup gives the admin a generic error reply |
| uses editReply when interaction is deferred on error | Confirm the error is sent by editing the reply when the interaction was deferred |

#### `/user` - `__tests__/commands/user.test.js`

| Test | Objective |
| --- | --- |
| calls MemberContext.create with the interaction and user id | Confirm users can only look up their own information |
| replies with the embed from MemberContext | Confirm a successful lookup replies with the user info embed |
| replies with error message when MemberContext.create throws and not deferred | Confirm a failed lookup gives the user a generic error reply |
| uses editReply when interaction is deferred on error | Confirm the error is sent by editing the reply when the interaction was deferred |

#### `MemberContext` - `__tests__/MemberContext.test.js`

Several test names end with a numbered test case (for example "Test case 4"). These are numbered member scenarios, from "no application" (Test case 1) through "team assigned" (Test case 16).

##### Embed contents

| Test | Objective |
| --- | --- |
| returns red embed when user is null | Confirm an unknown Discord ID gets the "no user found" embed |
| returns red embed with no-applications message when applicationData is null | Confirm a member with no application is pointed to the application form |
| embed has no fields when applicationData is null | Confirm no voyage details are shown without an application |
| shows GitHub ID / Evaluation Status / Solo Project Tier as N/A when there is no data | Confirm missing solo project and evaluation data shows N/A (3 tests) |
| shows "Not participating" for current voyage when no signup | Confirm a member not in the current voyage is shown as not participating |
| shows Commitment Form as N/A when no next voyage signup | Confirm the commitment form status is N/A without a next voyage signup |
| shows Voyage Email Match as N/A when no signups | Confirm email matching is N/A when there are no voyage signups |
| shows :x: emoji for Waiting Evaluation / Requested Changes status | Confirm unfinished evaluations show :x: (2 tests) |
| shows check emoji for Passed status | Confirm a passed evaluation shows the check emoji |
| shows check emoji / :x: link for the commitment form (Test cases 4–7) | Confirm the commitment form status and signup link display correctly (3 tests) |
| shows the Primary and Alternate Time Blocks (Test cases 11–14) | Confirm each combination of time blocks shows a value or N/A (7 tests) |
| shows "No Team" / the team number (Test cases 15–16) | Confirm the team is displayed before and after assignment (2 tests) |

##### Loading member data

| Test | Objective |
| --- | --- |
| applicationData is null / set from the first application record | Confirm the first application is used, or none when there isn't one (2 tests) |
| evaluationEmoji for Waiting Evaluation / Requested Changes / Passed status (Test case 3) | Confirm each evaluation status gets the right emoji (3 tests) |
| resolves to Passed when Passed is in an array of statuses | Confirm Passed wins when the application has several statuses |
| uses last array element when Passed is not present | Confirm the latest status is used when none of them is Passed |
| soloProjectData is null / set from the first solo project record | Confirm the first solo project is used, or none when there isn't one (2 tests) |
| soloProjectTier is derived from the Tier field | Confirm the solo project tier is read from the Tier field |
| currentVoyageSignupData / nextVoyageSignupData from voyage signups | Confirm signups are matched to the current and next voyages (3 tests) |
| currentVoyageSignupTierTeam (Test cases 15–16) | Confirm the tier and team text before and after team assignment, and N/A without a signup (3 tests) |
| commitmentFormText (Test cases 4, 5 & 7) | Confirm the commitment form text when the form is and isn't completed (2 tests) |

##### Status matching - `getStatusMatchText`

| Test | Objective |
| --- | --- |
| returns Match when the current / next voyage signup email matches | Confirm a matching email in either signup shows Match (2 tests) |
| returns Mismatch (Current Voyage) / Mismatch (Next Voyage) when the email differs | Confirm a mismatch says which voyage's signup differs (2 tests) |
| returns N/A when neither current nor next voyage signup exists | Confirm N/A is shown when there's nothing to compare |
| works for Discord Name field / returns Mismatch when Discord Name differs | Confirm Discord Name matching works the same way as email (2 tests) |

##### Voyage closure - `loadClosureVoyage`, `loadVoyageProjects` and `loadDemoDaySignups`

| Test | Objective |
| --- | --- |
| fetches the voyage schedule from Airtable only once per lookup | Confirm `MemberContext.create` reads the Schedules table a single time |
| shares the fetched schedule with the voyage signup and closure helpers | Confirm the same schedule is passed to both voyage helpers, and the closure voyage is worked out once |
| leaves closureVoyage null and skips lookups when there is no current or prior voyage | Confirm nothing is looked up when there's no voyage to report on |
| passes the current and prior voyages to selectVoyageForClosureInfo | Confirm the schedule is handed to the selection logic |
| stores the selected voyage as closureVoyage | Confirm the selected voyage is kept for the project and Demo Day lookups |
| looks up voyage projects for the selected voyage and member | Confirm the Voyage Projects lookup gets the right voyage, Discord ID and fields |
| looks up Demo Day signups for the selected voyage and member | Confirm the Demo Day Signup lookup gets the right voyage, Discord ID and fields |
| voyageProjectText is Yes when a voyage project record exists | Confirm a submitted project shows Yes, independently of Demo Day |
| demoDayText is Yes when a Demo Day signup record exists | Confirm a Demo Day signup shows Yes, independently of the project |
| both texts stay No when no records are returned | Confirm members with no submissions see No |
| both texts stay No when the lookups fail and return undefined | Documents current behavior: an Airtable error is shown to the member as No |
| skips closure lookups when the Discord user cannot be found | Confirm the schedule isn't fetched and no closure lookups are made for an unknown Discord ID |

##### Voyage closure - embed fields

| Test | Objective |
| --- | --- |
| shows project and Demo Day fields as No by default | Confirm both closure fields appear with No when nothing was submitted |
| shows Yes for both fields when the member submitted both | Confirm both closure fields show Yes after submission |
| labels the fields with the closure voyage, not the current voyage | Confirm the field names use the voyage being closed out |
| renders both closure fields inline | Confirm the two closure fields display side by side |
| omits closure fields when there is no closure voyage | Confirm the fields are left out rather than shown empty |
| stays within Discord's 25-field embed limit | Confirm the full embed won't be rejected by Discord |

#### Voyage utilities - `__tests__/utils/functions.test.js`

##### `getCurrentAndPriorVoyage`

| Test | Objective |
| --- | --- |
| requests the Sprint 5 Start Date field from the Schedules table | Confirm the Sprint 5 date is fetched from Airtable |
| during a voyage, returns it as current and the one before it as prior | Confirm the normal mid-voyage case |
| returns voyage objects with parsed dates, not just names | Confirm start, end and Sprint 5 dates are returned as `Date` objects |
| between voyages, current is null and prior is the most recently started voyage | Confirm the gap between voyages reports the voyage that just ended |
| during the first voyage, prior is null | Confirm there's no prior voyage before the first one |
| before any voyage has started, both are null | Confirm nothing is returned before the schedule begins |
| with no voyages at all, both are null | Confirm an empty schedule is handled |
| when voyages overlap, the most recently started one is current | Confirm overlapping voyages pick the newer one as current |
| handles schedule records returned out of date order | Confirm the result doesn't depend on the order Airtable returns records |
| ignores V99, V999 and X-prefixed test voyages | Confirm test voyages are filtered out |
| sets sprint5StartDate to null when the field is blank in Airtable | Confirm a missing Sprint 5 date (Airtable omits blank fields) becomes `null` |
| sets sprint5StartDate to null when the field is an empty string | Confirm an empty Sprint 5 date becomes `null` |
| sets sprint5StartDate to null when the field is not a valid date | Confirm an unparseable Sprint 5 date becomes `null`, not an Invalid Date |

##### Voyage helpers given an already-fetched schedule

| Test | Objective |
| --- | --- |
| getVoyages returns the schedule sorted by start date | Confirm the shared schedule is in date order |
| getCurrentAndPriorVoyage uses the given schedule without calling Airtable | Confirm a schedule passed in is reused rather than fetched again |
| getCurrentAndNextVoyage uses the given schedule without calling Airtable | Confirm a schedule passed in is reused rather than fetched again |
| getCurrentAndPriorVoyage does not reorder the shared schedule | Confirm the helper doesn't change the array it was given |
| both helpers give the same answers whichever runs first on a shared schedule | Confirm sharing one schedule between the helpers is safe |

##### `selectVoyageForClosureInfo`

| Test | Objective |
| --- | --- |
| returns the prior voyage when there is no current voyage | Confirm the voyage that just ended is used between voyages |
| returns null when there is neither a current nor a prior voyage | Confirm there's nothing to report before the first voyage |
| returns the current voyage once its Sprint 5 has started | Confirm closure info switches to the current voyage in Sprint 5 |
| returns the current voyage on the exact moment Sprint 5 starts | Confirm the switch happens at the start of Sprint 5, not after |
| returns the prior voyage before the current voyage reaches Sprint 5 | Confirm the prior voyage is reported until Sprint 5 begins |
| falls back to the current voyage before Sprint 5 when there is no prior voyage | Confirm the first voyage is still reported when there's no prior voyage |
| returns the prior voyage when the current voyage has no Sprint 5 date | Confirm a missing Sprint 5 date is treated as "not started yet" |
| falls back to the current voyage when it has no Sprint 5 date and there is no prior voyage | Confirm a missing Sprint 5 date with no prior voyage still returns a voyage |

### Dependencies

* airtable - ^0.12.2
* discord.js - 14.14.1
* dotenv - 16.3.1

#### Dev Dependencies

* nodemon - ^3.1.14
* vitest - ^5.1.0

### Development

#### Branch naming

* lowercase and hyphen instead of space. For example `feature/discord-bot`
* Only alphanumeric characters, don't use period, space, underscores etc. and don't use multiple hyphens after another, or trailing hyphens.

1. `feature/` for all features.
2. `bugfix/` for all bugfixes.
3. `hotfix/` for all quick emergency fixes.
4. `docs/` for updates to documentation.
5. `refactor/` for refactoring.

#### Commit messages

* all commit messages should be short (50 characters or less), but descriptive. Example `feat: add admin dashboard ` The description should also be what the commit does, not what you did. Notice the example above said `add` not `added`
* We use the following prefixes:
  * `feat:` for features
  * `fix:` for bug fixes and hot fixes
  * `docs:` for documentation
  * `refactor:` for refactoring

### Production

#### Running `deploy-commands.js` on railway

This is only needed if new commands are added.

1. install railway cli `npm install -g @railway/cli`
2. `railway login` - login with the service account
3. `railway link` - link the project to railway

    ```bash
    > Select a workspace: Chingu Projects
    > Select a project: Titan Discord 'bot
    > Select an environment: production
    > Select a service <esc to skip>: titan
   ```

4. `railway run node deploy-commands.js` - deploy commands to discord

___

## Todo

* Refactor, refactor, refactor
* Add more functionality:
  * Improve server.js
  * Improve user.js
    * Maybe add airtable stats
  * Reward system
    * Users can give each other reactions as a reward for helping
  * Message scheduling system
    * Schedule weekly messages
  * Probably more....
  * Maybe a web-interface
  