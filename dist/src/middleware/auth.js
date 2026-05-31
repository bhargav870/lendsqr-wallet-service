"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
function authenticate(req, _res, next) {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token || token !== env_1.env.apiToken) {
        return next(new errors_1.AppError('Unauthorized request', 401, 'UNAUTHORIZED'));
    }
    return next();
}
