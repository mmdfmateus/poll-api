import { MongoHelper } from '../infra/db/mongodb/helpers/mongo-helper';
import app from './config/app';
import env from './config/env';


MongoHelper.connect(env.mongoUrl)
    .then(() => {

        app.listen(5050, () => {
            console.log(`Server is listening at localhost:${env.port}`);
        });
    })
    .catch(console.error);
        