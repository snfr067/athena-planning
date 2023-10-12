"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var core_1 = require("@angular/core");
var scenejs_1 = require("scenejs");
var dialog_1 = require("@angular/material/dialog");
var confirm_dailog_component_1 = require("../../utility/confirm-dailog/confirm-dailog.component");
var CalculateForm_1 = require("../../form/CalculateForm");
var EvaluationFuncForm_1 = require("../../form/EvaluationFuncForm");
var _ = require("lodash");
var menu_1 = require("@angular/material/menu");
var view3d_component_1 = require("../view3d/view3d.component");
var XLSX = require("xlsx");
var msg_dialog_component_1 = require("../../utility/msg-dialog/msg-dialog.component");
var boolean_contains_1 = require("@turf/boolean-contains");
var helpers_1 = require("@turf/helpers");
var circle_1 = require("@turf/circle");
var crypto_js_1 = require("crypto-js");
// declare var require: any;
/**
 * 場域規劃頁
 */
var SitePlanningComponent = /** @class */ (function () {
    function SitePlanningComponent(authService, router, route, matDialog, formService, translateService, chartService, http) {
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.matDialog = matDialog;
        this.formService = formService;
        this.translateService = translateService;
        this.chartService = chartService;
        this.http = http;
        // UC 新增變數使用
        this.selected = -1; //將checkbox改成單選
        /**
         * resizable enable
         */
        this.resizable = true;
        /**
         * Planning mode || Simulation mode
         */
        this.planOrSim = true;
        /**
         * moveable 設定值
         */
        this.frame = new scenejs_1.Frame({
            width: '30px',
            height: '30px',
            left: '0px',
            top: '0px',
            'z-index': 100,
            transform: {
                rotate: '0deg',
                scaleX: 1,
                scaleY: 1
            }
        });
        /**
         * sidenav 展開/收合
         */
        this.opened = true;
        /**
         * mat-expansion-panel 展開/收合
         */
        this.panelOpenState = false;
        /**
         * 正在使用moveable物件
         */
        this.live = false;
        /** calculate form */
        this.calculateForm = new CalculateForm_1.CalculateForm();
        /** evaluationFunc form  */
        this.evaluationFuncForm = new EvaluationFuncForm_1.EvaluationFuncForm();
        /** material list */
        this.materialList = [];
        /** model list */
        this.modelList = [];
        /** antenna list */
        this.antennaList = [];
        /** new antenna list */
        this.allAntennaList = [];
        this.filterAntennaList = [];
        /** new material & new model */
        this.materialId = 0;
        this.materialName = null;
        this.materialLossCoefficient = 0.1;
        this.materialProperty = null;
        this.materialIdToIndex = {};
        this.deleteMaterialList = [];
        this.modelName = null;
        this.modelDissCoefficient = 0.1;
        this.modelfieldLoss = 0.1;
        this.calModelDissCoefficient = 0.1;
        this.calModelfieldLoss = 0.1;
        this.modelProperty = null;
        this.modelIdToIndex = {};
        this.modelFileName = '';
        this.createMethod = 'formula';
        /** subitem class */
        this.subitemClass = {
            obstacle: 'subitem active',
            ue: 'subitem active'
        };
        /** 平面高度 */
        this.zValues = [1];
        /** 障礙物 IDList */
        this.obstacleList = [];
        /** 互動物件 */
        this.dragObject = {};
        /** 基站RF參數 */
        this.bsListRfParam = {};
        /** 現有基站 */
        this.defaultBSList = [];
        /** 新增基站 */
        this.candidateList = [];
        /** 新增ＵＥ */
        this.ueList = [];
        this.ueListParam = {};
        /** 要被刪除的List */
        this.deleteList = [];
        /** 圖區左邊界 */
        this.chartLeft = 0;
        /** 圖區右邊界 */
        this.chartRight = 0;
        /** 圖區上邊界 */
        this.chartTop = 0;
        /** 圖區下邊界 */
        this.chartBottom = 0;
        /** 圖寬度 */
        this.chartHeight = 0;
        /** 互動svg種類 */
        this.svgMap = {
            rect: {
                id: 'svg_1',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '0'
            },
            ellipse: {
                id: 'svg_2',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '2'
            },
            polygon: {
                id: 'svg_3',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '1'
            },
            defaultBS: {
                id: 'svg_4',
                title: this.translateService.instant('defaultBs'),
                type: 'defaultBS',
                element: ''
            },
            candidate: {
                id: 'svg_5',
                title: this.translateService.instant('candidateBs'),
                type: 'candidate',
                element: ''
            },
            UE: {
                id: 'svg_6',
                title: this.translateService.instant('ue'),
                type: 'UE',
                element: ''
            },
            trapezoid: {
                id: 'svg_7',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '3'
            },
            subField: {
                id: 'svg_8',
                title: this.translateService.instant('subfield'),
                // title: '子場域',
                type: 'subField',
                element: '4'
            }
        };
        /** 新增物件的起始pixel位置 */
        this.initpxl = 50;
        /** 互動物件的tooltip */
        this.tooltipStr = '';
        /** 4捨5入格式化 */
        this.roundFormat = Plotly.d3.format('.1f');
        /** 物件移動範圍 */
        this.bounds = {
            left: 0,
            top: 0,
            right: 400,
            bottom: 500
        };
        /** ue width */
        this.ueWidth = 9.5;
        /** ue height */
        this.ueHeight = 14.5;
        /** candidate width */
        this.candidateWidth = 28;
        /** candidate height */
        this.candidateHeight = 18;
        /** 右鍵選單position */
        this.menuTopLeftStyle = { top: '0', left: '0' };
        /** show image file name */
        this.showFileName = true;
        /** number型態 column list */
        this.numColumnList = ['totalRound', 'crossover', 'mutation', 'iteration', 'seed',
            'width', 'height', 'altitude', 'pathLossModelId', 'useUeCoordinate',
            'powerMaxRange', 'powerMinRange', 'beamMaxId', 'beamMinId', 'objectiveIndex',
            'availableNewBsNumber', 'addFixedBsNumber', 'sinrRatio',
            'throughputRatio', 'coverageRatio', 'ueAvgSinrRatio', 'ueAvgThroughputRatio', 'ueTpByDistanceRatio',
            'mctsC', 'mctsMimo', 'ueCoverageRatio', 'ueTpByRsrpRatio',
            'mctsTemperature', 'mctsTime', 'mctsTestTime', 'mctsTotalTime', 'resolution', 'maxConnectionNum', 'geographicalNorth'];
        /** task id */
        this.taskid = '';
        /** progress interval */
        this.progressInterval = 0;
        /** polling interval  */
        this.pollingInterval = 0;
        /** View 3D dialog config */
        this.view3dDialogConfig = new dialog_1.MatDialogConfig();
        /** Message dialog config */
        this.msgDialogConfig = new dialog_1.MatDialogConfig();
        /** tooltip position */
        this.tooltipStyle = {
            left: '0px',
            top: '0px'
        };
        /** span互動物件 style */
        this.spanStyle = {};
        /** 方形互動物件 style */
        this.rectStyle = {};
        /** 圓形互動物件 style */
        this.ellipseStyle = {};
        /** 三角形互動物件 style */
        this.polygonStyle = {};
        /** 梯形形互動物件 style */
        this.trapezoidStyle = {};
        /** svg互動物件 style */
        this.svgStyle = {};
        /** svg path互動物件 style */
        this.pathStyle = {};
        /** defaultBs編號 style */
        this.circleStyle = {};
        /** 互動區域範圍 */
        this.dragStyle = {};
        this.dragTimes = 0;
        /** Wifi頻率 */
        this.wifiFrequency = '0';
        /** 是否為歷史紀錄 */
        this.isHst = false;
        /** 1: 以整體場域為主進行規劃, 2: 以行動終端為主進行規劃 3:場域模擬*/
        this.planningIndex = '3';
        /** 障礙物預設顏色 */
        this.OBSTACLE_COLOR = '#73805c';
        /** defaultBs預設顏色 */
        this.DEFAULT_BS_COLOR = '#2958be';
        /** candidate預設顏色 */
        this.CANDIDATE_COLOR = '#d00a67';
        /** UE預設顏色 */
        this.UE_COLOR = '#0c9ccc';
        /** history output */
        this.hstOutput = {};
        /** 子載波間距 */
        this.subcarrier = 15;
        /** 進度 */
        this.progressNum = 0;
        /** 進度百分比 time interval */
        this.pgInterval = 0;
        /** 英文亂數用 */
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        /** 移動前紀錄物件 */
        this.ognDragObject = {};
        /** 移動過程產生error */
        this.moveError = false;
        this.bgdivStyle = {
            width: '0px',
            height: '0px',
            'z-index': '0',
            position: 'absolute',
            top: 0,
            left: 0
        };
        /** 左邊寬度 */
        this.leftWidth = 0;
        this.scrollLeft = 0;
        this.scrollTop = 0;
        /** 子場域物件 **/
        this.subFieldList = [];
        this.subFieldStyle = {};
        this.isShowSubField = true;
        /** 解析度List  **/
        this.resolutionList = [1];
        /** smart antenna **/
        this.manufactor = "All";
        this.manufactorCal = "All";
        this.AntennaManufactorList = [];
        this.AntennaIdToIndex = {};
        /**  for antenna frequency check msg **/
        this.infoMsg = "";
        /** http error */
        this.statusCode = "";
        this.errMsg = "";
        this.fieldThroughputTypeArr = [];
        this.ueThroughputTypeArr = [];
        this.fieldThroughputValueArr = [];
        this.ueThroughputValueArr = [];
        this.isBsNumberOptimization = "custom";
        this.isDefaultSINRSetting = "custom";
        this.isDefaultRSRPSetting = "custom";
        this.isDefaultThroughputSetting = "custom";
        this.isDefaultUEThroughputSetting = "custom";
        this.defaultArea = 95;
        this.defaultSINRSetting = 15;
        this.sinrUpperLimit = 40;
        this.sinrLowerLimit = -23;
        this.defaultRSRPSetting = -110;
        this.rsrpUpperLimit = -44;
        this.rsrpLowerLimit = -140;
        this.defaultULThroughputSetting = 250;
        this.ulThroughputUpperLimit = 800;
        this.ulThroughputLowerLimit = 0;
        this.defaultDLThroughputSetting = 350;
        this.dlThroughputUpperLimit = 1800;
        this.dlThroughputLowerLimit = 0;
        this.defaultUEULThroughputSetting = 5;
        this.defaultUEDLThroughputSetting = 5;
        this.firstLayerDialogRef = null;
        this.secondLayerDialogRef = null;
        this.confirmDialogConfig = null;
        this.isAntennaDefault = "default";
        this.addAntenna = {
            id: 1,
            name: "",
            type: "",
            band: [],
            port: 1,
            devName: "",
            manufactor: "",
            fileName: ""
        };
        this.editAntenna = {
            id: 1,
            name: "",
            type: "",
            band: [],
            port: 1,
            devName: "",
            manufactor: "",
            fileName: ""
        };
        this.customizedAntennaPage = 1;
        this.maxAntRowInPage = 10;
        this.fieldStr = {
            coverage: "field.coverage",
            sinr: "field.sinr",
            rsrp: "field.rsrp",
            throughput: "field.throughput"
        };
        this.ueStr = {
            coverage: "ue.coverage",
            throughputByRsrp: "ue.throughputByRsrp"
        };
        this.evaluationString = {
            field: this.fieldStr,
            ue: this.ueStr
        };
        // @ViewChild('deleteModal3') deleteModal3: TemplateRef<any>;
        // @ViewChild('deleteModal4') deleteModal4: TemplateRef<any>;
        // @ViewChild('deleteModal5') deleteModal5: TemplateRef<any>;
        // WiFi頻段:2.4G+5G
        this.wifiFreqList2_4g = [
            2412,
            2417,
            2422,
            2427,
            2432,
            2437,
            2442,
            2447,
            2452,
            2457,
            2462,
            2467,
            2472,
            2484
        ];
        this.wifiFreqList5g = [
            5170,
            5180,
            5190,
            5200,
            5210,
            5220,
            5230,
            5240,
            5260,
            5280,
            5300,
            5320,
            5500,
            5520,
            5540,
            5560,
            5580,
            5600,
            5620,
            5640,
            5660,
            5680,
            5700,
            5745,
            5765,
            5785,
            5805,
            5825
        ];
        //4G 5G WiFi new attribute
        this.duplexMode = "tdd";
        this.dlRatio = 70;
        this.scalingFactor = 1;
        this.rsrpThreshold = -90;
        this.sinrThreshold = 15;
        this.tempCalParamSet = {
            txpower: 0,
            beampattern: '0',
            fddDlFrequency: 3500,
            fddUlFrequency: 3550,
            ulModulationCodScheme: "64QAM-table",
            dlModulationCodScheme: "64QAM-table",
            dlMimoLayer: '1',
            ulMimoLayer: '1',
            tddscs: '15',
            tddbandwidth: '5',
            tddfrequency: 2400,
            dlScs: '15',
            ulScs: '15',
            dlBandwidth: '5',
            ulBandwidth: '5',
            scsBandwidth: '0',
            mimoNumber4G: '1',
            //WiFi
            wifiProtocol: 'wifi4',
            guardInterval: '400ns',
            wifiMimo: '2x2',
            wifiBandwidth: '20',
            wifiFrequency: 2412,
            bsTxGain: 0,
            bsNoiseFigure: 0,
            AntennaId: 1,
            theta: 0,
            phi: 0
        };
        this.modalParam = {
            dir: '',
            isCandidate: false
        };
    }
    /** click外部取消moveable */
    SitePlanningComponent.prototype.clickout = function (event) {
        if (typeof this.target !== 'undefined' && this.target != null) {
            if (this.target.contains(event.target)) {
                this.live = true;
            }
            else {
                this.live = false;
                try {
                    this.moveable.destroy();
                }
                catch (error) {
                    this.moveable.ngOnInit();
                    this.moveable.destroy();
                }
            }
        }
    };
    /** delete keyCode 刪除物件 */
    SitePlanningComponent.prototype.keyEvent = function (event) {
        if (typeof this.target !== 'undefined') {
            if (this.live) {
                if (event.key === 'Delete') {
                    this.live = false;
                    this.moveable.destroy();
                    var id = this.target.closest('span').id;
                    var obj = this.dragObject[id];
                    if (obj.type === 'obstacle') {
                        this.obstacleList.splice(this.obstacleList.indexOf(id), 1);
                    }
                    else if (obj.type === 'defaultBS') {
                        this.defaultBSList.splice(this.defaultBSList.indexOf(id), 1);
                    }
                    else if (obj.type === 'candidate') {
                        this.candidateList.splice(this.candidateList.indexOf(id), 1);
                    }
                    else if (obj.type === 'UE') {
                        this.ueList.splice(this.ueList.indexOf(id), 1);
                    }
                }
            }
        }
    };
    SitePlanningComponent.prototype.windowResize = function () {
        try {
            this.moveable.ngOnDestroy();
        }
        catch (error) { }
        this.chartResize();
    };
    // @Input()
    // duplexMode = "fdd";
    // tempDuplexMode;
    SitePlanningComponent.prototype.ngOnChanges = function (changes) {
        console.log(changes);
    };
    SitePlanningComponent.prototype.ngAfterViewInit = function () {
        // 物件就位後再顯示
        this.chart.nativeElement.style.opacity = 0;
        this.resetChartWidth();
        // 隱藏規劃目標及場域設定的button位置跑掉
        var matSidenav = document.querySelector('.mat-sidenav');
        var matSidenavContent = document.querySelector('.mat-sidenav-content');
        matSidenav.style.width = matSidenavContent.style.marginRight;
    };
    SitePlanningComponent.prototype.ngOnInit = function () {
        var _this = this;
        window.sessionStorage.removeItem('tempParamForSelect');
        if (!sessionStorage.getItem('rsrpThreshold')) {
            sessionStorage.setItem('rsrpThreshold', JSON.stringify(-90));
            this.rsrpThreshold = -90;
        }
        else {
            this.rsrpThreshold = Number(sessionStorage.getItem('rsrpThreshold'));
        }
        if (!sessionStorage.getItem('sinrThreshold')) {
            sessionStorage.setItem('sinrThreshold', JSON.stringify(15));
            this.sinrThreshold = 15;
        }
        else {
            this.sinrThreshold = Number(sessionStorage.getItem('sinrThreshold'));
        }
        // sessionStorage.removeItem('sub_field_coor');
        this.view3dDialogConfig.autoFocus = false;
        this.view3dDialogConfig.width = '80%';
        this.view3dDialogConfig.hasBackdrop = false;
        this.msgDialogConfig.autoFocus = false;
        // clear Storage
        // this.authService.clearStorage();
        document.querySelector('body').style.overflow = 'hidden';
        // 接收URL參數
        this.route.queryParams.subscribe(function (params) {
            if (typeof params['taskId'] !== 'undefined') {
                _this.taskid = params['taskId'];
                if (params['isHst'] === 'true') {
                    _this.isHst = true;
                }
            }
        });
        //取得材質列表
        var promise = new Promise(function (resolve, reject) {
            var url_obs = _this.authService.API_URL + "/getObstacle/" + _this.authService.userToken;
            _this.materialIdToIndex = {};
            _this.http.get(url_obs).subscribe(function (res) {
                // console.log("----get",url_obs);
                var result = res;
                _this.materialList = Object.values(result);
                // console.log('this.materialList',this.materialList);
                // let sorted = this.materialList.sort((a,b) => a.id - b.id);
                _this.materialId = _this.materialList[0]['id'];
                for (var i = 0; i < _this.materialList.length; i++) {
                    var id = _this.materialList[i]['id'];
                    _this.materialIdToIndex[id] = i;
                }
                resolve(res);
            }, function (err) {
                console.log(err);
                return reject(err);
            });
        });
        //取得模型列表
        promise.then(function (promiseResult) { return new Promise(function (resolve, reject) {
            console.log(promiseResult);
            _this.modelIdToIndex = {};
            var url_model = _this.authService.API_URL + "/getPathLossModel/" + _this.authService.userToken;
            _this.http.get(url_model).subscribe(function (res) {
                // console.log("----get",url_model);
                var result = res;
                _this.modelList = Object.values(result);
                // let sorted = this.modelList.sort((a,b) => a.id - b.id);
                for (var i = 0; i < _this.modelList.length; i++) {
                    // if( this.modelList[i]['name'].includes("Pegatron") ){
                    //   this.modelList[i]['name'] = this.modelList[i]['name'].replace("Pegatron","P")
                    //   this.modelList[i]['chineseName'] = this.modelList[i]['chineseName'].replace("和碩","P")
                    // }
                    var id = _this.modelList[i]['id'];
                    _this.modelIdToIndex[id] = i;
                }
                resolve(res);
            }, function (err) {
                console.log(err);
                return reject(err);
            });
        }).then(function (promiseResult) {
            console.log(promiseResult);
            var url_Ant = _this.authService.API_URL + "/getAntenna/" + _this.authService.userToken;
            // let url_model = `http://192.168.1.109:4444/antenna`;
            _this.http.get(url_Ant).subscribe(function (res) {
                var result = res;
                _this.antennaList = Object.values(result);
                for (var i = 0; i < _this.antennaList.length; i++) {
                    var id = _this.antennaList[i]['antennaID'];
                    _this.AntennaIdToIndex[id] = i;
                    // if( this.antennaList[i]['antennaName'].includes("Pegatron") ){
                    //   this.antennaList[i]['antennaName'] = this.antennaList[i]['antennaName'].replace("Pegatron","P")
                    //   this.antennaList[i]['chinese_name'] = this.antennaList[i]['chinese_name'].replace("Pegatron","P")
                    //   this.antennaList[i]['manufactor'] = this.antennaList[i]['manufactor'].replace("Pegatron","P")
                    // }
                }
                for (var _i = 0, _a = _this.antennaList; _i < _a.length; _i++) {
                    var item = _a[_i];
                    if (!(_this.AntennaManufactorList.includes(item['manufactor']))) {
                        _this.AntennaManufactorList.push(item['manufactor']);
                    }
                }
                console.log(result);
            }, function (err) {
                console.log(err);
            });
        }).then(function () {
            if (sessionStorage.getItem('importFile') != null) {
                // from new-planning import file
                _this.calculateForm = new CalculateForm_1.CalculateForm();
                var reader = new FileReader();
                reader.onload = function (e) {
                    _this.readXls(e.target.result);
                };
                reader.readAsBinaryString(_this.dataURLtoBlob(sessionStorage.getItem('importFile')));
                sessionStorage.removeItem('importFile');
                // Not import File
            }
            else {
                if (_this.taskid !== '') {
                    // 編輯場域
                    var url = void 0;
                    if (_this.isHst) {
                        // 歷史紀錄
                        url = _this.authService.API_URL + "/historyDetail/" + _this.authService.userId + "/";
                        url += _this.authService.userToken + "/" + _this.taskid;
                    }
                    else {
                        url = _this.authService.API_URL + "/completeCalcResult/" + _this.taskid + "/" + _this.authService.userToken;
                    }
                    _this.http.get(url).subscribe(function (res) {
                        // console.log("----request url:",url);
                        if (_this.isHst) {
                            var result = res;
                            console.log(result);
                            var output = _this.formService.setHstOutputToResultOutput(result['output']);
                            // delete result['output'];
                            // 大小寫不同，各自塞回form
                            console.log(result);
                            // console.log(output);
                            _this.dlRatio = result['tddframeratio'];
                            _this.calculateForm = _this.formService.setHstToForm(result);
                            _this.isBsNumberOptimization = _this.formService.setHstToBsNumOpt(result);
                            console.log("isBsNumOpt = " + _this.isBsNumberOptimization);
                            _this.evaluationFuncForm = _this.calculateForm.evaluationFunc;
                            console.log("this.evaluationFuncForm = " + JSON.stringify(_this.evaluationFuncForm));
                            _this.oldFormatEvaluation();
                            _this.changeAreaFormatToPercent();
                            console.log("this.evaluationFuncForm = " + JSON.stringify(_this.evaluationFuncForm));
                            _this.setThroughputTypeAndValue();
                            _this.setStorageEvaluationFuncForm();
                            if (!(Number(_this.calculateForm.maxConnectionNum) > 0)) {
                                _this.calculateForm['maxConnectionNum'] = 32;
                            }
                            if (!(Number(_this.calculateForm.resolution) > 0)) {
                                _this.calculateForm['resolution'] = 1;
                            }
                            if (_this.authService.isEmpty(_this.calculateForm.geographicalNorth)) {
                                _this.calculateForm['geographicalNorth'] = 0;
                            }
                            // this.calculateForm.defaultBs = output['defaultBs'];
                            // this.calculateForm.bsList = output['defaultBs'];
                            if (!(_this.calculateForm.pathLossModelId in _this.modelIdToIndex)) {
                                if (_this.calculateForm.pathLossModelId < _this.modelList.length) {
                                    _this.calculateForm.pathLossModelId = _this.modelList[_this.calculateForm.pathLossModelId]['id'];
                                }
                                else {
                                    _this.calculateForm.pathLossModelId = _this.modelList[0]['id'];
                                }
                            }
                            var tempBsNum = 0;
                            if (_this.calculateForm.defaultBs == "") {
                                tempBsNum = 0;
                            }
                            else {
                                tempBsNum = _this.calculateForm.defaultBs.split('|').length;
                            }
                            _this.calculateForm.availableNewBsNumber -= tempBsNum;
                            _this.hstOutput['gaResult'] = {};
                            _this.hstOutput['gaResult']['chosenCandidate'] = output['chosenCandidate'];
                            _this.hstOutput['gaResult']['sinrMap'] = output['sinrMap'];
                            // this.hstOutput['gaResult']['connectionMapAll'] = output['connectionMapAll'];
                            _this.hstOutput['gaResult']['rsrpMap'] = output['rsrpMap'];
                            _this.hstOutput['gaResult']['ulThroughputMap'] = output['ulThroughputMap'];
                            _this.hstOutput['gaResult']['dlThroughputMap'] = output['throughputMap'];
                            if (_this.calculateForm.isSimulation === true) {
                                _this.planningIndex = '3';
                            }
                            else {
                                var isFieldOrUEActive = _this.changePlaningIndexByEvaluationForm();
                                _this.setPlanningIndex();
                                console.log("this.planningIndex = " + _this.planningIndex);
                                // 此if的block是為了相容舊版本產生的場域，若以後開放sinr相關目標請拿掉
                                // if(!isFieldOrUEActive)
                                // {
                                //   if (this.calculateForm.isCoverage || this.calculateForm.isAverageSinr) 
                                //   {                  
                                //     this.planningIndex = '1';
                                //     // 此if的block是為了相容舊版本產生的場域，若以後開放sinr相關目標請拿掉
                                //     if (this.calculateForm.isAverageSinr == true) 
                                //     {
                                //       this.calculateForm.isCoverage = true;
                                //       this.calculateForm.isAverageSinr = false;
                                //     }
                                //   } 
                                //   else 
                                //   {
                                //     this.planningIndex = '2';
                                //     // 此if的block是為了相容舊版本產生的場域，若以後開放sinr相關目標請拿掉
                                //     if (this.calculateForm.isUeAvgSinr) 
                                //     {
                                //       this.calculateForm.isUeAvgThroughput = true;
                                //       this.calculateForm.isUeAvgSinr = false;
                                //     }
                                //   }
                                // }
                            }
                            // localStorage.setItem(`${this.authService.userToken}planningObj`, JSON.stringify({
                            //   isAverageSinr: this.calculateForm.isAverageSinr,
                            //   isCoverage: this.calculateForm.isCoverage,
                            //   isUeAvgSinr: this.calculateForm.isUeAvgSinr,
                            //   isUeAvgThroughput: this.calculateForm.isUeAvgThroughput,
                            //   isUeCoverage: this.calculateForm.isUeCoverage
                            // }));
                            var sinrAry_1 = [];
                            output['sinrMap'].map(function (v) {
                                v.map(function (m) {
                                    m.map(function (d) {
                                        sinrAry_1.push(d);
                                    });
                                });
                            });
                            var rsrpAry_1 = [];
                            output['rsrpMap'].map(function (v) {
                                v.map(function (m) {
                                    m.map(function (d) {
                                        rsrpAry_1.push(d);
                                    });
                                });
                            });
                            var ulThroughputAry_1 = [];
                            try {
                                _this.result['ulThroughputMap'].map(function (v) {
                                    v.map(function (m) {
                                        m.map(function (d) {
                                            ulThroughputAry_1.push(d);
                                        });
                                    });
                                });
                            }
                            catch (e) {
                                // console.log('No ulThorughput data, it may be an old record');
                            }
                            var dlThroughputAry_1 = [];
                            try {
                                _this.result['throughputMap'].map(function (v) {
                                    v.map(function (m) {
                                        m.map(function (d) {
                                            dlThroughputAry_1.push(d);
                                        });
                                    });
                                });
                            }
                            catch (e) {
                                // console.log('No dlThorughput data, it may be an old record');
                            }
                            _this.hstOutput['sinrMax'] = Plotly.d3.max(sinrAry_1);
                            _this.hstOutput['sinrMin'] = Plotly.d3.min(sinrAry_1);
                            _this.hstOutput['rsrpMax'] = Plotly.d3.max(rsrpAry_1);
                            _this.hstOutput['rsrpMin'] = Plotly.d3.min(rsrpAry_1);
                            _this.hstOutput['ulThroughputMax'] = Plotly.d3.max(ulThroughputAry_1);
                            _this.hstOutput['ulThroughputMin'] = Plotly.d3.min(ulThroughputAry_1);
                            _this.hstOutput['dlThroughputMax'] = Plotly.d3.max(dlThroughputAry_1);
                            _this.hstOutput['dlThroughputMin'] = Plotly.d3.min(dlThroughputAry_1);
                        }
                        else {
                            console.log(res);
                            _this.calculateForm = res['input'];
                            if (_this.calculateForm.isSimulation === true) {
                                _this.planningIndex = '3';
                            }
                            else {
                                if (_this.calculateForm.isCoverage || _this.calculateForm.isAverageSinr) {
                                    // if (this.calculateForm.isCoverage || this.calculateForm.isAvgThroughput || this.calculateForm.isAverageSinr) {
                                    _this.planningIndex = '1';
                                }
                                else {
                                    _this.planningIndex = '2';
                                }
                            }
                            var tempBsNum = 0;
                            if (_this.calculateForm.defaultBs == "") {
                                tempBsNum = 0;
                            }
                            else {
                                tempBsNum = _this.calculateForm.defaultBs.split('|').length;
                            }
                            _this.calculateForm.availableNewBsNumber -= tempBsNum;
                            // this.calculateForm = res['input'];
                            console.log(_this.calculateForm);
                            _this.calculateForm.defaultBs = _this.calculateForm.bsList;
                        }
                        _this.zValues = JSON.parse(_this.calculateForm.zValue);
                        // console.log(this.calculateForm);
                        if (window.sessionStorage.getItem("form_" + _this.taskid) != null) {
                            // 從暫存取出
                            // this.calculateForm = JSON.parse(window.sessionStorage.getItem(`form_${this.taskid}`));
                        }
                        // console.log(this.calculateForm);
                        _this.initData(false, false, '');
                    }, function (err) {
                        _this.msgDialogConfig.data = {
                            type: 'error',
                            infoMessage: _this.translateService.instant('cant_get_result')
                        };
                        _this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, _this.msgDialogConfig);
                    });
                }
                else {
                    // 新增場域 upload image
                    _this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
                    // 頻寬初始值
                    _this.changeWifiFrequency();
                    if (_this.calculateForm.objectiveIndex === '0') {
                        // this.calculateForm.bandwidth = '[3]';
                    }
                    else if (_this.calculateForm.objectiveIndex === '1') {
                        // this.calculateForm.bandwidth = '[5]';
                    }
                    else if (_this.calculateForm.objectiveIndex === '2') {
                        // this.calculateForm.bandwidth = '[1]';
                    }
                    _this.initData(false, false, '');
                    if (!(_this.calculateForm.pathLossModelId in _this.modelIdToIndex)) {
                        _this.calculateForm.pathLossModelId = _this.modelList[0]['id'];
                    }
                    // evaluationForm初始值
                    _this.planningIndex = '1';
                    _this.evaluationFuncForm = new EvaluationFuncForm_1.EvaluationFuncForm();
                    if (_this.evaluationFuncForm.field.sinr.ratio.length == 0)
                        _this.addSINR();
                    if (_this.evaluationFuncForm.field.rsrp.ratio.length == 0)
                        _this.addRSRP();
                    if (_this.evaluationFuncForm.field.throughput.ratio.length == 0)
                        _this.addThroughput();
                    if (_this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
                        _this.addUEThroughput();
                }
                // setTimeout(()=> {
                //   if (this.calculateForm.defaultBs !== "") {
                //     this.planningIndex = '3';
                //     console.log('Simulation')
                //   } else {
                //     this.planningIndex = '1';
                //     console.log('Calculation')
                //   }
                // }, 1000);
            }
        })["catch"](function (err) { return console.log(err); }); });
    };
    SitePlanningComponent.prototype.checkHeiWidAlt = function (fieldOrId, altitude, zValueArr) {
        console.log('Check altitdue function works:' + altitude + ' Field altitude:' + this.calculateForm.altitude);
        altitude = Number(altitude);
        var msg = '';
        if (altitude < 0 || altitude > this.calculateForm.altitude) {
            if (altitude < 0) {
                msg = this.translateService.instant('alt_less_0');
            }
            else {
                msg = this.translateService.instant('alt_greater_than_field');
            }
            // 障礙物or基地台
            if (fieldOrId.length > 1) { //障礙物
                this.dragObject[fieldOrId].altitude = this.calculateForm.altitude;
            }
            else { //zValue
                var existed = false;
                for (var i = 0; i < this.zValues.length; i++) {
                    // if (this.zValues[i] == this.calculateForm.altitude.toString()) {
                    if (this.zValues[i] == this.calculateForm.altitude) {
                        existed = true;
                    }
                }
                if (!existed) {
                    this.zValues[Number(fieldOrId)] = Number(this.calculateForm.altitude);
                    // this.zValues[Number(fieldOrId)] = this.calculateForm.altitude.toString();
                }
                else {
                    delete this.zValues[Number(fieldOrId)];
                }
            }
        }
        //zValues
        if (fieldOrId.length == 1) {
            // 先檢視是否有重複高度
            for (var i = 0; i < 3; i++) {
                if (Number(fieldOrId) == i) {
                    continue;
                }
                else {
                    if (Number(this.zValues[i]) == altitude) { //找到重複高度的了 刪掉剛剛改的zValue
                        delete this.zValues[Number(fieldOrId)];
                        msg = this.translateService.instant('already_same_alt');
                        if (i == 0 && this.zValues[1] === undefined && this.zValues[2] === undefined) {
                            this.zValues.length = 1;
                            console.log(this.zValues);
                        }
                        else if (i == 0 && this.zValues[1] !== undefined && this.zValues[2] === undefined) {
                            this.zValues.length = 2;
                        }
                        else if (i == 0 && this.zValues[1] === undefined && this.zValues[2] === undefined) {
                            this.zValues.length = 3;
                        }
                        else if (i == 1) {
                            this.zValues.length = 2;
                            console.log(this.zValues);
                        }
                    }
                }
            }
            // console.log(this.zValues);
            if (this.zValues[0] === undefined || this.zValues[0] === null) {
                if (this.zValues[1] === undefined && this.zValues[2] === undefined) {
                    this.zValues[0] = 0;
                    this.zValues.length = 1;
                }
                else if (this.zValues[1] !== undefined && this.zValues[2] !== undefined) {
                    this.zValues[0] = this.zValues[1];
                    this.zValues[1] = this.zValues[2];
                    delete this.zValues[2];
                    this.zValues.length = 2;
                }
                else if (this.zValues[1] === undefined && this.zValues[2] !== undefined) {
                    this.zValues[0] = this.zValues[2];
                    delete this.zValues[2];
                    this.zValues.length = 1;
                }
                else if (this.zValues[1] !== undefined && this.zValues[2] === undefined) {
                    this.zValues[0] = this.zValues[1];
                    delete this.zValues[1];
                    this.zValues.length = 1;
                }
            }
            else if (this.zValues[1] === undefined || this.zValues[1] === null) {
                if (this.zValues[0] === undefined && this.zValues[2] === undefined) {
                    this.zValues[0] = 0;
                    this.zValues.length = 1;
                }
                else if (this.zValues[0] !== undefined && this.zValues[2] !== undefined) {
                    this.zValues[1] = this.zValues[2];
                    delete this.zValues[2];
                    this.zValues.length = 2;
                }
                else if (this.zValues[0] !== undefined && this.zValues[2] === undefined) {
                    delete this.zValues[1];
                    this.zValues.length = 1;
                }
                else if (this.zValues[0] === undefined && this.zValues[2] !== undefined) {
                    this.zValues[0] = this.zValues[2];
                    delete this.zValues[2];
                    this.zValues.length = 1;
                }
            }
            else if (this.zValues[2] === undefined || this.zValues[2] === null) {
                if (this.zValues[0] === undefined && this.zValues[1] === undefined) {
                    this.zValues[0] = 0;
                    this.zValues.length = 1;
                }
                else if (this.zValues[0] === undefined && this.zValues[1] !== undefined) {
                    this.zValues[0] = this.zValues[1];
                    delete this.zValues[1];
                    this.zValues.length = 1;
                }
                else if (this.zValues[0] !== undefined && this.zValues[1] === undefined) {
                    this.zValues[1] = this.zValues[2];
                    delete this.zValues[2];
                    this.zValues.length = 2;
                }
                else {
                    this.zValues.length = 2;
                }
            }
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if (Number(this.zValues[i]) < Number(this.zValues[j])) {
                        var temp = this.zValues[i];
                        this.zValues[i] = this.zValues[j];
                        this.zValues[j] = temp;
                    }
                }
            }
            console.log(this.zValues);
            console.log(this.zValues.length);
            //Todo: UE是否全部重設初始高度，或跳提醒
        }
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
    };
    /**
     * 離開頁面
     */
    SitePlanningComponent.prototype.ngOnDestroy = function () {
        this.setForm();
        // 暫存
        // window.sessionStorage.clear();
        if (this.taskid !== '') {
            // window.sessionStorage.setItem(`form_${this.taskid}`, JSON.stringify(this.calculateForm));
        }
        else {
            window.sessionStorage.setItem("form_blank_task", JSON.stringify(this.calculateForm));
        }
        if (typeof this.progressInterval !== 'undefined') {
            window.clearInterval(this.progressInterval);
            for (var i = 0; i < this.progressInterval; i++) {
                window.clearInterval(i);
            }
        }
        try {
            this.moveable.destroy();
        }
        catch (error) { }
        document.querySelector('body').style.overflow = 'auto';
    };
    SitePlanningComponent.prototype.tempParamStorageForSelect = function (temp) {
        // console.log(window.sessionStorage.getItem('tempParamForSelect'));
        if (null == window.sessionStorage.getItem('tempParamForSelect')) {
            // console.log('tempParamStorageForSelect');
            window.sessionStorage.setItem('tempParamForSelect', temp);
        }
    };
    SitePlanningComponent.prototype.tempParamStorage = function (temp) {
        window.sessionStorage.setItem('tempParam', temp);
        // console.log("--this.dragObject",this.dragObject);
    };
    SitePlanningComponent.prototype.checkFieldWidHei = function (isHWChange) {
        // this.deleteList.length = 0;
        // FoolProof Height and Width -----------------------
        if (isHWChange == 'width' || isHWChange == 'height') {
            //障礙物
            for (var i = 0; i < this.obstacleList.length; i++) {
                if (isHWChange == 'width') {
                    if (this.calculateForm.width < this.dragObject[this.obstacleList[i]].x) {
                        this.deleteList.push([this.obstacleList[i], i]);
                    }
                    else if (this.calculateForm.width < this.dragObject[this.obstacleList[i]].x + this.dragObject[this.obstacleList[i]].width) {
                        this.deleteList.push([this.obstacleList[i], i]);
                    }
                    else { //rotation
                    }
                }
                else {
                    if (this.calculateForm.height < this.dragObject[this.obstacleList[i]].y) {
                        this.deleteList.push([this.obstacleList[i], i]);
                    }
                    else if (this.calculateForm.height < this.dragObject[this.obstacleList[i]].y + this.dragObject[this.obstacleList[i]].head) {
                        this.deleteList.push([this.obstacleList[i], i]);
                    }
                    else { //rotation
                    }
                }
            }
            //既有基地台
            for (var i = 0; i < this.defaultBSList.length; i++) {
                if (isHWChange == 'width') {
                    if (this.calculateForm.width < this.dragObject[this.defaultBSList[i]].x) {
                        this.deleteList.push([this.defaultBSList[i], i]);
                    }
                }
                else {
                    if (this.calculateForm.height < this.dragObject[this.defaultBSList[i]].y) {
                        this.deleteList.push([this.defaultBSList[i], i]);
                    }
                }
            }
            //待選基地台
            for (var i = 0; i < this.candidateList.length; i++) {
                if (isHWChange == 'width') {
                    if (this.calculateForm.width < this.dragObject[this.candidateList[i]].x) {
                        this.deleteList.push([this.candidateList[i], i]);
                    }
                }
                else {
                    if (this.calculateForm.height < this.dragObject[this.candidateList[i]].y) {
                        this.deleteList.push([this.candidateList[i], i]);
                    }
                }
            }
            // UE
            for (var i = 0; i < this.ueList.length; i++) {
                if (isHWChange == 'width') {
                    if (this.calculateForm.width < this.dragObject[this.ueList[i]].x) {
                        this.deleteList.push([this.ueList[i], i]);
                        console.log('push', this.ueList[i], i);
                    }
                }
                else {
                    if (this.calculateForm.height < this.dragObject[this.ueList[i]].y) {
                        this.deleteList.push([this.ueList[i], i]);
                    }
                }
            }
            if (this.deleteList.length != 0) {
                console.log(this.deleteList);
                console.log(this.defaultBSList);
                this.matDialog.open(this.deleteModal2);
            }
            else {
                this.initData(false, false, 'delete');
            }
        }
    };
    /**
     * init Data
     * @param isImportXls 是否import xlxs
     * @param isImportImg 是否import image
     */
    SitePlanningComponent.prototype.initData = function (isImportXls, isImportImg, isHWAChange) {
        // console.log('--initData.');
        var _this = this;
        try {
            console.log(this.defaultBSList);
            this.createResolutionList();
            //檢查有沒有場域長寬高被改成負數
            if (this.calculateForm.height < 0 || this.calculateForm.altitude <= 0 || this.calculateForm.width < 0) {
                if (this.calculateForm.height < 0) {
                    this.calculateForm.height = Number(window.sessionStorage.getItem('tempParam'));
                    window.sessionStorage.removeItem('tempParam');
                    // this.calculateForm.height = 100;
                }
                else if (this.calculateForm.altitude <= 0) {
                    this.calculateForm.altitude = Number(window.sessionStorage.getItem('tempParam'));
                    window.sessionStorage.removeItem('tempParam');
                    // this.calculateForm.altitude = 3;
                }
                else {
                    this.calculateForm.width = Number(window.sessionStorage.getItem('tempParam'));
                    window.sessionStorage.removeItem('tempParam');
                    // this.calculateForm.width = 100;
                }
                var msg = this.translateService.instant('field_alt_less_0');
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            }
            // FoolProof Altitude
            if (isHWAChange == 'altitude') {
                var msg = this.translateService.instant('field_alt_fix_then_all_fix');
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                //檢查場域高度有沒有小於場域所有的物件高度
                //zValues
                for (var i = 0; i < this.zValues.length; i++) {
                    if (this.calculateForm.altitude < Number(this.zValues[i])) {
                        delete this.zValues[i];
                    }
                }
                if (this.zValues[0] == undefined && this.zValues[1] == undefined && this.zValues[2] == undefined) {
                    this.zValues[0] = 0;
                    this.zValues.length = 1;
                }
                else if (this.zValues[0] != undefined && this.zValues[1] != undefined && this.zValues[2] == undefined) {
                    this.zValues.length = 2;
                }
                else if (this.zValues[0] != undefined && this.zValues[1] == undefined && this.zValues[2] == undefined) {
                    this.zValues.length = 1;
                }
                //障礙物
                for (var i = 0; i < this.obstacleList.length; i++) {
                    // console.log('障礙物'+this.dragObject[this.obstacleList[i]].altitude+' '+this.calculateForm.altitude);
                    if (this.calculateForm.altitude < this.dragObject[this.obstacleList[i]].altitude) {
                        this.dragObject[this.obstacleList[i]].altitude = this.calculateForm.altitude;
                        // console.log('障礙物高度被修改成場域高度'+this.dragObject[this.obstacleList[i]].altitude);
                    }
                }
                //既有基地台
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    // console.log('既有基地台'+this.dragObject[this.defaultBSList[i]].altitude+' '+this.calculateForm.altitude);
                    if (this.calculateForm.altitude < this.dragObject[this.defaultBSList[i]].altitude) {
                        this.dragObject[this.defaultBSList[i]].altitude = this.calculateForm.altitude;
                        // console.log('既有基地台高度被修改成場域高度'+this.dragObject[this.defaultBSList[i]].altitude);
                    }
                }
                //待選基地台
                for (var i = 0; i < this.candidateList.length; i++) {
                    if (this.calculateForm.altitude < this.dragObject[this.candidateList[i]].altitude) {
                        this.dragObject[this.candidateList[i]].altitude = this.calculateForm.altitude;
                    }
                }
            }
            // Plotly繪圖config
            var defaultPlotlyConfiguration_1 = {
                displaylogo: false,
                showTips: false,
                editable: false,
                scrollZoom: false,
                displayModeBar: false
            };
            // 繪圖layout
            this.plotLayout = {
                autosize: false,
                width: this.calculateForm.width,
                height: this.calculateForm.height,
                xaxis: {
                    linewidth: 1,
                    mirror: 'all',
                    range: [0, this.calculateForm.width],
                    showgrid: false,
                    zeroline: false,
                    fixedrange: true
                },
                yaxis: {
                    linewidth: 1,
                    mirror: 'all',
                    range: [0, this.calculateForm.height],
                    showgrid: false,
                    zeroline: false,
                    fixedrange: true
                },
                margin: { t: 20, b: 20, l: 50, r: 50 }
            };
            window.setTimeout(function () {
                if (!_this.authService.isEmpty(_this.calculateForm.mapImage)) {
                    var reader_1 = new FileReader();
                    reader_1.readAsDataURL(_this.dataURLtoBlob(_this.calculateForm.mapImage));
                    reader_1.onload = function (e) {
                        // 背景圖
                        _this.plotLayout['images'] = [{
                                source: reader_1.result,
                                x: 0,
                                y: 0,
                                sizex: _this.calculateForm.width,
                                sizey: _this.calculateForm.height,
                                xref: 'x',
                                yref: 'y',
                                xanchor: 'left',
                                yanchor: 'bottom',
                                sizing: 'stretch'
                            }];
                        // draw background image chart
                        Plotly.newPlot('chart', {
                            data: [],
                            layout: _this.plotLayout,
                            config: defaultPlotlyConfiguration_1
                        }).then(function (gd) {
                            // this.chartService.calSize(this.calculateForm, gd).then(res => {
                            //   const layoutOption = {
                            //     width: res[0],
                            //     height: res[1]
                            //   };
                            //   // image放進圖裡後需取得比例尺
                            //   Plotly.relayout('chart', layoutOption).then((gd2) => {
                            // 計算比例尺
                            _this.calScale(gd);
                            if (isImportXls) {
                                // import xlsx
                                _this.setImportData();
                            }
                            else if (isImportImg) {
                                // do noting
                            }
                            else if (_this.taskid !== '' || sessionStorage.getItem('form_blank_task') != null) {
                                // 編輯
                                if (isHWAChange !== '') {
                                    // this.edit(false);
                                }
                                else {
                                    _this.edit(true);
                                }
                                console.log(_this.calculateForm);
                            }
                            // 重設場域尺寸與載入物件
                            _this.chartResize();
                            //   }); 
                            // });
                        });
                    };
                }
                else {
                    // this.plotLayout['width'] = window.innerWidth * 0.68;
                    // this.plotLayout['width'] = window.innerWidth;
                    // draw background image chart
                    Plotly.newPlot('chart', {
                        data: [],
                        layout: _this.plotLayout,
                        config: defaultPlotlyConfiguration_1
                    }).then(function (gd) {
                        // this.chartService.calSize(this.calculateForm, gd).then(res => {
                        //   const layoutOption = {
                        //     width: res[0],
                        //     height: res[1]
                        //   };
                        //   // 重設長寬
                        //   Plotly.relayout('chart', layoutOption).then((gd2) => {
                        // 計算比例尺
                        _this.calScale(gd);
                        // import xlsx
                        if (isImportXls) {
                            _this.setImportData();
                        }
                        else if (isImportImg) {
                            // do nothing
                        }
                        else if (_this.taskid !== '' || sessionStorage.getItem('form_blank_task') != null) {
                            // 編輯
                            console.log(_this.calculateForm);
                            if (isHWAChange !== '') {
                                // this.edit(false);
                            }
                            else {
                                _this.edit(true);
                            }
                        }
                        // 重設場域尺寸與載入物件
                        _this.chartResize();
                        //   });
                        // });
                    });
                }
                if (isHWAChange != '') {
                    window.setTimeout(function () {
                        for (var _i = 0, _a = _this.obstacleList; _i < _a.length; _i++) {
                            var item = _a[_i];
                            if (_this.dragObject[item].element == '2') {
                                // 切換場域尺寸後圓形會變形，重新初始化物件設定長寬
                                _this.moveClick(item);
                                _this.target = document.querySelector("#" + item);
                                _this.setTransform(_this.target);
                                var width = _this.target.getBoundingClientRect().width;
                                _this.frame.set('height', width + "px");
                                _this.frame.set('width', width + "px");
                                var x = (width / 2).toString();
                                _this.ellipseStyle[_this.svgId].rx = x;
                                _this.ellipseStyle[_this.svgId].ry = x;
                                _this.ellipseStyle[_this.svgId].cx = x;
                                _this.ellipseStyle[_this.svgId].cy = x;
                                _this.moveable.destroy();
                            }
                        }
                    }, 500);
                }
            }, 0);
        }
        catch (error) {
            console.log(error);
            // fail xlsx
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.translateService.instant('xlxs.fail')
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
    };
    /** 計算比例尺 */
    SitePlanningComponent.prototype.calScale = function (gd) {
        var xy = gd.querySelector('.xy').querySelectorAll('rect')[0];
        var rect = xy.getBoundingClientRect();
        this.chartLeft = rect.left;
        this.chartRight = rect.right;
        this.chartTop = rect.top;
        this.chartBottom = rect.bottom;
        this.chartHeight = rect.height;
        this.dragStyle = {
            left: xy.getAttribute('x') + "px",
            top: xy.getAttribute('y') + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            position: 'absolute'
        };
        this.xLinear = Plotly.d3.scale.linear()
            .domain([0, rect.width])
            .range([0, this.calculateForm.width]);
        this.yLinear = Plotly.d3.scale.linear()
            .domain([0, rect.height])
            .range([0, this.calculateForm.height]);
        this.pixelXLinear = Plotly.d3.scale.linear()
            .domain([0, this.calculateForm.width])
            .range([0, rect.width]);
        this.pixelYLinear = Plotly.d3.scale.linear()
            .domain([0, this.calculateForm.height])
            .range([0, rect.height]);
    };
    SitePlanningComponent.prototype.checkSize = function (width, height, w, h) {
        if (width > height) {
            w--;
            this.pixelXLinear = Plotly.d3.scale.linear()
                .domain([0, this.calculateForm.width])
                .range([0, w]);
            width = Math.ceil(this.pixelXLinear(5));
        }
        else if (width < height) {
            h--;
            this.pixelYLinear = Plotly.d3.scale.linear()
                .domain([0, this.calculateForm.height])
                .range([0, h]);
            height = Math.ceil(this.pixelXLinear(5));
        }
        if (width !== height) {
            console.log(width, height);
            this.checkSize(width, height, w, h);
        }
        else {
            console.log(width, height, w, h);
        }
        return [w, h];
    };
    /**
     * dataURI to blob
     * @param dataURI
     */
    SitePlanningComponent.prototype.dataURLtoBlob = function (dataURI) {
        var byteString;
        try {
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]); // atob(dataURI.split(',')[1]);
                // decodeURIComponent(escape(window.atob(("eyJzdWIiOiJ0ZXN0MyIsInVzZXJJZCI6IjEwMTY5MiIsIm5hbWUiOiLmtYvor5V0ZXN0M-a1i-ivlSIsImV4cCI6MTU3OTUxMTY0OH0").replace(/-/g, "+").replace(/_/g, "/"))));
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
        }
        catch (error) {
            console.log(error);
            // fail xlsx
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.translateService.instant('xlxs.fail')
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            throw error;
        }
    };
    /**
     * 新增互動物件
     * @param id
     */
    SitePlanningComponent.prototype.addMoveable = function (id) {
        var _this = this;
        try {
            this.moveable.destroy();
        }
        catch (error) { }
        // delete keycode生效
        window.setTimeout(function () {
            _this.live = true;
        }, 0);
        this.moveError = false;
        var color;
        var width = 30;
        var height = 30;
        if (id === 'rect') {
            color = this.OBSTACLE_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            this.obstacleList.push(this.svgId);
            this.rectStyle[this.svgId] = {
                width: 30,
                height: 30,
                fill: color
            };
        }
        else if (id === 'ellipse') {
            color = this.OBSTACLE_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            this.obstacleList.push(this.svgId);
            this.ellipseStyle[this.svgId] = {
                ry: 15,
                rx: 15,
                cx: 15,
                cy: 15,
                fill: color
            };
        }
        else if (id === 'polygon') {
            color = this.OBSTACLE_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            this.obstacleList.push(this.svgId);
            this.polygonStyle[this.svgId] = {
                points: '15,0 30,30 0,30',
                fill: this.OBSTACLE_COLOR
            };
        }
        else if (id === 'defaultBS') {
            color = this.DEFAULT_BS_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            console.log(this.defaultBSList);
            this.defaultBSList.push(this.svgId);
            console.log(this.defaultBSList);
            this.pathStyle[this.svgId] = {
                fill: this.DEFAULT_BS_COLOR
            };
            //Add bs RF param
            this.bsListRfParam[this.svgId] = {
                txpower: 0,
                beampattern: 0,
                fddDlFrequency: 2140,
                fddUlFrequency: 1950,
                ulModulationCodScheme: "64QAM-table",
                dlModulationCodScheme: "64QAM-table",
                dlMimoLayer: '1',
                ulMimoLayer: '1',
                //TDD 5G
                tddscs: '15',
                tddbandwidth: '5',
                tddfrequency: 2350,
                //FDD 5G
                dlScs: '15',
                ulScs: '15',
                dlBandwidth: '5',
                ulBandwidth: '5',
                subcarrier: 15,
                scsBandwidth: 0,
                //4G Only
                mimoNumber4G: '1',
                //Wifi
                wifiProtocol: 'wifi4',
                guardInterval: '400ns',
                wifiMimo: '2x2',
                wifiFrequency: 2412,
                wifiBandwidth: '20',
                bsTxGain: 0,
                bsNoiseFigure: 0,
                AntennaId: 1,
                theta: 0,
                phi: 0
            };
            if (this.calculateForm.objectiveIndex === '0') {
                this.bsListRfParam[this.svgId].dlBandwidth = '1.4';
                this.bsListRfParam[this.svgId].ulBandwidth = '1.4';
            }
            else if (this.calculateForm.objectiveIndex == '2') {
                this.bsListRfParam[this.svgId].wifiBandwidth = '20';
            }
        }
        else if (id === 'candidate') {
            color = this.CANDIDATE_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            this.candidateList.push(this.svgId);
            this.pathStyle[this.svgId] = {
                fill: this.CANDIDATE_COLOR
            };
            width = this.candidateWidth;
            height = this.candidateHeight;
            // Add bs RF param
            this.bsListRfParam[this.svgId] = {
                txpower: 0,
                beampattern: 0,
                fddDlFrequency: 2400,
                fddUlFrequency: 2400,
                ulModulationCodScheme: "64QAM-table",
                dlModulationCodScheme: "64QAM-table",
                dlMimoLayer: '1',
                ulMimoLayer: '1',
                //TDD 5G
                tddscs: '15',
                tddbandwidth: '5',
                tddfrequency: 2400,
                //FDD 5G
                dlScs: '15',
                ulScs: '15',
                dlBandwidth: '5',
                ulBandwidth: '5',
                subcarrier: 15,
                scsBandwidth: 0,
                //4G Only
                mimoNumber4G: '1',
                //Wifi
                wifiProtocol: 'wifi4',
                guardInterval: '400ns',
                wifiMimo: '2x2',
                // wifiBandwidth: 20
                bsTxGain: 0,
                bsNoiseFigure: 0,
                AntennaId: 1,
                theta: 0,
                phi: 0
            };
            if (Number(this.calculateForm.objectiveIndex) === 0) {
                this.bsListRfParam[this.svgId].dlBandwidth = '1.4';
                this.bsListRfParam[this.svgId].ulBandwidth = '1.4';
            }
        }
        else if (id === 'UE') {
            color = this.UE_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            this.ueList.push(this.svgId);
            this.ueListParam[this.svgId] = {
                ueRxGain: 0
            };
            this.pathStyle[this.svgId] = {
                fill: this.UE_COLOR
            };
            width = this.ueWidth;
            height = this.ueHeight;
        }
        else if (id === 'trapezoid') {
            // 梯形
            color = this.OBSTACLE_COLOR;
            this.svgId = id + "_" + this.generateString(10);
            this.obstacleList.push(this.svgId);
            this.trapezoidStyle[this.svgId] = {
                fill: color,
                width: width,
                height: height
            };
        }
        else if (id === 'subField') {
            this.isShowSubField = true;
            this.svgId = id + "_" + this.generateString(10);
            this.subFieldList.push(this.svgId);
            this.subFieldStyle[this.svgId] = {
                width: 30,
                height: 30,
                // fill: '#ffffff',
                fill: 'pink',
                fillOpacity: 0.2,
                stroke: 'pink',
                // strokeWidth:5,
                strokeWidth: 3
            };
            if (sessionStorage.getItem('sub_field_coor') != undefined) {
                console.log(sessionStorage.getItem('sub_field_coor'));
                var sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
                console.log(sub_field_arr);
                sub_field_arr.push({
                    id: this.svgId,
                    x: 0,
                    y: 0,
                    width: 30,
                    height: 30
                });
                console.log(sub_field_arr);
                sessionStorage.setItem("sub_field_coor", JSON.stringify(sub_field_arr));
            }
            else {
                var sub_field_arr = [];
                sub_field_arr[0] = {
                    id: this.svgId,
                    x: 0,
                    y: 0,
                    width: 30,
                    height: 30
                };
                sessionStorage.setItem("sub_field_coor", JSON.stringify(sub_field_arr));
            }
        }
        this.spanStyle[this.svgId] = {
            left: this.initpxl + "px",
            top: this.initpxl + "px",
            width: width + "px",
            height: height + "px"
        };
        this.svgStyle[this.svgId] = {
            display: 'inherit',
            width: width,
            height: height
        };
        var materialName = '';
        if (this.authService.lang == 'zh-TW') {
            materialName = this.materialList[0]['chineseName'];
        }
        else {
            materialName = this.materialList[0]['name'];
        }
        this.dragObject[this.svgId] = {
            x: 0,
            y: 0,
            // z: this.zValues[0],
            z: 0,
            width: width,
            height: height,
            altitude: this.calculateForm.altitude,
            rotate: 0,
            title: this.svgMap[id].title,
            type: this.svgMap[id].type,
            color: color,
            material: this.materialList[0]['id'],
            element: this.parseElement(id),
            materialName: materialName
        };
        if (id == 'UE') {
            this.dragObject[this.svgId].z = this.zValues[0];
        }
        this.realId = _.cloneDeep(this.svgId);
        // 預設互動外框設定值
        this.frame = new scenejs_1.Frame({
            width: width + "px",
            height: height + "px",
            left: this.initpxl + "px",
            top: this.initpxl + "px",
            'z-index': 100,
            transform: {
                rotate: '0deg',
                scaleX: 1,
                scaleY: 1
            }
        });
        // this.initpxl += 10;
        // 圖加透明蓋子，避免產生物件過程滑鼠碰到其他物件
        this.bgdivStyle.width = window.innerWidth + "px";
        this.bgdivStyle.height = window.innerHeight + "px";
        this.bgdivStyle['z-index'] = "999999999999";
        window.setTimeout(function () {
            _this.target = document.getElementById("" + _this.svgId);
            _this.live = true;
            if (_this.svgMap[id].type === 'obstacle' || _this.svgMap[id].type === 'subField') {
                if (_this.dragObject[_this.svgId].element === 2) {
                    // 圓形關閉旋轉
                    _this.moveable.rotatable = false;
                    // 只開4個拖拉點
                    _this.moveable.renderDirections = ['nw', 'ne', 'sw', 'se'];
                }
                else {
                    _this.moveable.rotatable = true;
                    // 拖拉點全開
                    _this.moveable.renderDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 'se'];
                }
                _this.moveable.resizable = true;
            }
            else {
                _this.moveable.rotatable = false;
                _this.moveable.resizable = false;
            }
            _this.dragObject[_this.svgId].y = _this.yLinear(_this.target.getBoundingClientRect().top);
            _this.moveable.ngOnInit();
            window.setTimeout(function () {
                _this.setDragData();
                _this.currentLeft = _.cloneDeep(_this.spanStyle[_this.svgId].left);
                _this.currentTop = _.cloneDeep(_this.spanStyle[_this.svgId].top);
                _this.ognSpanStyle = _.cloneDeep(_this.spanStyle);
                _this.ognDragObject = _.cloneDeep(_this.dragObject);
                _this.hoverObj = _this.target;
                // 障礙物若莫名移動，還原位置
                _this.backObstacle();
                _this.setLabel();
                // 還原蓋子
                _this.bgdivStyle.width = "0px";
                _this.bgdivStyle.height = "0px";
                _this.bgdivStyle['z-index'] = "0";
            }, 100);
            window.setTimeout(function () {
                _this.moveNumber(_this.svgId);
            }, 0);
        }, 0);
    };
    SitePlanningComponent.prototype.changeZvalue = function (id) {
        try {
            this.moveable.destroy();
        }
        catch (error) { }
        if (Number(this.dragObject[id].z) < 0 || Number(this.dragObject[id].z) + Number(this.dragObject[id].altitude) > Number(this.calculateForm.altitude)) {
            // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
            this.recoverParam(id, 'z');
            var msg = this.translateService.instant('z_greater_then_field_altitude');
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            return;
        }
        this.target = document.getElementById(id);
        this.svgId = id;
        this.realId = _.cloneDeep(id);
        this.frame = new scenejs_1.Frame({
            width: this.spanStyle[id].width,
            height: this.spanStyle[id].height,
            left: this.spanStyle[id].left,
            top: this.spanStyle[id].top,
            'z-index': 100 + 10 * this.dragObject[this.svgId].z,
            transform: {
                rotate: this.dragObject[this.svgId].rotate + "deg",
                scaleX: 1,
                scaleY: 1
            }
        });
        this.setTransform(this.target);
    };
    /**
     * click互動物件
     * @param id
     */
    SitePlanningComponent.prototype.moveClick = function (id) {
        var _this = this;
        try {
            this.moveable.destroy();
        }
        catch (error) { }
        // delete keycode生效
        window.setTimeout(function () {
            _this.live = true;
        }, 0);
        // console.log(id);
        this.moveError = false;
        this.target = document.getElementById(id);
        this.svgId = id;
        this.realId = _.cloneDeep(id);
        this.frame = new scenejs_1.Frame({
            width: this.spanStyle[id].width,
            height: this.spanStyle[id].height,
            left: this.spanStyle[id].left,
            top: this.spanStyle[id].top,
            'z-index': 100 + 10 * this.dragObject[this.svgId].z,
            transform: {
                rotate: this.dragObject[this.svgId].rotate + "deg",
                scaleX: 1,
                scaleY: 1
            }
        });
        // this.setTransform(this.target);
        // console.log(this.frame);
        // console.log(this.target);
        // console.log(this.spanStyle);
        // console.log(this.dragObject[id]);
        // console.log(this.moveable);
        this.currentLeft = _.cloneDeep(this.spanStyle[this.svgId].left);
        this.currentTop = _.cloneDeep(this.spanStyle[this.svgId].top);
        this.ognSpanStyle = _.cloneDeep(this.spanStyle);
        this.ognDragObject = _.cloneDeep(this.dragObject);
        this.live = true;
        if (this.dragObject[id].type === 'obstacle' || this.dragObject[id].type === 'subField') {
            if (this.dragObject[id].element === 2) {
                // 圓形關閉旋轉
                this.moveable.rotatable = false;
                // 只開4個拖拉點
                this.moveable.renderDirections = ['nw', 'ne', 'sw', 'se'];
            }
            else {
                // console.log('Resizeeeee!');
                this.moveable.rotatable = true;
                // 拖拉點全開
                this.moveable.renderDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 'se'];
            }
            this.moveable.resizable = true;
        }
        else {
            this.moveable.rotatable = false;
            this.moveable.resizable = false;
        }
        this.moveable.ngOnInit();
        window.setTimeout(function () {
            _this.setDragData();
            _this.hoverObj = _this.target;
            _this.setLabel();
        }, 0);
    };
    /**
     * 設定互動外框style
     * @param target
     */
    SitePlanningComponent.prototype.setTransform = function (target) {
        target.style.cssText = this.frame.toCSS();
    };
    /** set tooltip position */
    SitePlanningComponent.prototype.setLabel = function () {
        var _this = this;
        this.live = true;
        window.setTimeout(function () {
            var obj = _this.hoverObj.getBoundingClientRect();
            _this.tooltipStyle.left = obj.left + "px";
            _this.tooltipStyle.top = obj.top + obj.height + 5 + "px";
            _this.tooltipStr = _this.getTooltip();
        }, 0);
    };
    /** tooltip 文字 */
    SitePlanningComponent.prototype.getTooltip = function () {
        var id = this.hoverObj.id;
        var title = this.dragObject[id].title + ": " + this.svgNum;
        var overlappedIdList = this.checkObstacleIsOverlaped(id);
        if (overlappedIdList.length > 0) {
            title += "<br>" + this.translateService.instant('overlap') + ": " + overlappedIdList;
        }
        title += "<br><strong>\u2014\u2014\u2014\u2014\u2014</strong><br>";
        title += "X: " + this.dragObject[id].x + "<br>";
        title += "Y: " + this.dragObject[id].y + "<br>";
        if (this.dragObject[id].type === 'obstacle') {
            title += this.translateService.instant('altitude.start') + ": " + this.dragObject[id].z + "<br>";
            title += this.translateService.instant('altitude.obstacle') + ": " + this.dragObject[id].altitude + "<br>";
            title += this.translateService.instant('width') + ": " + this.dragObject[id].width + "<br>";
            title += this.translateService.instant('height') + ": " + this.dragObject[id].height + "<br>";
            /*
            } else if (this.dragObject[id].type === 'defaultBS' || this.dragObject[id].type === 'candidate') {
              // title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].altitude}<br>`;
            } else if (this.dragObject[id].type === 'subField') {
        
            } else {
              // title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].z}<br>`;
            }
            if (this.dragObject[id].type === 'obstacle') {
            */
            var index = this.materialIdToIndex[Number(this.dragObject[id].material)];
            title += this.translateService.instant('material') + ": ";
            // if(this.materialList[index]['property'] == "default"){
            title += "" + this.dragObject[id].materialName;
            // } else {
            //   title += `${this.translateService.instant('customize')}_${this.dragObject[id].materialName}`;
            // }
        }
        else if (this.dragObject[id].type != 'subField') {
            title += "Z: " + this.dragObject[id].altitude + "<br>";
        }
        /*
        if (this.dragObject[id].type === 'UE') {
          title += `${this.translateService.instant('RxGain')}: ${this.ueListParam[id].ueRxGain}<br>`;
        }
        */
        return title;
    };
    SitePlanningComponent.prototype.checkObstacleIsOverlaped = function (ObjId) {
        if (ObjId.split('_')[0] != "rect" && ObjId.split('_')[0] != "polygon" && ObjId.split('_')[0] != "trapezoid" && ObjId.split('_')[0] != "ellipse") {
            return [];
        }
        var overlapedIDList = [];
        var obj = this.dragObject[ObjId];
        var shape = Number(obj.element);
        // console.log("new check obstacle1:",ObjId);
        var coordinateObj = this.calculateCoordinate(obj, shape);
        var coordinate = coordinateObj[0];
        var turfobj = coordinateObj[1];
        for (var i = 0; i < this.obstacleList.length; i++) {
            var id = this.obstacleList[i];
            // console.log("obstacle2:",id);
            if (id == ObjId) {
                continue;
            }
            else {
                var obj2 = this.dragObject[id];
                var shape2 = Number(obj2.element);
                var coordinateobj2 = this.calculateCoordinate(obj2, shape2);
                var coordinate2 = coordinateobj2[0];
                var turfobj2 = coordinateobj2[1];
                var interObj = void 0;
                if (shape == 2 && shape2 == 2) {
                    interObj = Intersection.intersectCircleCircle(coordinate[0], coordinate[1], coordinate2[0], coordinate2[1]);
                }
                else if (shape == 2) {
                    interObj = Intersection.intersectCirclePolygon(coordinate[0], coordinate[1], coordinate2);
                }
                else if (shape2 == 2) {
                    interObj = Intersection.intersectCirclePolygon(coordinate2[0], coordinate2[1], coordinate);
                }
                else {
                    interObj = Intersection.intersectPolygonPolygon(coordinate, coordinate2);
                }
                // console.log('interObj',interObj);
                if (interObj.status == "Intersection" || interObj.status == "Inside" || boolean_contains_1["default"](turfobj, turfobj2) || boolean_contains_1["default"](turfobj2, turfobj)) {
                    overlapedIDList.push(i + 1);
                }
            }
        }
        return overlapedIDList;
    };
    SitePlanningComponent.prototype.calculateCoordinate = function (obj, shape) {
        var coordinate = [];
        var turfObj;
        var angle = Number(obj.rotate % 360);
        var obWid = Number(obj.width);
        var obHei = Number(obj.height);
        var deg = 2 * Math.PI / 360;
        var x = Number(obj.x);
        var y = Number(obj.y);
        var tempAngle = 360 - angle;
        if (angle < 0) {
            angle += 360;
        }
        ;
        if (shape == 0) { // 0:矩形, 1:三角形, 2:正圓形, 3:梯形
            var rcc = [x + obWid / 2, y + obHei / 2];
            var leftbot = [x, y];
            var lefttop = [x, y + obHei];
            var rightbot = [x + obWid, y];
            var righttop = [x + obWid, y + obHei];
            if (angle == 0) {
                coordinate = [
                    new Point2D(leftbot[0], leftbot[1]),
                    new Point2D(rightbot[0], rightbot[1]),
                    new Point2D(righttop[0], righttop[1]),
                    new Point2D(lefttop[0], lefttop[1])
                ];
                turfObj = helpers_1.polygon([[leftbot, rightbot, righttop, lefttop, leftbot]]);
            }
            else {
                var rotleftbot = [
                    (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotlefttop = [
                    (lefttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (lefttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (lefttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (lefttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotrightbot = [
                    (rightbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (rightbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (rightbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (rightbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotrighttop = [
                    (righttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (righttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (righttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (righttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                coordinate = [
                    new Point2D(rotleftbot[0], rotleftbot[1]),
                    new Point2D(rotrightbot[0], rotrightbot[1]),
                    new Point2D(rotrighttop[0], rotrighttop[1]),
                    new Point2D(rotlefttop[0], rotlefttop[1])
                ];
                turfObj = helpers_1.polygon([[rotleftbot, rotrightbot, rotrighttop, rotlefttop, rotleftbot]]);
            }
        }
        else if (shape == 1) { // width: X, height: Y
            var rcc = [x + obWid / 2, y + obHei / 2];
            var top_1 = [x + obWid / 2, y + obHei];
            var left = [x, y];
            var right = [x + obWid, y];
            if (angle == 0) {
                coordinate = [
                    new Point2D(left[0], left[1]),
                    new Point2D(right[0], right[1]),
                    new Point2D(top_1[0], top_1[1])
                ];
                turfObj = helpers_1.polygon([[left, right, top_1, left]]);
            }
            else {
                var rottop = [
                    (top_1[0] - rcc[0]) * Math.cos(tempAngle * deg) - (top_1[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (top_1[0] - rcc[0]) * Math.sin(tempAngle * deg) + (top_1[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotleft = [
                    (left[0] - rcc[0]) * Math.cos(tempAngle * deg) - (left[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (left[0] - rcc[0]) * Math.sin(tempAngle * deg) + (left[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotright = [
                    (right[0] - rcc[0]) * Math.cos(tempAngle * deg) - (right[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (right[0] - rcc[0]) * Math.sin(tempAngle * deg) + (right[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                coordinate = [
                    new Point2D(rotleft[0], rotleft[1]),
                    new Point2D(rotright[0], rotright[1]),
                    new Point2D(rottop[0], rottop[1])
                ];
                turfObj = helpers_1.polygon([[rotleft, rotright, rottop, rotleft]]);
            }
        }
        else if (shape == 2) {
            var r = 0.5 * obWid;
            var rx = x + r;
            var ry = y + r;
            var x1y1 = new Point2D(rx, ry);
            coordinate = [x1y1, r];
            turfObj = circle_1["default"]([rx, ry], r);
        }
        else if (shape == 3) {
            var rcc = [x + obWid / 2, y + obHei / 2];
            var leftbot = [x, y];
            var lefttop = [x + obWid / 4, y + obHei];
            var rightbot = [x + obWid, y];
            var righttop = [x + (3 * obWid / 4), y + obHei];
            if (angle == 0) {
                coordinate = [
                    new Point2D(leftbot[0], leftbot[1]),
                    new Point2D(rightbot[0], rightbot[1]),
                    new Point2D(righttop[0], righttop[1]),
                    new Point2D(lefttop[0], lefttop[1])
                ];
                turfObj = helpers_1.polygon([[leftbot, rightbot, righttop, lefttop, leftbot]]);
            }
            else {
                var rotleftbot = [
                    (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotlefttop = [
                    (lefttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (lefttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (lefttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (lefttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotrightbot = [
                    (rightbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (rightbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (rightbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (rightbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                var rotrighttop = [
                    (righttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (righttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                    (righttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (righttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                ];
                coordinate = [
                    new Point2D(rotleftbot[0], rotleftbot[1]),
                    new Point2D(rotrightbot[0], rotrightbot[1]),
                    new Point2D(rotrighttop[0], rotrighttop[1]),
                    new Point2D(rotlefttop[0], rotlefttop[1])
                ];
                turfObj = helpers_1.polygon([[rotleftbot, rotrightbot, rotrighttop, rotlefttop, rotleftbot]]);
            }
        }
        return [coordinate, turfObj];
    };
    SitePlanningComponent.prototype.setMaterialName = function (id, material) {
        var index = this.materialIdToIndex[Number(material)];
        var materialName = '';
        if (this.authService.lang == 'zh-TW') {
            materialName = this.materialList[index]['chineseName'];
        }
        else {
            materialName = this.materialList[index]['name'];
        }
        if (this.materialList[index]['property'] == "default") {
            this.dragObject[id].materialName = materialName;
        }
        else {
            this.dragObject[id].materialName = this.translateService.instant('customize') + "_" + materialName;
        }
    };
    /** set drag object data */
    SitePlanningComponent.prototype.setDragData = function () {
        var rect = this.target.getBoundingClientRect();
        var type = this.dragObject[this.svgId].element;
        var wVal;
        var hVal;
        if (this.dragObject[this.svgId].type === 'obstacle' || this.dragObject[this.svgId].type === 'subField') {
            // 障礙物才需取長寬
            if (Number(type) === 0) {
                // 方形
                wVal = this.roundFormat(this.xLinear(this.rectStyle[this.svgId].width));
                hVal = this.roundFormat(this.yLinear(this.rectStyle[this.svgId].height));
            }
            else if (Number(type) === 2) {
                // 圓形正圓
                wVal = this.roundFormat(this.xLinear(rect.width));
                hVal = this.roundFormat(this.yLinear(rect.width));
            }
            else if (Number(type) === 1) {
                // 三角形
                wVal = this.roundFormat(this.xLinear(this.svgStyle[this.svgId].width));
                hVal = this.roundFormat(this.yLinear(this.svgStyle[this.svgId].height));
            }
            else if (Number(type) === 3) {
                //梯形
                wVal = this.roundFormat(this.xLinear(this.trapezoidStyle[this.svgId].width));
                hVal = this.roundFormat(this.yLinear(this.trapezoidStyle[this.svgId].height));
            }
            else if (Number(type) === 4) {
                //子場域
                wVal = this.roundFormat(this.xLinear(this.subFieldStyle[this.svgId].width));
                hVal = this.roundFormat(this.yLinear(this.subFieldStyle[this.svgId].height));
            }
        }
        var mOrigin = document.querySelector('.moveable-origin');
        // console.log(mOrigin)
        if (mOrigin != null) {
            // 有找到中心點
            var moveableOrigin = mOrigin.getBoundingClientRect();
            var x = moveableOrigin.left - this.chartLeft + (moveableOrigin.width / 2) - (this.svgStyle[this.svgId].width / 2) + this.scrollLeft;
            var y = this.chartBottom - moveableOrigin.top - (moveableOrigin.height / 2) - (this.svgStyle[this.svgId].height / 2) - this.scrollTop;
            this.dragObject[this.svgId].x = this.roundFormat(this.xLinear(x));
            this.dragObject[this.svgId].y = this.roundFormat(this.yLinear(y));
            if (this.dragObject[this.svgId].type === 'obstacle' || this.dragObject[this.svgId].type === 'subField') {
                this.dragObject[this.svgId].width = wVal;
                this.dragObject[this.svgId].height = hVal;
                // 檢查加上長寬後是否超出邊界
                var numX = Number(this.dragObject[this.svgId].x);
                var xEnd = numX + Number(this.dragObject[this.svgId].width);
                if (xEnd > this.calculateForm.width && Number(this.dragObject[this.svgId].rotate) == 0) {
                    this.dragObject[this.svgId].x = Number(this.calculateForm.width) - Number(this.dragObject[this.svgId].width);
                }
                else if (numX < 0 && Number(this.dragObject[this.svgId].rotate) == 0) {
                    this.dragObject[this.svgId].x = 0;
                }
                var numY = Number(this.dragObject[this.svgId].y);
                var yEnd = numY + Number(this.dragObject[this.svgId].height);
                if (yEnd > this.calculateForm.height && Number(this.dragObject[this.svgId].rotate) == 0) {
                    this.dragObject[this.svgId].y = Number(this.calculateForm.height) - Number(this.dragObject[this.svgId].height);
                }
                else if (numY < 0 && Number(this.dragObject[this.svgId].rotate) == 0) {
                    this.dragObject[this.svgId].y = 0;
                }
                if (this.dragObject[this.svgId].type === 'subField') {
                    // console.log('sdfgjsgjslkgjklsdgjlskdjglksdjglksjlkgjslkgjsdlg');
                    var sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
                    // console.log(sub_field_arr);
                    for (var i = 0; i < sub_field_arr.length; i++) {
                        // console.log(sub_field_arr[i].id);
                        // console.log(this.svgId);
                        if (sub_field_arr[i].id == this.svgId) {
                            sub_field_arr.splice(i, 1, {
                                id: this.svgId,
                                x: this.dragObject[this.svgId].x,
                                y: this.dragObject[this.svgId].y,
                                width: this.dragObject[this.svgId].width,
                                height: this.dragObject[this.svgId].height
                            });
                            sessionStorage.setItem("sub_field_coor", JSON.stringify(sub_field_arr));
                        }
                    }
                }
            }
        }
    };
    /**
     * moveable移動開始
     * @param e
     */
    SitePlanningComponent.prototype.dragStart = function (e) {
        if (this.svgId !== this.realId) {
            this.svgId = _.cloneDeep(this.realId);
        }
        // 紀錄移動前位置
        this.moveError = false;
        this.ognDragObject[this.svgId] = _.cloneDeep(this.dragObject[this.svgId]);
    };
    /**
     * moveable 移動中
     * @param param0
     */
    SitePlanningComponent.prototype.onDrag = function (_a) {
        var target = _a.target, clientX = _a.clientX, clientY = _a.clientY, top = _a.top, left = _a.left, isPinch = _a.isPinch;
        if (this.svgId !== this.realId) {
            this.svgId = _.cloneDeep(this.realId);
            target = document.querySelector("#" + this.svgId);
        }
        try {
            this.target = target;
            this.frame.set('left', left + "px");
            this.frame.set('top', top + "px");
            this.frame.set('z-index', 100 + 10 * this.dragObject[this.svgId].z);
            this.setTransform(target);
            this.spanStyle[this.svgId].left = left + "px";
            this.spanStyle[this.svgId].top = top + "px";
            this.setDragData();
            if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
                this.circleStyle[this.svgId] = {
                    top: top - 20 + "px",
                    left: left + 20 + "px"
                };
            }
            this.setLabel();
        }
        catch (error) {
            console.log(error);
            // 發生error，onEnd還原位置
            this.moveError = true;
        }
    };
    /**
     * moveable 旋轉角度
     * @param param0
     */
    SitePlanningComponent.prototype.onRotate = function (_a) {
        var target = _a.target, clientX = _a.clientX, clientY = _a.clientY, beforeDelta = _a.beforeDelta, isPinch = _a.isPinch;
        if (this.svgId !== this.realId) {
            this.svgId = _.cloneDeep(this.realId);
            target = document.querySelector("#" + this.svgId);
        }
        // 超出邊界即中斷
        var rect = target.getBoundingClientRect();
        // console.log(rect, this.bounds)
        if (rect.right >= this.bounds.right
            || rect.top <= this.bounds.top
            || rect.bottom >= this.bounds.bottom
            || rect.left <= this.bounds.left) {
            return;
        }
        var deg = parseFloat(this.frame.get('transform', 'rotate')) + beforeDelta;
        this.frame.set('transform', 'rotate', deg + "deg");
        this.frame.set('left', this.currentLeft);
        this.frame.set('top', this.currentTop);
        this.setTransform(target);
        this.dragObject[this.svgId].rotate = Math.ceil(deg);
        this.spanStyle[this.svgId].transform = "rotate(" + this.dragObject[this.svgId].rotate + "deg)";
        this.setLabel();
    };
    /**
     * moveable resize
     * @param param0
     */
    SitePlanningComponent.prototype.onResize = function (_a) {
        var target = _a.target, clientX = _a.clientX, clientY = _a.clientY, width = _a.width, height = _a.height, drag = _a.drag;
        if (this.svgId !== this.realId) {
            // 物件太接近，id有時會錯亂，還原id
            this.svgId = _.cloneDeep(this.realId);
            target = document.querySelector("#" + this.svgId);
        }
        if (width < 5) {
            width = 5;
        }
        if (height < 5) {
            height = 5;
        }
        var shape = this.dragObject[this.svgId].element;
        if (Number(shape) === 3) {
            // if (width > height) {
            //   height = width;
            // } else {
            //   width = height;
            // }
            this.frame.set('height', height + "px");
        }
        this.frame.set('width', width + "px");
        if (Number(shape) === 2) {
            // 圓形正圓
            this.frame.set('height', width + "px");
            width = height;
        }
        else {
            this.frame.set('height', height + "px");
        }
        this.spanStyle[this.svgId].transform = "rotate(" + this.dragObject[this.svgId].rotate + "deg)";
        this.frame.set('z-index', 100 + 10 * this.dragObject[this.svgId].z);
        this.frame.set('transform', 'rotate', this.dragObject[this.svgId].rotate + "deg");
        this.setTransform(target);
        var beforeTranslate = drag.beforeTranslate;
        target.style.transform = "translate(" + beforeTranslate[0] + "px, " + beforeTranslate[1] + "px) rotate(" + this.dragObject[this.svgId].rotate + "deg)";
        this.svgStyle[this.svgId].width = width;
        this.svgStyle[this.svgId].height = height;
        this.spanStyle[this.svgId].width = width + "px";
        this.spanStyle[this.svgId].height = height + "px";
        if (Number(shape) === 0) {
            // 方形
            this.rectStyle[this.svgId].width = width;
            this.rectStyle[this.svgId].height = height;
        }
        else if (Number(shape) === 2) {
            // 圓形正圓
            var x = (width / 2).toString();
            this.ellipseStyle[this.svgId].rx = x;
            this.ellipseStyle[this.svgId].ry = x;
            this.ellipseStyle[this.svgId].cx = x;
            this.ellipseStyle[this.svgId].cy = x;
        }
        else if (Number(shape) === 1) {
            // 三角形
            var points = width / 2 + ",0 " + width + ", " + height + " 0, " + height;
            this.polygonStyle[this.svgId].points = points;
            // dragRect.setAttribute('points', points);
        }
        else if (Number(shape) === 3) {
            this.trapezoidStyle[this.svgId].width = width;
            this.trapezoidStyle[this.svgId].height = height;
        }
        else if (Number(shape) === 4) {
            console.log('subFieldddddd');
            this.subFieldStyle[this.svgId].width = width;
            this.subFieldStyle[this.svgId].height = height;
        }
        this.setDragData();
        this.setLabel();
    };
    /**
     * moveable 互動結束
     * @param param0
     */
    SitePlanningComponent.prototype.onEnd = function () {
        var _this = this;
        this.live = false;
        for (var _i = 0, _a = this.obstacleList; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item !== this.svgId) {
                // 其他障礙物有時會跟著動，keep住
                this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
            }
        }
        if (this.moveError) {
            // 移動過程error，回到移動前位置
            this.dragObject[this.svgId] = _.cloneDeep(this.ognDragObject[this.svgId]);
            this.spanStyle[this.svgId] = _.cloneDeep(this.ognSpanStyle[this.svgId]);
        }
        else {
            this.ognSpanStyle[this.svgId] = _.cloneDeep(this.spanStyle[this.svgId]);
            this.ognDragObject[this.svgId] = _.cloneDeep(this.dragObject[this.svgId]);
        }
        // 讓xy正確
        window.setTimeout(function () {
            _this.moveClick(_this.target.id);
            window.setTimeout(function () {
                _this.moveable.destroy();
            }, 0);
        }, 0);
    };
    /** resize end */
    SitePlanningComponent.prototype.resizeEnd = function () {
        // resize後bound會跑掉，重設frame
        var left = this.pixelXLinear(this.dragObject[this.svgId].x) + "px";
        var top = this.chartHeight - this.pixelYLinear(this.dragObject[this.svgId].height) - this.pixelYLinear(this.dragObject[this.svgId].y) + "px";
        this.frame.set('left', left);
        this.frame.set('top', top);
        this.setTransform(this.target);
    };
    /**
     * destory moveable
     */
    SitePlanningComponent.prototype.moveableDestroy = function () {
        this.moveable.destroy();
    };
    /**
     * 右邊選單開合切換時變更上下箭頭
     * @param event
     * @param type
     */
    SitePlanningComponent.prototype.arrowUpDown = function (event, type) {
        var target = event.target;
        if (target.innerHTML === 'keyboard_arrow_down') {
            target.innerHTML = 'keyboard_arrow_up';
            this.subitemClass[type] = 'subitem active';
        }
        else {
            target.innerHTML = 'keyboard_arrow_down';
            this.subitemClass[type] = 'subitem';
        }
    };
    /**
     * 右鍵選單
     * @param event
     * @param svgId
     */
    SitePlanningComponent.prototype.onRightClick = function (event, svgId, i) {
        this.svgId = svgId;
        this.svgNum = i + 1;
        // console.log('this.svgNum',this.svgNum);
        // preventDefault avoids to show the visualization of the right-click menu of the browser
        event.preventDefault();
        // we record the mouse position in our object
        this.menuTopLeftStyle.left = event.clientX + 'px';
        this.menuTopLeftStyle.top = event.clientY + 'px';
        // we open the menu
        this.matMenuTrigger.openMenu();
    };
    /**
     * 刪除互動物件
     */
    SitePlanningComponent.prototype["delete"] = function (all) {
        var _this = this;
        if (!all) {
            if (this.dragObject[this.svgId].type === 'obstacle') {
                this.obstacleList.splice(this.obstacleList.indexOf(this.svgId), 1);
            }
            else if (this.dragObject[this.svgId].type === 'defaultBS') {
                this.defaultBSList.splice(this.defaultBSList.indexOf(this.svgId), 1);
            }
            else if (this.dragObject[this.svgId].type === 'candidate') {
                this.candidateList.splice(this.candidateList.indexOf(this.svgId), 1);
            }
            else if (this.dragObject[this.svgId].type === 'UE') {
                this.ueList.splice(this.ueList.indexOf(this.svgId), 1);
            }
            else if (this.dragObject[this.svgId].type === 'subField') {
                this.subFieldList.splice(this.subFieldList.indexOf(this.svgId), 1);
                var sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
                for (var i = 0; i < sub_field_arr.length; i++) {
                    if (sub_field_arr[i].id == this.svgId) {
                        sub_field_arr.splice(i, 1);
                        sessionStorage.setItem("sub_field_coor", JSON.stringify(sub_field_arr));
                    }
                }
            }
            this.matDialog.closeAll();
        }
        else {
            console.log(this.defaultBSList);
            this.initData(false, false, 'delete');
            this.deleteList.forEach(function (el) {
                var type = el[0].split('_')[0];
                if (type == 'candidate') {
                    _this.candidateList.splice(el[1], 1);
                }
                else if (type == 'defaultBS') {
                    _this.defaultBSList.splice(el[1], 1);
                }
                else if (type == 'UE') {
                    _this.ueList.splice(el[1], 1);
                }
                else {
                    _this.obstacleList.splice(el[1], 1);
                }
            });
            this.edit(false);
            this.deleteList.length = 0;
            // console.log(this.deleteList);
            this.matDialog.closeAll();
        }
    };
    SitePlanningComponent.prototype.notDelete = function () {
        window.sessionStorage.removeItem('tempParamForSelect');
        this.matDialog.closeAll();
    };
    /** change color */
    SitePlanningComponent.prototype.colorChange = function () {
        this.dragObject[this.svgId].color = this.color;
        if (this.dragObject[this.svgId].type === 'obstacle') {
            if (Number(this.dragObject[this.svgId].element) === 0) {
                this.rectStyle[this.svgId].fill = this.color;
            }
            else if (Number(this.dragObject[this.svgId].element) === 2) {
                this.ellipseStyle[this.svgId].fill = this.color;
            }
            else if (Number(this.dragObject[this.svgId].element) === 1) {
                this.polygonStyle[this.svgId].fill = this.color;
            }
            else if (Number(this.dragObject[this.svgId].element) === 3) {
                this.trapezoidStyle[this.svgId].fill = this.color;
            }
        }
        else {
            this.pathStyle[this.svgId].fill = this.color;
        }
    };
    /**
     * 開啟RF設定燈箱
    */
    SitePlanningComponent.prototype.openRfParamSetting = function (item, i, isNav) {
        this.svgId = item;
        if (isNav) {
            this.svgNum = i + 1;
        }
        else {
            this.svgNum = i;
        }
        // console.log(this.svgId);
        // console.log(item);
        // console.log(this.svgNum);
        // this.matDialog.open(this.rfModal);
        this.manufactor = 'All';
        this.matDialog.open(this.rfModalTable);
    };
    /**
     * 開啟多目標函數設定燈箱
    */
    SitePlanningComponent.prototype.openFieldCoverageSetting = function () {
        this.matDialog.open(this.FieldCoverageModalTable, { disableClose: true });
    };
    SitePlanningComponent.prototype.openSINRSetting = function () {
        if (this.evaluationFuncForm.field.sinr.ratio.length == 0)
            this.addSINR();
        this.matDialog.open(this.SINRModalTable, { disableClose: true });
    };
    SitePlanningComponent.prototype.openRSRPSetting = function () {
        if (this.evaluationFuncForm.field.rsrp.ratio.length == 0)
            this.addRSRP();
        this.matDialog.open(this.RSRPModalTable, { disableClose: true });
    };
    SitePlanningComponent.prototype.openThroughputSetting = function () {
        if (this.evaluationFuncForm.field.throughput.ratio.length == 0)
            this.addThroughput();
        this.matDialog.open(this.ThroughputModalTable, { disableClose: true });
    };
    SitePlanningComponent.prototype.openUEThroughputSetting = function () {
        if (this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
            this.addUEThroughput();
        this.matDialog.open(this.UEThroughputModalTable, { disableClose: true });
    };
    SitePlanningComponent.prototype.openUECoverageSetting = function () {
        this.matDialog.open(this.UECoverageModalTable, { disableClose: true });
    };
    SitePlanningComponent.prototype.openAntennaSetting = function () {
        this.getAntenna();
        this.matDialog.open(this.AntennaModalTable);
    };
    SitePlanningComponent.prototype.openAddAntennaSetting = function () {
        this.secondLayerDialogRef = this.matDialog.open(this.AddAntennaModalTable);
    };
    SitePlanningComponent.prototype.openEditAntennaSetting = function (index) {
        this.editAntenna = this.filterAntennaList[index];
        this.secondLayerDialogRef = this.matDialog.open(this.EditAntennaModalTable);
    };
    SitePlanningComponent.prototype.openUEParamSetting = function (item, i, isNav) {
        this.svgId = item;
        if (isNav) { // 右方障礙物資訊id與左方平面圖障礙物id序號差1
            this.svgNum = i + 1;
        }
        else {
            this.svgNum = i;
        }
        this.matDialog.open(this.ueModalTable);
    };
    SitePlanningComponent.prototype.openDeleteSetting = function () {
        this.matDialog.open(this.deleteModal);
    };
    /**
     * 開啟高度設定燈箱
     */
    SitePlanningComponent.prototype.openHeightSetting = function () {
        // this.matDialog.open(this.materialModal);
        this.matDialog.open(this.materialModal2);
    };
    /** 變更材質 */
    SitePlanningComponent.prototype.materialChange = function (val) {
        this.dragObject[this.svgId].material = val;
    };
    /**
     * mouseover info
     * @param event
     * @param svgId
     * @param i
     */
    SitePlanningComponent.prototype.hover = function (event, svgId, i) {
        this.live = true;
        this.svgId = svgId;
        this.svgNum = i + 1;
        this.hoverObj = event.target.closest('span');
        // console.log('this.svgNum',this.svgNum);
        this.setLabel();
    };
    /**
     * mouseout物件
     * @param event
     */
    SitePlanningComponent.prototype.hoverout = function (event) {
        this.live = false;
    };
    /**
     * image upload
     * @param event
     */
    SitePlanningComponent.prototype.fileChange = function (event) {
        // Xean: 07/12 註解清除所有物件
        // this.obstacleList.length = 0;
        // this.defaultBSList.length = 0;
        // this.candidateList.length = 0;
        // this.ueList.length = 0;
        // this.dragObject = {};
        // this.calculateForm.obstacleInfo = '';
        // this.calculateForm.defaultBs = '';
        // this.calculateForm.candidateBs = '';
        // this.calculateForm.ueCoordinate = '';
        var _this = this;
        // 載入圖檔
        var file = event.target.files[0];
        this.calculateForm.mapName = file.name;
        this.showFileName = false;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            _this.calculateForm.mapImage = reader.result.toString();
            // 背景圖
            _this.plotLayout['images'] = [{
                    source: reader.result,
                    x: 0,
                    y: 0,
                    sizex: _this.calculateForm.width,
                    sizey: _this.calculateForm.height,
                    xref: 'x',
                    yref: 'y',
                    xanchor: 'left',
                    yanchor: 'bottom',
                    sizing: 'stretch',
                    layer: 'below'
                }];
            Plotly.relayout('chart', _this.plotLayout);
            // this.initData(false, true, false, false);
        };
    };
    /**
     * 數量物件移動position
     * @param svgId
     */
    SitePlanningComponent.prototype.moveNumber = function (svgId) {
        var circleElement = document.querySelector("#" + svgId + "_circle");
        if (circleElement != null) {
            var top_2 = Number(this.spanStyle[svgId].top.replace('px', '')) - 20 + "px";
            var width = Number(this.spanStyle[svgId].width.replace('px', ''));
            var left = Number(this.spanStyle[svgId].left.replace('px', ''));
            this.circleStyle[svgId] = {
                top: top_2,
                left: left + width - 10 + "px"
            };
            // console.log(this.spanStyle[svgId], this.circleStyle[svgId])
        }
    };
    /**
     * Clear
     */
    // clearAllDrag() {
    //   this.dragObject = {};
    // }
    SitePlanningComponent.prototype.isEmpty = function (str) {
        if (str === undefined || str === null || str.length === 0) {
            return true;
        }
        else {
            return false;
        }
        // if (Number(str) == 0) {
        //   return false;
        // } else {
        //   return (!str || str.length === 0 );
        // }
    };
    /**
     * 檢查參數是否完整
     */
    SitePlanningComponent.prototype.checkRFParamIsEmpty = function (protocol, duplex) {
        var error = false;
        var msg = '<br>';
        if (this.calculateForm.pathLossModelId == 999 || !(this.calculateForm.pathLossModelId in this.modelIdToIndex)) {
            error = true;
            msg += this.translateService.instant('plz_fill_pathLossModel') + "<br/>";
            msg += '</p>';
        }
        if (protocol == '1') { //5G
            if (duplex == 'tdd') {
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    var obj = this.bsListRfParam[this.defaultBSList[i]];
                    var bsMsg = '';
                    if (this.planningIndex == '3') {
                        if (this.isEmpty(obj.txpower)) {
                            bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('txpower') + "<br/>";
                        }
                        if (this.isEmpty(obj.beampattern)) {
                            obj.beampattern = 0;
                        }
                        // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
                        if (this.isEmpty(obj.beampattern)) {
                            this.bsListRfParam[this.defaultBSList[i]].beampattern = 0;
                        }
                    }
                    if (this.isEmpty(obj.AntennaId)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('Antenna') + "<br/>";
                    }
                    if (this.isEmpty(obj.theta)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('theta') + "<br/>";
                    }
                    if (this.isEmpty(obj.phi)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('phi') + "<br/>";
                    }
                    if (this.isEmpty(obj.bsTxGain)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('TxGain') + "<br/>";
                    }
                    if (this.isEmpty(obj.bsNoiseFigure)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('noise') + "<br/>";
                    }
                    if (this.isEmpty(obj.tddbandwidth)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('tddbandwidth') + "<br/>";
                    }
                    if (this.isEmpty(obj.tddscs)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('tddscs') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulModulationCodScheme)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulModulationCodScheme') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlModulationCodScheme)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlModulationCodScheme') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulMimoLayer)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulMimoLayer') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlMimoLayer)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlMimoLayer') + "<br/>";
                    }
                    if (this.isEmpty(obj.tddfrequency)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('tddfrequency') + "<br/>";
                    }
                    else if (obj.tddfrequency < 0) {
                        bsMsg += this.translateService.instant('tddfrequency_less_than_0') + "<br/>";
                    }
                    if (bsMsg !== '') {
                        msg += "" + this.translateService.instant('bs_problem1') + (i + 1) + ":" + this.translateService.instant('bs_problem2') + "<br><p style=\"color: red;\">";
                        msg += bsMsg;
                        msg += '</p>';
                        error = true;
                    }
                }
            }
            else {
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    var obj = this.bsListRfParam[this.defaultBSList[i]];
                    var bsMsg = '';
                    if (this.planningIndex == '3') {
                        if (this.isEmpty(obj.txpower)) {
                            bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('txpower') + "<br/>";
                        }
                        if (this.isEmpty(obj.beampattern)) {
                            obj.beampattern = 0;
                        }
                        // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
                    }
                    if (this.isEmpty(obj.AntennaId)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('Antenna') + "<br/>";
                    }
                    if (this.isEmpty(obj.theta)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('theta') + "<br/>";
                    }
                    if (this.isEmpty(obj.phi)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('phi') + "<br/>";
                    }
                    if (this.isEmpty(obj.bsTxGain)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('TxGain') + "<br/>";
                    }
                    if (this.isEmpty(obj.bsNoiseFigure)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('noise') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlBandwidth)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ddlBandwidth') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulBandwidth)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('uulBandwidth') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlScs)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlscs') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulScs)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulscs') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlModulationCodScheme)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlModulationCodScheme') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulModulationCodScheme)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulModulationCodScheme') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlMimoLayer)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlMimoLayer') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulMimoLayer)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulMimoLayer') + "<br/>";
                    }
                    if (this.isEmpty(obj.fddDlFrequency)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlfrequency') + "<br/>";
                    }
                    else if (obj.fddDlFrequency < 0) {
                        bsMsg += this.translateService.instant('dlfrequency_less_than_0') + "<br/>";
                    }
                    if (this.isEmpty(obj.fddUlFrequency)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulfrequency') + "<br/>";
                    }
                    else if (obj.fddUlFrequency < 0) {
                        bsMsg += this.translateService.instant('ulfrequency_less_than_0') + "<br/>";
                    }
                    if (obj.fddDlFrequency == obj.fddUlFrequency
                        && !this.isEmpty(obj.fddDlFrequency)
                        && !this.isEmpty(obj.fddUlFrequency)) {
                        bsMsg += this.translateService.instant('dlfrequency_same_ulfrequency') + "<br/>";
                    }
                    if (bsMsg !== '') {
                        msg += "" + this.translateService.instant('bs_problem1') + (i + 1) + ":" + this.translateService.instant('bs_problem2') + "<br><p style=\"color: red;\">";
                        msg += bsMsg;
                        msg += '</p>';
                        error = true;
                    }
                }
            }
        }
        else if (protocol == '0') {
            if (duplex == 'tdd') {
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    var obj = this.bsListRfParam[this.defaultBSList[i]];
                    var bsMsg = '';
                    // console.log(obj.tddbandwidth);
                    // console.log(obj.tddfrequency);
                    if (this.planningIndex == '3') {
                        if (this.isEmpty(obj.txpower)) {
                            bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('txpower') + "<br/>";
                        }
                        if (this.isEmpty(obj.beampattern)) {
                            obj.beampattern = 0;
                        }
                        // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
                    }
                    if (this.isEmpty(obj.mimoNumber4G)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('mimonum') + "<br/>";
                    }
                    if (this.isEmpty(obj.tddbandwidth)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('tddbandwidth') + "<br/>";
                    }
                    else if (obj.tddbandwidth < 0) {
                        bsMsg += this.translateService.instant('tddbandwidth_less_than_0') + "<br/>";
                    }
                    if (this.isEmpty(obj.tddfrequency)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('tddfrequency') + "<br/>";
                    }
                    else if (obj.tddfrequency < 0) {
                        bsMsg += this.translateService.instant('tddfrequency_less_than_0') + "<br/>";
                    }
                    if (bsMsg !== '') {
                        msg += "" + this.translateService.instant('bs_problem1') + (i + 1) + ":" + this.translateService.instant('bs_problem2') + "<br><p style=\"color: red;\">";
                        msg += bsMsg;
                        msg += '</p>';
                        error = true;
                    }
                }
            }
            else {
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    var obj = this.bsListRfParam[this.defaultBSList[i]];
                    var bsMsg = '';
                    if (this.planningIndex == '3') {
                        if (this.isEmpty(obj.txpower)) {
                            bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('txpower') + "<br/>";
                        }
                        if (this.isEmpty(obj.beampattern)) {
                            obj.beampattern = 0;
                        }
                        // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
                    }
                    if (this.isEmpty(obj.mimoNumber4G)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('mimonum') + "<br/>";
                    }
                    if (this.isEmpty(obj.dlBandwidth)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ddlBandwidth') + "<br/>";
                    }
                    else if (obj.dlBandwidth < 0) {
                        bsMsg += this.translateService.instant('dlbandwidth_less_than_0') + "<br/>";
                    }
                    if (this.isEmpty(obj.ulBandwidth)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('uulBandwidth') + "<br/>";
                    }
                    else if (obj.ulBandwidth < 0) {
                        bsMsg += this.translateService.instant('ulbandwidth_less_than_0') + "<br/>";
                    }
                    if (this.isEmpty(obj.fddDlFrequency)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('dlfrequency') + "<br/>";
                    }
                    else if (obj.fddDlFrequency < 0) {
                        bsMsg += this.translateService.instant('dlfrequency_less_than_0') + "<br/>";
                    }
                    if (this.isEmpty(obj.fddUlFrequency)) {
                        bsMsg += this.translateService.instant('plz_fill') + " " + this.translateService.instant('ulfrequency') + "<br/>";
                    }
                    else if (obj.fddUlFrequency < 0) {
                        bsMsg += this.translateService.instant('ulfrequency_less_than_0') + "<br/>";
                    }
                    if (obj.fddDlFrequency == obj.fddUlFrequency
                        && !this.isEmpty(obj.fddUlFrequency)
                        && !this.isEmpty(obj.fddDlFrequency)) {
                        bsMsg += this.translateService.instant('dlfrequency_same_ulfrequency') + "<br/>";
                    }
                    if (bsMsg !== '') {
                        msg += "" + this.translateService.instant('bs_problem1') + (i + 1) + ":" + this.translateService.instant('bs_problem2') + "<br><p style=\"color: red;\">";
                        msg += bsMsg;
                        msg += '</p>';
                        error = true;
                    }
                }
            }
        }
        else {
        }
        if (error) {
            console.log(msg);
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
        return error;
    };
    SitePlanningComponent.prototype.checkDlUlDiff = function () {
        if (this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
            return true;
        }
        else {
            return false;
        }
    };
    SitePlanningComponent.prototype.checkSubFieldOverlaped = function () {
        if (sessionStorage.getItem('sub_field_coor') == null) {
            return false;
        }
        var sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
        for (var i = 0; i < sub_field_arr.length; i++) {
            var subfield = sub_field_arr[i];
            var x2 = Number(subfield.x) + Number(subfield.width);
            var x1 = Number(subfield.x);
            var y1 = Number(subfield.y);
            var y2 = Number(subfield.y) + Number(subfield.height);
            console.log(x1 + " " + x2 + " " + y1 + " " + y2);
            for (var j = i + 1; j < sub_field_arr.length; j++) {
                var subfield2 = sub_field_arr[j];
                var flag1 = void 0, flag2 = void 0;
                var xx2 = Number(subfield2.x) + Number(subfield2.width);
                var xx1 = Number(subfield2.x);
                var yy1 = Number(subfield2.y);
                var yy2 = Number(subfield2.y) + Number(subfield2.height);
                console.log(xx1 + " " + xx2 + " " + yy1 + " " + yy2);
                if (x1 > xx2 || x2 < xx1) {
                    flag1 = false;
                }
                else {
                    flag1 = true;
                }
                if (y1 > yy2 || y2 < yy1) {
                    flag2 = false;
                }
                else {
                    flag2 = true;
                }
                if (flag1 && flag2) {
                    var warnmsg = this.translateService.instant('subfield.overlap');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: warnmsg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                    return true; // overlaped
                }
            }
        }
        return false;
    };
    // 檢查是否有基地台的參數重疊
    SitePlanningComponent.prototype.checkRFParamIsOverlaped = function () {
        var warnmsg = "";
        if (this.duplexMode == 'tdd' || this.calculateForm.objectiveIndex == '2') {
            //模擬和規劃都會用到
            var freq = void 0, band = void 0, mainMax = void 0, mainMin = void 0, max = void 0, min = void 0;
            for (var i = 0; i < this.defaultBSList.length; i++) {
                if (this.calculateForm.objectiveIndex == '2') {
                    freq = this.bsListRfParam[this.defaultBSList[i]].wifiFrequency;
                    band = this.bsListRfParam[this.defaultBSList[i]].wifiBandwidth;
                }
                else {
                    freq = this.bsListRfParam[this.defaultBSList[i]].tddfrequency;
                    band = this.bsListRfParam[this.defaultBSList[i]].tddbandwidth;
                }
                mainMax = freq + band / 2;
                mainMin = freq - band / 2;
                for (var j = i; j < this.defaultBSList.length; j++) {
                    if (this.defaultBSList[i] == this.defaultBSList[j]) {
                        continue;
                    }
                    if (this.calculateForm.objectiveIndex == '2') {
                        max = this.bsListRfParam[this.defaultBSList[j]].wifiFrequency + this.bsListRfParam[this.defaultBSList[j]].wifiBandwidth / 2;
                        min = this.bsListRfParam[this.defaultBSList[j]].wifiFrequency - this.bsListRfParam[this.defaultBSList[j]].wifiBandwidth / 2;
                    }
                    else {
                        max = this.bsListRfParam[this.defaultBSList[j]].tddfrequency + this.bsListRfParam[this.defaultBSList[j]].tddbandwidth / 2;
                        min = this.bsListRfParam[this.defaultBSList[j]].tddfrequency - this.bsListRfParam[this.defaultBSList[j]].tddbandwidth / 2;
                    }
                    if (mainMax == max && mainMin == min) {
                        continue;
                    }
                    if (mainMax > max && mainMin < min) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + " " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + " " + this.translateService.instant('tddfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((mainMax > min && mainMax < max) || (mainMin > min && mainMin < max)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + " " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + " " + this.translateService.instant('tddfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                }
            }
            //規劃才需要比較Candidate
            if (!this.calculateForm.isSimulation) {
                var freq_1, band_1;
                if (this.calculateForm.objectiveIndex == '2') {
                    freq_1 = this.tempCalParamSet.wifiFrequency;
                    band_1 = Number(this.tempCalParamSet.wifiBandwidth);
                }
                else {
                    freq_1 = this.tempCalParamSet.tddfrequency;
                    band_1 = Number(this.tempCalParamSet.tddbandwidth);
                }
                var mainMax_1 = freq_1 + band_1 / 2;
                var mainMin_1 = freq_1 - band_1 / 2;
                var max_1, min_1;
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    if (this.calculateForm.objectiveIndex == '2') {
                        max_1 = this.bsListRfParam[this.defaultBSList[i]].wifiFrequency + this.bsListRfParam[this.defaultBSList[i]].wifiBandwidth / 2;
                        min_1 = this.bsListRfParam[this.defaultBSList[i]].wifiFrequency - this.bsListRfParam[this.defaultBSList[i]].wifiBandwidth / 2;
                    }
                    else {
                        max_1 = this.bsListRfParam[this.defaultBSList[i]].tddfrequency + this.bsListRfParam[this.defaultBSList[i]].tddbandwidth / 2;
                        min_1 = this.bsListRfParam[this.defaultBSList[i]].tddfrequency - this.bsListRfParam[this.defaultBSList[i]].tddbandwidth / 2;
                    }
                    if (mainMax_1 == max_1 && mainMin_1 == min_1) {
                        continue;
                    }
                    if (mainMax_1 > max_1 && mainMin_1 < min_1) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + " " + this.translateService.instant('and') + " \n            " + this.translateService.instant('candidate') + " " + this.translateService.instant('tddfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((mainMax_1 > min_1 && mainMax_1 < max_1) || (mainMin_1 > min_1 && mainMin_1 < max_1)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + " " + this.translateService.instant('and') + " \n            " + this.translateService.instant('candidate') + " " + this.translateService.instant('tddfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                }
            }
        }
        else { // ------------------------------- FDD ----------------------------------------
            //模擬和規劃都會用到
            var dlfreq = void 0, ulfreq = void 0, dlband = void 0, ulband = void 0;
            var dlmainMax = void 0, dlmainMin = void 0, ulmainMax = void 0, ulmainMin = void 0;
            var dlmax = void 0, dlmin = void 0, ulmax = void 0, ulmin = void 0;
            for (var i = 0; i < this.defaultBSList.length; i++) {
                dlfreq = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency;
                ulfreq = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency;
                dlband = Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth);
                ulband = Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth);
                dlmainMax = dlfreq + dlband / 2;
                dlmainMin = dlfreq - dlband / 2;
                ulmainMax = ulfreq + ulband / 2;
                ulmainMin = ulfreq - ulband / 2;
                console.log(dlmainMax + " " + dlmainMin + " " + ulmainMax + " " + ulmainMin);
                // 自己的上下行不能包含於
                if (dlmainMax == ulmainMax && dlmainMin == ulmainMin) {
                    warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                else if (dlmainMax >= ulmainMax && dlmainMin <= ulmainMin) {
                    warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                else if (ulmainMax >= dlmainMax && ulmainMin <= dlmainMin) {
                    warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                // 自己的上下行不能重疊到
                else if ((dlmainMax > ulmainMin && dlmainMax < ulmainMax) || (dlmainMin > ulmainMin && dlmainMin < ulmainMax)) {
                    warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                // 跟其他既有基站比
                for (var j = i; j < this.defaultBSList.length; j++) {
                    if (this.defaultBSList[i] == this.defaultBSList[j]) {
                        continue;
                    }
                    dlmax = this.bsListRfParam[this.defaultBSList[j]].fddDlFrequency + Number(this.bsListRfParam[this.defaultBSList[j]].dlBandwidth) / 2;
                    ulmax = this.bsListRfParam[this.defaultBSList[j]].fddUlFrequency + Number(this.bsListRfParam[this.defaultBSList[j]].ulBandwidth) / 2;
                    dlmin = this.bsListRfParam[this.defaultBSList[j]].fddDlFrequency - Number(this.bsListRfParam[this.defaultBSList[j]].dlBandwidth) / 2;
                    ulmin = this.bsListRfParam[this.defaultBSList[j]].fddUlFrequency - Number(this.bsListRfParam[this.defaultBSList[j]].ulBandwidth) / 2;
                    // default 下行與 default完全重合，上行亦然
                    if ((dlmainMax == dlmax && dlmainMin == dlmin) && (ulmainMax == ulmax && ulmainMin == ulmin)) {
                        continue;
                    }
                    if (dlmainMax == ulmax && dlmainMin == ulmin) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    else if (ulmainMax == dlmax && ulmainMin == dlmin) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    // default 頻率範圍完全蓋過 defualt
                    if ((dlmainMax >= dlmax && dlmainMin < dlmin) || (dlmainMax > dlmax && dlmainMin <= dlmin)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((dlmainMax >= ulmax && dlmainMin < ulmin) || (dlmainMax > ulmax && dlmainMin <= ulmin)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax >= dlmax && ulmainMin < dlmin) || (ulmainMax > dlmax && ulmainMin <= dlmin)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax >= ulmax && ulmainMin < ulmin) || (ulmainMax > ulmax && ulmainMin <= ulmin)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((dlmainMax > dlmin && dlmainMax < dlmax) || (dlmainMin > dlmin && dlmainMin < dlmax)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((dlmainMax > ulmin && dlmainMax < ulmax) || (dlmainMin > ulmin && dlmainMin < ulmax)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax > ulmin && ulmainMax < ulmax) || (ulmainMin > ulmin && ulmainMin < ulmax)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax > dlmin && ulmainMax < dlmax) || (ulmainMin > dlmin && ulmainMin < dlmax)) {
                        warnmsg += "" + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (j + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                }
            }
            console.log(this.calculateForm.isSimulation);
            //規劃才需要比較Candidate
            if (!this.calculateForm.isSimulation) {
                dlfreq = this.tempCalParamSet.fddDlFrequency;
                ulfreq = this.tempCalParamSet.fddUlFrequency;
                dlband = Number(this.tempCalParamSet.dlBandwidth);
                ulband = Number(this.tempCalParamSet.ulBandwidth);
                dlmainMax = dlfreq + dlband / 2;
                dlmainMin = dlfreq - dlband / 2;
                ulmainMax = ulfreq + ulband / 2;
                ulmainMin = ulfreq - ulband / 2;
                console.log(dlmainMax + " " + dlmainMin + " " + ulmainMax + " " + ulmainMin);
                // 自己的上下行不能包含於
                if (dlmainMax == ulmainMax && dlmainMin == ulmainMin) {
                    warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                else if (dlmainMax >= ulmainMax && dlmainMin <= ulmainMin) {
                    warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                else if (ulmainMax >= dlmainMax && ulmainMin <= dlmainMin) {
                    warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                else if ((dlmainMax > ulmainMin && dlmainMax < ulmainMax) || (dlmainMin > ulmainMin && dlmainMin < ulmainMax)) {
                    warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + "\n          " + this.translateService.instant('dlfrequency') + " " + this.translateService.instant('and') + " " + this.translateService.instant('ulfrequency') + "\n          " + this.translateService.instant('overlap') + " <br/>";
                }
                for (var i = 0; i < this.defaultBSList.length; i++) {
                    dlmax = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth) / 2;
                    ulmax = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth) / 2;
                    dlmin = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth) / 2;
                    ulmin = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth) / 2;
                    // console.log(`${dlmax} ${dlmin} ${ulmax} ${ulmin}`)
                    // Candidate 下行與 default完全重合，上行亦然
                    if ((dlmainMax == dlmax && dlmainMin == dlmin) && (ulmainMax == ulmax && ulmainMin == ulmin)) {
                        continue;
                    }
                    if (dlmainMax == ulmax && dlmainMin == ulmin) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    else if (ulmainMax == dlmax && ulmainMin == dlmin) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    // Candidate 頻率範圍完全蓋過 defualt
                    if ((dlmainMax >= dlmax && dlmainMin < dlmin) || (dlmainMax > dlmax && dlmainMin <= dlmin)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((dlmainMax >= ulmax && dlmainMin < ulmin) || (dlmainMax > ulmax && dlmainMin <= ulmin)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax >= dlmax && ulmainMin < dlmin) || (ulmainMax > dlmax && ulmainMin <= dlmin)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax >= ulmax && ulmainMin < ulmin) || (ulmainMax > ulmax && ulmainMin <= ulmin)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    // Candidate 頻率範圍與部分 defualt 重疊
                    if ((dlmainMax > dlmin && dlmainMax < dlmax) || (dlmainMin > dlmin && dlmainMin < dlmax)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((dlmainMax > ulmin && dlmainMax < ulmax) || (dlmainMin > ulmin && dlmainMin < ulmax)) {
                        // warnmsg+=`Candidate's DL and Default BS${i+1}'s UL frequency overlaped <br/>`;
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax > ulmin && ulmainMax < ulmax) || (ulmainMin > ulmin && ulmainMin < ulmax)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                    if ((ulmainMax > dlmin && ulmainMax < dlmax) || (ulmainMin > dlmin && ulmainMin < dlmax)) {
                        warnmsg += "" + this.translateService.instant('candidate') + this.translateService.instant('de') + this.translateService.instant('ulfrequency') + " \n            " + this.translateService.instant('and') + " \n            " + this.translateService.instant('default') + (i + 1) + this.translateService.instant('de') + this.translateService.instant('dlfrequency') + " \n            " + this.translateService.instant('overlap') + " <br/>";
                    }
                }
            }
        }
        if (warnmsg != '') {
            // console.log(warnmsg);
            warnmsg = '<br/>' + warnmsg;
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: warnmsg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            return true;
        }
        else {
            return false;
        }
    };
    //Todo
    SitePlanningComponent.prototype.checkCandidateRFParamIsEmpty = function (protocol, duplex) {
        var error = false;
        var msg = '';
        var obj = this.tempCalParamSet;
        if (this.isEmpty(this.scalingFactor)) {
            msg += this.translateService.instant('nf_scalingFactor') + "<br/>";
        }
        else if (this.scalingFactor < 0 || this.scalingFactor > 1) {
            msg += this.translateService.instant('0to1_scalingFactor') + "<br/>";
        }
        // console.log(this.calculateForm.powerMinRange);
        // console.log(this.calculateForm.powerMaxRange);
        if (this.isEmpty(this.calculateForm.powerMaxRange) || this.isEmpty(this.calculateForm.powerMinRange)) {
            if (this.isEmpty(this.calculateForm.powerMaxRange)) {
                msg += this.translateService.instant('nf_maxpower') + "<br/>";
            }
            else {
                msg += this.translateService.instant('nf_minpower') + "<br/>";
            }
        }
        if (protocol == '1') {
            if (duplex == 'tdd') {
                if (this.isEmpty(this.dlRatio)) {
                    msg += this.translateService.instant('nf_dlratio') + "<br/>";
                }
                else if (this.dlRatio < 0 || this.dlRatio > 100) {
                    msg += this.translateService.instant('0_100_dlratio') + "<br/>";
                }
                if (this.isEmpty(obj.tddscs)) {
                    msg += this.translateService.instant('nf_tddscs') + "<br/>";
                }
                if (this.isEmpty(obj.tddbandwidth)) {
                    msg += this.translateService.instant('nf_tddbandwidth') + "<br/>";
                }
                if (this.isEmpty(obj.ulModulationCodScheme)) {
                    msg += this.translateService.instant('nf_ulModulationCodScheme') + "<br/>";
                }
                if (this.isEmpty(obj.dlModulationCodScheme)) {
                    msg += this.translateService.instant('nf_dlModulationCodScheme') + "<br/>";
                }
                if (this.isEmpty(obj.ulMimoLayer)) {
                    msg += this.translateService.instant('nf_ulMimoLayer') + "<br/>";
                }
                if (this.isEmpty(obj.dlMimoLayer)) {
                    msg += this.translateService.instant('nf_dlMimoLayer') + "<br/>";
                }
                if (this.isEmpty(obj.tddfrequency)) {
                    msg += this.translateService.instant('nf_tddfrequency') + "<br/>";
                }
                else if (obj.tddfrequency < 0) {
                    msg += this.translateService.instant('less_0_tddfrequency') + "<br/>";
                }
            }
            else {
                if (this.isEmpty(obj.dlBandwidth)) {
                    msg += this.translateService.instant('nf_dlBandwidth') + "<br/>";
                }
                if (this.isEmpty(obj.ulBandwidth)) {
                    msg += this.translateService.instant('nf_ulBandwidth') + "<br/>";
                }
                if (this.isEmpty(obj.dlScs)) {
                    msg += this.translateService.instant('nf_dlScs') + "<br/>";
                }
                if (this.isEmpty(obj.ulScs)) {
                    msg += this.translateService.instant('nf_ulScs') + "<br/>";
                }
                if (this.isEmpty(obj.dlModulationCodScheme)) {
                    msg += this.translateService.instant('nf_dlModulationCodScheme') + "<br/>";
                }
                if (this.isEmpty(obj.ulModulationCodScheme)) {
                    msg += this.translateService.instant('nf_ulModulationCodScheme') + "<br/>";
                }
                if (this.isEmpty(obj.dlMimoLayer)) {
                    msg += this.translateService.instant('nf_dlMimoLayer') + "<br/>";
                }
                if (this.isEmpty(obj.ulMimoLayer)) {
                    msg += this.translateService.instant('nf_ulMimoLayer') + "<br/>";
                }
                if (this.isEmpty(obj.fddDlFrequency)) {
                    msg += this.translateService.instant('nf_fddDlFrequency') + "<br/>";
                }
                else if (obj.fddDlFrequency < 0) {
                    msg += this.translateService.instant('less_0_fddDlFrequency') + "<br/>";
                }
                if (this.isEmpty(obj.fddUlFrequency)) {
                    msg += this.translateService.instant('nf_fddUlFrequency') + "<br/>";
                }
                else if (obj.fddUlFrequency < 0) {
                    msg += this.translateService.instant('less_0_fddUlFrequency') + "<br/>";
                }
                if (obj.fddDlFrequency == obj.fddUlFrequency
                    && !this.isEmpty(obj.fddUlFrequency)
                    && !this.isEmpty(obj.fddDlFrequency)) {
                    msg += this.translateService.instant('fddDlFrequency_same_fddUlFrequency') + "<br/>";
                }
            }
        }
        else {
            if (duplex == 'tdd') {
                if (this.isEmpty(this.dlRatio) === null) {
                    msg += this.translateService.instant('nf_dlratio') + "<br/>";
                }
                else if (this.dlRatio < 0 || this.dlRatio > 100) {
                    msg += this.translateService.instant('0_100_dlratio') + "<br/>";
                }
                if (this.isEmpty(obj.mimoNumber4G)) {
                    msg += this.translateService.instant('nf_mimonum') + "<br/>";
                }
                if (this.isEmpty(obj.tddbandwidth)) {
                    msg += this.translateService.instant('nf_tddbandwidth') + "<br/>";
                }
                else if (Number(obj.tddbandwidth) < 0) {
                    msg += this.translateService.instant('less_0_tddbandwidth') + "<br/>";
                }
                if (this.isEmpty(obj.tddfrequency)) {
                    msg += this.translateService.instant('nf_tddfrequency') + "<br/>";
                }
                else if (obj.tddfrequency < 0) {
                    msg += this.translateService.instant('less_0_tddfrequency') + "<br/>";
                }
            }
            else {
                if (this.isEmpty(obj.mimoNumber4G)) {
                    msg += this.translateService.instant('nf_mimonum') + "<br/>";
                }
                console.log(this.isEmpty(obj.dlBandwidth));
                console.log(obj.dlBandwidth);
                if (this.isEmpty(obj.dlBandwidth)) {
                    msg += this.translateService.instant('nf_ulBandwidth') + "<br/>";
                }
                else if (Number(obj.dlBandwidth) < 0) {
                    msg += this.translateService.instant('less_0_ulBandwidth') + "<br/>";
                }
                if (this.isEmpty(obj.ulBandwidth)) {
                    msg += this.translateService.instant('nf_dlBandwidth') + "<br/>";
                }
                else if (Number(obj.ulBandwidth) < 0) {
                    msg += this.translateService.instant('less_0_dlBandwidth') + "<br/>";
                }
                if (this.isEmpty(obj.fddDlFrequency)) {
                    msg += this.translateService.instant('nf_fddDlFrequency') + "<br/>";
                }
                else if (obj.fddDlFrequency < 0) {
                    msg += this.translateService.instant('less_0_fddDlFrequency') + "<br/>";
                }
                if (this.isEmpty(obj.fddUlFrequency)) {
                    msg += this.translateService.instant('nf_fddUlFrequency') + "<br/>";
                }
                else if (obj.fddUlFrequency < 0) {
                    msg += this.translateService.instant('less_0_fddUlFrequency') + "<br/>";
                }
                if (obj.fddDlFrequency == obj.fddUlFrequency
                    && !this.isEmpty(obj.fddUlFrequency)
                    && !this.isEmpty(obj.fddDlFrequency)) {
                    msg += this.translateService.instant('fddDlFrequency_same_fddUlFrequency') + "<br/>";
                }
            }
        }
        if (msg !== '') {
            msg = this.translateService.instant('following_fix_plz') + "<br/>" + msg;
            error = true;
            console.log(msg);
        }
        if (error) {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
        return error;
    };
    /**
     * 開始運算
     */
    SitePlanningComponent.prototype.calculate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var msg, msg, isCanLessAvl, isAvlLessZero, isCanLessZero, msg, msg, msg, msg, msg, msg, msg, msg, msg, url_1, apiBody_1;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    this.moveable.destroy();
                }
                catch (error) { }
                console.log(this.evaluationFuncForm);
                // 檢查既有基地台是否有參數未被填入
                if (this.checkRFParamIsEmpty(this.calculateForm.objectiveIndex, this.duplexMode)) {
                    return [2 /*return*/];
                }
                // 檢查待選基地台參數 Todo
                if (this.checkCandidateRFParamIsEmpty(this.calculateForm.objectiveIndex, this.duplexMode)) {
                    return [2 /*return*/];
                }
                //檢查是否有基地台頻寬重疊
                if (this.checkRFParamIsOverlaped()) {
                    return [2 /*return*/];
                }
                //檢查子場域是否重疊
                if (this.checkSubFieldOverlaped()) {
                    return [2 /*return*/];
                }
                if (this.planningIndex != '3' && this.duplexMode == 'fdd' && this.checkDlUlDiff()) {
                    msg = this.translateService.instant('dl_ul_freq_same');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                    return [2 /*return*/];
                }
                if (this.planningIndex != '3' && Number(this.calculateForm.powerMaxRange) == Number(this.calculateForm.powerMinRange) ||
                    Number(this.calculateForm.powerMinRange) > Number(this.calculateForm.powerMaxRange)) {
                    msg = '';
                    if (this.calculateForm.powerMaxRange == this.calculateForm.powerMinRange) {
                        msg = this.translateService.instant('max_min_txpower_same');
                    }
                    else {
                        msg = this.translateService.instant('min_txpower_greater_than_max');
                    }
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                    return [2 /*return*/];
                }
                isCanLessAvl = this.candidateList.length < this.calculateForm.availableNewBsNumber && this.isBsNumberOptimization == 'custom';
                isAvlLessZero = Number(this.calculateForm.availableNewBsNumber) <= 0 && this.isBsNumberOptimization == 'custom';
                isCanLessZero = Number(this.candidateList.length) <= 0;
                if ((isCanLessAvl || isAvlLessZero || isCanLessZero) && this.planningIndex !== '3') {
                    msg = void 0;
                    if (this.candidateList.length == 0) {
                        msg = this.translateService.instant('calculate.candidate.Mandatory');
                    }
                    else {
                        if (this.calculateForm.objectiveIndex === '2') {
                            msg = this.translateService.instant('availableNewBsNumber.wifi');
                        }
                        else {
                            msg = this.translateService.instant('availableNewBsNumber.gen');
                        }
                        if (this.candidateList.length < this.calculateForm.availableNewBsNumber) {
                            msg += ' ' + this.translateService.instant('must_less_than_candidateBs') + this.candidateList.length;
                        }
                        else {
                            msg += ' ' + this.translateService.instant('must_greater_than') + '0';
                        }
                    }
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (!(Number(this.calculateForm.maxConnectionNum) > 0)) {
                    msg = this.translateService.instant('maxConnectionNum') + ' ' + this.translateService.instant('must_greater_than') + ' 0';
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (!(Number(this.calculateForm.maxConnectionNum) <= 1000)) {
                    msg = this.translateService.instant('maxConnectionNum') + ' ' + this.translateService.instant('must_less_than_or_equal_to') + ' 1000';
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (!(Number(this.calculateForm.geographicalNorth) <= 360)) {
                    msg = this.translateService.instant('compassDirection') + ' ' + this.translateService.instant('must_less_than_or_equal_to') + ' 360';
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (!(Number(this.calculateForm.geographicalNorth) >= 0)) {
                    msg = this.translateService.instant('compassDirection') + ' ' + this.translateService.instant('must_greater_than_or_equal_to') + ' 0';
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (this.planningIndex == '3' && this.defaultBSList.length == 0) {
                    msg = this.translateService.instant('bs_must_greater_than_zero');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (this.ueList.length == 0 && this.planningIndex == '2') {
                    msg = this.translateService.instant('ue.Mandatory');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (this.planningIndex === '1' && !this.evaluationFuncForm.field.coverage.activate &&
                    !this.evaluationFuncForm.field.rsrp.activate && !this.evaluationFuncForm.field.sinr.activate &&
                    !this.evaluationFuncForm.field.throughput.activate) {
                    msg = this.translateService.instant('no_target_fault');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else if (this.planningIndex === '2' && !this.evaluationFuncForm.ue.coverage.activate &&
                    !this.evaluationFuncForm.ue.throughputByRsrp.activate) {
                    msg = this.translateService.instant('no_target_fault');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
                else {
                    this.progressNum = 0;
                    // console.log(this.calculateForm.bandwidth);
                    // console.log(this.calculateForm.frequency);
                    console.log(this.evaluationFuncForm);
                    this.setForm();
                    console.log(this.evaluationFuncForm);
                    // 規劃目標
                    this.setPlanningObj();
                    // let apiBody = JSON.parse(JSON.stringify(this.calculateForm));
                    console.log(this.calculateForm);
                    url_1 = '';
                    if (this.planningIndex !== '3') {
                        this.calculateForm.isSimulation = false;
                        url_1 = this.authService.API_URL + "/calculate";
                    }
                    else {
                        this.calculateForm.isSimulation = true;
                        url_1 = this.authService.API_URL + "/simulation";
                    }
                    apiBody_1 = JSON.parse(JSON.stringify(this.calculateForm));
                    apiBody_1.availableNewBsNumber = apiBody_1.availableNewBsNumber + this.defaultBSList.length;
                    // apiBody.isBsNumberOptimization = (this.isBsNumberOptimization == 'default');
                    console.log(this.calculateForm);
                    this.authService.spinnerShowAsHome();
                    window.setTimeout(function () {
                        _this.http.post(url_1, JSON.stringify(apiBody_1)).subscribe(function (res) {
                            _this.taskid = res['taskid'];
                            _this.getProgress();
                        }, function (err) {
                            _this.authService.spinnerHide();
                            console.log(err);
                        });
                    }, 100);
                }
                return [2 /*return*/];
            });
        });
    };
    /** 設定規劃目標  */
    SitePlanningComponent.prototype.setPlanningObj = function () {
        // check規劃目標
        if (this.planningIndex === '1') {
            this.calculateForm.isUeAvgSinr = false;
            this.calculateForm.isUeAvgThroughput = false;
            this.calculateForm.isUeCoverage = false;
            this.evaluationFuncForm.ue.coverage.activate = false;
            this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
        }
        else if (this.planningIndex === '2') {
            this.calculateForm.isAverageSinr = false;
            this.calculateForm.isCoverage = false;
            this.evaluationFuncForm.field.coverage.activate = false;
            this.evaluationFuncForm.field.throughput.activate = false;
            this.evaluationFuncForm.field.sinr.activate = false;
            this.evaluationFuncForm.field.rsrp.activate = false;
        }
        else {
            this.evaluationFuncForm.ue.coverage.activate = false;
            this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
            this.evaluationFuncForm.field.coverage.activate = false;
            this.evaluationFuncForm.field.throughput.activate = false;
            this.evaluationFuncForm.field.sinr.activate = false;
            this.evaluationFuncForm.field.rsrp.activate = false;
        }
        console.log(this.evaluationFuncForm);
        this.calculateForm.isBsNumberOptimization = (this.isBsNumberOptimization == 'default');
        // this.calculateForm.evaluationFunc = this.evaluationFuncForm;
        console.log("this.evaluationFuncForm.field.coverage.activate = " + this.evaluationFuncForm.field.coverage.activate);
        console.log("this.evaluationFuncForm.field.sinr.activate = " + this.evaluationFuncForm.field.sinr.activate);
        this.calculateForm.evaluationFunc = new EvaluationFuncForm_1.EvaluationFuncForm();
        if (this.evaluationFuncForm.field.coverage.activate) {
            this.calculateForm.evaluationFunc.field.coverage.activate = true;
            this.calculateForm.evaluationFunc.field.coverage.ratio = this.evaluationFuncForm.field.coverage.ratio / 100;
            console.log("this.calculateForm.evaluationFunc = " + this.calculateForm.evaluationFunc);
        }
        else {
            this.calculateForm.evaluationFunc.field.coverage.activate = false;
            this.calculateForm.evaluationFunc.field.coverage.ratio = this.defaultArea / 100;
        }
        if (this.evaluationFuncForm.field.sinr.activate) {
            this.calculateForm.evaluationFunc.field.sinr.activate = true;
            for (var i = 0; i < this.evaluationFuncForm.field.sinr.ratio.length; i++) {
                this.calculateForm.evaluationFunc.field.sinr.ratio.push({
                    "areaRatio": this.evaluationFuncForm.field.sinr.ratio[i].areaRatio / 100,
                    "compliance": this.evaluationFuncForm.field.sinr.ratio[i].compliance,
                    "value": this.evaluationFuncForm.field.sinr.ratio[i].value
                });
            }
        }
        else {
            this.calculateForm.evaluationFunc.field.sinr.activate = false;
            this.calculateForm.evaluationFunc.field.sinr.ratio = [];
        }
        if (this.evaluationFuncForm.field.rsrp.activate) {
            this.calculateForm.evaluationFunc.field.rsrp.activate = true;
            for (var i = 0; i < this.evaluationFuncForm.field.rsrp.ratio.length; i++) {
                this.calculateForm.evaluationFunc.field.rsrp.ratio.push({
                    "areaRatio": this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio / 100,
                    "compliance": this.evaluationFuncForm.field.rsrp.ratio[i].compliance,
                    "value": this.evaluationFuncForm.field.rsrp.ratio[i].value
                });
            }
        }
        else {
            this.calculateForm.evaluationFunc.field.rsrp.ratio = [];
        }
        if (this.evaluationFuncForm.field.throughput.activate) {
            this.calculateForm.evaluationFunc.field.throughput.activate = true;
            for (var i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++) {
                this.calculateForm.evaluationFunc.field.throughput.ratio.push({
                    "areaRatio": this.evaluationFuncForm.field.throughput.ratio[i].areaRatio / 100,
                    "compliance": this.evaluationFuncForm.field.throughput.ratio[i].compliance,
                    "ULValue": this.evaluationFuncForm.field.throughput.ratio[i].ULValue,
                    "DLValue": this.evaluationFuncForm.field.throughput.ratio[i].DLValue
                });
            }
        }
        else {
            this.calculateForm.evaluationFunc.field.throughput.activate = false;
            this.calculateForm.evaluationFunc.field.throughput.ratio = [];
        }
        if (this.evaluationFuncForm.ue.throughputByRsrp.activate) {
            this.calculateForm.evaluationFunc.ue.throughputByRsrp.activate = true;
            for (var i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++) {
                this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio.push({
                    "countRatio": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio / 100,
                    "compliance": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].compliance,
                    "ULValue": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue,
                    "DLValue": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue
                });
            }
        }
        else {
            this.calculateForm.evaluationFunc.ue.throughputByRsrp.activate = false;
            this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio = [];
        }
        if (this.evaluationFuncForm.ue.coverage.activate) {
            this.calculateForm.evaluationFunc.ue.coverage.activate = true;
            this.calculateForm.evaluationFunc.ue.coverage.ratio =
                this.evaluationFuncForm.ue.coverage.ratio / 100;
        }
        else {
            this.calculateForm.evaluationFunc.ue.coverage.activate = false;
            this.calculateForm.evaluationFunc.ue.coverage.ratio = this.defaultArea / 100;
        }
        console.log(this.evaluationFuncForm);
        console.log(this.calculateForm);
        //this.calculateForm.SINRSettingList = this.evaluationFuncForm.field.sinr;
        // this.calculateForm.RSRPSettingList = this.RSRPSettingList;
        // this.calculateForm.ThroughputSettingList = this.ThroughputSettingList;
        // this.calculateForm.UEThroughputSettingList = this.UEThroughputSettingList;
        // const planningObj = {
        //   isAverageSinr: this.calculateForm.isAverageSinr,
        //   isCoverage: this.calculateForm.isCoverage,
        //   isUeAvgSinr: this.calculateForm.isUeAvgSinr,
        //   isUeAvgThroughput: this.calculateForm.isUeAvgThroughput,
        //   isUeCoverage: this.calculateForm.isUeCoverage
        // };
        // localStorage.setItem(`${this.authService.userToken}planningObj`, JSON.stringify(planningObj));
    };
    /** 組form */
    SitePlanningComponent.prototype.setForm = function () {
        var _this = this;
        // if (typeof this.calculateForm.isAverageSinr === 'undefined') {
        this.calculateForm.isAverageSinr = false;
        // }
        // if (typeof this.calculateForm.isAvgThroughput === 'undefined') {
        this.calculateForm.isAvgThroughput = false;
        // }
        if (typeof this.calculateForm.isCoverage === 'undefined') {
            this.calculateForm.isCoverage = false;
        }
        // if (typeof this.calculateForm.isUeAvgSinr === 'undefined') {
        this.calculateForm.isUeAvgSinr = false;
        // }
        if (typeof this.calculateForm.isUeAvgThroughput === 'undefined') {
            this.calculateForm.isUeAvgThroughput = false;
        }
        if (typeof this.calculateForm.isUeCoverage === 'undefined') {
            this.calculateForm.isUeCoverage = false;
        }
        // if (typeof this.calculateForm.isUeTpByDistance === 'undefined') {
        //   this.calculateForm.isUeTpByDistance = false;
        // }
        this.calculateForm.useUeCoordinate = 1;
        // 規劃目標預設值
        // this.calculateForm.sinrRatio = this.calculateForm.isAverageSinr ? 5 : null;
        // this.calculateForm.throughputRatio = this.calculateForm.isCoverage ? 5 : null;
        // this.calculateForm.ueAvgSinrRatio = this.calculateForm.isUeAvgSinr ? 16 : null;
        // this.calculateForm.ueCoverageRatio = this.calculateForm.isUeAvgThroughput ? 0.95 : null;
        // this.calculateForm.ueAvgThroughputRatio = this.calculateForm.isUeCoverage ? 100 : null;
        //FP 
        if (this.calculateForm.isCoverage == true) {
            this.calculateForm.isUeAvgThroughput = false;
            this.calculateForm.isUeCoverage = false;
        }
        else if (this.calculateForm.isUeAvgThroughput == true) {
            this.calculateForm.isCoverage = false;
            this.calculateForm.isUeCoverage = false;
        }
        else {
            this.calculateForm.isCoverage = false;
            this.calculateForm.isUeAvgThroughput = false;
        }
        this.calculateForm.sessionid = this.authService.userToken;
        var zValue = this.zValues.filter(function (option) { return option !== null; }
        // option => option !== ''
        );
        this.calculateForm.zValue = "[" + zValue.toString() + "]";
        // this.calculateForm.zValue = `[${zValue.toString()}]`;
        var obstacleInfo = '';
        this.calculateForm.obstacleInfo = obstacleInfo;
        if (this.obstacleList.length > 0) {
            // 障礙物資訊
            for (var i = 0; i < this.obstacleList.length; i++) {
                var obj = this.dragObject[this.obstacleList[i]];
                var shape = this.parseElement(obj.element);
                obstacleInfo += "[" + obj.x + "," + obj.y + "," + obj.z + "," + obj.width + "," + obj.height + "," + obj.altitude + "," + obj.rotate + "," + Number(obj.material) + "," + shape + "]";
                if (i < this.obstacleList.length - 1) {
                    obstacleInfo += '|';
                }
            }
            this.calculateForm.obstacleInfo = obstacleInfo;
        }
        var ueCoordinate = '';
        var ueRxGain = [];
        this.calculateForm.ueCoordinate = ueCoordinate;
        if (this.ueList.length > 0) {
            for (var i = 0; i < this.ueList.length; i++) {
                var obj = this.dragObject[this.ueList[i]];
                // ueCoordinate += `[${obj.x},${obj.y},${obj.z},${obj.material}]`;
                ueCoordinate += "[" + obj.x + "," + obj.y + "," + obj.z + "]";
                ueRxGain.push(this.ueListParam[this.ueList[i]].ueRxGain);
                if (i < this.ueList.length - 1) {
                    ueCoordinate += '|';
                }
            }
        }
        else {
            ueCoordinate = '';
        }
        this.calculateForm.ueCoordinate = ueCoordinate;
        this.calculateForm.ueRxGain = "[" + ueRxGain.toString() + "]";
        ;
        var defaultBs = '';
        this.calculateForm.defaultBs = defaultBs;
        if (this.defaultBSList.length > 0) {
            // 現有基站
            for (var i = 0; i < this.defaultBSList.length; i++) {
                var obj = this.dragObject[this.defaultBSList[i]];
                defaultBs += "[" + obj.x + "," + obj.y + "," + obj.altitude + "]";
                // defaultBs += `[${obj.x},${obj.y},${obj.z}]`;
                if (i < this.defaultBSList.length - 1) {
                    defaultBs += '|';
                }
            }
            this.calculateForm.defaultBs = defaultBs;
            this.calculateForm.bsList = defaultBs;
        }
        //　現有基站RF參數
        var txpower = [];
        var beamId = [];
        // let freqList = [];
        var mapProtocol = '';
        if (Number(this.calculateForm.objectiveIndex) === 0) {
            mapProtocol = '4g';
        }
        else if (Number(this.calculateForm.objectiveIndex) === 1) {
            mapProtocol = '5g';
        }
        else {
            mapProtocol = 'wifi';
        }
        //4G and 5G
        var bsNoiseFigure = [];
        var duplex = this.duplexMode;
        var tddFrameRatio = this.dlRatio;
        var dlFrequency = []; //Array
        var ulFrequency = []; //Array
        //4G
        var mimoNumber = []; //Array
        //5G
        var ulMcsTable = []; //Array
        var dlMcsTable = []; //Array
        var ulMimoLayer = []; //Array 上行資料串流數
        var dlMimoLayer = []; //Array 下行資料串流數
        var scalingFactor = this.scalingFactor;
        // 5G TDD 
        var scs = []; //Array
        var bandwidthList = []; //Array TDD bandwidth
        var frequencyList = []; //Array TDD frequency
        // 5G FDD
        var dlScs = []; //Array
        var ulScs = []; //Array
        var dlBandwidth = []; //Array
        var ulBandwidth = []; //Array
        //WiFi
        var wifiProtocol = []; //Array
        var guardInterval = []; //Array
        var wifiMimo = []; //Array
        if (this.defaultBSList.length > 0 || this.candidateList.length > 0) {
            var candidate = '';
            var candidateBsAnt = '';
            if (this.candidateList.length > 0) {
                for (var i = 0; i < this.candidateList.length; i++) {
                    var canObj = this.dragObject[this.candidateList[i]];
                    bsNoiseFigure.push(this.tempCalParamSet.bsNoiseFigure);
                    candidate += "[" + canObj.x + "," + canObj.y + "," + canObj.altitude + "]";
                    // candidate += `[${canObj.x},${canObj.y},${canObj.z}]`;
                    if (i < this.candidateList.length - 1) {
                        candidate += '|';
                    }
                    candidateBsAnt += "[" + this.tempCalParamSet.AntennaId + "," + this.tempCalParamSet.theta + "," + this.tempCalParamSet.phi + "," + this.tempCalParamSet.bsTxGain + "]";
                    if (i < this.candidateList.length - 1) {
                        candidateBsAnt += '|';
                    }
                    // const obj = this.bsListRfParam[this.candidateList[i]];
                    // console.log(`obj: ${JSON.stringify(obj)}`);
                    if (mapProtocol !== 'wifi') {
                        if (mapProtocol === '5g') {
                            ulMcsTable.push(this.tempCalParamSet.ulModulationCodScheme);
                            dlMcsTable.push(this.tempCalParamSet.dlModulationCodScheme);
                            ulMimoLayer.push(this.tempCalParamSet.ulMimoLayer);
                            dlMimoLayer.push(this.tempCalParamSet.dlMimoLayer);
                            scs.push(this.tempCalParamSet.tddscs);
                            // ulMcsTable.push(obj.ulModulationCodScheme);
                            // dlMcsTable.push(obj.dlModulationCodScheme);
                            // ulMimoLayer.push(obj.ulMimoLayer);
                            // dlMimoLayer.push(obj.dlMimoLayer);
                            // scs.push(obj.tddscs);
                        }
                        else {
                            mimoNumber.push(this.tempCalParamSet.mimoNumber4G);
                            // mimoNumber.push(obj.mimoNumber4G);
                        }
                        if (duplex === 'tdd') {
                            bandwidthList.push(this.tempCalParamSet.tddbandwidth);
                            frequencyList.push(this.tempCalParamSet.tddfrequency);
                        }
                        else {
                            dlFrequency.push(this.tempCalParamSet.fddDlFrequency);
                            ulFrequency.push(this.tempCalParamSet.fddUlFrequency);
                            dlScs.push(this.tempCalParamSet.dlScs);
                            ulScs.push(this.tempCalParamSet.ulScs);
                            dlBandwidth.push(this.tempCalParamSet.dlBandwidth);
                            ulBandwidth.push(this.tempCalParamSet.ulBandwidth);
                        }
                    }
                    else {
                        frequencyList.push(this.tempCalParamSet.wifiFrequency);
                        guardInterval.push(this.tempCalParamSet.guardInterval);
                        wifiProtocol.push(this.tempCalParamSet.wifiProtocol);
                        wifiMimo.push(this.tempCalParamSet.wifiMimo);
                        bandwidthList.push(this.tempCalParamSet.wifiBandwidth);
                    }
                }
            }
            this.calculateForm.candidateBs = candidate;
            this.calculateForm.candidateBsAnt = candidateBsAnt;
            var defaultBsAnt = '';
            for (var i = 0; i < this.defaultBSList.length; i++) {
                var obj = this.bsListRfParam[this.defaultBSList[i]];
                console.log("obj: " + JSON.stringify(obj));
                txpower.push(obj.txpower);
                beamId.push(obj.beampattern);
                bsNoiseFigure.push(obj.bsNoiseFigure);
                // freqList.push(obj.frequency);
                defaultBsAnt += "[" + obj.AntennaId + "," + obj.theta + "," + obj.phi + "," + obj.bsTxGain + "]";
                if (i < this.defaultBSList.length - 1) {
                    defaultBsAnt += '|';
                }
                if (mapProtocol !== 'wifi') {
                    if (mapProtocol === '5g') {
                        ulMcsTable.push(obj.ulModulationCodScheme);
                        dlMcsTable.push(obj.dlModulationCodScheme);
                        ulMimoLayer.push(obj.ulMimoLayer);
                        dlMimoLayer.push(obj.dlMimoLayer);
                        scs.push(obj.tddscs);
                        // scs.push(obj.subcarrier);
                    }
                    else {
                        mimoNumber.push(obj.mimoNumber4G);
                    }
                    if (duplex === 'tdd') {
                        bandwidthList.push(obj.tddbandwidth);
                        frequencyList.push(obj.tddfrequency);
                    }
                    else {
                        dlFrequency.push(obj.fddDlFrequency);
                        ulFrequency.push(obj.fddUlFrequency);
                        dlScs.push(obj.dlScs);
                        ulScs.push(obj.ulScs);
                        dlBandwidth.push(obj.dlBandwidth);
                        ulBandwidth.push(obj.ulBandwidth);
                    }
                }
                else {
                    frequencyList.push(obj.wifiFrequency);
                    guardInterval.push(obj.guardInterval);
                    wifiProtocol.push(obj.wifiProtocol);
                    wifiMimo.push(obj.wifiMimo);
                    bandwidthList.push(obj.wifiBandwidth);
                }
            }
            this.calculateForm.defaultBsAnt = defaultBsAnt;
            //API body
            this.calculateForm.mapProtocol = mapProtocol;
            if (this.calculateForm.mapProtocol != 'wifi') {
                this.calculateForm.duplex = duplex;
            }
            else {
                this.calculateForm.duplex = '';
            }
            this.calculateForm.scalingFactor = scalingFactor;
            this.calculateForm.tddFrameRatio = tddFrameRatio;
            this.calculateForm.bsNoiseFigure = "[" + bsNoiseFigure.toString() + "]";
            //4G
            this.calculateForm.mimoNumber = "[" + mimoNumber.toString() + "]";
            //5G
            this.calculateForm.scs = "[" + scs.toString() + "]";
            this.calculateForm.ulMcsTable = "[" + ulMcsTable.toString() + "]";
            this.calculateForm.dlMcsTable = "[" + dlMcsTable.toString() + "]";
            this.calculateForm.ulMimoLayer = "[" + ulMimoLayer.toString() + "]";
            this.calculateForm.dlMimoLayer = "[" + dlMimoLayer.toString() + "]";
            //FDD
            this.calculateForm.dlFrequency = "[" + dlFrequency.toString() + "]";
            this.calculateForm.ulFrequency = "[" + ulFrequency.toString() + "]";
            this.calculateForm.dlScs = "[" + dlScs.toString() + "]";
            this.calculateForm.ulScs = "[" + ulScs.toString() + "]";
            this.calculateForm.dlBandwidth = "[" + dlBandwidth.toString() + "]";
            this.calculateForm.ulBandwidth = "[" + ulBandwidth.toString() + "]";
            //WiFi
            var tempWifiProtocol = '';
            var tempGuardInterval = '';
            var tempWifiMimo = '';
            for (var i = 0; i < wifiProtocol.length; i++) {
                if (i == 0) {
                    tempWifiProtocol += "[" + wifiProtocol[i] + ",";
                    tempGuardInterval += "[" + guardInterval[i] + ",";
                    tempWifiMimo += "[" + wifiMimo[i] + ",";
                }
                else if (i < wifiProtocol.length - 1) {
                    tempWifiProtocol += "" + wifiProtocol[i] + ",";
                    tempGuardInterval += "" + guardInterval[i] + ",";
                    tempWifiMimo += "" + wifiMimo[i] + ",";
                }
                else {
                    tempWifiProtocol += "" + wifiProtocol[i] + "]";
                    tempGuardInterval += "" + guardInterval[i] + "]";
                    tempWifiMimo += "" + wifiMimo[i] + "]";
                }
            }
            this.calculateForm.wifiProtocol = tempWifiProtocol;
            this.calculateForm.guardInterval = tempGuardInterval;
            this.calculateForm.wifiMimo = tempWifiMimo;
            // this.calculateForm.wifiProtocol = `[${wifiProtocol.toString()}]`;
            // this.calculateForm.guardInterval = `[${guardInterval.toString()}]`;
            // this.calculateForm.wifiMimo = `[${wifiMimo.toString()}]`;
            this.calculateForm.txPower = "[" + txpower.toString() + "]";
            this.calculateForm.beamId = "[" + beamId.toString() + "]";
            this.calculateForm.bandwidthList = "[" + bandwidthList.toString() + "]";
            this.calculateForm.frequencyList = "[" + frequencyList.toString() + "]";
            this.calculateForm.frequency = "[" + frequencyList.toString() + "]";
            this.calculateForm.bandwidth = "[" + bandwidthList.toString() + "]";
            console.log(this.calculateForm);
        }
        // number type to number
        Object.keys(this.calculateForm).forEach(function (key) {
            if (_this.numColumnList.includes(key)) {
                _this.calculateForm[key] = Number(_this.calculateForm[key]);
            }
        });
        /*
        Object.keys(this.calculateForm.pathLossModel).forEach((key) => {
          this.calculateForm.pathLossModel[key] = Number(this.calculateForm.pathLossModel[key]);
          
        });
        */
        if (Number(this.calculateForm.objectiveIndex) === 2) {
            // Wifi強制指定為wifi模型
            this.calculateForm.pathLossModelId = 9;
        }
    };
    /**
     * BsList Txpower, BeamPattern, Frequency
     */
    SitePlanningComponent.prototype.changeTxBfFreq = function (item) {
        console.log("Bs" + item + ":" + this.bsListRfParam[item]);
    };
    /** 查詢進度 */
    SitePlanningComponent.prototype.getProgress = function () {
        var _this = this;
        var url = this.authService.API_URL + "/progress/" + this.taskid + "/" + this.authService.userToken;
        this.http.get(url).subscribe(function (res) {
            window.clearInterval(_this.progressInterval);
            for (var i = 0; i < _this.progressInterval; i++) {
                window.clearInterval(i);
            }
            console.log(res);
            if (res['progress'] === 1) {
                _this.authService.showFinish();
                var resultUrl = _this.authService.API_URL + "/completeCalcResult/" + _this.taskid + "/" + _this.authService.userToken;
                _this.http.get(resultUrl).subscribe(function (resCalcResult) {
                    console.log(resCalcResult);
                    var unAchievedObj = {
                        isFieldSINRUnAchieved: false,
                        isFieldRSRPUnAchieved: false,
                        isFieldThroughputUnAchieved: false,
                        isFieldCoverageUnAchieved: false,
                        isUEThroughputByRsrpUnAchieved: false,
                        isUECoverageUnAchieved: false
                    };
                    unAchievedObj.isFieldSINRUnAchieved = (resCalcResult['output'].evaluationResult.field.sinr.goal == 'unachieved');
                    unAchievedObj.isFieldRSRPUnAchieved = (resCalcResult['output'].evaluationResult.field.rsrp.goal == 'unachieved');
                    unAchievedObj.isFieldThroughputUnAchieved = (resCalcResult['output'].evaluationResult.field.throughput.goal == 'unachieved');
                    unAchievedObj.isFieldCoverageUnAchieved = (resCalcResult['output'].evaluationResult.field.coverage.goal == 'unachieved');
                    unAchievedObj.isUEThroughputByRsrpUnAchieved = (resCalcResult['output'].evaluationResult.ue.throughputByRsrp.goal == 'unachieved');
                    unAchievedObj.isUECoverageUnAchieved = (resCalcResult['output'].evaluationResult.ue.coverage.goal == 'unachieved');
                    var unAchieved = unAchievedObj.isFieldSINRUnAchieved || unAchievedObj.isFieldRSRPUnAchieved ||
                        unAchievedObj.isFieldThroughputUnAchieved || unAchievedObj.isFieldCoverageUnAchieved ||
                        unAchievedObj.isUEThroughputByRsrpUnAchieved || unAchievedObj.isUECoverageUnAchieved;
                    if (unAchieved) {
                        _this.authService.spinnerHide();
                        var msg = _this.translateService.instant('target.unachieved');
                        _this.msgDialogConfig.data = {
                            infoMessage: msg
                        };
                        var dialogRef = _this.matDialog.open(confirm_dailog_component_1.ConfirmDailogComponent, _this.msgDialogConfig);
                        dialogRef.componentInstance.onOK.subscribe(function () {
                            // done
                            _this.authService.spinnerHide();
                            // 儲存
                            // this.save();
                            window.clearInterval(_this.pgInterval);
                            for (var i = 0; i < _this.pgInterval; i++) {
                                window.clearInterval(i);
                            }
                            localStorage.setItem("unAchievedObj", JSON.stringify(unAchievedObj));
                            sessionStorage.removeItem('importFile');
                            sessionStorage.removeItem('taskName');
                            _this.router.navigate(['/site/result'], { queryParams: { taskId: _this.taskid } }).then(function () {
                                // location.reload();
                            });
                            ;
                        });
                    }
                    else {
                        // done
                        _this.authService.spinnerHide();
                        // 儲存
                        // this.save();
                        window.clearInterval(_this.pgInterval);
                        for (var i = 0; i < _this.pgInterval; i++) {
                            window.clearInterval(i);
                        }
                        sessionStorage.removeItem('importFile');
                        sessionStorage.removeItem('taskName');
                        _this.router.navigate(['/site/result'], { queryParams: { taskId: _this.taskid } }).then(function () {
                            // location.reload();
                        });
                        ;
                    }
                }, function (errCalcResult) {
                    var msg = _this.translateService.instant('cant_get_result');
                    _this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    _this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, _this.msgDialogConfig);
                });
            }
            else {
                // query again
                window.clearInterval(_this.progressInterval);
                for (var i = 0; i < _this.progressInterval; i++) {
                    window.clearInterval(i);
                }
                _this.progressInterval = window.setTimeout(function () {
                    _this.getProgress();
                }, 3000);
            }
        }, function (err) {
            _this.authService.spinnerHide();
            window.clearInterval(_this.progressInterval);
            for (var i = 0; i < _this.progressInterval; i++) {
                window.clearInterval(i);
            }
            // check has result
            if (err.error['text'] === '{"progress":,"index":-1}') {
                var resultUrl = _this.authService.API_URL + "/completeCalcResult/" + _this.taskid + "/" + _this.authService.userToken;
                _this.http.get(resultUrl).subscribe(function (res) {
                    _this.router.navigate(['/site/result'], { queryParams: { taskId: _this.taskid } }).then(function () {
                        // location.reload();
                    });
                    ;
                });
            }
        });
    };
    SitePlanningComponent.prototype.changePlanningTarget = function (target) {
        // if (target == 'isCoverage') {
        //   this.calculateForm.isUeAvgThroughput = false;
        //   this.calculateForm.isUeCoverage = false;
        // } else if (target == 'isUeAvgThroughput') {
        //   this.calculateForm.isCoverage = false;
        //   this.calculateForm.isUeCoverage = false;
        // } else {
        //   // this.calculateForm.isCoverage = false;
        //   this.calculateForm.isUeAvgThroughput = false;
        // }
    };
    SitePlanningComponent.prototype.changeEvaluationFuncCheckBox = function () {
        if (this.evaluationFuncForm.field.sinr.activate && this.evaluationFuncForm.field.sinr.ratio.length == 0) {
            this.addSINR();
        }
        if (this.evaluationFuncForm.field.rsrp.activate && this.evaluationFuncForm.field.rsrp.ratio.length == 0) {
            this.addRSRP();
        }
        if (this.evaluationFuncForm.field.throughput.activate && this.evaluationFuncForm.field.throughput.ratio.length == 0) {
            this.addThroughput();
        }
        if (this.evaluationFuncForm.ue.throughputByRsrp.activate && this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0) {
            this.addUEThroughput();
        }
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.setStorageEvaluationFuncForm = function () {
        window.sessionStorage.setItem("evaluationFuncForm", JSON.stringify(this.evaluationFuncForm));
    };
    SitePlanningComponent.prototype.getStorageEvaluationFuncForm = function () {
        if (window.sessionStorage.getItem("evaluationFuncForm") != null) {
            this.evaluationFuncForm = JSON.parse(window.sessionStorage.getItem("evaluationFuncForm"));
        }
        this.setThroughputTypeAndValue();
    };
    SitePlanningComponent.prototype.changeBsNumOpti = function () {
        window.sessionStorage.setItem("isBsNumberOptimization", this.isBsNumberOptimization);
    };
    /**
     * 變更障礙物size
     * @param svgId 物件id
     */
    SitePlanningComponent.prototype.changeSize = function (svgId, type, first) {
        if (type == 'altitude') {
            if (this.dragObject[svgId].altitude <= 0) {
                this.dragObject[svgId].altitude = Number(window.sessionStorage.getItem('tempParam'));
                var msg = this.translateService.instant('wha_cant_less_than_0');
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            }
            else if (Number(this.dragObject[svgId].z) + Number(this.dragObject[svgId].altitude) > Number(this.calculateForm.altitude)) {
                this.recoverParam(svgId, 'altitude');
                var msg = this.translateService.instant('z_greater_then_field_altitude');
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            }
            return;
        }
        if (type == 'width' && this.dragObject[svgId].width <= 0) {
            this.dragObject[svgId].width = Number(window.sessionStorage.getItem('tempParam'));
            var msg = this.translateService.instant('wha_cant_less_than_0');
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            return;
        }
        else if (type == 'height' && this.dragObject[svgId].height <= 0) {
            this.dragObject[svgId].height = Number(window.sessionStorage.getItem('tempParam'));
            var msg = this.translateService.instant('wha_cant_less_than_0');
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            return;
        }
        this.svgId = svgId;
        // this.target = document.querySelector(`#${svgId}`);
        var elementWidth = this.pixelXLinear(this.dragObject[svgId].width);
        var elementHeight = this.pixelYLinear(this.dragObject[svgId].height);
        this.spanStyle[svgId].width = elementWidth + "px";
        this.spanStyle[svgId].height = elementHeight + "px";
        this.svgStyle[svgId].width = elementWidth;
        this.svgStyle[svgId].height = elementHeight;
        var shape = this.dragObject[svgId].element;
        if (shape === 'rect' || Number(shape) === 0) {
            this.rectStyle[svgId] = {
                width: elementWidth,
                height: elementHeight,
                fill: this.dragObject[svgId].color
            };
        }
        else if (shape === 'ellipse' || Number(shape) === 2) {
            var x = void 0;
            var y = void 0;
            if (type === 'width') {
                x = elementWidth / 2;
                y = elementWidth / 2;
                var y2 = y * 2;
                this.spanStyle[svgId].height = y2 + "px";
                this.svgStyle[svgId].height = y2;
                this.dragObject[svgId].height = this.roundFormat(this.yLinear(y2));
            }
            else {
                x = elementHeight / 2;
                y = elementHeight / 2;
                var x2 = x * 2;
                this.spanStyle[svgId].width = x2 + "px";
                this.svgStyle[svgId].width = x2;
                this.dragObject[svgId].width = this.roundFormat(this.xLinear(x2));
            }
            this.ellipseStyle[svgId] = {
                cx: x,
                cy: y,
                rx: x,
                ry: y,
                fill: this.dragObject[svgId].color
            };
        }
        else if (shape === 'polygon' || Number(shape) === 1) {
            var points = elementWidth / 2 + ",0 " + elementWidth + ", " + elementHeight + " 0, " + elementHeight;
            this.polygonStyle[svgId] = {
                points: points,
                fill: this.dragObject[svgId].color
            };
        }
        else if (shape === 'trapezoid' || Number(shape) === 3) {
            // 梯形
            this.trapezoidStyle[svgId] = {
                fill: this.dragObject[svgId].color,
                width: elementWidth,
                height: elementHeight
            };
        }
        // 調整完size需校正位置
        if (first) {
            this.changePosition(type, svgId);
        }
    };
    // 檢查頻率+頻寬是否與其他基地台重疊
    SitePlanningComponent.prototype.changeFrequency = function (svgId, dir, isCandidate) {
        // console.log('changeFrequency changeFrequency changeFrequency');
        // 若為FDD先檢查上下行有沒有一樣
        if (isCandidate) {
            var msg = '';
            if (dir == '' && (Number(this.tempCalParamSet.tddfrequency) > 6000 || Number(this.tempCalParamSet.tddfrequency) < 450)) {
                msg = this.translateService.instant('frequency_out_of_fr1');
                this.tempCalParamSet.tddfrequency = Number(window.sessionStorage.getItem('tempParam'));
            }
            else if (dir == 'dl' && (Number(this.tempCalParamSet.fddDlFrequency) > 6000 || Number(this.tempCalParamSet.fddDlFrequency) < 450)) {
                this.tempCalParamSet.fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                msg = this.translateService.instant('frequency_out_of_fr1');
            }
            else if (dir == 'ul' && (Number(this.tempCalParamSet.fddUlFrequency) > 6000 || Number(this.tempCalParamSet.fddUlFrequency) < 450)) {
                this.tempCalParamSet.fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                msg = this.translateService.instant('frequency_out_of_fr1');
            }
            else if (dir != '' && this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
                if (dir == 'dl') {
                    this.tempCalParamSet.fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                }
                else {
                    this.tempCalParamSet.fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                }
                msg = (dir == 'ul' ? this.translateService.instant('dlfrequency_same_ulfrequency2') : this.translateService.instant('dlfrequency_same_ulfrequency3'));
            }
            if (msg != '') {
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                return;
            }
        }
        else {
            var msg = '';
            if (dir == '' && (Number(this.bsListRfParam[svgId].tddfrequency) > 6000 || Number(this.bsListRfParam[svgId].tddfrequency) < 450)) {
                msg = this.translateService.instant('frequency_out_of_fr1');
                this.bsListRfParam[svgId].tddfrequency = Number(window.sessionStorage.getItem('tempParam'));
            }
            else if (dir == 'dl' && (Number(this.bsListRfParam[svgId].fddDlFrequency) > 6000 || Number(this.bsListRfParam[svgId].fddDlFrequency) < 450)) {
                this.bsListRfParam[svgId].fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                msg = this.translateService.instant('frequency_out_of_fr1');
            }
            else if (dir == 'ul' && (Number(this.bsListRfParam[svgId].fddUlFrequency) > 6000 || Number(this.bsListRfParam[svgId].fddUlFrequency) < 450)) {
                this.bsListRfParam[svgId].fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                msg = this.translateService.instant('frequency_out_of_fr1');
            }
            else if (dir != '' && this.bsListRfParam[svgId].fddUlFrequency == this.bsListRfParam[svgId].fddDlFrequency) {
                if (dir == 'dl') {
                    this.bsListRfParam[svgId].fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                }
                else {
                    this.bsListRfParam[svgId].fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
                }
                msg = (dir == 'ul' ? this.translateService.instant('dlfrequency_same_ulfrequency2') : this.translateService.instant('dlfrequency_same_ulfrequency3'));
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                return;
            }
            if (msg != '') {
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: msg
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                return;
            }
        }
        //再來檢查有沒有overlaped，前TDD，後FDD-----------------------------------------
        // let overlaped = false;
        // if (this.duplexMode == 'tdd') {
        //   this.modalParam.dir = '';
        //   let freq = 0;
        //   let band = 0;
        //   if (isCandidate) { //改的是否為candidate參數
        //     freq = this.tempCalParamSet.tddfrequency;
        //     band = Number(this.tempCalParamSet.tddbandwidth);
        //     this.modalParam.isCandidate = true;
        //     console.log(`TDD Candidate: freq-${freq} band-${band}`);
        //   } else {
        //     freq = this.bsListRfParam[svgId].tddfrequency;
        //     band = this.bsListRfParam[svgId].tddbandwidth;
        //     this.modalParam.isCandidate = false;
        //     console.log(`TDD Default: freq-${freq} band-${band}`);
        //   }
        //   //跟所有的既有基地台比對，
        //   for (let i = 0;i < this.defaultBSList.length;i++) { 
        //     if (this.defaultBSList[i] == svgId) {
        //       continue;
        //     }
        //     let max = this.bsListRfParam[this.defaultBSList[i]].tddfrequency + Number(this.bsListRfParam[this.defaultBSList[i]].tddbandwidth)/2;
        //     let min = this.bsListRfParam[this.defaultBSList[i]].tddfrequency - Number(this.bsListRfParam[this.defaultBSList[i]].tddbandwidth)/2;
        //     if (freq == this.bsListRfParam[this.defaultBSList[i]].tddfrequency) {
        //       console.log('flag');
        //       //若有既有基地台的頻率一樣，則必須讓該基地台的頻寬也跟著一樣
        //       this.matDialog.open(this.deleteModal4, { disableClose: true });
        //       overlaped = false;
        //     } else if ((freq + band/2 > min && freq + band/2 < max) || (freq - band/2 > min && freq - band/2 < max)) {
        //       console.log('flag');
        //       overlaped = true;
        //     }
        //   }
        //   //若改的不是candidate的頻率，則需要再跟candidate頻率比對一次
        //   if (!isCandidate) {
        //     let max = this.tempCalParamSet.tddfrequency + Number(this.tempCalParamSet.tddbandwidth)/2;
        //     let min = this.tempCalParamSet.tddfrequency - Number(this.tempCalParamSet.tddbandwidth)/2;
        //     if (freq == this.tempCalParamSet.tddfrequency) {
        //       //若待選基地台的頻率一樣，則必須讓該基地台的頻寬也跟著一樣
        //       this.matDialog.open(this.deleteModal4, { disableClose: true });
        //       overlaped = false;
        //     } else if (freq > min && freq < max) {
        //       console.log('flag');
        //       overlaped = true;
        //     }
        //   }
        // } else { //處理FDD------------------------------------------
        //   let dlfreq = 0;
        //   let ulfreq = 0;
        //   let dlband = 0;
        //   let ulband = 0;
        //   if (isCandidate) {
        //     dlfreq = this.tempCalParamSet.fddDlFrequency;
        //     dlband = Number(this.tempCalParamSet.dlBandwidth);
        //     ulfreq = this.tempCalParamSet.fddUlFrequency;
        //     ulband = Number(this.tempCalParamSet.ulBandwidth);
        //     this.modalParam.isCandidate = true;
        //   } else {
        //     dlfreq = this.bsListRfParam[svgId].fddDlFrequency;
        //     dlband = Number(this.bsListRfParam[svgId].dlBandwidth);
        //     ulfreq = this.bsListRfParam[svgId].fddUlFrequency;
        //     ulband = Number(this.bsListRfParam[svgId].ulBandwidth);
        //     this.modalParam.isCandidate = false;
        //   }
        //   //先跟自己比對
        //   if (dir == 'dl') {
        //     this.modalParam.dir = 'dl';
        //     if ((dlfreq + dlband/2 > ulfreq - ulband/2 && dlfreq + dlband/2 < ulfreq + ulband/2) ||
        //     (dlfreq - dlband/2 > ulfreq - ulband/2 && dlfreq - dlband/2 < ulfreq + ulband/2)) {
        //       console.log('DL與自己的UL頻率+頻段碰撞');
        //       if (isCandidate) {
        //         this.tempCalParamSet.fddDlFrequency = Number(sessionStorage.getItem('tempParam'));
        //       } else {
        //         this.bsListRfParam[svgId].fddDlFrequency = sessionStorage.getItem('tempParam');
        //       }
        //       this.matDialog.open(this.deleteModal5, { disableClose: true });
        //       return;
        //     }
        //   } else {
        //     this.modalParam.dir = 'ul';
        //     if ((ulfreq + ulband/2 > dlfreq - dlband/2 && ulfreq + ulband/2 < dlfreq + dlband/2) ||
        //     (ulfreq - ulband/2 > dlfreq - dlband/2 && ulfreq - ulband/2 < dlfreq + dlband/2) ) {
        //       console.log('UL與自己的DL頻率+頻段碰撞');
        //       if (isCandidate) {
        //         this.tempCalParamSet.fddUlFrequency = Number(sessionStorage.getItem('tempParam'));
        //       } else {
        //         this.bsListRfParam[svgId].fddUlFrequency = Number(sessionStorage.getItem('tempParam'));
        //       }
        //       this.matDialog.open(this.deleteModal5, { disableClose: true });
        //       return;
        //     }
        //   }
        //   for (let i = 0;i < this.defaultBSList.length;i++) {
        //     if (this.defaultBSList[i] == svgId) {
        //       continue;
        //     }
        //     let dlmax = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth)/2;
        //     let ulmax = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth)/2;
        //     let dlmin = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth)/2;
        //     let ulmin = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth)/2;
        //     if (dir == 'dl') {
        //       if (dlfreq == this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency) {
        //         console.log('continue');
        //         // continue;
        //         this.matDialog.open(this.deleteModal4, { disableClose: true });
        //         break;
        //         // 如果頻率要改成跟別人相同，頻寬也要跟別人一樣
        //       }
        //       if ((dlfreq > dlmin && dlfreq < dlmax) || (dlfreq > ulmin && dlfreq < ulmax)) {
        //         console.log('overlaped with other dl');
        //         overlaped = true;
        //       }
        //     } else {
        //       if (ulfreq == this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency) {
        //         // 如果頻率要改成跟別人相同，頻寬也要跟別人一樣
        //         this.matDialog.open(this.deleteModal4, { disableClose: true });
        //         console.log('same freq');
        //         // continue;
        //         break;
        //       }
        //       if ((ulfreq > dlmin && ulfreq < dlmax) || (ulfreq > ulmin && ulfreq < ulmax)) {
        //         console.log('overlaped with other ul');
        //         overlaped = true;
        //       }
        //     }
        //   }
        //   //若改的不是candidate的頻率，則需要再跟candidate頻率比對一次
        //   if (!isCandidate) {
        //     let dlmax = this.tempCalParamSet.fddDlFrequency + Number(this.tempCalParamSet.dlBandwidth)/2;
        //     let ulmax = this.tempCalParamSet.fddUlFrequency + Number(this.tempCalParamSet.ulBandwidth)/2;
        //     let dlmin = this.tempCalParamSet.fddDlFrequency - Number(this.tempCalParamSet.dlBandwidth)/2;
        //     let ulmin = this.tempCalParamSet.fddUlFrequency - Number(this.tempCalParamSet.ulBandwidth)/2;
        //     if (dir == 'dl') {
        //       this.modalParam.dir = 'dl';
        //       if (dlfreq == this.tempCalParamSet.fddDlFrequency) {
        //         console.log('same frequency');
        //         this.matDialog.open(this.deleteModal4, { disableClose: true });
        //         overlaped = false;
        //       } else if ((dlfreq > dlmin && dlfreq < dlmax) || (dlfreq > ulmin && dlfreq < ulmax)) {
        //         overlaped = true;
        //       }
        //     } else {
        //       this.modalParam.dir = 'ul';
        //       if (ulfreq == this.tempCalParamSet.fddUlFrequency) {
        //         console.log('same frequency');
        //         this.matDialog.open(this.deleteModal4, { disableClose: true });
        //         overlaped = false;
        //       } else if ((ulfreq > dlmin && ulfreq < dlmax) || (ulfreq > ulmin && ulfreq < ulmax)) {
        //         overlaped = true;
        //       }
        //     }
        //   }
        // }
        // if (overlaped == true) {
        //   if (isCandidate) {
        //     if (this.duplexMode == 'tdd') {
        //       this.tempCalParamSet.tddfrequency = Number(window.sessionStorage.getItem('tempParam'));
        //     } else {
        //       if (dir == 'dl') {
        //         this.tempCalParamSet.fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'));
        //       } else {
        //         this.tempCalParamSet.fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
        //       }
        //     }
        //   } else {
        //     if (this.duplexMode == 'tdd') {
        //       this.bsListRfParam[svgId].tddfrequency = Number(window.sessionStorage.getItem('tempParam'));
        //     } else {
        //       if (dir == 'dl') {
        //         this.bsListRfParam[svgId].fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'));
        //       } else {
        //         this.bsListRfParam[svgId].fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
        //       }
        //     }
        //   }
        //   // let msg = this.translateService.instant('freq_overlaped');
        //   // this.msgDialogConfig.data = {
        //   //   type: 'error',
        //   //   infoMessage: msg
        //   // };
        //   // this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        //   this.matDialog.open(this.deleteModal5, { disableClose: true });
        //   return;
        // }
    };
    SitePlanningComponent.prototype.changeWifiProtocol = function (value, isCandidate) {
        if (value == 'wifi4') {
            if (isCandidate) {
                this.tempCalParamSet.wifiBandwidth = '20';
                this.tempCalParamSet.wifiFrequency = 2412;
                this.tempCalParamSet.guardInterval = '400ns';
                this.tempCalParamSet.wifiMimo = '2x2';
            }
            else {
                this.bsListRfParam[this.svgId].wifiBandwidth = '20';
                this.bsListRfParam[this.svgId].wifiFrequency = 2412;
                this.bsListRfParam[this.svgId].guardInterval = '400ns';
                this.bsListRfParam[this.svgId].wifiMimo = '2x2';
            }
        }
        else if (value == 'wifi5') {
            if (isCandidate) {
                this.tempCalParamSet.wifiBandwidth = '40';
                this.tempCalParamSet.wifiFrequency = 5170;
                this.tempCalParamSet.guardInterval = '400ns';
                this.tempCalParamSet.wifiMimo = '2x2';
            }
            else {
                this.bsListRfParam[this.svgId].wifiBandwidth = '40';
                this.bsListRfParam[this.svgId].wifiFrequency = 5170;
                this.bsListRfParam[this.svgId].guardInterval = '400ns';
                this.bsListRfParam[this.svgId].wifiMimo = '2x2';
            }
        }
        else {
            if (isCandidate) {
                this.tempCalParamSet.wifiBandwidth = '20';
                this.tempCalParamSet.wifiFrequency = 2412;
                this.tempCalParamSet.guardInterval = '400ns';
                this.tempCalParamSet.wifiMimo = '2x2';
            }
            else {
                this.bsListRfParam[this.svgId].wifiBandwidth = '20';
                this.bsListRfParam[this.svgId].wifiFrequency = 2412;
                this.bsListRfParam[this.svgId].guardInterval = '400ns';
                this.bsListRfParam[this.svgId].wifiMimo = '2x2';
            }
        }
    };
    SitePlanningComponent.prototype.changeScs = function (value, dir, isCandidate) {
        if (value == 15) {
            if (isCandidate) {
                if (dir == 'tdd') {
                    this.tempCalParamSet.tddbandwidth = '5';
                }
                else if (dir == 'dl') {
                    this.tempCalParamSet.dlBandwidth = '5';
                }
                else {
                    this.tempCalParamSet.ulBandwidth = '5';
                }
            }
            else {
                if (dir == 'tdd') {
                    this.bsListRfParam[this.svgId].tddbandwidth = '5';
                }
                else if (dir == 'dl') {
                    this.bsListRfParam[this.svgId].dlBandwidth = '5';
                }
                else {
                    this.bsListRfParam[this.svgId].ulBandwidth = '5';
                }
            }
        }
        else if (value == 30) {
            if (isCandidate) {
                if (dir == 'tdd') {
                    this.tempCalParamSet.tddbandwidth = '5';
                }
                else if (dir == 'dl') {
                    this.tempCalParamSet.dlBandwidth = '5';
                }
                else {
                    this.tempCalParamSet.ulBandwidth = '5';
                }
            }
            else {
                if (dir == 'tdd') {
                    this.bsListRfParam[this.svgId].tddbandwidth = '5';
                }
                else if (dir == 'dl') {
                    this.bsListRfParam[this.svgId].dlBandwidth = '5';
                }
                else {
                    this.bsListRfParam[this.svgId].ulBandwidth = '5';
                }
            }
        }
        else {
            if (isCandidate) {
                if (dir == 'tdd') {
                    this.tempCalParamSet.tddbandwidth = '10';
                }
                else if (dir == 'dl') {
                    this.tempCalParamSet.dlBandwidth = '10';
                }
                else {
                    this.tempCalParamSet.ulBandwidth = '10';
                }
            }
            else {
                if (dir == 'tdd') {
                    this.bsListRfParam[this.svgId].tddbandwidth = '10';
                }
                else if (dir == 'dl') {
                    this.bsListRfParam[this.svgId].dlBandwidth = '10';
                }
                else {
                    this.bsListRfParam[this.svgId].ulBandwidth = '10';
                }
            }
        }
    };
    SitePlanningComponent.prototype.changeBandwidth = function (dir, isCandidate) {
        //   let overlaped = false;
        //   let freq = 0;
        //   let band = 0;
        //   if (this.duplexMode == 'tdd') { //TDD ---------------------------------------------------------------------------------------------------------------------------
        //     this.modalParam.dir = '';
        //     // 判斷改的是candidate還是default
        //     if (isCandidate) {
        //       this.modalParam.isCandidate = true;
        //       freq = this.tempCalParamSet.tddfrequency;
        //       band = Number(this.tempCalParamSet.tddbandwidth);
        //       console.log(`TDD Candidate: freq-${freq} band-${band}`);
        //     } else {
        //       this.modalParam.isCandidate = false;
        //       freq = this.bsListRfParam[svgId].tddfrequency;
        //       band = this.bsListRfParam[svgId].tddbandwidth;
        //       console.log(`TDD Default: freq-${freq} band-${band}`);
        //     }
        //     // 無論default還是candidate都要跟所有的defualt做比對
        //     for (let i = 0;i < this.defaultBSList.length;i++) { 
        //       if (this.defaultBSList[i] == svgId) {
        //         continue;
        //       }
        //       //若頻率不同，則檢查加上頻寬後有沒有overlap
        //       if (freq != this.bsListRfParam[this.defaultBSList[i]].tddfrequency) {
        //         let max = this.bsListRfParam[this.defaultBSList[i]].tddfrequency + Number(this.bsListRfParam[this.defaultBSList[i]].tddbandwidth)/2;
        //         let min = this.bsListRfParam[this.defaultBSList[i]].tddfrequency - Number(this.bsListRfParam[this.defaultBSList[i]].tddbandwidth)/2;
        //         // console.log(max);
        //         // console.log(min);
        //         if ((freq + band/2 > min && freq + band/2 < max) || (freq - band/2 > min && freq - band/2 < max)) {
        //           console.log(`TDD defaultId:${this.defaultBSList[i]} overlaped`);
        //           overlaped = true;
        //         }
        //       // 若有相同頻率的基地台，會詢問是否所有的頻寬都要改，否則不改
        //       } else {
        //         this.matDialog.open(this.deleteModal3, { disableClose: true });
        //         // window.sessionStorage.removeItem('tempParamForSelect');
        //         // this.matDialog.closeAll();
        //         return;
        //       }
        //     }
        //     // check candidateBs
        //     //若與candidate頻率不同，則檢查加上頻寬後有沒有overlap
        //     if (!isCandidate && !this.calculateForm.isSimulation) {
        //       if (freq != this.tempCalParamSet.tddfrequency) {
        //         let max = this.tempCalParamSet.tddfrequency + Number(this.tempCalParamSet.tddbandwidth)/2;
        //         let min = this.tempCalParamSet.tddfrequency - Number(this.tempCalParamSet.tddbandwidth)/2;
        //         if ((freq + band/2 > min && freq + band/2 < max) || (freq - band/2 > min && freq - band/2 < max)) {
        //           overlaped = true;
        //         }
        //       // 若有相同頻率的基地台，會詢問是否所有的頻寬都要改，否則不改
        //       } else {
        //         this.matDialog.open(this.deleteModal3, { disableClose: true });
        //         window.sessionStorage.removeItem('tempParamForSelect');
        //         // this.matDialog.closeAll();
        //         return;
        //       }
        //     }
        //   } else { //FDD UL or DL -----------------------------------------------------------------------------------------------------------------------------------------
        //     let dlfreq = 0;
        //     let dlband = 0;
        //     let ulfreq = 0;
        //     let ulband = 0;
        //     if (isCandidate) {
        //       this.modalParam.isCandidate = true;
        //       dlfreq = this.tempCalParamSet.fddDlFrequency;
        //       dlband = Number(this.tempCalParamSet.dlBandwidth);
        //       ulfreq = this.tempCalParamSet.fddUlFrequency;
        //       ulband = Number(this.tempCalParamSet.ulBandwidth);
        //       // this.modalParam.isCandidate = true;
        //     } else {
        //       this.modalParam.isCandidate = false;
        //       dlfreq = this.bsListRfParam[svgId].fddDlFrequency;
        //       dlband = Number(this.bsListRfParam[svgId].dlBandwidth);
        //       ulfreq = this.bsListRfParam[svgId].fddUlFrequency;
        //       ulband = Number(this.bsListRfParam[svgId].ulBandwidth);
        //       // this.modalParam.isCandidate = false;
        //     }
        //     if (dir == 'dl') {
        //       this.modalParam.dir = 'dl';
        //       //先判斷上下行改頻寬後有沒有overlap
        //       if (
        //         (dlfreq + dlband/2 > ulfreq - ulband/2 && dlfreq + dlband/2 < ulfreq + ulband/2) ||
        //         (dlfreq - dlband/2 > ulfreq - ulband/2 && dlfreq - dlband/2 < ulfreq + ulband/2)
        //       ) {
        //         console.log('DL與自己的UL頻率+頻段碰撞');
        //         if (isCandidate) {
        //           this.tempCalParamSet.dlBandwidth = sessionStorage.getItem('tempParamForSelect');
        //         } else {
        //           this.bsListRfParam[svgId].dlBandwidth = sessionStorage.getItem('tempParamForSelect');
        //         }
        //         this.matDialog.open(this.deleteModal5, { disableClose: true });
        //         window.sessionStorage.removeItem('tempParamForSelect');
        //         // this.matDialog.closeAll();
        //         return;
        //       }
        //       // 無論default還是candidate都要跟所有的defualt做比對
        //       for (let i = 0;i < this.defaultBSList.length;i++) { 
        //         if (this.defaultBSList[i] == svgId) {
        //           continue;
        //         }
        //         //若頻率不同，則檢查加上頻寬後有沒有overlap
        //         if (dlfreq != this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency) { 
        //           let max = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth)/2;
        //           let min = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth)/2;
        //           if ((dlfreq + dlband/2 > min && dlfreq + dlband/2 < max) || (dlfreq - dlband/2 > min && dlfreq - dlband/2 < max)) {
        //             overlaped = true;
        //             console.log('DL與其他defualt頻率+頻段碰撞');
        //           }
        //         // 若有相同頻率的基地台，會詢問是否所有的頻寬都要改，否則不改
        //         } else {
        //           this.matDialog.open(this.deleteModal3, { disableClose: true });
        //           console.log(`same freq with ${this.defaultBSList[i]}`);
        //           window.sessionStorage.removeItem('tempParamForSelect');
        //           // this.matDialog.closeAll();
        //           return;
        //         }
        //       }
        //       // check candidateBs
        //       //若與candidate頻率不同，則檢查加上頻寬後有沒有overlap
        //       if (!isCandidate) {
        //         if (dlfreq != this.tempCalParamSet.fddDlFrequency) {
        //           let max = this.tempCalParamSet.fddDlFrequency + Number(this.tempCalParamSet.dlBandwidth)/2;
        //           let min = this.tempCalParamSet.fddDlFrequency - Number(this.tempCalParamSet.dlBandwidth)/2;
        //           if ((dlfreq + dlband/2 > min && dlfreq + dlband/2 < max) || (dlfreq - dlband/2 > min && dlfreq - dlband/2 < max)) {
        //             overlaped = true;
        //             console.log('UL與其他defualt頻率+頻段碰撞');
        //           }
        //         // 若有相同頻率的基地台，會詢問是否所有的頻寬都要改，否則不改
        //         } else {
        //           this.matDialog.open(this.deleteModal3, { disableClose: true });
        //           window.sessionStorage.removeItem('tempParamForSelect');
        //           // this.matDialog.closeAll();
        //           return;
        //         }
        //       }
        //     } else {
        //       this.modalParam.dir = 'ul';
        //       if (
        //         (ulfreq + ulband/2 > dlfreq - dlband/2 && ulfreq + ulband/2 < dlfreq + dlband/2) ||
        //         (ulfreq - ulband/2 > dlfreq - dlband/2 && ulfreq - ulband/2 < dlfreq + dlband/2)
        //       ) {
        //         console.log('UL與自己的DL頻率+頻段碰撞');
        //         if (isCandidate) {
        //           this.tempCalParamSet.ulBandwidth = sessionStorage.getItem('tempParamForSelect');
        //         } else {
        //           this.bsListRfParam[svgId].ulBandwidth = sessionStorage.getItem('tempParamForSelect');
        //         }
        //         this.matDialog.open(this.deleteModal5, { disableClose: true });
        //         window.sessionStorage.removeItem('tempParamForSelect');
        //         // this.matDialog.closeAll();
        //         return;
        //       }
        //       // 無論default還是candidate都要跟所有的defualt做比對
        //       for (let i = 0;i < this.defaultBSList.length;i++) { 
        //         if (this.defaultBSList[i] == svgId) {
        //           continue;
        //         }
        //         //若頻率不同，則檢查加上頻寬後有沒有overlap
        //         if (ulfreq != this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency) {
        //           let max = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth)/2;
        //           let min = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth)/2;
        //           if ((ulfreq + ulband/2 > min && ulfreq + ulband/2 < max) || (ulfreq - ulband/2 > min && ulfreq - ulband/2 < max)) {
        //             overlaped = true;
        //           }
        //         // 若有相同頻率的基地台，會詢問是否所有的頻寬都要改，否則不改
        //         } else {
        //           this.matDialog.open(this.deleteModal3, { disableClose: true });
        //           window.sessionStorage.removeItem('tempParamForSelect');
        //           // this.matDialog.closeAll();
        //           return;
        //         }
        //       }
        //       // check candidateBs
        //       //若與candidate頻率不同，則檢查加上頻寬後有沒有overlap
        //       if (!isCandidate) {
        //         if (ulfreq != this.tempCalParamSet.fddUlFrequency) {
        //           let max = this.tempCalParamSet.fddUlFrequency + Number(this.tempCalParamSet.ulBandwidth)/2;
        //           let min = this.tempCalParamSet.fddUlFrequency - Number(this.tempCalParamSet.ulBandwidth)/2;
        //           if ((ulfreq + ulband/2 > min && ulfreq + ulband/2 < max) || (ulfreq - ulband/2 > min && ulfreq - ulband/2 < max)) {
        //             overlaped = true;
        //           }
        //         // 若有相同頻率的基地台，會詢問是否所有的頻寬都要改，否則不改
        //         } else {
        //           this.matDialog.open(this.deleteModal3, { disableClose: true });
        //           window.sessionStorage.removeItem('tempParamForSelect');
        //           // this.matDialog.closeAll();
        //           return;
        //         }
        //       }
        //     }
        //   }
        //   if (overlaped == true) {
        //     let msg = this.translateService.instant('freq_overlaped');
        //     this.msgDialogConfig.data = {
        //       type: 'error',
        //       infoMessage: msg
        //     };
        //     // this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        //     this.matDialog.open(this.deleteModal5, { disableClose: true });
        //     // window.sessionStorage.removeItem('tempParamForSelect');
        //     // this.matDialog.closeAll()
        //     return;
        //   }
        //   window.sessionStorage.removeItem('tempParamForSelect');
    };
    //FOR changeFrequency
    //如果要改成其他基地台有的"頻率"，"頻寬"也要跟其他人一致
    // applyAllSameFrequency(dlul, isCandidate) { 
    //   if (this.duplexMode == 'tdd') { //TDD
    //     if (isCandidate) {
    //       let freq = this.tempCalParamSet.tddfrequency;
    //       for (let i = 0;i < this.defaultBSList.length;i++) {
    //         if (freq == this.bsListRfParam[this.defaultBSList[i]].tddfrequency) {
    //           this.tempCalParamSet.tddbandwidth = this.bsListRfParam[this.defaultBSList[i]].tddbandwidth;
    //           break;
    //         }
    //       }
    //     } else {
    //       let freq = this.bsListRfParam[this.svgId].tddfrequency;
    //       for (let i = 0;i < this.defaultBSList.length;i++) {
    //         if (this.defaultBSList[i] == this.svgId) {
    //           continue;
    //         }
    //         if (freq == this.bsListRfParam[this.defaultBSList[i]].tddfrequency) {
    //           this.bsListRfParam[this.svgId].tddbandwidth = this.bsListRfParam[this.defaultBSList[i]].tddbandwidth;
    //         }
    //       }
    //       if (freq == this.tempCalParamSet.tddfrequency) {
    //         console.log('default Bs changes tddBandwidth');
    //         this.bsListRfParam[this.svgId].tddbandwidth = this.tempCalParamSet.tddbandwidth;
    //       }
    //     }
    //   } else { //FDD
    //     if (isCandidate) {
    //       if (dlul == 'dl') {
    //         let dlfreq = this.tempCalParamSet.fddDlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (dlfreq == this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency) {
    //             this.tempCalParamSet.dlBandwidth = this.bsListRfParam[this.defaultBSList[i]].dlBandwidth;
    //             break;
    //           }
    //         }
    //       } else {
    //         let ulfreq = this.tempCalParamSet.fddUlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (ulfreq == this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency) {
    //             this.tempCalParamSet.ulBandwidth = this.bsListRfParam[this.defaultBSList[i]].ulBandwidth;
    //             break;
    //           }
    //         }
    //       }
    //     } else {
    //       if (dlul == 'dl') {
    //         let dlfreq = this.bsListRfParam[this.svgId].fddDlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (this.defaultBSList[i] == this.svgId) {
    //             continue;
    //           }
    //           if (dlfreq == this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency) {
    //             this.bsListRfParam[this.svgId].dlBandwidth = this.bsListRfParam[this.defaultBSList[i]].dlBandwidth;
    //           }
    //         }
    //         if (dlfreq == this.tempCalParamSet.fddDlFrequency) {
    //           this.bsListRfParam[this.svgId].dlBandwidth = this.tempCalParamSet.dlBandwidth;
    //         }
    //       } else {
    //         let ulfreq = this.bsListRfParam[this.svgId].fddUlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (this.defaultBSList[i] == this.svgId) {
    //             continue;
    //           }
    //           if (ulfreq == this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency) {
    //             this.bsListRfParam[this.svgId].ulBandwidth = this.bsListRfParam[this.defaultBSList[i]].ulBandwidth;
    //           }
    //         }
    //         if (ulfreq == this.tempCalParamSet.fddUlFrequency) {
    //           this.bsListRfParam[this.svgId].ulBandwidth = this.tempCalParamSet.ulBandwidth;
    //         }
    //       }
    //     }
    //   }
    //   this.matDialog.closeAll();
    // }
    //FOR changeFrequency
    // notApplyAllSameFrequency(dlul, isCandidate) {
    //   if (this.duplexMode == 'tdd') {
    //     if (isCandidate) {
    //       this.tempCalParamSet.tddfrequency = Number(window.sessionStorage.getItem('tempParam'));
    //       window.sessionStorage.removeItem('tempParam');
    //     } else {
    //       this.bsListRfParam[this.svgId].tddfrequency = Number(window.sessionStorage.getItem('tempParam'));
    //       window.sessionStorage.removeItem('tempParam');
    //     }
    //   } else {
    //     if (dlul == 'dl') {
    //       if (isCandidate) {
    //         this.tempCalParamSet.fddDlFrequency =  Number(window.sessionStorage.getItem('tempParam'));
    //         window.sessionStorage.removeItem('tempParam');
    //       } else {
    //         this.bsListRfParam[this.svgId].fddDlFrequency =  Number(window.sessionStorage.getItem('tempParam'));
    //         window.sessionStorage.removeItem('tempParam');
    //       }
    //     } else {
    //       if (isCandidate) {
    //         this.tempCalParamSet.fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
    //         window.sessionStorage.removeItem('tempParam');
    //       } else {
    //         this.bsListRfParam[this.svgId].fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'));
    //         window.sessionStorage.removeItem('tempParam');
    //       }
    //     }
    //   }
    //   this.matDialog.closeAll();
    // }
    //FOR changeBandwidth
    //如果場域內有其他基地台的"頻率"一致，"頻寬"全部都要改
    // applyAllSameBandwidth(dir,isCandidate) {
    //   // console.log(this.svgId);
    //   // TDD
    //   if (this.duplexMode == 'tdd') {
    //     if (isCandidate) {
    //       let band = this.tempCalParamSet.tddbandwidth;
    //       let freq = this.tempCalParamSet.tddfrequency;
    //       for (let i = 0;i < this.defaultBSList.length;i++) {
    //         if (freq == this.bsListRfParam[this.defaultBSList[i]].tddfrequency) {
    //           this.bsListRfParam[this.defaultBSList[i]].tddbandwidth = band;
    //         }
    //       }
    //     } else {
    //       let band = this.bsListRfParam[this.svgId].tddbandwidth;
    //       let freq = this.bsListRfParam[this.svgId].tddfrequency;
    //       for (let i = 0;i < this.defaultBSList.length;i++) {
    //         if (this.defaultBSList[i] == this.svgId) {
    //           continue;
    //         }
    //         if (freq == this.bsListRfParam[this.defaultBSList[i]].tddfrequency) {
    //           this.bsListRfParam[this.defaultBSList[i]].tddbandwidth = band;
    //         }
    //       }
    //       if (freq == this.tempCalParamSet.tddfrequency) {
    //         this.tempCalParamSet.tddbandwidth = band;
    //       }
    //     }
    //   //FDD
    //   } else { 
    //     if (isCandidate) {
    //       if (dir == 'dl') {
    //         let dlband = this.tempCalParamSet.dlBandwidth;
    //         let dlfreq = this.tempCalParamSet.fddDlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (dlfreq == this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency) {
    //             this.bsListRfParam[this.defaultBSList[i]].dlBandwidth = dlband;
    //           }
    //         }
    //       } else {
    //         let ulband = this.tempCalParamSet.ulBandwidth;
    //         let ulfreq = this.tempCalParamSet.fddUlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (ulfreq == this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency) {
    //             this.bsListRfParam[this.defaultBSList[i]].ulBandwidth = ulband;
    //           }
    //         }
    //       }
    //     } else {
    //       if (dir == 'dl') {
    //         let dlband = this.bsListRfParam[this.svgId].dlBandwidth;
    //         let dlfreq = this.bsListRfParam[this.svgId].fddDlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (this.defaultBSList[i] == this.svgId) {
    //             continue;
    //           }
    //           if (dlfreq == this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency) {
    //             this.bsListRfParam[this.defaultBSList[i]].dlBandwidth = dlband;
    //           }
    //         }
    //         if (dlfreq == this.tempCalParamSet.fddDlFrequency) {
    //           this.tempCalParamSet.dlBandwidth = dlband;
    //         }
    //       } else {
    //         let ulband = this.bsListRfParam[this.svgId].ulBandwidth;
    //         let ulfreq = this.bsListRfParam[this.svgId].fddUlFrequency;
    //         for (let i = 0;i < this.defaultBSList.length;i++) {
    //           if (this.defaultBSList[i] == this.svgId) {
    //             continue;
    //           }
    //           if (ulfreq == this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency) {
    //             this.bsListRfParam[this.defaultBSList[i]].ulBandwidth = ulband;
    //           }
    //         }
    //         if (ulfreq == this.tempCalParamSet.fddUlFrequency) {
    //           this.tempCalParamSet.ulBandwidth = ulband;
    //         }
    //       }
    //     }
    //   }
    //   this.matDialog.closeAll();
    //   window.sessionStorage.removeItem('tempParamForSelect');
    // }
    //FOR changeBandwidth
    // notApplySameBandwidth(dir,isCandidate) {
    //   if (this.duplexMode == 'tdd') {
    //     if (isCandidate) {
    //       this.tempCalParamSet.tddbandwidth = window.sessionStorage.getItem('tempParamForSelect');
    //       window.sessionStorage.removeItem('tempParamForSelect');
    //     } else {
    //       this.bsListRfParam[this.svgId].tddbandwidth = Number(window.sessionStorage.getItem('tempParamForSelect'));
    //       window.sessionStorage.removeItem('tempParamForSelect');
    //     }
    //   } else {
    //     if (dir == 'dl') {
    //       if (isCandidate) {
    //         this.tempCalParamSet.dlBandwidth =  window.sessionStorage.getItem('tempParamForSelect');
    //         window.sessionStorage.removeItem('tempParamForSelect');
    //       } else {
    //         this.bsListRfParam[this.svgId].dlBandwidth =  Number(window.sessionStorage.getItem('tempParamForSelect'));
    //         window.sessionStorage.removeItem('tempParamForSelect');
    //       }
    //     } else {
    //       if (isCandidate) {
    //         this.tempCalParamSet.ulBandwidth = window.sessionStorage.getItem('tempParamForSelect');
    //         window.sessionStorage.removeItem('tempParamForSelect');
    //       } else {
    //         this.bsListRfParam[this.svgId].ulBandwidth = Number(window.sessionStorage.getItem('tempParamForSelect'));
    //         window.sessionStorage.removeItem('tempParamForSelect');
    //       }
    //     }
    //   }
    //   this.matDialog.closeAll();
    // }
    SitePlanningComponent.prototype.recoverParam = function (svgId, type) {
        // console.log(`svgId: ${svgId}`);
        // console.log(`type: ${type}`);
        if (type == 'x') {
            this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
        }
        else if (type == 'y') {
            this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
        }
        else if (type == 'rotate') {
            this.dragObject[svgId].rotate = Number(window.sessionStorage.getItem('tempParam'));
        }
        else if (type == 'width') {
            this.dragObject[svgId].width = Number(window.sessionStorage.getItem('tempParam'));
            this.changeSize(svgId, 'width', false);
        }
        else if (type == 'height') {
            this.dragObject[svgId].height = Number(window.sessionStorage.getItem('tempParam'));
            this.changeSize(svgId, 'height', false);
        }
        else if (type == 'z') {
            this.dragObject[svgId].z = Number(window.sessionStorage.getItem('tempParam'));
        }
        else if (type == 'altitude') {
            this.dragObject[svgId].altitude = Number(window.sessionStorage.getItem('tempParam'));
        }
    };
    /**
     * 變更物件位置
     * @param svgId 物件id
     */
    SitePlanningComponent.prototype.changePosition = function (type, svgId) {
        var _this = this;
        // 先進行檢查，數字不可為負數，且不可超過場域長寬
        var isOb = (svgId.split('_')[0] != 'UE' && svgId.split('_')[0] != 'defaultBS' && svgId.split('_')[0] != 'candidate') ? true : false;
        if (type != 'y') {
            // if (type == 'x') {
            // console.log(typeof this.calculateForm.width);
            if (!isOb) {
                if (Number(this.dragObject[svgId].x) < 0 || Number(this.dragObject[svgId].x) > Number(this.calculateForm.width)) {
                    // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
                    this.recoverParam(svgId, type);
                    var msg = this.translateService.instant('x_greater_then_field_width');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                    return;
                }
            }
            else {
                var isRotate = (this.dragObject[svgId].rotate == 0) ? false : true;
                console.log("rotate: " + isRotate);
                var width = 0;
                if (isRotate) {
                    var angle = Number(this.dragObject[svgId].rotate % 360);
                    var obWid = Number(this.dragObject[svgId].width);
                    var obHei = Number(this.dragObject[svgId].height);
                    var deg = 2 * Math.PI / 360;
                    var x = Number(this.dragObject[svgId].x);
                    var y = Number(this.dragObject[svgId].y);
                    if (angle < 0) {
                        angle += 360;
                    }
                    ;
                    if (svgId.split('_')[0] == 'rect') {
                        var tempAngle = 360 - angle;
                        var rcc = [x + obWid / 2, y + obHei / 2];
                        var leftbot = [x, y];
                        var lefttop = [x, y + obHei];
                        var rightbot = [x + obWid, y];
                        var righttop = [x + obWid, y + obHei];
                        var rotleftbot = [
                            (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotlefttop = [
                            (lefttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (lefttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (lefttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (lefttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrightbot = [
                            (rightbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (rightbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (rightbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (rightbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrighttop = [
                            (righttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (righttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (righttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (righttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var maxX = Math.max(rotleftbot[0], rotlefttop[0], rotrightbot[0], rotrighttop[0]);
                        var minX = Math.min(rotleftbot[0], rotlefttop[0], rotrightbot[0], rotrighttop[0]);
                        if (minX.toString().length > 10) {
                            minX = 0;
                        }
                        console.log(maxX);
                        console.log(minX);
                        if (maxX > this.calculateForm.width || minX < 0) {
                            // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
                            this.recoverParam(svgId, type);
                            var msg = this.translateService.instant('x_greater_then_field_width');
                            this.msgDialogConfig.data = {
                                type: 'error',
                                infoMessage: msg
                            };
                            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                            return;
                        }
                    }
                    else if (svgId.split('_')[0] == 'polygon') {
                        var tempAngle = 360 - angle;
                        var rcc = [x + obWid / 2, y + obHei / 2];
                        var top_3 = [x + obWid / 2, y + obHei];
                        var left = [x, y];
                        var right = [x + obWid, y];
                        var rotTop = [
                            (top_3[0] - rcc[0]) * Math.cos(tempAngle * deg) - (top_3[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (top_3[0] - rcc[0]) * Math.sin(tempAngle * deg) + (top_3[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotLeft = [
                            (left[0] - rcc[0]) * Math.cos(tempAngle * deg) - (left[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (left[0] - rcc[0]) * Math.sin(tempAngle * deg) + (left[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotRight = [
                            (right[0] - rcc[0]) * Math.cos(tempAngle * deg) - (right[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (right[0] - rcc[0]) * Math.sin(tempAngle * deg) + (right[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var maxX = Math.max(rotTop[0], rotLeft[0], rotRight[0]);
                        var minX = Math.min(rotTop[0], rotLeft[0], rotRight[0]);
                        if (minX.toString().length > 10) {
                            minX = 0;
                        }
                        if (maxX > this.calculateForm.width || minX < 0) {
                            // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
                            this.recoverParam(svgId, type);
                            var msg = this.translateService.instant('x_greater_then_field_width');
                            this.msgDialogConfig.data = {
                                type: 'error',
                                infoMessage: msg
                            };
                            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                            return;
                        }
                    }
                    else if (svgId.split('_')[0] == 'trapezoid') {
                        var tempAngle = 360 - angle;
                        var rcc = [x + obWid / 2, y + obHei / 2];
                        var leftbot = [x, y];
                        var lefttop = [x + obWid / 4, y + obHei];
                        var rightbot = [x + obWid, y];
                        var righttop = [x + (3 * obWid / 4), y + obHei];
                        var rotleftbot = [
                            (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotlefttop = [
                            (lefttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (lefttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (lefttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (lefttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrightbot = [
                            (rightbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (rightbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (rightbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (rightbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrighttop = [
                            (righttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (righttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (righttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (righttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var maxX = Math.max(rotleftbot[0], rotlefttop[0], rotrightbot[0], rotrighttop[0]);
                        var minX = Math.min(rotleftbot[0], rotlefttop[0], rotrightbot[0], rotrighttop[0]);
                        if (minX.toString().length > 10) {
                            minX = 0;
                        }
                        if (maxX > this.calculateForm.width || minX < 0) {
                            // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
                            this.recoverParam(svgId, type);
                            var msg = this.translateService.instant('x_greater_then_field_width');
                            this.msgDialogConfig.data = {
                                type: 'error',
                                infoMessage: msg
                            };
                            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                            return;
                        }
                    }
                    // else if (svgId.split('_')[0] == 'ellipse') {}
                }
                else {
                    console.log(Number(this.dragObject[svgId].width));
                    console.log(Number(this.dragObject[svgId].x));
                    console.log(Number(this.calculateForm.width));
                    width = Number(this.dragObject[svgId].width);
                    if (width + Number(this.dragObject[svgId].x) > Number(this.calculateForm.width) || Number(this.dragObject[svgId].x) < 0) {
                        // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
                        this.recoverParam(svgId, type);
                        var msg = this.translateService.instant('x_greater_then_field_width');
                        this.msgDialogConfig.data = {
                            type: 'error',
                            infoMessage: msg
                        };
                        this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                        return;
                    }
                }
            }
        }
        if (type != 'x') { // Y coordination
            // } else { // Y coordination
            if (!isOb) {
                if (Number(this.dragObject[svgId].y) < 0 || Number(this.dragObject[svgId].y) > Number(this.calculateForm.height)) {
                    // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
                    this.recoverParam(svgId, type);
                    var msg = this.translateService.instant('y_greater_then_field_height');
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: msg
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                    return;
                }
            }
            else {
                var isRotate = (this.dragObject[svgId].rotate == 0) ? false : true;
                console.log("rotate: " + isRotate);
                var height = 0;
                if (isRotate) {
                    var angle = Number(this.dragObject[svgId].rotate % 360);
                    var obWid = Number(this.dragObject[svgId].width);
                    var obHei = Number(this.dragObject[svgId].height);
                    var deg = 2 * Math.PI / 360;
                    var x = Number(this.dragObject[svgId].x);
                    var y = Number(this.dragObject[svgId].y);
                    if (svgId.split('_')[0] == 'rect') {
                        var tempAngle = 360 - angle;
                        var rcc = [x + obWid / 2, y + obHei / 2];
                        var leftbot = [x, y];
                        var lefttop = [x, y + obHei];
                        var rightbot = [x + obWid, y];
                        var righttop = [x + obWid, y + obHei];
                        var rotleftbot = [
                            (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotlefttop = [
                            (lefttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (lefttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (lefttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (lefttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrightbot = [
                            (rightbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (rightbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (rightbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (rightbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrighttop = [
                            (righttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (righttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (righttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (righttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var maxY = Math.max(rotleftbot[1], rotlefttop[1], rotrightbot[1], rotrighttop[1]);
                        var minY = Math.min(rotleftbot[1], rotlefttop[1], rotrightbot[1], rotrighttop[1]);
                        if (minY.toString().length > 10) {
                            minY = 0;
                        }
                        if (maxY > this.calculateForm.height || minY < 0) {
                            // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
                            this.recoverParam(svgId, type);
                            var msg = this.translateService.instant('y_greater_then_field_height');
                            this.msgDialogConfig.data = {
                                type: 'error',
                                infoMessage: msg
                            };
                            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                            return;
                        }
                    }
                    else if (svgId.split('_')[0] == 'polygon') {
                        var tempAngle = 360 - angle;
                        var rcc = [x + obWid / 2, y + obHei / 2];
                        var top_4 = [x + obWid / 2, y + obHei];
                        var left = [x, y];
                        var right = [x + obWid, y];
                        var rotTop = [
                            (top_4[0] - rcc[0]) * Math.cos(tempAngle * deg) - (top_4[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (top_4[0] - rcc[0]) * Math.sin(tempAngle * deg) + (top_4[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotLeft = [
                            (left[0] - rcc[0]) * Math.cos(tempAngle * deg) - (left[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (left[0] - rcc[0]) * Math.sin(tempAngle * deg) + (left[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotRight = [
                            (right[0] - rcc[0]) * Math.cos(tempAngle * deg) - (right[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (right[0] - rcc[0]) * Math.sin(tempAngle * deg) + (right[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        // console.log(rotTop);
                        // console.log(rotLeft);
                        // console.log(rotRight);
                        var maxY = Math.max(rotTop[1], rotLeft[1], rotRight[1]);
                        var minY = Math.min(rotTop[1], rotLeft[1], rotRight[1]);
                        if (minY.toString().length > 10) {
                            minY = 0;
                        }
                        if (maxY > this.calculateForm.height || minY < 0) {
                            // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
                            this.recoverParam(svgId, type);
                            var msg = this.translateService.instant('y_greater_then_field_height');
                            this.msgDialogConfig.data = {
                                type: 'error',
                                infoMessage: msg
                            };
                            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                            return;
                        }
                    }
                    else if (svgId.split('_')[0] == 'trapezoid') {
                        var tempAngle = 360 - angle;
                        var rcc = [x + obWid / 2, y + obHei / 2];
                        var leftbot = [x, y];
                        var lefttop = [x + obWid / 4, y + obHei];
                        var rightbot = [x + obWid, y];
                        var righttop = [x + (3 * obWid / 4), y + obHei];
                        var rotleftbot = [
                            (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotlefttop = [
                            (lefttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (lefttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (lefttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (lefttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrightbot = [
                            (rightbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (rightbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (rightbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (rightbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var rotrighttop = [
                            (righttop[0] - rcc[0]) * Math.cos(tempAngle * deg) - (righttop[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
                            (righttop[0] - rcc[0]) * Math.sin(tempAngle * deg) + (righttop[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
                        ];
                        var maxY = Math.max(rotleftbot[1], rotlefttop[1], rotrightbot[1], rotrighttop[1]);
                        var minY = Math.min(rotleftbot[1], rotlefttop[1], rotrightbot[1], rotrighttop[1]);
                        if (minY.toString().length > 10) {
                            minY = 0;
                        }
                        if (maxY > this.calculateForm.height || minY < 0) {
                            // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
                            this.recoverParam(svgId, type);
                            var msg = this.translateService.instant('y_greater_then_field_height');
                            this.msgDialogConfig.data = {
                                type: 'error',
                                infoMessage: msg
                            };
                            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                            return;
                        }
                    }
                    // else if (svgId.split('_')[0] == 'ellipse') {}
                }
                else {
                    height = Number(this.dragObject[svgId].height);
                    if (height + Number(this.dragObject[svgId].y) > Number(this.calculateForm.height) || Number(this.dragObject[svgId].y) < 0) {
                        // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
                        this.recoverParam(svgId, type);
                        var msg = this.translateService.instant('y_greater_then_field_height');
                        this.msgDialogConfig.data = {
                            type: 'error',
                            infoMessage: msg
                        };
                        this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                        return;
                    }
                }
            }
        }
        // 0713 Xean修改
        this.spanStyle[svgId].left = this.pixelXLinear(this.dragObject[svgId].x) + "px";
        if (this.dragObject[svgId].type === 'obstacle') {
            this.spanStyle[svgId].top = this.chartHeight - this.pixelYLinear(this.dragObject[svgId].height) - this.pixelYLinear(this.dragObject[svgId].y) + "px";
            this.spanStyle[svgId].opacity = 0;
            // 障礙物先還原角度，移動後再轉動
            this.spanStyle[svgId]['transform'] = "rotate(0deg)";
            // 延遲轉角度，讓位置正確
            window.setTimeout(function () {
                _this.spanStyle[svgId]['transform'] = "rotate(" + _this.dragObject[svgId].rotate + "deg)";
                _this.spanStyle[svgId].opacity = 1;
            }, 0);
        }
        else if (this.dragObject[svgId].type === 'UE') {
            this.spanStyle[svgId].top = this.chartHeight - this.ueHeight - this.pixelYLinear(this.dragObject[svgId].y) + "px";
        }
        else if (this.dragObject[svgId].type === 'candidate') {
            this.spanStyle[svgId].top = this.chartHeight - this.candidateHeight - this.pixelYLinear(this.dragObject[svgId].y) + "px";
        }
        else if (this.dragObject[svgId].type === 'defaultBS') {
            this.spanStyle[svgId].top = this.chartHeight - 30 - this.pixelYLinear(this.dragObject[svgId].y) + "px";
        }
        if (this.dragObject[svgId].type === 'defaultBS' || this.dragObject[svgId].type === 'candidate') {
            this.moveNumber(svgId);
        }
        // this.setTransform(this.target);
        // this.moveClick(svgId);
    };
    /**
     * 變更物件角度
     * @param svgId 物件id
     */
    SitePlanningComponent.prototype.changeRotate = function (svgId) {
        this.svgId = svgId;
        this.target = document.querySelector("#" + svgId);
        this.frame.set('transform', 'rotate', this.dragObject[svgId].rotate + "deg");
        // 初始化物件
        this.changePosition('rotate', svgId);
        this.moveClick(svgId);
        this.setTransform(this.target);
    };
    /**
     * 清除全部物件
     * @param type 物件類別
     */
    SitePlanningComponent.prototype.clearAll = function (type) {
        if (type === 'obstacle') {
            this.obstacleList.length = 0;
        }
        else if (type === 'defaultBS') {
            this.defaultBSList.length = 0;
        }
        else if (type === 'candidate') {
            this.candidateList.length = 0;
        }
        else if (type === 'UE') {
            this.ueList.length = 0;
        }
        else if (type === 'bsAndCand') {
            this.defaultBSList.length = 0;
            this.candidateList.length = 0;
        }
    };
    /**
     * 切換tdd fdd 4G 5G時補上參數
     * @param type 物件類別
     */
    SitePlanningComponent.prototype.changeProtoOrDuplex = function () {
        var msg = this.translateService.instant('switch_duplex_hint');
        this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: msg
        };
        this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
    };
    /**
     * View 3D
     */
    SitePlanningComponent.prototype.view3D = function () {
        var defaultBS = [];
        for (var _i = 0, _a = this.defaultBSList; _i < _a.length; _i++) {
            var item = _a[_i];
            defaultBS.push(this.dragObject[item]);
        }
        var candidate = [];
        for (var _b = 0, _c = this.candidateList; _b < _c.length; _b++) {
            var item = _c[_b];
            candidate.push(this.dragObject[item]);
        }
        var obstacle = [];
        for (var _d = 0, _e = this.obstacleList; _d < _e.length; _d++) {
            var item = _e[_d];
            obstacle.push(this.dragObject[item]);
        }
        console.log(obstacle);
        var ue = [];
        for (var _f = 0, _g = this.ueList; _f < _g.length; _f++) {
            var item = _g[_f];
            ue.push(this.dragObject[item]);
        }
        this.view3dDialogConfig.data = {
            calculateForm: this.calculateForm,
            obstacleList: obstacle,
            defaultBSList: defaultBS,
            candidateList: candidate,
            ueList: ue,
            zValue: this.zValues,
            result: this.hstOutput
        };
        this.matDialog.open(view3d_component_1.View3dComponent, this.view3dDialogConfig);
        // 不知為何，只開一次dialog位置會偏移
        this.matDialog.closeAll();
        this.matDialog.open(view3d_component_1.View3dComponent, this.view3dDialogConfig);
    };
    /** export xlsx */
    SitePlanningComponent.prototype["export"] = function () {
        /* generate worksheet */
        // map
        var wb = XLSX.utils.book_new();
        var maxLength = 32767;
        // console.log("calculateForm.mapImage,",this.calculateForm.mapImage);
        var mapData = [
            ['image', 'imageName', 'width', 'height', 'altitude', 'protocol', 'mapLayer'],
            [
                this.calculateForm.mapImage,
                this.calculateForm.mapName,
                this.calculateForm.width,
                this.calculateForm.height,
                this.calculateForm.altitude,
                this.calculateForm.objectiveIndex,
                this.zValues[0]
            ]
        ];
        if (this.zValues.length > 1) {
            for (var i_1 = 1; i_1 < this.zValues.length; i_1++) {
                mapData.push([
                    '', '', '', '', '', '', this.zValues[i_1]
                ]);
            }
        }
        if (!(this.calculateForm.mapImage == null)) {
            if (this.calculateForm.mapImage.length >= maxLength) {
                var splitTimes = parseInt((this.calculateForm.mapImage.length / maxLength) + "") + 1;
                console.log("exceed", maxLength, ", splitTimes:", splitTimes);
                for (var i_2 = 1; i_2 < splitTimes; i_2++) {
                    if (i_2 < mapData.length) {
                        console.log("i:", i_2, "maxLength*(i-1)", maxLength * (i_2 - 1), "maxLength*i", maxLength * i_2);
                        mapData[i_2][0] = this.calculateForm.mapImage.substring(maxLength * (i_2 - 1), maxLength * i_2);
                    }
                    else {
                        mapData.push([
                            this.calculateForm.mapImage.substring(maxLength * (i_2 - 1), maxLength * i_2), '', '', '', '', '', ''
                        ]);
                    }
                }
                // 切割完剩下的最後一塊
                mapData.push([
                    this.calculateForm.mapImage.substring(maxLength * (splitTimes - 1), this.calculateForm.mapImage.length), '', '', '', '', '', ''
                ]);
                console.log("mapData.length", mapData.length);
            }
        }
        var ws = XLSX.utils.aoa_to_sheet(mapData);
        XLSX.utils.book_append_sheet(wb, ws, 'map');
        // defaultBS
        var baseStationData = [['x', 'y', 'z', 'material', 'color', 'txpower', 'beamId', 'tddfrequency', 'tddbandwidth',
                'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
                '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
                'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers',
                'wifiProtocol', 'guardInterval', 'wifiMimo', 'wifiBandwidth', 'wifiFrequency',
                'bsTxGain', 'bsNoiseFigure', 'AntennaId', 'theta', 'phi']];
        for (var _i = 0, _a = this.defaultBSList; _i < _a.length; _i++) {
            var item = _a[_i];
            baseStationData.push([
                this.dragObject[item].x, this.dragObject[item].y,
                this.dragObject[item].altitude, '', '',
                // this.dragObject[item].color,
                this.bsListRfParam[item].txpower,
                this.bsListRfParam[item].beampattern,
                // this.bsListRfParam[item].frequency,
                //4g 5g tdd
                this.bsListRfParam[item].tddfrequency,
                this.bsListRfParam[item].tddbandwidth,
                //4g 5g fdd
                this.bsListRfParam[item].dlBandwidth,
                this.bsListRfParam[item].ulBandwidth,
                this.bsListRfParam[item].fddDlFrequency,
                this.bsListRfParam[item].fddUlFrequency,
                //4g only
                this.bsListRfParam[item].mimoNumber4G,
                //5g only
                this.bsListRfParam[item].tddscs,
                this.bsListRfParam[item].dlModulationCodScheme,
                this.bsListRfParam[item].ulModulationCodScheme,
                this.bsListRfParam[item].dlMimoLayer,
                this.bsListRfParam[item].ulMimoLayer,
                //5g fdd only
                this.bsListRfParam[item].dlScs,
                this.bsListRfParam[item].ulScs,
                //wifi
                this.bsListRfParam[item].wifiProtocol,
                this.bsListRfParam[item].guardInterval,
                this.bsListRfParam[item].wifiMimo,
                this.bsListRfParam[item].wifiBandwidth,
                this.bsListRfParam[item].wifiFrequency,
                this.bsListRfParam[item].bsTxGain,
                this.bsListRfParam[item].bsNoiseFigure,
                this.bsListRfParam[item].AntennaId,
                this.bsListRfParam[item].theta,
                this.bsListRfParam[item].phi
            ]);
        }
        var baseStationWS = XLSX.utils.aoa_to_sheet(baseStationData);
        XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');
        // candidate
        var candidateData = [['x', 'y', 'z', 'material', 'color',
                'tddfrequency', 'tddbandwidth',
                'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
                '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
                'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers',
                'wifiProtocol', 'guardInterval', 'wifiMimo', 'wifiBandwidth', 'wifiFrequency',
                'bsTxGain', 'bsNoiseFigure', 'AntennaId', 'theta', 'phi']];
        for (var _b = 0, _c = this.candidateList; _b < _c.length; _b++) {
            var item = _c[_b];
            candidateData.push([
                this.dragObject[item].x, this.dragObject[item].y,
                this.dragObject[item].altitude, '', '',
                // this.dragObject[item].color,
                //4g 5g tdd
                this.tempCalParamSet.tddfrequency,
                this.tempCalParamSet.tddbandwidth,
                // this.bsListRfParam[item].tddfrequency,
                // this.bsListRfParam[item].tddbandwidth,
                //4g 5g fdd
                this.tempCalParamSet.dlBandwidth,
                this.tempCalParamSet.ulBandwidth,
                this.tempCalParamSet.fddDlFrequency,
                this.tempCalParamSet.fddUlFrequency,
                //4g only
                this.tempCalParamSet.mimoNumber4G,
                //5g only
                this.tempCalParamSet.tddscs,
                this.tempCalParamSet.dlModulationCodScheme,
                this.tempCalParamSet.ulModulationCodScheme,
                this.tempCalParamSet.dlMimoLayer,
                this.tempCalParamSet.ulMimoLayer,
                //5g fdd only
                this.tempCalParamSet.dlScs,
                this.tempCalParamSet.ulScs,
                //wifi
                this.tempCalParamSet.wifiProtocol,
                this.tempCalParamSet.guardInterval,
                this.tempCalParamSet.wifiMimo,
                this.tempCalParamSet.wifiBandwidth,
                this.tempCalParamSet.wifiFrequency,
                this.tempCalParamSet.bsTxGain,
                this.tempCalParamSet.bsNoiseFigure,
                this.tempCalParamSet.AntennaId,
                this.tempCalParamSet.theta,
                this.tempCalParamSet.phi
            ]);
        }
        var candidateWS = XLSX.utils.aoa_to_sheet(candidateData);
        XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
        // UE
        var ueData = [['x', 'y', 'z', 'ueRxGain']];
        for (var _d = 0, _e = this.ueList; _d < _e.length; _d++) {
            var item = _e[_d];
            ueData.push([
                this.dragObject[item].x, this.dragObject[item].y,
                this.dragObject[item].z,
                this.ueListParam[item].ueRxGain
                // this.dragObject[item].material,
                // this.dragObject[item].color
            ]);
        }
        var ueWS = XLSX.utils.aoa_to_sheet(ueData);
        XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
        // obstacle
        var obstacleData = [['x', 'y', 'z', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
        for (var _f = 0, _g = this.obstacleList; _f < _g.length; _f++) {
            var item = _g[_f];
            var shape = this.parseElement(this.dragObject[item].element);
            obstacleData.push([
                this.dragObject[item].x, this.dragObject[item].y, this.dragObject[item].z,
                this.dragObject[item].width, this.dragObject[item].height,
                this.dragObject[item].altitude, this.dragObject[item].rotate,
                this.dragObject[item].material, this.dragObject[item].color,
                shape
            ]);
        }
        var obstacleWS = XLSX.utils.aoa_to_sheet(obstacleData);
        XLSX.utils.book_append_sheet(wb, obstacleWS, 'obstacle');
        // bs parameters
        var bsData = [];
        if (this.calculateForm.isSimulation) {
            bsData = [
                ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
                    'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
                [
                    this.calculateForm.powerMaxRange, this.calculateForm.powerMinRange,
                    this.calculateForm.objectiveIndex, this.duplexMode, this.dlRatio,
                    false, false, false, false, false
                ]
            ];
        }
        else {
            bsData = [
                ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
                    'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
                [
                    this.calculateForm.powerMaxRange, this.calculateForm.powerMinRange,
                    this.calculateForm.objectiveIndex, this.duplexMode, this.dlRatio,
                    this.calculateForm.isAverageSinr, this.calculateForm.isCoverage,
                    this.calculateForm.isUeAvgSinr,
                    this.calculateForm.isUeAvgThroughput, this.calculateForm.isUeCoverage
                ]
            ];
        }
        var bsWS = XLSX.utils.aoa_to_sheet(bsData);
        XLSX.utils.book_append_sheet(wb, bsWS, 'bs parameters');
        // algorithm parameters
        if (!(Number(this.calculateForm.maxConnectionNum) > 0)) {
            this.calculateForm.maxConnectionNum = 32;
        }
        if (!(Number(this.calculateForm.resolution) > 0)) {
            this.calculateForm['resolution'] = 1;
        }
        if (this.authService.isEmpty(this.calculateForm.geographicalNorth)) {
            this.calculateForm['geographicalNorth'] = 0;
        }
        var algorithmData = [
            // ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel','maxConnectionNum'],
            ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate',
                'pathLossModel', 'maxConnectionNum', 'resolution', 'geographicalNorth'],
            [
                this.calculateForm.crossover, this.calculateForm.mutation,
                this.calculateForm.iteration, this.calculateForm.seed,
                // 1, this.calculateForm.useUeCoordinate, this.calculateForm.pathLossModelId,
                1, this.calculateForm.useUeCoordinate, this.calculateForm.pathLossModelId,
                this.calculateForm.maxConnectionNum, this.calculateForm.resolution, this.calculateForm.geographicalNorth
            ]
        ];
        var algorithmWS = XLSX.utils.aoa_to_sheet(algorithmData);
        XLSX.utils.book_append_sheet(wb, algorithmWS, 'algorithm parameters');
        // objective parameters
        var spec;
        if (this.calculateForm.objectiveIndex == '0') {
            spec = '4G';
        }
        else if (this.calculateForm.objectiveIndex == '1') {
            spec = '5G';
        }
        else {
            spec = 'wifi';
        }
        var objectiveData = [
            ['objective', 'objectiveStopCondition', 'newBsNum', 'isBsOptm'],
            [spec, '', this.calculateForm.availableNewBsNumber, this.isBsNumberOptimization]
        ];
        var objectiveWS = XLSX.utils.aoa_to_sheet(objectiveData);
        XLSX.utils.book_append_sheet(wb, objectiveWS, 'objective parameters');
        // MutilFunction Setting
        var mutilFunctionSettingData = [['PlanningIndex',
                'Field.coverage.active', 'Field.sinr.active', 'Field.rsrp.active', 'Field.throughput.active',
                'ue.coverage.active', 'ue.throughputbyrsrp.active',
                'Field.sinr.length', 'Field.rsrp.length', 'Field.throughput.length',
                'ue.throughputbyrsrp.length']];
        mutilFunctionSettingData.push([
            this.planningIndex,
            String(this.evaluationFuncForm.field.coverage.activate),
            String(this.evaluationFuncForm.field.sinr.activate),
            String(this.evaluationFuncForm.field.rsrp.activate),
            String(this.evaluationFuncForm.field.throughput.activate),
            String(this.evaluationFuncForm.ue.coverage.activate),
            String(this.evaluationFuncForm.ue.throughputByRsrp.activate),
            String(this.evaluationFuncForm.field.sinr.ratio.length),
            String(this.evaluationFuncForm.field.rsrp.ratio.length),
            String(this.evaluationFuncForm.field.throughput.ratio.length),
            String(this.evaluationFuncForm.ue.throughputByRsrp.ratio.length),
        ]);
        var mutilFunctionSettingWS = XLSX.utils.aoa_to_sheet(mutilFunctionSettingData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionSettingWS, 'mutil function setting');
        // MutilFunction Coverage
        var mutilFunctionCoverageData = [['Field.coverage.ratio']];
        mutilFunctionCoverageData.push([String(this.evaluationFuncForm.field.coverage.ratio)]);
        var mutilFunctionCoverageWS = XLSX.utils.aoa_to_sheet(mutilFunctionCoverageData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionCoverageWS, 'mutil function coverage');
        // MutilFunction SINR
        var mutilFunctionSINRData = [['Field.sinr.areaRatio', 'Field.sinr.compliance', 'Field.sinr.value']];
        for (var i = 0; i < this.evaluationFuncForm.field.sinr.ratio.length; i++) {
            mutilFunctionSINRData.push([
                String(this.evaluationFuncForm.field.sinr.ratio[i].areaRatio),
                String(this.evaluationFuncForm.field.sinr.ratio[i].compliance),
                String(this.evaluationFuncForm.field.sinr.ratio[i].value)
            ]);
        }
        var mutilFunctionSINRWS = XLSX.utils.aoa_to_sheet(mutilFunctionSINRData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionSINRWS, 'mutil function sinr');
        // MutilFunction RSRP
        var mutilFunctionRSRPData = [['Field.rsrp.areaRatio', 'Field.rsrp.compliance', 'Field.rsrp.value']];
        for (var i = 0; i < this.evaluationFuncForm.field.rsrp.ratio.length; i++) {
            mutilFunctionRSRPData.push([
                String(this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio),
                String(this.evaluationFuncForm.field.rsrp.ratio[i].compliance),
                String(this.evaluationFuncForm.field.rsrp.ratio[i].value)
            ]);
        }
        var mutilFunctionRSRPWS = XLSX.utils.aoa_to_sheet(mutilFunctionRSRPData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionRSRPWS, 'mutil function rsrp');
        // MutilFunction Throughput
        var mutilFunctionThroughputData = [['Field.throughput.areaRatio', 'Field.throughput.compliance', 'Field.throughput.ULValue', 'Field.throughput.DLValue']];
        for (var i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++) {
            mutilFunctionThroughputData.push([
                String(this.evaluationFuncForm.field.throughput.ratio[i].areaRatio),
                String(this.evaluationFuncForm.field.throughput.ratio[i].compliance),
                String(this.evaluationFuncForm.field.throughput.ratio[i].ULValue),
                String(this.evaluationFuncForm.field.throughput.ratio[i].DLValue)
            ]);
        }
        var mutilFunctionThroughputWS = XLSX.utils.aoa_to_sheet(mutilFunctionThroughputData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionThroughputWS, 'mutil function throughput');
        // MutilFunction UE Coverage
        var mutilFunctionUECoverageData = [['ue.coverage.ratio']];
        mutilFunctionUECoverageData.push([
            String(this.evaluationFuncForm.ue.coverage.ratio)
        ]);
        var mutilFunctionUECoverageWS = XLSX.utils.aoa_to_sheet(mutilFunctionUECoverageData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionUECoverageWS, 'mutil function UE coverage');
        // MutilFunction UE Throughput
        var mutilFunctionUEThroughputData = [['ue.throughputbyrsrp.countRatio', 'ue.throughputbyrsrp.compliance', 'ue.throughputbyrsrp.value']];
        for (var i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++) {
            mutilFunctionUEThroughputData.push([
                String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio),
                String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].compliance),
                String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue),
                String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue)
            ]);
        }
        var mutilFunctionUEThroughputWS = XLSX.utils.aoa_to_sheet(mutilFunctionUEThroughputData);
        XLSX.utils.book_append_sheet(wb, mutilFunctionUEThroughputWS, 'mutil function UE throughput');
        // console.log(wb);
        /* save to file */
        XLSX.writeFile(wb, "" + this.calculateForm.taskName);
    };
    /**
     * 匯入xlsx
     * @param event file
     */
    SitePlanningComponent.prototype["import"] = function (event) {
        var _this = this;
        /* wire up file reader */
        var target = (event.target);
        if (target.files.length !== 1) {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.translateService.instant('mutil.import.file.fault')
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            throw new Error('Cannot use multiple files');
        }
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            /* read workbook */
            var bstr = e.target.result;
            // const name = file.name.substring(0, file.name.lastIndexOf('.'));
            var name = file.name;
            sessionStorage.setItem('taskName', name);
            _this.readXls(bstr);
            event.target.value = ''; // 清空
        };
        reader.readAsBinaryString(target.files[0]);
    };
    /**
     * Read xlsx
     * @param result Reader result
     */
    SitePlanningComponent.prototype.readXls = function (result) {
        try {
            this.obstacleList.length = 0;
            this.defaultBSList.length = 0;
            this.candidateList.length = 0;
            this.ueList.length = 0;
            this.calculateForm = new CalculateForm_1.CalculateForm();
            this.calculateForm.taskName = sessionStorage.getItem('taskName');
            this.wb = XLSX.read(result, { type: 'binary' });
            if (this.wb.SheetNames[0] == 'map') {
                /* map sheet */
                var map = this.wb.SheetNames[0]; //第0個工作表名稱
                var mapWS = this.wb.Sheets[map]; //map工作表內容
                var mapData_1 = (XLSX.utils.sheet_to_json(mapWS, { header: 1 })); //轉成array
                /*
                  mapData = [
                    ['image', 'imageName', ...]
                    ['data:image/...', 'EGATRON3F.png', ...]
                    ['','', ,,, , 2.1]
                  ]
                  0對應column name, 1+對應data
                */
                try {
                    this.calculateForm.mapImage = '';
                    var keyMap_1 = {};
                    Object.keys(mapData_1[0]).forEach(function (key) {
                        keyMap_1[mapData_1[0][key]] = key; // keymap = image:"0", imageName:"1" ...
                    });
                    this.zValues.length = 0;
                    for (var i = 1; i < mapData_1.length; i++) {
                        this.calculateForm.mapImage += mapData_1[i][0];
                        if (typeof mapData_1[i][keyMap_1['mapLayer']] !== 'undefined') {
                            if (mapData_1[i][keyMap_1['mapLayer']] !== '') {
                                this.zValues.push(mapData_1[i][keyMap_1['mapLayer']]);
                            }
                        }
                    }
                    this.calculateForm.width = mapData_1[1][keyMap_1['width']];
                    this.calculateForm.height = mapData_1[1][keyMap_1['height']];
                    this.calculateForm.altitude = mapData_1[1][keyMap_1['altitude']];
                    // mapName or imageName
                    if (typeof mapData_1[1][keyMap_1['mapName']] === 'undefined') {
                        this.calculateForm.mapName = mapData_1[1][keyMap_1['imageName']];
                    }
                    else {
                        this.calculateForm.mapName = mapData_1[1][keyMap_1['mapName']];
                    }
                    // excel無protocol時預設wifi
                    if (typeof mapData_1[1][keyMap_1['protocol']] === 'undefined') {
                        this.calculateForm.objectiveIndex = '2';
                    }
                    else {
                        if (mapData_1[1][keyMap_1['protocol']] === '0' || mapData_1[1][keyMap_1['protocol']] === '4G') {
                            this.calculateForm.objectiveIndex = '0';
                        }
                        else if (mapData_1[1][keyMap_1['protocol']] === '1' || mapData_1[1][keyMap_1['protocol']] === '5G') {
                            this.calculateForm.objectiveIndex = '1';
                        }
                        else if (mapData_1[1][keyMap_1['protocol']] === '2' || mapData_1[1][keyMap_1['protocol']] === 'wifi') {
                            this.calculateForm.objectiveIndex = '2';
                        }
                    }
                    this.initData(true, false, '');
                }
                catch (error) {
                    console.log(error);
                    // fail xlsx
                    this.msgDialogConfig.data = {
                        type: 'error',
                        infoMessage: this.translateService.instant('xlxs.fail')
                    };
                    this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                }
            }
            else {
                this.msgDialogConfig.data = {
                    type: 'error',
                    infoMessage: this.translateService.instant('xlxs.fail')
                };
                this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            }
        }
        catch (error) {
            console.log(error);
            // fail xlsx
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.translateService.instant('xlxs.fail')
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
    };
    /**
     * 載入匯入物件
     */
    SitePlanningComponent.prototype.setImportData = function () {
        this.obstacleList.length = 0;
        this.defaultBSList.length = 0;
        this.candidateList.length = 0;
        this.ueList.length = 0;
        try {
            var materialReg = new RegExp('[0-4]');
            /* base station sheet */
            var sheetNameIndex = {};
            for (var i_3 = 0; i_3 < this.wb.SheetNames.length; i_3++) {
                sheetNameIndex[this.wb.SheetNames[i_3]] = i_3;
            }
            var baseStation = this.wb.SheetNames[sheetNameIndex['base_station']];
            var baseStationWS = this.wb.Sheets[baseStation];
            var baseStationData = (XLSX.utils.sheet_to_json(baseStationWS, { header: 1 }));
            if (baseStationData.length > 1) {
                // this.planningIndex = '3';
                for (var i_4 = 1; i_4 < baseStationData.length; i_4++) {
                    var id = "defaultBS_" + (i_4 - 1);
                    // let material = (typeof baseStationData[i][3] === 'undefined' ? '0' : baseStationData[i][3]);
                    // 不在清單內，指定為木頭
                    // if (!materialReg.test(material)) {
                    // material = '0';
                    // }
                    // const color = (typeof baseStationData[i][4] === 'undefined' ? this.DEFAULT_BS_COLOR : baseStationData[i][4]);
                    this.dragObject[id] = {
                        x: baseStationData[i_4][0],
                        y: baseStationData[i_4][1],
                        z: baseStationData[i_4][2],
                        width: this.xLinear(30),
                        height: this.yLinear(30),
                        altitude: baseStationData[i_4][2],
                        rotate: 0,
                        title: this.svgMap['defaultBS'].title,
                        type: this.svgMap['defaultBS'].type,
                        color: this.DEFAULT_BS_COLOR,
                        // material: material,
                        element: this.svgMap['defaultBS'].element
                    };
                    if (this.dragObject[id].altitude > this.calculateForm.altitude) {
                        this.dragObject[id].altitude = this.calculateForm.altitude;
                    }
                    // RF parameter import
                    var offset = 2;
                    var bsTxGain = 0;
                    var bsNoiseFigure = 0;
                    var AntennaId = 1;
                    var theta = 0;
                    var phi = 0;
                    if (Object.values(baseStationData[0]).includes("bsTxGain")) {
                        bsTxGain = baseStationData[i_4][24 + offset];
                    }
                    if (Object.values(baseStationData[0]).includes("bsNoiseFigure")) {
                        bsNoiseFigure = baseStationData[i_4][25 + offset];
                    }
                    if (Object.values(baseStationData[0]).includes("AntennaId")) {
                        AntennaId = baseStationData[i_4][26 + offset];
                    }
                    if (Object.values(baseStationData[0]).includes("theta")) {
                        theta = baseStationData[i_4][27 + offset];
                    }
                    if (Object.values(baseStationData[0]).includes("phi")) {
                        phi = baseStationData[i_4][28 + offset];
                    }
                    this.bsListRfParam[id] = {
                        txpower: baseStationData[i_4][3 + offset],
                        beampattern: baseStationData[i_4][4 + offset],
                        tddfrequency: baseStationData[i_4][5 + offset],
                        tddbandwidth: baseStationData[i_4][6 + offset],
                        dlBandwidth: baseStationData[i_4][7 + offset],
                        ulBandwidth: baseStationData[i_4][8 + offset],
                        fddDlFrequency: baseStationData[i_4][9 + offset],
                        fddUlFrequency: baseStationData[i_4][10 + offset],
                        mimoNumber4G: baseStationData[i_4][11 + offset],
                        tddscs: baseStationData[i_4][12 + offset],
                        dlModulationCodScheme: baseStationData[i_4][13 + offset],
                        ulModulationCodScheme: baseStationData[i_4][14 + offset],
                        dlMimoLayer: baseStationData[i_4][15 + offset],
                        ulMimoLayer: baseStationData[i_4][16 + offset],
                        dlScs: baseStationData[i_4][17 + offset],
                        ulScs: baseStationData[i_4][18 + offset],
                        wifiProtocol: baseStationData[i_4][19 + offset],
                        guardInterval: baseStationData[i_4][20 + offset],
                        wifiMimo: baseStationData[i_4][21 + offset],
                        wifiBandwidth: baseStationData[i_4][22 + offset],
                        wifiFrequency: baseStationData[i_4][23 + offset],
                        bsTxGain: bsTxGain,
                        bsNoiseFigure: bsNoiseFigure,
                        AntennaId: AntennaId,
                        theta: theta,
                        phi: phi
                    };
                    this.defaultBSList.push(id);
                    // set 既有基站位置
                    // this.setDefaultBsSize(id);
                }
            }
            /* candidate sheet */
            var candidate = this.wb.SheetNames[sheetNameIndex['candidate']];
            var candidateWS = this.wb.Sheets[candidate];
            var candidateData = (XLSX.utils.sheet_to_json(candidateWS, { header: 1 }));
            if (candidateData.length > 1) {
                this.planningIndex = '1'; //if there is any candidate, planning index should be 1 or 2
                for (var i_5 = 1; i_5 < candidateData.length; i_5++) {
                    var id = "candidate_" + (i_5 - 1);
                    this.candidateList.push(id);
                    // let material = (typeof candidateData[i][3] === 'undefined' ? '0' : candidateData[i][3]);
                    // if (!materialReg.test(material)) {
                    // material = '0';
                    // }
                    // const color = (typeof candidateData[i][4] === 'undefined' ? this.CANDIDATE_COLOR : candidateData[i][4]);
                    this.dragObject[id] = {
                        x: candidateData[i_5][0],
                        y: candidateData[i_5][1],
                        z: candidateData[i_5][2],
                        width: this.xLinear(this.candidateWidth),
                        height: this.yLinear(this.candidateHeight),
                        altitude: candidateData[i_5][2],
                        rotate: 0,
                        title: this.svgMap['candidate'].title,
                        type: this.svgMap['candidate'].type,
                        color: this.DEFAULT_BS_COLOR,
                        // material: material,
                        element: this.svgMap['candidate'].element
                    };
                    if (this.dragObject[id].altitude > this.calculateForm.altitude) {
                        this.dragObject[id].altitude = this.calculateForm.altitude;
                    }
                    // this.bsListRfParam[id] = {
                    //   tddfrequency: candidateData[i][5],
                    //   tddbandwidth: candidateData[i][6],
                    //   dlBandwidth: candidateData[i][7],
                    //   ulBandwidth: candidateData[i][8],
                    //   fddDlFrequency: candidateData[i][9],
                    //   fddUlFrequency: candidateData[i][10],
                    //   mimoNumber4G: candidateData[i][11],
                    //   tddscs: candidateData[i][12],
                    //   dlModulationCodScheme: candidateData[i][13],
                    //   ulModulationCodScheme: candidateData[i][14],
                    //   dlMimoLayer: candidateData[i][15],
                    //   ulMimoLayer: candidateData[i][16],
                    //   dlScs: candidateData[i][17],
                    //   ulScs: candidateData[i][18],
                    // };
                    var offset = 2;
                    this.tempCalParamSet.tddfrequency = candidateData[i_5][3 + offset];
                    this.tempCalParamSet.tddbandwidth = candidateData[i_5][4 + offset];
                    this.tempCalParamSet.dlBandwidth = candidateData[i_5][5 + offset];
                    this.tempCalParamSet.ulBandwidth = candidateData[i_5][6 + offset];
                    this.tempCalParamSet.fddDlFrequency = candidateData[i_5][7 + offset];
                    this.tempCalParamSet.fddUlFrequency = candidateData[i_5][8 + offset];
                    this.tempCalParamSet.mimoNumber4G = candidateData[i_5][9 + offset];
                    this.tempCalParamSet.tddscs = candidateData[i_5][10 + offset];
                    this.tempCalParamSet.dlModulationCodScheme = candidateData[i_5][11 + offset];
                    this.tempCalParamSet.ulModulationCodScheme = candidateData[i_5][12 + offset];
                    this.tempCalParamSet.dlMimoLayer = candidateData[i_5][13 + offset];
                    this.tempCalParamSet.ulMimoLayer = candidateData[i_5][14 + offset];
                    this.tempCalParamSet.dlScs = candidateData[i_5][15 + offset];
                    this.tempCalParamSet.ulScs = candidateData[i_5][16 + offset];
                    this.tempCalParamSet.wifiProtocol = candidateData[i_5][17 + offset];
                    this.tempCalParamSet.guardInterval = candidateData[i_5][18 + offset];
                    this.tempCalParamSet.wifiMimo = candidateData[i_5][19 + offset];
                    this.tempCalParamSet.wifiBandwidth = candidateData[i_5][20 + offset];
                    this.tempCalParamSet.wifiFrequency = candidateData[i_5][21 + offset];
                    var bsTxGain = 0;
                    var bsNoiseFigure = 0;
                    var AntennaId = 1;
                    var theta = 0;
                    var phi = 0;
                    if (Object.values(candidateData[0]).includes("bsTxGain")) {
                        bsTxGain = candidateData[i_5][22 + offset];
                    }
                    if (Object.values(candidateData[0]).includes("bsNoiseFigure")) {
                        bsNoiseFigure = candidateData[i_5][23 + offset];
                    }
                    if (Object.values(candidateData[0]).includes("AntennaId")) {
                        AntennaId = candidateData[i_5][24 + offset];
                    }
                    if (Object.values(candidateData[0]).includes("theta")) {
                        theta = candidateData[i_5][25 + offset];
                    }
                    if (Object.values(candidateData[0]).includes("phi")) {
                        phi = candidateData[i_5][26 + offset];
                    }
                    this.tempCalParamSet.bsTxGain = bsTxGain;
                    this.tempCalParamSet.bsNoiseFigure = bsNoiseFigure;
                    this.tempCalParamSet.AntennaId = AntennaId;
                    this.tempCalParamSet.theta = theta;
                    this.tempCalParamSet.phi = phi;
                    // set UE位置
                    // this.setCandidateSize(id);
                    // RF parameter import
                    // this.bsListRfParam[id] = {
                    //   txpower: baseStationData[i][5],
                    //   beampattern: baseStationData[i][6],
                    //   tddfrequency: baseStationData[i][7],
                    //   tddbandwidth: baseStationData[i][8],
                    //   dlBandwidth: baseStationData[i][9],
                    //   ulBandwidth: baseStationData[i][10],
                    //   fddDlFrequency: baseStationData[i][11],
                    //   fddUlFrequency: baseStationData[i][12],
                    //   mimoNumber4G: baseStationData[i][13],
                    //   tddscs: baseStationData[i][14],
                    //   dlModulationCodScheme: baseStationData[i][15],
                    //   ulModulationCodScheme: baseStationData[i][16],
                    //   dlMimoLayer: baseStationData[i][17],
                    //   ulMimoLayer: baseStationData[i][18],
                    //   dlScs: baseStationData[i][19],
                    //   ulScs: baseStationData[i][20],
                    // };
                }
            }
            else {
                this.planningIndex = '3';
            }
            /* UE sheet */
            var ue = this.wb.SheetNames[sheetNameIndex['ue']];
            if (typeof ue !== 'undefined') {
                var ueWS = this.wb.Sheets[ue];
                var ueData = (XLSX.utils.sheet_to_json(ueWS, { header: 1 }));
                if (ueData.length > 1) {
                    for (var i_6 = 1; i_6 < ueData.length; i_6++) {
                        if (typeof ueData[i_6][0] === 'undefined') {
                            continue;
                        }
                        var id = "UE_" + (i_6 - 1);
                        this.ueList.push(id);
                        var material = (typeof ueData[i_6][3] === 'undefined' ? '0' : ueData[i_6][3]);
                        if (!materialReg.test(material)) {
                            material = '0';
                        }
                        var color = (typeof ueData[i_6][4] === 'undefined' ? this.UE_COLOR : ueData[i_6][4]);
                        this.dragObject[id] = {
                            x: ueData[i_6][0],
                            y: ueData[i_6][1],
                            z: ueData[i_6][2],
                            width: this.xLinear(this.ueWidth),
                            height: this.yLinear(this.ueHeight),
                            altitude: ueData[i_6][2],
                            rotate: 0,
                            title: this.svgMap['UE'].title,
                            type: this.svgMap['UE'].type,
                            color: color,
                            material: material,
                            element: this.svgMap['UE'].element
                        };
                        if (Object.values(ueData[0]).includes("ueRxGain")) {
                            //新增欄位
                            var ueRxGain = ueData[i_6][3];
                        }
                        else {
                            var ueRxGain = 0;
                        }
                        this.ueListParam[id] = {
                            ueRxGain: ueRxGain
                        };
                        // set UE位置
                        // this.setUeSize(id);
                    }
                }
            }
            /* obstacle sheet */
            var obstacle = this.wb.SheetNames[sheetNameIndex['obstacle']];
            var obstacleWS = this.wb.Sheets[obstacle];
            var obstacleData = (XLSX.utils.sheet_to_json(obstacleWS, { header: 1 }));
            // console.log("obstacle sheet obstacleData",obstacleData);
            if (obstacleData.length > 1) {
                for (var i_7 = 1; i_7 < obstacleData.length; i_7++) {
                    if (obstacleData[i_7].length === 0) {
                        continue;
                    }
                    var id = void 0;
                    var type = void 0;
                    var diff = Object.keys(obstacleData[i_7]).length - 10; //因應版本不同,欄位長度不同
                    var shape = this.parseElement(obstacleData[i_7][9 + diff]);
                    if (shape === 'rect' || Number(shape) === 0) {
                        id = "rect_" + this.generateString(10);
                        type = 'rect';
                    }
                    else if (shape === 'ellipse' || Number(shape) === 2) {
                        id = "ellipse_" + this.generateString(10);
                        type = 'ellipse';
                    }
                    else if (shape === 'polygon' || Number(shape) === 1) {
                        id = "polygon_" + this.generateString(10);
                        type = 'polygon';
                    }
                    else if (shape === 'trapezoid' || Number(shape) === 3) {
                        id = "trapezoid_" + this.generateString(10);
                        type = 'trapezoid';
                    }
                    else {
                        // default
                        shape = '0';
                        id = "rect_" + this.generateString(10);
                        type = 'rect';
                    }
                    var material = (typeof obstacleData[i_7][7 + diff] === 'undefined' ? '0' : obstacleData[i_7][7 + diff].toString());
                    // if (!materialReg.test(material)) {
                    //   material = '0';
                    // }
                    if (!(obstacleData[i_7][7 + diff] in this.materialIdToIndex)) {
                        if (Number(obstacleData[i_7][7 + diff]) < this.materialList.length) {
                            material = this.materialList[Number(obstacleData[i_7][7 + diff])]['id'];
                        }
                        else {
                            material = this.materialList[0]['id'];
                        }
                    }
                    else {
                        var index = this.materialIdToIndex[obstacleData[i_7][7 + diff]];
                        material = this.materialList[index]['id'];
                    }
                    var color = (typeof obstacleData[i_7][8 + diff] === 'undefined' ? this.OBSTACLE_COLOR : obstacleData[i_7][8 + diff]);
                    var zValue = obstacleData[i_7][2 + diff];
                    if (diff == -1) {
                        zValue = 0;
                    }
                    var materialName = '';
                    if (this.authService.lang == 'zh-TW') {
                        materialName = this.materialList[this.materialIdToIndex[material]]['chineseName'];
                    }
                    else {
                        materialName = this.materialList[this.materialIdToIndex[material]]['name'];
                    }
                    this.dragObject[id] = {
                        x: obstacleData[i_7][0],
                        y: obstacleData[i_7][1],
                        z: zValue,
                        width: obstacleData[i_7][3 + diff],
                        height: obstacleData[i_7][4 + diff],
                        altitude: obstacleData[i_7][5 + diff],
                        rotate: (typeof obstacleData[i_7][6 + diff] === 'undefined' ? 0 : obstacleData[i_7][6 + diff]),
                        title: this.svgMap[type].title,
                        type: this.svgMap[type].type,
                        color: color,
                        material: material,
                        element: shape,
                        materialName: materialName
                    };
                    if (this.dragObject[id].altitude > this.calculateForm.altitude) {
                        this.dragObject[id].altitude = this.calculateForm.altitude;
                    }
                    // set 障礙物尺寸與位置
                    // this.setObstacleSize(id);
                    this.obstacleList.push(id);
                }
            }
            /* bs parameters sheet */
            var bsParameters = this.wb.SheetNames[sheetNameIndex['bs parameters']];
            var bsParametersWS = this.wb.Sheets[bsParameters];
            var bsParametersData = (XLSX.utils.sheet_to_json(bsParametersWS, { header: 1 }));
            if (bsParametersData.length > 1) {
                this.calculateForm.powerMaxRange = Number(bsParametersData[1][0]);
                this.calculateForm.powerMinRange = Number(bsParametersData[1][1]);
                this.calculateForm.objectiveIndex = bsParametersData[1][2];
                this.duplexMode = bsParametersData[1][3];
                this.dlRatio = Number(bsParametersData[1][4]);
                this.calculateForm.isAverageSinr = JSON.parse(bsParametersData[1][5]);
                this.calculateForm.isCoverage = JSON.parse(bsParametersData[1][6]);
                this.calculateForm.isAvgThroughput = JSON.parse(bsParametersData[1][7]);
                this.calculateForm.isUeAvgSinr = JSON.parse(bsParametersData[1][7]);
                this.calculateForm.isUeAvgThroughput = JSON.parse(bsParametersData[1][8]);
                this.calculateForm.isUeCoverage = JSON.parse(bsParametersData[1][9]);
                if (this.calculateForm.isCoverage == true) {
                    // this.calculateForm.isUeAvgThroughput = false;
                    // this.calculateForm.isUeCoverage = false;
                    this.evaluationFuncForm.field.coverage.activate = true;
                    this.evaluationFuncForm.field.sinr.activate = false;
                    this.evaluationFuncForm.field.rsrp.activate = false;
                    this.evaluationFuncForm.field.throughput.activate = false;
                    this.evaluationFuncForm.ue.coverage.activate = false;
                    this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
                }
                if (this.calculateForm.isAvgThroughput == true) {
                    // this.calculateForm.isCoverage = false;
                    // this.calculateForm.isUeCoverage = false;
                    this.evaluationFuncForm.field.throughput.activate = true;
                    this.evaluationFuncForm.field.sinr.activate = false;
                    this.evaluationFuncForm.field.rsrp.activate = false;
                    this.evaluationFuncForm.field.coverage.activate = false;
                    this.evaluationFuncForm.ue.coverage.activate = false;
                    this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
                    if (this.evaluationFuncForm.field.throughput.ratio.length == 0)
                        this.addThroughput();
                }
                if (this.calculateForm.isAverageSinr == true) {
                    // this.calculateForm.isCoverage = false;
                    // this.calculateForm.isUeCoverage = false;
                    this.evaluationFuncForm.field.sinr.activate = true;
                    this.evaluationFuncForm.field.throughput.activate = false;
                    this.evaluationFuncForm.field.rsrp.activate = false;
                    this.evaluationFuncForm.field.coverage.activate = false;
                    this.evaluationFuncForm.ue.coverage.activate = false;
                    this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
                    if (this.evaluationFuncForm.field.sinr.ratio.length == 0)
                        this.addSINR();
                }
                if (this.calculateForm.isUeAvgThroughput == true) {
                    // this.calculateForm.isCoverage = false;
                    // this.calculateForm.isUeCoverage = false;
                    this.evaluationFuncForm.ue.throughputByRsrp.activate = true;
                    this.evaluationFuncForm.field.sinr.activate = false;
                    this.evaluationFuncForm.field.throughput.activate = false;
                    this.evaluationFuncForm.field.rsrp.activate = false;
                    this.evaluationFuncForm.field.coverage.activate = false;
                    this.evaluationFuncForm.ue.coverage.activate = false;
                    if (this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
                        this.addUEThroughput();
                }
                if (this.calculateForm.isUeCoverage == true) {
                    // this.calculateForm.isCoverage = false;
                    // this.calculateForm.isUeCoverage = false;
                    this.evaluationFuncForm.ue.coverage.activate = true;
                    this.evaluationFuncForm.field.sinr.activate = false;
                    this.evaluationFuncForm.field.throughput.activate = false;
                    this.evaluationFuncForm.field.rsrp.activate = false;
                    this.evaluationFuncForm.field.coverage.activate = false;
                    this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
                }
                if (this.calculateForm.isAverageSinr || this.calculateForm.isCoverage) {
                    this.planningIndex = '1';
                }
                else if (this.calculateForm.isUeAvgSinr || this.calculateForm.isUeAvgThroughput || this.calculateForm.isUeCoverage) {
                    this.planningIndex = '2';
                }
                else {
                    this.planningIndex = '3';
                }
                console.log(this.calculateForm);
                // this.calculateForm.beamMaxId = Number(bsParametersData[1][2]);
                // this.calculateForm.beamMinId = Number(bsParametersData[1][3]);
                // this.calculateForm.bandwidth = bsParametersData[1][4];
                // this.calculateForm.frequency = bsParametersData[1][5];
                // this.calculateForm.bandwidth = Number(bsParametersData[1][4]);
                // this.calculateForm.frequency = Number(bsParametersData[1][5]);
            }
            /* algorithm parameters sheet */
            var algorithmParameters = this.wb.SheetNames[sheetNameIndex['algorithm parameters']];
            var algorithmParametersWS = this.wb.Sheets[algorithmParameters];
            var algorithmParametersData = (XLSX.utils.sheet_to_json(algorithmParametersWS, { header: 1 }));
            if (algorithmParametersData.length > 1) {
                this.calculateForm.crossover = Number(algorithmParametersData[1][0]);
                this.calculateForm.mutation = Number(algorithmParametersData[1][1]);
                this.calculateForm.iteration = Number(algorithmParametersData[1][2]);
                this.calculateForm.seed = Number(algorithmParametersData[1][3]);
                // this.calculateForm.computeRound = Number(algorithmParametersData[1][4]);
                this.calculateForm.useUeCoordinate = Number(algorithmParametersData[1][5]);
                this.calculateForm.pathLossModelId = Number(algorithmParametersData[1][6]);
                // this.calculateForm.maxConnectionNum = Number(algorithmParametersData[1][7]);
                if (!(this.calculateForm.pathLossModelId in this.modelIdToIndex)) {
                    if (this.calculateForm.pathLossModelId < this.modelList.length) {
                        this.calculateForm.pathLossModelId = this.modelList[this.calculateForm.pathLossModelId]['id'];
                    }
                    else {
                        this.calculateForm.pathLossModelId = this.modelList[0]['id'];
                    }
                }
                this.calculateForm.maxConnectionNum = Number(algorithmParametersData[1][7]);
                if (!(Number(this.calculateForm.maxConnectionNum) > 0)) {
                    this.calculateForm.maxConnectionNum = 32;
                }
                this.calculateForm.resolution = Number(algorithmParametersData[1][8]);
                if (!(Number(this.calculateForm.resolution) > 0)) {
                    this.calculateForm['resolution'] = 1;
                }
                this.calculateForm.geographicalNorth = Number(algorithmParametersData[1][9]);
                if (this.authService.isEmpty(this.calculateForm.geographicalNorth) || isNaN(this.calculateForm.geographicalNorth)) {
                    this.calculateForm['geographicalNorth'] = 0;
                }
            }
            /* objective parameters sheet */
            var objectiveParameters = this.wb.SheetNames[sheetNameIndex['objective parameters']];
            var objectiveParametersWS = this.wb.Sheets[objectiveParameters];
            var objectiveParametersData = (XLSX.utils.sheet_to_json(objectiveParametersWS, { header: 1 }));
            if (objectiveParametersData.length > 1) {
                this.calculateForm.availableNewBsNumber = Number(objectiveParametersData[1][2]);
                if (objectiveParametersData[1][3] != null) {
                    this.isBsNumberOptimization = objectiveParametersData[1][3];
                    if (this.isBsNumberOptimization != 'default' && this.isBsNumberOptimization != 'custom') {
                        this.isBsNumberOptimization = 'custom';
                    }
                }
                else
                    this.isBsNumberOptimization = 'custom';
                this.changeBsNumOpti();
            }
            if (this.calculateForm.objectiveIndex === '2') {
                // 切換到2.4Ghz
                if (Number(Number(this.calculateForm.bandwidth) >= 20)) {
                    this.wifiFrequency = '1';
                }
                this.changeWifiFrequency();
            }
            else if (this.calculateForm.objectiveIndex === '1') {
                // 5G set子載波間距
                this.setSubcarrier();
            }
            this.ognSpanStyle = _.cloneDeep(this.spanStyle);
            this.ognDragObject = _.cloneDeep(this.dragObject);
            /* Mutil Function sheets */
            if (this.wb.SheetNames.length >= 9) // new format
             {
                var mutilFunctionSetting = this.wb.SheetNames[sheetNameIndex['mutil function setting']];
                var mutilFunctionSettingWS = this.wb.Sheets[mutilFunctionSetting];
                var mutilFunctionSettingData = (XLSX.utils.sheet_to_json(mutilFunctionSettingWS, { header: 1 }));
                if (mutilFunctionSettingData.length > 1) {
                    this.planningIndex = mutilFunctionSettingData[1][0];
                    if (this.planningIndex = '0') {
                        this.planningIndex = '1';
                    }
                    console.log("mutilFunctionSettingData[1][1]: " + mutilFunctionSettingData[1][1]);
                    console.log("b-mutilFunctionSettingData[1][1]: " + JSON.parse(mutilFunctionSettingData[1][1]));
                    this.evaluationFuncForm.field.coverage.activate = JSON.parse(mutilFunctionSettingData[1][1]);
                    this.evaluationFuncForm.field.sinr.activate = JSON.parse(mutilFunctionSettingData[1][2]);
                    this.evaluationFuncForm.field.rsrp.activate = JSON.parse(mutilFunctionSettingData[1][3]);
                    this.evaluationFuncForm.field.throughput.activate = JSON.parse(mutilFunctionSettingData[1][4]);
                    this.evaluationFuncForm.ue.coverage.activate = JSON.parse(mutilFunctionSettingData[1][5]);
                    console.log("mutilFunctionSettingData[1][6]: " + mutilFunctionSettingData[1][6]);
                    console.log("b-mutilFunctionSettingData[1][6]: " + JSON.parse(mutilFunctionSettingData[1][6]));
                    this.evaluationFuncForm.ue.throughputByRsrp.activate = JSON.parse(mutilFunctionSettingData[1][6]);
                    var fieldSINRLen = Number(mutilFunctionSettingData[1][7]);
                    var fieldRSRPLen = Number(mutilFunctionSettingData[1][8]);
                    var fieldThroughputLen = Number(mutilFunctionSettingData[1][9]);
                    var ueThroughputLen = Number(mutilFunctionSettingData[1][10]);
                }
                var mutilFunctionCoverage = this.wb.SheetNames[sheetNameIndex['mutil function coverage']];
                var mutilFunctionCoverageWS = this.wb.Sheets[mutilFunctionCoverage];
                var mutilFunctionCoverageData = (XLSX.utils.sheet_to_json(mutilFunctionCoverageWS, { header: 1 }));
                if (mutilFunctionCoverageData.length > 1) {
                    this.evaluationFuncForm.field.coverage.ratio = Number(mutilFunctionCoverageData[1][0]);
                }
                var mutilFunctionSINR = this.wb.SheetNames[sheetNameIndex['mutil function sinr']];
                var mutilFunctionSINRWS = this.wb.Sheets[mutilFunctionSINR];
                var mutilFunctionSINRData = (XLSX.utils.sheet_to_json(mutilFunctionSINRWS, { header: 1 }));
                this.evaluationFuncForm.field.sinr.ratio = [];
                for (var i = 0; i < fieldSINRLen; i++) {
                    this.evaluationFuncForm.field.sinr.ratio.push({
                        "areaRatio": Number(mutilFunctionSINRData[i + 1][0]),
                        "compliance": mutilFunctionSINRData[i + 1][1],
                        "value": Number(mutilFunctionSINRData[i + 1][2])
                    });
                }
                var mutilFunctionRSRP = this.wb.SheetNames[sheetNameIndex['mutil function rsrp']];
                var mutilFunctionRSRPWS = this.wb.Sheets[mutilFunctionRSRP];
                var mutilFunctionRSRPData = (XLSX.utils.sheet_to_json(mutilFunctionRSRPWS, { header: 1 }));
                this.evaluationFuncForm.field.rsrp.ratio = [];
                for (var i = 0; i < fieldRSRPLen; i++) {
                    this.evaluationFuncForm.field.rsrp.ratio.push({
                        "areaRatio": Number(mutilFunctionRSRPData[i + 1][0]),
                        "compliance": mutilFunctionRSRPData[i + 1][1],
                        "value": Number(mutilFunctionRSRPData[i + 1][2])
                    });
                }
                var mutilFunctionThroughput = this.wb.SheetNames[sheetNameIndex['mutil function throughput']];
                var mutilFunctionThroughputWS = this.wb.Sheets[mutilFunctionThroughput];
                var mutilFunctionThroughputData = (XLSX.utils.sheet_to_json(mutilFunctionThroughputWS, { header: 1 }));
                this.evaluationFuncForm.field.throughput.ratio = [];
                for (var i = 0; i < fieldThroughputLen; i++) {
                    if (!isNaN(Number(mutilFunctionThroughputData[i + 1][2])) && !isNaN(Number(mutilFunctionThroughputData[i + 1][3]))) {
                        this.evaluationFuncForm.field.throughput.ratio.push({
                            "areaRatio": Number(mutilFunctionThroughputData[i + 1][0]),
                            "compliance": mutilFunctionThroughputData[i + 1][1],
                            "ULValue": Number(mutilFunctionThroughputData[i + 1][2]),
                            "DLValue": null
                        });
                        this.evaluationFuncForm.field.throughput.ratio.push({
                            "areaRatio": Number(mutilFunctionThroughputData[i + 1][0]),
                            "compliance": mutilFunctionThroughputData[i + 1][1],
                            "ULValue": null,
                            "DLValue": Number(mutilFunctionThroughputData[i + 1][3])
                        });
                    }
                    else if (!isNaN(Number(mutilFunctionThroughputData[i + 1][2]))) {
                        this.evaluationFuncForm.field.throughput.ratio.push({
                            "areaRatio": Number(mutilFunctionThroughputData[i + 1][0]),
                            "compliance": mutilFunctionThroughputData[i + 1][1],
                            "ULValue": Number(mutilFunctionThroughputData[i + 1][2]),
                            "DLValue": null
                        });
                    }
                    else if (!isNaN(Number(mutilFunctionThroughputData[i + 1][3]))) {
                        this.evaluationFuncForm.field.throughput.ratio.push({
                            "areaRatio": Number(mutilFunctionThroughputData[i + 1][0]),
                            "compliance": mutilFunctionThroughputData[i + 1][1],
                            "ULValue": null,
                            "DLValue": Number(mutilFunctionThroughputData[i + 1][3])
                        });
                    }
                }
                var mutilFunctionUECoverage = this.wb.SheetNames[sheetNameIndex['mutil function UE coverage']];
                var mutilFunctionUECoverageWS = this.wb.Sheets[mutilFunctionUECoverage];
                var mutilFunctionUECoverageData = (XLSX.utils.sheet_to_json(mutilFunctionUECoverageWS, { header: 1 }));
                if (mutilFunctionUECoverageData.length > 1) {
                    this.evaluationFuncForm.ue.coverage.ratio = Number(mutilFunctionUECoverageData[1][0]);
                }
                var mutilFunctionUEThroughput = this.wb.SheetNames[sheetNameIndex['mutil function UE throughput']];
                var mutilFunctionUEThroughputWS = this.wb.Sheets[mutilFunctionUEThroughput];
                var mutilFunctionUEThroughputData = (XLSX.utils.sheet_to_json(mutilFunctionUEThroughputWS, { header: 1 }));
                this.evaluationFuncForm.ue.throughputByRsrp.ratio = [];
                for (var i = 0; i < ueThroughputLen; i++) {
                    if (!isNaN(Number(mutilFunctionUEThroughputData[i + 1][2])) && !isNaN(Number(mutilFunctionUEThroughputData[i + 1][3]))) //old format
                     {
                        this.evaluationFuncForm.ue.throughputByRsrp.ratio.push({
                            "countRatio": Number(mutilFunctionUEThroughputData[i + 1][0]),
                            "compliance": mutilFunctionUEThroughputData[i + 1][1],
                            "ULValue": Number(mutilFunctionUEThroughputData[i + 1][2]),
                            "DLValue": null
                        });
                        this.evaluationFuncForm.ue.throughputByRsrp.ratio.push({
                            "countRatio": Number(mutilFunctionUEThroughputData[i + 1][0]),
                            "compliance": mutilFunctionUEThroughputData[i + 1][1],
                            "ULValue": null,
                            "DLValue": Number(mutilFunctionUEThroughputData[i + 1][3])
                        });
                    }
                    else if (!isNaN(Number(mutilFunctionUEThroughputData[i + 1][2]))) {
                        this.evaluationFuncForm.ue.throughputByRsrp.ratio.push({
                            "countRatio": Number(mutilFunctionUEThroughputData[i + 1][0]),
                            "compliance": mutilFunctionUEThroughputData[i + 1][1],
                            "ULValue": Number(mutilFunctionUEThroughputData[i + 1][2]),
                            "DLValue": null
                        });
                    }
                    else if (!isNaN(Number(mutilFunctionUEThroughputData[i + 1][3]))) {
                        this.evaluationFuncForm.ue.throughputByRsrp.ratio.push({
                            "countRatio": Number(mutilFunctionUEThroughputData[i + 1][0]),
                            "compliance": mutilFunctionUEThroughputData[i + 1][1],
                            "ULValue": null,
                            "DLValue": Number(mutilFunctionUEThroughputData[i + 1][3])
                        });
                    }
                }
                this.setThroughputTypeAndValue();
                window.sessionStorage.setItem("planningIndex", this.planningIndex);
                window.sessionStorage.setItem("evaluationFuncForm", JSON.stringify(this.evaluationFuncForm));
            }
        }
        catch (error) {
            console.log(error);
            // fail xlsx
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.translateService.instant('xlxs.fail')
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
    };
    /**
     * 儲存場域
     */
    SitePlanningComponent.prototype.save = function () {
        var _this = this;
        this.authService.spinnerShowAsHome();
        this.setForm();
        var url = this.authService.API_URL + "/storeResult";
        this.http.post(url, JSON.stringify(this.calculateForm)).subscribe(function (res) {
            _this.taskid = res['taskid'];
            _this.authService.spinnerHide();
        }, function (err) {
            _this.authService.spinnerHide();
            console.log(err);
        });
    };
    /**
     * 首頁點編輯場域
     */
    SitePlanningComponent.prototype.edit = function (redraw) {
        var _this = this;
        // 兩個走向，一個重新拿取API的值，所以要先清空陣列，一個只是要重新算pixel位置
        if (!redraw) {
            this.obstacleList.forEach(function (el) {
                _this.setObstacleSize(el);
            });
            this.candidateList.forEach(function (el) {
                _this.setCandidateSize(el);
            });
            this.defaultBSList.forEach(function (el) {
                _this.setDefaultBsSize(el);
            });
            this.ueList.forEach(function (el) {
                _this.setUeSize(el);
            });
            this.subFieldList.forEach(function (el) {
                _this.setSubFieldSize(el);
            });
        }
        else {
            // obstacleInfo
            this.obstacleList.length = 0;
            this.subFieldList.length = 0;
            this.dragObject = {};
            this.candidateList.length = 0;
            this.defaultBSList.length = 0;
            this.bsListRfParam = {};
            this.ueList.length = 0;
            this.spanStyle = {};
            this.rectStyle = {};
            this.ellipseStyle = {};
            this.polygonStyle = {};
            this.trapezoidStyle = {};
            this.subFieldStyle = {};
            this.svgStyle = {};
            this.pathStyle = {};
            // this.circleStyle
            //子場域
            if (sessionStorage.getItem('sub_field_coor') != undefined) {
                var sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
                var sub_field_arr2 = [];
                console.log(sub_field_arr.length);
                var subFieldLen = sub_field_arr.length;
                for (var i = 0; i < subFieldLen; i++) {
                    var id = "subField_" + this.generateString(10);
                    var item = sub_field_arr[i];
                    this.dragObject[id] = {
                        x: item['x'],
                        y: item['y'],
                        // z: 0,
                        width: item['width'],
                        height: item['height'],
                        // altitude: item[4],
                        rotate: 0,
                        title: this.translateService.instant('subfield'),
                        type: 'subField',
                        color: this.OBSTACLE_COLOR,
                        // material: item[6].toString(),
                        element: '4'
                    };
                    sub_field_arr2.push({
                        id: id,
                        x: item['x'],
                        y: item['y'],
                        width: item['width'],
                        height: item['height']
                    });
                    this.subFieldList.push(id);
                }
                sessionStorage.setItem('sub_field_coor', JSON.stringify(sub_field_arr2));
            }
            if (!this.authService.isEmpty(this.calculateForm.obstacleInfo)) {
                var obstacle = this.calculateForm.obstacleInfo.split('|');
                var obstacleLen = obstacle.length;
                for (var i = 0; i < obstacleLen; i++) {
                    if (obstacle[i].indexOf('undefined') !== -1) {
                        continue;
                    }
                    var item = JSON.parse(obstacle[i]);
                    var diff = item.length - 9;
                    var shape = '0';
                    if (typeof item[8 + diff] !== 'undefined') {
                        shape = this.parseElement(item[8 + diff]);
                    }
                    var id = this.parseShape(shape) + "_" + this.generateString(10);
                    var index = this.materialIdToIndex[Number(item[7 + diff])];
                    var material = item[7 + diff].toString();
                    /*
                    if(!(item[7+diff] in this.materialIdToIndex)){
                      index = 0;
                      material = Number(this.materialList[index]['id']);
                    }
                    */
                    if (!(item[7 + diff] in this.materialIdToIndex)) {
                        index = 0;
                        if (Number(item[7 + diff]) < this.materialList.length) { // 對舊專案的處理
                            material = this.materialList[Number(item[7 + diff])]['id'];
                        }
                        else {
                            material = this.materialList[0]['id'];
                        }
                    }
                    var materialName = "";
                    if (Object.keys(this.materialList).length < 1 || Object.keys(this.materialIdToIndex).length < 1) {
                        console.log('*DEBUG:this.materialList', this.materialList);
                        console.log('index', index);
                        console.log('this.materialIdToIndex', this.materialIdToIndex);
                        console.log('item[7]', item[7 + diff]);
                        console.log('do not init!');
                        materialName = "need init";
                        this.ngOnInit();
                    }
                    if (this.authService.lang == 'zh-TW') {
                        materialName = this.materialList[index]['chineseName'];
                    }
                    else {
                        materialName = this.materialList[index]['name'];
                    }
                    var zValue = item[2 + diff];
                    if (diff == -1) {
                        zValue = 0;
                    }
                    // console.log("diff",diff);
                    this.dragObject[id] = {
                        x: item[0],
                        y: item[1],
                        z: zValue,
                        width: item[3 + diff],
                        height: item[4 + diff],
                        altitude: item[5 + diff],
                        rotate: item[6 + diff],
                        title: this.translateService.instant('obstacleInfo'),
                        type: this.svgElmMap(shape).type,
                        color: this.OBSTACLE_COLOR,
                        material: material,
                        materialName: materialName,
                        element: shape
                    };
                    // console.log("this.dragObject[id]",this.dragObject[id]);
                    // set 障礙物尺寸與位置
                    // this.setObstacleSize(id);
                    this.obstacleList.push(id);
                }
            }
            // candidate
            if (!this.authService.isEmpty(this.calculateForm.candidateBs)) {
                var candidate = this.calculateForm.candidateBs.split('|');
                var candidateLen = candidate.length;
                var txpower = JSON.parse(this.calculateForm.txPower);
                var beamId = JSON.parse(this.calculateForm.beamId);
                var candidateAnt = [];
                if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt)) {
                    candidateAnt = this.calculateForm.candidateBsAnt.split('|');
                }
                else {
                    for (var i = 0; i < candidateLen; i++) {
                        candidateAnt.push("[1,0,0,0]");
                    }
                }
                console.log("candidateAnt", candidateAnt);
                for (var i = 0; i < candidateLen; i++) {
                    var item = JSON.parse(candidate[i]);
                    var id = "candidate_" + this.generateString(10);
                    var antObj = JSON.parse(candidateAnt[i]);
                    this.candidateList.push(id);
                    console.log(item[2]);
                    this.dragObject[id] = {
                        x: item[0],
                        y: item[1],
                        z: item[2],
                        width: this.candidateWidth,
                        height: this.candidateHeight,
                        altitude: item[2],
                        rotate: 0,
                        title: this.svgMap['candidate'].title,
                        type: this.svgMap['candidate'].type,
                        color: this.CANDIDATE_COLOR,
                        material: '0',
                        element: 'candidate'
                    };
                    // set 新增基站位置
                    // this.setCandidateSize(id);
                    if (this.authService.isEmpty(this.calculateForm.bsNoiseFigure)) {
                        this.tempCalParamSet.bsNoiseFigure = 0;
                    }
                    else {
                        this.tempCalParamSet.bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[i];
                    }
                    this.tempCalParamSet.AntennaId = antObj[0];
                    this.tempCalParamSet.theta = antObj[1];
                    this.tempCalParamSet.phi = antObj[2];
                    this.tempCalParamSet.bsTxGain = antObj[3];
                    this.tempCalParamSet.txpower = txpower[0];
                    this.tempCalParamSet.beampattern = beamId[0];
                    if (this.calculateForm.duplex === 'fdd' && this.calculateForm.mapProtocol === '5g') {
                        this.tempCalParamSet.dlScs = JSON.parse(this.calculateForm.dlScs)[i];
                        this.tempCalParamSet.ulScs = JSON.parse(this.calculateForm.ulScs)[i];
                    }
                    if (this.calculateForm.duplex === 'tdd' && this.calculateForm.mapProtocol === '5g') {
                        this.tempCalParamSet.tddscs = JSON.parse(this.calculateForm.scs)[i];
                    }
                    if (this.calculateForm.duplex === 'fdd') {
                        this.duplexMode = 'fdd';
                        this.tempCalParamSet.fddDlFrequency = JSON.parse(this.calculateForm.dlFrequency)[i];
                        this.tempCalParamSet.fddUlFrequency = JSON.parse(this.calculateForm.ulFrequency)[i];
                        this.tempCalParamSet.dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth)[i];
                        this.tempCalParamSet.ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth)[i];
                    }
                    else {
                        this.duplexMode = 'tdd';
                        this.tempCalParamSet.tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i];
                        this.tempCalParamSet.tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
                        // this.tempCalParamSet.tddscs = JSON.parse(this.calculateForm.scs)[i].toString();
                    }
                    if (this.calculateForm.mapProtocol === '4g') {
                        this.tempCalParamSet.mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i];
                    }
                    if (this.calculateForm.mapProtocol === '5g') {
                        var ulmsc = this.calculateForm.ulMcsTable;
                        var dlmsc = this.calculateForm.dlMcsTable;
                        this.tempCalParamSet.ulModulationCodScheme = ulmsc.substring(1, (ulmsc.length) - 1).split(',')[i];
                        this.tempCalParamSet.dlModulationCodScheme = dlmsc.substring(1, (dlmsc.length) - 1).split(',')[i];
                        this.tempCalParamSet.ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i].toString();
                        this.tempCalParamSet.dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i].toString();
                        this.scalingFactor = this.calculateForm.scalingFactor;
                    }
                    if (this.calculateForm.mapProtocol === 'wifi') {
                        this.tempCalParamSet.wifiFrequency = JSON.parse(this.calculateForm.frequencyList)[i];
                        this.tempCalParamSet.wifiBandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
                        var wifiProtocol = this.calculateForm.wifiProtocol;
                        var guardInterval = this.calculateForm.guardInterval;
                        var wifiMimo = this.calculateForm.wifiMimo;
                        this.tempCalParamSet.wifiProtocol = wifiProtocol.substring(1, (wifiProtocol.length) - 1).split(',')[i];
                        this.tempCalParamSet.guardInterval = guardInterval.substring(1, (guardInterval.length) - 1).split(',')[i];
                        this.tempCalParamSet.wifiMimo = wifiMimo.substring(1, (wifiMimo.length) - 1).split(',')[i];
                    }
                }
            }
            // defaultBs
            this.calculateForm.defaultBs = this.calculateForm.bsList;
            if (!this.authService.isEmpty(this.calculateForm.defaultBs)) {
                var defaultBS = this.calculateForm.defaultBs.split('|');
                var txpower = JSON.parse(this.calculateForm.txPower);
                var beamId = JSON.parse(this.calculateForm.beamId);
                // this.dlRatio = this.calculateForm.tddFrameRatio;
                var candidateNum = 0;
                if (this.candidateList.length != 0) {
                    candidateNum = this.candidateList.length;
                }
                var defaultBSLen = defaultBS.length;
                var defaultAnt = [];
                if (!this.authService.isEmpty(this.calculateForm.defaultBsAnt)) {
                    defaultAnt = this.calculateForm.defaultBsAnt.split('|');
                }
                else {
                    for (var i = 0; i < defaultBSLen; i++) {
                        defaultAnt.push("[1,0,0,0]");
                    }
                }
                for (var i = 0; i < defaultBSLen; i++) {
                    var item = JSON.parse(defaultBS[i]);
                    var id = "defaultBS_" + this.generateString(10);
                    this.defaultBSList.push(id);
                    var antObj = JSON.parse(defaultAnt[i]);
                    //20210521
                    this.bsListRfParam[id] = {
                        txpower: txpower[i + candidateNum],
                        beampattern: beamId[i + candidateNum],
                        // frequency: frequencyList[i],
                        // ulModulationCodScheme: "64QAM-table",
                        // dlModulationCodScheme: "64QAM-table",
                        mimoLayer: 1,
                        // scalingFact: 1,
                        subcarrier: 15,
                        scsBandwidth: 10
                    };
                    if (this.authService.isEmpty(this.calculateForm.bsNoiseFigure)) {
                        this.bsListRfParam[id].bsNoiseFigure = 0;
                    }
                    else {
                        this.bsListRfParam[id].bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[i + candidateNum];
                    }
                    this.bsListRfParam[id].AntennaId = antObj[0];
                    this.bsListRfParam[id].theta = antObj[1];
                    this.bsListRfParam[id].phi = antObj[2];
                    this.bsListRfParam[id].bsTxGain = antObj[3];
                    if (this.calculateForm.duplex === 'fdd' && this.calculateForm.mapProtocol === '5g') {
                        this.bsListRfParam[id].dlScs = JSON.parse(this.calculateForm.dlScs)[i + candidateNum];
                        this.bsListRfParam[id].ulScs = JSON.parse(this.calculateForm.ulScs)[i + candidateNum];
                    }
                    if (this.calculateForm.duplex === 'tdd' && this.calculateForm.mapProtocol === '5g') {
                        this.bsListRfParam[id].tddscs = JSON.parse(this.calculateForm.scs)[i + candidateNum];
                    }
                    if (this.calculateForm.duplex === 'fdd') {
                        this.duplexMode = 'fdd';
                        this.bsListRfParam[id].fddDlFrequency = JSON.parse(this.calculateForm.dlFrequency)[i + candidateNum];
                        this.bsListRfParam[id].fddUlFrequency = JSON.parse(this.calculateForm.ulFrequency)[i + candidateNum];
                        this.bsListRfParam[id].dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth)[i + candidateNum];
                        this.bsListRfParam[id].ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth)[i + candidateNum];
                        // console.log(this.bsListRfParam[id].dlScs);
                        // console.log(this.bsListRfParam[id].dlBandwidth);
                        // console.log(this.bsListRfParam[id].ulScs);
                        // console.log(this.bsListRfParam[id].ulBandwidth);
                    }
                    else {
                        this.duplexMode = 'tdd';
                        this.bsListRfParam[id].tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i + candidateNum];
                        this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i + candidateNum];
                        // this.bsListRfParam[id].tddscs = JSON.parse(this.calculateForm.scs)[i+candidateNum].toString();
                    }
                    if (this.calculateForm.duplex === 'tdd' && this.calculateForm.mapProtocol === '4g') {
                        // this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
                    }
                    if (this.calculateForm.mapProtocol === '4g') {
                        this.bsListRfParam[id].mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i + candidateNum];
                    }
                    if (this.calculateForm.mapProtocol === '5g') {
                        var ulmsc = this.calculateForm.ulMcsTable;
                        var dlmsc = this.calculateForm.dlMcsTable;
                        this.bsListRfParam[id].ulModulationCodScheme = ulmsc.substring(1, (ulmsc.length) - 1).split(',')[i + candidateNum];
                        this.bsListRfParam[id].dlModulationCodScheme = dlmsc.substring(1, (dlmsc.length) - 1).split(',')[i + candidateNum];
                        this.bsListRfParam[id].ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i + candidateNum].toString();
                        this.bsListRfParam[id].dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i + candidateNum].toString();
                        // this.bsListRfParam[id].ulMcsTable = JSON.parse(this.calculateForm.ulMcsTable)[i].toString();
                        // this.bsListRfParam[id].dlMcsTable = JSON.parse(this.calculateForm.dlMcsTable)[i].toString();
                        this.scalingFactor = this.calculateForm.scalingFactor;
                    }
                    if (this.calculateForm.mapProtocol === 'wifi') {
                        this.bsListRfParam[id].wifiFrequency = JSON.parse(this.calculateForm.frequencyList)[i + candidateNum];
                        this.bsListRfParam[id].wifiBandwidth = JSON.parse(this.calculateForm.bandwidthList)[i + candidateNum];
                        var wifiProtocol = this.calculateForm.wifiProtocol;
                        var guardInterval = this.calculateForm.guardInterval;
                        var wifiMimo = this.calculateForm.wifiMimo;
                        this.bsListRfParam[id].wifiProtocol = wifiProtocol.substring(1, (wifiProtocol.length) - 1).split(',')[i + candidateNum];
                        this.bsListRfParam[id].guardInterval = guardInterval.substring(1, (guardInterval.length) - 1).split(',')[i + candidateNum];
                        this.bsListRfParam[id].wifiMimo = wifiMimo.substring(1, (wifiMimo.length) - 1).split(',')[i + candidateNum];
                    }
                    this.dragObject[id] = {
                        x: item[0],
                        y: item[1],
                        z: item[2],
                        width: 30,
                        height: 30,
                        altitude: item[2],
                        rotate: 0,
                        title: this.svgMap['defaultBS'].title,
                        type: this.svgMap['defaultBS'].type,
                        color: this.DEFAULT_BS_COLOR,
                        material: '0',
                        element: 'defaultBS'
                    };
                    // set 既有基站位置
                    // this.setDefaultBsSize(id);
                }
            }
            // UE
            if (!this.authService.isEmpty(this.calculateForm.ueCoordinate)) {
                var ue = this.calculateForm.ueCoordinate.split('|');
                var ueLen = ue.length;
                console.log("this.ueListParam", this.ueListParam);
                for (var i = 0; i < ueLen; i++) {
                    var item = JSON.parse(ue[i]);
                    var id = "ue_" + this.generateString(10);
                    this.ueList.push(id);
                    this.dragObject[id] = {
                        x: item[0],
                        y: item[1],
                        z: item[2],
                        width: this.ueWidth,
                        height: this.ueHeight,
                        altitude: item[2],
                        rotate: 0,
                        title: this.svgMap['UE'].title,
                        type: this.svgMap['UE'].type,
                        color: this.UE_COLOR,
                        material: '0',
                        element: 'UE'
                    };
                    if (this.authService.isEmpty(this.calculateForm.ueRxGain)) {
                        this.ueListParam[id] = {
                            ueRxGain: 0
                        };
                    }
                    else {
                        this.ueListParam[id] = {
                            ueRxGain: JSON.parse(this.calculateForm.ueRxGain)[i]
                        };
                    }
                    // set UE位置
                    // this.setUeSize(id);
                }
            }
            if (this.calculateForm.objectiveIndex === '2') {
                // 切換到2.4Ghz
                if (Number(Number(this.calculateForm.bandwidth) >= 20)) {
                    this.wifiFrequency = '1';
                }
                this.changeWifiFrequency();
            }
            this.ognSpanStyle = _.cloneDeep(this.spanStyle);
            this.ognDragObject = _.cloneDeep(this.dragObject);
            // 檢查圓形高度
            // window.setTimeout(() => {
            //   this.checkCircle();
            // }, 0);
        }
    };
    /** 運算結果 */
    SitePlanningComponent.prototype.result = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                //檢查子場域是否重疊
                if (this.checkSubFieldOverlaped()) {
                    return [2 /*return*/];
                }
                // 規劃目標
                // this.setPlanningObj();
                this.authService.spinnerShow();
                this.authService.spinnerHide();
                if (this.isHst) {
                    this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid, isHst: true } }).then(function () {
                        // location.reload();
                    });
                }
                else {
                    this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid } }).then(function () {
                        // location.reload();
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 歷史資料塞回form
     * @param result
     */
    /*
    setHstToForm(result) {
      this.calculateForm.addFixedBsNumber = result['addfixedbsnumber'];
      this.calculateForm.availableNewBsNumber = result['availablenewbsnumber'];
      this.calculateForm.bandwidth = result['bandwidth'];
      this.calculateForm.beamMaxId = result['beammaxid'];
      this.calculateForm.beamMinId = result['beamminid'];
      this.calculateForm.candidateBs = result['candidatebs'];
      this.calculateForm.crossover = result['crossover'];
      this.calculateForm.defaultBs = result['defaultBs'];
      this.calculateForm.frequency = result['frequency'];
      this.calculateForm.iteration = result['iteration'];
      this.calculateForm.zValue = result['mapdepth'];
      this.calculateForm.altitude = result['mapaltitude'];
      this.calculateForm.height = result['mapheight'];
      this.calculateForm.mapImage = result['mapimage'];
      this.calculateForm.mapName = result['mapname'];
      this.calculateForm.width = result['mapwidth'];
      this.calculateForm.mutation = result['mutation'];
      this.calculateForm.objectiveIndex = result['objectiveindex'];
      this.calculateForm.obstacleInfo = result['obstacleinfo'];
      this.calculateForm.pathLossModelId = result['pathlossmodelid'];
      this.calculateForm.powerMaxRange = result['powermaxrange'];
      this.calculateForm.powerMinRange = result['powerminrange'];
      this.calculateForm.seed = result['seed'];
      this.calculateForm.taskName = result['taskname'];
      this.calculateForm.totalRound = result['totalround'];
      this.calculateForm.ueCoordinate = result['uecoordinate'];
      this.calculateForm.useUeCoordinate = result['useuecoordinate'];
      this.calculateForm.beamMaxId = result['beammaxid'];
    }
    */
    SitePlanningComponent.prototype.protocolSwitchWarning = function () {
        if (this.defaultBSList.length !== 0) {
            var msg = this.translateService.instant('planning.protocolSwitchWarning');
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
        if (this.calculateForm.objectiveIndex == '1') {
            if (this.duplexMode == 'tdd') {
                this.tempCalParamSet.tddscs = '15';
                this.tempCalParamSet.tddbandwidth = '5';
            }
            else {
                this.tempCalParamSet.dlScs = '15';
                this.tempCalParamSet.dlBandwidth = '5';
                this.tempCalParamSet.ulScs = '15';
                this.tempCalParamSet.ulBandwidth = '5';
            }
        }
        else if (this.calculateForm.objectiveIndex == '0') {
            if (this.duplexMode == 'tdd') {
                this.tempCalParamSet.tddbandwidth = '5';
            }
            else {
                this.tempCalParamSet.dlBandwidth = '1.4';
                this.tempCalParamSet.ulBandwidth = '1.4';
            }
        }
    };
    /** Wifi頻率切換 */
    SitePlanningComponent.prototype.changeWifiFrequency = function () {
        if (Number(this.wifiFrequency) === 0) {
            // this.calculateForm.frequency = '950';
        }
        else if (Number(this.wifiFrequency) === 1) {
            // this.calculateForm.frequency = '2400';
        }
        else if (Number(this.wifiFrequency) === 2) {
            // this.calculateForm.frequency = '5800';
        }
        // 場域內無線訊號衰減模型 default value
        // if (Number(this.calculateForm.objectiveIndex) === 2) {
        //   this.calculateForm.pathLossModelId = 9;
        // } else {
        //   this.calculateForm.pathLossModelId = 0;
        // }
    };
    /**
     * 互動結束event
     */
    SitePlanningComponent.prototype.dragEnd = function () {
        for (var _i = 0, _a = this.obstacleList; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item !== this.svgId) {
                // 其他障礙物有時會跟著動，keep住
                this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
            }
        }
    };
    /** 場域標題 */
    SitePlanningComponent.prototype.getTitle = function () {
        if (this.calculateForm.objectiveIndex.toString() === '0') {
            return "4G" + this.translateService.instant('taskName');
            // return this.translateService.instant('planning.title').replace('{0}', '4G');
        }
        else if (this.calculateForm.objectiveIndex.toString() === '1') {
            return "5G" + this.translateService.instant('taskName');
            // return this.translateService.instant('planning.title').replace('{0}', '5G');
        }
        else if (this.calculateForm.objectiveIndex.toString() === '2') {
            return "WiFi" + this.translateService.instant('taskName');
            // return this.translateService.instant('planning.title').replace('{0}', 'Wifi');
        }
    };
    /** set子載波間距 */
    SitePlanningComponent.prototype.setSubcarrier = function () {
        var list15 = [5, 10, 15, 20, 25, 30, 40, 50];
        var list30 = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
        var list60 = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 200];
        var list120 = [50, 100, 200, 400];
        var bandwidth = Number(this.calculateForm.bandwidth);
        if (list15.includes(bandwidth)) {
            this.subcarrier = 15;
        }
        else if (list30.includes(bandwidth)) {
            this.subcarrier = 30;
        }
        else if (list60.includes(bandwidth)) {
            this.subcarrier = 60;
        }
        else if (list120.includes(bandwidth)) {
            this.subcarrier = 120;
        }
    };
    /** 規劃目標切換 */
    SitePlanningComponent.prototype.changePlanningIndex = function () {
        // 設定預設值
        if (this.planningIndex === '1') {
            this.calculateForm.isSimulation = false;
            this.calculateForm.isCoverage = true;
            this.calculateForm.isUeCoverage = false;
            this.calculateForm.isUeAvgThroughput = false;
            this.changeAntennaToOmidirectial();
            window.sessionStorage.setItem("planningIndex", this.planningIndex);
        }
        else if (this.planningIndex === '2') {
            this.calculateForm.isSimulation = false;
            this.calculateForm.isUeCoverage = false;
            this.calculateForm.isUeAvgThroughput = true;
            this.calculateForm.isCoverage = false;
            this.changeAntennaToOmidirectial();
            window.sessionStorage.setItem("planningIndex", this.planningIndex);
        }
        else {
            if (this.candidateList.length != 0) {
                // this.msgDialogConfig.data = {
                //   type: 'error',
                //   infoMessage: '<br>這個目標設定的改變，會刪除掉場域上所有的待選位置! <br>是否繼續執行?'
                // };
                // this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
                this.matDialog.open(this.changeToSimulationModal, { disableClose: true });
            }
            else {
                this.calculateForm.isSimulation = true;
                // this.clearAll('candidate');
                this.calculateForm.isAverageSinr = false;
                this.calculateForm.isCoverage = false;
                this.calculateForm.isUeCoverage = false;
                this.calculateForm.isUeAvgSinr = false;
                this.calculateForm.isUeAvgThroughput = false;
            }
        }
    };
    SitePlanningComponent.prototype.changeToSimulation = function (flag) {
        if (flag) {
            this.matDialog.open(this.changeToSimulationModal);
            this.calculateForm.isSimulation = true;
            this.clearAll('candidate');
            this.calculateForm.isAverageSinr = false;
            this.calculateForm.isCoverage = false;
            this.calculateForm.isUeCoverage = false;
            this.calculateForm.isUeAvgSinr = false;
            this.calculateForm.isUeAvgThroughput = false;
            this.matDialog.closeAll();
            window.sessionStorage.setItem("planningIndex", this.planningIndex);
        }
        else {
            // if (this.calculateForm.isCoverage) {
            //   this.planningIndex = '1';
            //   this.getPlanningIndex();
            // } else {
            //   this.planningIndex = '2';
            this.getPlanningIndex();
            // }
            this.matDialog.closeAll();
        }
    };
    /**
     * 亂數字串
     * @param len
     */
    SitePlanningComponent.prototype.generateString = function (len) {
        var result = ' ';
        var charactersLength = this.characters.length;
        for (var i = 0; i < len; i++) {
            result += this.characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result.trim();
    };
    /**
     * 障礙物物件類型判別
     * @param type 物件類型
     */
    SitePlanningComponent.prototype.svgElmMap = function (type) {
        if (Number(type) === 0) {
            return {
                id: 'svg_1',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '0'
            };
        }
        else if (Number(type) === 1) {
            return {
                id: 'svg_3',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '1'
            };
        }
        else if (Number(type) === 2) {
            return {
                id: 'svg_2',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '2'
            };
        }
        else if (Number(type) === 3) {
            return {
                id: 'svg_7',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '3'
            };
        }
        else {
            return {
                id: 'svg_1',
                title: this.translateService.instant('obstacleInfo'),
                type: 'obstacle',
                element: '0'
            };
        }
    };
    /**
     * 障礙物形狀轉換
     * @param type 形狀
     */
    SitePlanningComponent.prototype.parseElement = function (type) {
        if (type === 'rect') {
            return 0;
        }
        else if (type === 'ellipse') {
            return 2;
        }
        else if (type === 'polygon') {
            return 1;
        }
        else if (type === 'trapezoid') {
            return 3;
        }
        else if (type === 'subField') {
            return 4;
        }
        else {
            return type;
        }
    };
    /**
     * 右側清單刪除互動物件
     * @param id
     */
    SitePlanningComponent.prototype.removeObj = function (id) {
        this.svgId = id;
        this["delete"](false);
    };
    /**
     * 障礙物形狀轉換
     * @param type 形狀
     */
    SitePlanningComponent.prototype.parseShape = function (type) {
        if (type.toString() === '0') {
            return 'rect';
        }
        else if (type.toString() === '2') {
            return 'ellipse';
        }
        else if (type.toString() === '1') {
            return 'polygon';
        }
        else if (type.toString() === '3') {
            return 'trapezoid';
        }
        else {
            return type;
        }
    };
    /** 障礙物若莫名移動，還原位置 */
    SitePlanningComponent.prototype.backObstacle = function () {
        for (var _i = 0, _a = this.obstacleList; _i < _a.length; _i++) {
            var item = _a[_i];
            if (this.dragObject[item].x !== this.ognDragObject[item].x
                || this.dragObject[item].y !== this.ognDragObject[item].y) {
                this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
                this.dragObject[item] = _.cloneDeep(this.ognDragObject[item]);
            }
        }
    };
    /** 檢查圓形高度 */
    SitePlanningComponent.prototype.checkCircle = function () {
        for (var _i = 0, _a = this.obstacleList; _i < _a.length; _i++) {
            var svgId = _a[_i];
            var obstacle = this.dragObject[svgId];
            if (obstacle.element === 2) {
                var spanHeight = Number(this.spanStyle[svgId].height.replace('px', ''));
                var cy2 = this.ellipseStyle[svgId].cy * 2;
                if (cy2 > spanHeight || cy2 > this.svgStyle[svgId].height) {
                    // 圓形高度超出外框，還原正常尺寸
                    console.log(spanHeight, this.svgStyle[svgId].height, cy2);
                    this.svgStyle[svgId].height = spanHeight;
                    var newCy = spanHeight / 2;
                    this.ellipseStyle[svgId].rx = newCy;
                    this.ellipseStyle[svgId].ry = newCy;
                    this.ellipseStyle[svgId].cx = newCy;
                    this.ellipseStyle[svgId].cy = newCy;
                }
            }
        }
    };
    /** 圖區resize */
    SitePlanningComponent.prototype.chartResize = function () {
        var _this = this;
        window.setTimeout(function () {
            // 重取區域寬度
            _this.resetChartWidth();
            var dArea = document.getElementById('top_area');
            // top區域+head menu + 一點buffer
            var dAreaHeight = dArea.clientHeight + 90;
            document.getElementById('chart').style.height = window.innerHeight - dAreaHeight + "px";
            Plotly.relayout('chart', {
                width: _this.leftWidth
            }).then(function (gd) {
                _this.chartService.calSize(_this.calculateForm, gd).then(function (res) {
                    var layoutOption = {
                        width: res[0],
                        height: res[1]
                    };
                    // resize layout
                    console.log(layoutOption);
                    Plotly.relayout('chart', layoutOption).then(function (gd2) {
                        window.setTimeout(function () {
                            // 重新計算比例尺
                            _this.calScale(gd2);
                            // set 障礙物尺寸與位置
                            for (var _i = 0, _a = _this.obstacleList; _i < _a.length; _i++) {
                                var id = _a[_i];
                                _this.setObstacleSize(id);
                            }
                            // set 新增基站位置
                            for (var _b = 0, _c = _this.candidateList; _b < _c.length; _b++) {
                                var id = _c[_b];
                                _this.setCandidateSize(id);
                            }
                            // set 既有基站位置
                            for (var _d = 0, _e = _this.defaultBSList; _d < _e.length; _d++) {
                                var id = _e[_d];
                                _this.setDefaultBsSize(id);
                            }
                            // set 既有基站位置
                            for (var _f = 0, _g = _this.ueList; _f < _g.length; _f++) {
                                var id = _g[_f];
                                _this.setUeSize(id);
                            }
                            for (var _h = 0, _j = _this.subFieldList; _h < _j.length; _h++) {
                                var id = _j[_h];
                                _this.setSubFieldSize(id);
                            }
                            // scrollbar event
                            gd2.addEventListener('scroll', function (event) {
                                event.preventDefault();
                                _this.scrollLeft = gd2.scrollLeft;
                                _this.scrollTop = gd2.scrollTop;
                                var xy = gd2.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();
                                _this.bounds = {
                                    left: xy.left - _this.scrollLeft,
                                    top: xy.top - _this.scrollTop,
                                    right: xy.right,
                                    bottom: xy.top + xy.height
                                };
                            });
                            // drag範圍
                            window.setTimeout(function () {
                                var xy = gd2.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();
                                _this.bounds = {
                                    left: xy.left,
                                    top: xy.top,
                                    right: xy.right,
                                    bottom: xy.top + xy.height
                                };
                            }, 0);
                            if (typeof _this.chart !== 'undefined') {
                                _this.chart.nativeElement.style.opacity = 1;
                            }
                        }, 0);
                    });
                });
            });
        }, 0);
    };
    /**
     * set 障礙物尺寸與位置
     * @param id
     */
    SitePlanningComponent.prototype.setObstacleSize = function (id) {
        var _this = this;
        var target = this.target = document.getElementById("" + id);
        this.frame.set('z-index', 100 + 10 * this.dragObject[id].z);
        this.setTransform(target);
        try {
            this.moveable.destroy();
        }
        catch (error) {
            this.moveable.ngOnInit();
            this.moveable.destroy();
        }
        this.spanStyle[id] = {
            left: this.pixelXLinear(this.dragObject[id].x) + "px",
            top: this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(this.dragObject[id].y) + "px",
            width: this.pixelXLinear(this.dragObject[id].width) + "px",
            height: this.pixelYLinear(this.dragObject[id].height) + "px",
            // transform: `rotate(${this.dragObject[id].rotate}deg)`,
            opacity: 0
        };
        // 延遲轉角度，讓位置正確
        window.setTimeout(function () {
            _this.spanStyle[id]['transform'] = "rotate(" + _this.dragObject[id].rotate + "deg)";
            _this.spanStyle[id].opacity = 1;
        }, 0);
        var width = this.pixelXLinear(this.dragObject[id].width);
        var height = this.pixelYLinear(this.dragObject[id].height);
        this.svgStyle[id] = {
            display: 'inherit',
            width: width,
            height: height
        };
        var shape = this.dragObject[id].element;
        if (Number(shape) === 0) {
            // 方形
            this.rectStyle[id] = {
                width: width,
                height: height,
                fill: this.dragObject[id].color
            };
        }
        else if (Number(shape) === 2) {
            // 圓形
            var x = (width / 2).toString();
            this.ellipseStyle[id] = {
                ry: x,
                rx: x,
                cx: x,
                cy: x,
                fill: this.dragObject[id].color
            };
            // 重新指定圓形span跟svg的高，避免變形
            this.svgStyle[id].height = width;
            this.spanStyle[id].height = width + "px";
        }
        else if (Number(shape) === 1) {
            // 三角形
            var points = width / 2 + ",0 " + width + ", " + height + " 0, " + height;
            this.polygonStyle[id] = {
                points: points,
                fill: this.dragObject[id].color
            };
        }
        else if (Number(shape) === 3) {
            // 梯形
            this.trapezoidStyle[id] = {
                fill: this.dragObject[id].color,
                width: width,
                height: height
            };
        }
    };
    /**
     * set 新增子場域位置
     * @param id
     */
    SitePlanningComponent.prototype.setSubFieldSize = function (id) {
        var _this = this;
        this.spanStyle[id] = {
            left: this.pixelXLinear(this.dragObject[id].x) + "px",
            top: this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(this.dragObject[id].y) + "px",
            width: this.pixelXLinear(this.dragObject[id].width) + "px",
            height: this.pixelYLinear(this.dragObject[id].height) + "px",
            // transform: `rotate(${this.dragObject[id].rotate}deg)`,
            opacity: 0
        };
        // 延遲轉角度，讓位置正確
        window.setTimeout(function () {
            _this.spanStyle[id]['transform'] = "rotate(" + _this.dragObject[id].rotate + "deg)";
            _this.spanStyle[id].opacity = 1;
        }, 0);
        var width = this.pixelXLinear(this.dragObject[id].width);
        var height = this.pixelYLinear(this.dragObject[id].height);
        this.svgStyle[id] = {
            display: 'inherit',
            width: width,
            height: height
        };
        this.subFieldStyle[id] = {
            width: width,
            height: height,
            fill: 'pink',
            fillOpacity: 0.2,
            stroke: 'pink',
            strokeWidth: 3
        };
    };
    /**
     * set 新增基站位置
     * @param id
     */
    SitePlanningComponent.prototype.setCandidateSize = function (id) {
        var _this = this;
        this.spanStyle[id] = {
            left: this.pixelXLinear(this.dragObject[id].x) + "px",
            top: this.chartHeight - this.candidateHeight - this.pixelYLinear(this.dragObject[id].y) + "px",
            width: this.candidateWidth + "px",
            height: this.candidateHeight + "px"
        };
        this.svgStyle[id] = {
            display: 'inherit',
            width: this.candidateWidth,
            height: this.candidateHeight
        };
        this.pathStyle[id] = {
            fill: this.dragObject[id].color
        };
        window.setTimeout(function () {
            _this.moveNumber(id);
        }, 0);
    };
    /**
     * set 既有基站位置
     * @param id
     */
    SitePlanningComponent.prototype.setDefaultBsSize = function (id) {
        var _this = this;
        this.spanStyle[id] = {
            left: this.pixelXLinear(this.dragObject[id].x) + "px",
            top: this.chartHeight - 30 - this.pixelYLinear(this.dragObject[id].y) + "px",
            width: "30px",
            height: "30px"
        };
        this.svgStyle[id] = {
            display: 'inherit',
            width: 30,
            height: 30
        };
        this.pathStyle[id] = {
            fill: this.dragObject[id].color
        };
        window.setTimeout(function () {
            _this.moveNumber(id);
        }, 0);
    };
    /**
     * set UE位置
     * @param id
     */
    SitePlanningComponent.prototype.setUeSize = function (id) {
        this.spanStyle[id] = {
            left: this.pixelXLinear(this.dragObject[id].x) + "px",
            top: this.chartHeight - this.ueHeight - this.pixelYLinear(this.dragObject[id].y) + "px",
            width: this.ueWidth + "px",
            height: this.ueHeight + "px"
        };
        this.svgStyle[id] = {
            display: 'inherit',
            width: this.ueWidth,
            height: this.ueHeight
        };
        this.pathStyle[id] = {
            fill: this.dragObject[id].color
        };
    };
    /** 重設區域寬度 */
    SitePlanningComponent.prototype.resetChartWidth = function () {
        var contentWidth = window.innerWidth - 64;
        this.leftWidth = contentWidth - (contentWidth * 0.3) - 50;
        // document.getElementById('chart').style.width = `${this.leftWidth}px`;
        // document.getElementById('chart').style.overflowY = 'hidden';
    };
    /** 更改RSRP閥值 */
    SitePlanningComponent.prototype.changeRsrpThreshold = function () {
        var msg = '';
        if (this.rsrpThreshold < this.rsrpLowerLimit || this.rsrpThreshold > this.rsrpUpperLimit || isNaN(Number(this.rsrpThreshold)))
            msg = this.translateService.instant('rsrp_fault');
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.rsrpThreshold = Number(sessionStorage.getItem('rsrpThreshold'));
        }
        else {
            this.rsrpThreshold = Number(this.rsrpThreshold);
            sessionStorage.setItem('rsrpThreshold', JSON.stringify(this.rsrpThreshold));
        }
    };
    /** 更改SINR閥值 */
    SitePlanningComponent.prototype.changeSinrThreshold = function () {
        var msg = '';
        console.log(Number(this.sinrThreshold));
        if (this.sinrThreshold < this.sinrLowerLimit || this.sinrThreshold > this.sinrUpperLimit || isNaN(Number(this.sinrThreshold)))
            msg = this.translateService.instant('sinr_fault');
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.sinrThreshold = Number(sessionStorage.getItem('sinrThreshold'));
        }
        else {
            this.sinrThreshold = Number(this.sinrThreshold);
            sessionStorage.setItem('sinrThreshold', JSON.stringify(this.sinrThreshold));
        }
    };
    /**
     * 自訂材質Dialog
     * @param materialId
     */
    SitePlanningComponent.prototype.materialCustomizeDialog = function (materialId) {
        if (materialId != 999) {
            var index = this.materialIdToIndex[materialId];
            var materialName = '';
            if (this.authService.lang == 'zh-TW') {
                materialName = this.materialList[index]['chineseName'];
            }
            else {
                materialName = this.materialList[index]['name'];
            }
            this.materialName = materialName;
            this.materialLossCoefficient = this.materialList[index]['decayCoefficient'];
            this.materialProperty = this.materialList[index]['property'];
        }
        else {
            this.materialName = "";
            this.materialLossCoefficient = 0.1;
            this.materialProperty = "customized";
        }
        this.matDialog.open(this.materialCustomizeModal, { autoFocus: false });
    };
    /**
     * 自訂PathLossModel Dialog
     * @param modelId
     */
    SitePlanningComponent.prototype.pathLossCustomizeDialog = function (modelId) {
        if (modelId != 999) {
            var index = this.modelIdToIndex[modelId];
            var modelName = '';
            if (this.authService.lang == 'zh-TW') {
                modelName = this.modelList[index]['chineseName'];
            }
            else {
                modelName = this.modelList[index]['name'];
            }
            this.modelName = modelName;
            this.modelDissCoefficient = this.modelList[index]['distancePowerLoss'];
            this.modelfieldLoss = this.modelList[index]['fieldLoss'];
            this.modelProperty = this.modelList[index]['property'];
        }
        else {
            this.modelName = "";
            this.modelDissCoefficient = 0.1;
            this.modelfieldLoss = 0.1;
            this.modelProperty = "customized";
        }
        this.matDialog.open(this.modelCustomizeModal, { autoFocus: false });
    };
    /** 發送post requset 編輯材質 */
    SitePlanningComponent.prototype.materialCustomize = function () {
        var _this = this;
        window.setTimeout(function () {
            var url = _this.authService.API_URL + "/updateObstacle/" + _this.authService.userToken;
            var url_get = _this.authService.API_URL + "/getObstacle/" + _this.authService.userToken;
            // console.log("----update",url);
            var isDefault = _this.materialProperty == 'default' ? true : false;
            var chName = isDefault ? _this.materialList[_this.materialIdToIndex[_this.materialId]]['chineseName'] : _this.materialName;
            var materialName = isDefault ? _this.materialList[_this.materialIdToIndex[_this.materialId]]['name'] : _this.materialName;
            var data = {
                'id': Number(_this.materialId),
                'name': materialName,
                'chineseName': chName,
                'decayCoefficient': _this.materialLossCoefficient,
                'property': _this.materialProperty
            };
            console.log(JSON.stringify(data));
            if (_this.checkMaterialForm(false, isDefault)) {
                _this.http.post(url, JSON.stringify(data)).subscribe(function (res) {
                    console.log(res);
                    _this.matDialog.closeAll();
                    // this.ngOnInit();
                    _this.http.get(url_get).subscribe(function (res) {
                        // console.log("----get",url_get);
                        var result = res;
                        var index = 0;
                        for (var i = 0; i < (result).length; i++) {
                            if (result[i]['id'] == _this.materialId) {
                                index = i;
                                // console.log('i',i,'result',result[i]);
                                break;
                            }
                        }
                        _this.materialList[_this.materialIdToIndex[_this.materialId]]['decayCoefficient'] = result[index]['decayCoefficient'];
                        _this.materialList[_this.materialIdToIndex[_this.materialId]]['name'] = result[index]['name'];
                        _this.materialList[_this.materialIdToIndex[_this.materialId]]['chineseName'] = result[index]['chineseName'];
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log(err);
                });
            }
        }, 100);
    };
    /** 發送post requset 編輯PathLossModel */
    SitePlanningComponent.prototype.pathLossCustomize = function () {
        var _this = this;
        window.setTimeout(function () {
            var url_update = _this.authService.API_URL + "/updatePathLossModel/" + _this.authService.userToken;
            var url_get = _this.authService.API_URL + "/getPathLossModel/" + _this.authService.userToken;
            // console.log("----update",url_update);
            var isDefault = _this.modelProperty == 'default' ? true : false;
            var chName = isDefault ? _this.modelList[_this.modelIdToIndex[Number(_this.calculateForm.pathLossModelId)]]['chineseName'] : _this.modelName;
            var modelName = isDefault ? _this.modelList[_this.modelIdToIndex[Number(_this.calculateForm.pathLossModelId)]]['name'] : _this.modelName;
            var data = {
                'id': Number(_this.calculateForm.pathLossModelId),
                'name': modelName,
                'chineseName': chName,
                'distancePowerLoss': _this.modelDissCoefficient,
                'fieldLoss': _this.modelfieldLoss,
                'property': _this.modelProperty
            };
            console.log(JSON.stringify(data));
            console.log("isDefault", isDefault);
            if (_this.checkModelForm(false, isDefault, false)) {
                _this.http.post(url_update, JSON.stringify(data)).subscribe(function (res) {
                    console.log(res);
                    _this.matDialog.closeAll();
                    _this.http.get(url_get).subscribe(function (res) {
                        // console.log("----get",url_get);
                        var result = res;
                        var index = 0;
                        for (var i = 0; i < (result).length; i++) {
                            if (result[i]['id'] == _this.calculateForm.pathLossModelId) {
                                index = i;
                                // console.log('i',i,'result',result[i]);
                                break;
                            }
                        }
                        _this.modelList[_this.modelIdToIndex[_this.calculateForm.pathLossModelId]]['name'] = result[index]['name'];
                        _this.modelList[_this.modelIdToIndex[_this.calculateForm.pathLossModelId]]['chineseName'] = result[index]['chineseName'];
                        _this.modelList[_this.modelIdToIndex[_this.calculateForm.pathLossModelId]]['distancePowerLoss'] = result[index]['distancePowerLoss'];
                        _this.modelList[_this.modelIdToIndex[_this.calculateForm.pathLossModelId]]['fieldLoss'] = result[index]['fieldLoss'];
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log(err);
                });
            }
        }, 100);
    };
    /** 發送post requset 新增材質 */
    SitePlanningComponent.prototype.createNewMaterial = function () {
        var _this = this;
        // console.log("createNewMaterial",this.materialName,this.materialLossCoefficient);
        // console.log("this.materialName.length",String(this.materialName).length);
        if (this.checkMaterialForm(true, false)) {
            // 新增材質到後端
            var url_2 = this.authService.API_URL + "/addObstacle/" + this.authService.userToken;
            var url_get_1 = this.authService.API_URL + "/getObstacle/" + this.authService.userToken;
            window.setTimeout(function () {
                // console.log("----post----",url);
                var data = {
                    'name': _this.materialName,
                    'decayCoefficient': _this.materialLossCoefficient,
                    'property': "customized"
                };
                console.log(JSON.stringify(data));
                _this.http.post(url_2, JSON.stringify(data)).subscribe(function (res) {
                    console.log(res);
                    _this.http.get(url_get_1).subscribe(function (res) {
                        // console.log("----get",url_get);
                        var result = res;
                        _this.materialList.push(result[(result.length - 1)]);
                        for (var i = 0; i < _this.materialList.length; i++) {
                            var id = _this.materialList[i]['id'];
                            _this.materialIdToIndex[id] = i;
                        }
                        // this.materialId = result[(result.length-1)]['id'];
                    }, function (err) {
                        console.log(err);
                    });
                    _this.materialName = "";
                    _this.materialLossCoefficient = 0.1;
                    _this.createMaterialSuccessDialog();
                    // this.matDialog.closeAll();
                    // this.ngOnInit();
                }, function (err) {
                    console.log(err);
                });
            }, 100);
        }
    };
    /**
     * 檢查材質相關欄位
     * @param create 新增或編輯
     * @param isDefault 預設或自訂
    */
    SitePlanningComponent.prototype.checkMaterialForm = function (isCreate, isDefault) {
        var pass = true;
        var duplicate = false;
        var reg_ch = new RegExp('[\u4E00-\u9FFF]+');
        var reg_tch = new RegExp('[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+');
        var reg_en = new RegExp('[\A-Za-z]+');
        var reg_num = new RegExp('[\0-9]+');
        var reg_spc = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~《》~！@#￥……&\*（）——\|{}【】‘；：”“'。，、?]/;
        // format checking 包含特殊字元 || 不是英文中文數字
        var illegal = ((reg_spc.test(this.materialName) || reg_tch.test(this.materialName)) || (!(reg_ch.test(this.materialName)) && !(reg_en.test(this.materialName)) && !(reg_num.test(this.materialName))));
        if (isDefault) {
            illegal = false;
        }
        // 檢查現有材質名稱是否已存在
        if (isCreate) {
            for (var i = 0; i < this.materialList.length; i++) {
                if (this.materialName == this.materialList[i]['name'] || this.materialName == this.materialList[i]['chineseName']) {
                    console.log("duplicate by", this.materialName);
                    duplicate = true;
                    break;
                }
            }
        }
        // 錯誤訊息
        if (!this.materialName || !(Number(this.materialLossCoefficient) > -1000) || this.materialLossCoefficient == null || Number(this.materialLossCoefficient > 1000) || duplicate || illegal) {
            pass = false;
            var msg = "";
            if (!this.materialName) {
                msg += this.translateService.instant('material.name') + ' ' + this.translateService.instant('length') + ' ' + this.translateService.instant('must_greater_than') + ' 0';
            }
            else if (!(Number(this.materialLossCoefficient) > -1000)) {
                msg += this.translateService.instant('material.loss.coefficient') + ' ' + this.translateService.instant('must_greater_than') + ' -1000';
            }
            else if (Number(this.materialLossCoefficient) > 1000) {
                msg += this.translateService.instant('material.loss.coefficient') + ' ' + this.translateService.instant('must_less_than') + ' 1000';
            }
            else if (this.materialLossCoefficient == null) {
                msg += this.translateService.instant('material.loss.coefficient') + ' ' + this.translateService.instant('contain_special_character') + '!';
            }
            else if (illegal) {
                msg += this.translateService.instant('material.name') + ' ' + this.translateService.instant('contain_special_character') + '!';
            }
            else {
                msg += this.translateService.instant('material.name') + ': ' + this.materialName + ' ' + this.translateService.instant('alreadyexist') + '!';
            }
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
        return pass;
    };
    /** 發送post request 新增PathLossModel */
    SitePlanningComponent.prototype.createNewModel = function () {
        var _this = this;
        if (this.checkModelForm(true, false, false)) {
            // 新增無線模型到後端
            var url_add_1 = this.authService.API_URL + "/addPathLossModel/" + this.authService.userToken;
            var url_get_2 = this.authService.API_URL + "/getPathLossModel/" + this.authService.userToken;
            window.setTimeout(function () {
                // console.log("----post",url_add);
                var data = {
                    'name': _this.modelName,
                    'distancePowerLoss': _this.modelDissCoefficient,
                    'fieldLoss': _this.modelfieldLoss,
                    'property': "customized"
                };
                console.log(JSON.stringify(data));
                _this.http.post(url_add_1, JSON.stringify(data)).subscribe(function (res) {
                    console.log(res);
                    _this.http.get(url_get_2).subscribe(function (res) {
                        // console.log("----get",url_get);
                        var result = res;
                        _this.modelList.push(result[(result.length - 1)]);
                        for (var i = 0; i < _this.modelList.length; i++) {
                            var id = _this.modelList[i]['id'];
                            _this.modelIdToIndex[id] = i;
                        }
                        // this.calculateForm.pathLossModelId = result[(result.length-1)]['id'];
                        console.log('this.calculateForm.pathLossModelId', _this.calculateForm.pathLossModelId);
                        console.log('this.modelList.push', _this.modelList);
                    }, function (err) {
                        console.log(err);
                    });
                    _this.createModelSuccessDialog();
                    // this.modelName = "";
                    // this.modelDissCoefficient = 0.1;
                    // this.modelfieldLoss = 0.1;
                    // this.matDialog.closeAll();
                    // this.ngOnInit();
                }, function (err) {
                    console.log(err);
                });
            }, 100);
        }
    };
    /**
     * 檢查PathLossModel相關欄位
     * @param isCreate 新增或編輯
     * @param isDefault 預設或自訂
     * @param isCalculate 是否為PathLossModel校正
    */
    SitePlanningComponent.prototype.checkModelForm = function (isCreate, isDefault, isCalculate) {
        var pass = true;
        var duplicate = false;
        var reg_ch = new RegExp('[\u4E00-\u9FFF]+');
        var reg_tch = new RegExp('[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+');
        var reg_en = new RegExp('[\A-Za-z]+');
        var reg_num = new RegExp('[\0-9]+');
        var reg_spc = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~《》~！@#￥……&\*（）——\|{}【】‘；：”“'。，、?]/;
        var msg = "";
        var noFile = false;
        // format checking 包含特殊字元 || 不是英文中文數字
        var illegal = ((reg_spc.test(this.modelName) || reg_tch.test(this.modelName)) || (!(reg_ch.test(this.modelName)) && !(reg_en.test(this.modelName)) && !(reg_num.test(this.modelName))));
        if (isDefault) {
            illegal = false;
        }
        // 檢查現有模型名稱是否已存在
        if (isCreate || isCalculate) {
            for (var i = 0; i < this.modelList.length; i++) {
                if (this.modelName == this.modelList[i]['name'] || this.modelName == this.modelList[i]['chineseName']) {
                    console.log("duplicate by", this.modelName);
                    duplicate = true;
                    break;
                }
            }
        }
        if (isCalculate) {
            if (this.modelFileName == '') {
                console.log('empty!');
                noFile = true;
            }
        }
        if (!this.modelName || duplicate || illegal || noFile) {
            pass = false;
            if (!this.modelName) {
                msg += this.translateService.instant('planning.model.name') + ' ' + this.translateService.instant('length') + ' ' + this.translateService.instant('must_greater_than') + '0';
            }
            else if (illegal) {
                msg += this.translateService.instant('planning.model.name') + ' ' + this.translateService.instant('contain_special_character') + '!';
            }
            else if (duplicate) {
                msg += this.translateService.instant('planning.model.name') + ': ' + this.modelName + ' ' + this.translateService.instant('alreadyexist') + '!';
            }
            else {
                msg += this.translateService.instant('plz_import') + ' ' + this.translateService.instant('antennaFieldData');
            }
        }
        else if (!isCalculate && (!(Number(this.modelDissCoefficient) > -1000) || this.modelDissCoefficient == null || Number(this.modelDissCoefficient > 1000) || !(Number(this.modelfieldLoss) > -1000) || this.modelfieldLoss == null || Number(this.modelfieldLoss > 1000))) {
            pass = false;
            if (!(Number(this.modelDissCoefficient) > -1000)) {
                msg += this.translateService.instant('planning.model.disscoefficient') + ' ' + this.translateService.instant('must_greater_than') + ' -1000';
            }
            else if (this.modelDissCoefficient == null) {
                msg += this.translateService.instant('planning.model.disscoefficient') + ' ' + this.translateService.instant('contain_special_character') + '!';
            }
            else if (Number(this.modelDissCoefficient > 1000)) {
                msg += this.translateService.instant('planning.model.disscoefficient') + ' ' + this.translateService.instant('must_less_than') + ' 1000';
            }
            else if (!(Number(this.modelfieldLoss) > -1000)) {
                msg += this.translateService.instant('planning.model.fieldLoss') + ' ' + this.translateService.instant('must_greater_than') + ' -1000';
            }
            else if (this.modelfieldLoss == null) {
                msg += this.translateService.instant('planning.model.fieldLoss') + ' ' + this.translateService.instant('contain_special_character') + '!';
            }
            else if (Number(this.modelfieldLoss > 1000)) {
                msg += this.translateService.instant('planning.model.fieldLoss') + ' ' + this.translateService.instant('must_less_than') + ' 1000';
            }
        }
        if (msg != "") {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
        return pass;
    };
    /** 依照匯入的觀測點建立無線模型 */
    SitePlanningComponent.prototype.calculatePathlossModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var url_add, url_get, url_poll, formData, hash, posResult, body, status_1, getResult, i, id, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.checkModelForm(true, false, true)) return [3 /*break*/, 11];
                        url_add = this.authService.API_URL + "/calculatePathLossModel/" + this.authService.userToken;
                        url_get = this.authService.API_URL + "/getPathLossModel/" + this.authService.userToken;
                        url_poll = this.authService.API_URL + "/pollingPathLossModel/" + this.authService.userToken;
                        formData = new FormData();
                        return [4 /*yield*/, this.hashfile(this.file).then(function (res) { return res.toString(); })];
                    case 1:
                        hash = _a.sent();
                        posResult = void 0;
                        formData.append('file', this.file);
                        formData.append('name', this.modelName);
                        formData.append('sha256sum', hash);
                        formData.append('property', 'customized');
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, this.postRequest(url_add, formData)];
                    case 3:
                        posResult = _a.sent();
                        body = [{ "id": posResult['id'] }];
                        return [4 /*yield*/, this.postRequest(url_poll, JSON.stringify(body))];
                    case 4:
                        status_1 = _a.sent();
                        console.log(status_1);
                        _a.label = 5;
                    case 5:
                        if (!(status_1[0]['status'] == 503)) return [3 /*break*/, 7];
                        console.log("computing", status_1);
                        return [4 /*yield*/, this.postRequest(url_poll, JSON.stringify(body))];
                    case 6:
                        status_1 = _a.sent();
                        return [3 /*break*/, 5];
                    case 7:
                        if (!(status_1[0]['status'] == 200)) return [3 /*break*/, 9];
                        console.log(posResult['id'], 'done');
                        this.calModelDissCoefficient = status_1[0]['distancePowerLoss'];
                        this.calModelfieldLoss = status_1[0]['fieldLoss'];
                        return [4 /*yield*/, this.getRequest(url_get)];
                    case 8:
                        getResult = _a.sent();
                        console.log("getResult", getResult);
                        this.modelList.push(getResult[(getResult.length - 1)]);
                        for (i = 0; i < this.modelList.length; i++) {
                            id = this.modelList[i]['id'];
                            this.modelIdToIndex[id] = i;
                        }
                        // this.calculateForm.pathLossModelId = getResult[(getResult.length-1)]['id'];
                        // console.log('this.calculateForm.pathLossModelId',this.calculateForm.pathLossModelId);
                        console.log('new model id', getResult[(getResult.length - 1)]['id']);
                        console.log(this.modelList);
                        this.calculateSuccessDialog();
                        this.createMethod = 'formula';
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_1 = _a.sent();
                        console.log('error', error_1);
                        this.msgDialogConfig.data = {
                            type: 'error',
                            infoMessage: this.translateService.instant(error_1.error.msg)
                        };
                        this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
                        return [2 /*return*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /** error handle */
    SitePlanningComponent.prototype.handleError = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('An error occurred in MyService', error);
                return [2 /*return*/, Promise.reject(error.message || error)];
            });
        });
    };
    /** http post request */
    SitePlanningComponent.prototype.postRequest = function (url, data) {
        return this.http.post(url, data)
            .toPromise();
        /*
        .then(response =>
          ...
        })
          */
        // .catch(this.handleError);
        // .catch(error => {
        //   console.log('error',error);
        //   console.log("error.error",error.error);
        //   console.log("error.status",error.status);
        //   this.errMsg = error.error;
        //   this.statusCode = error.status;
        // });
    };
    /** http get request */
    SitePlanningComponent.prototype.getRequest = function (url) {
        return this.http.get(url)
            .toPromise();
        // .catch(this.handleError);
    };
    /** close all Dialog */
    SitePlanningComponent.prototype.selectAndClose = function () {
        this.matDialog.closeAll();
    };
    /** open delete material dialog */
    SitePlanningComponent.prototype.deleteMaterialDialog = function () {
        this.matDialog.open(this.confirmDeleteMaterial);
    };
    /** open delete model dialog */
    SitePlanningComponent.prototype.deleteModelDialog = function () {
        this.matDialog.open(this.confirmDeleteModel);
    };
    /** open create model success modal */
    SitePlanningComponent.prototype.createModelSuccessDialog = function () {
        this.matDialog.open(this.createModelSuccessModal);
    };
    /** open create material success modal */
    SitePlanningComponent.prototype.createMaterialSuccessDialog = function () {
        this.matDialog.open(this.createMaterialSuccessModal);
    };
    /** open complate calculate model success modal */
    SitePlanningComponent.prototype.calculateSuccessDialog = function () {
        this.matDialog.open(this.calculateModelSuccessModal);
    };
    /**
     * 刪除材質
     * @param flag 是否確認刪除
     */
    SitePlanningComponent.prototype.deleteMaterial = function (flag) {
        var _this = this;
        this.matDialog.closeAll();
        if (flag) {
            var url_3 = this.authService.API_URL + "/deleteObstacle/" + this.authService.userToken;
            window.setTimeout(function () {
                // console.log("----(post) delete",url);
                var data = {
                    'id': Number(_this.materialId),
                    'name': _this.materialName
                };
                _this.deleteMaterialList.push(Number(_this.materialId));
                _this.materialList[_this.materialIdToIndex[_this.materialId]].name = "";
                _this.http.post(url_3, JSON.stringify(data)).subscribe(function (res) {
                    console.log(res);
                    for (var i = 0; i < _this.obstacleList.length; i++) {
                        var obj = _this.dragObject[_this.obstacleList[i]];
                        if (obj.type != "obstacle") {
                            continue;
                        }
                        else if (!(Number(obj.material) in _this.materialIdToIndex) || _this.deleteMaterialList.includes(Number(obj.material))) {
                            // console.log("replace:",this.dragObject[this.obstacleList[i]]);
                            _this.dragObject[_this.obstacleList[i]].material = _this.materialList[0]['id'];
                            _this.dragObject[_this.obstacleList[i]].materialName = (_this.checkIfChinese()) ? _this.materialList[0]['chineseName'] : _this.materialList[0]['name'];
                            // this.dragObject[this.obstacleList[i]].materialName = this.materialList[0]['name'];
                        }
                    }
                }, function (err) {
                    console.log('err:', err);
                });
            }, 100);
        }
        else {
            this.matDialog.open(this.materialCustomizeModal);
        }
    };
    /**
     * 刪除模型
     * @param flag 確認是否刪除
     */
    SitePlanningComponent.prototype.deleteModel = function (flag) {
        var _this = this;
        this.matDialog.closeAll();
        if (flag) {
            // DELETE API
            window.setTimeout(function () {
                var url = _this.authService.API_URL + "/deletePathLossModel/" + _this.authService.userToken;
                var url_get = _this.authService.API_URL + "/getPathLossModel/" + _this.authService.userToken;
                // console.log("----(post) delete",url);
                var data = {
                    'id': Number(_this.calculateForm.pathLossModelId),
                    'name': _this.modelName
                };
                console.log(JSON.stringify(data));
                /*
                let httpOptions = {
                  headers: {},
                  body: JSON.stringify(data)
                }
                */
                _this.http.post(url, JSON.stringify(data)).subscribe(function (res) {
                    console.log(res);
                    // this.ngOnInit();
                    _this.http.get(url_get).subscribe(function (res) {
                        // console.log("----get",url_get);
                        _this.modelList = Object.values(res);
                        for (var i = 0; i < _this.modelList.length; i++) {
                            var id = _this.modelList[i]['id'];
                            _this.modelIdToIndex[id] = i;
                        }
                        _this.calculateForm.pathLossModelId = _this.modelList[0]['id'];
                    }, function (err) {
                        console.log(err);
                    });
                }, function (err) {
                    console.log('err:', err);
                    // this.ngOnInit();
                });
            }, 100);
        }
        else {
            this.matDialog.open(this.modelCustomizeModal);
        }
    };
    /** 檢查目前語言是否為中文 */
    SitePlanningComponent.prototype.checkIfChinese = function () {
        if (this.authService.lang == 'zh-TW') {
            return true;
        }
        else {
            return false;
        }
    };
    /** 根據場域長寬建立解析度list */
    SitePlanningComponent.prototype.createResolutionList = function () {
        var resolution = 2;
        while ((this.calculateForm.width / resolution >= 6) && (this.calculateForm.height / resolution >= 6) && resolution <= 10) {
            this.resolutionList.push(resolution);
            resolution += 2;
        }
    };
    /** 座標軸說明視窗 */
    SitePlanningComponent.prototype.coordinateInfo = function () {
        this.matDialog.open(this.coordinateInfoModal);
    };
    /**
     * 天線製造商filter
     * @param svgid 既有基站的id
     */
    SitePlanningComponent.prototype.manufactorChange = function (svgid) {
        // svgid ==> deafault, else ==> candidate
        if (svgid != null) {
            var manufactor = this.manufactor;
        }
        else {
            var manufactor = this.manufactorCal;
        }
        if (manufactor == 'All') { // all manufactor not specify
            return;
        }
        else {
            // take first antenna of manufactor
            var firstAntenna = 0;
            for (var _i = 0, _a = this.antennaList; _i < _a.length; _i++) {
                var item = _a[_i];
                if (item['manufactor'] == manufactor) {
                    firstAntenna = item['antennaID'];
                    break;
                }
            }
            if (svgid != null) {
                this.bsListRfParam[svgid].AntennaId = firstAntenna;
            }
            else {
                this.tempCalParamSet.AntennaId = firstAntenna;
                ;
            }
            this.antennaChangeCheck(svgid);
        }
    };
    /**
     * 根據檢查天線相關欄位
     * @param svgid 既有基站的id
     */
    SitePlanningComponent.prototype.antennaChangeCheck = function (svgid) {
        var thershold = 100;
        var error = false;
        var msg = "";
        var multiple = false;
        // TDD
        if (svgid != null) {
            // 根據天線類型將欄位歸零
            if (this.antennaList[this.AntennaIdToIndex[this.bsListRfParam[svgid].AntennaId]]['antennaType'] == 'Omnidirectional') {
                this.bsListRfParam[svgid].theta = 0;
                this.bsListRfParam[svgid].phi = 0;
            }
            else {
                this.bsListRfParam[svgid].bsTxGain = 0;
                // 檢查天線frequency與基站frequency是否一致(+-100)
                var Antfrequency = this.antennaList[this.AntennaIdToIndex[this.bsListRfParam[svgid].AntennaId]]['frequency'];
                if (this.duplexMode == 'tdd' && !(this.authService.isEmpty(this.bsListRfParam[svgid].tddfrequency))) {
                    if (!((Antfrequency - thershold <= this.bsListRfParam[svgid].tddfrequency) && (Antfrequency + thershold >= this.bsListRfParam[svgid].tddfrequency))) {
                        msg += this.translateService.instant('tddfrequency') + ' ' + this.bsListRfParam[svgid].tddfrequency + ' ';
                        error = true;
                    }
                }
                else if (this.duplexMode == 'fdd' && !(this.authService.isEmpty(this.bsListRfParam[svgid].fddUlFrequency)) && !(this.authService.isEmpty(this.bsListRfParam[svgid].fddDlFrequency))) {
                    if (!((Antfrequency - thershold <= this.bsListRfParam[svgid].fddUlFrequency) && (Antfrequency + thershold >= this.bsListRfParam[svgid].fddUlFrequency))) {
                        msg += this.translateService.instant('uplink.frequency') + ' ' + this.bsListRfParam[svgid].fddUlFrequency + ' ';
                        error = true;
                    }
                    if (!((Antfrequency - thershold <= this.bsListRfParam[svgid].fddDlFrequency) && (Antfrequency + thershold >= this.bsListRfParam[svgid].fddDlFrequency))) {
                        if (error) {
                            if (this.checkIfChinese()) {
                                msg += ' 和 ';
                            }
                            else {
                                msg += ' and the ';
                            }
                            multiple = true;
                        }
                        msg += this.translateService.instant('downlink.frequency') + ' ' + this.bsListRfParam[svgid].fddDlFrequency + ' ';
                        error = true;
                    }
                }
            }
        }
        else { //FDD
            if (this.antennaList[this.AntennaIdToIndex[this.tempCalParamSet.AntennaId]]['antennaType'] == 'Omnidirectional') {
                this.tempCalParamSet.theta = 0;
                this.tempCalParamSet.phi = 0;
            }
            else {
                this.tempCalParamSet.bsTxGain = 0;
                var Antfrequency = this.antennaList[this.AntennaIdToIndex[this.tempCalParamSet.AntennaId]]['frequency'];
                if (this.duplexMode == 'tdd' && !(this.authService.isEmpty(this.tempCalParamSet.tddfrequency))) {
                    if (!((Antfrequency - thershold <= this.tempCalParamSet.tddfrequency) && (Antfrequency + thershold >= this.tempCalParamSet.tddfrequency))) {
                        msg += this.translateService.instant('tddfrequency') + ' ' + this.tempCalParamSet.tddfrequency + ' ';
                        error = true;
                    }
                }
                else if (this.duplexMode == 'fdd' && !(this.authService.isEmpty(this.tempCalParamSet.fddUlFrequency)) && !(this.authService.isEmpty(this.tempCalParamSet.fddDlFrequency))) {
                    if (!((Antfrequency - thershold <= this.tempCalParamSet.fddUlFrequency) && (Antfrequency + thershold >= this.tempCalParamSet.fddUlFrequency))) {
                        msg += this.translateService.instant('uplink.frequency') + ' ' + this.tempCalParamSet.fddUlFrequency + ' ';
                        error = true;
                    }
                    if (!((Antfrequency - thershold <= this.tempCalParamSet.fddDlFrequency) && (Antfrequency + thershold >= this.tempCalParamSet.fddDlFrequency))) {
                        if (error) {
                            if (this.checkIfChinese()) {
                                msg += ' 和 ';
                            }
                            else {
                                msg += ' and the ';
                            }
                            multiple = true;
                        }
                        msg += this.translateService.instant('downlink.frequency') + ' ' + this.tempCalParamSet.fddDlFrequency + ' ';
                        error = true;
                    }
                }
            }
        }
        if (error) {
            if (this.checkIfChinese()) {
                this.infoMsg = "您所設置的" + msg + " 與天線頻率 " + Antfrequency + " 差異較大, 可能導致計算結果不準確";
            }
            else {
                var msgString = "you set is ";
                if (multiple) {
                    msgString = "you set are ";
                }
                this.infoMsg = "<br>The " + msg + msgString + "quite different from the antenna frequency " + Antfrequency + ",<br> which may cause inaccurate calculation results.";
            }
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.infoMsg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
        }
    };
    /**
     * 檢查theta改變後是否超出範圍
     * @param svgId 既有基站的id
     * @param isCandidate
     */
    SitePlanningComponent.prototype.changeTheta = function (svgId, isCandidate) {
        var msg = '';
        if (isCandidate) {
            if ((Number(this.tempCalParamSet.theta) > 180 || Number(this.tempCalParamSet.theta) < 0)) {
                msg = this.translateService.instant('theta_out_of_range');
                this.tempCalParamSet.theta = Number(window.sessionStorage.getItem('tempParam'));
            }
        }
        else {
            if ((Number(this.bsListRfParam[svgId].theta) > 180 || Number(this.bsListRfParam[svgId].theta) < 0)) {
                msg = this.translateService.instant('theta_out_of_range');
                this.bsListRfParam[svgId].theta = Number(window.sessionStorage.getItem('tempParam'));
            }
        }
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            // return;
        }
    };
    /**
     * 檢查phi改變後是否超出範圍
     * @param svgId 既有基站的id
     * @param isCandidate
     */
    SitePlanningComponent.prototype.changePhi = function (svgId, isCandidate) {
        var msg = '';
        if (isCandidate) {
            if ((Number(this.tempCalParamSet.phi) > 360 || Number(this.tempCalParamSet.phi) < 0)) {
                msg = this.translateService.instant('phi_out_of_range');
                this.tempCalParamSet.phi = Number(window.sessionStorage.getItem('tempParam'));
            }
        }
        else {
            if ((Number(this.bsListRfParam[svgId].phi) > 360 || Number(this.bsListRfParam[svgId].phi) < 0)) {
                msg = this.translateService.instant('phi_out_of_range');
                this.bsListRfParam[svgId].phi = Number(window.sessionStorage.getItem('tempParam'));
            }
        }
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            // return;
        }
    };
    /** 將天線類型轉換為全向性 */
    SitePlanningComponent.prototype.changeAntennaToOmidirectial = function () {
        this.manufactor = "All";
        this.manufactorCal = "All";
        for (var _i = 0, _a = this.defaultBSList; _i < _a.length; _i++) {
            var svgid = _a[_i];
            this.bsListRfParam[svgid].AntennaId = 1;
        }
        this.tempCalParamSet.AntennaId = 1;
    };
    /**
     * 上傳檔案
     * @param event
     * @returns 無上傳檔案則終止
     */
    SitePlanningComponent.prototype.uploadFile = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var file;
            return __generator(this, function (_a) {
                file = event.target.files[0];
                event.target.value = null;
                if (file == undefined) {
                    return [2 /*return*/];
                }
                this.file = file;
                this.modelFileName = this.showPartName(file.name);
                return [2 /*return*/];
            });
        });
    };
    /**
     * 當字元長度超過25僅顯示前後10字元
     * @param name
     * @returns
     */
    SitePlanningComponent.prototype.showPartName = function (name) {
        if (name.length > 25) {
            return name.slice(0, 10) + '...' + name.slice(-10);
        }
        else {
            return name;
        }
    };
    /** 清除新增無線模型相關欄位資料 */
    SitePlanningComponent.prototype.cleanData = function () {
        this.file = null;
        this.modelName = "";
        this.modelDissCoefficient = null;
        this.modelfieldLoss = null;
        this.modelFileName = "";
    };
    /**
     * SHA256 hash
     * @param file
     * @returns
     */
    SitePlanningComponent.prototype.hashfile = function (file) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            var hash = '';
            reader.readAsArrayBuffer(file);
            reader.onload = function () {
                var wordArray = crypto_js_1["default"].lib.WordArray.create(reader.result);
                hash = crypto_js_1["default"].SHA256(wordArray).toString();
                resolve(hash.toString());
            };
        });
    };
    /**
     * delay ms second
     */
    SitePlanningComponent.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    /** change create pathLossModel method */
    SitePlanningComponent.prototype.changeCreateMethod = function () {
        console.log('change', this.createMethod);
        if (this.createMethod == 'importFile') {
            this.modelDissCoefficient = null;
            this.modelfieldLoss = null;
        }
        else {
            this.modelDissCoefficient = 0.1;
            this.modelfieldLoss = 0.1;
        }
    };
    SitePlanningComponent.prototype.addSINR = function () {
        this.evaluationFuncForm.field.sinr.ratio.push({
            "areaRatio": this.defaultArea,
            "compliance": "moreThan",
            "value": this.defaultSINRSetting
        });
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.delSINR = function (index) {
        this.evaluationFuncForm.field.sinr.ratio.splice(index, 1);
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.addRSRP = function () {
        this.evaluationFuncForm.field.rsrp.ratio.push({
            "areaRatio": this.defaultArea,
            "compliance": "moreThan",
            "value": this.defaultRSRPSetting
        });
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.delRSRP = function (index) {
        this.evaluationFuncForm.field.rsrp.ratio.splice(index, 1);
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.addThroughput = function () {
        this.fieldThroughputTypeArr[this.evaluationFuncForm.field.throughput.ratio.length] = 'UL';
        this.fieldThroughputValueArr[this.evaluationFuncForm.field.throughput.ratio.length] = this.defaultULThroughputSetting;
        this.evaluationFuncForm.field.throughput.ratio.push({
            "areaRatio": this.defaultArea,
            "compliance": "moreThan",
            "ULValue": this.defaultULThroughputSetting,
            "DLValue": null
        });
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.delThroughput = function (index) {
        this.evaluationFuncForm.field.throughput.ratio.splice(index, 1);
        this.fieldThroughputTypeArr.splice(index, 1);
        this.fieldThroughputValueArr.splice(index, 1);
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.addUEThroughput = function () {
        this.ueThroughputTypeArr[this.evaluationFuncForm.ue.throughputByRsrp.ratio.length] = 'UL';
        this.ueThroughputValueArr[this.evaluationFuncForm.ue.throughputByRsrp.ratio.length] = this.defaultUEULThroughputSetting;
        this.evaluationFuncForm.ue.throughputByRsrp.ratio.push({
            "countRatio": this.defaultArea,
            "compliance": "moreThan",
            "ULValue": this.defaultUEULThroughputSetting,
            "DLValue": null
        });
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.delUEThroughput = function (index) {
        this.evaluationFuncForm.ue.throughputByRsrp.ratio.splice(index, 1);
        this.ueThroughputTypeArr.splice(index, 1);
        this.ueThroughputValueArr.splice(index, 1);
        this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.checkPercent = function (area) {
        console.log('Check area:' + area);
        var msg = '';
        if (area < 1 || area > 100 || isNaN(Number(area)) || area == '') {
            msg = this.translateService.instant('percent_fault');
        }
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.getStorageEvaluationFuncForm(); //還原舊參數
        }
        //else{      
        //  this.setStorageEvaluationFuncForm();
        //}
    };
    SitePlanningComponent.prototype.checkSINR = function (sinr) {
        console.log('Check sinr:' + sinr);
        var msg = '';
        if (sinr < this.sinrLowerLimit || sinr > this.sinrUpperLimit || isNaN(Number(sinr)) || sinr == '')
            msg = this.translateService.instant('sinr_fault');
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.getStorageEvaluationFuncForm(); //還原舊參數
        }
        //else{      
        //  this.setStorageEvaluationFuncForm();
        //}
    };
    SitePlanningComponent.prototype.checkRSRP = function (rsrp) {
        console.log('Check rsrp:' + rsrp);
        var msg = '';
        if (rsrp < this.rsrpLowerLimit || rsrp > this.rsrpUpperLimit || isNaN(Number(rsrp)) || rsrp == '')
            msg = this.translateService.instant('rsrp_fault');
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.getStorageEvaluationFuncForm(); //還原舊參數
        }
        //else{      
        //  this.setStorageEvaluationFuncForm();
        //}
    };
    SitePlanningComponent.prototype.checkThroughput = function (throughput, isULorDL, index) {
        console.log('Check throughput:' + throughput);
        var msg = '';
        if (isULorDL == 'UL') {
            if (throughput < this.ulThroughputLowerLimit || throughput > this.ulThroughputUpperLimit || isNaN(Number(throughput)))
                msg = this.translateService.instant('ulthroughput_fault');
        }
        else if (isULorDL == 'DL') {
            if (throughput < this.dlThroughputLowerLimit || throughput > this.dlThroughputUpperLimit || isNaN(Number(throughput)))
                msg = this.translateService.instant('dlthroughput_fault');
        }
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.getStorageEvaluationFuncForm(); //還原舊參數
        }
        else {
            if (isULorDL == 'UL') {
                this.evaluationFuncForm.field.throughput.ratio[index].ULValue = throughput;
                this.evaluationFuncForm.field.throughput.ratio[index].DLValue = null;
            }
            else if (isULorDL == 'DL') {
                this.evaluationFuncForm.field.throughput.ratio[index].DLValue = throughput;
                this.evaluationFuncForm.field.throughput.ratio[index].ULValue = null;
            }
            //this.setStorageEvaluationFuncForm();
        }
    };
    SitePlanningComponent.prototype.checkUEThroughput = function (throughput, isULorDL, index) {
        console.log('Check throughput:' + throughput);
        var msg = '';
        if (isULorDL == 'UL') {
            if (throughput < this.ulThroughputLowerLimit || throughput > this.ulThroughputUpperLimit || isNaN(Number(throughput)))
                msg = this.translateService.instant('ulthroughput_fault');
        }
        else if (isULorDL == 'DL') {
            if (throughput < this.dlThroughputLowerLimit || throughput > this.dlThroughputUpperLimit || isNaN(Number(throughput)))
                msg = this.translateService.instant('dlthroughput_fault');
        }
        if (msg != '') {
            this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
            };
            this.matDialog.open(msg_dialog_component_1.MsgDialogComponent, this.msgDialogConfig);
            this.getStorageEvaluationFuncForm(); //還原舊參數
        }
        else {
            if (isULorDL == 'UL') {
                this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = throughput;
                this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = null;
            }
            else if (isULorDL == 'DL') {
                this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = throughput;
                this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = null;
            }
            //this.setStorageEvaluationFuncForm();
        }
    };
    // checkULThroughput(throughput) {
    //   console.log('Check throughput:'+ throughput);
    //   let msg = '';
    //   if(throughput < this.ulThroughputLowerLimit || throughput > this.ulThroughputUpperLimit || isNaN(Number(throughput)))
    //     msg = this.translateService.instant('ulthroughput_fault');
    //   if (msg != '') {
    //     this.msgDialogConfig.data = {
    //       type: 'error',
    //       infoMessage: msg
    //     };
    //     this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    //   }
    //   else{      
    //     this.setStorageEvaluationFuncForm();
    //   }
    // }
    // checkDLThroughput(throughput) {
    //   console.log('Check throughput:'+ throughput);
    //   let msg = '';
    //   if(throughput < this.dlThroughputLowerLimit || throughput > this.dlThroughputUpperLimit || isNaN(Number(throughput)))
    //     msg = this.translateService.instant('dlthroughput_fault');
    //   if (msg != '') {
    //     this.msgDialogConfig.data = {
    //       type: 'error',
    //       infoMessage: msg
    //     };
    //     this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    //   }
    //   else{      
    //     this.setStorageEvaluationFuncForm();
    //   }
    // }
    SitePlanningComponent.prototype.getPlanningIndex = function () {
        if (window.sessionStorage.getItem("planningIndex") != null) {
            this.planningIndex = window.sessionStorage.getItem("planningIndex");
            console.log("this.planningIndex = " + this.planningIndex);
        }
        else {
            this.changePlaningIndexByEvaluationForm();
            console.log("this.planningIndex = " + this.planningIndex);
        }
    };
    SitePlanningComponent.prototype.setPlanningIndex = function () {
        window.sessionStorage.setItem("planningIndex", this.planningIndex);
        console.log("this.planningIndex = " + this.planningIndex);
    };
    SitePlanningComponent.prototype.changePlaningIndexByEvaluationForm = function () {
        var isField = (this.evaluationFuncForm.field.coverage.activate || this.evaluationFuncForm.field.sinr.activate ||
            this.evaluationFuncForm.field.rsrp.activate || this.evaluationFuncForm.field.throughput.activate);
        var isUe = (this.evaluationFuncForm.ue.coverage.activate || this.evaluationFuncForm.ue.throughputByRsrp.activate);
        console.log(this.evaluationFuncForm);
        if (isField) {
            this.planningIndex = '1';
            return true;
        }
        else if (isUe) {
            this.planningIndex = '2';
            return true;
        }
        else {
            this.planningIndex = '1';
            return false;
        }
    };
    SitePlanningComponent.prototype.changeAreaFormatToPercent = function () {
        var i = 0;
        if (this.evaluationFuncForm.field.coverage.ratio * 100 <= 100)
            this.evaluationFuncForm.field.coverage.ratio = this.evaluationFuncForm.field.coverage.ratio * 100;
        for (i = 0; i < this.evaluationFuncForm.field.sinr.ratio.length; i++) {
            if (this.evaluationFuncForm.field.sinr.ratio[i].areaRatio * 100 <= 100)
                this.evaluationFuncForm.field.sinr.ratio[i].areaRatio = this.evaluationFuncForm.field.sinr.ratio[i].areaRatio * 100;
        }
        for (i = 0; i < this.evaluationFuncForm.field.rsrp.ratio.length; i++) {
            if (this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio * 100 <= 100)
                this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio = this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio * 100;
        }
        for (i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++) {
            if (this.evaluationFuncForm.field.throughput.ratio[i].areaRatio * 100 <= 100)
                this.evaluationFuncForm.field.throughput.ratio[i].areaRatio = this.evaluationFuncForm.field.throughput.ratio[i].areaRatio * 100;
        }
        if (this.evaluationFuncForm.ue.coverage.ratio < 1)
            this.evaluationFuncForm.ue.coverage.ratio = this.evaluationFuncForm.ue.coverage.ratio * 100;
        for (i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++) {
            if (this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio * 100 <= 100)
                this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio = this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio * 100;
        }
    };
    SitePlanningComponent.prototype.changeFieldULDL = function (index, value) {
        if (this.fieldThroughputTypeArr[index] === 'UL') {
            this.evaluationFuncForm.field.throughput.ratio[index].ULValue = value;
            this.evaluationFuncForm.field.throughput.ratio[index].DLValue = null;
        }
        else if (this.fieldThroughputTypeArr[index] === 'DL') {
            this.evaluationFuncForm.field.throughput.ratio[index].ULValue = null;
            this.evaluationFuncForm.field.throughput.ratio[index].DLValue = value;
        }
        //this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.changeUEULDL = function (index, value) {
        if (this.ueThroughputTypeArr[index] === 'UL') {
            this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = value;
            this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = null;
        }
        else if (this.ueThroughputTypeArr[index] === 'DL') {
            this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = null;
            this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = value;
        }
        //this.setStorageEvaluationFuncForm();
    };
    SitePlanningComponent.prototype.setThroughputTypeAndValue = function () {
        this.fieldThroughputTypeArr = [];
        this.fieldThroughputValueArr = [];
        this.ueThroughputTypeArr = [];
        this.ueThroughputValueArr = [];
        for (var i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++) {
            if (this.evaluationFuncForm.field.throughput.ratio[i].ULValue != null && this.evaluationFuncForm.field.throughput.ratio[i].DLValue != null) {
                this.fieldThroughputTypeArr.push("UL");
                this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].ULValue);
                this.fieldThroughputTypeArr.push("DL");
                this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].DLValue);
                this.evaluationFuncForm.field.throughput.ratio.splice(i + 1, 0, {
                    "areaRatio": this.evaluationFuncForm.field.throughput.ratio[i].areaRatio,
                    "compliance": this.evaluationFuncForm.field.throughput.ratio[i].compliance,
                    "ULValue": null,
                    "DLValue": this.evaluationFuncForm.field.throughput.ratio[i].DLValue
                });
                this.evaluationFuncForm.field.throughput.ratio[i].DLValue = null;
            }
            else if (this.evaluationFuncForm.field.throughput.ratio[i].ULValue != null) {
                this.fieldThroughputTypeArr.push("UL");
                this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].ULValue);
            }
            else if (this.evaluationFuncForm.field.throughput.ratio[i].DLValue != null) {
                this.fieldThroughputTypeArr.push("DL");
                this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].DLValue);
            }
            else {
                this.fieldThroughputTypeArr.push("UL");
                this.fieldThroughputValueArr.push(0);
            }
        }
        for (var i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++) {
            if (this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue != null && this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue != null) {
                this.ueThroughputTypeArr.push("UL");
                this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue);
                this.ueThroughputTypeArr.push("DL");
                this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue);
                this.evaluationFuncForm.ue.throughputByRsrp.ratio.splice(i + 1, 0, {
                    "countRatio": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio,
                    "compliance": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].compliance,
                    "ULValue": null,
                    "DLValue": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue
                });
                this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue = null;
            }
            else if (this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue != null) {
                this.ueThroughputTypeArr.push("UL");
                this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue);
            }
            else if (this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue != null) {
                this.ueThroughputTypeArr.push("DL");
                this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue);
            }
            else {
                this.ueThroughputTypeArr.push("UL");
                this.ueThroughputValueArr.push(0);
            }
        }
    };
    SitePlanningComponent.prototype.oldFormatEvaluation = function () {
        if (this.evaluationFuncForm == null ||
            (this.evaluationFuncForm.field.coverage.activate == false &&
                this.evaluationFuncForm.field.sinr.activate == false &&
                this.evaluationFuncForm.field.rsrp.activate == false &&
                this.evaluationFuncForm.field.throughput.activate == false &&
                this.evaluationFuncForm.ue.coverage.activate == false &&
                this.evaluationFuncForm.ue.throughputByRsrp.activate == false)) {
            this.evaluationFuncForm.field.coverage.activate = this.calculateForm.isCoverage;
            this.evaluationFuncForm.ue.coverage.activate = this.calculateForm.isUeCoverage;
            this.evaluationFuncForm.ue.coverage.ratio = this.defaultArea / 100;
            this.evaluationFuncForm.ue.throughputByRsrp.activate = this.calculateForm.isUeAvgThroughput;
            if (this.evaluationFuncForm.ue.throughputByRsrp.activate && this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
                this.addUEThroughput();
            console.log(this.evaluationFuncForm);
        }
    };
    SitePlanningComponent.prototype.evaluationOK = function () {
        this.setStorageEvaluationFuncForm();
        this.matDialog.closeAll();
    };
    SitePlanningComponent.prototype.evaluationCancel = function () {
        this.getStorageEvaluationFuncForm();
        this.matDialog.closeAll();
    };
    SitePlanningComponent.prototype.secondLayerCancel = function () {
        this.secondLayerDialogRef.close();
    };
    SitePlanningComponent.prototype.delAntenna = function (index) {
        /*const data = {
          infoMessage: `${this.translateService.instant('confirm.delete')} ${this.filterAntennaList[index].name}?`
        };
        // confirm delete
        this.confirmDialogConfig.data = data;
        const dialogRef = this.matDialog.open(ConfirmDailogComponent, this.confirmDialogConfig);
        // do delete
        dialogRef.componentInstance.onOK.subscribe(() => {
          dialogRef.close();
          this.filterAntennaList.slice(index);
        });*/
        var _this = this;
        var msg = this.translateService.instant('confirm.delete') + " " + this.filterAntennaList[index].name + "?";
        this.msgDialogConfig.data = {
            infoMessage: msg
        };
        var dialogRef = this.matDialog.open(confirm_dailog_component_1.ConfirmDailogComponent, this.msgDialogConfig);
        dialogRef.componentInstance.onOK.subscribe(function () {
            // done
            dialogRef.close();
            _this.filterAntennaList.splice(index);
        });
    };
    SitePlanningComponent.prototype.showAntenna = function () {
        this.getAntenna();
    };
    SitePlanningComponent.prototype.getAntenna = function () {
        var count = 25;
        this.allAntennaList = [];
        this.filterAntennaList = [];
        if (this.isAntennaDefault == 'default') {
            for (var ant = 0; ant < count; ant++) {
                console.log("ant = " + ant);
                this.filterAntennaList.push({
                    id: ant,
                    name: "ant.default-" + ant,
                    type: "Omnidirectional",
                    band: [3500, 5000],
                    port: ant,
                    devName: '501',
                    manufactor: 'ITRI'
                });
            }
        }
        else {
            this.filterAntennaList.push({
                id: ant,
                name: "ant.custom-" + ant,
                type: "Omnidirectional",
                band: [3500, 5000],
                port: ant,
                devName: '501',
                manufactor: 'ITRI'
            });
        }
    };
    SitePlanningComponent.prototype.changeAntPage = function (index) {
        this.customizedAntennaPage = index;
    };
    __decorate([
        core_1.ViewChild('matTable')
    ], SitePlanningComponent.prototype, "matTable");
    __decorate([
        core_1.ViewChild('moveable')
    ], SitePlanningComponent.prototype, "moveable");
    __decorate([
        core_1.ViewChild(menu_1.MatMenuTrigger, { static: true })
    ], SitePlanningComponent.prototype, "matMenuTrigger");
    __decorate([
        core_1.ViewChild('chart')
    ], SitePlanningComponent.prototype, "chart");
    __decorate([
        core_1.ViewChild('materialModal')
    ], SitePlanningComponent.prototype, "materialModal");
    __decorate([
        core_1.ViewChild('materialModal2')
    ], SitePlanningComponent.prototype, "materialModal2");
    __decorate([
        core_1.ViewChild('RfModal')
    ], SitePlanningComponent.prototype, "rfModal");
    __decorate([
        core_1.ViewChild('RfModalTable')
    ], SitePlanningComponent.prototype, "rfModalTable");
    __decorate([
        core_1.ViewChild('UeModalTable')
    ], SitePlanningComponent.prototype, "ueModalTable");
    __decorate([
        core_1.ViewChild('SINRModalTable')
    ], SitePlanningComponent.prototype, "SINRModalTable");
    __decorate([
        core_1.ViewChild('FieldCoverageModalTable')
    ], SitePlanningComponent.prototype, "FieldCoverageModalTable");
    __decorate([
        core_1.ViewChild('RSRPModalTable')
    ], SitePlanningComponent.prototype, "RSRPModalTable");
    __decorate([
        core_1.ViewChild('ThroughputModalTable')
    ], SitePlanningComponent.prototype, "ThroughputModalTable");
    __decorate([
        core_1.ViewChild('UECoverageModalTable')
    ], SitePlanningComponent.prototype, "UECoverageModalTable");
    __decorate([
        core_1.ViewChild('UEThroughputModalTable')
    ], SitePlanningComponent.prototype, "UEThroughputModalTable");
    __decorate([
        core_1.ViewChild('AntennaModalTable')
    ], SitePlanningComponent.prototype, "AntennaModalTable");
    __decorate([
        core_1.ViewChild('AddAntennaModalTable')
    ], SitePlanningComponent.prototype, "AddAntennaModalTable");
    __decorate([
        core_1.ViewChild('EditAntennaModalTable')
    ], SitePlanningComponent.prototype, "EditAntennaModalTable");
    __decorate([
        core_1.ViewChild('materialCustomizeModal')
    ], SitePlanningComponent.prototype, "materialCustomizeModal");
    __decorate([
        core_1.ViewChild('modelCustomizeModal')
    ], SitePlanningComponent.prototype, "modelCustomizeModal");
    __decorate([
        core_1.ViewChild('confirmDeleteMaterial')
    ], SitePlanningComponent.prototype, "confirmDeleteMaterial");
    __decorate([
        core_1.ViewChild('confirmDeleteModel')
    ], SitePlanningComponent.prototype, "confirmDeleteModel");
    __decorate([
        core_1.ViewChild('createModelSuccessModal')
    ], SitePlanningComponent.prototype, "createModelSuccessModal");
    __decorate([
        core_1.ViewChild('createMaterialSuccessModal')
    ], SitePlanningComponent.prototype, "createMaterialSuccessModal");
    __decorate([
        core_1.ViewChild('calculateModelSuccessModal')
    ], SitePlanningComponent.prototype, "calculateModelSuccessModal");
    __decorate([
        core_1.ViewChild('coordinateInfoModal')
    ], SitePlanningComponent.prototype, "coordinateInfoModal");
    __decorate([
        core_1.ViewChild('deleteModal')
    ], SitePlanningComponent.prototype, "deleteModal");
    __decorate([
        core_1.ViewChild('deleteModal2')
    ], SitePlanningComponent.prototype, "deleteModal2");
    __decorate([
        core_1.ViewChild('changeToSimulationModal')
    ], SitePlanningComponent.prototype, "changeToSimulationModal");
    __decorate([
        core_1.HostListener('document:click', ['$event'])
    ], SitePlanningComponent.prototype, "clickout");
    __decorate([
        core_1.HostListener('window:keyup', ['$event'])
    ], SitePlanningComponent.prototype, "keyEvent");
    __decorate([
        core_1.HostListener('window:resize')
    ], SitePlanningComponent.prototype, "windowResize");
    SitePlanningComponent = __decorate([
        core_1.Component({
            selector: 'app-site-planning',
            templateUrl: './site-planning.component.html',
            styleUrls: ['./site-planning.component.scss',
            ]
        })
    ], SitePlanningComponent);
    return SitePlanningComponent;
}());
exports.SitePlanningComponent = SitePlanningComponent;
