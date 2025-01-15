const MODEL_URL = "models/pose/";
let model, webcam;
async function init() {
  try {
    const modelURL = "./models/pose/model.json";
    const metadataURL = "./models/pose/metadata.json";
    console.log("モデルをロード中...");
    model = await tmPose.load(modelURL, metadataURL);
    console.log("モデルのロード完了。");
    webcam = new tmPose.Webcam(500, 500, true); // サイズ: 500x500, 水平反転
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam").srcObject = webcam.webcam;
    console.log("カメラ初期化完了。");
    loop();
  } catch (error) {
    console.error("初期化エラー:", error);
  }
}
async function loop() {
  try {
    webcam.update(); // カメラ映像を更新
    await predict(); // 推論を実行
    requestAnimationFrame(loop);
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