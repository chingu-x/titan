// Prevent handlers/airtable.js from calling `new Airtable({apiKey})` at import time.
jest.mock('airtable', () => jest.fn(() => ({ base: jest.fn() })))

const { MemberContext } = require('../../services/MemberContext');
const user = require('../../commands/utility/user');
const { createMockInteraction } = require('../helpers/mockInteraction');

const USER_ID = '123456789012345678';
const ERROR_MESSAGE = 'An error occurred while trying to fetch your information.';

describe('/user command', () => {
    let fakeEmbed;
    let createSpy;

    beforeEach(() => {
        fakeEmbed = { title: 'fake embed' };
        createSpy = jest
            .spyOn(MemberContext, 'create')
            .mockResolvedValue({ embedMessage: fakeEmbed });
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('command definition', () => {
        it('is named "user" with a description', () => {
            const json = user.data.toJSON();
            expect(json.name).toBe('user');
            expect(json.description).toBe('Provides information about you.');
        });

        it('takes no options and has no permission restriction', () => {
            const json = user.data.toJSON();
            expect(json.options ?? []).toHaveLength(0);
            expect(json.default_member_permissions ?? null).toBeNull();
        });

        it('exports an execute function', () => {
            expect(typeof user.execute).toBe('function');
        });
    });

    describe('successful lookup', () => {
        it("looks up the invoking user's own Discord ID", async () => {
            const interaction = createMockInteraction({ userId: USER_ID });

            await user.execute(interaction);

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(createSpy).toHaveBeenCalledWith(interaction, USER_ID);
        });

        it('replies ephemerally with the member context embed', async () => {
            const interaction = createMockInteraction({ userId: USER_ID });

            await user.execute(interaction);

            expect(interaction.reply).toHaveBeenCalledTimes(1);
            expect(interaction.reply).toHaveBeenCalledWith({
                embeds: [fakeEmbed],
                ephemeral: true,
            });
            expect(interaction.editReply).not.toHaveBeenCalled();
        });

        it('does not require administrator permission', async () => {
            const interaction = createMockInteraction({ userId: USER_ID, isAdmin: false });

            await user.execute(interaction);

            expect(interaction.member.permissions.has).not.toHaveBeenCalled();
            expect(interaction.reply).toHaveBeenCalledWith({
                embeds: [fakeEmbed],
                ephemeral: true,
            });
        });
    });

    describe('error handling', () => {
        it('replies with an error message when the lookup fails', async () => {
            createSpy.mockRejectedValue(new Error('Airtable down'));
            const interaction = createMockInteraction({ userId: USER_ID });

            await user.execute(interaction);

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
            const interaction = createMockInteraction({ userId: USER_ID, replied: true });

            await user.execute(interaction);

            expect(interaction.editReply).toHaveBeenCalledWith({
                content: ERROR_MESSAGE,
                ephemeral: true,
            });
            expect(interaction.reply).not.toHaveBeenCalled();
        });

        it('edits the reply instead when the interaction was deferred', async () => {
            createSpy.mockRejectedValue(new Error('boom'));
            const interaction = createMockInteraction({ userId: USER_ID, deferred: true });

            await user.execute(interaction);

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
            const interaction = createMockInteraction({ userId: USER_ID });

            await user.execute(interaction);

            expect(interaction.reply).toHaveBeenCalledWith({
                content: ERROR_MESSAGE,
                ephemeral: true,
            });
        });
    });
});
