
let modelPromise;

let image = new Image();
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

window.onload = () => modelPromise = cocoSsd.load();

function onLoadImage(img) {
    return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
    });
}

let runButton = document.getElementById('run');
runButton.onclick = function () {
    var img = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    reader.onloadend = async () => {

        image.src = reader.result;
        await onLoadImage(image);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '10px Arial';

        if (image.width > 600) {
            context.drawImage(image, 0, 0, image.width, image.height, 0, 0, 600, 399);
        } else {
            context.drawImage(image, 0, 0);
        }

        const model = await modelPromise;
        console.log('model loaded');
        console.time('predict1');
        const result = await model.detect(canvas);
        console.timeEnd('predict1');

        console.log('number of detections: ', result.length);
        for (let i = 0; i < result.length; i++) {
            context.beginPath();
            context.rect(...result[i].bbox);
            context.lineWidth = 1;
            context.strokeStyle = 'green';
            context.fillStyle = 'green';
            context.stroke();
            context.fillText(
                result[i].score.toFixed(3) + ' ' + result[i].class, result[i].bbox[0],
                result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
        }
    }

    if (img) {
        reader.readAsDataURL(img);
    }
};