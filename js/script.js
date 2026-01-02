const URL = "./model/"; // Path ke folder model
let model, webcam, labelContainer, maxPredictions;
let lastPredictionTime = 0; // Untuk throttling

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(224, 224, flip); // Set resolusi ke 224x224 (ukuran standar MobileNet)
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
    if (now - lastPredictionTime > 500) { // Prediksi setiap 500ms
        await predict();
        lastPredictionTime = now;
    }
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Preprocessing: Resize canvas ke 224x224 jika perlu
    let image = tf.browser.fromPixels(webcam.canvas);
    image = tf.image.resizeBilinear(image, [224, 224]); // Resize ke 224x224
    image = image.div(255.0); // Normalize ke 0-1
    image = image.expandDims(0); // Tambah batch dimension

    const prediction = await model.predict(image); // Gunakan tensor yang diproses, bukan canvas langsung
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

    // Cleanup tensor untuk mencegah memory leak
    image.dispose();
}

function playSound(soundFile) {
    const audio = new Audio(soundFile);
    audio.play();
}

init();
