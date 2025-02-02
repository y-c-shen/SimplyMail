(() => {

let currentEmail = ""

const createSummaryButton = (emailBody, emailId) => {
    console.log("createSummaryButton ran")
    if (emailBody && !document.getElementById("summarize-btn")) {
        console.log("creating button")
        const summarizeButton = document.createElement("button");
        summarizeButton.innerHTML = `<span class="button-text">Summarize ✨</span>`;
        summarizeButton.id = "summarize-btn-chrome-ext";
        
        // Add spinner styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .spinner {
                display: none;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff;
                border-top: 2px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-left: 8px;
                vertical-align: middle;
            }
            
            .loading {
                opacity: 0.7;
            }
        `;
        document.head.appendChild(style);
        
        summarizeButton.style.cssText = `
            font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            min-width: 120px; 
            max-width: 200px; 
            margin-top: 10px;
            margin-bottom: 10px;
            padding: 10px;
            background-color: rgb(44, 118, 198); 
            color: white; 
            border: none; 
            border-radius: 8px; 
            font-size: 14px;
            cursor: pointer;
            width: 100%; 
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s ease;
        `;

        // Create and append spinner
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        summarizeButton.appendChild(spinner);

        // Append the button to the email body
        emailBody.prepend(summarizeButton);

        // Add an event listener to send email text to the Flask server
        summarizeButton.addEventListener("click", async () => {
            console.log("Summarize button clicked!");

            // Show spinner and make button transparent
            const buttonText = summarizeButton.querySelector('.button-text');
            const spinner = summarizeButton.querySelector('.spinner');
            buttonText.textContent = 'Summarizing...';
            spinner.style.display = 'inline-block';
            summarizeButton.classList.add('loading');
            summarizeButton.disabled = true;

            // Extract the email text
            const emailText = emailBody.innerText.trim();

            // Send a POST request to the Flask server
            try {
                console.log("fetching")
                const response = await fetch("https://b4b9-2605-8d80-544-6966-7818-93f-fae6-a2d8.ngrok-free.app/summarize", {  
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email_text: emailText, email_id: emailId })
                });
                console.log("fetched")

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data)
                console.log("Summary:", data.summary);

                const existingSummaryDiv = document.getElementById("summary-div");
                if (existingSummaryDiv) {
                    existingSummaryDiv.remove();
                }
                
                const summaryDiv = document.createElement("div");
                summaryDiv.id = "summary-div";
                summaryDiv.innerText = "Summary: \n " + data.summary;
                summaryDiv.style.cssText = `
                    margin-bottom: 10px;
                    padding: 10px;
                    background-color: #e8f4fc;
                    border-left: 4px solid #2c76c6;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #333;
                    max-width: 90%;
                    line-height: 1.4;
                `;
                
                summarizeButton.insertAdjacentElement("afterend", summaryDiv);

            } catch (error) {
                console.error("Error:", error);
            } finally {
                // Reset button state
                buttonText.textContent = 'Summarize ✨';
                spinner.style.display = 'none';
                summarizeButton.classList.remove('loading');
                summarizeButton.disabled = false;
            }
        });
    }
  }

    

  
  const newEmailLoaded = (emailId) => {
    // Runs every time a new email is loaded. Returns the email body, and all urls present 

    // Find the div containing the email body
    const emailBody = document.querySelector(".ii.gt .a3s.aiL");

    if (emailBody) {
        // Get the text content (without HTML tags)
        const textContent = emailBody.innerText;

        // Get all the links (anchor tags)
        const links = emailBody.querySelectorAll("a");

        for (const link of links) {
            try {
                const url = link.href;
                if (!url || typeof url !== 'string') {
                    console.warn('Skipping invalid URL:', url);
                    continue;
                }

                console.log("Sending URL to background script for safety check:", url);
                chrome.runtime.sendMessage(
                    { action: 'checkUrlSafety', url },
                    response => {
                        if (response.error) {
                            console.error('Error checking URL safety:', response.error);
                            return;
                        }
                        if (!response.isSafe) {
                            console.log(`URL "${url}" is unsafe.`);

                            // Find the nearest parent div or similar container
                            let container = link;
                            while (container.parentElement && 
                                   !['div', 'section', 'article', 'aside', 'main'].includes(container.tagName.toLowerCase())) {
                                container = container.parentElement;
                            }

                            // Check if warning banner already exists in this container
                            if (!container.querySelector('.unsafe-link-warning')) {
                                // Style the container only if it hasn't been styled before
                                container.style.position = 'relative';
                                container.style.backgroundColor = '#ffebee';
                                container.style.border = '2px solid #ff4444';
                                container.style.borderRadius = '4px';
                                container.style.padding = '8px';

                                // Create warning banner
                                const warningBanner = document.createElement('div');
                                warningBanner.className = 'unsafe-link-warning'; // Add class for checking duplicates
                                warningBanner.style.backgroundColor = '#ff4444';
                                warningBanner.style.color = 'white';
                                warningBanner.style.padding = '4px 8px';
                                warningBanner.style.marginBottom = '8px';
                                warningBanner.style.borderRadius = '2px';
                                warningBanner.style.fontSize = '14px';
                                warningBanner.innerHTML = '⚠️ Warning: This content contains unsafe links';

                                // Insert the banner at the top of the container
                                container.insertBefore(warningBanner, container.firstChild);
                            }

                            // Add warning title to the link itself
                            link.title = 'Warning: This link may be unsafe';
                        }
                    }
                );
            } catch (error) {
                console.error(`Error processing link ${link.href}:`, error);
            }
        }
    }
}


  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, emailId } = obj

    if (type === "NEW") {
      currentEmail = emailId
      result = newEmailLoaded(emailId)
      console.log(emailId)
    }
  });

  newEmailLoaded()
})();

