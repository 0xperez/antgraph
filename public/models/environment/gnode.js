class GNode {
  constructor(label) {
    this.label = label;
    this.id = undefined;
    this.classification = "normal";
    this.outgoingEdges = [];
  }
}
