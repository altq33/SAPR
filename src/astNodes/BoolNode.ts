import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class BoolNode extends ExpressionNode {
  token: Token;

  constructor(token: Token) {
    super(NodeTypes.BOOL);
    this.token = token;
  }
}
