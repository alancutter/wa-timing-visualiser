(function(){
'use strict';

var width;
var height;
var borderPadding = 20;
var textPaddingLeft = 2;
var textPaddingTop = 0;
var pixelsPerSecond = 60;
var itemHeight = 50;
var itemPadding = 50;

var canvas;
var context;


function renderData(data) {

}

function initCanvas() {
  canvas = document.querySelector('#canvas');
  width = window.innerWidth;
  canvas.width = width;
}

function resetCanvas() {
  height = (borderPadding * 2) + (nameList.length * itemHeight) + (Math.max(nameList.length - 1, 0) * itemPadding);
  canvas.height = height;
  context = canvas.getContext('2d');
  context.textBaseline = 'top';
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Second lines.
  context.strokeStyle = 'grey';
  context.beginPath();
  for (var x = borderPadding; x <= width - borderPadding; x += pixelsPerSecond) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  context.stroke();

  // Seconds.
  context.fillStyle = 'grey';
  for (var x = borderPadding, seconds = 0; x <= width - borderPadding; x += pixelsPerSecond, seconds++) {
    context.fillText(seconds, x + textPaddingLeft, textPaddingTop);
    context.fillText(seconds, x + textPaddingLeft, height - borderPadding + textPaddingTop);
  }

  // Item borders.
  context.lineWidth = 0.5;
  nameList.forEach(function(name) {
    var nameInfo = nameInfoMap[name];
    context.strokeStyle = nameInfo.colour;
    context.strokeRect(borderPadding, borderPadding + (nameInfo.index * (itemHeight + itemPadding)), width - (borderPadding * 2), itemHeight);
  });
  context.lineWidth = 1;

  // Item names.
  nameList.forEach(function(name) {
    var nameInfo = nameInfoMap[name];
    context.fillStyle = nameInfo.colour;
    context.fillText(name, borderPadding + textPaddingLeft, borderPadding + (nameInfo.index * (itemHeight + itemPadding)) + textPaddingTop);
  });
}

function colourForIndex(index) {
  return 'hsl(' + ((index * 200) % 360) + ', 100%, 50%)';
}


window.Graph = {
  renderData: renderData,
};

})();
