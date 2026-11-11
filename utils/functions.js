const {base} = require("../handlers/airtable");

async function getVoyages() {
    const voyages = await base('Schedules').select({
        view: 'Voyages',
        fields: ['Name', 'Start Date', 'End Date', 'Sprint 5 Start Date']
    }).firstPage();

    return voyages.map(voyage => ({
        number: voyage.fields['Name'],
        startDate: new Date(voyage.fields['Start Date']),
        endDate: new Date(voyage.fields['End Date']),
        sprint5StartDate: new Date(voyage.fields['Sprint 5 Start Date'])
    })).filter(voyage =>
        voyage.number !== 'V999' &&
        voyage.number !== 'V99' &&
        voyage.number[0] !== 'X'
    ).sort((a, b) => a.startDate - b.startDate);
}

async function getCurrentAndNextVoyage() {
    const voyages = await getVoyages();
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

async function getCurrentAndPriorVoyage() {
    // Note that unlike the `getCurrentAndNextVoyage` function above, this
    // function returns the voyage object rather than just the Voyage name.
    const voyages = await getVoyages();
    const sortedVoyages = voyages.reverse()
    const currentDate = new Date();

    let currentVoyage = null;
    let priorVoyage = null;

    for (let i = 0; i < voyages.length; i++) {
        const voyage = voyages[i];
        if (currentDate >= voyage.startDate && currentDate <= voyage.endDate) {
            currentVoyage = voyage;
            priorVoyage = voyages[i + 1] ? voyages[i + 1]: null;
            break;
        } else if (currentDate > voyage.startDate) {
            priorVoyage = voyage;
            break;
        }
    }
    return { currentVoyage, priorVoyage };
}

module.exports = {
    getCurrentAndNextVoyage,
    getCurrentAndPriorVoyage,
}