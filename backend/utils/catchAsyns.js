// backend/utils/catchAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // Catches any error from the async function fn and passes it to next()
  };
};
