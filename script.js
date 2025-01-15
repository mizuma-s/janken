let model, webcam, maxPredictions;
async function init() {
  try {
    // モデルとメタデータのパス
    const modelURL = "./models/pose/model.json";
    const metadataURL = "./models/pose/metadata.json";
    // Teachable Machine のモデルをロード
    console.log("モデルをロード中...");
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    console.log("モデルのロード完了。");
    // カメラを初期化
    webcam = new tmPose.Webcam(500, 500, true); // サイズ: 500x500, 水平反転: true
    await webcam.setup(); // カメラをセットアップ
    await webcam.play(); // カメラを再生
    console.log("カメラの初期化完了。");
    // HTML の video 要素にカメラ映像を設定
    document.getElementById("webcam").srcObject = webcam.webcam;
    // 推論ループを開始
    loop();
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
  }
}
// 推論ループ
async function loop() {
  try {
    webcam.update(); // カメラの映像を更新
    await predict(); // 推論を実行
    requestAnimationFrame(loop); // 次のフレームで再度呼び出し
  } catch (error) {
    console.error("ループ処理中にエラーが発生しました:", error);
  }
}
// 推論を実行
async function predict() {
  try {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas); // カメラ映像からポーズを推論
    const prediction = await model.predict(posenetOutput); // 推論結果を取得
    // 推論結果を処理
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
// ページが読み込まれたときに初期化を実行
window.onload = init;