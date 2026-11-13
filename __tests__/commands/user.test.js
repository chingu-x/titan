vi.mock('../../services/MemberContext.js', () => ({
    MemberContext: { create: vi.fn() }
}))

import { MemberContext } from '../../services/MemberContext.js'
import userCommand from '../../commands/utility/user.js'
import { createMockInteraction } from '../helpers/mockInteraction.js'

describe('/user command', () => {
    const DISCORD_ID = 'discord-id-123'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('calls MemberContext.create with the interaction and user id', async () => {
        const fakeEmbed = { data: { title: 'User Information' } }
        MemberContext.create.mockResolvedValue({ embedMessage: fakeEmbed })

        const interaction = createMockInteraction({ userId: DISCORD_ID })
        await userCommand.execute(interaction)

        expect(MemberContext.create).toHaveBeenCalledWith(interaction, DISCORD_ID)
    })

    test('replies with the embed from MemberContext', async () => {
        const fakeEmbed = { data: { title: 'User Information' } }
        MemberContext.create.mockResolvedValue({ embedMessage: fakeEmbed })

        const interaction = createMockInteraction({ userId: DISCORD_ID })
        await userCommand.execute(interaction)

        expect(interaction.reply).toHaveBeenCalledWith({
            embeds: [fakeEmbed],
            ephemeral: true
        })
    })

    test('replies with error message when MemberContext.create throws and not deferred', async () => {
        MemberContext.create.mockRejectedValue(new Error('Something went wrong'))

        const interaction = createMockInteraction({ userId: DISCORD_ID, deferred: false, replied: false })
        await userCommand.execute(interaction)

        expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('error'),
            ephemeral: true
        }))
    })

    test('uses editReply when interaction is deferred on error', async () => {
        MemberContext.create.mockRejectedValue(new Error('Something went wrong'))

        const interaction = createMockInteraction({ userId: DISCORD_ID, deferred: true, replied: false })
        await userCommand.execute(interaction)

        expect(interaction.editReply).toHaveBeenCalled()
    })
})
