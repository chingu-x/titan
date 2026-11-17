function createMockInteraction({ userId, isAdmin, options = {}, deferred, replied } = {}) {
    return {
        user: { id: userId },
        member: { permissions: { has: vi.fn(() => isAdmin) } },
        options: { getString: vi.fn((name) => options[name] ?? null) },
        client: { users: { fetch: vi.fn() } },
        deferred,
        replied,
        reply: vi.fn().mockResolvedValue(undefined),
        editReply: vi.fn().mockResolvedValue(undefined),
    };
}

export { createMockInteraction };
