//Dyamically update particles -> https://github.com/vasturiano/force-graph/issues/116
// Graph search -> https://github.com/vasturiano/force-graph/issues/16
// TODO: remove "Pheromone" property reference to make everything more generic.
// Set the property at runtime with some function.
// Same goes for node noOfAnts.
class GraphEditor {
  constructor(domElem) {
    this.domElem = domElem;
    this.NODE_REL_SIZE = 15;
    this.selectedNodes = [];
    this.selectedLink = null;
    this.nodeLabelProperties = [];
    this.linkLabelProperties = [];
    this.graphObj = ForceGraph();

    //this.setupGraphicEvents();
    //this.initGraph();
    //this.setupEvents();
    //this.setupCanvas();
  }

  render(){
    this.initGraph();
    this.setupEvents();
    this.setupCanvas();   
  }

  initGraph() {
    this.graphObj
      .width(1400)
      //.height(800)
      .nodeRelSize(this.NODE_REL_SIZE) // Solve this stuff
      .nodeAutoColorBy('classification')
      .backgroundColor('white')
      .nodeLabel(node => {
        var nodeLabel = 'Id: ' + node.id + '<br>Type: ' + node.classification + '<br>';
        this.nodeLabelProperties.forEach(prop => nodeLabel += prop.caption + ': ' + node[prop.name] + '<br>'); 
        return nodeLabel;
      })
      .cooldownTicks(0)
      .linkColor((link) => (link === this.selectedLink ? 'blue' : 'grey'))
      .linkWidth((link) => (link === this.selectedLink ? 5 : 1))
      .linkDirectionalParticles(0)
      .linkDirectionalParticleSpeed(0.001)
      .linkDirectionalParticleColor((link) => link.isMainLink ? 'red' : 'purple')
      //.linkDirectionalParticleColor(() => 'red')
      .linkDirectionalParticleWidth(5);
      //.linkVisibility(l => l.isMainLink);
  }

  setupEvents() {
    this.graphObj
      .onNodeRightClick((node) => this.handleNodeRightClick(node))
      .onLinkClick((link) => this.handleLinkClick(link))
      .onLinkRightClick((link) => this.handleLinkRightClick(link));
  }

  setupCanvas() {
    this.graphObj
    /* set 'after' instead of undefined to draw labels on nodes.
      .nodeCanvasObjectMode((node) =>
        this.selectedNodes.indexOf(node) !== -1 ? 'before' : 'after'
      )
      */
      .nodeCanvasObjectMode((node) =>
     this.selectedNodes.indexOf(node) !== -1 ? 'before' : undefined
      )
      .nodeCanvasObject((node, ctx) => {
        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          this.NODE_REL_SIZE * 1.4,
          0,
          2 * Math.PI,
          false
        );
        ctx.fillStyle = 'red';
        ctx.fill();
      })
      /*
      // node test
      .nodeCanvasObject((node, ctx, globalScale) => {
        const label = node.id;
        const fontSize = 15; //12 / globalScale;
        ctx.font = '2px Sans-Serif';
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.color;
        ctx.fillText(label, node.x, node.y);
        })
      // node test
      */
      .linkCanvasObjectMode(() => 'after')
      .linkCanvasObject((link, ctx) => {

        if(!link.isMainLink)
          return;

        if(this.linkLabelProperties === [])
          return;

        const MAX_FONT_SIZE = 15;
        const LABEL_NODE_MARGIN = this.graphObj.nodeRelSize() * 1.5;

        const start = link.source;
        const end = link.target;

        // ignore unbound links
        if (typeof start !== 'object' || typeof end !== 'object') 
          return;

        // calculate label positioning
        const textPos = Object.assign(
          ...['x', 'y'].map((c) => ({
            [c]: start[c] + (end[c] - start[c]) / 2, // calc middle point
          }))
        );

        const relLink = {
          x: end.x - start.x,
          y: end.y - start.y,
        };

        const maxTextLength =
          Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) -
          LABEL_NODE_MARGIN * 2;

        let textAngle = Math.atan2(relLink.y, relLink.x);
        // maintain label vertical orientation for legibility
        if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
        if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

        // highlight how this is a visual render only! true value is not altered.
        var propName = this.linkLabelProperties[0].name;
        var value = link[propName];
        if(!value)
          return;
        const label = value.toFixed(2);

        // estimate fontSize to fit in link length
        ctx.font = '1px Sans-Serif';
        const fontSize = Math.min(
          MAX_FONT_SIZE,
          maxTextLength / ctx.measureText(label).width
        );
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(
          (n) => n + fontSize * 0.2
        ); // some padding

        // draw text label (with background rect)
        ctx.save();
        ctx.translate(textPos.x, textPos.y);
        ctx.rotate(textAngle);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(
          -bckgDimensions[0] / 2,
          -bckgDimensions[1] / 2,
          ...bckgDimensions
        );

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'blue';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });
  }

  handleNodeRightClick(node) {
    if (node) {
      let index = this.selectedNodes.findIndex((n) => n === node);
      if (index !== -1) {
        this.selectedNodes.splice(index, 1);
        return;
      }
      this.selectedNodes.push(node);
      if (this.selectedNodes.length > 2) {
        this.selectedNodes.shift();
      }
      //change this stuff. Seriously, change it.
      //Maybe a check to see whether tbody item information is already populated?
      displayNodeInfo(this.selectedNodes[0]);
      if (this.selectedNodes.length === 2) {
        displayNode2Info(this.selectedNodes[1]);
      }
    }
    this.domElem.style.cursor = node ? '-webkit-grab' : null;
  }

  handleLinkRightClick(link) {
    if (link) {
      if (this.selectedLink === link) this.selectedLink = null;
      else {
        this.selectedLink = link;
        displayEdgeInfo(link);
      }
    }
  }

  emitParticle(link) {
    if (link) {
      this.graphObj.emitParticle(link);
    }
  }

  update(graph) {
    this.graphObj(this.domElem).graphData(graph).nodeAutoColorBy('classification');

    this.resetSelection();

    displayGraphInfo(graph); // move this in controller and call it from client_events.js
  }

  notify(data){
    this.update(data);
  }

  resetSelection() {
    this.selectedNodes = [];
    this.selectedLink = null;
  }
}
