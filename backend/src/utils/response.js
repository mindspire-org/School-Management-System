exports.success = (res, data = {}, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.error = (res, message = 'Error', status = 500, errors = null) =>
  res.status(status).json({ success: false, message, errors });
