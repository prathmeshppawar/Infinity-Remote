const socket = io("https://infinity-remote.herokuapp.com");
socket.on("connect", function () {
  console.log("content initiated", socket.id);
  chrome.storage.local.set({ roomId: socket.id });
});

function apply(message) {
  let params = {
    active: true,
    currentWindow: true,
  };
  chrome.tabs.query(params, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  socket.emit("messageFromExtension", message);
});

socket.on("messageFromRemote", (message) => {
  apply(message);
});
