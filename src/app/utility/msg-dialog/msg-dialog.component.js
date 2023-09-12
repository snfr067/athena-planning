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
 * 公用訊息 dialog util
 */
var MsgDialogComponent = /** @class */ (function () {
    function MsgDialogComponent(dialogRef, data) {
        this.dialogRef = dialogRef;
        /** dialog config */
        this.dialogConfig = new dialog_1.MatDialogConfig();
        /** title */
        this.title = 'Message';
        /** auto close time */
        this.closeTime = 10000;
        /** text color */
        this.type = 'success';
        /** text css class */
        this.textClass = 'text-normal';
        this.title = data.title;
        this.infoMessage = data.infoMessage;
        if (typeof data.closeTime !== 'undefined') {
            this.closeTime = data.closeTime;
        }
        if (typeof data.type !== 'undefined') {
            this.type = data.type;
            if (this.type === 'error') {
                this.textClass = 'text-danger';
                if (typeof data.closeTime === 'undefined') {
                    this.closeTime = 7500;
                }
            }
        }
        this.dialogConfig.autoFocus = false;
    }
    MsgDialogComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.dialogConfig.autoFocus = false;
        // 2秒關閉
        if (this.closeTime !== 0) {
            window.setTimeout(function () {
                _this.dialogRef.close();
            }, this.closeTime);
        }
    };
    MsgDialogComponent = __decorate([
        core_1.Component({
            selector: 'app-msg-dialog',
            templateUrl: './msg-dialog.component.html',
            styleUrls: ['./msg-dialog.component.scss']
        }),
        __param(1, core_1.Inject(dialog_1.MAT_DIALOG_DATA))
    ], MsgDialogComponent);
    return MsgDialogComponent;
}());
exports.MsgDialogComponent = MsgDialogComponent;
