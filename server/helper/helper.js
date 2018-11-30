module.exports = {
  'makeResponse': (res, status, statusCode, message) => {
    return res
      .status(statusCode)
      .send({
        status,
        message
      });
  },
  'makeArrayResponse': (res, status, statusCode, message, response) => {
    return res
      .status(statusCode)
      .send({
        status,
        message,
        response
      });
  },
  'isEmpty': (object) => {
    return Object.keys(object).length === 0;
  }
}