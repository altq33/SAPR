import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class LoopNode extends ExpressionNode {
  body: ExpressionNode[] = [];
  condition: ExpressionNode | undefined;

  constructor() {
    super(NodeTypes.LOOP);
  }

  addNode(node: ExpressionNode) {
    this.body.push(node);
  }
}
