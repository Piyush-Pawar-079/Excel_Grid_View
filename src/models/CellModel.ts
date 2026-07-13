export interface CellModel {
    row: number;
    col: number;
    
    // The literal text typed by the user, e.g., "=A1+B2" or "123"
    rawValue: string;
    
    // The evaluated value to display.
    computedValue: string | number | null;
    
    // Formatting/Error state
    hasError: boolean;
    errorType?: '#REF!' | '#VALUE!' | '#ERROR!' | '#DIV/0!';
}
