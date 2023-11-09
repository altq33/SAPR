import Token from "../Token";
import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class VariableNode extends ExpressionNode {
  variable: Token;

  constructor(variable: Token) {
    super(NodeTypes.VARIABLE);
    this.variable = variable;
  }
}
