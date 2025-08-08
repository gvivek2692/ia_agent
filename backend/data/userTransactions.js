const { getUserTransactions: getTransactions } = require('./multipleUsers');

// This file provides backward compatibility for the getUserTransactions function
function getUserTransactions(userId) {
  return getTransactions(userId);
}

module.exports = {
  getUserTransactions
};