const MODEL_URL = "./model/";

let model;
let webcam;
let triggered = false;

const CONFIDENCE_THRESHOLD = 0.9;

const poseEl = document.getElementById("pose");
const confEl = document.getElementById("confidence");
const startBtn = document.getElementById("startBtn");

const sound = new Audio("./sounds/selamat.mp3");

// ===== INIT =====
async function init() {
  model = await tmPose.load(
    MODEL_URL + "model.json",
    MODEL_URL + "metadata.json"
  );

  webcam = new tmPose.Webcam(360, 640, true);

  // PENTING: pakai facingMode
  await webcam.setup({ facingMode: "user" });
  await webcam.play();

  // FIX UTAMA: ini yang bikin kamera muncul
  const video = document.getElementById("webcam");
  video.srcObject = webcam.webcam;
  await video.play();

  loop();
}

// ===== LOOP =====
async function loop() {
  webcam.update();

  const { posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);

  const p = prediction[0]; // cuma 1 pose

  poseEl.textContent = p.className;
  confEl.textContent = Math.round(p.probability * 100) + "%";

  if (p.className === "selamat" && p.probability > CONFIDENCE_THRESHOLD) {
    if (!triggered) {
      sound.currentTime = 0;
      sound.play();
      triggered = true;
    }
  } else {
    triggered = false;
  }

  requestAnimationFrame(loop);
}

// ===== START BUTTON =====
startBtn.onclick = () => {
  // unlock audio (tanpa await biar gak ngeblok)
  sound.play().catch(() => {});
  sound.pause();
  sound.currentTime = 0;

  startBtn.style.display = "none";
  init();
};
