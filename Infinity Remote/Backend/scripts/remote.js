const socket = io("https://infinity-remote.herokuapp.com/");
socket.emit("newUser", roomId);

const toggleSwitch = document.querySelector(
  '.theme-switch input[type="checkbox"]'
);
function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}
toggleSwitch.addEventListener("change", switchTheme, false);
function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
}
const currentTheme = localStorage.getItem("theme")
  ? localStorage.getItem("theme")
  : null;

if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);

  if (currentTheme === "dark") {
    toggleSwitch.checked = true;
  }
}
const playbackSpeed = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
var sliderIndex = 3;
var screenType = 0;
var inTheaterMode = true;
var isPlayButton = false;
var isMute = false;
let rangeSlider = document.getElementById("rs-range-line");
let rangeBullet = document.getElementById("rs-bullet");
var isPlaylist = true;

function sendSocket(message) {
  socket.emit("messageFromRemote", message, roomId);
}

function receiveSocket(message) {
  if (message.state === "homeScreen") {
    screenType = 0;
    homeScreen();
  } else if (message.state === "videoScreen") {
    screenType = 1;
    if (message.isPlayButton === "Play") {
      isPlayButton = true;
    } else {
      isPlayButton = false;
    }
    isPlaylist = message.isPlaylist;
    if (message.isMute === "M") {
      isMute = false;
    } else {
      isMute = true;
    }
    rangeSlider.value = message.speedIndex * 4 - 1;
    rangeBullet.innerHTML = "x " + playbackSpeed[rangeSlider.value];
    videoScreen();
  } else if (message.state === "searchScreen") {
    screenType = 2;
    searchScreen();
  }
}

socket.on("messageFromExtension", (message) => {
  receiveSocket(message);
});

var downPressed;
var rightPressed;
var leftPressed;
var upPressed;

document.getElementById("search").addEventListener("click", search);
document.getElementById("back").addEventListener("click", back);
document.getElementById("select").addEventListener("click", select);
document.getElementById("stepForward").addEventListener("click", stepForward);
document.getElementById("mute").addEventListener("click", mute);
document.getElementById("stepBackward").addEventListener("click", stepBackward);
document.getElementById("home").addEventListener("click", home);
document.getElementById("expand").addEventListener("click", screenButton);
document.getElementById("caption").addEventListener("click", caption);
document.getElementById("rs-range-line").addEventListener("input", changeSpeed);
document.getElementById("searchBox").addEventListener("keydown", searchEntered)
document.getElementById("left").addEventListener("touchstart", function () {
  leftButton();
  leftPressed = setInterval(leftButton, 300);
});
document.getElementById("right").addEventListener("touchstart", function () {
  rightButton();
  rightPressed = setInterval(rightButton, 300);
});
document.getElementById("up").addEventListener("touchstart", function () {
  upButton();
  upPressed = setInterval(upButton, 300);
});
document.getElementById("down").addEventListener("touchstart", function () {
  downButton();
  downPressed = setInterval(downButton, 300);
});
document.addEventListener("touchend", function () {
  clearInterval(downPressed);
  clearInterval(leftPressed);
  clearInterval(upPressed);
  clearInterval(rightPressed);
});
document.getElementById("back").className = "disabled fas fa-arrow-left fa-2x";

function homeScreen() {
  sendSocket("homeScreen");
  document.getElementById("select").innerHTML = "Select";
  document.getElementById("left").innerHTML =
    "<i class='enabled fas fa-chevron-left fa-2x'></i>";
  document.getElementById("left").className = "button-enabled left";
  document.getElementById("right").innerHTML =
    "<i class='enabled fas fa-chevron-right fa-2x'></i>";
  document.getElementById("right").className = "button-enabled right";
  document.getElementById("up").innerHTML =
    "<i class='enabled fas fa-chevron-up fa-2x'></i>";
  document.getElementById("down").innerHTML =
    "<i class='enabled fas fa-chevron-down fa-2x'></i>";
  document.getElementById("stepForward").innerHTML =
    "<i class='disabled fas fa-step-forward fa-2x'></i>";
  document.getElementById("stepForward").className =
    "button-disabled step-forward";
  document.getElementById("mute").innerHTML =
    "<i class='disabled fas fa-volume-mute fa-2x'></i>";
  document.getElementById("mute").className = "button-disabled mute";
  document.getElementById("stepBackward").innerHTML =
    "<i class='disabled fas fa-step-backward fa-2x'></i>";
  document.getElementById("stepBackward").className =
    "button-disabled step-backward";
  document.getElementById("home").innerHTML =
    "<i class='enabled fas fa-home fa-2x'></i>";
  document.getElementById("home").className = "button-enabled home";
  document.getElementById("expand").innerHTML =
    "<i class='disabled fas fa-expand fa-2x'></i>";
  document.getElementById("expand").className = "button-disabled expand";
  document.getElementById("caption").innerHTML =
    "<i class='disabled fas fa-closed-captioning fa-2x'></i>";
  document.getElementById("caption").className = "button-disabled caption";
  document.getElementById("container").style.display = "none";
}

