const statusMessages = {
  200: 'Done',
  201: 'Created',
  400: 'Invalid format',
  500: 'Internal error',
};

exports.success = function (req, res, message, status) {
  if (!status) {
    status = 200;
  }

  return res.status(status).send({
    error: '',
    body: message || 'Data',
  });
};

exports.error = function (req, res, message, status) {
  res.status(status || 500).send({
    error: message,
    body: '',
  });
};
