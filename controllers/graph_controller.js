// also this is kept as generic as possible.
class GraphController {

    constructor(domElem, graph) {
        this.graph = graph || new Graph();
        this.renderer = new GraphEditor(domElem);

        this.graph.registerObserver(this.renderer);
    }

    insertNode(label, id, classification) {
        label = label || '';
        id = id || this.graph.generateId();
        classification = classification || 'normal';
        let node = new GNode(label);
        node.classification = classification;
        if (!this.graph.rename(node, id)) {
            throw new Error('Node ' + id + 'already exists.');
        };
        this.graph.addNode(node);
    }

    //test
    insertAnonymousNode(){
        var node = new GNode();
        var id = this.graph.generateId();
        if (this.graph.rename(node, id))
            this.graph.addNode(node);
        return node;
    }

    getNode(id) {
        var node = this.graph.findNodeById(id);
        if(!node)
            throw new Error('Node ' + id + ' does not exist.');
        return node;
    }

    // solution to avoid undefined: insert default graph with some sample data
    insertNodeAt(label, id, classification, x, y) {
        label = label || '';
        id = id || this.graph.generateId();
        let node = new GNode(label);
        node.classification = classification || 'normal';
        if (!this.graph.empty() && (x && y)) {
            let pos = this.renderer.graphObj.screen2GraphCoords(x, y);
            node.x = pos.x;
            node.y = pos.y;
        }
        if (!this.graph.rename(node, id)) {
            throw new Error('Node ' + id + 'already exists in this environment.');
        };
        this.graph.addNode(node);
    }


    insertLink(startNode, endNode) {
        let link = new GLink(startNode, endNode);
        this.graph.addLink(link);
    }


    insertLinkFromUserSelection() {
        let selectedNodes = this.renderer.selectedNodes;
        if (selectedNodes.length !== 2)
            return;
        this.insertLink(selectedNodes[0], selectedNodes[1]);

    }

    emitParticleAcrossSelectedLink() {
        let selectedLink = this.renderer.selectedLink;
        if (!selectedLink)
            return;
        this.renderer.emitParticle(selectedLink);
    }

    updateDirectionalParticles(){
        this.renderer.graphObj.linkDirectionalParticles((link) => Math.ceil(link.pheromone/5));
    }

    deleteNodeFromUserSelection() {
        let selectedNodes = this.renderer.selectedNodes;
        if (selectedNodes.length !== 1)
            return;
        if (this.graph.removeNode(selectedNodes[0])) {
            this.renderer.resetSelection();
        }
    }

    deleteLinkFromUserSelection() {
        let selectedLink = this.renderer.selectedLink;
        if (!selectedLink)
            return;
        if (this.graph.removeLink(selectedLink)) {
            this.renderer.resetSelection();
        }
    }

    findNodesByClassification(classification) {
        return this.graph.nodes.filter(e => (e.classification === classification));
    }


    findOutgoingLinks(startNode) {
        return this.graph.links.filter(e => e.source === startNode) || [];
    }

    findComplementaryLink(link){
        return this.graph.findLinkBetweenNodes(link.target,link.source)
    }

    registerObserverOnGraph(observer){
        this.graph.registerObserver(observer);
    }
}
