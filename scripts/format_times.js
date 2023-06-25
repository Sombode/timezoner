const meridiemTimeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)\s*(?:am|pm|\b\d{2}:\d{2}(?::\d{2})?\b)/gi;
const normalTimeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)(?!(\s[ap]m))/gi;
const verbalTimeRegex = /(half past|quarter past|quarter to)\s+(\d{1,2})/gi; // Can (partially) interpret more verbose statements of time, such as "half past 12"

function matchWithPosition(content, regex) {
    const outputPairs = [];
    while (null !== (match = regex.exec(content))) { outputPairs.push([match[0], match.index, regex.lastIndex]); }
    return outputPairs;
}

function findTimes() {
    // Originally planned to leverage spaCy in order to detect times with NER (token classification), but that approach became too unwieldy to implement
    // and too unreliable with certain formats, so now times are detected through regex expressions
    var searchContent = document.body.innerHTML;
    const foundTimes = [];
    // TODO: Words to numbers preprocess searchContent
    // consider document ranges???
    foundTimes.push(...matchWithPosition(searchContent, normalTimeRegex));
    foundTimes.push(...matchWithPosition(searchContent, meridiemTimeRegex));
    foundTimes.push(...matchWithPosition(searchContent, verbalTimeRegex));
    return foundTimes;
}

function convertTime(time) {
    // Converting to a standard format, being military time (NOT actually converting between timezones here)
    var hours, minutes, seconds;
    const splitTime = time.replace(/((?!:)\D)/g,"").split(":"); // Remove everything but numbers and colons then separate into units by splitting across colons
    hours = splitTime[0];
    minutes = splitTime[1];
    seconds = (splitTime[2] ? splitTime[2] : "00");
    if (time.includes("pm")) hours = (parseInt(hours) + 12).toString(); // Only need to check for PM when converting to military time, AM stays the same
    hours = hours.padStart(2, "0")
    return hours + ":" + minutes + ":" + seconds
}

function validateTime(time) {
    const splitTime = time.replace(/((?!:)\D)/g,"").split(":");
    if (parseInt(splitTime[0]) > 24 || parseInt(splitTime[1]) > 59 || parseInt(splitTime[2]) > 59) return false // If any of the parts of outside of their maximum value
    if (splitTime[1].length != 2 || splitTime[2].length != 2) return false // If any of the parts don't meet length requirements
    return true
}

const baseTimes = findTimes();
console.log(baseTimes)
baseTimes.forEach(time => {
    console.log(time[0] + " => " + convertTime(time[0]))
});