chrome.storage.sync.get("userTimeZone").then((result) => {
    document.getElementById("timezoner-dropdown").value = result.userTimeZone;
});
document.getElementById("timezoner-dropdown").addEventListener("click", (event) => {
    chrome.storage.sync.set({userTimeZone: event.target.value});
});