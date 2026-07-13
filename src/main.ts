import { GridDataStore } from './store/GridDataStore';
import { JsonDataLoader } from './store/JsonDataLoader';
import { Grid } from './core/Grid';

document.addEventListener('DOMContentLoaded', async () => {
    const store = new GridDataStore();
    
    // Load initial data (50k records)
    await JsonDataLoader.loadInitialData(store);

    const grid = new Grid(store);
});
