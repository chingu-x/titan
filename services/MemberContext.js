const {getCurrentAndNextVoyage, getCurrentAndPriorVoyage} = require("../utils/functions");
const {getAllVoyageSignupsByDiscordId} = require("./voyages");
const {getApplicationsByDiscordId} = require("./applications");
const { getDiscordTimestampRange } = require('../utils/timeBlocks.js');
const {EmbedBuilder} = require("discord.js");
const {getSoloProjectsByDiscordId} = require("./soloProjects");
const { getVoyageProjectsByDiscordId } = require("./voyageProjects.js");
const { getDemoDaySignupsByDiscordId } = require("./demoDaySignups.js")

class MemberContext {
    constructor(interaction, discordId) {
        this.interaction = interaction
        this.discordId = discordId;

        this.user = null;
        this.applicationData = null;

        this.curentVoyage = null;
        this.nextVoyage = null;
        this.currentVoyageSignupTierTeam = null;
        this.currentVoyageSignupRole = null;

        this.soloProjectData = null
        this.soloProjectTier = 'N/A';
        this.evaluationStatus = null;
        this.evaluationEmoji = ':x:';

        this.voyageProjectVoyage = null;
        this.voyageProjectText = `No :x:`
        this.demoDayVoyage = null;
        this.demoDayText = `No :x:`;

        this.currentVoyageSignupData = null;
        this.nextVoyageSignupData = null;
        this.nextVoyageSignupText = `No :x: [Click Here to Signup](${ process.env.VOYAGE_SIGNUP_FORM })`;

        this.commitmentFormText = 'N/A';
    }

    static async create(interaction, discordId) {
        const instance = new MemberContext(interaction, discordId);

        instance.user = await interaction.client.users.fetch(discordId).catch(() => null);

        if(instance.user === null) {
            return instance;
        }
        await instance.loadSoloProjects()
        await instance.loadApplications()
        await instance.loadVoyageSignups()
        await instance.loadVoyageProjects()
        await instance.loadDemoDaySignups()

        return instance;
    }

    get embedMessage() {

        if (this.user === null) {
            return new EmbedBuilder()
                .setColor('#a44747')
                .setTitle('User Information')
                .setDescription(`No user found for this Discord ID: ${this.discordId}.`)
        }

        if (this.applicationData === null ) {
            return new EmbedBuilder()
                .setColor('#a44747')
                .setTitle('User Information')
                .setDescription("No applications found for this user. Please fill out the application form at https://www.chingu.io")
                .setURL('https://www.chingu.io')

        }

        return new EmbedBuilder()
            .setColor('#47a464')
            .setTitle('User Information')
            .setDescription("Check your voyage information.")
            .addFields(
                {
                    name: 'Email',
                    value: this.applicationData?.['Email'] ? `${this.applicationData['Email']} <a:check:1209501960139702363>` : 'No email found :x:',
                    inline: true
                },
                {
                    name: 'Github ID',
                    value: this.soloProjectData?.['GitHub ID'] ? `${this.soloProjectData['GitHub ID']}` : 'N/A',
                    inline: true
                },
                { name: '\u200B', value: '\u200B' },
                {
                    name: 'Discord account match',
                    value: this.applicationData?.['Discord Name'] === this.user.username
                        ? 'OK <a:check:1209501960139702363>'
                        : 'Mismatch :x:',
                    inline: true
                },
                {
                    name: 'Evaluation Status',
                    value: this.evaluationStatus ? `${this.evaluationStatus} ${this.evaluationEmoji}` : 'N/A',
                    inline: true
                },
                {
                    name: 'Solo Project Tier',
                    value: this.soloProjectTier,
                    inline: true
                },
                { name: '\u200B', value: '\u200B' },
            )
            .addFields(
                {
                    name: 'Voyage Email Match',
                    value: this.getStatusMatchText('Email') ,
                    inline: true
                },
                {
                    name: 'Voyage Discord Match',
                    value: this.getStatusMatchText('Discord Name'),
                    inline: true
                },
                { name: '\u200B', value: '\u200B' },
            )
            .addFields(
                {
                    name: `Current Voyage is ${this.currentVoyage}`,
                    value: this.currentVoyageSignupData? "Participating" : "Not participating",
                    inline: true
                },
                { name: `Tier and Team`, value: this.currentVoyageSignupTierTeam, inline: true },
                { name: `Role`, value: this.currentVoyageSignupRole, inline: true },
                { name: '\u200B', value: '\u200B' },
            )
            .addFields(
                {
                    name: `${this.currentVoyage} Primary Time Block`,
                    value: this.currentVoyageSignupData?.['Availability'] ?
                        `${this.currentVoyageSignupData['Availability']}\n${getDiscordTimestampRange(this.currentVoyageSignupData['Availability'])} Local Time` :
                        'N/A',
                    inline: true
                },
                {
                    name: `${this.currentVoyage} Alternate Time Block`,
                    value: this.currentVoyageSignupData?.['Alternate Availability'] ?
                        `${this.currentVoyageSignupData['Alternate Availability']}\n${getDiscordTimestampRange(this.currentVoyageSignupData['Alternate Availability'])} Local Time` :
                        'N/A',
                    inline: true
                },
                { name: '\u200B', value: '\u200B' },
            )
            .addFields(
                {
                    name: `Signed up for ${this.nextVoyage}?`,
                    value: this.nextVoyageSignupText,
                    inline: true
                },
                {
                    name: `Commitment Form for ${this.nextVoyage}?`,
                    value: this.nextVoyageSignupData? this.commitmentFormText : 'N/A',
                    inline: true
                },
                { name: '\u200B', value: '\u200B' },
            )
            .addFields(
                {
                    name: `Submitted Project for ${this.voyageProjectVoyage.number}`,
                    value: this.voyageProjectText,
                    inline: true
                },
                { 
                    name: `Submitted Demo Day presentation for ${this.currentVoyage}:`, 
                    value: this.demoDayText,
                    inline: true
                },
            )
            .setThumbnail('https://imgur.com/EII19bn.png');
    }

