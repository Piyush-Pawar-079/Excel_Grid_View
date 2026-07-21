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
        e: PointerEvent,
        grid: Grid
    ): boolean;

    getCursor?(
        e: PointerEvent,
        grid: Grid
    ): string | null
}