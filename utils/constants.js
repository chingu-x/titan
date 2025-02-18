const { getCurrentAndNextVoyage } = require('../commands/utility/user.js');

async function getNextVoyage() {
    const { nextVoyage } = await getCurrentAndNextVoyage();
    return nextVoyage;
}

// Fetch the next voyage number and export it
let nextVoyageNumber;
getNextVoyage().then(number => {
    nextVoyageNumber = number;
}).catch(error => {
    console.error('Error fetching next voyage:', error);
});

module.exports = { getNextVoyage, nextVoyageNumber };
