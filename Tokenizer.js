class Tokenizer {
  constructor(text) {
    this.tokens = {
      "=": /=/,
      ";": /;/,
      "+": /\+/,
      "-": /-/,
      "*": /\*/,
      "(": /\(/,
      ")": /\)/,
      Id: /[a-zA-Z_]([a-zA-Z_]|[0-9])*/,
      Lit: /0|[1-9][0-9]*/,
      Inv: /.|[\r\n]/,
    };
    this.whitespace = /\s+/g;
    this.text = text.replace(this.whitespace, "");
    this.endPosition = this.text.length;
    this.currentPosition = 0;
  }

  //Iterate through the text and return the token with it type
  readNextToken() {
    if (this.currentPosition < this.endPosition) {
      for (let pattern in this.tokens) {
        const match = this.tokens[pattern].exec(
          this.text.slice(this.currentPosition)
        );
        if (match && match.index === 0) {
          const token = match[0];
          const type = pattern;

          if (type === "Lit" && token.startsWith("0") && token.length > 1) {
            throw new Error(`error`);
          }

          this.currentPosition += token.length;
          return { token, type };
        }
      }
    } else {
      return { token: "", type: "EOF" };
    }

    throw new Error(`error`);
  }
}

class Parser {
  constructor(text) {
    this.t = new Tokenizer(text);
    this.currentToken = {};
    this.symbolTable = {};
    this.program();
  }

  consumeToken() {
    this.currentToken = this.t.readNextToken();
  }

  match(expectedToken) {
    if (this.currentToken.type === expectedToken) {
      this.consumeToken();
    } else {
      throw new Error(`error`);
    }
  }

  program() {
    this.consumeToken();
    while (this.currentToken.type !== "EOF") {
      this.assignment();
    }
  }

  assignment() {
    if (this.currentToken.type === "Id") {
      const varName = this.currentToken.token;
      this.consumeToken();
      this.match("=");
      const expr = this.expr();
      this.match(";");
      this.symbolTable[varName] = expr;
    } else {
      throw new Error(`error`);
    }
  }

  expr() {
    const t = this.term();
    return t + this.exprP();
  }

  exprP() {
    if (this.currentToken.type === "+") {
      this.consumeToken();
      const t = this.term();
      return t + this.exprP();
    } else if (this.currentToken.type === "-") {
      this.consumeToken();
      const t = this.term();
      return -1 * t + this.exprP();
    } else {
      return 0;
    }
  }

  term() {
    const f = this.factor();
    return f * this.termP();
  }

  termP() {
    if (this.currentToken.type === "*") {
      this.consumeToken();
      const f = this.factor();
      return f * this.termP();
    } else {
      return 1;
    }
  }

  factor() {
    if (this.currentToken.type === "Lit") {
      const value = parseInt(this.currentToken.token);
      this.consumeToken();
      return value;
    } else if (this.currentToken.type === "Id") {
      if (this.symbolTable.hasOwnProperty(this.currentToken.token)) {
        const value = this.symbolTable[this.currentToken.token];
        this.consumeToken();
        return value;
      } else {
        throw new Error(`error`);
      }
    } else if (this.currentToken.type === "+") {
      this.consumeToken();
      return this.factor();
    } else if (this.currentToken.type === "-") {
      this.consumeToken();
      return -1 * this.factor();
    } else if (this.currentToken.type === "(") {
      this.consumeToken();
      const exp = this.expr();
      this.match(")");
      return exp;
    } else {
      throw new Error(`error`);
    }
  }

  getSymbolTable() {
    return this.symbolTable;
  }
}

// Example usage
const programs = [
  "x = 5;\ny = x + 3;\nz = -(-y * -2);",
  "x_2 = 0;",
  "x = 0\ny = x;\nz = ---(x+y);",
  "x = 1;\ny = 2;\nz = ---(x+y)*(x+-y);",
];

for (const program of programs) {
  try {
    const p = new Parser(program);
    for (const [varName, value] of Object.entries(p.getSymbolTable())) {
      console.log(`${varName} = ${value}`);
    }
  } catch (error) {
    console.log("error");
  }
  console.log();
}
