import fs from "fs";
import readlineSync from "readline-sync";
import Lexer from "./Lexer";

// const fileName =
//   "assets/inputs/" + readlineSync.question("Enter filename: ") + ".cpp";
const fileName = "assets/inputs/test.cpp";

const fileString = fs.readFileSync(fileName).toString();

const lexer = new Lexer(fileString);
console.log(lexer.lexAnalysis());
