'use strict';

var testData = {
    name: 'test',
    type: 'animation',
    timing: {
        easing: 'linear',
        direction: 'alternate',
        iterationStart: 0.5,
        iterations: 4,
        duration: 2,
        playbackRate: 2,
        activeDuration: 8,
        delay: 1,
        fill: 'both',
    }
};

var canvas;
var context;

var width = 800;
var height = 600;

var borderPadding = 10;
var pixelsPerSecond = 60;

function initCanvas() {
    canvas = document.querySelector('#canvas');
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext('2d');
}

function resetCanvas() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = 'grey';
    context.beginPath();
    for (var x = borderPadding; x <= width - borderPadding; x += pixelsPerSecond) {
        context.moveTo(x, borderPadding);
        context.lineTo(x, height - borderPadding);
    }
    context.stroke();
}

function fireActiveAnimations(data, time, callback, param) {
    var result = transformedTime(data.timing, time);
    var active = (result.region === 'during' || data.timing.fill === 'both' ||
        (result.region === 'before' && data.timing.fill === 'backwards') ||
        (result.region === 'after' && data.timing.fill === 'forwards'));
    if (!active) {
        return;
    }
    callback(data.name, result.fraction, param);
}

function transformedTime(timing, time) {
    var result = {};
    var activeDuration = timing.activeDuration;
    if (activeDuration === 'auto') {
        activeDuration = timing.iterations * (timing.duration / timing.playbackRate);
    }

    var clampedTime = time;
    if (time < timing.delay) {
        result.region = 'before';
        clampedTime = timing.delay;
    } else if (time > timing.delay + activeDuration) {
        result.region = 'after';
        clampedTime = timing.delay + activeDuration;
    } else {
        result.region = 'during';
    }
    var spedTime = (clampedTime - timing.delay) * timing.playbackRate;
    var iterationTime = spedTime / timing.duration + timing.iterationStart;
    var iteration = Math.floor(iterationTime);
    var direction = timing.direction;
    if (direction === 'alternate' || direction === 'alternate-reverse') {
        direction = ((iteration + (direction === 'alternate-reverse')) % 2) === 0 ? 'normal' : 'reverse';
    }
    var fraction = iterationTime - iteration;
    if (direction === 'reverse') {
        fraction = 1 - fraction;
    }
    result.fraction = scaledFraction(timing.easing, fraction);
    result.time = result.fraction * timing.duration;
    return result;
}

function scaledFraction(easing, fraction) {
    // FIXME: Implement.
    return fraction;
}

function drawState(name, value, x) {
    context.fillStyle = 'blue';
    context.fillRect(x, height - borderPadding - value * pixelsPerSecond, 1, 1);
}


window.addEventListener('load', function() {
    initCanvas();
    resetCanvas();
    for (var x = borderPadding; x <= width - borderPadding; x++) {
        var time = (x - borderPadding) / pixelsPerSecond;
        fireActiveAnimations(testData, time, drawState, x);
    }
});