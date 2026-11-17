import { getCurrentAndNextVoyage } from '../utils/functions.js';

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

export { getNextVoyage, nextVoyageNumber };
