async function startCamera() {
  const videoElement = document.getElementById("webcam");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    console.log("カメラにアクセス成功");
  } catch (error) {
    console.error("カメラにアクセスできません:", error);
  }
}
// ページ読み込み時にカメラを起動
window.onload = startCamera;