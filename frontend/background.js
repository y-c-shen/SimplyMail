const GOOGLE_SAFE_BROWSING_API_KEY = 'apikey'

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
            threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            platformTypes: ["WINDOWS"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url: url }]
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return [!result.matches, result.matches ? "⚠️ Google Safe Browsing detected threats!" : "✅ URL is safe according to Google Safe Browsing."];
    } catch (error) {
        console.error('Error in checkGoogleSafeBrowsing:', error);
        return [true, `Unable to check Google Safe Browsing: ${error.message}`];
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
    try {
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

        return allSafe;
    } catch (error) {
        console.error('Error in isSafeUrl:', error);
        return false;
    }
}

// Message listeners
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkUrlSafety') {
        isSafeUrl(request.url)
            .then(isSafe => {
                console.log(`URL safety check result: ${isSafe}`);
                sendResponse({ isSafe });
            })
            .catch(error => {
                console.error('Error in checkUrlSafety handler:', error);
                sendResponse({ isSafe: false, error: error.message });
            });
        return true; // Keep message channel open for async response
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url && changeInfo.url.includes("mail.google.com/mail")) {
        try {
            const emailId = changeInfo.url.split("#")[1].split('/')[1];
            chrome.tabs.sendMessage(tabId, {
                type: "NEW",
                emailId: emailId,
            });
        } catch (error) {
            console.error('Error in tabs.onUpdated handler:', error);
        }
    }
});

console.log("Background script loaded successfully");