// console.log("Popup clicked");
function createQR(info) {
  let qr = new QRious({
    element: document.getElementById("qrCode"),
    size: 250,
    value: info,
  });
}

function updatePopup() {
  chrome.storage.local.get(["roomId"], function (data) {
    createQR(data.roomId);
  });
}

let instruction = document.getElementById("instruction");

function pwaQRCode() {
  instruction.innerHTML = "Scan this QR-Code with your Mobile's<a></a> camera";
  createQR("https://infinity-remote.herokuapp.com");
  document.querySelector("button").style.visibility = "visible";
}

function socketQRCode() {
  instruction.innerHTML =
    "Scan this QR-Code with the <a id='link'>Infinity Remote</a> website and refresh the page after connection is established.";
  document.querySelector("button").style.visibility = "hidden";
  updatePopup();
  document.getElementById("link").addEventListener("click", pwaQRCode);
}

document.getElementById("link").addEventListener("click", pwaQRCode);
document.querySelector("button").addEventListener("click", socketQRCode);

updatePopup();
