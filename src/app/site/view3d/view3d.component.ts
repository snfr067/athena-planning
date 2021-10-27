import { Component, OnInit, Inject, Optional, ViewChild, ElementRef } from '@angular/core';
import { CalculateForm } from '../../form/CalculateForm';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as BABYLON from 'babylonjs';
import * as Earcut from 'earcut';
import { AuthService } from '../../service/auth.service';

declare var Plotly: any;

/**
 * View 3D
 */
@Component({
  selector: 'app-view3d',
  templateUrl: './view3d.component.html',
  styleUrls: ['./view3d.component.scss']
})
export class View3dComponent implements OnInit {

  constructor(
    private matDialog: MatDialog,
    private authService: AuthService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data) {

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
        window.setTimeout(() => {
          this.mounted();
        }, 100);
      }

    }

  /** 結果form */
  calculateForm: CalculateForm;
  /** 障礙物 */
  obstacleList = [];
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  candidateList = [];
  /** 新增ＵＥ */
  ueList = [];
  /** 互動的物件 */
  dragObject = {};
  /** 高度list */
  zValue = [];
  /** BABYLON engine */
  engine = null;
  /** BABYLON scene */
  scene = null;
  /** 障礙物 group */
  obstacleGroup = [];
  /** 現有基站 group */
  defaultBsGroup = [];
  /** 新增AP group */
  candidateGroup = [];
  /** 行動終端 group */
  ueGroup = [];
  /** heatmap group */
  heatmapGroup = {};
  /** 顯示現有基站 */
  showDefaultBs = true;
  /** 顯示AP */
  showCandidate = true;
  /** 顯示行動終端 */
  showUe = true;
  /** 顯有障礙物 */
  showObstacle = true;
  /** 0 = SINR, 1 = PCI, 2 = RSRP */
  heatmapType = 0;
  /** heatmap height */
  planeHeight;
  /** 圖寬 */
  width = 0;
  /** 圖高 */
  height = 0;
  /** 障礙物 list */
  obstacle = [];
  /** 現有基站 list */
  defaultBs = [];
  /** 新增AP list */
  candidate = [];
  /** 行動終端 list */
  ue = [];
  /** 結果data */
  result = {};
  /** 是否PDF */
  isPDF = false;
  /** heatmap config */
  heatmapConfig = [[12, 51, 131], [10, 136, 186], [242, 211, 56], [242, 143, 56], [217, 30, 30]];
  /** 訊號覆蓋圖是否為藍色 */
  isCoverBlue = true;
  /** 跟2d圖相同的colorscale */
  // colorscale: any = [
  //   [0, 'rgb(12,51,131)'],
  //   [0.25, 'rgb(10,136,186)'],
  //   [0.5, 'rgb(242,211,56)'],
  //   [0.75, 'rgb(242,143,56)'],
  //   [1, 'rgb(217,30,30)']
  // ];
  colorscale: any = [
    [0, 'rgb(11,49,132)'],
    [0.25, 'rgb(11,131,182)'],
    [0.5, 'rgb(239,207,60)'],
    [0.75, 'rgb(238,144,55)'],
    [1, 'rgb(212,31,36)']
  ];

  /** canvas element */
  @ViewChild('canvas', { static: true }) 
  canvas: ElementRef<HTMLCanvasElement>;

  /** image element */
  @ViewChild('img')
  img: ElementRef<HTMLImageElement>;

  ngOnInit() {
    // this.draw();
    console.log(this.calculateForm);
  }

  /**
   * 畫圖
   */
  createScene() {

    this.engine = new BABYLON.Engine(this.canvas.nativeElement, true);
    const scene = new BABYLON.Scene(this.engine);
    console.log(this.canvas.nativeElement.width);
    console.log(scene.clearColor);
    scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);

    const camera = new BABYLON.ArcRotateCamera('Camera', -Math.PI / 2, Math.PI * 0.37, this.width / 1.5, new BABYLON.Vector3(10, 0, 0), scene);
    camera.position = new BABYLON.Vector3(this.width * 0.4, 35, -60);
    camera.lowerRadiusLimit = 30;
    camera.upperRadiusLimit = 100;
    camera.lowerBetaLimit = 0.00 * (Math.PI / 180);
    camera.upperBetaLimit = 90.00 * (Math.PI / 180);
    camera.panningInertia = 0.5;
    camera.inertia = 0.5;
    camera.angularSensibilityX = 500;
    camera.angularSensibilityY = 500;
    camera.panningSensibility = 50;
    camera.attachControl(this.canvas.nativeElement, true);
    console.log(camera);

    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-10, 10, 0), scene);

    // offset
    const offsetX = this.width / -2;
    const offsetY = -5;
    const offsetZ = this.height / -2;
    // floor
    const floorData = [
        new BABYLON.Vector3(this.width, 0, 0),
        new BABYLON.Vector3(this.width, 0, this.height),
        new BABYLON.Vector3(0, 0, this.height),
        new BABYLON.Vector3(0, 0, 0)
    ];
    const floor = BABYLON.MeshBuilder.ExtrudePolygon('floor', {shape: floorData, depth: 0.3}, scene, Earcut);
    floor.position.x = offsetX;
    floor.position.y = offsetY;
    floor.position.z = offsetZ;
    const floorMat = new BABYLON.StandardMaterial('floorMaterial', scene);
    floorMat.diffuseColor = new BABYLON.Color3(248 / 255, 248 / 255, 248 / 255);
    floor.material = floorMat;

    const obstacleMat = new BABYLON.StandardMaterial('obstacleMaterial', scene);
    obstacleMat.diffuseColor = new BABYLON.Color3(121 / 255, 221 / 255, 242 / 255);
    let i = 0;
    for (const item of this.obstacle) {
      // const item = this.obstacle[id];
      // const item = this.dragObject[id];
      const depth = item.altitude / 2;
      let obstacleData;
      let obstacle;
      
      if (item.element === 0) {
        obstacleData = [
          new BABYLON.Vector3(-depth, 0, 0),
          new BABYLON.Vector3(depth, 0, 0),
          new BABYLON.Vector3(depth, 0, item.height),
          new BABYLON.Vector3(-depth, 0, item.height)
        ];

        obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', {shape: obstacleData, depth: item.width}, scene, Earcut);
      } else if (item.element === 1) {
        // 三角形
        obstacleData = [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(item.width, 0, 0),
          new BABYLON.Vector3(item.width / 2, 0, item.height)
        ];
        obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', {shape: obstacleData, depth: item.altitude}, scene, Earcut);

      } else if (item.element === 2) {
        // 圓形: name, 高度, 上直徑, 下直徑, 邊數, 高向細分度, 場景
        obstacle = BABYLON.Mesh.CreateCylinder('obstacle', item.altitude, item.height, item.height, 99, 1, scene);
      } else if (item.element === 3) {
        // 梯形
        obstacleData = [
          new BABYLON.Vector3(0, 0, 0),
          new BABYLON.Vector3(item.width, 0, 0),
          new BABYLON.Vector3(item.width * 0.75, 0, item.height),
          new BABYLON.Vector3(item.width * 0.25, 0, item.height)
        ];
        obstacle = BABYLON.MeshBuilder.ExtrudePolygon('obstacle', {shape: obstacleData, depth: item.altitude}, scene, Earcut);

      }

      // console.log(obstacle);
      // 超過180度或-180度時重算角度，否則位置會跑很多
      if (item.rotate < -180) {
        item.rotate = item.rotate % -360;
        item.rotate = 360 + item.rotate;
      } else if (item.rotate > 180) {
        item.rotate = item.rotate % 360;
        item.rotate = 360 - item.rotate;
      }
      if (item.rotate === 360) {
        item.rotate = 0;
      }
      // console.log(`rotate: ${item.rotate}`);

      obstacle.position.x = item.x + offsetX;
      if (item.element === 1 || item.element === 3) {
        // 三角形與梯形
        obstacle.position.y = item.altitude + offsetY;
      } else {
        obstacle.position.y = depth + offsetY;
      }

      const ary = JSON.parse(window.localStorage.getItem(`${this.authService.userToken}for3d`));
      console.log(ary);
      obstacle.position.x = Number(ary[i].x) + offsetX;
      obstacle.position.z = Number(ary[i].y) + offsetZ;

      if (item.element === 2) {
        // 圓形
        obstacle.position.x = item.x + offsetX + (item.height / 2);
        obstacle.position.z = item.y + offsetZ + (item.height / 2);
      }

      if (item.element === 0) {
        obstacle.rotation.z = Math.PI / 2;
      }
      obstacle.rotation.y = BABYLON.Tools.ToRadians(item.rotate);
      
      obstacle.material = obstacleMat;
      i++;
      this.obstacleGroup.push(obstacle);
    }

    const defaultBsMat = new BABYLON.StandardMaterial('defaultBsMaterial', scene);
    defaultBsMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
    let bsCount = 0;
    for (const bs of this.defaultBs) {

      if (typeof bs !== 'undefined') {
        const bsBox = BABYLON.BoxBuilder.CreateBox('defaultBs', {size: 1}, scene);
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

    const candidateMat = new BABYLON.StandardMaterial('candidateMaterial', scene);
    candidateMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    const chosenMat = new BABYLON.StandardMaterial('chosenMaterial', scene);
    chosenMat.diffuseColor = new BABYLON.Color3(0, 0, 1);
    for (const candidate of this.candidate) {
        // const candidate = this.candidate[id];
        // const candidate = this.dragObject[id];
        const candBox = BABYLON.BoxBuilder.CreateBox('candidate', {size: 1}, scene);
        candBox.position = new BABYLON.Vector3(candidate.x + offsetX, candidate.z + offsetY, candidate.y + offsetZ);
        if (null != this.result['gaResult']) {
          for (const chosen of this.result['gaResult'].chosenCandidate) {
            if (candidate.x === chosen[0] && candidate.y === chosen[1] && candidate.z === chosen[2]) {
              candBox.material = chosenMat;
              break;
            } else {
              candBox.material = candidateMat;
            }
          }

          if (this.result['gaResult'].chosenCandidate.length > 1) {
            this.isCoverBlue = false;
          }

        } else {
            candBox.material = candidateMat;
        }

        this.candidateGroup.push(candBox);
    }

    const ueMat = new BABYLON.StandardMaterial('ueMaterial', scene);
    ueMat.diffuseColor = new BABYLON.Color3(1, 1, 0);
    for (const ue of this.ue) {
      // const ue = this.ue[id];
      // const ue = this.dragObject[id];
      const uePoint = BABYLON.SphereBuilder.CreateSphere('ue', {diameter: 0.5}, scene);
      uePoint.position = new BABYLON.Vector3(ue.x + offsetX, ue.z + offsetY, ue.y + offsetZ);
      uePoint.material = ueMat;

      this.ueGroup.push(uePoint);
    }

    for (let i = 0; i < this.zValue.length; i++) {
        const z = this.zValue[i];
        this.heatmapGroup[z] = [];

        const sinrMapPlane = BABYLON.MeshBuilder.CreateGround('sinrmap_' + z, {width: this.width, height: this.height}, scene);
        sinrMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genSinrMapData(i), this.width, this.height, scene, false, false);
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

        const pciMapPlane = BABYLON.MeshBuilder.CreateGround('pcimap_' + z, {width: this.width, height: this.height}, scene);
        pciMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genPciMapData(i), this.width, this.height, scene, false, false);
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

        const rsrpMapPlane = BABYLON.MeshBuilder.CreateGround('rsrpmap_' + z, {width: this.width, height: this.height}, scene);
        rsrpMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genRsrpMapData(i), this.width, this.height, scene, false, false);
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

        const ulThroughputMapPlane = BABYLON.MeshBuilder.CreateGround('ulThroughput_' + z, {width: this.width, height: this.height}, scene);
        ulThroughputMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genUlThroughputMapData(i), this.width, this.height, scene, false, false);
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

        const dlThroughputMapPlane = BABYLON.MeshBuilder.CreateGround('dlThroughput_' + z, {width: this.width, height: this.height}, scene);
        dlThroughputMapPlane.position.y = z + offsetY;
        if (null != this.result['gaResult']) {
            const heatmapMat = new BABYLON.StandardMaterial('heatmapMaterial', scene);
            const texture = BABYLON.RawTexture.CreateRGBTexture(this.genDlThroughputMapData(i), this.width, this.height, scene, false, false);
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
  }

  /** 切換顯示障礙物 */
  switchObstacle() {
    for (const id of this.obstacleGroup){
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示現有基站 */
  switchDefaultBs() {
    for (const id of this.defaultBsGroup) {
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示新增AP */
  switchCandidate() {
    for (const id of this.candidateGroup){
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示UE */
  switchUe() {
    for (const id of this.ueGroup){
      id.isVisible = !id.isVisible;
    }
  }

  /** 切換顯示heatmap */
  switchHeatMap() {
    Object.keys(this.heatmapGroup).forEach(id => {
      for (let i = 0; i < 5; i++) {
        if (id === this.planeHeight && i === Number(this.heatmapType)) {
          this.heatmapGroup[id][i].isVisible = true;
        } else {
          this.heatmapGroup[id][i].isVisible = false;
        }
      }
    });
  }

  /**
   * 訊號覆蓋圖
   * @param zIndex 高度
   */
  genPciMapData(zIndex) {
    const blockCount = this.defaultBs.length + this.result['gaResult'].chosenCandidate.length;
    const colorMap = new Uint8Array(this.width * this.height * 3);
    let allZero = true;
    const ary = [];
    this.result['gaResult']['connectionMap'].map(v => {
      // this.result['gaResult']['connectionMapAll'].map(v => {
      v.map(m => {
        m.map(d => {
          if (d != null && d > 0) {
            allZero = false;
          }
          ary.push(d);
        });
      });
    });

    const max = Plotly.d3.max(ary);
    const min = Plotly.d3.min(ary);
    const zDomain = [];
    const colorRange = [];
    for (let k = 0; k < this.colorscale.length; k++) {
      zDomain.push((max - min) * this.colorscale[k][0] + min);
      colorRange.push(this.colorscale[k][1]);
    }

    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].connectionMap[i][j] === 'undefined') {
            // if (typeof this.result['gaResult'].connectionMapAll[i][j] === 'undefined') {
              continue;
            }
            const value = this.result['gaResult'].connectionMap[i][j][zIndex];
            // const value = this.result['gaResult'].connectionMapAll[i][j][zIndex];
            if (value == null) {
              colorMap[n] = 255;
              colorMap[n + 1] = 255;
              colorMap[n + 2] = 255;
            } else if (allZero && this.isCoverBlue) {
              // 都是0的基站指定為藍色
              colorMap[n] = 12;
              colorMap[n + 1] = 51;
              colorMap[n + 2] = 131;
            } else {
              // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
              const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
              const hexColor = colorFN(value);
              const rgb = Plotly.d3.rgb(hexColor);
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
  }

  /**
   * 訊號品質圖
   * @param zIndex 高度
   */
  genSinrMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['sinrMax'] - this.result['sinrMin'];

    const sinrColorscale: any = [
      [0, 'rgb(12,51,131)'],
      [0.2, 'rgb(10,136,186)'],
      [0.3, 'rgb(136, 224, 53)'],
      [0.4, 'rgb(242,211,56)'],
      [0.75, 'rgb(242,143,56)'],
      [1, 'rgb(217,30,30)'],
    ];

    const min = -8;
    const max = 24;
    let zDomain = [];
    const colorRange = [];
    // for (let k = 0; k < sinrColorscale.length; k++) {
    //   zDomain.push((max - min) * sinrColorscale[k][0] + min);
    //   colorRange.push(sinrColorscale[k][1]);
    // }
    for (let k = 0; k < this.colorscale.length; k++) {
      // zDomain.push((max - min) * this.colorscale[k][0] + min);
      zDomain = JSON.parse(sessionStorage.getItem('quality_scale')).reverse();
      colorRange.push(this.colorscale[k][1]);
    }
    // alert(zDomain);

    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].sinrMap[i][j] === 'undefined') {
              continue;
            }
            const value = this.result['gaResult'].sinrMap[i][j][zIndex];
            if (value == null) {
              colorMap[n] = 255;
              colorMap[n + 1] = 255;
              colorMap[n + 2] = 255;
            } else {
              // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
              const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
              const hexColor = colorFN(value);
              const rgb = Plotly.d3.rgb(hexColor);
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
  }

  /**
   * 訊號強度圖
   * @param zIndex 高度
   */
  genRsrpMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['rsrpMax'] - this.result['rsrpMin'];

    const max = -44;
    const min = -140;
    // 計算顏色區間公式的domain
    let zDomain = [];
    // 計算顏色區間公式的range
    const colorRange = [];
    for (let k = 0; k < this.colorscale.length; k++) {
      // zDomain.push((max - min) * this.colorscale[k][0] + min);
      zDomain = JSON.parse(sessionStorage.getItem('strength_scale')).reverse();
      colorRange.push(this.colorscale[k][1]);
    }

    for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].rsrpMap[i][j] === 'undefined') {
              continue;
            }
            const value = this.result['gaResult'].rsrpMap[i][j][zIndex];
            if (value == null) {
              colorMap[n] = 255;
              colorMap[n + 1] = 255;
              colorMap[n + 2] = 255;
            } else {
              // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
              const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
              // get hex color
              const hexColor = colorFN(value);
              // hex轉rgb
              const rgb = Plotly.d3.rgb(hexColor);
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
  }

  /**
   * 上行傳輸速率圖
   * @param zIndex 高度
   */
  genUlThroughputMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    const totalDelta = this.result['ulThroughputMax'] - this.result['ulThroughputMin'];
    if (this.result['gaResult'].ulThroughputMap != null && this.result['gaResult'].ulThroughputMap.length > 0) {
      const max = 1200;
      const min = 100;
      let zDomain = [];
      const colorRange = [];
      for (let k = 0; k < this.colorscale.length; k++) {
        // zDomain.push((max - min) * this.colorscale[k][0] + min);
        zDomain = JSON.parse(sessionStorage.getItem('ulTpt_scale')).reverse();
        colorRange.push(this.colorscale[k][1]);
      }
      for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
            const n = (j * this.width + i) * 3;
            if (typeof this.result['gaResult'].ulThroughputMap[i][j] === 'undefined') {
              continue;
            }
            const value = this.result['gaResult'].ulThroughputMap[i][j][zIndex];
            if (value == null) {
              colorMap[n] = 255;
              colorMap[n + 1] = 255;
              colorMap[n + 2] = 255;
            } else {
              // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
              const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
              const hexColor = colorFN(value);
              const rgb = Plotly.d3.rgb(hexColor);
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
  }

  /**
   * 下行傳輸速率圖
   * @param zIndex 高度
   */
  genDlThroughputMapData(zIndex) {
    const colorMap = new Uint8Array(this.width * this.height * 3);
    if (this.result['gaResult'].dlThroughputMap != null && this.result['gaResult'].dlThroughputMap.length > 0) {
      const totalDelta = this.result['dlThroughputMax'] - this.result['dlThroughputMin'];
      const max = 1200;
      const min = 100;
      for (let j = 0; j < this.height; j++) {
          for (let i = 0; i < this.width; i++) {
              const n = (j * this.width + i) * 3;
              if (typeof this.result['gaResult'].dlThroughputMap[i][j] === 'undefined') {
                continue;
              }
              const value = this.result['gaResult'].dlThroughputMap[i][j][zIndex];
              if (value == null) {
                colorMap[n] = 255;
                colorMap[n + 1] = 255;
                colorMap[n + 2] = 255;
              } else {
                let zDomain = [];
                const colorRange = [];
                for (let k = 0; k < this.colorscale.length; k++) {
                  // zDomain.push((max - min) * this.colorscale[k][0] + min);
                  zDomain = JSON.parse(sessionStorage.getItem('ulTpt_scale')).reverse();
                  colorRange.push(this.colorscale[k][1]);
                }
                // 跟2D圖一樣用plotly套件提供用range計算顏色的方法
                const colorFN = Plotly.d3.scale.linear().domain(zDomain).range(colorRange);
                const hexColor = colorFN(value);
                const rgb = Plotly.d3.rgb(hexColor);
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
  }

  /**
   * 畫圖
   */
  mounted() {
    console.log('mounted');
    const vm = this;
    this.scene = this.createScene();
    console.log(this.scene);
    this.engine.runRenderLoop(() => {
      vm.scene.render();
      if (this.isPDF) {
        this.img.nativeElement.src = this.canvas.nativeElement.toDataURL();
      }
    });
    window.addEventListener('resize', () => {
        vm.engine.resize();
    });

    if (this.isPDF) {
      this.canvas.nativeElement.style.display = 'none';
    }
  }

  /**
   * closee dialog
   */
  close() {
    this.matDialog.closeAll();
  }

}
