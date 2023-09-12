"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var login_module_1 = require("./login.module");
describe('LoginModule', function () {
    var loginModule;
    beforeEach(function () {
        loginModule = new login_module_1.LoginModule();
    });
    it('should create an instance', function () {
        expect(loginModule).toBeTruthy();
    });
});
//# sourceMappingURL=login.module.spec.js.map