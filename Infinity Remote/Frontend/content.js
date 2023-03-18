var speedIndex = 3;
var volumeLevel = 1;
var inHomeScreen = false;
var inSearchScreen = false;
var inVideoScreen = false;
var isHighlighted = true;
var thumbnailIndex = 0;
var inTheaterMode;

function sendStateInfo() {
  let url = window.location.href;
  if (
    /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?(\/)?(\?app\=desktop)?$/.test(
      url
    )
  ) {
    chrome.runtime.sendMessage({
      state: "homeScreen",
    });
  } else if (
    /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?(\/)?watch/.test(url)
  ) {
    inTheaterMode =
      document.getElementsByClassName("ytp-size-button")[0].title.slice(0, 7) ==
      "Theater"
        ? false
        : true;
    let adNode = document.querySelector(".video-ads.ytp-ad-module");
    if (adNode != null) {
      const adRemover = function () {
        if (document.querySelector(".ytp-ad-skip-button") != null) {
          document.querySelector(".ytp-ad-skip-button").click();
        }
        if (document.querySelector(".ytp-ad-overlay-close-button") != null) {
          document.querySelector(".ytp-ad-overlay-close-button").click();
        }
      };
      let adObserver = new MutationObserver(adRemover);
      const configuration = {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      };
      adObserver.observe(adNode, configuration);
    }

    var stateMessage = {
      state: "videoScreen",
      speedIndex: document.getElementsByTagName("video")[0].playbackRate,
      isPlayButton: document
        .getElementsByClassName("ytp-play-button")[0]
        .attributes["aria-label"].nodeValue.slice(0, -4),
      isMute: document
        .getElementsByClassName("ytp-mute-button")[0]
        .title.slice(0, 1),
      isPlaylist: false,
    };
    if (/&list=/.test(url)) {
      stateMessage.isPlaylist = true;
    }
    chrome.runtime.sendMessage(stateMessage);
    speedIndex = document.getElementsByTagName("video")[0].playbackRate * 4 - 1;
    volumeLevel = document.getElementsByClassName("video-stream")[0].volume;
  } else if (
    /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?(\/)?results\?search\_query\=/.test(
      url
    )
  ) {
    chrome.runtime.sendMessage({
      state: "searchScreen",
    });
  }
}

let lastUrl = location.href;
sendStateInfo();

let columnCount = 1;
var panelList;
var panelIndex;
var caretButton;
var muted = 0;
var isCaret = false;

