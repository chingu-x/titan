// UTC time mappings for each time block (hours in 24-hour format, minutes are always 0)
const TIME_BLOCK_UTC_TIMES = {
    'dawn': { startHour: 22, endHour: 4 },
    'daylight': { startHour: 4, endHour: 10 },
    'twilight': { startHour: 10, endHour: 16 },
    'dusk': { startHour: 16, endHour: 22 }
};

/**
 * Creates a Discord timestamp for a specific UTC hour today
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {number} - Unix timestamp in seconds
 */
function createUTCTimestamp(hour) {
    const now = new Date();
    const timestamp = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0);
    return Math.floor(timestamp / 1000);
}

/**
 * Converts availability string to Discord timestamp format
 * @param {string} availabilityString - e.g., "🌅 Dawn (22:00–04:00 UTC)"
 * @returns {string} - Discord timestamp range e.g., "<t:1234567890:t> - <t:1234567890:t>"
 */
function getDiscordTimestampRange(availabilityString) {
    if (!availabilityString) return 'N/A';

    // Extract the time block name (Dawn, Daylight, Twilight, Dusk)
    const timeBlockMatch = availabilityString.match(/[🌅🌞🌇🌙]\s+(\w+)/);
    if (!timeBlockMatch) return 'N/A';

    const timeBlockName = timeBlockMatch[1].toLowerCase(); // "Dawn" -> "dawn"
    const timeBlock = TIME_BLOCK_UTC_TIMES[timeBlockName];

    if (!timeBlock) return 'N/A';

    const startTimestamp = createUTCTimestamp(timeBlock.startHour);
    const endTimestamp = createUTCTimestamp(timeBlock.endHour);

    return `<t:${startTimestamp}:t> - <t:${endTimestamp}:t>`;
}

module.exports = { getDiscordTimestampRange };
