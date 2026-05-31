"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = notFound;
exports.errorHandler = errorHandler;
const errors_1 = require("../utils/errors");
function notFound(req, _res, next) {
    next(new errors_1.AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}
function errorHandler(err, _req, res, _next) {
    const appError = err instanceof errors_1.AppError ? err : new errors_1.AppError('Internal server error', 500, 'INTERNAL_ERROR');
    res.status(appError.statusCode).json({
        status: 'error',
        message: appError.message,
        code: appError.code
    });
}
