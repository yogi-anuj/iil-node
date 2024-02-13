// generates random 10 digit number
const getUniqueId = () => {
    const min = 1000000000;
    const max = 9999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  const generateOrderNumber = () => {
    const min = 10000000;
    const max = 99999999;
    return 'IL' + Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  module.exports = { getUniqueId, generateOrderNumber };
  