function setColumn() {
  if (window.innerWidth > 1143) {
    columnCount = 4;
  } else if (window.innerWidth > 887) {
    columnCount = 3;
  } else {
    columnCount = 2;
  }
}
window.addEventListener("resize", setColumn);
setColumn();
function homeScreen() {
  inHomeScreen = true;
  caretButton = document.querySelectorAll(
    "ytd-button-renderer#show-more-button"
  );

  for (let i of caretButton) {
    i.style.padding = "2px 0px 0px 0px";
    i.style.borderBottom = "6px solid red";
  }

  var caretIndex = 0;
  var caretList = new Array(caretButton.length);
  for (let index = 0; index < caretButton.length; index++) {
    caretList[index] = index;
  }

  isCaret = false;
  panelIndex = 0;
  panelList = document.querySelectorAll("ytd-rich-item-renderer");
  panelList[panelIndex].style.borderBottom = "6px solid dodgerblue";

  let oldPanelMarginBottom = parseFloat(
    getComputedStyle(panelList[panelIndex], null)
      .getPropertyValue("margin-bottom")
      .slice(0, -2)
  );
  let newPanelMarginBottom = oldPanelMarginBottom - 6;
  panelList[panelIndex].style.marginBottom = newPanelMarginBottom + "px";
  panelList[panelIndex].scrollIntoView({ block: "center" });
  window.addEventListener(
    "keydown",
    function (event) {
      if (isCaret) {
        caretButton[caretList[caretIndex]].style.borderBottom = "6px solid red";
        if (event.code === "ArrowDown") {
          let x = panelIndex % columnCount;
          while (panelList[panelIndex].offsetTop == 0) {
            panelIndex++;
          }
          panelIndex += x;
          caretIndex++;
        } else if (event.code === "ArrowUp") {
          let x = panelIndex % columnCount;
          while (panelList[panelIndex].offsetTop == 0) {
            panelIndex -= 1;
          }
          panelIndex = panelIndex + x + 1 - columnCount;
        } else if (event.code === "ArrowLeft") {
          while (panelList[panelIndex].offsetTop == 0) {
            panelIndex -= 1;
          }
        } else if (event.code === "ArrowRight") {
          while (panelList[panelIndex].offsetTop == 0) {
            panelIndex++;
          }
          caretIndex++;
        } else if (event.code === "Enter") {
          let x = panelIndex % columnCount;
          while (panelList[panelIndex].offsetTop == 0) {
            panelIndex -= 1;
          }
          panelIndex = panelIndex + x + 1;
          caretButton[caretList[caretIndex]].click();
          caretList.splice(caretIndex, 1);
        }
        isCaret = false;
        panelList[panelIndex].scrollIntoView({ block: "center" });
        oldPanelMarginBottom = parseFloat(
          getComputedStyle(panelList[panelIndex], null)
            .getPropertyValue("margin-bottom")
            .slice(0, -2)
        );
        newPanelMarginBottom = oldPanelMarginBottom - 6;
        panelList[panelIndex].style.marginBottom = newPanelMarginBottom + "px";
        panelList[panelIndex].style.borderBottom = "6px solid dodgerblue";
      } else {
        panelList = document.querySelectorAll("ytd-rich-item-renderer");
        panelList[panelIndex].style.borderBottom = "none";
        panelList[panelIndex].style.marginBottom = oldPanelMarginBottom + "px";
        var z = false;
        if (event.code === "ArrowDown") {
          panelIndex += columnCount;
        } else if (event.code === "ArrowUp") {
          panelIndex -= columnCount;
          z = true;
        } else if (event.code === "ArrowLeft") {
          panelIndex -= 1;
          z = true;
        } else if (event.code === "ArrowRight") {
          panelIndex += 1;
        }
        if (panelIndex < 0) {
          panelIndex = 0;
        }
        if (panelList[panelIndex].offsetTop == 0) {
          if (z) {
            caretIndex -= 1;
          }
          caretButton[caretList[caretIndex]].style.borderBottom =
            "6px solid dodgerblue";
          isCaret = true;
        } else {
          panelList[panelIndex].scrollIntoView({ block: "center" });
          oldPanelMarginBottom = parseFloat(
            getComputedStyle(panelList[panelIndex], null)
              .getPropertyValue("margin-bottom")
              .slice(0, -2)
          );
          newPanelMarginBottom = oldPanelMarginBottom - 6;
          panelList[panelIndex].style.marginBottom =
            newPanelMarginBottom + "px";
          panelList[panelIndex].style.borderBottom = "6px solid dodgerblue";
        }
      }
      event.preventDefault();
    },
    true
  );
}

let keyMap = { 38: -1, 40: +1 };

