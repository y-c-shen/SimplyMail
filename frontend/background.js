// Listens to when tabs change

// gmail example link:
// https://mail.google.com/mail/u/0/#inbox/FMfcgzQZSsNLwLCNlpsqGXFdNKpHBTdL
// emailId <- FMfcgzQZSsNLwLCNlpsqGXFdNKpHBTdL
// sends the message when a new gmail tab is opened

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("mail.google.com/mail")) {
    const emailId = tab.url.split("#")[1].split('/')[1];

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      emailId: emailId,
    });
  }
});

console.log("background.js ran")