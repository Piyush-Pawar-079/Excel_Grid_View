import { ASTNode, ASTNodeType, NumberNode, CellRefNode, CellRangeNode, FunctionNode, BinaryOpNode } from './ASTNodes';
import { IGridDataStore } from '../store/IGridDataStore';
import { FormulaParser } from './FormulaParser';

export class FormulaEvaluator {
    private parser = new FormulaParser();

    constructor(private store: IGridDataStore) {}

    public evaluate(formula: string, currentRow: number, currentCol: number, visited: Set<string> = new Set()): number | string {
        const cellKey = `${currentRow},${currentCol}`;
        if (visited.has(cellKey)) {
            return '#REF!'; // Circular reference
        }
        
        visited.add(cellKey);

        try {
            // Strip the '='
            const expr = formula.startsWith('=') ? formula.substring(1) : formula;
            const ast = this.parser.parse(expr);
            const result = this.evaluateNode(ast, currentRow, currentCol, visited);
            visited.delete(cellKey);
            return result;
        } catch (e) {
            visited.delete(cellKey);
            return '#ERROR!';
        }
    }

    private evaluateNode(node: ASTNode, currentRow: number, currentCol: number, visited: Set<string>): number {
        switch (node.type) {
            case ASTNodeType.NUMBER:
                return (node as NumberNode).value;
                
            case ASTNodeType.CELL_REF: {
                const ref = node as CellRefNode;
                // Add dependency for the engine to know
                this.store.addDependency(currentRow, currentCol, ref.row, ref.col);
                
                const cell = this.store.getCell(ref.row, ref.col);
                if (!cell || !cell.computedValue) return 0;
                
                if (typeof cell.computedValue === 'number') {
                    return cell.computedValue;
                }
                
                const val = parseFloat(cell.computedValue.toString());
                if (isNaN(val)) throw new Error('#VALUE!');
                return val;
            }
                
            case ASTNodeType.CELL_RANGE: {
                // A range node shouldn't be evaluated directly outside a function context
                // but if it is, maybe return an error. Or just first cell.
                throw new Error('#VALUE!');
            }
                
            case ASTNodeType.BINARY_OP: {
                const binNode = node as BinaryOpNode;
                const leftVal = this.evaluateNode(binNode.left, currentRow, currentCol, visited);
                const rightVal = this.evaluateNode(binNode.right, currentRow, currentCol, visited);
                
                switch (binNode.operator) {
                    case '+': return leftVal + rightVal;
                    case '-': return leftVal - rightVal;
                    case '*': return leftVal * rightVal;
                    case '/': 
                        if (rightVal === 0) throw new Error('#DIV/0!');
                        return leftVal / rightVal;
                }
                throw new Error('#ERROR!');
            }
                
            case ASTNodeType.FUNCTION: {
                return this.evaluateFunction(node as FunctionNode, currentRow, currentCol, visited);
            }
        }
        
        throw new Error('#ERROR!');
    }

    private evaluateFunction(node: FunctionNode, currentRow: number, currentCol: number, visited: Set<string>): number {
        const name = node.name.toUpperCase();
        
        // Collect all values from arguments (which could be ranges or single values)
        const values: number[] = [];
        
        for (const arg of node.args) {
            if (arg.type === ASTNodeType.CELL_RANGE) {
                const range = arg as CellRangeNode;
                for (let r = range.startRow; r <= range.endRow; r++) {
                    for (let c = range.startCol; c <= range.endCol; c++) {
                        this.store.addDependency(currentRow, currentCol, r, c);
                        const cell = this.store.getCell(r, c);
                        if (cell && cell.computedValue !== null && cell.computedValue !== '') {
                            const val = Number(cell.computedValue);
                            if (!isNaN(val)) {
                                values.push(val);
                            }
                        }
                    }
                }
            } else if (arg.type === ASTNodeType.CELL_REF) {
                const ref = arg as CellRefNode;
                this.store.addDependency(currentRow, currentCol, ref.row, ref.col);
                const cell = this.store.getCell(ref.row, ref.col);
                if (cell && cell.computedValue !== null && cell.computedValue !== '') {
                    const val = Number(cell.computedValue);
                    if (!isNaN(val)) {
                        values.push(val);
                    }
                }
            } else {
                values.push(this.evaluateNode(arg, currentRow, currentCol, visited));
            }
        }
        
        switch (name) {
            case 'SUM':
                return values.reduce((sum, v) => sum + v, 0);
            case 'AVERAGE':
                if (values.length === 0) throw new Error('#DIV/0!');
                return values.reduce((sum, v) => sum + v, 0) / values.length;
            case 'COUNT':
                return values.length;
            case 'MAX':
                return values.length > 0 ? Math.max(...values) : 0;
            case 'MIN':
                return values.length > 0 ? Math.min(...values) : 0;
            default:
                throw new Error('#NAME?'); // Unknown function
        }
    }
}
