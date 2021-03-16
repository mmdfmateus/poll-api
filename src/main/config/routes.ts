import { Express, Router } from 'express';
import fastGlob from 'fast-glob';

export default (app: Express): void => {
    const router = Router();

    // get all route files and configure routing for each one
    fastGlob.sync('**/src/main/routes/**routes.ts')
        .map(async filePath => {
            const route = (await import(`../../../${filePath}`)).default;
            route(router);
        });
    app.use('/api', router);
}