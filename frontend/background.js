const GOOGLE_SAFE_BROWSING_API_KEY = 'Api_Key'

async function getRedirectChain(url, maxRedirects = 10) {
    const redirectChain = [];

    try {
        let currentUrl = url;

        for (let i = 0; i < maxRedirects; i++) {
            const response = await fetch(currentUrl, {
                method: 'HEAD',
                mode: 'no-cors',
                redirect: 'follow'
            });

            redirectChain.push(currentUrl);

            if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
                let nextUrl = response.headers.get('location');

                // Handle relative URLs
                if (!nextUrl.startsWith('http')) {
                    const urlObj = new URL(currentUrl);
                    nextUrl = `${urlObj.protocol}//${urlObj.host}${nextUrl}`;
                }

                currentUrl = nextUrl;
            } else {
                break;
            }
        }

        return redirectChain;
    } catch (error) {
        return [url, `Error: ${error.message}`];
    }
}

async function checkGoogleSafeBrowsing(url) {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`;

    const payload = {
        client: {
            clientId: "url_checker",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.matches) {
            return [false, "⚠️ Google Safe Browsing detected threats!"];
        }
        return [true, "✅ URL is safe according to Google Safe Browsing."];
    } catch (error) {
        return [false, `Error checking Google Safe Browsing: ${error.message}`];
    }
}

async function checkPhishtank(url) {
    try {
        const response = await fetch(`https://checkurl.phishtank.com/checkurl/?url=${encodeURIComponent(url)}`);
        const text = await response.text();

        if (text.includes('valid')) {
            return [false, "⚠️ Phishing site detected by PhishTank!"];
        }
        return [true, "✅ URL is not in PhishTank."];
    } catch (error) {
        return [false, `Error checking PhishTank: ${error.message}`];
    }
}

async function checkRedirectSafety(redirectChain) {
    const results = [];

    for (const url of redirectChain) {
        if (typeof url === 'string' && !url.startsWith('Error')) {
            const [gsbSafe, gsbMessage] = await checkGoogleSafeBrowsing(url);
            const [phishSafe, phishMessage] = await checkPhishtank(url);

            results.push({
                url,
                safe: gsbSafe && phishSafe,
                messages: [gsbMessage, phishMessage]
            });
        } else {
            results.push({
                url,
                safe: false,
                messages: ["Error occurred during redirect check"]
            });
        }
    }

    return results;
}

async function isSafeUrl(url) {
    console.log(`Checking initial URL: ${url}`);

    const redirectChain = await getRedirectChain(url);
    console.log("\nRedirect chain:");
    redirectChain.forEach((redirectUrl, i) => {
        console.log(`${i + 1}. ${redirectUrl}`);
    });

    console.log("\nChecking safety of each URL in the redirect chain:");
    const safetyResults = await checkRedirectSafety(redirectChain);

    let allSafe = true;
    for (const result of safetyResults) {
        console.log(`\nChecking: ${result.url}`);
        result.messages.forEach(message => console.log(message));
        if (!result.safe) {
            allSafe = false;
        }
    }

    if (!allSafe) {
        return false;
    }
    return true;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message in background:", request);

  if (request.action === 'checkUrlSafety') {
    console.log("Checking URL:", request.url);

    isSafeUrl(request.url)
      .then(isSafe => sendResponse({ isSafe }))
      .catch(error => sendResponse({ error: error.message }));
    
    // Return true to keep the message channel open until the response is sent
    return true;
  }
});

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
