"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const errors_1 = require("../utils/errors");
function validateBody(schema) {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            return next(new errors_1.AppError(error.details.map(item => item.message).join(', '), 422, 'VALIDATION_ERROR'));
        }
        req.body = value;
        return next();
    };
}
