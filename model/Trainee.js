import { DB, Constants } from '../lib';

const checkSingleData = data => (
  (data.length === 1) ?
    Promise.resolve(data[0]) :
    Promise.reject(new Error(Constants.NO_SUCH_TRAINEE))
);

const queryByTempOrder = (tempOrder) => {
  const SQL = `
    SELECT * from ntu_lifeguard.Trainee
    WHERE order_temp = ?
  `;
  return DB.promiseQuery(SQL, [tempOrder])
    .then(checkSingleData);
};

const queryByPermanentOrder = (permanentOrder) => {
  const SQL = `
    SELECT * from ntu_lifeguard.Trainee
    WHERE order_permanent = ?
  `;
  return DB.promiseQuery(SQL, [permanentOrder])
    .then(checkSingleData);
};

const queryByOrder = order => (
  /^\d+-\d+$/g.test(order) ?
    queryByTempOrder(order) : queryByPermanentOrder(order)
);

export {
  queryByOrder,
  queryByTempOrder,
  queryByPermanentOrder,
};
