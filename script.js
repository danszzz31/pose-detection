const MODEL_URL = "./model/";

let model;
let webcam;
let lastTriggered = false;

const CONFIDENCE_THRESHOLD = 0.9;

const poseEl = document.getElementById("pose");
const confEl = document.getElementById("confidence");
const startBtn = document.getElementById("startBtn");

// === SOUND (1 POSE) ===
const sound = new Audio("./sounds/selamat.mp3");

// === INIT ===
async function init() {
  model = await tmPose.load(
    MODEL_URL + "model.json",
    MODEL_URL + "metadata.json"
  );

  webcam = new tmPose.Webcam(360, 640, true);
  await webcam.setup();
  await webcam.play();

  document.getElementById("webcam").srcObject = webcam.stream;
  loop();
}

// === LOOP ===
async function loop() {
  webcam.update();

  const { posenetOutput } = await model.estimatePose(webcam.canvas);
  const predictions = await model.predict(posenetOutput);

  const p = predictions[0]; // cuma 1 label

  poseEl.textContent = p.className;
  confEl.textContent = Math.round(p.probability * 100) + "%";

  if (p.className === "selamat" && p.probability > CONFIDENCE_THRESHOLD) {
    if (!lastTriggered) {
      sound.currentTime = 0;
      sound.play();
      lastTriggered = true;
    }
  } else {
    lastTriggered = false;
  }

  requestAnimationFrame(loop);
}

// === START (UNLOCK AUDIO) ===
startBtn.onclick = async () => {
  await sound.play();
  sound.pause();
  sound.currentTime = 0;

  startBtn.style.display = "none";
  init();
};