    async loadApplications() {
        // fetch the user's application from airtable
        const applications = await getApplicationsByDiscordId(
            this.discordId,
            [
                'Discord Name',
                'Evaluation Status (from Solo Project Link)',
                'Email'
            ]
        );

        if(applications.length===0) {
            console.debug(`No application found for user with Discord ID ${this.discordId}`);
            return
        }

        // TODO: handle multiple applications edge case. For now, just use the first result
        this.applicationData = applications[0].fields;

        this.evaluationStatus = this.applicationData?.['Evaluation Status (from Solo Project Link)'];
        if (Array.isArray(this.evaluationStatus)) {
            if (this.evaluationStatus.includes('Passed')) {
                this.evaluationStatus = 'Passed';
            } else {
                this.evaluationStatus = this.evaluationStatus[this.evaluationStatus.length - 1];
            }
        }

        if (this.evaluationStatus?.toLowerCase() === 'passed') {
            this.evaluationEmoji = '<a:check:1209501960139702363>';
        }
    }

    async loadSoloProjects() {
        const soloProjects = await getSoloProjectsByDiscordId(
            this.discordId,
            [
                'Discord Name',
                'Email',
                'Tier',
                'GitHub ID'
            ]
        )

        if (soloProjects?.length === 0) {
            console.debug(`No solo projects found for user with Discord ID ${this.discordId}`);
            return
        }

        // TODO: handle multiple solo projects edge case. For now, just use the first result
        this.soloProjectData = soloProjects[0].fields;
        this.soloProjectTier = `Tier ${this.soloProjectData['Tier'][5]}`
    }

    async loadVoyageSignups() {
        // fetch the current and next voyage
        const { currentVoyage, nextVoyage } = await getCurrentAndNextVoyage();
        this.currentVoyage = currentVoyage;
        this.nextVoyage = nextVoyage;

        // TODO: handle multiple voyage signups for the same voyage, now just pick the first return
        // fetch the user's signup forms for this voyage
        const voyageSignups = await getAllVoyageSignupsByDiscordId(
            this.discordId,
            [
                'Discord Name',
                'Email',
                'Availability',
                'Alternate Availability',
                'Confirmation Form Completed',
                'Tier',
                'Voyage',
                'Team Name',
                'Team No.',
                'Role'
            ]
        )

        // find current voyage signup
        voyageSignups.forEach(signup => {
            if(signup.fields['Voyage'] === this.currentVoyage) {
                this.currentVoyageSignupData = signup.fields;
            }
        })

        // find next voyage signup
        voyageSignups.forEach(signup => {
            if(signup.fields['Voyage'] === this.nextVoyage || signup.fields['Voyage'] === "V??") {
                this.nextVoyageSignupData = signup.fields;
                if (signup.fields["Voyage"] === "V??") {
                    this.nextVoyageSignupText = `Pending <a:LoadingEmoji:1274376308327190549> `
                } else {
                    const tierName = signup.fields['Team Name']
                    this.nextVoyageSignupText = tierName !== undefined && tierName !== ""
                        ? `Yes (${tierName.slice(0,6)}) <a:check:1209501960139702363>`
                        : `Tier not yet assigned`
                }
                this.commitmentFormText = signup.fields['Confirmation Form Completed'] === 'Yes'
                    ? 'Yes <a:check:1209501960139702363>'
                    : `No :x: [Fill out Confirmation Form](${ process.env.VOYAGE_CONFIRMATION_FORM })`
            }
        })

        this.currentVoyageSignupTierTeam = this.currentVoyageSignupData?.['Team No.']
            ? `${this.currentVoyageSignupData['Team Name']}, Team ${this.currentVoyageSignupData['Team No.'] || 'No Team'}`
            : this.currentVoyageSignupData?.['Team Name']
                ? `${this.currentVoyageSignupData['Team Name']}, No Team`
                :'N/A';

        this.currentVoyageSignupRole = this.currentVoyageSignupData ?
            `${this.currentVoyageSignupData['Role']}` : 'N/A';
    }

