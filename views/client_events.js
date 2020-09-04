var CANVAS_WIDTH = 1200;
var CANVAS_HEIGHT = 1000;
var INTERACTIVE_MODE = true;

var e = null;
var controller = null;
var colony = null;
var reportingEngine = null;

function loadEditor() {
  e = document.getElementById("graph");
  controller = new GraphController(e);
  controller.drawEnvironment();
  setupClientEvents();
  setupDefaultGraph();
  updateEnvironmentInfo();
}

function setupDefaultGraph() {
  controller.insertNode('starter', '170496', 'start');
  controller.insertNode('ender', '000000', 'goal');
  var start = controller.getNode('170496');
  var end = controller.getNode('000000');
  var node1 = controller.insertAnonymousNode();
  var node2 = controller.insertAnonymousNode();
  var node3 = controller.insertAnonymousNode();
  controller.insertLink(start, node1);
  controller.insertLink(node1, node2);
  controller.insertLink(node2, end);
  controller.insertLink(start, node3);
  controller.insertLink(node3, end);
}


function setupClientEvents() {
  document.addEventListener('keydown', (event) => insertLinkOnKeyPress());
  document.addEventListener('keydown', (event) => deleteNodeOnKeyPress());
  document.addEventListener('keydown', (event) => deleteLinkOnKeyPress());
  document.addEventListener('click', (event) => insertNodeOnClick());
  document.addEventListener('keydown', (event) => setNodeClassificationOnKeyPress());
}

function initAntColony(){
  var selectedAlgorithm = getSelectedAlgorithm();
  switch (selectedAlgorithm) {
    case 'S-ACO':
      colony = new AntColonySACO(controller);
      break;
    case 'AS-ACO':
      colony = new AntColonyASACO(controller);
      break;
    default:
      alert('No valid algorithm selected.');
      return;
  }
  reportingEngine = new ReportingEngine(colony);
  fetchAlgorithmParams(colony);
  fetchReportingParams(reportingEngine);
 
}


async function run() {
  if(!colony){
    alert('No algorithm selected. Please select an algorithm from the corresponding tab.');
    return;
  }
  if(!confirm('Run "' + colony.name + '" with the selected settings?'))
    return;
  setAlgorithmParams(colony);
  colony.reset();
  disableAlgorithmButtons();
  var solution = await colony.ACOMetaHeuristic();
  reportResults();
  enableAlgorithmButtons();
}

async function runReportingMode() {
  if(!colony){
    alert('No algorithm selected. Please select an algorithm from the corresponding tab.');
    return;
  }
  if(!confirm('Run "' + colony.name + '" with the selected settings in reporting mode?'))
    return;
  INTERACTIVE_MODE = false;
  controller.disableGraphicsInteraction();
  setAlgorithmParams(colony);
  colony.reset();
  disableAlgorithmButtons();
  var solution = await reportEngine.report();
  console.log('HERES A SOLUTION:');
  console.table(solution);
  reportResults();
  controller.enableGraphicsInteraction();
  enableAlgorithmButtons();
}

function insertNodeOnKeyPress() {
  let key = event.key;
  if (key === '+') {
    controller.insertNode('');
    updateEnvironmentInfo();
  }
}

function insertNodeOnClick() {
  if(!INTERACTIVE_MODE)
    return;
  let x = event.clientX;
  let y = event.clientY;
  if (x < CANVAS_WIDTH && y < CANVAS_HEIGHT)
    controller.insertNodeAt('', null, 'normal', x, y);
    updateEnvironmentInfo();
}


function insertLinkOnKeyPress() {
  if(!INTERACTIVE_MODE)
    return;
  let key = event.key;
  if (key === '-') {
    controller.insertLinkFromUserSelection();
    updateEnvironmentInfo();   
  }
}


function deleteNodeOnKeyPress() {
  if(!INTERACTIVE_MODE)
    return;
  let key = event.key;
  if (key === 'Delete') {
    controller.deleteNodeFromUserSelection();
    updateEnvironmentInfo();
  }

}


function deleteLinkOnKeyPress() {
  if(!INTERACTIVE_MODE)
    return;
  let key = event.key;
  if (key === 'Backspace') {
    controller.deleteLinkFromUserSelection();
    updateEnvironmentInfo();
  }
}


function setNodeClassificationOnKeyPress() {
  if(!INTERACTIVE_MODE)
    return;
  switch (event.key) {
    case 'g':
      controller.setNodeClassificationFromUserSelection('goal', true);
      break;
    case 's':
      controller.setNodeClassificationFromUserSelection('start', true);
      break;
    case 'n':
      controller.setNodeClassificationFromUserSelection('normal', false);
      break;
  }
}


function showWaitDialog(message) {    
  message = message || 'Please wait...';
  if (document.querySelector("#waitDialog") == null) {
      var modalLoading = `<div class="modal" id="waitDialog" data-backdrop="static" data-keyboard="false" role="dialog">\
          <div class="modal-dialog">\
              <div class="modal-content">\
                  <div class="modal-header">\
                      <h4 class="modal-title">${message}</h4>\
                  </div>\
                  <div class="modal-body">\
                      <div class="progress">\
                        <div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar"\
                        aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%; height: 40px">\
                        </div>\
                      </div>\
                  </div>\
              </div>\
          </div>\
      </div>`;
      $(document.body).append(modalLoading);
  }

  $("#waitDialog").modal("show");
}


function hideWaitDialog() {
  $("#waitDialog").modal("hide");
}