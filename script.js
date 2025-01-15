const MODEL_URL = "models/pose/";
const LINE_NOTIFY_TOKEN = "YOUR_LINE_NOTIFY_ACCESS_TOKEN"; // 必要に応じてトークンを変更
let model, webcam, maxPredictions;
window.onload = async function () {
  console.log("ページが読み込まれました。");
  // モデルとカメラの初期化
  try {
    await initModel();
    await initWebcam();
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
    alert("初期化に失敗しました。設定を確認してください。");
  }
};
async function initModel() {
  try {
    console.log("モデルのロード開始...");
    model = await tmPose.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
    console.log("モデルロード完了");
    maxPredictions = model.getTotalClasses();
    console.log("クラス数:", maxPredictions);
  } catch (error) {
    console.error("モデルのロード中にエラーが発生しました:", error);
    throw error;
  }
}
async function initWebcam() {
  try {
    console.log("カメラの初期化を開始します...");
    webcam = new tmPose.Webcam(500, 500, true); // サイズ: 500x500, 水平反転: true
    await webcam.setup();
    console.log("webcam.setup() が完了しました。");
    await webcam.play();
    console.log("webcam.play() が完了しました。");
    const videoElement = document.getElementById("webcam");
    if (webcam.webcam instanceof MediaStream) {
      videoElement.srcObject = webcam.webcam;
      console.log("カメラストリームが設定されました。");
    } else {
      throw new Error("webcam.webcam は MediaStream 型ではありません");
    }
  } catch (error) {
    console.error("カメラの初期化中にエラーが発生しました:", error);
    throw error;
  }
}
async function loop() {
  try {
    webcam.update(); // カメラ映像を更新
    await predict(); // 推論処理
    window.requestAnimationFrame(loop);
  } catch (error) {
    console.error("ループ処理中にエラーが発生しました:", error);
  }
}
async function predict() {
  try {
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
  } catch (error) {
    console.error("推論中にエラーが発生しました:", error);
  }
}
function sendLineNotify(message) {
  console.log("LINE Notify送信中...");
  fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Bearer ${LINE_NOTIFY_TOKEN}`
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






