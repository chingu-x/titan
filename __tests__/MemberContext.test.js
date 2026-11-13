vi.mock('../utils/functions.js')
vi.mock('../services/voyages.js')
vi.mock('../services/applications.js')
vi.mock('../services/soloProjects.js')

import { getCurrentAndNextVoyage } from '../utils/functions.js'
import { getAllVoyageSignupsByDiscordId } from '../services/voyages.js'
import { getApplicationsByDiscordId } from '../services/applications.js'
import { getSoloProjectsByDiscordId } from '../services/soloProjects.js'
import { MemberContext } from '../services/MemberContext.js'

// ── Constants ─────────────────────────────────────────────────────────────────

const DISCORD_ID = 'discord-id-123'
const DISCORD_USERNAME = 'testuser'
const EMAIL = 'test@example.com'
const CURRENT_VOYAGE = 'V52'
const NEXT_VOYAGE = 'V53'
const CHECK_EMOJI = '<a:check:1209501960139702363>'

// ── Factories ─────────────────────────────────────────────────────────────────

function makeInteraction(username = DISCORD_USERNAME) {
    return {
        client: {
            users: {
                fetch: vi.fn().mockResolvedValue({ username, id: DISCORD_ID })
            }
        }
    }
}

/** Create a MemberContext with specific state, bypassing async loading.
 *  Used to test `embedMessage` and `getStatusMatchText` directly without
 *  needing to wire up service mocks for every scenario.
 */
function buildContext(overrides = {}) {
    const ctx = new MemberContext(makeInteraction(), DISCORD_ID)
    ctx.user = 'user' in overrides ? overrides.user : { username: DISCORD_USERNAME, id: DISCORD_ID }
    ctx.applicationData = overrides.applicationData ?? null
    ctx.soloProjectData = overrides.soloProjectData ?? null
    ctx.evaluationStatus = overrides.evaluationStatus ?? null
    ctx.evaluationEmoji = overrides.evaluationEmoji ?? ':x:'
    // currentVoyage and nextVoyage are set by loadVoyageSignups; set here for embed rendering
    ctx.currentVoyage = overrides.currentVoyage ?? CURRENT_VOYAGE
    ctx.nextVoyage = overrides.nextVoyage ?? NEXT_VOYAGE
    ctx.currentVoyageSignupData = overrides.currentVoyageSignupData ?? null
    ctx.nextVoyageSignupData = overrides.nextVoyageSignupData ?? null
    ctx.nextVoyageSignupText = overrides.nextVoyageSignupText ?? `No :x: [Click Here to Signup](http://example.com)`
    ctx.commitmentFormText = overrides.commitmentFormText ?? 'N/A'
    // These default to 'N/A' (not null) because EmbedBuilder rejects null field values
    ctx.currentVoyageSignupTierTeam = overrides.currentVoyageSignupTierTeam ?? 'N/A'
    ctx.currentVoyageSignupRole = overrides.currentVoyageSignupRole ?? 'N/A'
    // voyageProjectVoyage defaults to a voyage object so embedMessage doesn't crash on null
    ctx.voyageProjectVoyage = overrides.voyageProjectVoyage !== undefined
        ? overrides.voyageProjectVoyage
        : { number: CURRENT_VOYAGE }
    ctx.demoDayVoyage = overrides.demoDayVoyage !== undefined
        ? overrides.demoDayVoyage
        : { number: CURRENT_VOYAGE }
    return ctx
}

/** Return embed fields as { fieldName: fieldValue } for easy assertions. */
function fieldMap(embed) {
    return Object.fromEntries(
        (embed.data.fields ?? []).map(f => [f.name, f.value])
    )
}

/** Minimal Airtable-style record with a `.fields` property. */
const makeRecord = (fields) => ({ fields })

const BASE_APPLICATION = { Email: EMAIL, 'Discord Name': DISCORD_USERNAME }

// ── embedMessage — basic branches ─────────────────────────────────────────────

