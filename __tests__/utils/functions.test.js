vi.mock('../../handlers/airtable.js', () => ({
    base: vi.fn()
}))

import { base } from '../../handlers/airtable.js'
import { getCurrentAndPriorVoyage, selectVoyageForClosureInfo } from '../../utils/functions.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Minimal Airtable Schedules record. Omitting sprint5 mirrors Airtable, which
 *  leaves empty fields out of `record.fields` entirely. */
function makeScheduleRecord(name, startDate, endDate, sprint5StartDate) {
    const fields = { Name: name, 'Start Date': startDate, 'End Date': endDate }
    if (sprint5StartDate !== undefined) {
        fields['Sprint 5 Start Date'] = sprint5StartDate
    }
    return { fields }
}

/** Make base('Schedules').select(...).firstPage() resolve to `records`. */
function mockSchedules(records) {
    const firstPage = vi.fn().mockResolvedValue(records)
    const select = vi.fn(() => ({ firstPage }))
    base.mockReturnValue({ select })
    return { select, firstPage }
}

const V50 = makeScheduleRecord('V50', '2026-01-05', '2026-02-15', '2026-02-02')
const V51 = makeScheduleRecord('V51', '2026-03-02', '2026-04-12', '2026-03-30')
const V52 = makeScheduleRecord('V52', '2026-05-25', '2026-07-05', '2026-06-22')
const V53 = makeScheduleRecord('V53', '2026-07-20', '2026-08-30', '2026-08-17')

const SCHEDULE = [V50, V51, V52, V53]

// ── getCurrentAndPriorVoyage ──────────────────────────────────────────────────

describe('getCurrentAndPriorVoyage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers({ toFake: ['Date'] })
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test('requests the Sprint 5 Start Date field from the Schedules table', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        const { select } = mockSchedules(SCHEDULE)

        await getCurrentAndPriorVoyage()

        expect(base).toHaveBeenCalledWith('Schedules')
        expect(select).toHaveBeenCalledWith(expect.objectContaining({
            fields: expect.arrayContaining(['Sprint 5 Start Date'])
        }))
    })

    test('during a voyage, returns it as current and the one before it as prior', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules(SCHEDULE)

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.number).toBe('V52')
        expect(priorVoyage.number).toBe('V51')
    })

    test('returns voyage objects with parsed dates, not just names', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules(SCHEDULE)

        const { currentVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.startDate).toEqual(new Date('2026-05-25'))
        expect(currentVoyage.endDate).toEqual(new Date('2026-07-05'))
        expect(currentVoyage.sprint5StartDate).toEqual(new Date('2026-06-22'))
    })

    test('between voyages, current is null and prior is the most recently started voyage', async () => {
        vi.setSystemTime(new Date('2026-07-10T12:00:00Z'))
        mockSchedules(SCHEDULE)

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage).toBeNull()
        expect(priorVoyage.number).toBe('V52')
    })

    test('during the first voyage, prior is null', async () => {
        vi.setSystemTime(new Date('2026-01-10T12:00:00Z'))
        mockSchedules(SCHEDULE)

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.number).toBe('V50')
        expect(priorVoyage).toBeNull()
    })

    test('before any voyage has started, both are null', async () => {
        vi.setSystemTime(new Date('2025-12-01T12:00:00Z'))
        mockSchedules(SCHEDULE)

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage).toBeNull()
        expect(priorVoyage).toBeNull()
    })

    test('with no voyages at all, both are null', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules([])

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage).toBeNull()
        expect(priorVoyage).toBeNull()
    })

    test('when voyages overlap, the most recently started one is current', async () => {
        vi.setSystemTime(new Date('2026-07-02T12:00:00Z'))
        const overlapping = makeScheduleRecord('V53', '2026-06-29', '2026-08-09', '2026-07-27')
        mockSchedules([V51, V52, overlapping])

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.number).toBe('V53')
        expect(priorVoyage.number).toBe('V52')
    })

    test('handles schedule records returned out of date order', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules([V53, V50, V52, V51])

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.number).toBe('V52')
        expect(priorVoyage.number).toBe('V51')
    })

    test('ignores V99, V999 and X-prefixed test voyages', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules([
            V51,
            V52,
            makeScheduleRecord('V99', '2026-06-01', '2026-07-30'),
            makeScheduleRecord('V999', '2026-06-10', '2026-07-30'),
            makeScheduleRecord('X1', '2026-06-12', '2026-07-30'),
        ])

        const { currentVoyage, priorVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.number).toBe('V52')
        expect(priorVoyage.number).toBe('V51')
    })

    // Airtable omits blank fields, so the value arrives as undefined.
    test('sets sprint5StartDate to null when the field is blank in Airtable', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules([V51, makeScheduleRecord('V52', '2026-05-25', '2026-07-05')])

        const { currentVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.sprint5StartDate).toBeNull()
    })

    test('sets sprint5StartDate to null when the field is an empty string', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules([V51, makeScheduleRecord('V52', '2026-05-25', '2026-07-05', '')])

        const { currentVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.sprint5StartDate).toBeNull()
    })

    test('sets sprint5StartDate to null when the field is not a valid date', async () => {
        vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))
        mockSchedules([V51, makeScheduleRecord('V52', '2026-05-25', '2026-07-05', 'not-a-date')])

        const { currentVoyage } = await getCurrentAndPriorVoyage()

        expect(currentVoyage.sprint5StartDate).toBeNull()
    })
})

// ── selectVoyageForClosureInfo ────────────────────────────────────────────────

describe('selectVoyageForClosureInfo', () => {
    const NOW = new Date('2026-06-15T12:00:00Z')
    const prior = { number: 'V51', sprint5StartDate: new Date('2026-03-30') }
    const makeCurrent = (sprint5StartDate) => ({ number: 'V52', sprint5StartDate })

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(NOW)
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test('returns the prior voyage when there is no current voyage', () => {
        expect(selectVoyageForClosureInfo(null, prior)).toBe(prior)
    })

    test('returns null when there is neither a current nor a prior voyage', () => {
        expect(selectVoyageForClosureInfo(null, null)).toBeNull()
    })

    test('returns the current voyage once its Sprint 5 has started', () => {
        const current = makeCurrent(new Date('2026-06-08'))
        expect(selectVoyageForClosureInfo(current, prior)).toBe(current)
    })

    test('returns the current voyage on the exact moment Sprint 5 starts', () => {
        const current = makeCurrent(new Date(NOW))
        expect(selectVoyageForClosureInfo(current, prior)).toBe(current)
    })

    test('returns the prior voyage before the current voyage reaches Sprint 5', () => {
        const current = makeCurrent(new Date('2026-06-22'))
        expect(selectVoyageForClosureInfo(current, prior)).toBe(prior)
    })

    test('falls back to the current voyage before Sprint 5 when there is no prior voyage', () => {
        const current = makeCurrent(new Date('2026-06-22'))
        expect(selectVoyageForClosureInfo(current, null)).toBe(current)
    })

    test('returns the prior voyage when the current voyage has no Sprint 5 date', () => {
        const current = makeCurrent(null)
        expect(selectVoyageForClosureInfo(current, prior)).toBe(prior)
    })

    test('falls back to the current voyage when it has no Sprint 5 date and there is no prior voyage', () => {
        const current = makeCurrent(null)
        expect(selectVoyageForClosureInfo(current, null)).toBe(current)
    })
})
