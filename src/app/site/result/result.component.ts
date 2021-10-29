import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import { PdfComponent } from '../pdf/pdf.component';
import { ProposeComponent } from '../modules/propose/propose.component';
import { SubFieldComponent } from '../modules/sub-field/sub-field.component';
import { SitePlanningMapComponent } from '../modules/site-planning-map/site-planning-map.component';
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
  defaultBSListWifi = [];
  /** AP list */
  candidateList = [];
  candidateTable4gTdd = [];
  candidateTable4gFdd = [];
  candidateTable5gTdd = [];
  candidateTable5gFdd = [];
  candidateTableWifi = [];
  ary = [];
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
  /** 有BS */
  showBsArea = false;
  /** 有AP */
  showCandidateArea = false;
  /** 障礙物顯示 */
  showObstacle = true;
  /** AP顯示 */
  showCandidate = true;
  showBs = true;
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
  /* 是否有暫存子場域 */
  isSubFieldExist = false;

  /** PDF Component */
  @ViewChild('pdf') pdf: PdfComponent;
  /** 建議方案 Component */
  @ViewChild('propose') propose: ProposeComponent;
  /** 子場域 Component */
  @ViewChild('subField') subField: SubFieldComponent;
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
  @ViewChild('sitePlanningMap') sitePlanningMap: SitePlanningMapComponent;

  ngOnInit() {
    sessionStorage.removeItem('form_blank_task');
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
    if (sessionStorage.getItem('sub_field_coor') == null || sessionStorage.getItem('sub_field_coor') == '[]') {
      this.isSubFieldExist = false;
    } else {
      this.isSubFieldExist = true;
    }
    // this.getResult();
  }

  /**
   * 取得結果
   */
  getResult() {
    let url;
    this.authService.spinnerShowResult();
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
        // let defaultidx = [];
        if (this.isHst) {
          // 大小寫不同，各自塞回form
          this.result = this.formService.setHstOutputToResultOutput(res['output']);
          this.calculateForm = this.formService.setHstToForm(res);
          console.log(this.calculateForm);
          console.log(this.result);
          // defaultidx = this.result['defaultidx'];
          if (!this.calculateForm.isSimulation) {
            this.getCandidateList();
            // console.log(`Get Candidate`);
          }
          
        } else {
          this.calculateForm = res['input'];
          this.result = res['output'];
          console.log(this.calculateForm);
          console.log(this.result);
          // defaultidx = this.result['defaultIdx'];
          if (!this.calculateForm.isSimulation) {
            this.getCandidateList();
            // console.log(`Get Candidate`);
          }
        }
        //是否為模擬
        this.isSimulate = this.calculateForm.isSimulation;
        // this.calculateForm.defaultBs = this.calculateForm.bsList;
        if (this.calculateForm.defaultBs !== '') {
          let candidateNum = 0;
          if (this.candidateList.length != 0) {candidateNum = this.calculateForm.candidateBs.split('|').length;}
          // console.log(candidateNum);
          this.showBsArea = true;
          console.log(this.calculateForm);
          let i = 0;
          const defaultBs = this.calculateForm.defaultBs.split('|');
          let unsorttxpower = [];
          let unsortbeamid = [];
          let txpower = [];
          let beamid = [];
          if (this.isSimulate) {
            txpower = JSON.parse(this.calculateForm.txPower);
            beamid = JSON.parse(this.calculateForm.beamId);
          } else {
            if (this.isHst) {
              unsorttxpower = JSON.parse(this.calculateForm.txPower);
              unsortbeamid = JSON.parse(this.calculateForm.beamId);
            } else {
              // console.log(this.result);
              unsorttxpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
              unsortbeamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
            }
            for (let i = 0;i < this.result['defaultIdx'].length;i++) {
              for (let j = 0;j < this.result['defaultIdx'].length;j++) {
                if (i == this.result['defaultIdx'][j]) {
                  txpower.push(unsorttxpower[j]);
                  beamid.push(unsortbeamid[j]);
                }
              }
            }
          }
          // console.log(defaultidx);
          // console.log(unsorttxpower);
          // console.log(unsortbeamid);
          // console.log(txpower);
          // console.log(beamid);
          const frequency = JSON.parse(this.calculateForm.frequencyList);
          const bandwidth = JSON.parse(this.calculateForm.bandwidth);
          const mimoNumber = JSON.parse(this.calculateForm.mimoNumber);
          const dlFrequency = JSON.parse(this.calculateForm.dlFrequency);
          const ulFrequency = JSON.parse(this.calculateForm.ulFrequency);
          let ulmsc = this.calculateForm.ulMcsTable;
          let dlmsc = this.calculateForm.dlMcsTable;
          let ulMcsTable = ulmsc.substring(1,(ulmsc.length)-1).split(',');
          ulMcsTable = ulMcsTable.slice(-(defaultBs.length))
          let dlMcsTable = dlmsc.substring(1,(dlmsc.length)-1).split(',');
          dlMcsTable = dlMcsTable.slice(-(defaultBs.length))
          let wifiProtocol = (this.calculateForm.wifiProtocol != null) ? this.calculateForm.wifiProtocol.substring(1,(this.calculateForm.wifiProtocol.length)-1).split(',') : [];
          let guardInterval = (this.calculateForm.guardInterval != null) ? this.calculateForm.guardInterval.substring(1,(this.calculateForm.guardInterval.length)-1).split(',') : [];
          let wifiMimo = (this.calculateForm.wifiMimo != null) ? this.calculateForm.wifiMimo.substring(1,(this.calculateForm.wifiMimo.length)-1).split(',') : [];
          const ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer);
          const dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer);
          // if (this.calculateForm.objectiveIndex == '1') {

          // }
          let dlScs = [];
          let ulScs = [];
          if (this.calculateForm.duplex === "fdd" && this.calculateForm.objectiveIndex == '1') {
            dlScs = JSON.parse(this.calculateForm.dlScs);
            ulScs = JSON.parse(this.calculateForm.ulScs);
          }
          let scs = [];
          if (this.calculateForm.duplex === "tdd") {
            scs = JSON.parse(this.calculateForm.scs);
          }
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
                  beamid: beamid[i],
                  frequency: frequency[i+candidateNum],
                  bandwidth: bandwidth[i+candidateNum],
                  mimoNumber: mimoNumber[i+candidateNum]
                });
                i++;
              }
              // console.log(this.defaultBSList4gTdd);
            } else {
              for (const item of defaultBs) {
                const obj = JSON.parse(item);
                this.defaultBSList4gFdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  beamid: beamid[i],
                  dlFrequency: dlFrequency[i+candidateNum],
                  ulFrequency: ulFrequency[i+candidateNum],
                  ulBandwidth: ulBandwidth[i+candidateNum],
                  dlBandwidth: dlBandwidth[i+candidateNum],
                  mimoNumber: mimoNumber[i+candidateNum]
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
                  beamid: beamid[i],
                  frequency: frequency[i+candidateNum],
                  bandwidth: bandwidth[i+candidateNum],
                  scs: scs[i+candidateNum],
                  ulMcsTable: ulMcsTable[i],
                  dlMcsTable: dlMcsTable[i],
                  ulMimoLayer: ulMimoLayer[i+candidateNum],
                  dlMimoLayer: dlMimoLayer[i+candidateNum],

                });
                i++;
              }
            } else {
              // console.log(txpower);
              for (const item of defaultBs) {
                const obj = JSON.parse(item);
                this.defaultBSList5gFdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  beamid: beamid[i],
                  scs: scs[i+candidateNum],
                  dlScs: dlScs[i+candidateNum],
                  ulScs: ulScs[i+candidateNum],
                  ulMcsTable: ulMcsTable[i],
                  dlMcsTable: dlMcsTable[i],
                  ulMimoLayer: ulMimoLayer[i+candidateNum],
                  dlMimoLayer: dlMimoLayer[i+candidateNum],
                  dlFrequency: dlFrequency[i+candidateNum],
                  ulFrequency: ulFrequency[i+candidateNum],
                  ulBandwidth: ulBandwidth[i+candidateNum],
                  dlBandwidth: dlBandwidth[i+candidateNum],
                });
                i++;
              }
            }
          //WiFi below
          } else {
            for (const item of defaultBs) {
              const obj = JSON.parse(item);
              this.defaultBSListWifi.push({
                x: obj[0],
                y: obj[1],
                z: obj[2],
                txpower: txpower[i],
                beamid: beamid[i],
                frequency: frequency[i+candidateNum],
                bandwidth: bandwidth[i+candidateNum],
                wifiProtocol: wifiProtocol[i+candidateNum],
                guardInterval: guardInterval[i+candidateNum],
                wifiMimo: wifiMimo[i+candidateNum]
              });
              i++;
            }
            //defaultBSListWifi
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
              width: obj[2],
              height: obj[3],
              altitude: obj[4],
              color: (typeof obj[8] !== 'undefined' ? obj[8] : '#73805c'),
              rotate: obj[5],
              material: obj[6],
              element: obj[7],
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
        //3D
        this.ary = this.set3dPosition();

        // 建議方案
        this.propose.calculateForm = this.calculateForm;
        this.propose.result = this.result;
        this.propose.drawLayout(false);
        // 子場域
        if (this.isSubFieldExist) {
          this.subField.calculateForm = this.calculateForm;
          this.subField.result = this.result;
          this.subField.drawLayout(false);
        }
        // 訊號品質圖
        this.zValues = JSON.parse(this.calculateForm.zValue);
        this.zValue = this.zValues[0];
        this.drawQuality(false);
        // 預估效能
        this.performance.calculateForm = this.calculateForm;
        this.performance.result = this.result;
        this.performance.isHst = this.isHst;
        this.performance.setData();
        // 統計資訊
        this.statistics.calculateForm = this.calculateForm;
        this.statistics.result = this.result;
        this.statistics.drawChart(false);
        // TEST
        // window.setTimeout(() => {
        //   this.sitePlanningMap.calculateForm = this.calculateForm;
        //   this.sitePlanningMap.result = this.result;
        //   this.sitePlanningMap.draw(false, this.zValue);
        // }, 0);
        

        this.siteInfo.calculateForm = this.calculateForm;
        this.siteInfo.planningObj.isAverageSinr = this.calculateForm.isAverageSinr;
        this.siteInfo.planningObj.isCoverage = this.calculateForm.isCoverage;
        this.siteInfo.planningObj.isUeAvgSinr = this.calculateForm.isUeAvgSinr;
        this.siteInfo.planningObj.isUeAvgThroughput = this.calculateForm.isUeAvgThroughput;
        this.siteInfo.planningObj.isUeCoverage = this.calculateForm.isUeCoverage;
        console.log(this.siteInfo.calculateForm);
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
        this.hstOutput['gaResult']['connectionMap'] = this.result['connectionMap'];
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
        try {
          this.result['ulThroughputMap'].map(v => {
            v.map(m => {
              m.map(d => {
                ulThroughputAry.push(d);
              });
            });
          });
        } catch(e) {
          console.log('No ulThorughput data, it may be an old record');
        }

        const dlThroughputAry = [];
        try {
          this.result['throughputMap'].map(v => {
            v.map(m => {
              m.map(d => {
                dlThroughputAry.push(d);
              });
            });
          });
        } catch(e){
          console.log('No dlThorughput data, it may be an old record');
        }

        this.hstOutput['sinrMax'] = Plotly.d3.max(sinrAry);
        this.hstOutput['sinrMin'] = Plotly.d3.min(sinrAry);
        this.hstOutput['rsrpMax'] = Plotly.d3.max(rsrpAry);
        this.hstOutput['rsrpMin'] = Plotly.d3.min(rsrpAry);
        this.hstOutput['ulThroughputMax'] = Plotly.d3.max(ulThroughputAry);
        this.hstOutput['ulThroughputMin'] = Plotly.d3.min(ulThroughputAry);
        this.hstOutput['dlThroughputMax'] = Plotly.d3.max(dlThroughputAry);
        this.hstOutput['dlThroughputMin'] = Plotly.d3.min(dlThroughputAry);
        this.authService.spinnerHide();
      }
    );
    // this.getCandidateList();
  }

  // financial(x) {
  //   return Number.parseFloat(x).toFixed(1);
  // }

  getCandidateList() {
    let index = 1;
    const numMap = {};
    const xyMap = {};
    const x = [];
    const y = [];
    const text = [];
    let candidateBs = [];
    // const color = [];

    if (!this.authService.isEmpty(this.calculateForm.candidateBs)) {
      candidateBs = this.calculateForm.candidateBs.split('|');
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
    const beamid = this.result['candidateBeamId'];
    const frequency = JSON.parse(this.calculateForm.frequencyList);
    const bandwidth = JSON.parse(this.calculateForm.bandwidth);
    const mimoNumber = JSON.parse(this.calculateForm.mimoNumber);
    const dlFrequency = JSON.parse(this.calculateForm.dlFrequency);
    const ulFrequency = JSON.parse(this.calculateForm.ulFrequency);
    let ulmsc = this.calculateForm.ulMcsTable;
    let dlmsc = this.calculateForm.dlMcsTable;
    let ulMcsTable = (ulmsc != null) ? ulmsc.substring(1,(ulmsc.length)-1).split(',') : [];
    let dlMcsTable = (dlmsc != null) ? dlmsc.substring(1,(dlmsc.length)-1).split(',') : [];
    let wifiProtocol = (this.calculateForm.wifiProtocol != null) ? this.calculateForm.wifiProtocol.substring(1,(this.calculateForm.wifiProtocol.length)-1).split(',') : [];
    let guardInterval = (this.calculateForm.guardInterval != null) ? this.calculateForm.guardInterval.substring(1,(this.calculateForm.guardInterval.length)-1).split(',') : [];
    let wifiMimo = (this.calculateForm.wifiMimo != null) ? this.calculateForm.wifiMimo.substring(1,(this.calculateForm.wifiMimo.length)-1).split(',') : [];
    const ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer);
    const dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer);
    let dlScs = [];
    let ulScs = [];
    let i = 0;
    if (this.calculateForm.duplex === "fdd" && this.calculateForm.objectiveIndex == '1') {
      dlScs = JSON.parse(this.calculateForm.dlScs);
      ulScs = JSON.parse(this.calculateForm.ulScs);
    }
    let scs = [];
    if (this.calculateForm.duplex === "tdd") {
      scs = JSON.parse(this.calculateForm.scs);
    }
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
            beamid: beamid[i],
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
            beamid: beamid[i],
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
            beamid: beamid[i],
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
            beamid: beamid[i],
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
      for (const item of chosenNum) {
        this.candidateTableWifi.push({
          num: item,
          x: xyMap[this.result['chosenCandidate'][i].toString()].x,
          y: xyMap[this.result['chosenCandidate'][i].toString()].y,
          txpower: txpower[i],
          beamid: beamid[i],
          frequency: frequency[item-1],
          bandwidth: bandwidth[item-1],
          wifiProtocol: wifiProtocol[item-1],
          guardInterval: guardInterval[item-1],
          wifiMimo: wifiMimo[item-1]
        });
        i++
      }
    }
  }

  /** export PDF */
  async exportPDF() {
    this.pdf.export(this.taskId, this.isHst);
  }

  /** 訊號品質圖 */
  drawQuality(getColorScale) {
    if (!getColorScale) {
      this.showCover = false;
      this.showStrength = false;
      this.showDlThroughputMap = false;
      this.showUlThroughputMap = false;
      this.showQuality = true;
    }
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
  drawStrength(getColorScale) {
    if (!getColorScale) {
      this.showQuality = false;
      this.showCover = false;
      this.showStrength = true;
      this.showDlThroughputMap = false;
      this.showUlThroughputMap = false;
    }
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
  drawUlThroughputMap(getColorScale) {
    if (!getColorScale) {
      this.showQuality = false;
      this.showCover = false;
      this.showStrength = false;
      this.showDlThroughputMap = false;
      this.showUlThroughputMap = true;
    }
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
  drawDlThroughputMap(getColorScale) {
    if (!getColorScale) {
      this.showQuality = false;
      this.showCover = false;
      this.showStrength = false;
      this.showDlThroughputMap = true;
      this.showUlThroughputMap = false;
    }
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
      this.drawQuality(false);
    } else if (this.chartType === 'PCI') {
      this.drawCover();
    } else if (this.chartType === 'RSRP') {
      this.drawStrength(false);
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.drawUlThroughputMap(false);
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.drawDlThroughputMap(false);
    }
  }

  /** 回上頁 */
  back() {
    // this.authService.clearStorage();
    if (this.isHst) {
      this.router.navigate(['/site/site-planning'], { queryParams: { taskId: this.taskId, isHst: true }});
    } else {
      this.save(true);
    }
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
    console.log(this.defaultBSList);
    console.log(this.candidateList);
    this.view3dDialogConfig.data = {
      calculateForm: this.calculateForm,
      obstacleList: this.obstacleList,
      defaultBSList: this.defaultBSList,
      candidateList: this.candidateList,
      ueList: this.ueList,
      zValue: this.zValues,
      result: this.hstOutput,
      ary: this.ary
    };
    this.matDialog.open(View3dComponent, this.view3dDialogConfig);
    // 不知為何，只開一次dialog位置會偏移
    this.matDialog.closeAll();
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

  /** ON/OFF 顯示BS */
  switchShowBs() {
    const visible = this.showBs ? 'visible' : 'hidden';
    if (this.chartType === 'SINR') {
      this.quality.switchShowBs(visible);
    } else if (this.chartType === 'PCI') {
      this.cover.switchShowBs(visible);
    } else if (this.chartType === 'RSRP') {
      this.strength.switchShowBs(visible);
    } else if (this.chartType === 'UL_THROUGHPUT') {
      this.ulThroughputMap.switchShowBs(visible);
    } else if (this.chartType === 'DL_THROUGHPUT') {
      this.dlThroughputMap.switchShowBs(visible);
    }
  }

  /** ON/OFF 顯示Candidate */
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

  set3dPosition() {
    const ary = [];
    let obstacleList = this.calculateForm.obstacleInfo.split('|');
    if (obstacleList[0] == '') {
      obstacleList = [];
    }
    for (const el of obstacleList) {
      let item = JSON.parse(el);
      let angle = Number(item[5]%360);
      let obWid = Number(item[2]);
      let obHei = Number(item[3]);
      let deg = 2*Math.PI/360;
      let x = Number(item[0]);
      let y = Number(item[1]);
      let xy = [];
      if (angle != 0) { //有旋轉
        if (item[7] == 0) { // 矩形
          let tempAngle = 360 - angle; 
          let rcc = [x+obWid/2,y+obHei/2]; //中心
          let leftbot = [x,y];
          xy = [
            (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
            (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
          ];
        } else if (item[7] == 1) { //三角形
          let tempAngle = 360 - angle; 
          let rcc = [x+obWid/2,y+obHei/2];
          let left = [x,y];
          xy = [
            (left[0]-rcc[0])*Math.cos(tempAngle*deg)-(left[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
            (left[0]-rcc[0])*Math.sin(tempAngle*deg)+(left[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
          ];
        } else if (item[7] == 3) { //梯形
          let tempAngle = 360 - angle; 
          let rcc = [x+obWid/2,y+obHei/2];
          let leftbot = [x,y];
            xy = [
            (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
            (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
          ];
        } else {
          // 圓形沒有差
          xy = [Number(x+obWid/2),Number(y+obWid/2)];
        }
        ary.push(xy);
      } else { //沒有旋轉
        ary.push([Number(x),Number(y)]);
      }
    }
    return ary;
  }

}
