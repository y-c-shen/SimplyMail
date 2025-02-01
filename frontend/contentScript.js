(() => {

let currentEmail = ""

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
  };

  const newVideoLoaded = async () => {
    // const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];

    // currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName('video-stream')[0];

      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };


  const newEmailLoaded = () => {
    // Find the div containing the email body
    const emailBody = document.querySelector(".ii.gt .a3s.aiL");

    if (emailBody) {
    // Get the text content (without HTML tags)
    const textContent = emailBody.innerText;

    // Get all the links (anchor tags)
    const links = emailBody.querySelectorAll("a");
    
    // Collect all the links' href attributes
    const linkUrls = [...new Set(Array.from(links).map(link => link.href))];

    // Combine text content and links into a string
    const result = {
        text: textContent,
        links: linkUrls
    };

    console.log("Text Content:", result.text);
    console.log("Links:", result.links);
}

  }

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, emailId } = obj;

    if (type === "NEW") {
      currentEmail = emailId;
      newEmailLoaded();
      console.log(emailId)
    }
  });

  newEmailLoaded();
})();

