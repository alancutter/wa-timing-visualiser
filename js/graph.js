(function(){
'use strict';

var borderPadding = 20;
var textPaddingLeft = 2;
var textPaddingTop = 0;
var pixelsPerSecond = 60;
var itemHeight = 50;
var itemPadding = 50;

var canvas;
var context;

var width;
var height;
var itemCount;
var graphMap;

function init() {
  canvas = document.querySelector('#canvas');
}

function renderData() {
  ensureCanvasSize();
  renderBackground();
  renderSeconds();
  renderItemContainers();
  resetGraphData();
  generateGraphData();
  renderGraphData();
}

function ensureCanvasSize() {
  if (width === window.innerWidth && Data.nameCount() === itemCount) {
    return;
  }
  width = window.innerWidth;
  height = (borderPadding * 2) + (Data.nameCount() * itemHeight) + (Math.max(Data.nameCount() - 1, 0) * itemPadding);
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext('2d');
}

function renderBackground() {
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);
}

function renderSeconds() {
  // Lines.
  context.strokeStyle = 'grey';
  context.beginPath();
  for (var x = borderPadding; x <= width - borderPadding; x += pixelsPerSecond) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  context.stroke();

  // Numbers.
  context.textBaseline = 'top';
  context.fillStyle = 'grey';
  for (var x = borderPadding, seconds = 0; x <= width - borderPadding; x += pixelsPerSecond, seconds++) {
    context.fillText(seconds, x + textPaddingLeft, textPaddingTop);
    context.fillText(seconds, x + textPaddingLeft, height - borderPadding + textPaddingTop);
  }
}

function renderItemContainers() {
  // Borders.
  context.lineWidth = 0.5;
  Data.forEachName(function(name) {
    var index = Data.nameIndex(name);
    context.strokeStyle = colourForIndex(index);
    context.strokeRect(borderPadding, borderPadding + (index * (itemHeight + itemPadding)), width - (borderPadding * 2), itemHeight);
  });
  context.lineWidth = 1;

  // Names.
  Data.forEachName(function(name) {
    var index = Data.nameIndex(name);
    context.fillStyle = colourForIndex(index);
    context.fillText(name, borderPadding + textPaddingLeft, borderPadding + (index * (itemHeight + itemPadding)) + textPaddingTop);
  });
}

function colourForIndex(index) {
  return 'hsl(' + ((index * 200) % 360) + ', 100%, 50%)';
}

function resetGraphData() {
  graphMap = {};
  Data.forEachName(function(name) {
    graphMap[name] = [];
  });
}

function generateGraphData() {
  for (var x = borderPadding; x <= width - borderPadding; x++) {
    var time = (x - borderPadding) / pixelsPerSecond;
    Timing.forEachActiveNamedItem(Data.current(), time, 0, setGraphValue, x);
  }
}

function setGraphValue(name, value, x) {
  var graph = graphMap[name];
  while (graph.length < x) {
    graph.push(null);
  }
  if (x < graph.length) {
    graph[x] = value;
  } else {
    graph.push(value);
  }
}

function renderGraphData() {
  Data.forEachName(function(name) {
    var index = Data.nameIndex(name);
    var graph = graphMap[name];
    var previousY = null;
    context.lineWidth = 2;
    context.strokeStyle = colourForIndex(index);
    for (var x = 0; x < graph.length; x++) {
      var value = graph[x];
      var y = null;
      if (value !== null) {
        y = borderPadding + (index * (itemHeight + itemPadding)) + itemHeight - (value * itemHeight);
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
  });
}

window.Graph = {
  init: init,
  renderData: renderData,
};

})();
