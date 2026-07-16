import { Grid } from '../core/Grid';

export interface IGridPointerAction {

    handlePointerDown?(
        e: PointerEvent,
        grid: Grid
    ): boolean;

    handlePointerMove?(
        e: PointerEvent,
        grid: Grid
    ): boolean;

    handlePointerUp?(
        grid: Grid
    ): boolean;
}