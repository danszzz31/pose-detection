const URL = "./model/"; // Path ke folder model
let model, webcam, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true; // Flip kamera untuk HP
    webcam = new tmImage.Webcam(200, 200, flip);
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
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    let detected = false; // Flag untuk cek apakah ada pose terdeteksi

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;

        // Jika probabilitas > 0.8 untuk pose mana pun, set detected = true
        if (prediction[i].probability > 0.8) {
            detected = true;
        }
    }

    // Jika ada pose terdeteksi, mainkan sound tunggal
    if (detected) {
        playSound("./sounds/selamat.mp3");
    }
}

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}

init();