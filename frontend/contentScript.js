(() => {

let currentEmail = ""

  const newEmailLoaded = async () => {
    const emailBody = document.querySelector(".ii.gt .a3s.aiL")
    if (emailBody){
    const links = emailBody.querySelectorAll("a");
    const Text = emailBody.innerText;
  
    console.log("Text found:", Text); // Now should log properly
  
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
            console.log("Received response from background script:", response);
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
  
    console.log("Links found:", [...new Set(Array.from(links).map(link => link.href))]);
  };
}

  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, emailId } = obj;

    if (type === "NEW") {
      currentEmail = emailId;
      newEmailLoaded();
      console.log("Processing new email:", emailId);
    }
  });

  // Initial check when script loads
  newEmailLoaded();
})();