import mysql from 'mysql';
import EnvConfig from '../env.config.json';

const DB = mysql.createConnection(EnvConfig.MySQL);

DB.connect();
DB.promiseQuery = (...args) => new Promise((resolve, reject) => {
  args.push((err, result) => {
    if (err) {
      return reject(err);
    }

    return resolve(result);
  });

  DB.query(...args);
});

export default DB;
