'use strict';

const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');

/**
 * Auth middleware - verifikasi JWT dari header Authorization: Bearer <token>.
 * Hasil decoded disimpan di req.user = { id, role, email, name }.
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Authorization header wajib (Bearer <token>)'));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Role-based authorization. Pakai setelah authenticate.
 * @param  {...string} roles - roles yang diizinkan
 */
function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Akses ditolak untuk role ini'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
