(function(){
'use strict';

window.addEventListener('load', function() {
  var data = Data.preset('test');
  UI.init();
  UI.addEventListener('update', Data.load);
  Data.addEventListener('load', Graph.renderData);
  window.addEventListener('resize', function() {
    Graph.renderData(Data.current());
  });

  UI.setData(Data.preset('test'));
});

function initCanvas() {
  canvas = document.querySelector('#canvas');
  width = window.innerWidth - 2;
  canvas.width = width;
}

function resetNames() {
  nameInfoMap = {};
  nameList = [];
}

function fireActiveAnimations(data, time, inheritedStartDelay, callback, param) {
  var result = transformedTime(data, time, inheritedStartDelay);
  var active = (result.region === 'during' || data.timing.fill === 'both' ||
    (result.region === 'before' && data.timing.fill === 'backwards') ||
    (result.region === 'after' && data.timing.fill === 'forwards'));
  if (!active) {
    return;
  }
  callback(data.name, result.fraction, param);
  switch (data.type) {
  case 'animation':
    break;
  case 'sequence': {
    var startDelay = inheritedStartDelay;
    for (var i = 0; i < data.children.length; i++) {
      var childData = data.children[i];
      fireActiveAnimations(childData, result.time, startDelay, callback, param);
      ensureTotalDuration(childData);
      startDelay += childData._totalDuration;
    }
    break;
  }
  case 'parallel':
    data.children.forEach(function(childData) {
      fireActiveAnimations(childData, result.time, inheritedStartDelay, callback, param);
    });
    break;
  default:
    assert(false, typeErrorMessage);
    break;
  }
}

function transformedTime(data, time, inheritedStartDelay) {
  var timing = data.timing;
  var result = {};
  ensureActiveDuration(data);
  var activeDuration = data._activeDuration;
  var shiftedTime = time - inheritedStartDelay;
  var clampedTime = shiftedTime;
  if (shiftedTime < timing.startDelay) {
    result.region = 'before';
    clampedTime = timing.startDelay;
  } else if (shiftedTime <= timing.startDelay + activeDuration) {
    result.region = 'during';
  } else {
    result.region = 'after';
    clampedTime = timing.startDelay + activeDuration;
  }
  var spedTime = (clampedTime - timing.startDelay) * timing.playbackRate;
  ensureIterationDuration(data);
  var iterationTime = spedTime / data._iterationDuration + timing.iterationStart;
  var iteration = Math.floor(iterationTime);
  iteration -= (iteration === (timing.iterations - timing.iterationStart));
  var direction = timing.direction;
  if (direction === 'alternate' || direction === 'alternate-reverse') {
    direction = ((iteration + (direction === 'alternate-reverse')) % 2) === 0 ? 'normal' : 'reverse';
  }
  var iterationFraction = iterationTime - iteration;
  if (direction === 'reverse') {
    iterationFraction = 1 - iterationFraction;
  }
  ensureTimingFunction(data);
  result.fraction = data._timingFunction(iterationFraction);
  result.time = result.fraction * data._iterationDuration;
  return result;
}

function ensureDefaultTimingValuesRecursive(data) {
  ensureDefaultTimingValues(data.timing);
  switch (data.type) {
  case 'animation':
    break;
  case 'sequence':
  case 'parallel':
    data.children.forEach(ensureDefaultTimingValuesRecursive);
    break;
  default:
    assert(false, typeErrorMessage);
    break;
  }
}

function ensureDefaultTimingValues(timing) {
  if (typeof timing.startDelay === 'undefined') {
    timing.startDelay = 0;
  }
  if (typeof timing.endDelay === 'undefined') {
    timing.endDelay = 0;
  }
  if (typeof timing.iterationStart === 'undefined') {
    timing.iterationStart = 0;
  }
  if (typeof timing.iterations === 'undefined') {
    timing.iterations = 1;
  }
  if (typeof timing.duration === 'undefined') {
    timing.duration = 'auto';
  }
  if (typeof timing.playbackRate === 'undefined') {
    timing.playbackRate = 1;
  }
  if (typeof timing.direction === 'undefined') {
    timing.direction = 'normal';
  }
  if (typeof timing.fill === 'undefined') {
    timing.fill = 'forwards';
  }
  if (typeof timing.easing === 'undefined') {
    timing.easing = 'linear';
  }
}

function ensureActiveDuration(data) {
  if (typeof data._activeDuration !== 'undefined') {
    return;
  }
  ensureIterationDuration(data);
  data._activeDuration = (data.timing.iterations * (data._iterationDuration / data.timing.playbackRate))
}

function ensureTotalDuration(data) {
  if (typeof data._totalDuration !== 'undefined') {
    return;
  }
  ensureActiveDuration(data);
  data._totalDuration = data.timing.startDelay + data._activeDuration + data.timing.endDelay;
}

function ensureIterationDuration(data) {
  if (typeof data._iterationDuration !== 'undefined') {
    return;
  }
  if (data.timing.duration !== 'auto') {
    data._iterationDuration = data.timing.duration;
    return;
  }
  switch (data.type) {
  case 'animation':
    data._iterationDuration = 0;
    break;
  case 'sequence': {
    data._iterationDuration = 0;
    data.children.forEach(function(childData) {
      ensureTotalDuration(childData);
      data._iterationDuration += childData._totalDuration;
    });
    break;
  }
  case 'parallel': {
    data._iterationDuration = 0;
    data.children.forEach(function(childData) {
      ensureTotalDuration(childData);
      data._iterationDuration = Math.max(childData._totalDuration, data._iterationDuration);
    });
    break;
  }
  default:
    assert(false, typeErrorMessage);
    break;
  }
}

function ensureTimingFunction(data) {
  if (typeof data._timingFunction !== 'undefined') {
    return;
  }
  var easing = data.timing.easing;
  var timing = null;
  if (easing in presetTimings) {
    timing = presetTimings[easing];
  } else {
    timing = SplineTiming.createFromString(easing);
  }
  if (timing) {
    data._timingFunction = timing.scaleTime.bind(timing);
  } else {
    data._timingFunction = linearTimingFunction;
  }
}

var linearTimingFunction = function(x) {
  return x;
}

var SplineTiming = function(controlPoints) {
  this.map = [];
  for (var ii = 0; ii <= 100; ii += 1) {
    var i = ii / 100;
    this.map.push([
      3*i*(1-i)*(1-i)*controlPoints[0] + 3*i*i*(1-i)*controlPoints[2] + i*i*i,
      3*i*(1-i)*(1-i)*controlPoints[1] + 3*i*i*(1-i)*controlPoints[3] + i*i*i
    ]);
  }
};

SplineTiming.prototype.createFromString = function(string) {
  var bezierMatch = /cubic-bezier\(([^,]*),([^,]*),([^,]*),([^)]*)\)/.exec(string);
  if (bezierMatch) {
    return new SplineTiming([
        Number(bezierMatch[1]),
        Number(bezierMatch[2]),
        Number(bezierMatch[3]),
        Number(bezierMatch[4])]);
  }
  return null;
};

SplineTiming.prototype.scaleTime = function(fraction) {
  var fst = 0;
  while (fst != 100 && fraction > this.map[fst][0]) {
    fst += 1;
  }
  if (fraction === this.map[fst][0] || fst === 0) {
    return this.map[fst][1];
  }
  var yDiff = this.map[fst][1] - this.map[fst - 1][1];
  var xDiff = this.map[fst][0] - this.map[fst - 1][0];
  var p = (fraction - this.map[fst - 1][0]) / xDiff;
  return this.map[fst - 1][1] + p * yDiff;
};

var presetTimings = {
  'linear': null,
  'ease': new SplineTiming([0.25, 0.1, 0.25, 1.0]),
  'ease-in': new SplineTiming([0.42, 0, 1.0, 1.0]),
  'ease-out': new SplineTiming([0, 0, 0.58, 1.0]),
  'ease-in-out': new SplineTiming([0.42, 0, 0.58, 1.0]),
};

function setGraphValue(name, value, x) {
  var graph = nameInfoMap[name].graph;
  while (graph.length < x) {
    graph.push(null);
  }
  if (x < graph.length) {
    graph[x] = value;
  } else {
    graph.push(value);
  }
}

function drawGraph(name) {
  var nameInfo = nameInfoMap[name];
  var graph = nameInfo.graph;
  var previousY = null;
  context.lineWidth = 2;
  context.strokeStyle = nameInfo.colour;
  for (var x = 0; x < graph.length; x++) {
    var value = graph[x];
    var y = null;
    if (value !== null) {
      y = borderPadding + (nameInfo.index * (itemHeight + itemPadding)) + itemHeight - (value * itemHeight);
      if (previousY === null) {
        context.beginPath();
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    } else if (previousY !== null) {
      context.stroke();
    }
    previousY = y;
  }
  if (previousY !== null) {
    context.stroke();
  }
  context.lineWidth = 1;
}


})();