describe('MemberContext.embedMessage — user not found', () => {
    test('returns red embed when user is null', () => {
        const ctx = buildContext({ user: null })
        const embed = ctx.embedMessage
        expect(embed.data.description).toContain('No user found')
        expect(embed.data.description).toContain(DISCORD_ID)
    })
})

// ── Test case 1: no Application, no Solo Project, no Voyage Signup, no Commitment form ──

describe('MemberContext.embedMessage — Test case 1: no Application', () => {
    test('returns red embed with no-applications message when applicationData is null', () => {
        const ctx = buildContext({ applicationData: null })
        const embed = ctx.embedMessage
        expect(embed.data.description).toContain('No applications found')
    })

    test('embed has no fields when applicationData is null', () => {
        const ctx = buildContext({ applicationData: null })
        expect(ctx.embedMessage.data.fields).toBeUndefined()
    })
})

// ── Test case 2: Application only, no Solo Project, Voyage Signup, or Commitment form ──

describe('MemberContext.embedMessage — Test case 2: Application, no other data', () => {
    test('shows GitHub ID as N/A when soloProjectData is null', () => {
        const ctx = buildContext({ applicationData: BASE_APPLICATION, soloProjectData: null })
        expect(fieldMap(ctx.embedMessage)['Github ID']).toBe('N/A')
    })

    test('shows Evaluation Status as N/A when evaluationStatus is null', () => {
        const ctx = buildContext({ applicationData: BASE_APPLICATION, evaluationStatus: null })
        expect(fieldMap(ctx.embedMessage)['Evaluation Status']).toBe('N/A')
    })

    test('shows Solo Project Tier as N/A when soloProjectData is null', () => {
        const ctx = buildContext({ applicationData: BASE_APPLICATION })
        expect(fieldMap(ctx.embedMessage)['Solo Project Tier']).toBe('N/A')
    })

    test('shows "Not participating" for current voyage when no signup', () => {
        const ctx = buildContext({ applicationData: BASE_APPLICATION })
        expect(fieldMap(ctx.embedMessage)[`Current Voyage is ${CURRENT_VOYAGE}`]).toBe('Not participating')
    })

    test('shows Commitment Form as N/A when no next voyage signup', () => {
        const ctx = buildContext({ applicationData: BASE_APPLICATION, nextVoyageSignupData: null })
        expect(fieldMap(ctx.embedMessage)[`Commitment Form for ${NEXT_VOYAGE}?`]).toBe('N/A')
    })

    test('shows Voyage Email Match as N/A when no signups', () => {
        const ctx = buildContext({ applicationData: BASE_APPLICATION })
        expect(fieldMap(ctx.embedMessage)['Voyage Email Match']).toBe('N/A')
    })
})

// ── Test case 3: Application + Solo Project in Waiting Evaluation / Requested Changes / Passed ──

describe('MemberContext.embedMessage — Test case 3: evaluation statuses, no Voyage Signup', () => {
    test('shows :x: emoji for Waiting Evaluation status', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            evaluationStatus: 'Waiting Evaluation',
            evaluationEmoji: ':x:'
        })
        expect(fieldMap(ctx.embedMessage)['Evaluation Status']).toBe('Waiting Evaluation :x:')
    })

    test('shows :x: emoji for Requested Changes status', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            evaluationStatus: 'Requested Changes',
            evaluationEmoji: ':x:'
        })
        expect(fieldMap(ctx.embedMessage)['Evaluation Status']).toBe('Requested Changes :x:')
    })

    test('shows check emoji for Passed status', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            evaluationStatus: 'Passed',
            evaluationEmoji: CHECK_EMOJI
        })
        expect(fieldMap(ctx.embedMessage)['Evaluation Status']).toBe(`Passed ${CHECK_EMOJI}`)
    })
})

// ── Test cases 4-7: Application + Solo Project + next Voyage Signup variations ──

