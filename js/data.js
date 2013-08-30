(function(){
'use strict';

var presets = {
  test: {
    name: 'Parallel Container',
    type: 'parallel',
    timing: {
      easing: 'cubic-bezier(0, -.78, 1, 1.78)',
      // easing: 'linear',
    },
    children: [
      {
        name: 'Sequence A',
        type: 'sequence',
        children: [
          {
            name: 'A0',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
          {
            name: 'A1',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
          {
            name: 'A2',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
        ],
      },
      {
        name: 'Sequence B',
        type: 'sequence',
        children: [
          {
            name: 'B0',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
          {
            name: 'B1',
            type: 'animation',
            timing: {
              duration: 4,
            }
          },
          {
            name: 'B2',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
        ],
      },
      {
        name: 'Sequence C',
        type: 'sequence',
        children: [
          {
            name: 'C0',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
          {
            name: 'C1',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
          {
            name: 'C2',
            type: 'animation',
            timing: {
              duration: 3,
            }
          },
        ],
        timing: {
          delay: 1,
        }
      },
    ],
  }
}

var loadHandlers = [];
var currentData;
var nameIndexMap = {};
var nameList = [];

var typeError = new Error('Unknown data type encountered.');


function addEventListener(event, handler) {
  if (event !== 'load' || typeof handler !== 'function') {
    return;
  }
  loadHandlers.push(handler);
}

function preset(presetName) {
  return presets[presetName];
}

function load(data) {
  validateData(data);
  currentData = data;
  resetNames();
  registerNames(data);
  loadHandlers.forEach(function(callback) {
    callback(data);
  });
}

function validateData(data) {
  var knownName = {};
  function recursiveCheck(data) {
    if (typeof data.name !== 'undefined' && knownName[data.name]) {
      throw new Error('Duplicate name: ' + data.name);
    }
    knownName[data.name] = true;
    if (!(data.type === 'animation' || data.type === 'sequence' || data.type === 'parallel')) {
      throw new Error('Invalid type: ' + data.type + '. (name = ' + data.name + ')');
    }
    if (typeof data.timing !== 'object' && typeof data.timing !== 'undefined') {
      throw new Error('Timing parameters must be stored in an object. (name = ' + data.name + ')');
    }
    if (data.type === 'sequence' || data.type === 'parallel') {
      if (typeof data.children !== 'object') {
        throw new Error('Timing group ' + data.type + ' must have children list specified. (name = ' + data.name + ')');
      }
      data.children.forEach(recursiveCheck);
    }
  }
  recursiveCheck(data);
}

function resetNames() {
  nameIndexMap = {};
  nameList = [];
}

function registerNames(data) {
  if (typeof data.name !== 'undefined') {
    nameIndexMap[data.name] = nameList.length;
    nameList.push(data.name);
  }
  switch (data.type) {
  case 'animation':
    break;
  case 'sequence':
  case 'parallel':
    data.children.forEach(registerNames);
    break;
  default:
    throw typeError;
  }
}

function getCurrentData() {
  return currentData;
}

function nameCount() {
  return nameList.length;
}

function nameIndex(name) {
  return nameIndexMap[name];
}

function forEachName(callback) {
  nameList.forEach(callback);
}

window.Data = {
  addEventListener: addEventListener,
  preset: preset,
  load: load,
  current: getCurrentData,
  nameCount: nameCount,
  nameIndex: nameIndex,
  forEachName: forEachName,
  typeError: typeError,
};

})();
