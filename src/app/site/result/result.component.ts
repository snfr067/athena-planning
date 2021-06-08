import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import { PdfComponent } from '../pdf/pdf.component';
import { ProposeComponent } from '../modules/propose/propose.component';
import { SignalQualityComponent } from '../modules/signal-quality/signal-quality.component';
import { SignalCoverComponent } from '../modules/signal-cover/signal-cover.component';
import { SignalStrengthComponent } from '../modules/signal-strength/signal-strength.component';
import { PerformanceComponent } from '../modules/performance/performance.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { SiteInfoComponent } from '../modules/site-info/site-info.component';
import { MsgDialogComponent } from '../../utility/msg-dialog/msg-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { View3dComponent } from '../view3d/view3d.component';
import { FormService } from '../../service/form.service';
import { Options } from '@angular-slider/ngx-slider/options';
import { SignalUlThroughputComponent } from '../modules/signal-ul-throughput/signal-ul-throughput.component';
import { SignalDlThroughputComponent } from '../modules/signal-dl-throughput/signal-dl-throughput.component';

declare var Plotly: any;

/**
 * 結果頁
 */
@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    public spinner: NgxSpinnerService,
    private translateService: TranslateService,
    private formService: FormService,
    private http: HttpClient) { }

  /** task id */
  taskId;
  /** 結果data */
  result = {};
  /** 結果form */
  calculateForm: CalculateForm = new CalculateForm();
  /** 畫圖layout參數 */
  plotLayout;
  /** 顯示訊號品質圖 */
  showQuality = true;
  /** 顯示訊號覆蓋圖 */
  showCover = false;
  /** 顯示訊號強度圖 */
  showStrength = false;
  /** 顯示上行傳輸速率圖 */
  showUlThroughputMap = false;
  /** 顯示下行傳輸速率圖 */
  showDlThroughputMap = false;
  /** 高度list */
  zValues = [];
  /** 已選高度 */
  zValue;
  /** 訊號強度圖/訊號覆蓋圖/訊號強度圖/上行傳輸速率圖/下行傳輸速率圖 */
  chartType = 'SINR';
  /** Message dialog config */
  msgDialogConfig: MatDialogConfig = new MatDialogConfig();
  /** View 3D dialog config */
  view3dDialogConfig: MatDialogConfig = new MatDialogConfig();
  /** 現有基站 list */
  defaultBSList = [];
  defaultBSList4gTdd = [];
  defaultBSList4gFdd = [];
  defaultBSList5gTdd = [];
  defaultBSList5gFdd = [];
  /** AP list */
  candidateList = [];
  candidateTable4gTdd = [];
  candidateTable4gFdd = [];
  candidateTable5gTdd = [];
  candidateTable5gFdd = [];
  /** 障礙物 list */
  obstacleList = [];
  /** 行動終端 list */
  ueList = [];
  /** 是否歷史紀錄 */
  isHst = false;
  /** 是否顯示行動終端 */
  showUE = true;
  /** 歷史紀錄 result output */
  hstOutput = {};
  /** 有UE */
  showUEArea = false;
  /** 有障礙物 */
  showObstacleArea = false;
  /** 有AP */
  showCandidateArea = false;
  /** 障礙物顯示 */
  showObstacle = true;
  /** AP顯示 */
  showCandidate = true;
  /** slide heatmapw透明度 */
  opacityValue: number = 0.8;
  /** slide heatmapw透明度清單 */
  opacityOptions: Options = {
    showSelectionBar: true,
    showTicks: true,
    stepsArray: [
      { value: 0 },
      { value: 0.1 },
      { value: 0.2 },
      { value: 0.3 },
      { value: 0.4 },
      { value: 0.5 },
      { value: 0.6 },
      { value: 0.7 },
      { value: 0.8 },
      { value: 0.9 },
      { value: 1 }
    ]
  };
  /* 是否為模擬 */
  isSimulate = false;

  /** PDF Component */
  @ViewChild('pdf') pdf: PdfComponent;
  /** 建議方案 Component */
  @ViewChild('propose') propose: ProposeComponent;
  /** 訊號品質圖 Component */
  @ViewChild('quality') quality: SignalQualityComponent;
  /** 訊號覆蓋圖 Component */
  @ViewChild('cover') cover: SignalCoverComponent;
  /** 訊號強度圖 Component */
  @ViewChild('strength') strength: SignalStrengthComponent;
  /** 訊號強度圖 效能分析 */
  @ViewChild('performance') performance: PerformanceComponent;
  /** 統計圖 效能分析 */
  @ViewChild('statistics') statistics: StatisticsComponent;
  /** 設定資訊 效能分析 */
  @ViewChild('siteInfo') siteInfo: SiteInfoComponent;
  /** 上行傳輸速率圖 */
  @ViewChild('ulThroughputMap') ulThroughputMap: SignalUlThroughputComponent;
  /** 下行傳輸速率圖 */
  @ViewChild('dlThroughputMap') dlThroughputMap: SignalDlThroughputComponent;

  ngOnInit() {
    this.view3dDialogConfig.autoFocus = false;
    this.view3dDialogConfig.width = '80%';
    this.view3dDialogConfig.hasBackdrop = false;
    this.msgDialogConfig.autoFocus = false;
    this.route.queryParams.subscribe(params => {
      this.taskId = params['taskId'];
      if (params['isHst'] === 'true') {
        this.isHst = true;
      }
      this.getResult();
    });
    // this.getResult();

  }

  /**
   * 取得結果
   */
  getResult() {
    let url;
    if (this.isHst) {
      // 歷史紀錄
      url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
      url += `${this.authService.userToken}/${this.taskId}`;
    } else {
      url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
    }
    this.http.get(url).subscribe(
      res => {
        // console.log(res);
        if (this.isHst) {
          // 大小寫不同，各自塞回form
          this.result = this.formService.setHstOutputToResultOutput(res['output']);
          this.calculateForm = this.formService.setHstToForm(res);
          console.log(this.calculateForm);
          console.log(this.result);
          // setTimeout(() => {
          this.getCandidateList();
          // }, 3000);
          
        } else {
          this.calculateForm = res['input'];
          this.result = res['output'];
          console.log(this.calculateForm);
          console.log(this.result);
          this.getCandidateList();
        }
        //是否為模擬
        this.isSimulate = this.calculateForm.isSimulation;
        // this.calculateForm.defaultBs = this.calculateForm.bsList;
        if (this.calculateForm.defaultBs !== '') {
          console.log(this.calculateForm);
          let i = 0;
          const defaultBs = this.calculateForm.defaultBs.split('|');
          const txpower = JSON.parse(this.calculateForm.txPower);
          console.log(txpower);
          const frequency = JSON.parse(this.calculateForm.frequencyList);
          const bandwidth = JSON.parse(this.calculateForm.bandwidth);
          const mimoNumber = JSON.parse(this.calculateForm.mimoNumber);
          const dlFrequency = JSON.parse(this.calculateForm.dlFrequency);
          const ulFrequency = JSON.parse(this.calculateForm.ulFrequency);
          let ulmsc = this.calculateForm.ulMcsTable;
          let dlmsc = this.calculateForm.dlMcsTable;
          const ulMcsTable = ulmsc.substring(1,(ulmsc.length)-1).split(',');
          const dlMcsTable = ulmsc.substring(1,(ulmsc.length)-1).split(',');
          const ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer);
          const dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer);
          if (this.calculateForm.objectiveIndex == '1') {

          }
          let dlScs = [];
          let ulScs = [];
          if (this.calculateForm.duplex === "fdd" && this.calculateForm.objectiveIndex == '1') {
            dlScs = JSON.parse(this.calculateForm.dlScs);
            ulScs = JSON.parse(this.calculateForm.ulScs);
          }
          const scs = JSON.parse(this.calculateForm.scs);
          const dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth);
          const ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth);
          
          const protocol = this.calculateForm.objectiveIndex;
          const duplex = this.calculateForm.duplex;
          for (const item of defaultBs) {
            const obj = JSON.parse(item);
            this.defaultBSList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
          if (protocol == '0') {
            if (duplex == 'tdd') {
              for (const item of defaultBs) {
                const obj = JSON.parse(item);
                this.defaultBSList4gTdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  frequency: frequency[i],
                  bandwidth: bandwidth[i],
                  mimoNumber: mimoNumber[i]
                });
                i++;
              }
              console.log(this.defaultBSList4gTdd);
            } else {
              for (const item of defaultBs) {
                const obj = JSON.parse(item);
                this.defaultBSList4gFdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  dlFrequency: dlFrequency[i],
                  ulFrequency: ulFrequency[i],
                  ulBandwidth: ulBandwidth[i],
                  dlBandwidth: dlBandwidth[i],
                  mimoNumber: mimoNumber[i]
                });
                i++;
              }
            }
            
          } else if (protocol == '1') {
            if (duplex == 'tdd') {
              for (const item of defaultBs) {
                const obj = JSON.parse(item);
                this.defaultBSList5gTdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  frequency: frequency[i],
                  bandwidth: bandwidth[i],
                  scs: scs[i],
                  ulMcsTable: ulMcsTable[i],
                  dlMcsTable: dlMcsTable[i],
                  ulMimoLayer: ulMimoLayer[i],
                  dlMimoLayer: dlMimoLayer[i],

                });
                i++;
              }
            } else {
              for (const item of defaultBs) {
                const obj = JSON.parse(item);
                this.defaultBSList5gFdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  scs: scs[i],
                  dlScs: dlScs[i],
                  ulScs: ulScs[i],
                  ulMcsTable: ulMcsTable[i],
                  dlMcsTable: dlMcsTable[i],
                  ulMimoLayer: ulMimoLayer[i],
                  dlMimoLayer: dlMimoLayer[i],
                  dlFrequency: dlFrequency[i],
                  ulFrequency: ulFrequency[i],
                  ulBandwidth: ulBandwidth[i],
                  dlBandwidth: dlBandwidth[i],
                });
                i++;
              }
            }
          //WiFi below
          } else {

          }
          for (const item of defaultBs) {
            const obj = JSON.parse(item);
            this.defaultBSList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        let candidateBs = [];
        if (this.calculateForm.candidateBs !== '') {
          this.showCandidateArea = true;
          candidateBs = this.calculateForm.candidateBs.split('|');
          for (const item of candidateBs) {
            const obj = JSON.parse(item);
            this.candidateList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        if (this.calculateForm.obstacleInfo !== '') {
          this.showObstacleArea = true;
          const obstacleInfo = this.calculateForm.obstacleInfo.split('|');
          for (const item of obstacleInfo) {
            const obj = JSON.parse(item);
            this.obstacleList.push({
              x: obj[0],
              y: obj[1],
              // z: 0,
              width: obj[2],
              height: obj[3],
              altitude: obj[4],
              color: "#73805c",
              // type: "obstacle",
              // title: "障礙物",
              // material: "0",
              // element: 0,
              rotate: 0,
            });
          }
        }

        if (this.calculateForm.ueCoordinate !== '') {
          this.showUEArea = true;
          const ueCoordinate = this.calculateForm.ueCoordinate.split('|');
          for (const item of ueCoordinate) {
            const obj = JSON.parse(item);
            this.ueList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        // 建議方案
        this.propose.calculateForm = this.calculateForm;
        this.propose.result = this.result;
        this.propose.drawLayout(false);
        // 訊號品質圖
        this.zValues = JSON.parse(this.calculateForm.zValue);
        this.zValue = this.zValues[0];
        this.drawQuality();
        // 預估效能
        this.performance.calculateForm = this.calculateForm;
        this.performance.result = this.result;
        this.performance.setData();
        // 統計資訊
        this.statistics.calculateForm = this.calculateForm;
        this.statistics.result = this.result;
        this.statistics.drawChart(false);

        this.siteInfo.calculateForm = this.calculateForm;
        this.siteInfo.result = this.result;
        window.setTimeout(() => {
          this.siteInfo.inputBsListCount = candidateBs.length;
          if(this.calculateForm['defaultBs'] !== '') {
            this.siteInfo.defaultBsCount = this.calculateForm['defaultBs'].split('|').length;
          }
        }, 0);

        this.hstOutput['gaResult'] = {};
        this.hstOutput['gaResult']['chosenCandidate'] = this.result['chosenCandidate'];
        this.hstOutput['gaResult']['sinrMap'] = this.result['sinrMap'];
        this.hstOutput['gaResult']['connectionMapAll'] = this.result['connectionMapAll'];
        this.hstOutput['gaResult']['rsrpMap'] = this.result['rsrpMap'];
        this.hstOutput['gaResult']['ulThroughputMap'] = this.result['ulThroughputMap'];
        this.hstOutput['gaResult']['dlThroughputMap'] = this.result['throughputMap'];

        const sinrAry = [];
        this.result['sinrMap'].map(v => {
          v.map(m => {
            m.map(d => {
              sinrAry.push(d);
            });
          });
        });

        const rsrpAry = [];
        this.result['rsrpMap'].map(v => {
          v.map(m => {
            m.map(d => {
              rsrpAry.push(d);
            });
          });
        });

        const ulThroughputAry = [];
        this.result['ulThroughputMap'].map(v => {
          v.map(m => {
            m.map(d => {
              ulThroughputAry.push(d);
            });
          });
        });

        const dlThroughputAry = [];
        this.result['throughputMap'].map(v => {
          v.map(m => {
            m.map(d => {
              dlThroughputAry.push(d);
            });
          });
        });

        this.hstOutput['sinrMax'] = Plotly.d3.max(sinrAry);
        this.hstOutput['sinrMin'] = Plotly.d3.min(sinrAry);
        this.hstOutput['rsrpMax'] = Plotly.d3.max(rsrpAry);
        this.hstOutput['rsrpMin'] = Plotly.d3.min(rsrpAry);
        this.hstOutput['ulThroughputMax'] = Plotly.d3.max(ulThroughputAry);
        this.hstOutput['ulThroughputMin'] = Plotly.d3.min(ulThroughputAry);
        this.hstOutput['dlThroughputMax'] = Plotly.d3.max(dlThroughputAry);
        this.hstOutput['dlThroughputMin'] = Plotly.d3.min(dlThroughputAry);
      }
    );
    // this.getCandidateList();
  }

  getCandidateList() {
    let index = 1;
    const numMap = {};
    const xyMap = {};
    const x = [];
    const y = [];
    const text = [];
    // const color = [];

    if (!this.authService.isEmpty(this.calculateForm.candidateBs)) {
      const candidateBs = this.calculateForm.candidateBs.split('|');
      for (let i = 0; i < candidateBs.length; i++) {
        const candidate = JSON.parse(candidateBs[i]);
        numMap[candidate] = index;
        xyMap[candidate] = {
          x: candidate[0],
          y: candidate[1]
        };
        x.push(candidate[0]);
        y.push(candidate[1]);
        text.push(index);
        // color.push('#7083d6');
        index++;
      }
      console.log(numMap);
      console.log(xyMap);
    }
    // 被選中的bs index
    const chosenNum = [];
    this.candidateList.length = 0;
    for (let i = 0; i < this.result['chosenCandidate'].length; i++) {
      if (typeof numMap[this.result['chosenCandidate'][i].toString()] !== 'undefined') {
        this.candidateList.push([
          numMap[this.result['chosenCandidate'][i].toString()],
          xyMap[this.result['chosenCandidate'][i].toString()].x,
          xyMap[this.result['chosenCandidate'][i].toString()].y,
          this.result['candidateBsPower'][i],
          this.result['candidateBeamId'][i]
        ]);
        // color[numMap[this.result['chosenCandidate'][i]] - 1] = 'red';
        chosenNum.push(numMap[this.result['chosenCandidate'][i].toString()]);
      }
    }
    // console.log(xyMap);
    // console.log(numMap);
    // console.log(chosenNum);
    // this.candidateTable = [];
    const txpower = this.result['candidateBsPower'];
    const beamId = this.result['candidateBeamId'];
    const frequency = JSON.parse(this.calculateForm.frequencyList);
    const bandwidth = JSON.parse(this.calculateForm.bandwidth);
    const mimoNumber = JSON.parse(this.calculateForm.mimoNumber);
    const dlFrequency = JSON.parse(this.calculateForm.dlFrequency);
    const ulFrequency = JSON.parse(this.calculateForm.ulFrequency);
    let ulmsc = this.calculateForm.ulMcsTable;
    let dlmsc = this.calculateForm.dlMcsTable;
    const ulMcsTable = ulmsc.substring(1,(ulmsc.length)-1).split(',');
    const dlMcsTable = ulmsc.substring(1,(ulmsc.length)-1).split(',');
    const ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer);
    const dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer);
    let dlScs = [];
    let ulScs = [];
    let i = 0;
    if (this.calculateForm.duplex === "fdd" && this.calculateForm.objectiveIndex == '1') {
      dlScs = JSON.parse(this.calculateForm.dlScs);
      ulScs = JSON.parse(this.calculateForm.ulScs);
    }
    const scs = JSON.parse(this.calculateForm.scs);
    const dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth);
    const ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth);
    const protocol = this.calculateForm.objectiveIndex;
    const duplex = this.calculateForm.duplex;
    if (protocol == '0') {
      if (duplex == 'tdd') {
        for (const item of chosenNum) {
          this.candidateTable4gTdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            frequency: frequency[item-1],
            bandwidth: bandwidth[item-1],
            mimoNumber: mimoNumber[item-1]
          });
          i++;
        }
        console.log(chosenNum);
        console.log(txpower);
        console.log(frequency);
        console.log(bandwidth);
      } else {
        for (const item of chosenNum) {
          this.candidateTable4gFdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            dlFrequency: dlFrequency[item-1],
            ulFrequency: ulFrequency[item-1],
            ulBandwidth: ulBandwidth[item-1],
            dlBandwidth: dlBandwidth[item-1],
            mimoNumber: mimoNumber[item-1]
          });
          i++;
        }
      }
    } else if (protocol == '1') {
      if (duplex == 'tdd') {
        for (const item of chosenNum) {
          this.candidateTable5gTdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            frequency: frequency[item-1],
            bandwidth: bandwidth[item-1],
            scs: scs[item-1],
            ulMcsTable: ulMcsTable[item-1],
            dlMcsTable: dlMcsTable[item-1],
            ulMimoLayer: ulMimoLayer[item-1],
            dlMimoLayer: dlMimoLayer[item-1],
          });
          i++;
        }
      } else {
        for (const item of chosenNum) {
          this.candidateTable5gFdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            dlFrequency: dlFrequency[item-1],
            ulFrequency: ulFrequency[item-1],
            ulBandwidth: ulBandwidth[item-1],
            dlBandwidth: dlBandwidth[item-1],
            mimoNumber: mimoNumber[item-1],
            scs: scs[item-1],
            dlScs: dlScs[item-1],
            ulScs: ulScs[item-1],
            ulMcsTable: ulMcsTable[item-1],
            dlMcsTable: dlMcsTable[item-1],
            ulMimoLayer: ulMimoLayer[item-1],
            dlMimoLayer: dlMimoLayer[item-1],
          });
          i++;
        }
      }
    } else {

    }
  }

  /** export PDF */
  async exportPDF() {
    this.pdf.export(this.taskId, this.isHst);
  }

  /** 訊號品質圖 */
  drawQuality() {
    this.showCover = false;
    this.showStrength = false;
    this.showDlThroughputMap = false;
    this.showUlThroughputMap = false;
    this.showQuality = true;
    window.setTimeout(() => {
      this.quality.showUE = this.showUE;
      this.quality.calculateForm = this.calculateForm;
      this.quality.result = this.result;
      this.quality.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.quality.showCandidate = this.showCandidate;
      this.quality.opacityValue = this.opacityValue;
      this.quality.draw(false, this.zValue);
    }, 0);
  }

  /** 訊號覆蓋圖 */
  drawCover() {
    this.showQuality = false;
    this.showCover = true;
    this.showStrength = false;
    this.showDlThroughputMap = false;
    this.showUlThroughputMap = false;
    window.setTimeout(() => {
      this.cover.showUE = this.showUE;
      this.cover.calculateForm = this.calculateForm;
      this.cover.result = this.result;
      this.cover.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.cover.showCandidate = this.showCandidate;
      this.cover.opacityValue = this.opacityValue;
      this.cover.draw(false, this.zValue);
    }, 0);
  }

  /** 訊號強度圖 */
  drawStrength() {
    this.showQuality = false;
    this.showCover = false;
    this.showStrength = true;
    this.showDlThroughputMap = false;
    this.showUlThroughputMap = false;
    window.setTimeout(() => {
      this.strength.showUE = this.showUE;
      this.strength.calculateForm = this.calculateForm;
      this.strength.result = this.result;
      this.strength.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.strength.showCandidate = this.showCandidate;
      this.strength.opacityValue = this.opacityValue;
      this.strength.draw(false, this.zValue);
    }, 0);
  }

  /** 上行傳輸速率圖 */
  drawUlThroughputMap() {
    this.showQuality = false;
    this.showCover = false;
    this.showStrength = false;
    this.showDlThroughputMap = false;
    this.showUlThroughputMap = true;
    window.setTimeout(() => {
      this.ulThroughputMap.showUE = this.showUE;
      this.ulThroughputMap.calculateForm = this.calculateForm;
      this.ulThroughputMap.result = this.result;
      this.ulThroughputMap.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.ulThroughputMap.showCandidate = this.showCandidate;
      this.ulThroughputMap.opacityValue = this.opacityValue;
      this.ulThroughputMap.draw(false, this.zValue);
    }, 0);
  }

  /** 下行傳輸速率圖 */
  drawDlThroughputMap() {
    this.showQuality = false;
    this.showCover = false;
    this.showStrength = false;
    this.showDlThroughputMap = true;
    this.showUlThroughputMap = false;
    window.setTimeout(() => {
      this.dlThroughputMap.showUE = this.showUE;
      this.dlThroughputMap.calculateForm = this.calculateForm;
      this.dlThroughputMap.result = this.result;
      this.dlThroughputMap.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.dlThroughputMap.showCandidate = this.showCandidate;
      this.dlThroughputMap.opacityValue = this.opacityValue;
      this.dlThroughputMap.draw(false, this.zValue);
    }, 0);
  }

  /** change 高度 */
  changeZvalue() {
    if (this.chartType === 'SINR') {
      this.drawQuality();
    } else if (this.chartType === 'PCI') {
      this.drawCover();
    } else if (this.chartType === 'RSRP') {
      this.drawStrength();
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.drawUlThroughputMap();
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.drawDlThroughputMap();
    }
  }

  /** 回上頁 */
  back() {
    this.save(true);
  }

  /**
   * 儲存
   * @param isBack 儲存後是否回上一頁 
   */
  save(isBack) {
    const form = {
      id: this.authService.userId,
      taskid: this.taskId,
      sessionid: this.authService.userToken
    };
    const url = `${this.authService.API_URL}/storeResult`;
    this.http.post(url, JSON.stringify(form)).subscribe(
      res => {
        if (isBack) {
          // 回上一頁
          this.router.navigate(['/site/site-planning'], { queryParams: { taskId: this.taskId, isHst: true }});
        } else {
          this.msgDialogConfig.data = {
            type: 'success',
            infoMessage: this.translateService.instant('save.success')
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        }
      },
      err => {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: this.translateService.instant('save.failed')
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
    );
  }

  /**
   * View 3D
   */
  view3D() {
    console.log(this.obstacleList);
    this.view3dDialogConfig.data = {
      calculateForm: this.calculateForm,
      obstacleList: this.obstacleList,
      defaultBSList: this.defaultBSList,
      candidateList: this.candidateList,
      ueList: this.ueList,
      zValue: this.zValues,
      result: this.hstOutput
    };
    this.matDialog.open(View3dComponent, this.view3dDialogConfig);
  }

  /** ON/OFF 顯示UE */
  switchShowUE() {
    if (this.chartType === 'SINR') {
      this.quality.switchUE(this.showUE);
    } else if (this.chartType === 'PCI') {
      this.cover.switchUE(this.showUE);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchUE(this.showUE);
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.ulThroughputMap.switchUE(this.showUE);
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.dlThroughputMap.switchUE(this.showUE);
    }
  }

  /** ON/OFF 顯示障礙物 */
  switchShowObstacle() {
    const visible = this.showObstacle ? 'visible' : 'hidden';
    if (this.chartType === 'SINR') {
      this.quality.switchShowObstacle(visible);
    } else if (this.chartType === 'PCI') {
      this.cover.switchShowObstacle(visible);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchShowObstacle(visible);
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.ulThroughputMap.switchShowObstacle(visible);
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.dlThroughputMap.switchShowObstacle(visible);
    }
    
  }

  /** ON/OFF 顯示AP */
  switchShowCandidate() {
    const visible = this.showCandidate;
    if (this.chartType === 'SINR') {
      this.quality.switchShowCandidate(visible);
    } else if (this.chartType === 'PCI') {
      this.cover.switchShowCandidate(visible);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchShowCandidate(visible);
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.ulThroughputMap.switchShowCandidate(visible);
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.dlThroughputMap.switchShowCandidate(visible);
    }
    
  }

  /** heatmap透明度 */
  changeOpacity() {
    if (this.chartType === 'SINR') {
      this.quality.opacityValue = this.opacityValue;
      this.quality.changeOpacity();
    } else if (this.chartType === 'PCI') {
      this.cover.opacityValue = this.opacityValue;
      this.cover.changeOpacity();
    } else if (this.chartType === 'RSRP') {
      this.strength.opacityValue = this.opacityValue;
      this.strength.changeOpacity();
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.ulThroughputMap.opacityValue = this.opacityValue;
      this.ulThroughputMap.changeOpacity();
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.dlThroughputMap.opacityValue = this.opacityValue;
      this.dlThroughputMap.changeOpacity();
    }
  }

}
