import request from 'request';
import { isArray } from 'lodash';
import EnvConfig from '../env.config.json';
import Logger from './Logger';

const logger = Logger('lib:Facebook.js');

const postMessage = (target, message) => {
  if (isArray(message)) {
    message.forEach(singleMessage => postMessage(target, singleMessage));
    return;
  }

  const messageData = {
    recipient: {
      id: target,
    },
    message: {
      text: message,
    },
  };

  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: EnvConfig.Facebook.pageToken },
    method: 'POST',
    json: messageData,
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      logger.info('Successfully sent generic message', body);
    } else {
      logger.error('Unable to send message.', error, response);
    }
  });
};

export default postMessage;
