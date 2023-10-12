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
var BABYLON = require("babylonjs");
var Earcut = require("earcut");
/**
 * View 3D
 */
var View3dComponent = /** @class */ (function () {
    function View3dComponent(matDialog, authService, data) {
        var _this = this;
        this.matDialog = matDialog;
        this.authService = authService;
        this.data = data;
        /** 障礙物 */
        this.obstacleList = [];
        /** 現有基站 */
        this.defaultBSList = [];
        /** 新增基站 */
        this.candidateList = [];
        /** 新增ＵＥ */
        this.ueList = [];
        /** 互動的物件 */
        this.dragObject = {};
        /** 高度list */
        this.zValue = [];
        /** BABYLON engine */
        this.engine = null;
        /** BABYLON scene */
        this.scene = null;
        /** 障礙物 group */
        this.obstacleGroup = [];
        /** 現有基站 group */
        this.defaultBsGroup = [];
        /** 新增AP group */
        this.candidateGroup = [];
        /** 行動終端 group */
        this.ueGroup = [];
        /** heatmap group */
        this.heatmapGroup = {};
        /** 顯示現有基站 */
        this.showDefaultBs = true;
        /** 顯示AP */
        this.showCandidate = true;
        /** 顯示行動終端 */
        this.showUe = true;
        /** 顯有障礙物 */
        this.showObstacle = true;
        /** 0 = SINR, 1 = PCI, 2 = RSRP */
        this.heatmapType = 0;
        /** 圖寬 */
        this.width = 0;
        /** 圖高 */
        this.height = 0;
        /** 障礙物 list */
        this.obstacle = [];
        /** 現有基站 list */
        this.defaultBs = [];
        /** 新增AP list */
        this.candidate = [];
        /** 行動終端 list */
        this.ue = [];
        /** 結果data */
        this.result = {};
        /** 是否PDF */
        this.isPDF = false;
        /** heatmap config */
        this.heatmapConfig = [[12, 51, 131], [10, 136, 186], [242, 211, 56], [242, 143, 56], [217, 30, 30]];
        /** 訊號覆蓋圖是否為藍色 */
        this.isCoverBlue = true;
        this.coounit = 1;
        this.ary = [];
        /** 跟2d圖相同的colorscale */
        // colorscale: any = [
        //   [0, 'rgb(12,51,131)'],
        //   [0.25, 'rgb(10,136,186)'],
        //   [0.5, 'rgb(242,211,56)'],
        //   [0.75, 'rgb(242,143,56)'],
        //   [1, 'rgb(217,30,30)']
        // ];
        this.colorscale = [
            [0, 'rgb(11,49,132)'],
            [0.25, 'rgb(11,131,182)'],
            [0.5, 'rgb(239,207,60)'],
            [0.75, 'rgb(238,144,55)'],
            [1, 'rgb(212,31,36)']
        ];
        if (data != null) {
            // this.isSimulation = data.isSimulation;
            this.calculateForm = data.calculateForm;
            this.obstacle = data.obstacleList;
            this.defaultBs = data.defaultBSList;
            this.candidate = data.candidateList;
            this.ue = data.ueList;
            this.width = this.calculateForm.width;
            this.height = this.calculateForm.height;
            this.zValue = data.zValue;
            this.planeHeight = this.zValue[0].toString();
            this.result = data.result;
            this.isPDF = false;
            this.ary = data.ary;
            window.setTimeout(function () {
                _this.mounted();
            }, 100);
        }
    }
    View3dComponent.prototype.ngOnInit = function () {
        // this.draw();
        console.log(this.calculateForm);
        this.coounit = this.calculateForm.resolution;
    };
    /**
     * 畫圖
     */
    View3dComponent.prototype.createScene = function () {
        this.engine = new BABYLON.Engine(this.canvas.nativeElement, true);
        var scene = new BABYLON.Scene(this.engine);
        console.log(this.canvas.nativeElement.width);
        console.log(scene.clearColor);
        scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
        var camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI * 0.37, this.width / 1.5, new BABYLON.Vector3(10, 0, 0), scene);
        camera.position = new BABYLON.Vector3(this.width * 0.4, 35, -60);
        // camera.lowerRadiusLimit = 30;
        // camera.upperRadiusLimit = 100;
        // camera.lowerBetaLimit = 0.00 * (Math.PI / 180);
        camera.upperBetaLimit = 90.00 * (Math.PI / 180);
        camera.panningInertia = 0.5;
        camera.inertia = 0.5;
        camera.angularSensibilityX = 500;
        camera.angularSensibilityY = 500;
        camera.panningSensibility = 50;
        camera.attachControl(this.canvas.nativeElement, true);
        console.log(camera);
        var light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-10, 10, 0), scene);
        // offset
        var offsetX = this.width / -2;
        var offsetY = -5;
        var offsetZ = this.height / -2;
        // floor
        var floorData = [
            new BABYLON.Vector3(this.width, 0, 0),
            new BABYLON.Vector3(this.width, 0, this.height),
            new BABYLON.Vector3(0, 0, this.height),
            new BABYLON.Vector3(0, 0, 0)
        ];
        var floor = BABYLON.MeshBuilder.ExtrudePolygon('floor', { shape: floorData, depth: 0.3 }, scene, Earcut);
        floor.position.x = offsetX;
        floor.position.y = offsetY;
        floor.position.z = offsetZ;
        var floorMat = new BABYLON.StandardMaterial('floorMaterial', scene);
        floorMat.diffuseColor = new BABYLON.Color3(248 / 255, 248 / 255, 248 / 255);
        floor.material = floorMat;
        // const ary = JSON.parse(window.localStorage.getItem(`${this.authService.userToken}for3d`));
        var obstacleMat = new BABYLON.StandardMaterial('obstacleMaterial', scene);
        obstacleMat.diffuseColor = new BABYLON.Color3(121 / 255, 221 / 255, 242 / 255);
        var i = 0;
        for (var _i = 0, _a = this.obstacle; _i < _a.length; _i++) {
            var item = _a[_i];
            // const depth = item.altitude / 2;
            var obstacleData = void 0;
            var obstacle = void 0;
            if (item.element === 0) {
                /*
                obstacleData = [
                  new BABYLON.Vector3(-depth, item.z, 0),
                  new BABYLON.Vector3(depth, item.z, 0),
                  new BABYLON.Vector3(depth, item.z, item.height),
                  new BABYLON.Vector3(-depth, item.z, item.height)
                ];
                obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', {shape: obstacleData, depth: item.width}, scene, Earcut);
                */
                obstacleData = [
                    new BABYLON.Vector3(0, item.z, 0),
                    new BABYLON.Vector3(item.width, item.z, 0),
                    new BABYLON.Vector3(item.width, item.z, item.height),
                    new BABYLON.Vector3(0, item.z, item.height)
                ];
                obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', { shape: obstacleData, depth: item.altitude }, scene, Earcut);
            }
            else if (item.element === 1) {
                // 三角形
                obstacleData = [
                    new BABYLON.Vector3(0, item.z, 0),
                    new BABYLON.Vector3(item.width, item.z, 0),
                    new BABYLON.Vector3(item.width / 2, item.z, item.height)
                ];
                obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', { shape: obstacleData, depth: item.altitude }, scene, Earcut);
            }
            else if (item.element === 2) {
                // 圓形: name, 高度, 上直徑, 下直徑, 邊數, 高向細分度, 場景
                obstacle = BABYLON.Mesh.CreateCylinder('obstacle', item.altitude, item.height, item.height, 99, 1, scene);
            }
            else if (item.element === 3) {
                // 梯形
                obstacleData = [
                    new BABYLON.Vector3(0, 0, 0),
                    new BABYLON.Vector3(item.width, 0, 0),
                    new BABYLON.Vector3(item.width * 0.75, 0, item.height),
                    new BABYLON.Vector3(item.width * 0.25, 0, item.height)
                ];
                obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', { shape: obstacleData, depth: item.altitude }, scene, Earcut);
            }
            // console.log(obstacle);
            // 超過180度或-180度時重算角度，否則位置會跑很多
            if (item.rotate < -180) {
                item.rotate = item.rotate % -360;
            }
            else if (item.rotate > 180) {
                item.rotate = item.rotate % 360;
            }
            if (item.rotate === 360) {
                item.rotate = 0;
            }
            // console.log(`rotate: ${item.rotate}`);
            /*
            obstacle.position.x = item.x + offsetX;
            if (item.element === 1 || item.element === 3) {
              // 三角形與梯形
              obstacle.position.y = item.altitude + offsetY + item.z;
            } else {
              obstacle.position.y = depth + offsetY + item.z;
            }
            */
            obstacle.position.y = item.altitude + offsetY + item.z;
            // console.log("this.ary",this.ary); // 障礙物的(x,y)最終座標(可能經過旋轉)
            obstacle.position.x = Number(this.ary[i][0]) + offsetX;
            obstacle.position.z = Number(this.ary[i][1]) + offsetZ;
            if (item.element === 2) {
                // 圓形
                obstacle.position.y = item.z + offsetY + item.altitude / 2;
                obstacle.position.x = item.x + offsetX + (item.height / 2);
                obstacle.position.z = item.y + offsetZ + (item.height / 2);
            }
            /*
            if (item.element === 0) {
              obstacle.rotation.z = Math.PI / 2;
            }
            */
            obstacle.rotation.y = BABYLON.Tools.ToRadians(item.rotate);
            obstacle.material = obstacleMat;
            i++;
            this.obstacleGroup.push(obstacle);
        }
        var defaultBsMat = new BABYLON.StandardMaterial('defaultBsMaterial', scene);
        defaultBsMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
        var bsCount = 0;
        for (var _b = 0, _c = this.defaultBs; _b < _c.length; _b++) {
            var bs = _c[_b];
            if (typeof bs !== 'undefined') {
                var bsBox = BABYLON.BoxBuilder.CreateBox('defaultBs', { size: 1 }, scene);
                bsBox.position = new BABYLON.Vector3(bs.x + offsetX, bs.z + offsetY, bs.y + offsetZ);
                // bsBox.position = new BABYLON.Vector3(bs.x + offsetX, 3 + offsetY, bs.y + offsetZ);
                bsBox.material = defaultBsMat;
                this.defaultBsGroup.push(bsBox);
                bsCount++;
            }
        }
        if (bsCount > 1) {
            this.isCoverBlue = false;
        }
        var candidateMat = new BABYLON.StandardMaterial('candidateMaterial', scene);
        candidateMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
        var chosenMat = new BABYLON.StandardMaterial('chosenMaterial', scene);
        chosenMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
        for (var _d = 0, _e = this.candidate; _d < _e.length; _d++) {
            var candidate = _e[_d];
            // const candidate = this.candidate[id];
            // const candidate = this.dragObject[id];
            var candBox = BABYLON.BoxBuilder.CreateBox('candidate', { size: 1 }, scene);
            candBox.position = new BABYLON.Vector3(candidate.x + offsetX, candidate.z + offsetY, candidate.y + offsetZ);
            if (null != this.result['gaResult']) {
                for (var _f = 0, _g = this.result['gaResult'].chosenCandidate; _f < _g.length; _f++) {
                    var chosen = _g[_f];
                    if (candidate.x === chosen[0] && candidate.y === chosen[1] && candidate.z === chosen[2]) {
                        candBox.material = chosenMat;
                        break;
                    }
                    else {
                        candBox.material = candidateMat;
                    }
                }
                if (this.result['gaResult'].chosenCandidate.length > 1) {
                    this.isCoverBlue = false;
                }
            }
            else {
                candBox.material = candidateMat;
            }
            this.candidateGroup.push(candBox);
        }
        var ueMat = new BABYLON.StandardMaterial('ueMaterial', scene);
        ueMat.diffuseColor = new BABYLON.Color3(1, 1, 0);
        for (var _h = 0, _j = this.ue; _h < _j.length; _h++) {
            var ue = _j[_h];
            // const ue = this.ue[id];
            // const ue = this.dragObject[id];
            var uePoint = BABYLON.SphereBuilder.CreateSphere('ue', { diameter: 0.5 }, scene);
            uePoint.position = new BABYLON.Vector3(ue.x + offsetX, ue.z + offsetY, ue.y + offsetZ);
            uePoint.material = ueMat;
            this.ueGroup.push(uePoint);
        }
        for (var i_1 = 0; i_1 < this.zValue.length; i_1++) {
            var z = this.zValue[i_1];
            this.heatmapGroup[z] = [];
            var sinrMapPlane = BABYLON.MeshBuilder.CreateGround('sinrmap_' + z, { width: this.width, height: this.height }, scene);
            sinrMapPlane.position.y = z + offsetY;
            if (null != this.result['gaResult']) {
                var heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
                var texture = BABYLON.RawTexture.CreateRGBTexture(this.genSinrMapData(i_1), Math.ceil(this.width / this.coounit), Math.ceil(this.height / this.coounit), scene, false, false);
                heatmapMat.diffuseTexture = texture;
                /**
                 * heatmap透明度，2d底圖下方有障礙物需顯示，故設定heatmap div透明度0.85
                 * 跟2d底圖相同，讓顏色相近於2d圖
                 */
                heatmapMat.alpha = 0.85;
                sinrMapPlane.material = heatmapMat;
            }
            sinrMapPlane.isVisible = false;
            this.heatmapGroup[z].push(sinrMapPlane);
            var pciMapPlane = BABYLON.MeshBuilder.CreateGround('pcimap_' + z, { width: this.width, height: this.height }, scene);
            pciMapPlane.position.y = z + offsetY;
            if (null != this.result['gaResult']) {
                var heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
                var texture = BABYLON.RawTexture.CreateRGBTexture(this.genPciMapData(i_1), Math.ceil(this.width / this.coounit), Math.ceil(this.height / this.coounit), scene, false, false);
                heatmapMat.diffuseTexture = texture;
                // /**
                //  * heatmap透明度，2d底圖下方有障礙物需顯示，故設定heatmap div透明度0.85
                //  * 跟2d底圖相同，讓顏色相近於2d圖
                //  */
                heatmapMat.alpha = 0.85;
                pciMapPlane.material = heatmapMat;
            }
            pciMapPlane.isVisible = false;
            this.heatmapGroup[z].push(pciMapPlane);
            var rsrpMapPlane = BABYLON.MeshBuilder.CreateGround('rsrpmap_' + z, { width: this.width, height: this.height }, scene);
            rsrpMapPlane.position.y = z + offsetY;
            if (null != this.result['gaResult']) {
                var heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
                var texture = BABYLON.RawTexture.CreateRGBTexture(this.genRsrpMapData(i_1), Math.ceil(this.width / this.coounit), Math.ceil(this.height / this.coounit), scene, false, false);
                heatmapMat.diffuseTexture = texture;
                /**
                 * heatmap透明度，2d底圖下方有障礙物需顯示，故設定heatmap div透明度0.85
                 * 跟2d底圖相同，讓顏色相近於2d圖
                 */
                heatmapMat.alpha = 0.85;
                rsrpMapPlane.material = heatmapMat;
            }
            rsrpMapPlane.isVisible = false;
            this.heatmapGroup[z].push(rsrpMapPlane);
            var ulThroughputMapPlane = BABYLON.MeshBuilder.CreateGround('ulThroughput_' + z, { width: this.width, height: this.height }, scene);
            ulThroughputMapPlane.position.y = z + offsetY;
            if (null != this.result['gaResult']) {
                var heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
                var texture = BABYLON.RawTexture.CreateRGBTexture(this.genUlThroughputMapData(i_1), Math.ceil(this.width / this.coounit), Math.ceil(this.height / this.coounit), scene, false, false);
                heatmapMat.diffuseTexture = texture;
                /**
                 * heatmap透明度，2d底圖下方有障礙物需顯示，故設定heatmap div透明度0.85
                 * 跟2d底圖相同，讓顏色相近於2d圖
                 */
                heatmapMat.alpha = 0.85;
                ulThroughputMapPlane.material = heatmapMat;
            }
            ulThroughputMapPlane.isVisible = false;
            this.heatmapGroup[z].push(ulThroughputMapPlane);
            var dlThroughputMapPlane = BABYLON.MeshBuilder.CreateGround('dlThroughput_' + z, { width: this.width, height: this.height }, scene);
            dlThroughputMapPlane.position.y = z + offsetY;
            if (null != this.result['gaResult']) {
                var heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
                var texture = BABYLON.RawTexture.CreateRGBTexture(this.genDlThroughputMapData(i_1), Math.ceil(this.width / this.coounit), Math.ceil(this.height / this.coounit), scene, false, false);
                heatmapMat.diffuseTexture = texture;
                /**
                 * heatmap透明度，2d底圖下方有障礙物需顯示，故設定heatmap div透明度0.85
                 * 跟2d底圖相同，讓顏色相近於2d圖
                 */
                heatmapMat.alpha = 0.85;
                dlThroughputMapPlane.material = heatmapMat;
            }
            dlThroughputMapPlane.isVisible = false;
            this.heatmapGroup[z].push(dlThroughputMapPlane);
        }
        return scene;
    };
    /** 切換顯示障礙物 */
    View3dComponent.prototype.switchObstacle = function () {
        for (var _i = 0, _a = this.obstacleGroup; _i < _a.length; _i++) {
            var id = _a[_i];
            id.isVisible = !id.isVisible;
        }
    };
    /** 切換顯示現有基站 */
    View3dComponent.prototype.switchDefaultBs = function () {
        for (var _i = 0, _a = this.defaultBsGroup; _i < _a.length; _i++) {
            var id = _a[_i];
            id.isVisible = !id.isVisible;
        }
    };
    /** 切換顯示新增AP */
    View3dComponent.prototype.switchCandidate = function () {
        for (var _i = 0, _a = this.candidateGroup; _i < _a.length; _i++) {
            var id = _a[_i];
            id.isVisible = !id.isVisible;
        }
    };
    /** 切換顯示UE */
    View3dComponent.prototype.switchUe = function () {
        for (var _i = 0, _a = this.ueGroup; _i < _a.length; _i++) {
            var id = _a[_i];
            id.isVisible = !id.isVisible;
        }
    };
    /** 切換顯示heatmap */
    View3dComponent.prototype.switchHeatMap = function () {
        var _this = this;
        Object.keys(this.heatmapGroup).forEach(function (id) {
            for (var i = 0; i < 5; i++) {
                if (id === _this.planeHeight && i === Number(_this.heatmapType)) {
                    _this.heatmapGroup[id][i].isVisible = true;
                }
                else {
                    _this.heatmapGroup[id][i].isVisible = false;
                }
            }
        });
    };
    /**
     * 訊號覆蓋圖
     * @param zIndex 高度
     */
    View3dComponent.prototype.genPciMapData = function (zIndex) {
        var blockCount = this.defaultBs.length + this.result['gaResult'].chosenCandidate.length;
        var colorMap = new Uint8Array(Math.ceil(this.width / this.coounit) * Math.ceil(this.height / this.coounit) * 3);
        var allZero = true;
        var ary = [];
        this.result['gaResult']['connectionMap'].map(function (v) {
            // this.result['gaResult']['connectionMapAll'].map(v => {
            v.map(function (m) {
                m.map(function (d) {
                    if (d != null && d > 0) {
                        allZero = false;
                    }
                    ary.push(d);
                });
            });
        });
        var max = Plotly.d3.max(ary);
        var min = Plotly.d3.min(ary);
        var zDomain = [];
        var colorRange = [];
        for (var k = 0; k < this.colorscale.length; k++) {
            zDomain.push((max - min) * this.colorscale[k][0] + min);
            colorRange.push(this.colorscale[k][1]);
        }
        for (var j = 0; j < Math.ceil(this.height / this.coounit); j++) {
            for (var i = 0; i < Math.ceil(this.width / this.coounit); i++) {
                var n = (j * Math.ceil(this.width / this.coounit) + i) * 3;
                if (typeof this.result['gaResult'].connectionMap[i][j] === 'undefined') {
                    // if (typeof this.result['gaResult'].connectionMapAll[i][j] === 'undefined') {
                    continue;
                }
                var value = this.result['gaResult'].connectionMap[i][j][zIndex];
                // const value = this.result['gaResult'].connectionMapAll[i][j][zIndex];
                if (value == null) {
                    colorMap[n] = 255;
                    colorMap[n + 1] = 255;
                    colorMap[n + 2] = 255;
                }
                else if (allZero && this.isCoverBlue) {
                    // 都是0的基站指定為藍色
                    colorMap[n] = 12;
                    colorMap[n + 1] = 51;
                    colorMap[n + 2] = 131;
                }
                else {
                    // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
                    var colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
                    var hexColor = colorFN(value);
                    var rgb = Plotly.d3.rgb(hexColor);
                    colorMap[n] = rgb.r;
                    colorMap[n + 1] = rgb.g;
                    colorMap[n + 2] = rgb.b;
                }
                //   let offset;
                //   if (totalDelta === 0) {
                //     offset = (value - min);
                //   } else {
                //     offset = (value - min) / totalDelta;
                //   }
                //   // const offset = (value + 1) / blockCount;
                //   // console.log(value, offset);
                //   if (value == null) {
                //     colorMap[n] = 255;
                //     colorMap[n + 1] = 255;
                //     colorMap[n + 2] = 255;
                //   } else if (offset < 0.25) {
                //     const mixRatio = offset / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - this.heatmapConfig[0][0]) + this.heatmapConfig[0][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - this.heatmapConfig[0][1]) + this.heatmapConfig[0][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - this.heatmapConfig[0][2]) + this.heatmapConfig[0][2];
                // } else if (offset < 0.5) {
                //     const mixRatio = (offset - 0.25) / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
                // } else if (offset < 0.75) {
                //     const mixRatio = (offset - 0.5) / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
                // } else {
                //     const mixRatio = (offset - 0.75) / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
                // }
            }
        }
        return colorMap;
    };
    /**
     * 訊號品質圖
     * @param zIndex 高度
     */
    View3dComponent.prototype.genSinrMapData = function (zIndex) {
        var colorMap = new Uint8Array(Math.ceil(this.width / this.coounit) * Math.ceil(this.height / this.coounit) * 3);
        var scaleMax = 29.32; // this.result['sinrMax']
        var scaleMin = (-1.1889); // this.result['sinrMin']
        var totalDelta = scaleMax - scaleMin;
        // const sinrColorscale: any = [
        //   [0, 'rgb(12,51,131)'],
        //   [0.2, 'rgb(10,136,186)'],
        //   [0.3, 'rgb(136, 224, 53)'],
        //   [0.4, 'rgb(242,211,56)'],
        //   [0.75, 'rgb(242,143,56)'],
        //   [1, 'rgb(217,30,30)'],
        // ];
        // const min = -8;
        // const max = 24;
        var zDomain = [];
        var colorRange = [];
        for (var k = 0; k < this.colorscale.length; k++) {
            // zDomain.push((totalDelta) * this.colorscale[k][0] + this.result['sinrMin']);
            zDomain.push((totalDelta) * this.colorscale[k][0] + scaleMin);
            colorRange.push(this.colorscale[k][1]);
        }
        // alert(zDomain);
        for (var j = 0; j < Math.ceil(this.height / this.coounit); j++) {
            for (var i = 0; i < Math.ceil(this.width / this.coounit); i++) {
                var n = (j * Math.ceil(this.width / this.coounit) + i) * 3;
                if (typeof this.result['gaResult'].sinrMap[i][j] === 'undefined') {
                    continue;
                }
                var value = this.result['gaResult'].sinrMap[i][j][zIndex];
                if (value == null) {
                    colorMap[n] = 255;
                    colorMap[n + 1] = 255;
                    colorMap[n + 2] = 255;
                }
                else {
                    // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
                    var colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
                    var hexColor = colorFN(value);
                    var rgb = Plotly.d3.rgb(hexColor);
                    colorMap[n] = rgb.r;
                    colorMap[n + 1] = rgb.g;
                    colorMap[n + 2] = rgb.b;
                }
                // const offset = (value - this.result['sinrMin']) / totalDelta;
                // if (value == null) {
                //   colorMap[n] = 255;
                //   colorMap[n + 1] = 255;
                //   colorMap[n + 2] = 255;
                // } else if (offset === 0) {
                //     colorMap[n] = 12;
                //     colorMap[n + 1] = 51;
                //     colorMap[n + 2] = 131;
                // } else if (offset < 0.31) {
                //     colorMap[n] = 10;
                //     colorMap[n + 1] = 36;
                //     colorMap[n + 2] = 186;
                // } else if (offset < 0.41) {
                //     colorMap[n] = 136;
                //     colorMap[n + 1] = 224;
                //     colorMap[n + 2] = 53;
                // } else if (offset < 0.75) {
                //     colorMap[n] = 242;
                //     colorMap[n + 1] = 211;
                //     colorMap[n + 2] = 56;
                // } else if (offset < 1) {
                //   colorMap[n] = 242;
                //   colorMap[n + 1] = 143;
                //   colorMap[n + 2] = 56;
                // } else {
                //   colorMap[n] = 217;
                //   colorMap[n + 1] = 30;
                //   colorMap[n + 2] = 30;
                // }
            }
        }
        return colorMap;
    };
    /**
     * 訊號強度圖
     * @param zIndex 高度
     */
    View3dComponent.prototype.genRsrpMapData = function (zIndex) {
        var colorMap = new Uint8Array(Math.ceil(this.width / this.coounit) * Math.ceil(this.height / this.coounit) * 3);
        var totalDelta = this.result['rsrpMax'] - this.result['rsrpMin'];
        // const max = -44;
        // const min = -140;
        // 計算顏色區間公式的domain
        var zDomain = [];
        // 計算顏色區間公式的range
        var colorRange = [];
        for (var k = 0; k < this.colorscale.length; k++) {
            zDomain.push((totalDelta) * this.colorscale[k][0] + this.result['rsrpMin']);
            colorRange.push(this.colorscale[k][1]);
        }
        for (var j = 0; j < Math.ceil(this.height / this.coounit); j++) {
            for (var i = 0; i < Math.ceil(this.width / this.coounit); i++) {
                var n = (j * Math.ceil(this.width / this.coounit) + i) * 3;
                if (typeof this.result['gaResult'].rsrpMap[i][j] === 'undefined') {
                    continue;
                }
                var value = this.result['gaResult'].rsrpMap[i][j][zIndex];
                if (value == null) {
                    colorMap[n] = 255;
                    colorMap[n + 1] = 255;
                    colorMap[n + 2] = 255;
                }
                else {
                    // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
                    var colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
                    // get hex color
                    var hexColor = colorFN(value);
                    // hex轉rgb
                    var rgb = Plotly.d3.rgb(hexColor);
                    colorMap[n] = rgb.r;
                    colorMap[n + 1] = rgb.g;
                    colorMap[n + 2] = rgb.b;
                }
                // const offset = (value - this.result['rsrpMin']) / totalDelta;
                // if (value == null) {
                //   colorMap[n] = 255;
                //   colorMap[n + 1] = 255;
                //   colorMap[n + 2] = 255;
                // } else if (offset < 0.25) {
                //     const mixRatio = offset / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - this.heatmapConfig[0][0]) + this.heatmapConfig[0][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - this.heatmapConfig[0][1]) + this.heatmapConfig[0][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - this.heatmapConfig[0][2]) + this.heatmapConfig[0][2];
                // } else if (offset < 0.5) {
                //     const mixRatio = (offset - 0.25) / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
                // } else if (offset < 0.75) {
                //     const mixRatio = (offset - 0.5) / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
                // } else {
                //     const mixRatio = (offset - 0.75) / 0.25;
                //     colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
                // }
            }
        }
        return colorMap;
    };
    /**
     * 上行傳輸速率圖
     * @param zIndex 高度
     */
    View3dComponent.prototype.genUlThroughputMapData = function (zIndex) {
        var colorMap = new Uint8Array(Math.ceil(this.width / this.coounit) * Math.ceil(this.height / this.coounit) * 3);
        var totalDelta = this.result['ulThroughputMax'] - this.result['ulThroughputMin'];
        if (this.result['gaResult'].ulThroughputMap != null && this.result['gaResult'].ulThroughputMap.length > 0) {
            // const max = 1200;
            // const min = 100;
            var zDomain = [];
            var colorRange = [];
            for (var k = 0; k < this.colorscale.length; k++) {
                zDomain.push((totalDelta) * this.colorscale[k][0] + this.result['ulThroughputMin']);
                // zDomain = JSON.parse(sessionStorage.getItem('ulTpt_scale')).reverse();
                colorRange.push(this.colorscale[k][1]);
            }
            for (var j = 0; j < Math.ceil(this.height / this.coounit); j++) {
                for (var i = 0; i < Math.ceil(this.width / this.coounit); i++) {
                    var n = (j * Math.ceil(this.width / this.coounit) + i) * 3;
                    if (typeof this.result['gaResult'].ulThroughputMap[i][j] === 'undefined') {
                        continue;
                    }
                    var value = this.result['gaResult'].ulThroughputMap[i][j][zIndex];
                    if (value == null) {
                        colorMap[n] = 255;
                        colorMap[n + 1] = 255;
                        colorMap[n + 2] = 255;
                    }
                    else {
                        // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
                        var colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
                        var hexColor = colorFN(value);
                        var rgb = Plotly.d3.rgb(hexColor);
                        colorMap[n] = rgb.r;
                        colorMap[n + 1] = rgb.g;
                        colorMap[n + 2] = rgb.b;
                    }
                    // const offset = value / 1200;
                    // if (value == null) {
                    //   colorMap[n] = 255;
                    //   colorMap[n + 1] = 255;
                    //   colorMap[n + 2] = 255;
                    // } else if (value >= 1200) {
                    //   colorMap[n] = 217;
                    //   colorMap[n + 1] = 30;
                    //   colorMap[n + 2] = 30;
                    // } else if (offset < 0.25) {
                    //     const mixRatio = offset / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - this.heatmapConfig[0][0]) + this.heatmapConfig[0][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - this.heatmapConfig[0][1]) + this.heatmapConfig[0][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - this.heatmapConfig[0][2]) + this.heatmapConfig[0][2];
                    // } else if (offset < 0.5) {
                    //     const mixRatio = (offset - 0.25) / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
                    // } else if (offset < 0.75) {
                    //     const mixRatio = (offset - 0.5) / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
                    // } else {
                    //     const mixRatio = (offset - 0.75) / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
                    // }
                }
            }
        }
        return colorMap;
    };
    /**
     * 下行傳輸速率圖
     * @param zIndex 高度
     */
    View3dComponent.prototype.genDlThroughputMapData = function (zIndex) {
        var colorMap = new Uint8Array(Math.ceil(this.width / this.coounit) * Math.ceil(this.height / this.coounit) * 3);
        if (this.result['gaResult'].dlThroughputMap != null && this.result['gaResult'].dlThroughputMap.length > 0) {
            var totalDelta = this.result['dlThroughputMax'] - this.result['dlThroughputMin'];
            var max = 1200;
            var min = 100;
            for (var j = 0; j < Math.ceil(this.height / this.coounit); j++) {
                for (var i = 0; i < Math.ceil(this.width / this.coounit); i++) {
                    var n = (j * Math.ceil(this.width / this.coounit) + i) * 3;
                    if (typeof this.result['gaResult'].dlThroughputMap[i][j] === 'undefined') {
                        continue;
                    }
                    var value = this.result['gaResult'].dlThroughputMap[i][j][zIndex];
                    if (value == null) {
                        colorMap[n] = 255;
                        colorMap[n + 1] = 255;
                        colorMap[n + 2] = 255;
                    }
                    else {
                        var zDomain = [];
                        var colorRange = [];
                        for (var k = 0; k < this.colorscale.length; k++) {
                            zDomain.push((totalDelta) * this.colorscale[k][0] + this.result['dlThroughputMin']);
                            colorRange.push(this.colorscale[k][1]);
                        }
                        // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
                        var colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
                        var hexColor = colorFN(value);
                        var rgb = Plotly.d3.rgb(hexColor);
                        colorMap[n] = rgb.r;
                        colorMap[n + 1] = rgb.g;
                        colorMap[n + 2] = rgb.b;
                    }
                    // const offset = value / 1200;
                    // if (value == null) {
                    //   colorMap[n] = 255;
                    //   colorMap[n + 1] = 255;
                    //   colorMap[n + 2] = 255;
                    // } else if (value >= 1200) {
                    //   colorMap[n] = 217;
                    //   colorMap[n + 1] = 30;
                    //   colorMap[n + 2] = 30;
                    // } else if (offset < 0.25) {
                    //     const mixRatio = offset / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[1][0] - this.heatmapConfig[0][0]) + this.heatmapConfig[0][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[1][1] - this.heatmapConfig[0][1]) + this.heatmapConfig[0][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[1][2] - this.heatmapConfig[0][2]) + this.heatmapConfig[0][2];
                    // } else if (offset < 0.5) {
                    //     const mixRatio = (offset - 0.25) / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[2][0] - this.heatmapConfig[1][0]) + this.heatmapConfig[1][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[2][1] - this.heatmapConfig[1][1]) + this.heatmapConfig[1][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[2][2] - this.heatmapConfig[1][2]) + this.heatmapConfig[1][2];
                    // } else if (offset < 0.75) {
                    //     const mixRatio = (offset - 0.5) / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[3][0] - this.heatmapConfig[2][0]) + this.heatmapConfig[2][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[3][1] - this.heatmapConfig[2][1]) + this.heatmapConfig[2][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[3][2] - this.heatmapConfig[2][2]) + this.heatmapConfig[2][2];
                    // } else {
                    //     const mixRatio = (offset - 0.75) / 0.25;
                    //     colorMap[n] = mixRatio * (this.heatmapConfig[4][0] - this.heatmapConfig[3][0]) + this.heatmapConfig[3][0];
                    //     colorMap[n + 1] = mixRatio * (this.heatmapConfig[4][1] - this.heatmapConfig[3][1]) + this.heatmapConfig[3][1];
                    //     colorMap[n + 2] = mixRatio * (this.heatmapConfig[4][2] - this.heatmapConfig[3][2]) + this.heatmapConfig[3][2];
                    // }
                }
            }
        }
        return colorMap;
    };
    /**
     * 畫圖
     */
    View3dComponent.prototype.mounted = function () {
        var _this = this;
        console.log('mounted');
        var vm = this;
        this.scene = this.createScene();
        console.log(this.scene);
        this.engine.runRenderLoop(function () {
            vm.scene.render();
            if (_this.isPDF) {
                _this.img.nativeElement.src = _this.canvas.nativeElement.toDataURL();
            }
        });
        window.addEventListener('resize', function () {
            vm.engine.resize();
        });
        if (this.isPDF) {
            this.canvas.nativeElement.style.display = 'none';
        }
    };
    /**
     * closee dialog
     */
    View3dComponent.prototype.close = function () {
        this.matDialog.closeAll();
    };
    __decorate([
        core_1.ViewChild('canvas', { static: true })
    ], View3dComponent.prototype, "canvas");
    __decorate([
        core_1.ViewChild('img')
    ], View3dComponent.prototype, "img");
    View3dComponent = __decorate([
        core_1.Component({
            selector: 'app-view3d',
            templateUrl: './view3d.component.html',
            styleUrls: ['./view3d.component.scss']
        }),
        __param(2, core_1.Optional()), __param(2, core_1.Inject(dialog_1.MAT_DIALOG_DATA))
    ], View3dComponent);
    return View3dComponent;
}());
exports.View3dComponent = View3dComponent;