function videoScreen() {
  sendSocket("videoScreen");
  inTheaterMode = true;
  document.getElementById("back").className = "enabled fas fa-arrow-left fa-2x";
  document.getElementById("left").innerHTML =
    "<i class='enabled fas fa-backward fa-2x'></i>";
  document.getElementById("left").className = "button-enabled left";
  document.getElementById("right").innerHTML =
    "<i class='enabled fas fa-forward fa-2x'></i>";
  document.getElementById("right").className = "button-enabled right";
  document.getElementById("stepForward").innerHTML =
    "<i class='enabled fas fa-step-forward fa-2x'></i>";
  document.getElementById("stepForward").className =
    "button-enabled step-forward";
  if (isMute === false) {
    document.getElementById("mute").innerHTML =
      "<i class='enabled fas fa-volume-mute fa-2x'></i>";
  } else {
    document.getElementById("mute").innerHTML =
      "<i class='enabled fas fa-volume-up fa-2x'></i>";
  }
  document.getElementById("mute").className = "button-enabled mute";
  document.getElementById("stepBackward").innerHTML =
    "<i class='enabled fas fa-step-backward fa-2x'></i>";
  document.getElementById("stepBackward").className =
    "button-enabled step-backward";
  document.getElementById("caption").innerHTML =
    "<i class='enabled fas fa-closed-captioning fa-2x'></i>";
  document.getElementById("caption").className = "button-enabled caption";
  document.getElementById("home").innerHTML =
    "<i class='enabled fas fa-home fa-2x'></i>";
  document.getElementById("home").className = "button-enabled home";
  if (isPlayButton == true) {
    document.getElementById("select").innerHTML =
      "<i class='enabled fas fa-play fa-2x'></i>";
  } else {
    document.getElementById("select").innerHTML =
      "<i class='enabled fas fa-pause fa-2x'></i>";
  }
  document.getElementById("up").innerHTML =
    "<i class='enabled fas fa-volume-up fa-2x'></i>";
  document.getElementById("down").innerHTML =
    "<i class='enabled fas fa-volume-down fa-2x'></i>";
  document.getElementById("expand").innerHTML =
    "<i class='enabled fas fa-compress fa-2x'></i>";
  document.getElementById("expand").className = "button-enabled expand";
  document.getElementById("container").style.display = "flex";
}
function searchScreen() {
  sendSocket("searchScreen");
  document.getElementById("back").className = "enabled fas fa-arrow-left fa-2x";
  document.getElementById("select").innerHTML = "Select";
  document.getElementById("left").innerHTML =
    "<i class='disabled fas fa-chevron-left fa-2x'></i>";
  document.getElementById("left").className = "button-disabled left";
  document.getElementById("right").innerHTML =
    "<i class='disabled fas fa-chevron-right fa-2x'></i>";
  document.getElementById("right").className = "button-disabled right";
  document.getElementById("up").innerHTML =
    "<i class='enabled fas fa-chevron-up fa-2x'></i>";
  document.getElementById("down").innerHTML =
    "<i class='enabled fas fa-chevron-down fa-2x'></i>";
  document.getElementById("stepForward").innerHTML =
    "<i class='disabled fas fa-step-forward fa-2x'></i>";
  document.getElementById("stepForward").className =
    "button-disabled step-forward";
  document.getElementById("mute").innerHTML =
    "<i class='disabled fas fa-volume-mute fa-2x'></i>";
  document.getElementById("mute").className = "button-disabled mute";
  document.getElementById("stepBackward").innerHTML =
    "<i class='disabled fas fa-step-backward fa-2x'></i>";
  document.getElementById("stepBackward").className =
    "button-disabled step-backward";
  document.getElementById("home").innerHTML =
    "<i class='enabled fas fa-home fa-2x'></i>";
  document.getElementById("home").className = "button-enabled home";
  document.getElementById("expand").innerHTML =
    "<i class='disabled fas fa-expand fa-2x'></i>";
  document.getElementById("expand").className = "button-disabled expand";
  document.getElementById("caption").innerHTML =
    "<i class='disabled fas fa-closed-captioning fa-2x'></i>";
  document.getElementById("caption").className = "button-disabled caption";
  document.getElementById("container").style.display = "none";
}

function select() {
  if (screenType == 1) {
    if (inTheaterMode == true) {
      sendSocket("changePlay");
      isPlayButton = !isPlayButton;
      if (isPlayButton == true) {
        document.getElementById("select").innerHTML =
          "<i class='enabled fas fa-play fa-2x'></i>";
      } else {
        document.getElementById("select").innerHTML =
          "<i class='enabled fas fa-pause fa-2x'></i>";
      }
    } else {
      sendSocket("selectEntered");
      inTheaterMode = true;
    }
  } else if (screenType == 0) {
    sendSocket("panelSelected");
  } else {
    sendSocket("selectEntered");
  }
}

