(function(){
'use strict';

var mockAnimationTarget = {};
var mockTimeline = {
  currentTime: null,
};

var rootTimedItem;
var timedItemMap = {};


function processData() {
  timedItemMap = {};
  rootTimedItem = new SeqGroup([buildTimedItem(Data.current())]);
}

function buildTimedItem(data) {
  var timedItem;
  switch (data.type) {
  case 'animation':
    timedItem = new Animation(mockAnimationTarget, null, data.timing)
    break;
  case 'sequence':
  case 'parallel': {
    var timedItemList = [];
    data.children.forEach(function(childData) {
      timedItemList.push(buildTimedItem(childData));
    });
    var groupConstructor = data.type === 'sequence' ? SeqGroup : ParGroup;
    timedItem = new groupConstructor(timedItemList, data.timing);
    break;
  }
  default:
    throw Data.typeError;
  }
  if (typeof data.name !== 'undefined') {
    timedItemMap[data.name] = timedItem;
  }
  return timedItem;
}

function forEachActiveNamedItemAtTime(time, callback, param) {
  rootTimedItem._updateInheritedTime(time);
  Data.forEachName(function(name) {
    callback(name, timedItemMap[name]._timeFraction, param);
  });
}

window.TimingModel = {
  processData: processData,
  forEachActiveNamedItemAtTime: forEachActiveNamedItemAtTime,
};

})();
