import ExpressionNode, { NodeTypes } from "./ExpressionNode";

export default class FunctionNode extends ExpressionNode {
  name: string;
  body: ExpressionNode[] = [];

  constructor(name: string) {
    super(NodeTypes.FUNCTION);
    this.name = name;
  }

  addNode(node: ExpressionNode) {
    this.body.push(node);
  }
}
