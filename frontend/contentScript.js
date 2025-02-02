(() => {

let currentEmail = ""

  const createSummaryButton = (emailBody, emailId) => {
    console.log("createSummaryButton ran")
    if (emailBody && !document.getElementById("summarize-btn")) {
        console.log("creating button")
        const summarizeButton = document.createElement("button");
        summarizeButton.innerText = "Summarize";
        summarizeButton.id = "summarize-btn-chrome-ext";
        summarizeButton.style.cssText = `
                    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    width: 8rem;
                    margin-top: 20px; 
                    padding: 16px 24px; 
                    background-color: rgb(44, 118, 198); 
                    color: white; 
                    border: none; 
                    border-radius: 8px; 
                    font-size: 14px;
                    cursor: pointer;
                    width: 100%; 
                    text-align: center;
                `

        // Append the button to the email body
        emailBody.appendChild(summarizeButton);


        // Add an event listener to send email text to the Flask server
         // Add an event listener to send email text to the Flask server
        summarizeButton.addEventListener("click", async () => {
            console.log("Summarize button clicked!");

            // Extract the email text
            const emailText = emailBody.innerText.trim();

            // Send a POST request to the Flask server
            try {
                console.log("fetching")
                const response = await fetch("https://504a-2605-8d80-542-8873-28a0-501-eca6-6755.ngrok-free.app/summarize", {  
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
                console.log("Summary:", data.summary);  // Log the summary

                // Display the summary on the page
                const summaryDiv = document.createElement("div");
                summaryDiv.innerText = "Summary: " + data.summary;
                summaryDiv.style.cssText = `
                    margin-top: 10px; 
                    padding: 10px; 
                    background-color: #f3f3f3; 
                    border-radius: 5px;
                    font-size: 14px;
                `;
                emailBody.appendChild(summaryDiv);

            } catch (error) {
                console.error("Error:", error);
            }
        });

    }}

  
const newEmailLoaded = (emailId) => {
    // Runs every time a new email is loaded. Returns the email body, and all urls present 

    // Find the div containing the email body
    const emailBody = document.querySelector(".ii.gt .a3s.aiL");

    if (emailBody) {
    // Get the text content (without HTML tags)
    const textContent = emailBody.innerText;

    // Get all the links (anchor tags)
    const links = emailBody.querySelectorAll("a");
    
    // Collect all the links' href attributes
    // const linkUrls = [...new Set(Array.from(links).map(link => link.href))];

    // *******

    for (const link of links) {
      try {
        const url = link.href;
        if (!url || typeof url !== 'string') {
          console.warn('Skipping invalid URL:', url);
          continue;
        }
  
        // Send message to background script to check URL safety
        console.log("Sending URL to background script for safety check:", url);
        chrome.runtime.sendMessage(
          { action: 'checkUrlSafety', url },
          response => {
            // console.log("Received response from background script:", response);
            if (response.error) {
              console.error('Error checking URL safety:', response.error);
              return;
            }
            if (!response.isSafe) {
              console.log(`URL "${url}" is unsafe.`);
              link.style.backgroundColor = '#ffebee';
              link.style.padding = '2px 4px';
              link.style.borderRadius = '3px';
              link.style.border = '1px solid #ffcdd2';
              link.title = 'Warning: This link may be unsafe';
  
              const warningIcon = document.createElement('span');
              warningIcon.innerHTML = ' ⚠️';
              warningIcon.style.fontSize = '12px';
              link.appendChild(warningIcon);
            }
          }
        );
      } catch (error) {
        console.error(`Error processing link ${link.href}:`, error);
      }
    }
      
    // ***********  

      
    // Combine text content and links into a string


    console.log("Text Content:", textContent);


    createSummaryButton(emailBody, emailId)
    
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

