const timeRangeRegex = /(\d{1,2}:\d{2}(?::\d{2})?(?!\d)\s*(?:am|pm|\b\d{2}:\d{2}(?::\d{2})?\b)?)\s*-\s*(\d{1,2}:\d{2}(?::\d{2})?(?!\d)\s*(?:am|pm|\b\d{2}:\d{2}(?::\d{2})?\b)?)/gi;
const meridiemTimeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)\s*(?:am|pm|\b\d{2}:\d{2}(?::\d{2})?\b)/gi;
const normalTimeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)/g;
const verbalTimeRegex = /(half past|quarter past|quarter to)\s+(\d{1,2})/gi; // Can (partially) interpret more verbose statements of time, such as "half past 12"

function findTimes() {
    // Originally planned to leverage spaCy in order to detect times with NER, but that approach became too unwieldy to implement
    // and too unreliable with certain formats, so now formats are detected through regex expressions
    var searchContent = document.body.innerText;
    const foundTimes = [];
    // TODO: Words to numbers preprocess searchContent
    const timeRanges = searchContent.match(timeRangeRegex);
    searchContent = searchContent.replace(timeRangeRegex,""); // Removing all found time ranges from the content to match, so that they aren't detected twice as regular times as well
    const meridiemTimes = searchContent.match(meridiemTimeRegex);
    searchContent = searchContent.replace(meridiemTimeRegex,""); // Same thing above for meridiem times (ones with AM/PM)
    const normalTimes = searchContent.match(normalTimeRegex);
    const verbalTimes = searchContent.match(verbalTimeRegex); // Consider processing here?
    if (timeRanges) foundTimes.push(...timeRanges);
    if (meridiemTimes) foundTimes.push(...meridiemTimes);
    if (normalTimes) foundTimes.push(normalTimes);
    if (verbalTimes) foundTimes.push(verbalTimes);
    return foundTimes;
}

function convertTime(time) {
    // Converting to a standard format, being military time (NOT actually converting between timezones here)
    if (time.match(timeRangeRegex)) {
        // Special handling of ranges
    }
    var hours, minutes, seconds;
    const splitTime = time.replace(/((?!:)\D)/g).split(":"); // Remove everything but numbers and colons then separate into units by splitting across colons
    hours = splitTime[0];
    minutes = splitTime[1];
    seconds = (splitTime[2] ? splitTime[2] : "00");
    if (time.toLowerCase().includes("pm")) hours = (parseInt(hours) + 12).toString(); // Only need to check for PM when converting to military time, AM stays the same
    return hours + ":" + minutes + ":" + seconds
}

const baseTimes = findTimes();
baseTimes.forEach(time => {
    prompt(convertTime(time))
});