describe('MemberContext.embedMessage — Test cases 4–7: Voyage Signup and Commitment form', () => {
    // Test 4: Application + Solo Project (any status) + next Voyage Signup + Commitment form completed
    test('shows check emoji commitment form when Confirmation Form Completed is Yes (Test case 4)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            nextVoyageSignupData: { 'Confirmation Form Completed': 'Yes' },
            commitmentFormText: `Yes ${CHECK_EMOJI}`
        })
        expect(fieldMap(ctx.embedMessage)[`Commitment Form for ${NEXT_VOYAGE}?`]).toBe(`Yes ${CHECK_EMOJI}`)
    })

    // Test 5 & 7: Application + Solo Project (Passed) + next Voyage Signup + NO Commitment form
    test('shows :x: link when Commitment form not completed (Test cases 5 & 7)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            evaluationStatus: 'Passed',
            evaluationEmoji: CHECK_EMOJI,
            nextVoyageSignupData: { 'Confirmation Form Completed': 'No' },
            commitmentFormText: `No :x: [Fill out Confirmation Form](http://example.com)`
        })
        expect(fieldMap(ctx.embedMessage)[`Commitment Form for ${NEXT_VOYAGE}?`]).toContain('No :x:')
    })

    // Test 6: Application + Solo Project (Passed) + next Voyage Signup + Commitment form
    test('shows commitment form completed with Passed evaluation (Test case 6)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            evaluationStatus: 'Passed',
            evaluationEmoji: CHECK_EMOJI,
            nextVoyageSignupData: { 'Confirmation Form Completed': 'Yes' },
            commitmentFormText: `Yes ${CHECK_EMOJI}`
        })
        const fields = fieldMap(ctx.embedMessage)
        expect(fields['Evaluation Status']).toBe(`Passed ${CHECK_EMOJI}`)
        expect(fields[`Commitment Form for ${NEXT_VOYAGE}?`]).toBe(`Yes ${CHECK_EMOJI}`)
    })
})

// ── Test cases 8-10: Voyage Project and Demo Day ──────────────────────────────
// TODO: "Voyage Project" and "Demo Day presentation form" do not exist in the
// current MemberContext.js. These tests are placeholders pending clarification
// from the team about what fields/services these map to.

// ── Test cases 11-14: Primary and Alternate Time Blocks ───────────────────────

describe('MemberContext.embedMessage — Test cases 11–14: Time Blocks', () => {
    // Test 11: User in a voyage with no time block preferences set
    test('shows N/A for Primary Time Block when Availability field is absent (Test case 11)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { Email: EMAIL, 'Discord Name': DISCORD_USERNAME }
        })
        expect(fieldMap(ctx.embedMessage)[`${CURRENT_VOYAGE} Primary Time Block`]).toBe('N/A')
    })

    test('shows N/A for Alternate Time Block when Alternate Availability field is absent (Test case 11)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { Email: EMAIL, 'Discord Name': DISCORD_USERNAME }
        })
        expect(fieldMap(ctx.embedMessage)[`${CURRENT_VOYAGE} Alternate Time Block`]).toBe('N/A')
    })

    // Test 12: Primary Time Block set, no Alternate
    test('shows Primary Time Block label when Availability is set (Test case 12)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { Availability: '🌞 Daylight (04:00–10:00 UTC)' }
        })
        expect(fieldMap(ctx.embedMessage)[`${CURRENT_VOYAGE} Primary Time Block`]).toContain('🌞 Daylight')
    })

    test('shows N/A for Alternate Time Block when only Primary is set (Test case 12)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { Availability: '🌞 Daylight (04:00–10:00 UTC)' }
        })
        expect(fieldMap(ctx.embedMessage)[`${CURRENT_VOYAGE} Alternate Time Block`]).toBe('N/A')
    })

    // Test 13: No Primary Time Block, but Alternate is set
    test('shows N/A for Primary Time Block when only Alternate is set (Test case 13)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { 'Alternate Availability': '🌙 Dusk (16:00–22:00 UTC)' }
        })
        expect(fieldMap(ctx.embedMessage)[`${CURRENT_VOYAGE} Primary Time Block`]).toBe('N/A')
    })

    test('shows Alternate Time Block label when Alternate Availability is set (Test case 13)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { 'Alternate Availability': '🌙 Dusk (16:00–22:00 UTC)' }
        })
        expect(fieldMap(ctx.embedMessage)[`${CURRENT_VOYAGE} Alternate Time Block`]).toContain('🌙 Dusk')
    })

    // Test 14: Both Primary and Alternate Time Blocks set
    test('shows both time blocks when both Availability fields are set (Test case 14)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: {
                Availability: '🌞 Daylight (04:00–10:00 UTC)',
                'Alternate Availability': '🌙 Dusk (16:00–22:00 UTC)'
            }
        })
        const fields = fieldMap(ctx.embedMessage)
        expect(fields[`${CURRENT_VOYAGE} Primary Time Block`]).toContain('🌞 Daylight')
        expect(fields[`${CURRENT_VOYAGE} Alternate Time Block`]).toContain('🌙 Dusk')
    })
})

