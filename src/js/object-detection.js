import "regenerator-runtime/runtime";

// import * as tfconv from '@tensorflow/tfjs-converter';
// import * as tf from '@tensorflow/tfjs';
// import * as cocoSsd from '@tensorflow-models/coco-ssd';

let modelPromise;
let image = new Image();
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

window.onload = () => {
    // if (!localStorage.getItem('model')) {
    //     localStorage.setItem('model', modelPromise);
    // }

    // cocoSsd.load().then(model => {
    //     modelPromise = model;
    // });

    modelPromise = tf.loadGraphModel('web_model/model.json')
};


function onLoadImage(img) {
    return new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
    });
}

let runButton = document.getElementById('imgObj');
runButton.onchange = function () {
    var img = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();

    reader.onloadend = async () => {

        image.src = reader.result;
        await onLoadImage(image);
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        const model = await modelPromise;

        var preparedInput = tf.tidy(function () {
            img = tf.browser.fromPixels(canvas);
            img = tf.image.resizeBilinear(img, [100, 100]);
            img = img.div(255.);
            img = img.round(2);
            return img.expandDims(0);
        });

        console.time('predict1');
        var result = await model.predict(preparedInput).data();
        console.timeEnd('predict1');

        var catPredict = Math.floor(result[0] * 100);
        var dogPredict = Math.floor(result[1] * 100);

        $("#preds").removeClass('d-none');

        $('#cat-progress').css('width', catPredict+'%').attr('aria-valuenow', catPredict); 
        $('#dog-progress').css('width', dogPredict+'%').attr('aria-valuenow', dogPredict); 

        $('#cat-pred').text(catPredict+'%');
        $('#dog-pred').text(dogPredict+'%');

        preparedInput.dispose(catPredict);
        tf.dispose(result);


        // if (image.width > 800) {
        //     context.font = '40px Arial';
        //     context.lineWidth = 7;
        // } else {
        //     context.font = '20px Arial';
        //     context.lineWidth = 2;
        // }

        // console.log('model loaded');
        // console.time('predict1');
        // const result = await model.detect(canvas);
        // console.timeEnd('predict1');

        // console.log('number of detections: ', result.length);
        // for (let i = 0; i < result.length; i++) {
        //     context.beginPath();
        //     context.rect(...result[i].bbox);
        //     context.strokeStyle = 'green';
        //     context.fillStyle = 'green';
        //     context.stroke();
        //     context.fillText(
        //         result[i].class,
        //         result[i].bbox[0],
        //         result[i].bbox[1] > 10 ? result[i].bbox[1] - 5 : 10);
        // }
    }

    if (img) {
        reader.readAsDataURL(img);
    }
};