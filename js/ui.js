(function(){
'use strict';

var input;
var warning;
var warningReason;
var updateHandlers = [];

function init() {
  input = document.querySelector('#dataTextView');
  warning = document.querySelector('#warning');
  warningReason = document.querySelector('#warningReason');
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
      warningReason.innerText = error.toString();
    }
}

function handleUpdate(data) {
  updateHandlers.forEach(function(handler) {
    handler(data);
  });
}

function addEventListener(event, handler) {
  if (event !== 'update' || typeof handler !== 'function') {
    return;
  }
  updateHandlers.push(handler);
}

function setData(data) {
  input.value = JSON.stringify(data, null, 2);
  handleUpdate(data);
}

window.UI = {
  init: init,
  addEventListener: addEventListener,
  setData: setData,
};

})();
