import { IGridDataStore } from './IGridDataStore';

export class JsonDataLoader {
    static async loadInitialData(store: IGridDataStore): Promise<void> {
        try {
            const res = await fetch('/employees.json');
            const data = await res.json();
            
            // First row as headers
            const headers = ['ID', 'First Name', 'Last Name', 'Age', 'Department', 'Salary'];
            headers.forEach((h, col) => {
                store.setCell(0, col, { row: 0, col, rawValue: h, computedValue: h, hasError: false });
            });

            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                const row = i + 1;
                
                store.setCell(row, 0, { row, col: 0, rawValue: item.id.toString(), computedValue: item.id, hasError: false });
                store.setCell(row, 1, { row, col: 1, rawValue: item.firstName, computedValue: item.firstName, hasError: false });
                store.setCell(row, 2, { row, col: 2, rawValue: item.lastName, computedValue: item.lastName, hasError: false });
                store.setCell(row, 3, { row, col: 3, rawValue: item.age.toString(), computedValue: item.age, hasError: false });
                store.setCell(row, 4, { row, col: 4, rawValue: item.department, computedValue: item.department, hasError: false });
                store.setCell(row, 5, { row, col: 5, rawValue: item.salary.toString(), computedValue: item.salary, hasError: false });
            }
        } catch (e) {
            console.error('Failed to load employee data:', e);
        }
    }
}
