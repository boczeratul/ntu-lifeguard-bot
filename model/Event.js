import { DB } from '../lib';

const Type = {
  Ground: 'ground',
  EMT: 'emt',
  Train: 'train',
  Leave: 'leave',
};

const addEvent = ({ id, type, optional }) => {
  const SQL = `
    INSERT INTO ntu_lifeguard.Event
    (trainee_id, type, optional, timestamp) VALUES (?, ?, ?, ?)
  `;
  return DB.promiseQuery(SQL, [id, type, optional, new Date().getTime()]);
};

const queryEvents = ({ id }) => {
  const SQL = `
    SELECT * FROM ntu_lifeguard.Event
    WHERE trainee_id = ?
  `;
  return DB.promiseQuery(SQL, [id]);
};

export {
  Type,
  addEvent,
  queryEvents,
};
