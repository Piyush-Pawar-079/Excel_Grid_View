export enum TokenType {
    NUMBER = 'NUMBER',
    IDENTIFIER = 'IDENTIFIER', // Cell ref or function name
    OPERATOR = 'OPERATOR',
    LPAREN = 'LPAREN',
    RPAREN = 'RPAREN',
    COMMA = 'COMMA',
    COLON = 'COLON', // For ranges like A1:B2
    EOF = 'EOF'
}

export interface Token {
    type: TokenType;
    value: string;
}

export class FormulaTokenizer {
    private pos = 0;
    
    constructor(private input: string) {}

    public tokenize(): Token[] {
        const tokens: Token[] = [];
        let token = this.nextToken();
        while (token.type !== TokenType.EOF) {
            tokens.push(token);
            token = this.nextToken();
        }
        tokens.push(token); // EOF
        return tokens;
    }

    private nextToken(): Token {
        this.skipWhitespace();

        if (this.pos >= this.input.length) {
            return { type: TokenType.EOF, value: '' };
        }

        const char = this.input[this.pos];

        if (/[0-9.]/.test(char)) {
            return this.readNumber();
        }

        if (/[a-zA-Z]/.test(char)) {
            return this.readIdentifier();
        }

        if (['+', '-', '*', '/'].includes(char)) {
            this.pos++;
            return { type: TokenType.OPERATOR, value: char };
        }

        if (char === '(') {
            this.pos++;
            return { type: TokenType.LPAREN, value: char };
        }

        if (char === ')') {
            this.pos++;
            return { type: TokenType.RPAREN, value: char };
        }

        if (char === ',') {
            this.pos++;
            return { type: TokenType.COMMA, value: char };
        }

        if (char === ':') {
            this.pos++;
            return { type: TokenType.COLON, value: char };
        }

        // Unknown character, just skip or could throw
        this.pos++;
        return this.nextToken();
    }

    private skipWhitespace() {
        while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
            this.pos++;
        }
    }

    private readNumber(): Token {
        let value = '';
        let hasDecimal = false;
        while (this.pos < this.input.length) {
            const char = this.input[this.pos];
            if (/[0-9]/.test(char)) {
                value += char;
            } else if (char === '.' && !hasDecimal) {
                value += char;
                hasDecimal = true;
            } else {
                break;
            }
            this.pos++;
        }
        return { type: TokenType.NUMBER, value };
    }

    private readIdentifier(): Token {
        let value = '';
        while (this.pos < this.input.length) {
            const char = this.input[this.pos];
            if (/[a-zA-Z0-9_]/.test(char)) {
                value += char;
            } else {
                break;
            }
            this.pos++;
        }
        return { type: TokenType.IDENTIFIER, value: value.toUpperCase() };
    }
}
