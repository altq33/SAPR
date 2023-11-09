import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class UnarOperationNode extends ExpressionNode {
  operator: Token;
  operand: ExpressionNode;

  constructor(operator: Token, operand: ExpressionNode) {
    super(NodeTypes.UN_OP);
    this.operator = operator;
    this.operand = operand;
  }
}