    async selectVoyageForClosureInfo(currentVoyage, priorVoyage) {
        // Edge case: choosing the prior Voyage won't report on the Voyage 
        // Project status for the current Voyage until it ends. The solution 
        // we have chosen for this is to report on the current Voyage if 
        // Sprint 5 has started and the Voyage hasn't ended. Once the Voyage
        // ends we use the prior Voyage.
        const currentDate = new Date();
        if (currentVoyage !== null) {
            if (currentDate >= currentVoyage.sprint5StartDate && currentDate <= currentVoyage.endDate) {
               return currentVoyage 
            } else {
               return priorVoyage
            }
        }
        return priorVoyage
    }

    async loadVoyageProjects() {
        // Our process is for only one team member to submit a Voyage Project
        // form and an automated workflow is run to replicate it in that table
        // for each team member. Due to this a member may not have actually
        // submitted the form, but we'll still indicate that they have if one
        // is found.
        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage();
        if (currentVoyage === null && priorVoyage === null) {
            console.debug(`No current or prior Voyage found`);
            return
        }
        this.voyageProjectVoyage = await this.selectVoyageForClosureInfo(currentVoyage, priorVoyage)

        const voyageProjects = await getVoyageProjectsByDiscordId(
            this.voyageProjectVoyage.number, this.discordId,
            [
                'Discord ID (from Application link)',
                'Email',
                'Completed Voyage?',
                'Completion Status'
            ]
        )

        if (!voyageProjects?.length) {
            console.debug(`No voyage projects found for user with Discord ID ${this.discordId} and Voyage ${this.voyageProjectVoyage.number}`);
            return
        }

        this.voyageProjectText = 'Yes <a:check:1209501960139702363>';
    }

    async loadDemoDaySignups() {
        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage();
        if (currentVoyage === null && priorVoyage === null) {
            console.debug(`No current or prior Voyage found`);
            return
        }
        this.demoDayVoyage = await this.selectVoyageForClosureInfo(currentVoyage, priorVoyage)

        const demoDaySubmissions = await getDemoDaySignupsByDiscordId(
            this.demoDayVoyage.number, this.discordId,
            [
                'Discord ID (from Application link)',
                'Email',
                'Voyage'
            ]
        )

        if (!demoDaySubmissions?.length) {
            console.debug(`No demo day submissions found for user with Discord ID ${this.discordId} and Voyage ${this.demoDayVoyage.number}`);
            return
        }
        
        this.demoDayText = 'Yes <a:check:1209501960139702363>';
    }

    /**
     * Returns the status match for a given field name.
     * @param {"Discord Name" | "Email"} fieldName - The field name to check status for.
     * @returns {string} The status match text.
     */
    getStatusMatchText(fieldName) {
        if (this.currentVoyageSignupData?.[fieldName] === this.applicationData?.[fieldName]) {
            return 'Match <a:check:1209501960139702363>';
        }

        if (this.nextVoyageSignupData?.[fieldName] === this.applicationData?.[fieldName]) {
            return 'Match <a:check:1209501960139702363>';
        }

        if (this.currentVoyageSignupData) {
            return 'Mismatch :x: (Current Voyage)';
        }

        if (this.nextVoyageSignupData) {
            return 'Mismatch :x: (Next Voyage)';
        }

        return 'N/A';
    }
}

module.exports = {
    MemberContext
};