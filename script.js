const Model_URL = "models/pose/";

let model, maxPredictions;

window.onload = async function () {
  console.log("ページが読み込まれました。");
  if (typeof tmPose === "undefined") {
    console.error("tmPoseが未定義です。スクリプトが正しくロードされているか確認してください。");
    return;
  }
  await init();
}

async function init() {
  try {
    console.log("モデルのロード開始...");
    model = await tmPose.load(Model_URL + "model.json", Model_URL + "metadata.json");
    console.log("モデルロード完了");

    if (model) {
      maxPredictions = model.getTotalClasses();
      console.log("クラス数:", maxPredictions);
    } else {
      console.error("モデルがロードされませんでした。");
    }
  } catch (error) {
    console.error("モデルのロード中にエラーが発生しました。:", error);
  }
}

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