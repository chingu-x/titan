const {base} = require("../handlers/airtable");

async function getVoyages() {
    const voyages = await base('Schedules').select({
        view: 'Voyages',
        fields: ['Name', 'Start Date', 'End Date']
    }).firstPage();

    return voyages.map(voyage => ({
        number: voyage.fields['Name'],
        startDate: new Date(voyage.fields['Start Date']),
        endDate: new Date(voyage.fields['End Date'])
    })).filter(voyage => voyage.number !== 'V999').sort((a, b) => a.startDate - b.startDate);
}

async function getCurrentAndNextVoyage() {
    const voyages = await getVoyages();
    const currentDate = new Date();

    let currentVoyage = null;
    let nextVoyage = null;

    for (let i = 0; i < voyages.length; i++) {
        const voyage = voyages[i];
        if (voyage.number[0] === 'X') {
            continue;
        }
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

module.exports = {
    getCurrentAndNextVoyage
}