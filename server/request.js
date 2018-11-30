var request = require('request');

var requestCall = (headers, method, getBody = '', postbody = '', id = '', urlSuffix, formData = '') => {

  var baseUrl = 'https://manage.built.io/';

  var uri = `${baseUrl}${urlSuffix}`;

  // check if the id is present and accordingly use the url
  if (id) {
    uri = `${baseUrl}${urlSuffix}${id}`;
  }

  // set the request parameters
  var requestParams = {
    headers,
    uri,
    body: postbody ? postbody : {},
    qs: getBody ? getBody : {},
    json: true,
    method
  };

  if (formData) {
    requestParams.form = formData ? formData : {};
  }

  // return the promise in the reject and resolve cases
  return new Promise((resolve, reject) => {
    request(requestParams, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      return resolve(body);
    });
  });
}

module.exports = {

  'requestCall': (headers, method, getBody = '', postbody = '', id = '', urlSuffix, formData = '') => {
    return requestCall(headers, method, getBody, postbody, id, urlSuffix, formData);
  },
  'makeBody': (objectParams) => {
    return {
      object: objectParams
    };
  },
  'makeSelQuery': (getParams) => {
    return {
      only: {
        BASE: getParams
      }
    }
  }
}