"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
class UserController {
    constructor(userService = new UserService_1.UserService()) {
        this.userService = userService;
        this.create = async (req, res, next) => {
            try {
                const result = await this.userService.createUser(req.body);
                res.status(201).json({ status: 'success', data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.show = async (req, res, next) => {
            try {
                const result = await this.userService.getUserByPublicId(req.params.userId);
                res.status(200).json({ status: 'success', data: result });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UserController = UserController;
