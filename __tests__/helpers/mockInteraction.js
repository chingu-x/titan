/**
 * Builds a minimal fake Discord ChatInputCommandInteraction with just the
 * pieces the slash commands under test touch.
 */
function createMockInteraction({
    userId = '123456789012345678',
    isAdmin = true,
    options = {},
    deferred = false,
    replied = false,
} = {}) {
    return {
        user: { id: userId },
        member: {
            permissions: {
                has: jest.fn(() => isAdmin),
            },
        },
        options: {
            getString: jest.fn((name) => options[name] ?? null),
        },
        client: {
            users: { fetch: jest.fn() },
        },
        deferred,
        replied,
        reply: jest.fn().mockResolvedValue(undefined),
        editReply: jest.fn().mockResolvedValue(undefined),
    };
}

module.exports = { createMockInteraction };
