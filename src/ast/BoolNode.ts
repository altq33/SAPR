import Token from "../Token";
import ExpressionNode from "./ExpressionNode";

export default class BoolNode extends ExpressionNode {
  type: Token;

  constructor(type: Token) {
    super();
    this.type = type;
  }
}