function searchScreen() {
  inSearchScreen = true;

  var searchPanels = document.querySelectorAll("#thumbnail");
  searchPanels.forEach(
    (Element) => (Element.parentElement.parentElement.style.borderRight = "")
  );
  let isMoreButton = false;
  let searchPanelParent;
  let moreButton;
  let isComingUp;

  searchPanels[thumbnailIndex].parentElement.parentElement.style.borderRight =
    "6px solid dodgerblue";

  function doelse() {
    if (isMoreButton) {
      thumbnailIndex -= keyMap[event.keyCode];
      isMoreButton = false;
    }
    thumbnailIndex += keyMap[event.keyCode];
    if (thumbnailIndex < 0) thumbnailIndex = 0;
    if (thumbnailIndex < searchPanels.length) {
      searchPanels[
        thumbnailIndex
      ].parentElement.parentElement.style.borderRight = "6px solid dodgerblue";
      searchPanels[thumbnailIndex].scrollIntoView({
        block: "center",
        behaviour: "smooth",
      });
    }
    searchPanels = document.querySelectorAll("#thumbnail");
  }

  document.addEventListener("keydown", (event) => {
    event.preventDefault();
    if (event.code === "Enter") {
      if (isMoreButton) {
        moreButton.firstElementChild.click();
        searchPanels = document.querySelectorAll("#thumbnail");
        if (!isComingUp) thumbnailIndex += 1;
        else {
        }
        searchPanels[
          thumbnailIndex
        ].parentElement.parentElement.style.borderRight =
          "6px solid dodgerblue";
        searchPanels[thumbnailIndex].scrollIntoView({
          block: "center",
          behaviour: "smooth",
        });

        isMoreButton = false;
      } else this.document.location = searchPanels[thumbnailIndex].href;
    } else if (event.keyCode == 38 || event.keyCode == 40) {
      searchPanels[
        thumbnailIndex
      ].parentElement.parentElement.style.borderRight = "";
      if (isMoreButton) {
        thumbnailIndex += keyMap[event.keyCode];
        document
          .querySelectorAll("div#more")
          .forEach((Element) => (Element.style.borderBottom = ""));
      }

      if (
        searchPanels[
          thumbnailIndex
        ].parentElement.parentElement.nodeName.toLowerCase() ===
        "ytd-playlist-renderer"
      ) {
        searchPanelParent =
          searchPanels[thumbnailIndex].parentElement.parentElement;
      } else {
        searchPanelParent =
          searchPanels[thumbnailIndex].parentElement.parentElement
            .parentElement;
      }

      if (
        searchPanelParent.parentElement.nextElementSibling !== null &&
        keyMap[event.keyCode] == +1
      ) {
        if (
          searchPanelParent.parentElement.lastElementChild ==
            searchPanelParent &&
          searchPanelParent.parentElement.nextElementSibling.id == "more" &&
          searchPanelParent.parentElement.nextElementSibling.getAttribute(
            "hidden"
          ) != ""
        ) {
          searchPanelParent.parentElement.nextElementSibling.style.borderBottom =
            "6px solid dodgerblue";
          isMoreButton = true;
          moreButton = searchPanelParent.parentElement.nextElementSibling;
          isComingUp = false;
        } else doelse();
      } else if (
        searchPanelParent.previousElementSibling !== null &&
        keyMap[event.keyCode] == -1
      ) {
        if (
          searchPanelParent.previousElementSibling.nodeName.toLowerCase() ==
            "ytd-shelf-renderer" &&
          searchPanelParent.previousElementSibling.firstElementChild.children[1].firstElementChild.children[1].getAttribute(
            "hidden"
          ) != ""
        ) {
          var shelf = searchPanelParent.previousElementSibling;
          shelf.firstElementChild.children[1].firstElementChild.children[1].style.borderBottom =
            "6px solid dodgerblue";
          isMoreButton = true;
          moreButton =
            shelf.firstElementChild.children[1].firstElementChild.children[1];
          isComingUp = true;
        } else doelse();
      } else doelse();
    }
  });
}

function setVolume() {
  document.getElementsByClassName("video-stream")[0].volume = volumeLevel;
}

