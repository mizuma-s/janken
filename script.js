const MODEL_URL = "models/pose/";
let model;
async function init() {
  try {
    const modelURL = "./models/pose/model.json";
    const metadataURL = "./models/pose/metadata.json";
    console.log("モデルをロード中...");
    model = await tmPose.load(modelURL, metadataURL);
    console.log("モデルのロードが完了しました。");
    // カメラの初期化
    const videoElement = document.getElementById("webcam");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    await videoElement.play();
    console.log("カメラの初期化が完了しました。");
    // 推論ループを開始
    loop(videoElement);
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
  }
}
async function loop(videoElement) {
  try {
    console.log("ループ開始: videoElement の確認中...");
    console.log("videoElement:", videoElement); // **1. videoElement の内容をログ出力**
    await predictPose(videoElement); // 推論処理を実行
    requestAnimationFrame(() => loop(videoElement)); // 次のフレームで再度呼び出し
  } catch (error) {
    console.error("ループ処理中にエラーが発生しました:", error);
  }
}
async function predictPose(videoElement) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    console.log("canvas に描画完了。推論を開始します...");
    // ポーズ推論
    const { pose, posenetOutput } = await model.estimatePose(canvas);
    console.log("pose:", pose); // **2. pose の内容をログ出力**
    console.log("posenetOutput:", posenetOutput); // **3. posenetOutput の内容をログ出力**
    const prediction = await model.predict(posenetOutput);
    console.log("prediction:", prediction); // 推論結果をログ出力
    let highestConfidence = 0;
    let detectedPose = "";
    prediction.forEach(p => {
      if (p.probability > highestConfidence) {
        highestConfidence = p.probability;
        detectedPose = p.className;
      }
    });
    document.getElementById("result").innerText = `${detectedPose} (${(highestConfidence * 100).toFixed(2)}%)`;
    console.log("推論結果:", detectedPose, highestConfidence);
  } catch (error) {
    console.error("推論中にエラーが発生しました:", error);
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