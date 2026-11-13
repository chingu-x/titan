vi.mock('../../services/MemberContext.js', () => ({
    MemberContext: { create: vi.fn() }
}))

import { MemberContext } from '../../services/MemberContext.js'
import checkUserCommand from '../../commands/admin/checkUser.js'
import { createMockInteraction } from '../helpers/mockInteraction.js'

describe('/checkuser command', () => {
    const TARGET_DISCORD_ID = 'target-discord-id-456'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('replies with error when user lacks Administrator permission', async () => {
        const interaction = createMockInteraction({
            userId: 'admin-user-id',
            isAdmin: false,
            options: { discordid: TARGET_DISCORD_ID }
        })
        await checkUserCommand.execute(interaction)

        expect(interaction.reply).toHaveBeenCalledWith(
            expect.objectContaining({ content: expect.stringContaining('permission') })
        )
        expect(MemberContext.create).not.toHaveBeenCalled()
    })

    test('calls MemberContext.create with the target discordId when user is admin', async () => {
        const fakeEmbed = { data: { title: 'User Information' } }
        MemberContext.create.mockResolvedValue({ embedMessage: fakeEmbed })

        const interaction = createMockInteraction({
            userId: 'admin-user-id',
            isAdmin: true,
            options: { discordid: TARGET_DISCORD_ID }
        })
        await checkUserCommand.execute(interaction)

        expect(MemberContext.create).toHaveBeenCalledWith(interaction, TARGET_DISCORD_ID)
    })

    test('replies with the embed when user is admin', async () => {
        const fakeEmbed = { data: { title: 'User Information' } }
        MemberContext.create.mockResolvedValue({ embedMessage: fakeEmbed })

        const interaction = createMockInteraction({
            userId: 'admin-user-id',
            isAdmin: true,
            options: { discordid: TARGET_DISCORD_ID }
        })
        await checkUserCommand.execute(interaction)

        expect(interaction.reply).toHaveBeenCalledWith({
            embeds: [fakeEmbed],
            ephemeral: true
        })
    })

    test('replies with error message when MemberContext.create throws and not deferred', async () => {
        MemberContext.create.mockRejectedValue(new Error('Something went wrong'))

        const interaction = createMockInteraction({
            userId: 'admin-user-id',
            isAdmin: true,
            options: { discordid: TARGET_DISCORD_ID },
            deferred: false,
            replied: false
        })
        await checkUserCommand.execute(interaction)

        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('error'),
            ephemeral: true
        }))
    })

    test('uses editReply when interaction is deferred on error', async () => {
        MemberContext.create.mockRejectedValue(new Error('Something went wrong'))

        const interaction = createMockInteraction({
            userId: 'admin-user-id',
            isAdmin: true,
            options: { discordid: TARGET_DISCORD_ID },
            deferred: true,
            replied: false
        })
        await checkUserCommand.execute(interaction)

        expect(interaction.editReply).toHaveBeenCalled()
    })
})