function checkTheater() {
  if (
    document.getElementsByClassName("ytp-size-button")[0].title.slice(0, 7) ==
    "Theater"
  ) {
    screenButton();
  }
}
function videoScreen() {
  inVideoScreen = true;
  checkTheater();
  isHighlighted = false;
  setInterval(setVolume, 50);
}
var videoScreenPanels;
var videoScreenIndex;
function videoHighlighter() {
  videoScreenIndex = 0;

  videoScreenPanels = document.querySelectorAll(
    "#thumbnail.yt-simple-endpoint.style-scope"
  );
  var playlistPanels = document.querySelectorAll(
    "ytd-playlist-panel-video-renderer"
  );

  let playlistPanelCount;
  let currentPlaylistPanel;

  if (playlistPanels.length != 0) playlistPanelCount = playlistPanels.length;
  videoScreenPanels[0].parentElement.parentElement.parentElement.style.borderRight =
    "6px solid dodgerblue";
  videoScreenPanels[videoScreenIndex].scrollIntoView({
    block: "center",
    behaviour: "smooth",
  });

  let keyIndex;

  function updatePlaylistPanelNum() {
    if (playlistPanels.length != 0) {
      function collectionHas(a, b) {
        for (var i = 0, len = a.length; i < len; i++) {
          if (a[i] == b) return true;
        }
        return false;
      }

      function findParentBySelector(element, selector) {
        var selectorList = document.querySelectorAll(selector);
        var currentElement = element.parentNode;
        while (currentElement && !collectionHas(selectorList, currentElement)) {
          currentElement = currentElement.parentNode;
        }
        return currentElement;
      }

      if (
        findParentBySelector(
          videoScreenPanels[videoScreenIndex],
          "ytd-playlist-panel-video-renderer"
        ) !== null
      )
        currentPlaylistPanel = videoScreenIndex;
    }
  }

  document.addEventListener("keydown", (event) => {
    videoScreenPanels = document.querySelectorAll(
      "#thumbnail.yt-simple-endpoint.style-scope"
    );
    playlistPanels = document.querySelectorAll(
      "ytd-playlist-panel-video-renderer"
    );
    if (playlistPanels.length != 0) playlistPanelCount = playlistPanels.length;
    event.preventDefault();

    if (event.code === "Enter") {
      videoScreenPanels[
        videoScreenIndex
      ].parentElement.parentElement.parentElement.style.borderRight = "";
      this.document.location = videoScreenPanels[videoScreenIndex].href;
    } else if (event.keyCode == 38 || event.keyCode == 40) {
      videoScreenPanels[
        videoScreenIndex
      ].parentElement.parentElement.parentElement.style.borderRight = "";
      keyIndex = keyMap[event.keyCode];
      videoScreenIndex += keyIndex;
      if (videoScreenIndex < 0) videoScreenIndex = 0;
      if (videoScreenIndex < videoScreenPanels.length) {
        videoScreenPanels[videoScreenIndex].scrollIntoView({
          block: "center",
          behaviour: "smooth",
        });
        videoScreenPanels[
          videoScreenIndex
        ].parentElement.parentElement.parentElement.style.borderRight =
          "6px solid dodgerblue";
        videoScreenPanels = document.querySelectorAll(
          "#thumbnail.yt-simple-endpoint.style-scope"
        );
      }
      updatePlaylistPanelNum();
    }
    if (playlistPanels.length != 0) {
      if (event.keyCode == 83 || event.keyCode == 68) {
        videoScreenPanels[
          videoScreenIndex
        ].parentElement.parentElement.parentElement.style.borderRight = "";
        if (event.keyCode == 83) videoScreenIndex = currentPlaylistPanel;
        else videoScreenIndex = playlistPanelCount;
        videoScreenPanels[
          videoScreenIndex
        ].parentElement.parentElement.parentElement.style.borderRight =
          "6px solid dodgerblue";
        videoScreenPanels[videoScreenIndex].scrollIntoView({
          block: "center",
          behaviour: "smooth",
        });
      }
    }
    event.preventDefault();
  });

  function videoAutoplay() {
    videoScreenPanels[
      videoScreenIndex
    ].parentElement.parentElement.parentElement.style.borderRight = "";
    videoScreenIndex = 0;
    videoScreenPanels[
      videoScreenIndex
    ].parentElement.parentElement.parentElement.style.borderRight =
      "6px solid dodgerblue";
    videoScreenPanels[videoScreenIndex].scrollIntoView({
      block: "center",
      behaviour: "smooth",
    });
    currentPlaylistPanel = 0;
    if (playlistPanels.length != 0) playlistPanelCount = playlistPanels.length;
  }
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      videoAutoplay();
    }
  }).observe(document, { subtree: true, childList: true });
}

function volumeIncreased() {
  volumeLevel += 0.1;
  volumeLevel = Math.min(1, volumeLevel);
  setVolume();
}
function volumeDecreased() {
  volumeLevel -= 0.1;
  volumeLevel = Math.max(0, volumeLevel);
  setVolume();
}

function screenButton() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyT",
    key: "t",
    shiftKey: false,
    keyCode: 84,
  });
  document.dispatchEvent(e);
  if (isHighlighted == false) {
    videoHighlighter();
  }
  isHighlighted = true;
  inTheaterMode = !inTheaterMode;
  if (inTheaterMode) {
    window.scrollTo(0, 0);
  } else {
    videoScreenPanels[videoScreenIndex].scrollIntoViewIfNeeded({
      behaviour: "smooth",
    });
  }
}
function mute() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyM",
    key: "m",
    shiftKey: false,
    keyCode: 77,
  });
  document.dispatchEvent(e);
}
function stepBackward() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyP",
    key: "P",
    shiftKey: true,
    keyCode: 80,
  });
  document.dispatchEvent(e);
}
function stepForward() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyN",
    key: "N",
    shiftKey: true,
    keyCode: 78,
  });
  document.dispatchEvent(e);
}

