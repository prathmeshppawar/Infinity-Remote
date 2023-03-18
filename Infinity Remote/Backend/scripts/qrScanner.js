const qrCode = window.qrcode;
const video = document.createElement("video");
const canvasElement = document.getElementById("qr-canvas");
const canvas = canvasElement.getContext("2d");
const form = document.querySelector("form");

let scanning = false;
openScan();
qrCode.callback = (res) => {
  if (res) {
    sendData(res);
    console.log(res);
    scanning = false;
    video.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
    canvasElement.hidden = true;
  }
};

function openScan() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function (stream) {
      scanning = true;
      canvasElement.hidden = false;
      video.setAttribute("playsinline", true);
      video.play();
      tick();
      scan();
    })
    .catch((error) => {
      alert(error);
    });
}

function tick() {
  canvasElement.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
  scanning && requestAnimationFrame(tick);
}

function scan() {
  try {
    qrCode.decode();
  } catch (e) {
    setTimeout(scan, 300);
  }
}
function sendData(data) {
  form.querySelector("input").value = data;
  form.submit();
}
