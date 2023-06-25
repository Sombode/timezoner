const timeRegex = /(\d{1,2}):(\d{2})(?::(\d{2}))?(?!\d)(\s*(?:[ap]m))?/gi;
const documentHTML = document.body.innerHTML;
var siteTime, userTime, targetTime;

const zoneToOffset = {
    "pst": -7,
    "mst": -6,
    "cst": -5,
    "est": -4,
    "utc": 0,
    "bst": 1,
    "msk": 3,
    "ist": 5.5,
    "jst": 9,
    "cest": 2,
    "aest": 10,
    "nzst": 12
};

const offsetToZone = {
    "-7": "pst",
    "-6": "mst",
    "-5": "cst",
    "4": "est",
    "0": "utc",
    "1": "bst",
    "3": "msk",
    "5.5": "ist",
    "9": "jst",
    "2": "cest",
    "10": "aest",
    "12": "nzst"
};

function detectTimeZone() {
    const pstMatches = [(documentHTML.match(/([Pp]acific (([Ss]tandard|[Dd]aylight) )?[Tt]ime)|PST|PDT|((UTC)|(utc)|(GMT)|(gmt))\s?-7/g) || []).length,"pst"];
    const mstMatches = [(documentHTML.match(/([Mm]ountain (([Ss]tandard|[Dd]aylight) )?[Tt]ime)|MST|MDT|((UTC)|(utc)|(GMT)|(gmt))\s?-6/g) || []).length,"mst"];
    const cstMatches = [(documentHTML.match(/([Cc]entral (([Ss]tandard|[Dd]aylight) )?[Tt]ime)|CST|CDT|((UTC)|(utc)|(GMT)|(gmt))\s?-5/g) || []).length,"cst"];
    const estMatches = [(documentHTML.match(/([Ee]astern (([Ss]tandard|[Dd]aylight) )?[Tt]ime)|EST|EDT|((UTC)|(utc)|(GMT)|(gmt))\s?-4/g) || []).length,"est"];
    const utcMatches = [(documentHTML.match(/([Cc]oordinated [Uu]niversal [Tt]ime)|([Gg]reenwich [Mm]ean [Tt]ime)|((\bUTC)|(\butc)|(\bGMT)|(\bgmt))\s?[+-]?0?(?!\s?[+-][1-9])/g) || []).length,"utc"];
    const bstMatches = [(documentHTML.match(/([Bb]ritish [Ss]ummer [Tt]ime)|BST|((UTC)|(utc)|(GMT)|(gmt))\s?\+1/g) || []).length,"bst"];
    const mskMatches = [(documentHTML.match(/([Mm]oscow [Ss]tandard [Tt]ime)|MSK|((UTC)|(utc)|(GMT)|(gmt))\s?\+3/g) || []).length,"msk"];
    const istMatches = [(documentHTML.match(/([Ii]ndian [Ss]tandard [Tt]ime)|IST|((UTC)|(utc)|(GMT)|(gmt))\s?\+0?5:30/g) || []).length,"ist"];
    const jstMatches = [(documentHTML.match(/([Jj]apan [Ss]tandard [Tt]ime)|JST|((UTC)|(utc)|(GMT)|(gmt))\s?\+9/g) || []).length,"jst"];
    const cestMatches = [(documentHTML.match(/([Cc]entral [Ee]uropean (([Ss]ummer|[Dd]aylight) )?[Tt]ime)|CEST|CEDT|CET|((UTC)|(utc)|(GMT)|(gmt))\s?\+2/g) || []).length,"cest"];
    const aestMatches = [(documentHTML.match(/([Aa]ustralian [Ee]astern (([Ss]tandard|[Dd]aylight) )?[Tt]ime)|AEST|AEDT|((UTC)|(utc)|(GMT)|(gmt))\s?\+10/g) || []).length,"aest"];
    const nzstMatches = [(documentHTML.match(/([Nn]ew [Zz]ealand (([Ss]tandard|[Dd]aylight) )?[Tt]ime)|NZST|NZDT|((UTC)|(utc)|(GMT)|(gmt))\s?\+12/g) || []).length,"nzst"];
    const allMatches = [pstMatches, mstMatches, cstMatches, estMatches, utcMatches, bstMatches, cestMatches, mskMatches, istMatches, jstMatches, aestMatches, nzstMatches];
    allMatches.sort((a, b) => b[0] - a[0]);
    console.log(allMatches);
    if (allMatches[0][0] <= 0) {
        // No specific timezone found
        return null;
    } else {
        return allMatches[0][1];
    }
}

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
    splitTime[1].length != 2 || splitTime[2].length != 2 || // If any of the parts don't meet length requirements
    documentHTML.indexOf('>',time[2]) < documentHTML.indexOf('<',time[2])) return false; // If the time is inside of an HTML tag
    return true;
}