function leftButton() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "ArrowLeft",
    key: "ArrowLeft",
    shiftKey: false,
    keyCode: 37,
  });
  document.dispatchEvent(e);
}
function rightButton() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "ArrowRight",
    key: "ArrowRight",
    shiftKey: false,
    keyCode: 39,
  });
  document.dispatchEvent(e);
}
function upButton() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "ArrowUp",
    key: "ArrowUp",
    shiftKey: false,
    keyCode: 38,
  });
  document.dispatchEvent(e);
}
function downButton() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "ArrowDown",
    key: "ArrowDown",
    shiftKey: false,
    keyCode: 40,
  });
  document.dispatchEvent(e);
}

function caption() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyC",
    key: "c",
    shiftKey: false,
    keyCode: 67,
  });
  document.dispatchEvent(e);
}

function back() {
  window.history.back();
}
function panelSelected() {
  if (isCaret == true) {
    var e = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      charCode: "0",
      code: "Enter",
      key: "Enter",
      shiftKey: false,
      keyCode: 13,
    });
    document.dispatchEvent(e);
  } else {
    this.document.location = panelList[panelIndex].querySelector("a").href;
  }
}
function selectEntered() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "Enter",
    key: "Enter",
    shiftKey: false,
    keyCode: 13,
  });
  document.dispatchEvent(e);
}
function home() {
  this.document.location = "https://www.youtube.com/";
}
function youtubeSearch(searchQuery) {
  thumbnailIndex = 0;
  inSearchScreen = false;
  this.document.location = `https://www.youtube.com/results?search_query=${searchQuery}`;
}
function changePlay() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyK",
    key: "k",
    shiftKey: false,
    keyCode: 75,
  });
  document.dispatchEvent(e);
}
function playlistBackward() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyS",
    key: "s",
    shiftKey: false,
    keyCode: 83,
  });
  document.dispatchEvent(e);
}
function playlistForward() {
  var e = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    charCode: "0",
    code: "KeyD",
    key: "d",
    shiftKey: false,
    keyCode: 68,
  });
  document.dispatchEvent(e);
}
function changeSpeed(rangeSliderValue) {
  if (rangeSliderValue > speedIndex) {
    var e = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: false,
      charCode: "0",
      code: "Period",
      key: ">",
      shiftKey: true,
      keyCode: 190,
    });
    for (let i = 0; i < rangeSliderValue - speedIndex; i++) {
      document.dispatchEvent(e);
    }
  } else {
    var e = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: false,
      charCode: "0",
      code: "Comma",
      key: "<",
      shiftKey: true,
      keyCode: 188,
    });
    for (let i = 0; i < speedIndex - rangeSliderValue; i++) {
      document.dispatchEvent(e);
    }
  }
  speedIndex = rangeSliderValue;
}

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, _sender, sendResponse) {
  if (message === "stepBackward") {
    stepBackward();
  } else if (message === "stepForward") {
    stepForward();
  } else if (message === "leftButton") {
    leftButton();
  } else if (message === "rightButton") {
    rightButton();
  } else if (message === "playlistForward") {
    playlistForward();
  } else if (message === "playlistBackward") {
    playlistBackward();
  } else if (message === "upButton") {
    upButton();
  } else if (message === "downButton") {
    downButton();
  } else if (message === "caption") {
    caption();
  } else if (message === "screenButton") {
    screenButton();
  } else if (message === "mute") {
    mute();
  } else if (message === "changePlay") {
    changePlay();
  } else if (message === "panelSelected") {
    panelSelected();
  } else if (message === "back") {
    back();
  } else if (message === "volumeIncreased") {
    volumeIncreased();
  } else if (message === "volumeDecreased") {
    volumeDecreased();
  } else if (message === "homeScreen") {
    inSearchScreen = false;
    inVideoScreen = false;
    if (inHomeScreen === false) {
      homeScreen();
    }
  } else if (message === "searchScreen") {
    inHomeScreen = false;
    inVideoScreen = false;
    if (inSearchScreen === false) {
      searchScreen();
    }
  } else if (message === "videoScreen") {
    inSearchScreen = false;
    inHomeScreen = false;
    if (inVideoScreen === false) {
      videoScreen();
    } else {
      checkTheater();
    }
  } else if (message === "home") {
    home();
  } else if (message === "selectEntered") {
    selectEntered();
  } else if (message.split(":")[0] == "changeSpeed") {
    changeSpeed(Number(message.split(":")[1]));
  } else if (message === "connectToExtension") {
    sendStateInfo();
  } else if (message.split(":")[0] == "search") {
    let searchQuery = message.split(":")[1];
    youtubeSearch(searchQuery);
  }
}

