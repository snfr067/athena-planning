import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
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
import * as XLSX from 'xlsx';

declare var Plotly: any;

/**
 * 結果頁
 */
@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit
{

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
  coverageCalculateFunction = 'default';      //default: 雜訊; rsrp: rsrp閾值; sinr: sinr閾值
  sinrTh = 0;
  rsrpTh = 0;
  sinrThTitle = '';
  rsrpThTitle = '';
  showAntBsIdList = {};
  unAchievedObj = {
    isFieldSINRUnAchieved: false,
    isFieldRSRPUnAchieved: false,
    isFieldThroughputUnAchieved: false,
    isFieldCoverageUnAchieved: false,
    isUEThroughputByRsrpUnAchieved: false,
    isUECoverageUnAchieved: false
  };

  realFieldCoverage = 0;
  realFieldSINR = [];
  realFieldRSRP = [];
  realFieldULThroughput = [];
  realFieldDLThroughput = [];
  realUECoverage = 0;
  realUEULThroughput = [];
  realUEDLThroughput = [];

  //user log id
  userlogid = "";

  //computation time
  init_data_time = "";
  obst_calc_time = "";
  mcts_time = "";
  draw_heatmap_time = "";
  ue_perf_analysis_time = "";
  output_time = "";
  total_time = "";

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
  showAnt = true;
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
  /* 比例尺最大最小值 */
  scaleMax;
  scaleMin;
  scaleMaxSQ = 29.32;
  scaleMinSQ = -1.889;
  scaleMaxST;
  scaleMinST;
  scaleMaxUL;
  scaleMinUL;
  scaleMaxDL;
  scaleMinDL;
  scaleInputError = false;
  /** 天線列表 **/
  antennaList = [];
  AntennaIdToIndex = [];
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
  /** 後端運算時間顯示燈箱 */
  @ViewChild('comTimeModal') comTimeModal: TemplateRef<any>;

  ngOnInit()
  {
    sessionStorage.removeItem('form_blank_task');
    this.view3dDialogConfig.autoFocus = false;
    this.view3dDialogConfig.width = '80%';
    this.view3dDialogConfig.hasBackdrop = false;
    this.msgDialogConfig.autoFocus = false;
    this.route.queryParams.subscribe(params =>
    {
      this.taskId = params['taskId'];
      if (params['isHst'] === 'true')
      {
        this.isHst = true;
      }
      this.getResult();
    });
    if (sessionStorage.getItem('sub_field_coor') == null || sessionStorage.getItem('sub_field_coor') == '[]')
    {
      this.isSubFieldExist = false;
    } else
    {
      this.isSubFieldExist = true;
    }
    this.sinrTh = Number(sessionStorage.getItem('sinrThreshold'));
    this.rsrpTh = Number(sessionStorage.getItem('rsrpThreshold'));

    this.rsrpThTitle = this.translateService.instant('coverage.calculate.rsrp').replace('{0}', this.rsrpTh);
    this.sinrThTitle = this.translateService.instant('coverage.calculate.sinr').replace('{0}', this.sinrTh);

    // this.getResult();
  }

  /**
   * 取得結果
   */
  async getResult()
  {
    const antlist = await this.getAntennList();
    console.log(antlist);
    let url;
    this.authService.spinnerShowResult();
    if (this.isHst)
    {
      // 歷史紀錄
      url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
      url += `${this.authService.userToken}/${this.taskId}`;
    } else
    {
      url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
    }
    this.http.get(url).subscribe(
      res =>
      {
        // let defaultidx = [];
        if (this.isHst)
        {
          // 大小寫不同，各自塞回form
          this.result = this.formService.setHstOutputToResultOutput(res['output']);
          this.calculateForm = this.formService.setHstToForm(res);
          this.unAchievedObj = this.formService.setHstToUnAch(res);
          this.realFieldCoverage = this.formService.setHstToFieldCoverageRatio(res);
          this.realFieldSINR = this.formService.setHstToFieldSINRRatio(res);
          this.realFieldRSRP = this.formService.setHstToFieldRSRPRatio(res);
          this.realFieldULThroughput = this.formService.setHstToFieldULThroughputRatio(res);
          this.realFieldDLThroughput = this.formService.setHstToFieldDLThroughputRatio(res);
          this.realUECoverage = this.formService.setHstToUECoverageatio(res);
          this.realUEULThroughput = this.formService.setHstToUEULThroughputRatio(res);
          this.realUEDLThroughput = this.formService.setHstToUEDLThroughputRatio(res);
          this.userlogid = this.result['userlogid'];
          console.log(this.calculateForm);
          console.log(this.result);
          // defaultidx = this.result['defaultidx'];
          if (!this.calculateForm.isSimulation)
          {
            this.getCandidateList();
            // console.log(`Get Candidate`);
          }

        }
        else
        {
          this.calculateForm = res['input'];
          this.result = res['output'];
          this.unAchievedObj = this.formService.setHstToUnAch(res);
          this.realFieldCoverage = this.formService.setHstToFieldCoverageRatio(res);
          this.realFieldSINR = this.formService.setHstToFieldSINRRatio(res);
          this.realFieldRSRP = this.formService.setHstToFieldRSRPRatio(res);
          this.realFieldULThroughput = this.formService.setHstToFieldULThroughputRatio(res);
          this.realFieldDLThroughput = this.formService.setHstToFieldDLThroughputRatio(res);
          this.realUECoverage = this.formService.setHstToUECoverageatio(res);
          this.realUEULThroughput = this.formService.setHstToUEULThroughputRatio(res);
          this.realUEDLThroughput = this.formService.setHstToUEDLThroughputRatio(res);
          this.userlogid = this.result['userlogid'];
          console.log(this.calculateForm);
          console.log(this.result);
          // defaultidx = this.result['defaultIdx'];
          if (!this.calculateForm.isSimulation)
          {
            this.getCandidateList();
            // console.log(`Get Candidate`);
          }
        }
        //是否為模擬
        this.isSimulate = this.calculateForm.isSimulation;
        // this.calculateForm.defaultBs = this.calculateForm.bsList;

        let antArr = [];

        if (this.calculateForm.isSimulation)
          this.calculateForm = this.authService.changeOldFormToDASForm(this.calculateForm, this.antennaList);

        if (this.calculateForm.defaultBs !== '')
        {
          let candidateNum = 0;
          if (this.candidateList.length != 0) { candidateNum = this.calculateForm.candidateBs.split('|').length; }
          // console.log(candidateNum);
          this.showBsArea = true;
          console.log(this.calculateForm);
          let i = 0;
          const defaultBs = this.calculateForm.defaultBs.split('|');
          const defaultBsLen = defaultBs.length;
          var defaultAnt = [];
          if (!this.authService.isEmpty(this.calculateForm.defaultBsAnt))
          {
            defaultAnt = this.calculateForm.defaultBsAnt.split('|');
          } else
          {
            for (let i = 0; i < defaultBsLen; i++)
            {
              defaultAnt.push("[1,0,0,0]");
            }
          }
          let unsorttxpower = [];
          let unsortbeamid = [];
          let txpower = [];
          let beamid = [];
          if (this.isSimulate)
          {
            txpower = JSON.parse(this.calculateForm.txPower);
            beamid = JSON.parse(this.calculateForm.beamId);
          } else
          {
            if (this.isHst)
            {
              unsorttxpower = JSON.parse(this.calculateForm.txPower);
              unsortbeamid = JSON.parse(this.calculateForm.beamId);
            } else
            {
              // console.log(this.result);
              unsorttxpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
              unsortbeamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
            }
            for (let i = 0; i < this.result['defaultIdx'].length; i++)
            {
              for (let j = 0; j < this.result['defaultIdx'].length; j++)
              {
                if (i == this.result['defaultIdx'][j])
                {
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
          let ulMcsTable = ulmsc.substring(1, (ulmsc.length) - 1).split(',');
          ulMcsTable = ulMcsTable.slice(-(defaultBs.length))
          let dlMcsTable = dlmsc.substring(1, (dlmsc.length) - 1).split(',');
          dlMcsTable = dlMcsTable.slice(-(defaultBs.length))
          let wifiProtocol = (this.calculateForm.wifiProtocol != null) ? this.calculateForm.wifiProtocol.substring(1, (this.calculateForm.wifiProtocol.length) - 1).split(',') : [];
          let guardInterval = (this.calculateForm.guardInterval != null) ? this.calculateForm.guardInterval.substring(1, (this.calculateForm.guardInterval.length) - 1).split(',') : [];
          let wifiMimo = (this.calculateForm.wifiMimo != null) ? this.calculateForm.wifiMimo.substring(1, (this.calculateForm.wifiMimo.length) - 1).split(',') : [];
          const ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer);
          const dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer);
          // if (this.calculateForm.objectiveIndex == '1') {

          // }
          let dlScs = [];
          let ulScs = [];
          if (this.calculateForm.duplex === "fdd" && this.calculateForm.objectiveIndex == '1')
          {
            dlScs = JSON.parse(this.calculateForm.dlScs);
            ulScs = JSON.parse(this.calculateForm.ulScs);
          }
          let scs = [];
          if (this.calculateForm.duplex === "tdd")
          {
            scs = JSON.parse(this.calculateForm.scs);
          }
          const dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth);
          const ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth);

          const protocol = this.calculateForm.objectiveIndex;
          const duplex = this.calculateForm.duplex;
          for (const item of defaultBs)
          {
            const obj = JSON.parse(item);
            this.defaultBSList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
          if (protocol == '0')
          {
            if (duplex == 'tdd')
            {
              for (const item of defaultBs)
              {
                const obj = JSON.parse(item);
                this.defaultBSList4gTdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  beamid: beamid[i],
                  frequency: frequency[i + candidateNum],
                  bandwidth: bandwidth[i + candidateNum],
                  mimoNumber: mimoNumber[i + candidateNum]
                });
                i++;
              }
              // console.log(this.defaultBSList4gTdd);
            } else
            {
              for (const item of defaultBs)
              {
                const obj = JSON.parse(item);
                this.defaultBSList4gFdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  beamid: beamid[i],
                  dlFrequency: dlFrequency[i + candidateNum],
                  ulFrequency: ulFrequency[i + candidateNum],
                  ulBandwidth: ulBandwidth[i + candidateNum],
                  dlBandwidth: dlBandwidth[i + candidateNum],
                  mimoNumber: mimoNumber[i + candidateNum]
                });
                i++;
              }
            }

          } else if (protocol == '1')
          {
            if (duplex == 'tdd')
            {
              for (const item of defaultBs)
              {
                const obj = JSON.parse(item);
                const antObj = JSON.parse(defaultAnt[i]);
                let txPower = 0;
                let antennaId = this.AntennaIdToIndex[antObj[0]];
                let antennaName = "";
                let antennaType = "";
                let antennaManufactor = "";

                if (antennaId == null)
                {
                  antennaName = "";
                }
                else
                {
                  if (this.authService.lang == 'zh-TW')
                  {
                    antennaName = this.antennaList[antennaId]['chinese_name'];
                    if (antennaName == null || antennaName == '')
                    {
                      antennaName = this.antennaList[antennaId]['antennaName'];
                    }
                  } else
                  {
                    antennaName = this.antennaList[antennaId]['antennaName'];
                  }

                  antennaType = this.antennaList[antennaId]['antennaType'];
                  antennaManufactor = this.antennaList[antennaId]['manufactor'];
                

                  console.log(`${JSON.stringify(this.calculateForm.bsList)}`);
                  if (this.isSimulate &&
                    (this.calculateForm.bsList != null && this.calculateForm.bsList.length != 0) &&
                    (this.calculateForm.bsList.defaultBs != null && this.calculateForm.bsList.defaultBs.length != 0) )
                  //DAS
                  {
                    for (let a = 0; a < this.calculateForm.bsList.defaultBs[i].antenna.length; a++)
                    {
                      antArr.push(this.calculateForm.bsList.defaultBs[i].antenna[a]);
                    }

                    txPower = Number(this.calculateForm.bsList.defaultBs[i].txPower);
                  }
                  else if (this.isSimulate)
                  {
                    txPower = Number(JSON.parse(this.calculateForm.txPower)[i]);
                    antArr.push(this.antennaList[0]);
                  }
                  else
                  {
                    console.log(`${JSON.stringify(this.calculateForm.txPower)}`);
                    txPower = Number(this.result['defaultBsPower'][i]);
                  }
                }






                this.defaultBSList5gTdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txPower,
                  beamid: beamid[i],
                  frequency: frequency[i + candidateNum],
                  bandwidth: bandwidth[i + candidateNum],
                  scs: scs[i + candidateNum],
                  ulMcsTable: ulMcsTable[i],
                  dlMcsTable: dlMcsTable[i],
                  ulMimoLayer: ulMimoLayer[i + candidateNum],
                  dlMimoLayer: dlMimoLayer[i + candidateNum],
                  antennaName: antennaName,
                  antennaType: antennaType,
                  antennaManufactor: antennaManufactor,
                  antArray: antArr
                });
                antArr = [];
                i++;
              }
            } else
            {
              // console.log(txpower);
              for (const item of defaultBs)
              {
                const antObj = JSON.parse(defaultAnt[i]);
                let antennaId = this.AntennaIdToIndex[antObj[0]];
                let antennaName = "";
                let antennaType = "";
                let antennaManufactor = "";


                if (antennaId == null)
                {
                  antennaName = "";
                }
                else
                {

                  if (this.authService.lang == 'zh-TW')
                  {
                    antennaName = this.antennaList[antennaId]['chinese_name'];
                    if (antennaName == null || antennaName == '')
                    {
                      antennaName = this.antennaList[antennaId]['antennaName'];
                    }
                  } else
                  {
                    antennaName = this.antennaList[antennaId]['antennaName'];
                  }

                  if (this.isSimulate)
                  {

                    console.log(JSON.stringify(this.antennaList));
                    console.log(JSON.stringify(antObj[0]));
                    console.log(JSON.stringify(this.AntennaIdToIndex));
                    antennaType = this.antennaList[antennaId]['antennaType'];
                    antennaManufactor = this.antennaList[antennaId]['manufactor'];


                    for (let a = 0; a < this.calculateForm.bsList.defaultBs[i].antenna.length; a++)
                    {
                      antArr.push(this.calculateForm.bsList.defaultBs[i].antenna[a]);
                    }
                    
                    console.log(`this.antennaList = ${JSON.stringify(this.antennaList)}`);
                    console.log(`antArr = ${JSON.stringify(antArr)}`);
                    console.log(`antennaType = ${JSON.stringify(antennaType)}`);
                  }
                }

                const obj = JSON.parse(item);
                this.defaultBSList5gFdd.push({
                  x: obj[0],
                  y: obj[1],
                  z: obj[2],
                  txpower: txpower[i],
                  beamid: beamid[i],
                  scs: scs[i + candidateNum],
                  dlScs: dlScs[i + candidateNum],
                  ulScs: ulScs[i + candidateNum],
                  ulMcsTable: ulMcsTable[i],
                  dlMcsTable: dlMcsTable[i],
                  ulMimoLayer: ulMimoLayer[i + candidateNum],
                  dlMimoLayer: dlMimoLayer[i + candidateNum],
                  dlFrequency: dlFrequency[i + candidateNum],
                  ulFrequency: ulFrequency[i + candidateNum],
                  ulBandwidth: ulBandwidth[i + candidateNum],
                  dlBandwidth: dlBandwidth[i + candidateNum],
                  antennaName: antennaName,
                  antennaType: antennaType,
                  antennaManufactor: antennaManufactor,
                  antArray: antArr
                });

                antArr = [];
                i++;
              }
            }
            //WiFi below
          } else
          {
            for (const item of defaultBs)
            {
              const obj = JSON.parse(item);
              this.defaultBSListWifi.push({
                x: obj[0],
                y: obj[1],
                z: obj[2],
                txpower: txpower[i],
                beamid: beamid[i],
                frequency: frequency[i + candidateNum],
                bandwidth: bandwidth[i + candidateNum],
                wifiProtocol: wifiProtocol[i + candidateNum],
                guardInterval: guardInterval[i + candidateNum],
                wifiMimo: wifiMimo[i + candidateNum]
              });
              i++;
            }
            //defaultBSListWifi
          }

        }

        let candidateBs = [];
        if (this.calculateForm.candidateBs !== '')
        {
          this.showCandidateArea = true;
          candidateBs = this.calculateForm.candidateBs.split('|');
          for (const item of candidateBs)
          {
            const obj = JSON.parse(item);
            this.candidateList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2]
            });
          }
        }

        if (this.calculateForm.obstacleInfo !== '')
        {
          this.showObstacleArea = true;
          const obstacleInfo = this.calculateForm.obstacleInfo.split('|');

          for (const item of obstacleInfo)
          {
            const obj = JSON.parse(item);
            // console.log('-- result obj',obj);
            this.obstacleList.push({
              x: obj[0],
              y: obj[1],
              z: obj[2],
              width: obj[3],
              height: obj[4],
              altitude: obj[5],
              color: (typeof obj[8] !== 'undefined' ? obj[8] : '#73805c'),
              rotate: obj[6],
              material: obj[7],
              element: obj[8],
            });
          }
        }

        if (this.calculateForm.ueCoordinate !== '')
        {
          this.showUEArea = true;
          const ueCoordinate = this.calculateForm.ueCoordinate.split('|');
          for (const item of ueCoordinate)
          {
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
        if (this.isSubFieldExist)
        {
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
        this.siteInfo.unAchievedObj = this.unAchievedObj;
        this.siteInfo.realFieldCoverage = this.formService.setHstToFieldCoverageRatio(res);
        this.siteInfo.realFieldSINR = this.formService.setHstToFieldSINRRatio(res);
        this.siteInfo.realFieldRSRP = this.formService.setHstToFieldRSRPRatio(res);
        this.siteInfo.realFieldULThroughput = this.formService.setHstToFieldULThroughputRatio(res);
        this.siteInfo.realFieldDLThroughput = this.formService.setHstToFieldDLThroughputRatio(res);
        this.siteInfo.realUECoverage = this.formService.setHstToUECoverageatio(res);
        this.siteInfo.realUEULThroughput = this.formService.setHstToUEULThroughputRatio(res);
        this.siteInfo.realUEDLThroughput = this.formService.setHstToUEDLThroughputRatio(res);
        this.getPathLossModel();

        this.siteInfo.realFieldCoverage = (Number(this.siteInfo.realFieldCoverage).toFixed(4));
        var i = 0;
        for (i = 0; i < this.siteInfo.realFieldSINR.length; i++)
        {
          this.siteInfo.realFieldSINR[i] = (Number(this.siteInfo.realFieldSINR[i]).toFixed(4));
        }
        for (i = 0; i < this.siteInfo.realFieldRSRP.length; i++)
        {
          this.siteInfo.realFieldRSRP[i] = (Number(this.siteInfo.realFieldRSRP[i]).toFixed(4));
        }
        for (i = 0; i < this.siteInfo.realFieldULThroughput.length; i++)
        {
          this.siteInfo.realFieldULThroughput[i] = (Number(this.siteInfo.realFieldULThroughput[i]).toFixed(4));
        }
        for (i = 0; i < this.siteInfo.realFieldDLThroughput.length; i++)
        {
          this.siteInfo.realFieldDLThroughput[i] = (Number(this.siteInfo.realFieldDLThroughput[i]).toFixed(4));
        }
        this.siteInfo.realUECoverage = (Number(this.siteInfo.realUECoverage).toFixed(4));
        for (i = 0; i < this.siteInfo.realUEULThroughput.length; i++)
        {
          this.siteInfo.realUEULThroughput[i] = (Number(this.siteInfo.realUEULThroughput[i]).toFixed(4));
        }
        for (i = 0; i < this.siteInfo.realUEULThroughput.length; i++)
        {
          this.siteInfo.realUEULThroughput[i] = (Number(this.siteInfo.realUEULThroughput[i]).toFixed(4));
        }

        console.log(this.siteInfo.calculateForm);
        console.log(this.siteInfo.unAchievedObj);
        console.log(this.siteInfo.realRatio);
        this.siteInfo.result = this.result;
        window.setTimeout(() =>
        {
          this.siteInfo.inputBsListCount = candidateBs.length;
          if (this.calculateForm['defaultBs'] !== '')
          {
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
        this.result['sinrMap'].map(v =>
        {
          v.map(m =>
          {
            m.map(d =>
            {
              sinrAry.push(d);
            });
          });
        });

        const rsrpAry = [];
        this.result['rsrpMap'].map(v =>
        {
          v.map(m =>
          {
            m.map(d =>
            {
              rsrpAry.push(d);
            });
          });
        });

        const ulThroughputAry = [];
        try
        {
          this.result['ulThroughputMap'].map(v =>
          {
            v.map(m =>
            {
              m.map(d =>
              {
                ulThroughputAry.push(d);
              });
            });
          });
        } catch (e)
        {
          console.log('No ulThorughput data, it may be an old record');
        }

        const dlThroughputAry = [];
        try
        {
          this.result['throughputMap'].map(v =>
          {
            v.map(m =>
            {
              m.map(d =>
              {
                dlThroughputAry.push(d);
              });
            });
          });
        } catch (e)
        {
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
        // this.scaleMaxSQ = Number.parseFloat(this.hstOutput['sinrMax']).toFixed(2);
        // this.scaleMinSQ = Number.parseFloat(this.hstOutput['sinrMin']).toFixed(2);
        // this.scaleMaxST = Number.parseFloat(this.hstOutput['rsrpMax']).toFixed(2);
        // this.scaleMinST = Number.parseFloat(this.hstOutput['rsrpMin']).toFixed(2);
        this.scaleMaxST = -70;
        this.scaleMinST = -120;
        this.scaleMaxUL = Number.parseFloat(this.hstOutput['ulThroughputMax']).toFixed(1);
        this.scaleMinUL = Number.parseFloat(this.hstOutput['ulThroughputMin']).toFixed(1);
        this.scaleMaxDL = Number.parseFloat(this.hstOutput['dlThroughputMax']).toFixed(1);
        this.scaleMinDL = Number.parseFloat(this.hstOutput['dlThroughputMin']).toFixed(1);

        this.changeZvalue();
      }
    );
    // this.getCandidateList();
  }

  // financial(x) {
  //   return Number.parseFloat(x).toFixed(1);
  // }

  getCandidateList()
  {
    let index = 1;
    const numMap = {};
    const xyMap = {};
    const x = [];
    const y = [];
    const text = [];
    let candidateBs = [];
    let candidateAnt = [];
    // const color = [];

    if (!this.authService.isEmpty(this.calculateForm.candidateBs))
    {
      candidateBs = this.calculateForm.candidateBs.split('|');
      const candidateLen = candidateBs.length;
      if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt))
      {
        candidateAnt = this.calculateForm.candidateBsAnt.split('|');
      } else
      {
        for (let i = 0; i < candidateLen; i++)
        {
          candidateAnt.push("[1,0,0,0]");
        }
      }
      for (let i = 0; i < candidateBs.length; i++)
      {
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
    for (let i = 0; i < this.result['chosenCandidate'].length; i++)
    {
      if (typeof numMap[this.result['chosenCandidate'][i].toString()] !== 'undefined')
      {
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
    let ulMcsTable = (ulmsc != null) ? ulmsc.substring(1, (ulmsc.length) - 1).split(',') : [];
    let dlMcsTable = (dlmsc != null) ? dlmsc.substring(1, (dlmsc.length) - 1).split(',') : [];
    let wifiProtocol = (this.calculateForm.wifiProtocol != null) ? this.calculateForm.wifiProtocol.substring(1, (this.calculateForm.wifiProtocol.length) - 1).split(',') : [];
    let guardInterval = (this.calculateForm.guardInterval != null) ? this.calculateForm.guardInterval.substring(1, (this.calculateForm.guardInterval.length) - 1).split(',') : [];
    let wifiMimo = (this.calculateForm.wifiMimo != null) ? this.calculateForm.wifiMimo.substring(1, (this.calculateForm.wifiMimo.length) - 1).split(',') : [];
    const ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer);
    const dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer);
    let dlScs = [];
    let ulScs = [];
    let i = 0;
    if (this.calculateForm.duplex === "fdd" && this.calculateForm.objectiveIndex == '1')
    {
      dlScs = JSON.parse(this.calculateForm.dlScs);
      ulScs = JSON.parse(this.calculateForm.ulScs);
    }
    let scs = [];
    if (this.calculateForm.duplex === "tdd")
    {
      scs = JSON.parse(this.calculateForm.scs);
    }
    const dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth);
    const ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth);
    const protocol = this.calculateForm.objectiveIndex;
    const duplex = this.calculateForm.duplex;
    if (protocol == '0')
    {
      if (duplex == 'tdd')
      {
        for (const item of chosenNum)
        {
          this.candidateTable4gTdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            beamid: beamid[i],
            frequency: frequency[item - 1],
            bandwidth: bandwidth[item - 1],
            mimoNumber: mimoNumber[item - 1]
          });
          i++;
        }
        console.log(chosenNum);
        console.log(txpower);
        console.log(frequency);
        console.log(bandwidth);
      } else
      {
        for (const item of chosenNum)
        {
          this.candidateTable4gFdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            beamid: beamid[i],
            dlFrequency: dlFrequency[item - 1],
            ulFrequency: ulFrequency[item - 1],
            ulBandwidth: ulBandwidth[item - 1],
            dlBandwidth: dlBandwidth[item - 1],
            mimoNumber: mimoNumber[item - 1]
          });
          i++;
        }
      }
    } else if (protocol == '1')
    {
      if (duplex == 'tdd')
      {
        for (const item of chosenNum)
        {
          const antObj = JSON.parse(candidateAnt[i]);
          let antennaId = this.AntennaIdToIndex[antObj[0]];
          let antennaName = "";
          if (this.authService.lang == 'zh-TW')
          {
            antennaName = this.antennaList[antennaId]['chinese_name'];
            if (antennaName == null || antennaName == '')
            {
              antennaName = this.antennaList[antennaId]['antennaName'];
            }
          } else
          {
            antennaName = this.antennaList[antennaId]['antennaName'];
          }
          console.log(JSON.stringify(this.antennaList));
          this.candidateTable5gTdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            beamid: beamid[i],
            frequency: frequency[item - 1],
            bandwidth: bandwidth[item - 1],
            scs: scs[item - 1],
            ulMcsTable: ulMcsTable[item - 1],
            dlMcsTable: dlMcsTable[item - 1],
            ulMimoLayer: ulMimoLayer[item - 1],
            dlMimoLayer: dlMimoLayer[item - 1],
            antennaName: antennaName
          });
          i++;
        }
      } else
      {
        for (const item of chosenNum)
        {
          const antObj = JSON.parse(candidateAnt[i]);
          let antennaId = this.AntennaIdToIndex[antObj[0]];
          let antennaName = "";
          if (this.authService.lang == 'zh-TW')
          {
            antennaName = this.antennaList[antennaId]['chinese_name'];
            if (antennaName == null || antennaName == '')
            {
              antennaName = this.antennaList[antennaId]['antennaName'];
            }
          } else
          {
            antennaName = this.antennaList[antennaId]['antennaName'];
          }
          console.log(JSON.stringify(this.antennaList));
          console.log(JSON.stringify(this.antennaList));
          this.candidateTable5gFdd.push({
            num: item,
            x: xyMap[this.result['chosenCandidate'][i].toString()].x,
            y: xyMap[this.result['chosenCandidate'][i].toString()].y,
            txpower: txpower[i],
            beamid: beamid[i],
            dlFrequency: dlFrequency[item - 1],
            ulFrequency: ulFrequency[item - 1],
            ulBandwidth: ulBandwidth[item - 1],
            dlBandwidth: dlBandwidth[item - 1],
            mimoNumber: mimoNumber[item - 1],
            scs: scs[item - 1],
            dlScs: dlScs[item - 1],
            ulScs: ulScs[item - 1],
            ulMcsTable: ulMcsTable[item - 1],
            dlMcsTable: dlMcsTable[item - 1],
            ulMimoLayer: ulMimoLayer[item - 1],
            dlMimoLayer: dlMimoLayer[item - 1],
            antennaName: antennaName
          });
          i++;
        }
      }
    } else
    {
      for (const item of chosenNum)
      {
        this.candidateTableWifi.push({
          num: item,
          x: xyMap[this.result['chosenCandidate'][i].toString()].x,
          y: xyMap[this.result['chosenCandidate'][i].toString()].y,
          txpower: txpower[i],
          beamid: beamid[i],
          frequency: frequency[item - 1],
          bandwidth: bandwidth[item - 1],
          wifiProtocol: wifiProtocol[item - 1],
          guardInterval: guardInterval[item - 1],
          wifiMimo: wifiMimo[item - 1]
        });
        i++
      }
    }
  }

  /** export PDF */
  async exportPDF()
  {
    this.pdf.export(this.taskId, this.isHst, this.scaleMinSQ,
      this.scaleMaxSQ, this.scaleMinST, this.scaleMaxST,
      this.scaleMinUL, this.scaleMaxUL, this.scaleMinDL,
      this.scaleMaxDL);
  }

  /** 訊號品質圖 */
  drawQuality(getColorScale)
  {
    if (this.scaleInputError)
    {
      return;
    }
    if (!getColorScale)
    {
      this.showCover = false;
      this.showStrength = false;
      this.showDlThroughputMap = false;
      this.showUlThroughputMap = false;
      this.showQuality = true;
    }
    window.setTimeout(() =>
    {
      this.quality.showUE = this.showUE;
      this.quality.calculateForm = this.calculateForm;
      this.quality.result = this.result;
      this.quality.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.quality.showCandidate = this.showCandidate;
      this.quality.opacityValue = this.opacityValue;
      this.quality.showAnt = this.showAnt;
      if (!getColorScale)
      {
        this.scaleMax = this.scaleMaxSQ;
        this.scaleMin = this.scaleMinSQ;
      } else
      {
        this.scaleMaxSQ = this.scaleMax;
        this.scaleMinSQ = this.scaleMin;
      }
      this.quality.draw(false, this.zValue, this.scaleMinSQ, this.scaleMaxSQ);
    }, 0);
  }

  /** 訊號覆蓋圖 */
  drawCover()
  {
    this.showQuality = false;
    this.showCover = true;
    this.showStrength = false;
    this.showDlThroughputMap = false;
    this.showUlThroughputMap = false;
    window.setTimeout(() =>
    {
      this.cover.showUE = this.showUE;
      this.cover.calculateForm = this.calculateForm;
      this.cover.result = this.result;
      this.cover.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.cover.showCandidate = this.showCandidate;
      this.cover.showAnt = this.showAnt;
      this.cover.opacityValue = this.opacityValue;
      this.cover.coverageCalculateFunction = this.coverageCalculateFunction;
      this.cover.sinrTh = this.sinrTh;
      this.cover.rsrpTh = this.rsrpTh;
      this.cover.draw(false, this.zValue);
    }, 0);
  }

  /** 訊號強度圖 */
  drawStrength(getColorScale)
  {
    if (this.scaleInputError)
    {
      return;
    }
    if (!getColorScale)
    {
      this.showQuality = false;
      this.showCover = false;
      this.showStrength = true;
      this.showDlThroughputMap = false;
      this.showUlThroughputMap = false;
    }
    window.setTimeout(() =>
    {
      this.strength.showUE = this.showUE;
      this.strength.calculateForm = this.calculateForm;
      this.strength.result = this.result;
      this.strength.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.strength.showAnt = this.showAnt;
      this.strength.showCandidate = this.showCandidate;
      this.strength.opacityValue = this.opacityValue;
      if (!getColorScale)
      {
        this.scaleMax = this.scaleMaxST;
        this.scaleMin = this.scaleMinST;
      } else
      {
        this.scaleMaxST = this.scaleMax;
        this.scaleMinST = this.scaleMin;
      }
      this.strength.draw(false, this.zValue, this.scaleMinST, this.scaleMaxST);
    }, 0);
  }

  /** 上行傳輸速率圖 */
  drawUlThroughputMap(getColorScale)
  {
    if (this.scaleInputError)
    {
      return;
    }
    if (!getColorScale)
    {
      this.showQuality = false;
      this.showCover = false;
      this.showStrength = false;
      this.showDlThroughputMap = false;
      this.showUlThroughputMap = true;
    }
    window.setTimeout(() =>
    {
      this.ulThroughputMap.showUE = this.showUE;
      this.ulThroughputMap.calculateForm = this.calculateForm;
      this.ulThroughputMap.result = this.result;
      this.ulThroughputMap.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.ulThroughputMap.showAnt = this.showAnt;
      this.ulThroughputMap.showCandidate = this.showCandidate;
      this.ulThroughputMap.opacityValue = this.opacityValue;
      if (!getColorScale)
      {
        this.scaleMax = this.scaleMaxUL;
        this.scaleMin = this.scaleMinUL;
      } else
      {
        this.scaleMaxUL = this.scaleMax;
        this.scaleMinUL = this.scaleMin;
      }
      this.ulThroughputMap.draw(false, this.zValue, this.scaleMinUL, this.scaleMaxUL);

    }, 0);

  }

  /** 下行傳輸速率圖 */
  drawDlThroughputMap(getColorScale)
  {
    if (this.scaleInputError)
    {
      return;
    }
    if (!getColorScale)
    {
      this.showQuality = false;
      this.showCover = false;
      this.showStrength = false;
      this.showDlThroughputMap = true;
      this.showUlThroughputMap = false;
    }
    window.setTimeout(() =>
    {
      this.dlThroughputMap.showUE = this.showUE;
      this.dlThroughputMap.calculateForm = this.calculateForm;
      this.dlThroughputMap.result = this.result;
      this.dlThroughputMap.showObstacle = this.showObstacle ? 'visible' : 'hidden';
      this.dlThroughputMap.showAnt = this.showAnt;
      this.dlThroughputMap.showCandidate = this.showCandidate;
      this.dlThroughputMap.opacityValue = this.opacityValue;
      if (!getColorScale)
      {
        this.scaleMax = this.scaleMaxDL;
        this.scaleMin = this.scaleMinDL;
      } else
      {
        this.scaleMaxDL = this.scaleMax;
        this.scaleMinDL = this.scaleMin;
      }
      this.dlThroughputMap.draw(false, this.zValue, this.scaleMinDL, this.scaleMaxDL);
    }, 0);
  }

  /** change 高度 */
  changeZvalue()
  {
    console.log(this.zValue);
    if (this.chartType === 'SINR')
    {
      this.drawQuality(false);
    } else if (this.chartType === 'PCI')
    {
      this.drawCover();
    } else if (this.chartType === 'RSRP')
    {
      this.drawStrength(false);
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.drawUlThroughputMap(false);
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.drawDlThroughputMap(false);
    }
  }

  /** 回上頁 */
  back()
  {
    // this.authService.clearStorage();
    if (this.isHst)
    {
      this.router.navigate(['/site/site-planning'], { queryParams: { taskId: this.taskId, isHst: true } });
    } else
    {
      this.save(true);
    }
  }

  /**
   * 儲存
   * @param isBack 儲存後是否回上一頁 
   */
  save(isBack)
  {
    const form = {
      id: this.authService.userId,
      taskid: this.taskId,
      sessionid: this.authService.userToken
    };
    const url = `${this.authService.API_URL}/storeResult`;
    this.http.post(url, JSON.stringify(form)).subscribe(
      res =>
      {
        if (isBack)
        {
          // 回上一頁
          this.router.navigate(['/site/site-planning'], { queryParams: { taskId: this.taskId, isHst: true } });
        } else
        {
          this.msgDialogConfig.data = {
            type: 'success',
            infoMessage: this.translateService.instant('save.success')
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        }
      },
      err =>
      {
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
  view3D()
  {
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
  switchShowUE()
  {
    if (this.chartType === 'SINR')
    {
      this.quality.switchUE(this.showUE);
    } else if (this.chartType === 'PCI')
    {
      this.cover.switchUE(this.showUE);
    } else if (this.chartType === 'RSRP')
    {
      this.strength.switchUE(this.showUE);
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.ulThroughputMap.switchUE(this.showUE);
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.dlThroughputMap.switchUE(this.showUE);
    }
  }

  /** ON/OFF 顯示障礙物 */
  switchShowObstacle()
  {
    const visible = this.showObstacle ? 'visible' : 'hidden';
    if (this.chartType === 'SINR')
    {
      this.quality.switchShowObstacle(visible);
    } else if (this.chartType === 'PCI')
    {
      this.cover.switchShowObstacle(visible);
    } else if (this.chartType === 'RSRP')
    {
      this.strength.switchShowObstacle(visible);
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.ulThroughputMap.switchShowObstacle(visible);
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.dlThroughputMap.switchShowObstacle(visible);
    }

  }

  /** ON/OFF 顯示BS */
  switchShowBs()
  {
    const visible = this.showBs ? 'visible' : 'hidden';
    if (this.chartType === 'SINR')
    {
      this.quality.switchShowBs(visible);
    } else if (this.chartType === 'PCI')
    {
      this.cover.switchShowBs(visible);
    } else if (this.chartType === 'RSRP')
    {
      this.strength.switchShowBs(visible);
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.ulThroughputMap.switchShowBs(visible);
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.dlThroughputMap.switchShowBs(visible);
    }
  }

  /** ON/OFF 顯示Ant */
  switchShowAnt()
  {
    const visible = this.showAnt ? 'visible' : 'hidden';
    if (this.chartType === 'SINR')
    {
      this.quality.switchShowAnt(visible);
    } else if (this.chartType === 'PCI')
    {
      this.cover.switchShowAnt(visible);
    } else if (this.chartType === 'RSRP')
    {
      this.strength.switchShowAnt(visible);
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.ulThroughputMap.switchShowAnt(visible);
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.dlThroughputMap.switchShowAnt(visible);
    }
  }

  /** ON/OFF 顯示Candidate */
  switchShowCandidate()
  {
    const visible = this.showCandidate;
    if (this.chartType === 'SINR')
    {
      this.quality.switchShowCandidate(visible);
    } else if (this.chartType === 'PCI')
    {
      this.cover.switchShowCandidate(visible);
    } else if (this.chartType === 'RSRP')
    {
      this.strength.switchShowCandidate(visible);
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.ulThroughputMap.switchShowCandidate(visible);
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.dlThroughputMap.switchShowCandidate(visible);
    }
  }

  /** heatmap透明度 */
  changeOpacity()
  {
    if (this.chartType === 'SINR')
    {
      this.quality.opacityValue = this.opacityValue;
      this.quality.changeOpacity();
    } else if (this.chartType === 'PCI')
    {
      this.cover.opacityValue = this.opacityValue;
      this.cover.changeOpacity();
    } else if (this.chartType === 'RSRP')
    {
      this.strength.opacityValue = this.opacityValue;
      this.strength.changeOpacity();
    } else if (this.chartType === 'UL_THROUGHPUT')
    {
      this.ulThroughputMap.opacityValue = this.opacityValue;
      this.ulThroughputMap.changeOpacity();
    } else if (this.chartType === 'DL_THROUGHPUT')
    {
      this.dlThroughputMap.opacityValue = this.opacityValue;
      this.dlThroughputMap.changeOpacity();
    }
  }

  set3dPosition()
  {
    const ary = [];
    let obstacleList = this.calculateForm.obstacleInfo.split('|');
    if (obstacleList[0] == '')
    {
      obstacleList = [];
    }
    for (const el of obstacleList)
    {
      let item = JSON.parse(el);
      let angle = Number(item[6] % 360);
      let obWid = Number(item[3]);
      let obHei = Number(item[4]);
      let deg = 2 * Math.PI / 360;
      let x = Number(item[0]);
      let y = Number(item[1]);
      let z = Number(item[2]);
      let xy = [];
      if (angle != 0)
      { //有旋轉
        if (item[8] == 0)
        { // 矩形
          let tempAngle = 360 - angle;
          let rcc = [x + obWid / 2, y + obHei / 2]; //中心
          let leftbot = [x, y];
          xy = [
            (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
            (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
          ];
        } else if (item[8] == 1)
        { //三角形
          let tempAngle = 360 - angle;
          let rcc = [x + obWid / 2, y + obHei / 2];
          let left = [x, y];
          xy = [
            (left[0] - rcc[0]) * Math.cos(tempAngle * deg) - (left[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
            (left[0] - rcc[0]) * Math.sin(tempAngle * deg) + (left[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
          ];
        } else if (item[8] == 3)
        { //梯形
          let tempAngle = 360 - angle;
          let rcc = [x + obWid / 2, y + obHei / 2];
          let leftbot = [x, y];
          xy = [
            (leftbot[0] - rcc[0]) * Math.cos(tempAngle * deg) - (leftbot[1] - rcc[1]) * Math.sin(tempAngle * deg) + rcc[0],
            (leftbot[0] - rcc[0]) * Math.sin(tempAngle * deg) + (leftbot[1] - rcc[1]) * Math.cos(tempAngle * deg) + rcc[1]
          ];
        } else
        {
          // 圓形沒有差
          xy = [Number(x + obWid / 2), Number(y + obWid / 2)];
        }
        ary.push(xy);
      } else
      { //沒有旋轉
        ary.push([Number(x), Number(y)]);
      }
    }
    return ary;
  }

  checkMaxMinValue(checkNegative)
  {
    if (this.scaleMax < this.scaleMin || this.scaleMax == this.scaleMin)
    {
      this.scaleInputError = true;
    } else
    {
      this.scaleInputError = false;
    }
    if (checkNegative)
    {
      if (this.scaleMin < 0)
      {
        this.scaleInputError = true;
      }
    }
  }
  async getAntennList()
  {
    let url_Ant = `${this.authService.API_URL}/getAntenna/${this.authService.userToken}`;
    // let url_model = `http://192.168.1.109:4444/antenna`;
    this.http.get(url_Ant).subscribe(
      res =>
      {
        let result = res;
        this.antennaList = Object.values(result);
        for (let i = 0; i < this.antennaList.length; i++)
        {
          let id = this.antennaList[i]['antennaID'];
          this.AntennaIdToIndex[id] = i;
        }
        console.log(result);
        return result;
      }, err =>
      {
        console.log(err);
      }
    );
  }

  exportRawData()
  {
    //console.log('resolution = '+this.calculateForm['resolution']);  
    // all
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    var z = 0, x = 0, y = 0;
    var sheetName = '';
    var resolution = Number(this.calculateForm['resolution']);

    if (isNaN(resolution))
      resolution = 1;

    for (z = 0; z < this.zValues.length; z++)
    {
      //sinr
      sheetName = "(SINR Map " + this.zValues[z] + this.translateService.instant('meter') + ")";
      var sinrData = [];
      var pushArr = [" "];
      var value = 0;

      for (x = 0; x < this.result['sinrMap'].length; x++)
      {
        value = (resolution / 2) + x * resolution;
        pushArr.push(String(value));
      }
      sinrData.push(pushArr);
      pushArr = [];

      for (y = this.result['sinrMap'][0].length - 1; y >= 0; y--)
      {
        value = (resolution / 2) + y * resolution;
        pushArr.push(String(value));
        for (x = 0; x < this.result['sinrMap'].length; x++)
        {
          value = this.result['sinrMap'][x][y][z];
          pushArr.push(String(value));
        }
        sinrData.push(pushArr);
        pushArr = [];
      }
      const sinrWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(sinrData);
      XLSX.utils.book_append_sheet(wb, sinrWS, sheetName);

      //rsrp
      sheetName = "(RSRP Map " + this.zValues[z] + this.translateService.instant('meter') + ")";
      var rsrpData = [];
      pushArr = [" "];
      value = 0;

      for (x = 0; x < this.result['rsrpMap'].length; x++)
      {
        value = (resolution / 2) + x * resolution;
        pushArr.push(String(value));
      }
      rsrpData.push(pushArr);
      pushArr = [];

      for (y = this.result['rsrpMap'][0].length - 1; y >= 0; y--)
      {
        value = (resolution / 2) + y * resolution;
        pushArr.push(String(value));
        for (x = 0; x < this.result['rsrpMap'].length; x++)
        {
          value = this.result['rsrpMap'][x][y][z];
          pushArr.push(String(value));
        }
        rsrpData.push(pushArr);
        pushArr = [];
      }
      const rsrpWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rsrpData);
      XLSX.utils.book_append_sheet(wb, rsrpWS, sheetName);

      //coverage
      sheetName = "(Coverage Map " + this.zValues[z] + this.translateService.instant('meter') + ")";
      var coverageData = [];
      pushArr = [" "];
      value = 0;

      for (x = 0; x < this.result['connectionMap'].length; x++)
      {
        value = (resolution / 2) + x * resolution;
        pushArr.push(String(value));
      }
      coverageData.push(pushArr);
      pushArr = [];

      for (y = this.result['connectionMap'][0].length - 1; y >= 0; y--)
      {
        value = (resolution / 2) + y * resolution;
        pushArr.push(String(value));
        for (x = 0; x < this.result['connectionMap'].length; x++)
        {
          value = this.result['connectionMap'][x][y][z];
          pushArr.push(String(value));
        }
        coverageData.push(pushArr);
        pushArr = [];
      }
      const coverageWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(coverageData);
      XLSX.utils.book_append_sheet(wb, coverageWS, sheetName);

      //ul throughput
      sheetName = "(UL Throughput Map " + this.zValues[z] + this.translateService.instant('meter') + ")"; //Uplink在英文版中加上meter會超過31chars，因此修短
      var ulThroughputData = [];
      pushArr = [" "];
      value = 0;

      for (x = 0; x < this.result['ulThroughputMap'].length; x++)
      {
        value = (resolution / 2) + x * resolution;
        pushArr.push(String(value));
      }
      ulThroughputData.push(pushArr);
      pushArr = [];

      for (y = this.result['ulThroughputMap'][0].length - 1; y >= 0; y--)
      {
        value = (resolution / 2) + y * resolution;
        pushArr.push(String(value));
        for (x = 0; x < this.result['ulThroughputMap'].length; x++)
        {
          value = this.result['ulThroughputMap'][x][y][z];
          pushArr.push(String(value));
        }
        ulThroughputData.push(pushArr);
        pushArr = [];
      }
      const ulThroughputWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ulThroughputData);
      XLSX.utils.book_append_sheet(wb, ulThroughputWS, sheetName);

      //dl throughput 
      sheetName = "(DL Throughput Map " + this.zValues[z] + this.translateService.instant('meter') + ")";//Downloadlink在英文版中加上meter會超過31chars，因此修短
      var dlThroughputData = [];
      pushArr = [" "];
      value = 0;

      for (x = 0; x < this.result['throughputMap'].length; x++)
      {
        value = (resolution / 2) + x * resolution;
        pushArr.push(String(value));
      }
      dlThroughputData.push(pushArr);
      pushArr = [];

      for (y = this.result['throughputMap'][0].length - 1; y >= 0; y--)
      {
        value = (resolution / 2) + y * resolution;
        pushArr.push(String(value));
        for (x = 0; x < this.result['throughputMap'].length; x++)
        {
          value = this.result['throughputMap'][x][y][z];
          pushArr.push(String(value));
        }
        dlThroughputData.push(pushArr);
        pushArr = [];
      }
      const dlThroughputWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dlThroughputData);
      XLSX.utils.book_append_sheet(wb, dlThroughputWS, sheetName);
    }

    //save
    XLSX.writeFile(wb, `${this.calculateForm.taskName}-Rawdata.xlsx`);

  }



  caltime()
  {
    console.log(`userlogId = ${this.userlogid}`);
    console.log(`userToken = ${this.authService.userToken}`);

    var url = `${this.authService.API_URL}/getComputationTime/${this.authService.userToken}/${this.userlogid}`;
    console.log(`url = ${url}`);

    this.http.get(url).subscribe(
      res =>
      {

        try
        {
          this.init_data_time = res[0]['init_data_time'];
          this.obst_calc_time = res[0]['obst_calc_time'];
          this.mcts_time = res[0]['mcts_time'];
          this.draw_heatmap_time = res[0]['draw_heatmap_time'];
          this.ue_perf_analysis_time = res[0]['ue_perf_analysis_time'];
          this.output_time = res[0]['output_time'];
          this.total_time = res[0]['total_time'];
          console.log(`total_time = ${this.total_time}`);
        }
        catch (error)
        {
          var errorlog = "未能取得資料";
          this.init_data_time = errorlog;
          this.obst_calc_time = errorlog;
          this.mcts_time = errorlog;
          this.draw_heatmap_time = errorlog;
          this.ue_perf_analysis_time = errorlog;
          this.output_time = errorlog;
          this.total_time = errorlog;
        }

      }
    );

    this.matDialog.open(this.comTimeModal);
  }

  changeShowAntBsId(bsId, show)
  {
    this.showAntBsIdList[bsId] = show;
  }

  async getPathLossModel()
  {
    let retPathLossModel = {
      name: "",
      distancePowerLoss: 0,
      fieldLoss: 0
    };
    let url_get = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
    let result = await this.http.get(url_get).toPromise();
    let modelList = Object.values(result);
    console.log(`${JSON.stringify(modelList)}`);
    console.log(`${JSON.stringify(this.calculateForm)}`);
    for (let m = 0; m < modelList.length; m++)
    {
      if (this.calculateForm.pathLossModelId == modelList[m].id)
      {
        retPathLossModel = {
          name: (this.authService.lang == 'zh-TW') ? modelList[m]['chineseName'] : modelList[m]['name'],
          distancePowerLoss: modelList[m]['distancePowerLoss'],
          fieldLoss: modelList[m]['fieldLoss']
        };
        console.log(`${JSON.stringify(retPathLossModel)}`);
        break;
      }
    }


    this.siteInfo.pathLossModel = retPathLossModel;
  }
}
