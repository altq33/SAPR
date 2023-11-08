import ExpressionNode from "./ExpressionNode";

export default class ParenNode extends ExpressionNode {
  innerNode: ExpressionNode;

  constructor(innerNode: ExpressionNode) {
    super();
    this.innerNode = innerNode;
  }
}
