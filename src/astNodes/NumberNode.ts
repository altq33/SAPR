import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class NumberNode extends ExpressionNode {
  number: Token;

  constructor(number: Token) {
    super(NodeTypes.NUMBER);
    this.number = number;
  }
}
