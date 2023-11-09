import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class ParenNode extends ExpressionNode {
  innerNode: ExpressionNode;

  constructor(innerNode: ExpressionNode) {
    super(NodeTypes.PARENS);
    this.innerNode = innerNode;
  }
}
