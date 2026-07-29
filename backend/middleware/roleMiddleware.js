// Middleware to restrict routes to specific user roles (farmer, expert, community)
// Usage: authorize("farmer") or authorize("expert", "community") for multiple allowed roles

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Not authorized, user role not found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};