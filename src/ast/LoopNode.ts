import ExpressionNode from "./ExpressionNode";

export default class LoopNode extends ExpressionNode {
  body: ExpressionNode[] = [];
  condition: ExpressionNode | undefined;

  addNode(node: ExpressionNode) {
    this.body.push(node);
    }
}