function back() {
  sendSocket("back");
}

function screenButton() {
  if (screenType == 1) {
    inTheaterMode = !inTheaterMode;
    sendSocket("screenButton");
    if (inTheaterMode == true) {
      if (isPlayButton == true) {
        document.getElementById("select").innerHTML =
          "<i class='enabled fas fa-play fa-2x'></i>";
      } else {
        document.getElementById("select").innerHTML =
          "<i class='enabled fas fa-pause fa-2x'></i>";
      }
      document.getElementById("up").innerHTML =
        "<i class='enabled fas fa-volume-up fa-2x'></i>";
      document.getElementById("down").innerHTML =
        "<i class='enabled fas fa-volume-down fa-2x'></i>";
      document.getElementById("expand").innerHTML =
        "<i class='enabled fas fa-compress fa-2x'></i>";
      document.getElementById("expand").className = "button-enabled expand";
      document.getElementById("left").innerHTML =
        "<i class='enabled fas fa-backward fa-2x'></i>";
      document.getElementById("left").className = "button-enabled left";
      document.getElementById("right").innerHTML =
        "<i class='enabled fas fa-forward fa-2x'></i>";
      document.getElementById("right").className = "button-enabled right";
    } else {
      document.getElementById("select").innerHTML = "Select";
      document.getElementById("up").innerHTML =
        "<i class='enabled fas fa-chevron-up fa-2x'></i>";
      document.getElementById("down").innerHTML =
        "<i class='enabled fas fa-chevron-down fa-2x'></i>";
      document.getElementById("expand").innerHTML =
        "<i class='enabled fas fa-expand fa-2x'></i>";
      document.getElementById("expand").className = "button-enabled expand";
      document.getElementById("left").innerHTML =
        "<i class='enabled fas fa-chevron-left fa-2x'></i>";
      document.getElementById("right").innerHTML =
        "<i class='enabled fas fa-chevron-right fa-2x'></i>";
      if (isPlaylist === true) {
        document.getElementById("left").innerHTML =
          "<i class='enabled fas fa-chevron-left fa-2x'></i>";
        document.getElementById("right").innerHTML =
          "<i class='enabled fas fa-chevron-right fa-2x'></i>";
        document.getElementById("left").className = "button-enabled left";
        document.getElementById("right").className = "button-enabled right";
      } else {
        document.getElementById("left").innerHTML =
          "<i class='disabled fas fa-chevron-left fa-2x'></i>";
        document.getElementById("right").innerHTML =
          "<i class='disabled fas fa-chevron-right fa-2x'></i>";
        document.getElementById("left").className = "button-disabled left";
        document.getElementById("right").className = "button-disabled right";
      }
    }
  }
}

function stepBackward() {
  if (screenType == 1) {
    sendSocket("stepBackward");
  }
}
function stepForward() {
  if (screenType == 1) {
    sendSocket("stepForward");
  }
}

function leftButton() {
  if (screenType != 2) {
    if (inTheaterMode == true || screenType == 0) {
      sendSocket("leftButton");
    } else {
      if (isPlaylist === true) {
        sendSocket("playlistBackward");
      }
    }
  }
}
function rightButton() {
  if (screenType != 2) {
    if (inTheaterMode == true || screenType == 0) {
      sendSocket("rightButton");
    } else {
      if (isPlaylist === true) {
        sendSocket("playlistForward");
      }
    }
  }
}

function mute() {
  if (screenType == 1) {
    sendSocket("mute");
    isMute = !isMute;
    if (isMute == true) {
      document.getElementById("mute").innerHTML =
        "<i class='enabled fas fa-volume-up fa-2x'></i>";
    } else {
      document.getElementById("mute").innerHTML =
        "<i class='enabled fas fa-volume-mute fa-2x'></i>";
    }
  }
}

function upButton() {
  if (screenType == 1 && inTheaterMode == true) {
    sendSocket("volumeIncreased");
  } else {
    sendSocket("upButton");
  }
}
function downButton() {
  if (screenType == 1 && inTheaterMode == true) {
    sendSocket("volumeDecreased");
  } else {
    sendSocket("downButton");
  }
}

function caption() {
  if (screenType == 1) {
    sendSocket("caption");
  }
}

function searchEntered(event) {
  if (event.keyCode == 13) {
    search();
  }
}
function search(event) {
  let x = document.getElementById("searchBox").value;
  x = encodeURIComponent(x);
  if (x !== "") {
    sendSocket(`search:${x}`);
  }
  document.getElementById("searchBox").value = "";
}

function home() {
  sendSocket("home");
}

function changeSpeed() {
  rangeBullet.innerHTML = "x " + playbackSpeed[rangeSlider.value];
  sendSocket(`changeSpeed:${rangeSlider.value}`);
  sliderIndex = rangeSlider.value;
}

function connectToExtension() {
  sendSocket("connectToExtension");
}
connectToExtension();
