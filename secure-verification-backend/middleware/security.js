// A simple security middleware
const securityMiddleware = (req, res, next) => {
  // Add basic security headers to all responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Log the request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  next();
};

export default securityMiddleware;