// ── Test cases 15-16: Tier, Role, and Team assignment ─────────────────────────

describe('MemberContext.embedMessage — Test cases 15–16: Team assignment display', () => {
    // Test 15: User in a Voyage with Tier and Role, but not assigned to a Team
    test('shows "No Team" when Team Name is set but Team No. is absent (Test case 15)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { 'Team Name': 'Tier 3', Role: 'Developer' },
            currentVoyageSignupTierTeam: 'Tier 3, No Team',
            currentVoyageSignupRole: 'Developer'
        })
        const fields = fieldMap(ctx.embedMessage)
        expect(fields['Tier and Team']).toBe('Tier 3, No Team')
        expect(fields['Role']).toBe('Developer')
    })

    // Test 16: User in a Voyage with Tier, Role, and assigned to a Team
    test('shows team number when Team No. is assigned (Test case 16)', () => {
        const ctx = buildContext({
            applicationData: BASE_APPLICATION,
            currentVoyageSignupData: { 'Team Name': 'Tier 3', 'Team No.': '5', Role: 'Developer' },
            currentVoyageSignupTierTeam: 'Tier 3, Team 5',
            currentVoyageSignupRole: 'Developer'
        })
        const fields = fieldMap(ctx.embedMessage)
        expect(fields['Tier and Team']).toBe('Tier 3, Team 5')
        expect(fields['Role']).toBe('Developer')
    })
})

// ── loadApplications ──────────────────────────────────────────────────────────

