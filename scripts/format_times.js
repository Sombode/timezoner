const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)(\s*(?:[ap]m))?/gi;
const documentHTML = document.body.innerHTML

function matchWithPosition(content, regex) {
    const outputPairs = [];
    while (null !== (match = regex.exec(content))) { outputPairs.push([match[0], match.index, regex.lastIndex]); }
    return outputPairs;
}

function findTimes() {
    // Originally planned to leverage spaCy in order to detect times with NER (token classification), but that approach became too unwieldy to implement
    // and too unreliable with certain formats, so now times are detected through regex expressions
    const foundTimes = [];
    // TODO: Words to numbers preprocess searchContent
    // consider document ranges???
    foundTimes.push(...matchWithPosition(documentHTML, timeRegex));
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
    hours = hours.padStart(2, "0");
    return hours + ":" + minutes + ":" + seconds;
}

function validateTime(time, end) {
    time = convertTime(time);
    const splitTime = time.replace(/((?!:)\D)/g,"").split(":");
    if (parseInt(splitTime[0]) > 24 || parseInt(splitTime[1]) > 59 || parseInt(splitTime[2]) > 59 || // If any of the parts of outside of their maximum value
    splitTime[1].length != 2 || splitTime[2].length != 2) return false; // If any of the parts don't meet length requirements
    while (documentHTML.charAt(end) !== '<') { if (documentHTML.charAt(end) == '>') return false; end++; } // Checks if the time is inside of an HTML tag, if so, then don't change it
    return true;
}

function openTimeCard(e) {
    const timeCard = document.getElementById("timezoner-popup-wrapper");
    const targetLoc = e.target.getBoundingClientRect();
    timeCard.style.top = `${targetLoc.bottom}px`;
    timeCard.style.left = `${targetLoc.left}px`;
    timeCard.style.display = "block";
}

// Inject CSS for formatted times
timezonerCSS = document.createElement("style");
timezonerCSS.innerText = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');.timezoner-formattable-time{text-decoration:underline rgba(103,193,129,0.5) 4px;transition:.25s}.timezoner-formattable-time:hover{text-decoration:underline rgba(103,193,129,1) 4px}#timezoner-popup-card{outline-style:solid;outline-color:#479a5f;border-radius:8px;color:#fff;font-family:Inter;font-size:14px;font-weight:700}#timezoner-popup-wrapper{display:none;z-index:1000000;position:fixed;top:20px;left:305px;padding:15px;width:fit-content;height:fit-content}#timezoner-popup-wrapper:hover{display:block !important}#timezoner-card-top{padding:5px 12px;background:#67c181;user-select:none}#timezoner-dropdowns{padding:5px 12px 12px;background:#67c181;user-select:none}#timezoner-dropdown{border:none;border-radius:4px;font:inherit;color:inherit;background:#479a5f;outline:0}#timezoner-dropdown>option{font:inherit;font-weight:400}#timezoner-remove-conversion{color:#000;background-color:#fff;padding:10px;border-width:0 3px 3px;border-radius:0 0 8px 8px;user-select:none}#timezoner-remove-conversion:hover{background-color:#e6e6e6}";
document.head.appendChild(timezonerCSS);

// Create the time popup card
popupCardWrapper = document.createElement("div");
popupCardWrapper.setAttribute("id", "timezoner-popup-wrapper");
popupCardWrapper.innerHTML = "<div id='timezoner-popup-card'> <div id='timezoner-card-top'> <span id='timezoner-original-time'>6:30:00 AM</span> -> <span id='timezoner-converted-time'>9:30:00 AM</span> </div><div id='timezoner-dropdowns'> <select id='timezoner-dropdown'> <option value=-7>PDT</option> <option value=-6>MDT</option> <option value=-5>CDT</option> <option value=-4>EDT</option> <option value=-3>UTC-3</option> <option value=0>UTC</option> <option value=1>BST</option> <option value=2>CEST</option> <option value=3>MSK</option> <option value=4>UTC+4</option> <option value=5.5>IST</option> <option value=8>UTC+8</option> <option value=9>JST</option> <option value=10>AEST</option> <option value=12>NZST</option> </select> -> <select id='timezoner-dropdown'> <option value=-7>PDT</option> <option value=-6>MDT</option> <option value=-5>CDT</option> <option value=-4>EDT</option> <option value=-3>UTC-3</option> <option value=0>UTC</option> <option value=1>BST</option> <option value=2>CEST</option> <option value=3>MSK</option> <option value=4>UTC+4</option> <option value=5.5>IST</option> <option value=8>UTC+8</option> <option value=9>JST</option> <option value=10>AEST</option> <option value=12>NZST</option> </select> </div><div id='timezoner-remove-conversion'>Don't convert this</div></div>";
document.body.appendChild(popupCardWrapper);

// Locate times on the website
const baseTimes = findTimes();
console.log(baseTimes)

// Replace times with a formatted span
var replaceOffset = 0;
baseTimes.forEach(time => {
    if (validateTime(time[0], time[2])) {
        const spanCode = `<span class='timezoner-formattable-time', base='${time[0]}', time-zone='CST'>${time[0]}</span>`;
        document.body.innerHTML = (document.body.innerHTML.substring(0, time[1]+replaceOffset) + spanCode + document.body.innerHTML.substring(time[2]+replaceOffset,document.body.innerHTML.length));
        replaceOffset += spanCode.length - time[0].length + 3;
        //console.log(time[0] + " => " + convertTime(time[0]))
    }
});

// Add listeners to move the time popup
const formattedTimes = document.getElementsByClassName("timezoner-formattable-time");
for (time of formattedTimes) {
    time.addEventListener("mouseover", openTimeCard);
    time.addEventListener("mouseout", () => {
        document.getElementById("timezoner-popup-wrapper").style.display = "none";
    });
}