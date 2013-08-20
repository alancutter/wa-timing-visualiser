(function(){
'use strict';

var input;
var warning;
var warningReason;
var loadButtonContainer;
var updateHandlers = [];
var saveList = [];

function init() {
  input = document.querySelector('#dataTextView');
  warning = document.querySelector('#warning');
  warningReason = document.querySelector('#warningReason');
  loadButtonContainer = document.querySelector('#loadButtonContainer');
  input.addEventListener('input', attemptUpdate);
  input.addEventListener('keydown', keydownHandler);
  document.querySelector('#saveButton').addEventListener('click', saveContents);
  document.querySelector('#clearSavesButton').addEventListener('click', clearSaves);
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

function keydownHandler(event) {
  var keyCodeTab = 9;
  var keyCode0 = 48;
  var keyCode9 = 57;
  var keyCodeC = 67;
  var keyCodeS = 83;
  switch (event.keyCode) {
  case keyCodeTab: {
    event.preventDefault();
    var value = input.value;
    var selectionEnd = input.selectionEnd;
    input.value = value.slice(0, input.selectionStart) + '  ' + value.slice(selectionEnd);
    input.selectionStart = input.selectionEnd = selectionEnd + 2;
    break;
  }
  case keyCodeC:
    if (event.altKey) {
      clearSaves();
    }
    break;
  case keyCodeS:
    if (event.ctrlKey) {
      event.preventDefault();
      saveContents();
    }
    break;
  }
  if (event.altKey && event.keyCode >= keyCode0 && event.keyCode <= keyCode9) {
    var slot = event.keyCode - keyCode0;
    if (slot < saveList.length) {
      loadContents(slot);
    }
  }
}

function saveContents() {
  var slot = saveList.length;
  saveList.push(input.value);
  var button = document.createElement('button');
  button.innerText = 'Load ' + slot;
  button.addEventListener('click', function() {
    loadContents(slot);
  });
  if (slot < 10) {
    button.setAttribute('title', 'Alt-' + slot + ' in text area');
  }
  loadButtonContainer.appendChild(button);
}

function clearSaves() {
  saveList = [];
  while (loadButtonContainer.hasChildNodes()) {
    loadButtonContainer.removeChild(loadButtonContainer.lastChild);
  }
}

function loadContents(slot) {
  input.value = saveList[slot];
  attemptUpdate();
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
