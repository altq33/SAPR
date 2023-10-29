import Token from "../Token";
import ExpressionNode from "./ExpressionNode";

export default class DeclarationNode extends ExpressionNode {
  variable: ExpressionNode;
  initialValue: ExpressionNode | null;

  constructor(variable: ExpressionNode, initialValue: ExpressionNode | null) {
    super();
    this.variable = variable;
    this.initialValue = initialValue;
  }
}
