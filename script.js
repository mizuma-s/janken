const MODEL_URL = "models/pose/";
let net;
// 初期化処理
async function init() {
  try {
    console.log("PoseNet モデルのロードを開始...");
    net = await posenet.load();
    console.log("PoseNet モデルのロードが完了しました。");
    const videoElement = await initWebcam(); // カメラを初期化
    loop(videoElement); // 推論ループを開始
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
  }
}
// カメラの初期化
async function initWebcam() {
  try {
    console.log("カメラの初期化を開始します...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("カメラストリームを取得しました:", stream);
    const videoElement = document.getElementById("webcam");
    videoElement.srcObject = stream;
    await videoElement.play();
    console.log("カメラ映像が設定されました。");
    return videoElement;
  } catch (error) {
    console.error("カメラストリームの取得中にエラーが発生しました:", error);
    alert("カメラの初期化に失敗しました。ブラウザの設定やデバイスを確認してください。");
  }
}
// ポーズ推論
async function predictPose(videoElement) {
  try {
    // 推論を実行
    const pose = await net.estimateSinglePose(videoElement, {
      flipHorizontal: false, // 必要に応じて水平反転を有効化
    });
    console.log("推論結果:", pose);
    // 推論結果を処理
    document.getElementById("result").innerText = `Keypoints: ${pose.keypoints.length}`;
  } catch (error) {
    console.error("ポーズ推論中にエラーが発生しました:", error);
  }
}
// 推論ループ
async function loop(videoElement) {
  try {
    await predictPose(videoElement); // 推論を実行
    requestAnimationFrame(() => loop(videoElement)); // 次のフレームで再度呼び出し
  } catch (error) {
    console.error("ループ処理中にエラーが発生しました:", error);
  }
}
// ページ読み込み時に初期化を実行
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