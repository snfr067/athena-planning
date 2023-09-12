"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var dialog_1 = require("@angular/material/dialog");
/**
 * 公用Confirm dialog util
 */
var ConfirmDailogComponent = /** @class */ (function () {
    function ConfirmDailogComponent(dialogRef, data) {
        this.dialogRef = dialogRef;
        /** Click ok */
        this.onOK = new core_1.EventEmitter();
        this.infoMessage = data.infoMessage;
    }
    ConfirmDailogComponent.prototype.ngOnInit = function () {
    };
    ConfirmDailogComponent.prototype.ok = function () {
        this.onOK.emit();
        this.dialogRef.close();
    };
    ConfirmDailogComponent = __decorate([
        core_1.Component({
            selector: 'app-confirm-dailog',
            templateUrl: './confirm-dailog.component.html',
            styleUrls: ['./confirm-dailog.component.scss']
        }),
        __param(1, core_1.Inject(dialog_1.MAT_DIALOG_DATA))
    ], ConfirmDailogComponent);
    return ConfirmDailogComponent;
}());
exports.ConfirmDailogComponent = ConfirmDailogComponent;