function openTimeCard(e) {
    targetTime = e.target;
    const timeCard = document.getElementById("timezoner-popup-wrapper");
    const targetLoc = targetTime.getBoundingClientRect();
    timeCard.style.top = `${targetLoc.bottom}px`;
    timeCard.style.left = `${targetLoc.left}px`;
    timeCard.style.display = "block";
    document.getElementById("timezoner-original-time").innerText = targetTime.getAttribute("base");
    const timeZone = targetTime.getAttribute("time-zone");
    if (timeZone === "default") {
        if (siteTime === null) {
            document.getElementsByClassName("timezoner-dropdown")[0].value = 0;
        } else {
            document.getElementsByClassName("timezoner-dropdown")[0].value = zoneToOffset[siteTime];
        }
    } else {

    }
}

siteTime = detectTimeZone();
chrome.storage.sync.get("userTimeZone").then((result) => {
    userTime = result.userTimeZone;
    document.getElementsByClassName("timezoner-user-time").innerText = offsetToZone[userTime.toString()].toUpperCase();
});
chrome.storage.onChanged.addListener(() => {
    chrome.storage.sync.get("userTimeZone").then((result) => {
        userTime = result.userTimeZone;
        document.getElementsByClassName("timezoner-user-time").innerText = offsetToZone[userTime.toString()].toUpperCase();
    });
});

// Inject CSS for formatted times
timezonerCSS = document.createElement("style");
timezonerCSS.innerText = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');.timezoner-formattable-time{text-decoration:underline rgba(103,193,129,0.5) 4px;transition:.25s}.timezoner-formattable-time:hover{text-decoration:underline rgba(103,193,129,1) 4px}#timezoner-popup-card{outline-style:solid;outline-color:#479a5f;border-radius:8px;color:#fff;font-family:Inter;font-size:14px;font-weight:700}#timezoner-popup-wrapper{display:none;z-index:1000000;position:fixed;top:20px;left:305px;padding:15px;width:fit-content;height:fit-content}#timezoner-popup-wrapper:hover{display:block !important}#timezoner-card-top{padding:5px 12px;background:#67c181;user-select:none}#timezoner-dropdowns{padding:5px 12px 12px;background:#67c181;user-select:none}.timezoner-user-time{padding:5px;user-select:none;border-none;border-radius:4px;font:inherit;color:inherit;outline:0}.timezoner-dropdown{border:none;border-radius:4px;font:inherit;color:inherit;background:#479a5f;outline:0}.timezoner-dropdown>option{font:inherit;font-weight:400}#timezoner-remove-conversion{color:#000;background-color:#fff;padding:10px;border-width:0 3px 3px;border-radius:0 0 8px 8px;user-select:none}#timezoner-remove-conversion:hover{background-color:#e6e6e6}";
document.head.appendChild(timezonerCSS);

// Create the time popup card
popupCardWrapper = document.createElement("div");
popupCardWrapper.setAttribute("id", "timezoner-popup-wrapper");
popupCardWrapper.innerHTML = "<div id='timezoner-popup-card'> <div id='timezoner-card-top'> <span id='timezoner-original-time'>6:30:00 AM</span> -> <span id='timezoner-converted-time'>9:30:00 AM</span> </div><div id='timezoner-dropdowns'> <select class='timezoner-dropdown'> <option value=-7>PST</option> <option value=-6>MST</option> <option value=-5>CST</option> <option value=-4>EST</option> <option value=0>UTC</option> <option value=1>BST</option> <option value=2>CEST</option> <option value=3>MSK</option> <option value=5.5>IST</option> <option value=9>JST</option> <option value=10>AEST</option> <option value=12>NZST</option> </select> -> <span class='timezoner-user-time'>UTC</span></div><div id='timezoner-remove-conversion'>Don't convert this</div></div>";
document.body.appendChild(popupCardWrapper);

// Locate times on the website
const baseTimes = findTimes();
console.log(baseTimes)

if (baseTimes.length > 50) {
    console.warn("Large amount of times found! No times will be automatically converted.");
} else {
    // Replace times with a formatted span
    var replaceOffset = 0;
    baseTimes.forEach(time => {
        if (validateTime(time[0], time[2])) {
            const spanCode = `<span class='timezoner-formattable-time', base='${time[0]}', time-zone='default'>${time[0]}</span>`;
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
}