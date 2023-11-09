import fs from "fs";
import readlineSync from "readline-sync";
import Lexer from "./Lexer";
import Parser from "./Parser";
import { isNativeError } from "util/types";
import { WrongFilenameError } from "./errors";

// const fileName =
//   "assets/inputs/" + readlineSync.question("Enter filename: ") + ".cpp";
const fileName = "assets/inputs/test.cpp";
let fileString;

try {
  fileString = fs.readFileSync(fileName).toString();
} catch {
  throw new WrongFilenameError("Неправильный путь до файла");
}

const lexer = new Lexer(fileString);
const tokenList = lexer.lexAnalysis();
const parser = new Parser(tokenList);
const AST = parser.parseCode();

try {
  fs.writeFileSync(
    "assets/outputs/tokens.json",
    JSON.stringify(tokenList, null, 2)
  );

  fs.writeFileSync("assets/outputs/ast.json", JSON.stringify(AST, null, 2));
} catch {
  throw new WrongFilenameError("Неправильный путь до файла");
}
