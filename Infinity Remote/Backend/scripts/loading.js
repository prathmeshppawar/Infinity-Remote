const socket = io("https://infinity-remote.herokuapp.com/");
socket.emit("newUser", roomId);

socket.on("connectionEstablished", () => {
  document.getElementById("room").value = roomId;
  document.getElementById("remote").submit();
});

socket.on("remoteAlreadyConnected", () => {
  document.getElementById("secondConnection").submit();
});

socket.on("invalidQR", () => {
  document.getElementById("invalidQR").submit();
});
