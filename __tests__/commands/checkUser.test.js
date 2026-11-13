// Prevent handlers/airtable.js from calling `new Airtable({apiKey})` at import time.
vi.mock('../../handlers/airtable', () => ({
    base: vi.fn(),
    airtableBaseID: 'mock-base',
    airtableAPIKey: 'mock-key',
    adminTestID: 'mock-admin-test',
    adminChatID: 'mock-admin-chat',
}))

const { PermissionsBitField } = require('discord.js');
const { MemberContext } = require('../../services/MemberContext');
const checkUser = require('../../commands/admin/checkUser');
const { createMockInteraction } = require('../helpers/mockInteraction');

const VALID_ID = '123456789012345678';
const ERROR_MESSAGE = 'An error occurred while trying to fetch your information.';

describe('/checkuser command', () => {
    let fakeEmbed;
    let createSpy;

    beforeEach(() => {
        fakeEmbed = { title: 'fake embed' };
        createSpy = vi
            .spyOn(MemberContext, 'create')
            .mockResolvedValue({ embedMessage: fakeEmbed });
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('command definition', () => {
        it('is named "checkuser" with a description', () => {
            const json = checkUser.data.toJSON();
            expect(json.name).toBe('checkuser');
            expect(json.description).toBe('Provides information about a user.');
        });

        it('defaults to Administrator-only permissions', () => {
            const json = checkUser.data.toJSON();
            expect(json.default_member_permissions).toBe(
                PermissionsBitField.Flags.Administrator.toString(),
            );
        });

        it('has a single required "discordid" string option', () => {
            const { options } = checkUser.data.toJSON();
            expect(options).toHaveLength(1);
            expect(options[0]).toMatchObject({
                name: 'discordid',
                required: true,
                type: 3, // ApplicationCommandOptionType.String
            });
        });

        it('exports an execute function', () => {
            expect(typeof checkUser.execute).toBe('function');
        });
    });

    describe('permission check', () => {
        it('rejects non-administrators without looking up the user', async () => {
            const interaction = createMockInteraction({
                isAdmin: false,
                options: { discordid: VALID_ID },
            });

            await checkUser.execute(interaction);

            expect(interaction.member.permissions.has).toHaveBeenCalledWith(
                PermissionsBitField.Flags.Administrator,
            );
            expect(interaction.reply).toHaveBeenCalledWith({
                content: 'You do not have permission to use this command.',
                ephemeral: true,
            });
            expect(createSpy).not.toHaveBeenCalled();
        });
    });

    describe('Discord ID validation', () => {
        it.each([
            ['non-numeric', 'not-an-id'],
            ['too short (16 digits)', '1234567890123456'],
            ['too long (21 digits)', '123456789012345678901'],
            ['contains letters', '12345678901234567a'],
            ['a mention', '<@123456789012345678>'],
            ['empty', ''],
        ])('rejects an ID that is %s', async (_label, discordid) => {
            const interaction = createMockInteraction({ options: { discordid } });

            await checkUser.execute(interaction);

            expect(interaction.reply).toHaveBeenCalledWith({
                content: 'That is not a valid Discord ID.',
                ephemeral: true,
            });
            expect(createSpy).not.toHaveBeenCalled();
        });

        it.each([
            ['17 digits', '12345678901234567'],
            ['18 digits', '123456789012345678'],
            ['20 digits', '12345678901234567890'],
        ])('accepts an ID with %s', async (_label, discordid) => {
            const interaction = createMockInteraction({ options: { discordid } });

            await checkUser.execute(interaction);

            expect(createSpy).toHaveBeenCalledWith(interaction, discordid);
        });

        it('trims surrounding whitespace before validating', async () => {
            const interaction = createMockInteraction({
                options: { discordid: `  ${VALID_ID}  ` },
            });

            await checkUser.execute(interaction);

            expect(createSpy).toHaveBeenCalledWith(interaction, VALID_ID);
        });
    });

    describe('successful lookup', () => {
        it('replies ephemerally with the member context embed', async () => {
            const interaction = createMockInteraction({ options: { discordid: VALID_ID } });

            await checkUser.execute(interaction);

            expect(interaction.options.getString).toHaveBeenCalledWith('discordid');
            expect(createSpy).toHaveBeenCalledWith(interaction, VALID_ID);
            expect(interaction.reply).toHaveBeenCalledTimes(1);
            expect(interaction.reply).toHaveBeenCalledWith({
                embeds: [fakeEmbed],
                ephemeral: true,
            });
            expect(interaction.editReply).not.toHaveBeenCalled();
        });

        it('looks up the requested ID, not the invoking admin', async () => {
            const targetId = '987654321098765432';
            const interaction = createMockInteraction({
                userId: VALID_ID,
                options: { discordid: targetId },
            });

            await checkUser.execute(interaction);

            expect(createSpy).toHaveBeenCalledWith(interaction, targetId);
        });
    });

    describe('error handling', () => {
        it('replies with an error message when the lookup fails', async () => {
            createSpy.mockRejectedValue(new Error('Airtable down'));
            const interaction = createMockInteraction({ options: { discordid: VALID_ID } });

            await checkUser.execute(interaction);

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('fetch user information'),
                'Airtable down',
            );
            expect(interaction.reply).toHaveBeenCalledWith({
                content: ERROR_MESSAGE,
                ephemeral: true,
            });
            expect(interaction.editReply).not.toHaveBeenCalled();
        });

        it('edits the reply instead when the interaction was already replied to', async () => {
            createSpy.mockRejectedValue(new Error('boom'));
            const interaction = createMockInteraction({
                options: { discordid: VALID_ID },
                replied: true,
            });

            await checkUser.execute(interaction);

            expect(interaction.editReply).toHaveBeenCalledWith({
                content: ERROR_MESSAGE,
                ephemeral: true,
            });
            expect(interaction.reply).not.toHaveBeenCalled();
        });

        it('edits the reply instead when the interaction was deferred', async () => {
            createSpy.mockRejectedValue(new Error('boom'));
            const interaction = createMockInteraction({
                options: { discordid: VALID_ID },
                deferred: true,
            });

            await checkUser.execute(interaction);

            expect(interaction.editReply).toHaveBeenCalledWith({
                content: ERROR_MESSAGE,
                ephemeral: true,
            });
            expect(interaction.reply).not.toHaveBeenCalled();
        });

        it('uses the error path when building the embed throws', async () => {
            createSpy.mockResolvedValue({
                get embedMessage() {
                    throw new Error('bad embed');
                },
            });
            const interaction = createMockInteraction({ options: { discordid: VALID_ID } });

            await checkUser.execute(interaction);

            expect(interaction.reply).toHaveBeenCalledWith({
                content: ERROR_MESSAGE,
                ephemeral: true,
            });
        });
    });
});
