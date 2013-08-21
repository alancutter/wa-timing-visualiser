(function(){
'use strict';

window.addEventListener('load', function() {
  UI.init();
  Graph.init();

  UI.addEventListener('update', Data.load);
  Data.addEventListener('load', TimingModel.processData);
  Data.addEventListener('load', Graph.renderData);
  window.addEventListener('resize', Graph.renderData);

  UI.setData(Data.preset('test'));
});

})();
