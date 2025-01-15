const MODEL_URL = "models/pose/";
let model, webcam, maxPredictions;
window.onload = async function () {
  console.log("ページが読み込まれました。");
  try {
    await initModel();
    console.log("モデルの初期化が完了しました。");
    await initWebcam();
    console.log("カメラの初期化が完了しました。");
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error.message);
    alert("初期化に失敗しました。設定を確認してください。");
  }
};
async function initModel() {
  console.log("モデルのロード開始...");
  model = await tmPose.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
  console.log("モデルロード完了");
  maxPredictions = model.getTotalClasses();
  console.log("クラス数:", maxPredictions);
}
async function initWebcam() {
  try {
    console.log("カメラの初期化を開始します...");
    webcam = new tmPose.Webcam(500, 500, true);
    await webcam.setup();
    console.log("webcam.setup() が完了しました。");
    await webcam.play();
    console.log("webcam.play() が完了しました。");
    const videoElement = document.getElementById("webcam");
    if ("srcObject" in videoElement) {
      videoElement.srcObject = webcam.webcam;
      console.log("カメラストリームが設定されました。");
    } else {
      videoElement.src = window.URL.createObjectURL(webcam.webcam); // フォールバック処理
      console.log("フォールバック処理を実行しました。");
    }
  } catch (error) {
    console.error("カメラの初期化中にエラーが発生しました:", error.message);
    console.error("詳細エラー:", error);
    alert("カメラの初期化に失敗しました。ブラウザの設定やデバイスを確認してください。");
  }
}
async function loop() {
  try {
    webcam.update(); // カメラのフレームを更新
    await predict(); // 推論処理
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("ループ中にエラーが発生しました:", error);
  }
}
async function predict() {
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);
  let highestConfidence = 0;
  let detectedPose = "";
  prediction.forEach(p => {
    if (p.probability > highestConfidence) {
      highestConfidence = p.probability;
      detectedPose = p.className;
    }
  });
  document.getElementById("result").innerText = `${detectedPose} (${(highestConfidence * 100).toFixed(2)}%)`;
  if (highestConfidence > 0.8) {
    sendLineNotify(`Detected Pose: ${detectedPose}`);
  }
}
function sendLineNotify(message) {
  fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer YOUR_LINE_NOTIFY_ACCESS_TOKEN`
    },
    body: `message=${encodeURIComponent(message)}`
  })
    .then(response => {
      if (response.ok) {
        console.log("LINE Notify送信成功");
      } else {
        console.error("LINE Notify送信失敗");
      }
    })
    .catch(error => {
      console.error("LINE Notify送信中にエラーが発生しました:", error);
    });
}