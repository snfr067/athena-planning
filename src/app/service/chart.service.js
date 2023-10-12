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
var ChartService = /** @class */ (function () {
    function ChartService() {
        /** 左邊圖保留空間 */
        this.leftSpace = 70;
    }
    /**
     * 計算圖長寬
     * @param calculateForm
     * @param gd
     */
    ChartService.prototype.calSize = function (calculateForm, gd) {
        return __awaiter(this, void 0, void 0, function () {
            var halfHeight, halfWidth, layoutWidth, layoutHeight, marginSize, ratio, wRatio, ratio, winHeight, wRatio;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        halfHeight = document.getElementById('chart').clientWidth * 0.3;
                        halfWidth = (window.innerHeight - 150) / 2;
                        layoutWidth = gd.clientWidth;
                        layoutHeight = gd.clientHeight;
                        marginSize = 60;
                        // console.log(calculateForm.width);
                        // console.log(calculateForm.height);
                        // console.log(layoutWidth);
                        // console.log(layoutHeight);
                        if (Number(calculateForm.width) < Number(calculateForm.height)) {
                            ratio = calculateForm.width / calculateForm.height;
                            layoutWidth = layoutHeight * ratio + 160;
                            if (layoutWidth > gd.clientWidth) {
                                // has scroll bar
                                layoutWidth = gd.clientWidth;
                                wRatio = calculateForm.height / calculateForm.width;
                                layoutHeight = layoutWidth * wRatio;
                            }
                            layoutWidth += marginSize;
                            if (layoutWidth < halfWidth) {
                                layoutWidth = halfWidth;
                                layoutHeight = layoutWidth * (calculateForm.height / calculateForm.width);
                            }
                        }
                        else if (Number(calculateForm.width) > Number(calculateForm.height)) {
                            ratio = calculateForm.height / calculateForm.width;
                            layoutHeight = layoutWidth * ratio;
                            winHeight = window.innerHeight - 150;
                            if (layoutHeight > winHeight) {
                                wRatio = winHeight / layoutHeight;
                                layoutHeight = winHeight;
                                layoutWidth = layoutWidth * wRatio + 100;
                                if (layoutWidth > gd.clientWidth) {
                                    layoutWidth = gd.clientWidth;
                                }
                            }
                            if (layoutHeight < halfHeight) {
                                layoutHeight = halfHeight;
                                layoutWidth = layoutHeight * (calculateForm.width / calculateForm.height);
                            }
                            // if (layoutHeight > gd.clientHeight) {
                            //   // has scroll bar
                            //   layoutHeight = gd.clientHeight;
                            //   const wRatio = calculateForm.width / calculateForm.height;
                            //   layoutWidth = layoutHeight * wRatio;
                            // }
                            // layoutWidth += marginSize;
                        }
                        else {
                            layoutWidth = layoutHeight + marginSize;
                            if (layoutWidth > gd.clientWidth) {
                                // has scroll bar
                                layoutWidth = gd.clientWidth;
                                layoutHeight = layoutWidth - marginSize;
                            }
                        }
                        return [4 /*yield*/, this.checkSize1(calculateForm, gd, Math.round(layoutWidth), Math.round(layoutHeight))];
                    case 1: 
                    // return [layoutWidth, layoutHeight]
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** 用比例校正場域長寬 */
    ChartService.prototype.checkSize1 = function (calculateForm, gd, layoutWidth, layoutHeight) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Plotly.relayout(gd, {
                            width: layoutWidth,
                            height: layoutHeight
                        }).then(function (gd2) {
                            var xy = gd2.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();
                            var gridWidth = xy.width;
                            var gridHeight = xy.height;
                            var pixelXLinear = Plotly.d3.scale.linear()
                                .domain([0, calculateForm.width])
                                .range([0, gridWidth]);
                            var pixelYLinear = Plotly.d3.scale.linear()
                                .domain([0, calculateForm.height])
                                .range([0, gridHeight]);
                            // 模擬1個正方形
                            var width = Math.ceil(pixelXLinear(100));
                            var height = Math.ceil(pixelYLinear(100));
                            if (width !== height) {
                                // 避免遞迴卡死，先用比例讓尺寸接近些
                                if (width > height) {
                                    layoutWidth = layoutWidth * (height / width);
                                }
                                else if (width < height) {
                                    layoutHeight = layoutHeight * (width / height);
                                }
                            }
                            return _this.checkSize2(calculateForm, gd, Math.round(layoutWidth), Math.round(layoutHeight));
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** 進階校正場域長寬 */
    ChartService.prototype.checkSize2 = function (calculateForm, gd, layoutWidth, layoutHeight) {
        return __awaiter(this, void 0, void 0, function () {
            var xy, gridWidth, gridHeight, pixelXLinear, pixelYLinear, width, height;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        xy = gd.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();
                        gridWidth = xy.width;
                        gridHeight = xy.height;
                        pixelXLinear = Plotly.d3.scale.linear()
                            .domain([0, calculateForm.width])
                            .range([0, gridWidth]);
                        pixelYLinear = Plotly.d3.scale.linear()
                            .domain([0, calculateForm.height])
                            .range([0, gridHeight]);
                        width = Math.ceil(pixelXLinear(100));
                        height = Math.ceil(pixelYLinear(100));
                        if (!(width !== height)) return [3 /*break*/, 2];
                        // 結果非正方形時，每次變更1px場域大小至正方形為止
                        if (width > height) {
                            layoutWidth--;
                        }
                        else if (width < height) {
                            layoutHeight--;
                        }
                        return [4 /*yield*/, Plotly.relayout(gd, {
                                width: layoutWidth,
                                height: layoutHeight
                            }).then(function (gd2) {
                                // console.log(width, height, layoutWidth, layoutHeight);
                                return _this.checkSize2(calculateForm, gd2, layoutWidth, layoutHeight);
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        // 結果為正方形
                        console.log(width, height, layoutWidth, layoutHeight);
                        _a.label = 3;
                    case 3: 
                    // console.log(layoutWidth, layoutHeight);
                    return [2 /*return*/, [layoutWidth, layoutHeight]];
                }
            });
        });
    };
    /**
     * show/hide 障礙物
     * @param visible
     * @param rectList
     * @param shapes
     * @param annotations
     * @param gd
     */
    ChartService.prototype.switchShowObstacle = function (visible, rectList, shapes, annotations, gd) {
        for (var _i = 0, rectList_1 = rectList; _i < rectList_1.length; _i++) {
            var item = rectList_1[_i];
            item.style['visibility'] = visible;
        }
        var shapeVisible = (visible === 'visible') ? true : false;
        for (var _a = 0, shapes_1 = shapes; _a < shapes_1.length; _a++) {
            var item = shapes_1[_a];
            // 顏色區分圓形障礙物與BS
            if (item.type === 'circle' && item.fillcolor === '#000000') {
                item.visible = shapeVisible;
            }
        }
        Plotly.relayout(gd, {
            shapes: shapes,
            annotations: annotations
        });
    };
    /**
     * 計算結果頁圖長寬
     * @param calculateForm
     * @param gd
     */
    ChartService.prototype.calResultSize = function (calculateForm, gd, maxWidth) {
        return __awaiter(this, void 0, void 0, function () {
            var layoutWidth, layoutHeight, maxHeight, wRatio, marginSize, ratio;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        layoutWidth = gd.clientWidth;
                        layoutHeight = gd.clientHeight;
                        maxHeight = window.innerHeight - 150;
                        if (layoutHeight > maxHeight) {
                            layoutHeight = maxHeight;
                        }
                        wRatio = calculateForm.height / calculateForm.width;
                        marginSize = 60;
                        if (Number(calculateForm.width) < Number(calculateForm.height)) {
                            ratio = calculateForm.width / calculateForm.height;
                            // layoutWidth = layoutHeight * ratio;
                            layoutWidth = layoutHeight * ratio + 160;
                            if (layoutWidth > gd.clientWidth) {
                                // has scroll bar
                                layoutWidth = gd.clientWidth;
                                layoutHeight = layoutWidth * wRatio;
                            }
                        }
                        else if (Number(calculateForm.width) > Number(calculateForm.height)) {
                            layoutHeight = layoutWidth * wRatio;
                            if (layoutHeight > maxHeight) {
                                layoutHeight = maxHeight;
                                layoutWidth = layoutWidth * wRatio + 100;
                            }
                            if (layoutWidth > gd.clientWidth) {
                                layoutWidth = gd.clientWidth;
                            }
                        }
                        else {
                            layoutHeight = maxHeight;
                            layoutWidth = layoutHeight + marginSize;
                            if (layoutWidth > maxWidth) {
                                // has scroll bar
                                layoutWidth = maxWidth;
                                layoutHeight = layoutWidth - marginSize;
                            }
                        }
                        if (layoutWidth > maxWidth) {
                            layoutWidth = maxWidth;
                            layoutHeight = layoutWidth * wRatio;
                        }
                        return [4 /*yield*/, this.checkSize1(calculateForm, gd, Math.round(layoutWidth), Math.round(layoutHeight))];
                    case 1: 
                    // return [layoutWidth, layoutHeight];
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ChartService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], ChartService);
    return ChartService;
}());
exports.ChartService = ChartService;
