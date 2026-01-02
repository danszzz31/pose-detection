const URL = "./model/"; // Path ke folder model
let model, webcam, labelContainer, maxPredictions;
let lastPredictionTime = 0; // Untuk throttling

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(150, 150, flip); // Kurangi resolusi dari 200x200 ke 150x150 untuk performa HP
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update();
    const now = Date.now();
    if (now - lastPredictionTime > 500) { // Prediksi hanya setiap 500ms, bukan setiap frame
        await predict();
        lastPredictionTime = now;
    }
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let detected = false;

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        if (prediction[i].probability > 0.8) {
            detected = true;
        }
    }

    if (detected) {
        playSound("./sounds/detect.mp3");
    }
}

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}

init();
