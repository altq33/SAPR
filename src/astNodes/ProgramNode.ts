import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class ProgramNode extends ExpressionNode {
  body: ExpressionNode[] = [];

  constructor() {
    super(NodeTypes.PROGRAM);
  }

  addNode(node: ExpressionNode) {
    this.body.push(node);
  }
}
