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
                has: vi.fn(() => isAdmin),
            },
        },
        options: {
            getString: vi.fn((name) => options[name] ?? null),
        },
        client: {
            users: { fetch: vi.fn() },
        },
        deferred,
        replied,
        reply: vi.fn().mockResolvedValue(undefined),
        editReply: vi.fn().mockResolvedValue(undefined),
    };
}

module.exports = { createMockInteraction };
