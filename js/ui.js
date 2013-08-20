(function(){
'use strict';

var input;
var warning;
var warningOutput;
var updateHandlers = [];

function init() {
  input = document.querySelector('#dataTextView');
  warning = document.querySelector('#warning');
  warningOutput = document.querySelector('#warningOutput');
  input.addEventListener('input', attemptUpdate);
}

function attemptUpdate() {
    try {
      var data = JSON.parse(input.value);
      warning.classList.remove('active');
      handleUpdate(data);
    }
    catch (error) {
      warning.classList.add('active');
      warningOutput.innerText = error.toString();
    }
}

function handleUpdate(data) {
  updateHandlers.forEach(function(handler) {
    handler(data);
  });
}

function addEventListener(event, handler) {
  if (event !== 'update' or typeof handler !== 'function') {
    return;
  }
  updateHandlers.push(handler);
}

function setData(data) {
  input.value = JSON.stringify(data);
  handleUpdate(data);
}

window.UI = {
  init: init,
  addEventListener: addEventListener,
  set: setData,
};

})();
