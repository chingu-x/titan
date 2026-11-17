import { base } from '../handlers/airtable.js';

// Airtable omits empty fields, so a blank date arrives as undefined.
// Return null for missing or unparseable values rather than an Invalid Date.
function parseOptionalDate(value) {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function getVoyages() {
    const voyages = await base('Schedules').select({
        view: 'Voyages',
        fields: ['Name', 'Start Date', 'End Date', 'Sprint 5 Start Date']
    }).firstPage();

    return voyages.map(voyage => ({
        number: voyage.fields['Name'],
        startDate: new Date(voyage.fields['Start Date']),
        endDate: new Date(voyage.fields['End Date']),
        sprint5StartDate: parseOptionalDate(voyage.fields['Sprint 5 Start Date'])    })).filter(voyage =>
        voyage.number !== 'V999' &&
        voyage.number !== 'V99' &&
        voyage.number[0] !== 'X'
    ).sort((a, b) => a.startDate - b.startDate);
}

// Pass `voyages` (from getVoyages) to reuse a schedule already fetched;
// otherwise the schedule is fetched from Airtable.
async function getCurrentAndNextVoyage(voyages) {
    voyages ??= await getVoyages();
    const currentDate = new Date();

    let currentVoyage = null;
    let nextVoyage = null;

    for (let i = 0; i < voyages.length; i++) {
        const voyage = voyages[i];
        if (currentDate >= voyage.startDate && currentDate <= voyage.endDate) {
            currentVoyage = voyage.number;
            nextVoyage = voyages[i + 1] ? voyages[i + 1].number : null;
            break;
        } else if (currentDate < voyage.startDate) {
            nextVoyage = voyage.number;
            break;
        }
    }
    return { currentVoyage, nextVoyage };
}

// Returns voyage objects (not just names) for use in closure-related methods.
// Pass `voyages` (from getVoyages) to reuse a schedule already fetched;
// otherwise the schedule is fetched from Airtable.
async function getCurrentAndPriorVoyage(voyages) {
    voyages ??= await getVoyages();
    // toReversed() leaves the caller's array untouched so it can be shared.
    const sortedVoyages = voyages.toReversed();
    const currentDate = new Date();

    let currentVoyage = null;
    let priorVoyage = null;

    for (let i = 0; i < sortedVoyages.length; i++) {
        const voyage = sortedVoyages[i];
        if (currentDate >= voyage.startDate && currentDate <= voyage.endDate) {
            currentVoyage = voyage;
            priorVoyage = sortedVoyages[i + 1] ? sortedVoyages[i + 1] : null;
            break;
        } else if (currentDate > voyage.startDate) {
            priorVoyage = voyage;
            break;
        }
    }
    return { currentVoyage, priorVoyage };
}

function selectVoyageForClosureInfo(currentVoyage, priorVoyage) {
    if (currentVoyage === null) {
        return priorVoyage;
    }
    // Without a Sprint 5 date we can't tell whether closure has started,
    // so fall back to the prior voyage.
    const sprint5HasStarted =
        currentVoyage.sprint5StartDate !== null &&
        new Date() >= currentVoyage.sprint5StartDate;
    if (sprint5HasStarted) {
        return currentVoyage;
    }
    return priorVoyage ?? currentVoyage;
}

export {
    getVoyages,
    getCurrentAndNextVoyage,
    getCurrentAndPriorVoyage,
    selectVoyageForClosureInfo,
};
