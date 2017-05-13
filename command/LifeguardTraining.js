import moment from 'moment-timezone';
import { Trainee, Event } from '../model';
import { Constants } from '../lib';

const parseTimedCommand = (input) => {
  const commandRegex = /^(\d*-?\d+)\s(\S+)\s(\d{0,2}):?(\d{2})$/g;

  const result = commandRegex.exec(input);
  if (!result) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  const [, order, command, hourString, minuteString] = result;

  if (!command || !order) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  const hour = parseInt(hourString, 10);
  const minute = parseInt(minuteString, 10);

  return Promise.resolve({ order, command, hour, minute });
};

const parseCommentedCommand = (input) => {
  const commandRegex = /^(\d*-?\d+)\s(\S+)\s(.+)$/g;

  const result = commandRegex.exec(input);
  if (!result) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  const [, order, command, optional] = result;

  if (!command || !order) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  return Promise.resolve({ order, command, optional });
};

const parseSimpleCommand = (input) => {
  const commandRegex = /^(\d*-?\d+)\s(\S+)$/g;

  const result = commandRegex.exec(input);
  if (!result) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  const [, order, command] = result;

  if (!command || !order) {
    return Promise.reject(new Error(Constants.INVALID_INPUT));
  }

  return Promise.resolve({ order, command });
};

const formatTime = timestamp => moment(parseInt(timestamp, 10)).tz('Asia/Taipei').format('MM/DD HH:mm');

const ground = {
  command: '陸操',
  description: '紀錄學員陸操時數',
  format: '[學員編號] 陸操 [時數(時:分)]',
  example: '1-1 陸操 1:30',

  execute: input => parseTimedCommand(input)
    .then(({ order, hour, minute }) => Trainee.queryByOrder(order)
      .then(trainee => ({ trainee, hour, minute })))
    .then(({ trainee, hour, minute }) => Event.addEvent({
      id: trainee.id,
      type: Event.Type.Ground,
      optional: (hour * 60) + minute,
    }).then(() => ({ trainee, hour, minute })))
    .then(({ trainee, hour, minute }) => ({
      response: '',
      options: {
        attachments: [{
          color: 'good',
          text: `已登記 ${trainee.order_temp} ${trainee.name} 陸操 ${hour || 0}時${minute}分`,
        }],
      },
    })),
};

const leave = {
  command: '請假',
  description: '紀錄學員請假時數',
  format: '[學員編號] 請假 [時數(時:分)]',
  example: '1-1 請假 2:30',

  execute: input => parseTimedCommand(input)
    .then(({ order, hour, minute }) => Trainee.queryByOrder(order)
      .then(trainee => ({ trainee, hour, minute })))
    .then(({ trainee, hour, minute }) => Event.addEvent({
      id: trainee.id,
      type: Event.Type.Leave,
      optional: (hour * 60) + minute,
    }).then(() => ({ trainee, hour, minute })))
    .then(({ trainee, hour, minute }) => ({
      response: '',
      options: {
        attachments: [{
          color: 'good',
          text: `已登記 ${trainee.order_temp} ${trainee.name} 請假 ${hour || 0}時${minute}分`,
        }],
      },
    })),
};

const emt = {
  command: 'EMT',
  description: '紀錄學員受傷狀況和處置',
  format: '[學員編號] EMT [狀況和處置]',
  example: '1-1 EMT 腳被磁磚割傷，使用防水繃帶包紮',

  execute: input => parseCommentedCommand(input)
    .then(({ order, optional }) => Trainee.queryByOrder(order)
      .then(trainee => ({ trainee, optional })))
    .then(({ trainee, optional }) => Event.addEvent({
      id: trainee.id,
      type: Event.Type.EMT,
      optional,
    }).then(() => ({ trainee, optional })))
    .then(({ trainee, optional }) => ({
      response: '',
      options: {
        attachments: [{
          color: 'good',
          text: `已登記 ${trainee.order_temp} ${trainee.name} 受傷狀況\n${optional}`,
        }],
      },
    })),
};

const train = {
  command: '訓練',
  description: '紀錄學員游餐、水操狀況',
  format: '[學員編號] 訓練 [狀況]',
  example: '1-1 訓練 抬頭捷會鋤頭腳',

  execute: input => parseCommentedCommand(input)
    .then(({ order, optional }) => Trainee.queryByOrder(order)
      .then(trainee => ({ trainee, optional })))
    .then(({ trainee, optional }) => Event.addEvent({
      id: trainee.id,
      type: Event.Type.Train,
      optional,
    }).then(() => ({ trainee, optional })))
    .then(({ trainee, optional }) => ({
      response: '',
      options: {
        attachments: [{
          color: 'good',
          text: `已登記 ${trainee.order_temp} ${trainee.name} 訓練狀況\n${optional}`,
        }],
      },
    })),
};

const report = {
  command: '報告',
  description: '列出學員詳細記錄報告',
  format: '[學員編號] 報告',
  example: '1-1 報告',

  execute: input => parseSimpleCommand(input)
    .then(({ order }) => Trainee.queryByOrder(order)
      .then(trainee => ({ trainee })))
    .then(({ trainee }) => Event.queryEvents({ id: trainee.id })
      .then(events => ({ trainee, events })))
    .then(({ trainee, events }) => ({
      response: '',
      options: {
        attachments: [{
          color: 'good',
          text: `${trainee.order_temp} ${trainee.name}`,
          fields: [
            {
              title: '訓練',
              value: events
                .filter(event => event.type === Event.Type.Train)
                .map(event => `[${formatTime(event.timestamp)}] ${event.optional}`)
                .join('\n'),
              short: false,
            },
            {
              title: '傷病',
              value: events
                .filter(event => event.type === Event.Type.EMT)
                .map(event => `[${formatTime(event.timestamp)}] ${event.optional}`)
                .join('\n'),
              short: false,
            },
            {
              title: '請假',
              value: events
                .filter(event => event.type === Event.Type.Leave)
                .map(event => `[${formatTime(event.timestamp)}] ${event.optional}分鐘`)
                .join('\n'),
              short: false,
            },
            {
              title: '陸操',
              value: events
                .filter(event => event.type === Event.Type.Ground)
                .map(event => `[${formatTime(event.timestamp)}] ${event.optional}分鐘`)
                .join('\n'),
              short: false,
            },
          ],
        }],
      },
    })),
};

export {
  ground,
  leave,
  emt,
  train,
  report,
};
