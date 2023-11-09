import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class BinOperationNode extends ExpressionNode {
  operator: Token;
  leftNode: ExpressionNode;
  rightNode: ExpressionNode;

  constructor(
    operator: Token,
    leftNode: ExpressionNode,
    rightNode: ExpressionNode
  ) {
    super(NodeTypes.BIN_OP);
    this.operator = operator;
    this.leftNode = leftNode;
    this.rightNode = rightNode;
  }
}
