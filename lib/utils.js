'use strict';
const { hasOwnProperty } = Object.prototype;

const keys = (obj, fn) => {
  if (obj == null) return;
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) fn(key);
  }
};

const omit = (obj, omittedKey1, omittedKey2) => {
  const result = {};
  keys(obj, (key) => {
    if (key !== omittedKey1 && key !== omittedKey2) result[key] = obj[key];
  });
  return result;
};

const option = (obj, key) => {
  if (obj == null || obj[key] == null) return null;
  return obj[key];
};

Object.assign(exports, { keys, omit, option });
