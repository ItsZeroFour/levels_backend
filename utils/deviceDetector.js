export const detectDevice = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const deviceFromQuery = req.query.device;
  
  let deviceType = 'web';
  
  if (deviceFromQuery === 'ios' || deviceFromQuery === 'android') {
    deviceType = deviceFromQuery;
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    deviceType = 'ios';
  } else if (userAgent.includes('Android')) {
    deviceType = 'android';
  }
  
  req.deviceType = deviceType;
  next();
};