describe('MemberContext.loadApplications', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([])
        getSoloProjectsByDiscordId.mockResolvedValue([])
    })

    test('applicationData is null when no applications are returned', async () => {
        getApplicationsByDiscordId.mockResolvedValue([])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.applicationData).toBeNull()
    })

    test('applicationData is set from the first application record', async () => {
        getApplicationsByDiscordId.mockResolvedValue([
            makeRecord({ Email: EMAIL, 'Discord Name': DISCORD_USERNAME })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.applicationData.Email).toBe(EMAIL)
    })

    test('evaluationEmoji is :x: for Waiting Evaluation status (Test case 3)', async () => {
        getApplicationsByDiscordId.mockResolvedValue([
            makeRecord({ Email: EMAIL, 'Evaluation Status (from Solo Project Link)': 'Waiting Evaluation' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.evaluationEmoji).toBe(':x:')
        expect(ctx.evaluationStatus).toBe('Waiting Evaluation')
    })

    test('evaluationEmoji is :x: for Requested Changes status (Test case 3)', async () => {
        getApplicationsByDiscordId.mockResolvedValue([
            makeRecord({ Email: EMAIL, 'Evaluation Status (from Solo Project Link)': 'Requested Changes' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.evaluationEmoji).toBe(':x:')
        expect(ctx.evaluationStatus).toBe('Requested Changes')
    })

    test('evaluationEmoji is check for Passed status (Test case 3)', async () => {
        getApplicationsByDiscordId.mockResolvedValue([
            makeRecord({ Email: EMAIL, 'Evaluation Status (from Solo Project Link)': 'Passed' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.evaluationEmoji).toBe(CHECK_EMOJI)
        expect(ctx.evaluationStatus).toBe('Passed')
    })

    test('resolves to Passed when Passed is in an array of statuses (Test cases 3–6)', async () => {
        getApplicationsByDiscordId.mockResolvedValue([
            makeRecord({
                Email: EMAIL,
                'Evaluation Status (from Solo Project Link)': ['Requested Changes', 'Passed']
            })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.evaluationStatus).toBe('Passed')
        expect(ctx.evaluationEmoji).toBe(CHECK_EMOJI)
    })

    test('uses last array element when Passed is not present', async () => {
        getApplicationsByDiscordId.mockResolvedValue([
            makeRecord({
                Email: EMAIL,
                'Evaluation Status (from Solo Project Link)': ['Waiting Evaluation', 'Requested Changes']
            })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.evaluationStatus).toBe('Requested Changes')
        expect(ctx.evaluationEmoji).toBe(':x:')
    })
})

// ── loadSoloProjects ──────────────────────────────────────────────────────────

describe('MemberContext.loadSoloProjects', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getApplicationsByDiscordId.mockResolvedValue([])
        getAllVoyageSignupsByDiscordId.mockResolvedValue([])
    })

    test('soloProjectData is null when no solo projects are returned (Test case 2)', async () => {
        getSoloProjectsByDiscordId.mockResolvedValue([])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.soloProjectData).toBeNull()
        expect(ctx.soloProjectTier).toBe('N/A')
    })

    test('soloProjectData is set from the first solo project record (Test cases 3–7)', async () => {
        getSoloProjectsByDiscordId.mockResolvedValue([
            makeRecord({ 'GitHub ID': 'ghuser123', Tier: 'Tier 2' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.soloProjectData['GitHub ID']).toBe('ghuser123')
    })

    test('soloProjectTier is derived from the Tier field (Test cases 3–7)', async () => {
        getSoloProjectsByDiscordId.mockResolvedValue([
            makeRecord({ Tier: 'Tier 2' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.soloProjectTier).toBe('Tier 2')
    })
})

// ── loadVoyageSignups ─────────────────────────────────────────────────────────

describe('MemberContext.loadVoyageSignups', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getApplicationsByDiscordId.mockResolvedValue([])
        getSoloProjectsByDiscordId.mockResolvedValue([])
    })

    test('currentVoyageSignupData is null when no signups exist (Test case 11)', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.currentVoyageSignupData).toBeNull()
        expect(ctx.nextVoyageSignupData).toBeNull()
    })

    test('currentVoyageSignupData is set when signup matches currentVoyage', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([
            makeRecord({ Voyage: CURRENT_VOYAGE, Email: EMAIL, 'Discord Name': DISCORD_USERNAME, 'Team Name': 'Tier 1' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.currentVoyageSignupData).not.toBeNull()
        expect(ctx.currentVoyageSignupData.Voyage).toBe(CURRENT_VOYAGE)
    })

    test('nextVoyageSignupData is set when signup matches nextVoyage', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([
            makeRecord({ Voyage: NEXT_VOYAGE, Email: EMAIL, 'Team Name': 'Tier 2', 'Confirmation Form Completed': 'Yes' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.nextVoyageSignupData).not.toBeNull()
    })

    // Test case 15: Tier and Role, but no Team assigned
    test('currentVoyageSignupTierTeam is "Name, No Team" when Team Name set but Team No. absent (Test case 15)', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([
            makeRecord({ Voyage: CURRENT_VOYAGE, 'Team Name': 'Tier 3', Role: 'Developer' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.currentVoyageSignupTierTeam).toBe('Tier 3, No Team')
        expect(ctx.currentVoyageSignupRole).toBe('Developer')
    })

    // Test case 16: Tier, Role, and assigned to a Team
    test('currentVoyageSignupTierTeam is "Name, Team N" when Team No. is assigned (Test case 16)', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([
            makeRecord({ Voyage: CURRENT_VOYAGE, 'Team Name': 'Tier 3', 'Team No.': '5', Role: 'Developer' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.currentVoyageSignupTierTeam).toBe('Tier 3, Team 5')
        expect(ctx.currentVoyageSignupRole).toBe('Developer')
    })

    test('currentVoyageSignupTierTeam is N/A when no current voyage signup exists', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.currentVoyageSignupTierTeam).toBe('N/A')
        expect(ctx.currentVoyageSignupRole).toBe('N/A')
    })

    // Test case 4: Commitment form completed (next voyage signup)
    test('commitmentFormText has check emoji when Confirmation Form Completed is Yes (Test case 4)', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([
            makeRecord({ Voyage: NEXT_VOYAGE, 'Team Name': 'Tier 1', 'Confirmation Form Completed': 'Yes' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.commitmentFormText).toContain(CHECK_EMOJI)
        expect(ctx.commitmentFormText).toContain('Yes')
    })

    // Test cases 5 & 7: Commitment form not completed
    test('commitmentFormText has :x: link when Confirmation Form not completed (Test cases 5 & 7)', async () => {
        getCurrentAndNextVoyage.mockResolvedValue({ currentVoyage: CURRENT_VOYAGE, nextVoyage: NEXT_VOYAGE })
        getAllVoyageSignupsByDiscordId.mockResolvedValue([
            makeRecord({ Voyage: NEXT_VOYAGE, 'Team Name': 'Tier 2', 'Confirmation Form Completed': 'No' })
        ])
        const ctx = await MemberContext.create(makeInteraction(), DISCORD_ID)
        expect(ctx.commitmentFormText).toContain('No :x:')
    })
})

// ── getStatusMatchText ────────────────────────────────────────────────────────

describe('MemberContext.getStatusMatchText', () => {
    test('returns Match when current voyage signup email matches application email', () => {
        const ctx = buildContext({
            applicationData: { Email: EMAIL, 'Discord Name': DISCORD_USERNAME },
            currentVoyageSignupData: { Email: EMAIL, 'Discord Name': DISCORD_USERNAME }
        })
        expect(ctx.getStatusMatchText('Email')).toBe(`Match ${CHECK_EMOJI}`)
    })

    test('returns Match when next voyage signup email matches application email', () => {
        const ctx = buildContext({
            applicationData: { Email: EMAIL },
            currentVoyageSignupData: null,
            nextVoyageSignupData: { Email: EMAIL }
        })
        expect(ctx.getStatusMatchText('Email')).toBe(`Match ${CHECK_EMOJI}`)
    })

    test('returns Mismatch (Current Voyage) when current signup email differs from application', () => {
        const ctx = buildContext({
            applicationData: { Email: EMAIL },
            currentVoyageSignupData: { Email: 'other@example.com' }
        })
        expect(ctx.getStatusMatchText('Email')).toBe('Mismatch :x: (Current Voyage)')
    })

    test('returns Mismatch (Next Voyage) when only next signup email differs from application', () => {
        const ctx = buildContext({
            applicationData: { Email: EMAIL },
            currentVoyageSignupData: null,
            nextVoyageSignupData: { Email: 'other@example.com' }
        })
        expect(ctx.getStatusMatchText('Email')).toBe('Mismatch :x: (Next Voyage)')
    })

    test('returns N/A when neither current nor next voyage signup exists', () => {
        const ctx = buildContext({
            applicationData: { Email: EMAIL },
            currentVoyageSignupData: null,
            nextVoyageSignupData: null
        })
        expect(ctx.getStatusMatchText('Email')).toBe('N/A')
    })

    test('works for Discord Name field', () => {
        const ctx = buildContext({
            applicationData: { 'Discord Name': DISCORD_USERNAME },
            currentVoyageSignupData: { 'Discord Name': DISCORD_USERNAME }
        })
        expect(ctx.getStatusMatchText('Discord Name')).toBe(`Match ${CHECK_EMOJI}`)
    })

    test('returns Mismatch (Current Voyage) when Discord Name differs', () => {
        const ctx = buildContext({
            applicationData: { 'Discord Name': DISCORD_USERNAME },
            currentVoyageSignupData: { 'Discord Name': 'differentuser' }
        })
        expect(ctx.getStatusMatchText('Discord Name')).toBe('Mismatch :x: (Current Voyage)')
    })
})
