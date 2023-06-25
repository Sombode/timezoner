document.getElementById("timezoner-dropdown").addEventListener("click", (event) => {
    chrome.storage.sync.set({userTimeZone: event.target.value});
});