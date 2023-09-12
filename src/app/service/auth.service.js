"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var core_1 = require("@angular/core");
/**
 * 公用參數與function service
 */
var AuthService = /** @class */ (function () {
    function AuthService(http, router, translateService) {
        this.http = http;
        this.router = router;
        this.translateService = translateService;
        /** API URL */
        this.API_URL = 'http://211.20.94.215:3000/son';
        // public API_URL = 'http://192.168.108.130:3000/son'; 
        /** 登入後的session_id */
        this.userToken = null;
        /** 語系 */
        this.lang = 'zh-TW';
        /** user id */
        this.userId = null;
        this.userToken = window.sessionStorage.getItem('son_session');
        this.userId = window.sessionStorage.getItem('son_userId');
    }
    /**
     * set user token
     * @param sonSession
     * @param userId
     */
    AuthService.prototype.setUserToken = function (sonSession, userId) {
        sessionStorage.setItem('son_session', sonSession);
        sessionStorage.setItem('son_userId', userId);
        this.userToken = sonSession;
        this.userId = userId;
    };
    /**
     * logout
     */
    AuthService.prototype.logout = function () {
        var _this = this;
        this.clearStorage();
        var form = {
            session: this.userToken
        };
        this.http.post(this.API_URL + "/logout", JSON.stringify(form)).subscribe(function (res) {
            _this.router.navigate(['/logon']);
            window.setTimeout(function () {
                Object.keys(sessionStorage).forEach(function (d) {
                    sessionStorage.removeItem(d);
                });
            }, 0);
        });
    };
    /**
     * get token from server and save TokenResponse to localstorage
     * @param treq TokenRequest
     */
    AuthService.prototype.logon = function (loginForm) {
        this.clearStorage();
        return this.http.post(this.API_URL + "/login", loginForm);
    };
    /**
     * 切換語系
     * @param langulage
     */
    AuthService.prototype.changeLanguage = function (langulage) {
        this.translateService.use(langulage);
    };
    /** show loading */
    AuthService.prototype.spinnerShow = function () {
        document.getElementById('ngxSpinnerShow').click();
    };
    /** hide loading */
    AuthService.prototype.spinnerHide = function () {
        document.getElementById('ngxSpinnerHide').click();
    };
    /** show loading, 有home link */
    AuthService.prototype.spinnerShowAsHome = function () {
        document.getElementById('ngxSpinnerShowAsHome').click();
    };
    /** show finish, percentage = 100% */
    AuthService.prototype.showFinish = function () {
        document.getElementById('ngxSpinnerFinish').click();
    };
    /** show loading, 有home link */
    AuthService.prototype.spinnerShowResult = function () {
        document.getElementById('ngxSpinnerShowResult').click();
    };
    AuthService.prototype.spinnerShowPdf = function () {
        document.getElementById('ngxSpinnerShowPdf').click();
    };
    /**
     * dataURI to blob
     * @param dataURI
     */
    AuthService.prototype.dataURLtoBlob = function (dataURI) {
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURI.split(',')[1]);
        }
        else {
            byteString = unescape(dataURI.split(',')[1]);
        }
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], { type: mimeString });
    };
    /**
     * parse材質數值為文字
     * @param val
     */
    AuthService.prototype.parseMaterial = function (val) {
        if (val === '0' || val === 0) {
            return this.translateService.instant('material.wood');
        }
        else if (val === '1' || val === 1) {
            return this.translateService.instant('material.cement');
        }
        else if (val === '2' || val === 2) {
            return this.translateService.instant('material.light_steel_frame');
        }
        else if (val === '3' || val === 3) {
            return this.translateService.instant('material.glass');
        }
        else if (val === '4' || val === 4) {
            return this.translateService.instant('material.stainless');
        }
        else if (val === '5' || val === 5) {
            return this.translateService.instant('material.fireproof');
        }
        else if (val === '6' || val === 6) {
            return this.translateService.instant('material.fireSoundproof');
        }
        else if (val === '7' || val === 7) {
            return this.translateService.instant('material.whiteBrick');
        }
        else if (val === '8' || val === 8) {
            return this.translateService.instant('material.flameproof');
        }
        else if (val === '9' || val === 9) {
            return this.translateService.instant('material.flameSoundproof');
        }
        else if (val === '10' || val === 10) {
            return this.translateService.instant('material.cabinet');
        }
    };
    /**
     * check is empty
     * @param val
     */
    AuthService.prototype.isEmpty = function (val) {
        if (val == null || val === 'null' || val === '' || val === 'undefined') {
            return true;
        }
        else {
            return false;
        }
    };
    /** clear Storage */
    AuthService.prototype.clearStorage = function () {
        localStorage.removeItem(this.userToken + "planningObj");
        localStorage.removeItem(this.userToken + "for3d");
        sessionStorage.removeItem('rsrpThreshold');
        sessionStorage.removeItem('sinrThreshold');
        sessionStorage.removeItem('tempParamForSelect');
        sessionStorage.removeItem('calculateForm');
        sessionStorage.removeItem('tempParamForSelect');
        sessionStorage.removeItem('tempParam');
        sessionStorage.removeItem('sub_field_coor');
    };
    AuthService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
