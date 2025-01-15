const MODEL_URL = "models/pose/";
let model;
async function init() {
  try {
    console.log("モデルのロードを開始します...");
    model = await tmPose.load("models/pose/model.json", "models/pose/metadata.json");
    console.log("モデルのロードが完了しました。");
    const stream = await initWebcam(); // カメラストリームを取得
    const videoElement = document.getElementById("webcam");
    // フレームの更新ループを開始
    loop(videoElement);
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
  }
}
async function initWebcam() {
  try {
    console.log("カメラの初期化を開始します...");
    // カメラストリームを取得
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("カメラストリームを取得しました:", stream);
    // <video> 要素にストリームを設定
    const videoElement = document.getElementById("webcam");
    videoElement.srcObject = stream;
    videoElement.play();
    console.log("カメラ映像が設定されました。");
    return stream; // 取得した MediaStream を返す
  } catch (error) {
    console.error("カメラストリームの取得中にエラーが発生しました:", error);
    alert("カメラの初期化に失敗しました。ブラウザの設定やデバイスを確認してください。");
  }
}
async function predictPose(videoElement) {
  try {
    console.log("ポーズ推論を開始します...");
    const { pose, posenetOutput } = await model.estimatePose(videoElement);
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
    console.log("ポーズ推論結果:", detectedPose, highestConfidence);
  } catch (error) {
    console.error("ポーズ推論中にエラーが発生しました:", error);
  }
}
async function loop(videoElement) {
  try {
    await predictPose(videoElement);
    requestAnimationFrame(() => loop(videoElement));
  } catch (error) {
    console.error("ループ処理中にエラーが発生しました:", error);
  }
}
window.onload = init;

async function loop(videoElement) {
  try {
    // フレームごとにポーズ推論を実行
    await predictPose(videoElement);
    requestAnimationFrame(() => loop(videoElement));
  } catch (error) {
    console.error("ループ処理中にエラーが発生しました:", error);
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