import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import { EvaluationFuncForm, RatioForm } from '../../form/EvaluationFuncForm';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ProposeComponent } from '../modules/propose/propose.component';
import { SitePlanningMapComponent } from '../modules/site-planning-map/site-planning-map.component';
import { SignalQualityComponent } from '../modules/signal-quality/signal-quality.component';
import { SignalCoverComponent } from '../modules/signal-cover/signal-cover.component';
import { SignalStrengthComponent } from '../modules/signal-strength/signal-strength.component';
import { PerformanceComponent } from '../modules/performance/performance.component';
import { StatisticsComponent } from '../modules/statistics/statistics.component';
import { SiteInfoComponent } from '../modules/site-info/site-info.component';
import { JsPDFFontService } from '../../service/js-pdffont.service';
import { FormService } from '../../service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { View3dComponent } from '../view3d/view3d.component';
import { ActivatedRoute } from '@angular/router';
import { SignalDlThroughputComponent } from '../modules/signal-dl-throughput/signal-dl-throughput.component';
import { SignalUlThroughputComponent } from '../modules/signal-ul-throughput/signal-ul-throughput.component';

declare var Plotly: any;

/**
 * 匯出pdf
 */
@Component({
  selector: 'app-pdf',
  templateUrl: './pdf.component.html',
  styleUrls: ['./pdf.component.scss']
})
export class PdfComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private formService: FormService,
    private jsPDFFontService: JsPDFFontService,
    private translateService: TranslateService,
    private http: HttpClient) { }

  windowLock = null;

  /** 測試用taskId */
  taskId = 'task_sel_365aa925-c004-443c-949d-a2eed2d9dd60_1';
  /** 結果form */
  calculateForm: CalculateForm = new CalculateForm();
  unAchievedObj = {    
    isFieldSINRUnAchieved: false,
    isFieldRSRPUnAchieved: false,
    isFieldThroughputUnAchieved: false,
    isFieldCoverageUnAchieved: false,
    isUEThroughputByRsrpUnAchieved: false,
    isUECoverageUnAchieved: false
  };
  /** RSRP and SINR Threashold **/
  rsrpTh = -90;
  sinrTh = 15;
  zCoverageRsrp;
  avgCoverageRsrp = 0;
  zCoverageSinr;
  avgCoverageSinr = 0;

  realFieldCoverage = 0;
  realFieldSINR = [];
  realFieldRSRP = [];
  realFieldULThroughput = [];
  realFieldDLThroughput = [];
  realUECoverage = 0;
  realUEULThroughput = [];
  realUEDLThroughput = [];
  /** 結果data */
  result = {};
  /** 高度 */
  zValues = [];
  /** 現有基站 */
  defaultBs = [];
  /** 新增基站 */
  inputBsList = [];
  /** 障礙物 */
  obstacleList = [];
  /** 行動終端 */
  ueList = [];
  /** 行動終端 */
  isHst = false;
  /** 材質列表 */
  materialList = [];
  materialIdToIndex = {};
  /** 天線列表 */
  antennaList = [];
  AntennaIdToIndex = [];
  /** 無線模型列表 */
  pathLossModelList = [];
  /** 建議方案 Component */
  @ViewChild('propose') propose: ProposeComponent;
  /** 建議方案 Component */
  @ViewChildren('sitePlanningMap') sitePlanningMap: QueryList<SitePlanningMapComponent>;
  /** 訊號品質圖 Component */
  @ViewChildren('quality') quality: QueryList<SignalQualityComponent>;
  /** 訊號覆蓋圖 Component */
  @ViewChildren('cover') cover: QueryList<SignalCoverComponent>;
  /** 訊號強度圖 Component */
  @ViewChildren('strength') strength: QueryList<SignalStrengthComponent>;
  /** 效能分析 Component */
  @ViewChild('performance') performance: PerformanceComponent;
  /** 統計圖 Component */
  @ViewChild('statistics') statistics: StatisticsComponent;
  /** 設定資訊 Component */
  @ViewChild('siteInfo') siteInfo: SiteInfoComponent;
  /** 3D訊號品質圖 Component */
  @ViewChildren('view3D1') view3D1: QueryList<View3dComponent>;
  /** 3D訊號覆蓋圖 Component */
  @ViewChildren('view3D2') view3D2: QueryList<View3dComponent>;
  /** 3D訊號強度圖 Component */
  @ViewChildren('view3D3') view3D3: QueryList<View3dComponent>;
  /** 3D訊上行傳輸速率圖 Component */
  @ViewChildren('view3D4') view3D4: QueryList<View3dComponent>;
  /** 3D下行傳輸速率圖 Component */
  @ViewChildren('view3D5') view3D5: QueryList<View3dComponent>;
  /** 上行傳輸速率圖 Component */
  @ViewChildren('ulThroughputMap') ulThroughputMap: QueryList<SignalUlThroughputComponent>;
  /** 下行傳輸速率圖 Component */
  @ViewChildren('dlThroughputMap') dlThroughputMap: QueryList<SignalDlThroughputComponent>;

  ngOnInit() {
    // this.route.queryParams.subscribe(params => {
    //   this.taskId = params['taskId'];
    // });
    // this.export(this.taskId, true);

    // this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));
    // console.log(this.result);

    this.rsrpTh = Number(sessionStorage.getItem('rsrpThreshold'));
    this.sinrTh = Number(sessionStorage.getItem('sinrThreshold'));
    this.zCoverageRsrp = [0, 0, 0];
    this.zCoverageSinr = [0, 0, 0];
    this.avgCoverageRsrp = 0;
    this.avgCoverageSinr = 0;
  }

  /**
   * @param taskId
   * @param isHst 歷史紀錄
   * @param scaleMinSQ
   * @param scaleMaxSQ
   * @param scaleMinST
   * @param scaleMaxST
   * @param scaleMinUL
   * @param scaleMaxUL
   * @param scaleMaxDL
   * @param scaleMaxDL
   */
  async export(taskId, isHst, scaleMinSQ, scaleMaxSQ, scaleMinST, scaleMaxST, scaleMinUL, scaleMaxUL, scaleMinDL, scaleMaxDL)
  {
    this.windowLock = this.lockScroll();
    const ant = await this.getAntennaList();
    const obs = await this.getObstacleList();
    const pml = await this.getPathLossModelList();
    // Initial
    this.defaultBs.length = 0;
    this.inputBsList.length = 0;
    this.ueList.length = 0;
    //
    this.taskId = taskId;
    this.authService.spinnerShowPdf();
    if (typeof this.taskId !== 'undefined') {
      let url;
      if (isHst) {
        url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
        url += `${this.authService.userToken}/${taskId}`;
      } else {
        url = `${this.authService.API_URL}/completeCalcResult/${this.taskId}/${this.authService.userToken}`;
      }
      this.http.get(url).subscribe(
        res => {
          console.log(res);
          if (document.getElementById('pdf_area') != null) {
            document.getElementById('pdf_area').style.display = 'block';
          }
          if (isHst) {
            // 歷史紀錄
            this.isHst = true;
            this.result = this.formService.setHstOutputToResultOutput(res['output']);
            this.result['createTime'] = res['createtime'];
            const form = res;
            // delete form['output'];
            this.calculateForm = this.formService.setHstToForm(form);
            this.unAchievedObj = this.formService.setHstToUnAch(form);
            this.realFieldCoverage = this.formService.setHstToFieldCoverageRatio(form);
            this.realFieldSINR = this.formService.setHstToFieldSINRRatio(form);
            this.realFieldRSRP = this.formService.setHstToFieldRSRPRatio(form);
            this.realFieldULThroughput = this.formService.setHstToFieldULThroughputRatio(form);
            this.realFieldDLThroughput = this.formService.setHstToFieldDLThroughputRatio(form);
            this.realUECoverage = this.formService.setHstToUECoverageatio(form);
            this.realUEULThroughput = this.formService.setHstToUEULThroughputRatio(form);
            this.realUEDLThroughput  = this.formService.setHstToUEDLThroughputRatio(form);
            this.result['inputWidth'] = this.calculateForm.width;
            this.result['inputHeight'] = this.calculateForm.height;
            console.log(this.calculateForm);
          } else {
            this.isHst = false;
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
            this.realUEDLThroughput  = this.formService.setHstToUEDLThroughputRatio(res);
          }
          // 現有基站
          let bs = [];
          if (!this.isEmpty(this.calculateForm.defaultBs)) {
            if (this.calculateForm.defaultBs !== '') {
              bs = this.calculateForm.defaultBs.split('|');
              for (const item of bs) {
                this.defaultBs.push(JSON.parse(item));
              }
            }
          }          
          // 新增基站
          let candidateBsAry = [];
          if (!this.isEmpty(this.calculateForm.candidateBs)) {
            candidateBsAry = this.calculateForm.candidateBs.split('|');
            for (const item of candidateBsAry) {
              this.inputBsList.push(JSON.parse(item));
            }
          }          
          this.result['inputBsList'] = this.inputBsList;
          // 障礙物資訊
          let obstacle = [];
          if (!this.isEmpty(this.calculateForm.obstacleInfo)) {
            obstacle = this.calculateForm.obstacleInfo.split('|');
            for (const item of obstacle) {
              const obj = JSON.parse(item);
              let materialName = '';
              if(this.materialList[this.materialIdToIndex[obj[7]]]['property'] == "customized"){
                materialName = this.translateService.instant('customize')+ "_";
              }
              if(this.authService.lang =='zh-TW'){
                materialName += this.materialList[this.materialIdToIndex[obj[7]]]['chineseName'];
              }else{
                materialName += this.materialList[this.materialIdToIndex[obj[7]]]['name'];
              }
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
                materialName: materialName,
                element: obj[8],
              });
            }
            obstacle = this.obstacleList;
          }


          // 行動終端分佈
          let ueCoordinate = [];
          if (!this.isEmpty(this.calculateForm.ueCoordinate)) {
            ueCoordinate = this.calculateForm.ueCoordinate.split('|');
            for (const item of ueCoordinate) {
              this.ueList.push(JSON.parse(item));
            }
          }

          this.zValues = JSON.parse(this.calculateForm.zValue);
          
          window.setTimeout(() => {
            if (candidateBsAry.length != 0) {
              this.propose.calculateForm = this.calculateForm;
              this.propose.result = this.result;
              this.propose.isPDF = true;
              this.propose.drawLayout(true);
            }
            // 編輯場域
            let idx = 0;
            this.sitePlanningMap.forEach(element => {
              element.drawDown = false;
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[idx]);
              idx++;
            });

            // 訊號品質圖
            let index = 0;
            this.quality.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index], scaleMinSQ, scaleMaxSQ);
              index++;
            });

            // 訊號覆蓋圖
            index = 0;
            this.cover.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
              index++;
            });

            // 訊號強度圖
            index = 0;
            this.strength.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index],scaleMinST,scaleMaxST);
              index++;
            });

            // 上行傳輸速率圖
            index = 0;
            this.ulThroughputMap.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index], scaleMinUL, scaleMaxUL);
              index++;
            });

            // 下行傳輸速率圖
            index = 0;
            this.dlThroughputMap.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index], scaleMinDL, scaleMaxDL);
              index++;
            });


            this.result['gaResult'] = {};
            this.result['gaResult']['chosenCandidate'] = this.result['chosenCandidate'];
            this.result['gaResult']['sinrMap'] = this.result['sinrMap'];
            // this.result['gaResult']['connectionMapAll'] = this.result['connectionMapAll'];
            this.result['gaResult']['rsrpMap'] = this.result['rsrpMap'];
            this.result['gaResult']['ulThroughputMap'] = this.result['ulThroughputMap'];
            this.result['gaResult']['dlThroughputMap'] = this.result['throughputMap'];

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

            this.result['sinrMax'] = Plotly.d3.max(sinrAry);
            this.result['sinrMin'] = Plotly.d3.min(sinrAry);
            this.result['rsrpMax'] = Plotly.d3.max(rsrpAry);
            this.result['rsrpMin'] = Plotly.d3.min(rsrpAry);
            this.result['ulThroughputMax'] = Plotly.d3.max(ulThroughputAry);
            this.result['ulThroughputMin'] = Plotly.d3.min(ulThroughputAry);
            this.result['dlThroughputMax'] = Plotly.d3.max(dlThroughputAry);
            this.result['dlThroughputMin'] = Plotly.d3.min(dlThroughputAry);

            console.log(document.querySelectorAll('.canvas_3d').length);

            for (const zValue of this.zValues) {
              // 3D訊號品質圖
              index = 0;
              this.view3D1.forEach(element => {
                if (index === this.zValues.indexOf(zValue)) {
                  // element.isSimulation = this.calculateForm.isSimulation;
                  element.calculateForm = this.calculateForm;
                  element.obstacle = obstacle;
                  element.defaultBs = bs;
                  element.candidate = candidateBsAry;
                  element.ue = ueCoordinate;
                  element.width = this.calculateForm.width;
                  element.height = this.calculateForm.height;
                  element.zValue = this.zValues;
                  element.planeHeight = zValue.toString();
                  element.result = this.result;
                  element.isPDF = true;
      
                  element.mounted();
                  element.switchHeatMap();
                }
                index++;
              });

              // 3D訊號覆蓋圖
              index = 0;
              this.view3D2.forEach(element => {
                if (index === this.zValues.indexOf(zValue)) {
                  // element.isSimulation = this.calculateForm.isSimulation;
                  element.calculateForm = this.calculateForm;
                  element.obstacle = obstacle;
                  element.defaultBs = bs;
                  element.candidate = candidateBsAry;
                  element.ue = ueCoordinate;
                  element.width = this.calculateForm.width;
                  element.height = this.calculateForm.height;
                  element.zValue = this.zValues;
                  element.planeHeight = zValue.toString();
                  element.result = this.result;
                  element.isPDF = true;
                  element.heatmapType = '1';

                  element.mounted();
                  element.switchHeatMap();
                }
                index++;
              });

              // 3D訊號強度圖
              index = 0;
              this.view3D3.forEach(element => {
                if (index === this.zValues.indexOf(zValue)) {
                  // element.isSimulation = this.calculateForm.isSimulation;
                  element.calculateForm = this.calculateForm;
                  element.obstacle = obstacle;
                  element.defaultBs = bs;
                  element.candidate = candidateBsAry;
                  element.ue = ueCoordinate;
                  element.width = this.calculateForm.width;
                  element.height = this.calculateForm.height;
                  element.zValue = this.zValues;
                  element.planeHeight = zValue.toString();
                  element.result = this.result;
                  element.isPDF = true;
                  element.heatmapType = '2';
      
                  element.mounted();
                  element.switchHeatMap();
                }
                index++;
              });

              // 3D上行傳輸速率圖
              index = 0;
              this.view3D4.forEach(element => {
                if (index === this.zValues.indexOf(zValue)) {
                  // element.isSimulation = this.calculateForm.isSimulation;
                  element.calculateForm = this.calculateForm;
                  element.obstacle = obstacle;
                  element.defaultBs = bs;
                  element.candidate = candidateBsAry;
                  element.ue = ueCoordinate;
                  element.width = this.calculateForm.width;
                  element.height = this.calculateForm.height;
                  element.zValue = this.zValues;
                  element.planeHeight = zValue.toString();
                  element.result = this.result;
                  element.isPDF = true;
                  element.heatmapType = '3';
      
                  element.mounted();
                  element.switchHeatMap();
                }
                index++;
              });

              // 3D下行傳輸速率圖
              index = 0;
              this.view3D5.forEach(element => {
                if (index === this.zValues.indexOf(zValue)) {
                  // element.isSimulation = this.calculateForm.isSimulation;
                  element.calculateForm = this.calculateForm;
                  element.obstacle = obstacle;
                  element.defaultBs = bs;
                  element.candidate = candidateBsAry;
                  element.ue = ueCoordinate;
                  element.width = this.calculateForm.width;
                  element.height = this.calculateForm.height;
                  element.zValue = this.zValues;
                  element.planeHeight = zValue.toString();
                  element.result = this.result;
                  element.isPDF = true;
                  element.heatmapType = '4';
      
                  element.mounted();
                  element.switchHeatMap();
                }
                index++;
              });

            }

            // 統計資訊
            this.performance.calculateForm = this.calculateForm;
            this.performance.result = this.result;
            this.performance.isHst = this.isHst;
            this.performance.setData();
            this.statistics.calculateForm = this.calculateForm;
            this.statistics.result = this.result;
            this.statistics.drawChart(true);
            this.statistics.showTitle = false;

            this.siteInfo.calculateForm = this.calculateForm;
            this.siteInfo.result = this.result;
            window.setTimeout(() => {
              this.siteInfo.inputBsListCount = this.inputBsList.length;
              this.siteInfo.defaultBsCount = this.defaultBs.length;
            }, 0);
            console.log(this.result);
            window.setTimeout(() => {
              this.genericPDF(this.calculateForm.taskName);
            }, 3000);
          }, 0);
        }
      );
    }
  }

  financial(x) {
    return Number.parseFloat(x).toFixed(1);
  }

  /** export PDF */
  async genericPDF(taskName) {
    this.authService.spinnerShowPdf();
    const pdf = new jsPDF('p', 'mm', 'a4', true); // A4 size page of PDF
    // 設定字型
    this.jsPDFFontService.AddFontArimo(pdf);
    let defaultBsCount = 0;
    const defaultBs = this.calculateForm.defaultBs.split('|');
    if (defaultBs[0] !== '') {
      defaultBsCount = defaultBs.length;
    }

    const area = document.querySelector('#pdf_area');
    const list = [];
    for (let k = 0; k < this.zValues.length; k++) {
      list.push(`signal_${k}`);
      list.push(`signal2_${k}`);
    }
    // for (let k = 0; k < this.zValues.length; k++) {
    //   list.push(`signal2_${k}`);
    // }
    // for (let k = 0; k < this.zValues.length; k++) {
    //   list.push(`view_3d_${k}`);
    // }
    // for (let k = 0; k < this.zValues.length; k++) {
    //   list.push(`view_3d2_${k}`);
    // }

    // 基站資訊
    let pos = 10;
    const margin = 8;
    const leftStart = 25;
    pdf.setFontStyle('normal');
    pdf.setFontSize(17);
    pdf.text(14, pos, this.translateService.instant('pdf.fieldInfo'));
    pos += margin;
    // pdf.text(14, pos, `${this.translateService.instant('taskName')}：${this.calculateForm['taskName']}`);
    // pos += margin;
    // pdf.text(14, pos, `${this.translateService.instant('createTime')}：${this.result['createTime']}`);
    // pos += margin+5;
    // pdf.setFontSize(17);
    // pdf.text(14, pos, `${this.translateService.instant('result.layered.info')}：`);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.1);
    // if (this.calculateForm.duplex == 'tdd') {
    //   pdf.rect(14, pos + (margin / 2), 182, 190);
    // } else {
    //   pdf.rect(14, pos + (margin / 2), 182, 200);
    // }
    // pos += margin;
    // if (this.calculateForm.isSimulation) {
    //   pdf.text(14, pos, this.translateService.instant('simulation'));
    //   pos += margin;
    // } else {
    //   pdf.text(14, pos, `${this.translateService.instant('planning.target')}：`);
    //   pos += margin;
    //   if (this.calculateForm.isAverageSinr) {
    //     pdf.text(leftStart, pos, this.translateService.instant('isAverageSinr'));
    //     pos += margin;
    //   }
    //   if (this.calculateForm.isCoverage) {
    //     pdf.text(leftStart, pos, this.translateService.instant('isCoverage'));
    //     pos += margin;
    //   }
    //   if (this.calculateForm.isUeAvgSinr) {
    //     pdf.text(leftStart, pos, this.translateService.instant('isUeAvgSinr'));
    //     pos += margin;
    //   }
    //   if (this.calculateForm.isUeAvgThroughput) {
    //     pdf.text(leftStart, pos, this.translateService.instant('isUeAvgThroughput'));
    //     pos += margin;
    //   }
    //   if (this.calculateForm.isUeTpByDistance) {
    //     pdf.text(leftStart, pos, this.translateService.instant('isUeTpByDistance'));
    //     pos += margin;
    //   }
    // }
    // pdf.setFontSize(17);
    // pdf.text(14, pos, `${this.translateService.instant('planning.size')}：`);
    // pos += margin;
    // pdf.setFontSize(14);
    // pdf.text(leftStart, pos, `${this.translateService.instant('result.pdf.width')}： ${this.result['inputWidth']} ${this.translateService.instant('meter')}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('result.pdf.height')}： ${this.result['inputHeight']} ${this.translateService.instant('meter')}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('result.pdf.altitude')}： ${this.calculateForm['altitude']} ${this.translateService.instant('meter')}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('zValue')}： ${this.calculateForm.zValue.replace(new RegExp(',', 'gi'), ', ')} ${this.translateService.instant('meter')}`);
    // pos += margin;
    // pdf.setFontSize(17);

    // 基地台相關表格
    // pdf.text(14, pos, `${this.translateService.instant('result.bs.info')}：`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('result.propose.wait_select_1')}： ${this.translateService.instant('result.propose.wait_select_2').replace('{0}', this.inputBsList.length)}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('defaultBs')}： ${this.translateService.instant('result.bs.count').replace('{0}', defaultBsCount)}`);
    // pos += margin;
    // if (this.calculateForm.isSimulation) {
    //   pdf.text(leftStart, pos, `${this.translateService.instant('result.dbm.range')}： ${this.calculateForm.powerMinRange} dBm ~ ${this.calculateForm.powerMaxRange} dBm`);
    //   pos += margin;
    //   pdf.text(leftStart, pos, `${this.translateService.instant('result.beam.range')}： 0 ~ 30`);
    //   pos += margin;
    // }
    // if (this.calculateForm.mapProtocol != 'wifi') {
    //   pdf.text(leftStart, pos, `${this.translateService.instant('duplex')}： ${this.calculateForm.duplex}`);
    //   pos += margin;
    //   if (this.calculateForm.duplex == 'tdd') {
    //     pdf.text(leftStart, pos, `${this.translateService.instant('bandwidth')}(MHz)： ${this.calculateForm.bandwidth} MHz`);
    //     pos += margin;
    //     pdf.text(leftStart, pos, `${this.translateService.instant('frequency')}(MHz)： ${this.calculateForm.frequencyList} MHz`);
    //     pos += margin;
    //   } else {
    //     pdf.text(leftStart, pos, `${this.translateService.instant('dlBandwidth')}(MHz)： ${this.calculateForm.dlBandwidth} MHz`);
    //     pos += margin;
    //     pdf.text(leftStart, pos, `${this.translateService.instant('ulBandwidth')}(MHz)： ${this.calculateForm.ulBandwidth} MHz`);
    //     pos += margin;
    //     pdf.text(leftStart, pos, `${this.translateService.instant('dlfrequency')}(MHz)： ${this.calculateForm.dlFrequency} MHz`);
    //     pos += margin;
    //     pdf.text(leftStart, pos, `${this.translateService.instant('ulfrequency')}(MHz)： ${this.calculateForm.ulFrequency} MHz`);
    //     pos += margin;
    //   }
    // }
    // pdf.text(20, pos, `${this.translateService.instant('planning.algorithm')}：`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('mctsC')}： ${this.calculateForm.mctsC}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('mctsMimo')}： ${this.calculateForm.mctsMimo}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('mctsTemperature')}： ${this.calculateForm.mctsTemperature}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('mctsTime')}： ${this.calculateForm.mctsTime}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('mctsTestTime')}： ${this.calculateForm.mctsTestTime}`);
    // pos += margin;
    // pdf.text(leftStart, pos, `${this.translateService.instant('mctsTotalTime')}： ${this.calculateForm.mctsTotalTime}`);
    const specDataHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
    };

    // let target;
    // if (this.calculateForm.isAverageSinr) {
    //   target = this.translateService.instant('isAverageSinr');
    // } else if (this.calculateForm.isCoverage) {
    //   target = this.translateService.instant('isCoverage');
    // } else if (this.calculateForm.isUeAvgSinr) {
    //   target = this.translateService.instant('isUeAvgSinr');
    // } else if (this.calculateForm.isUeCoverage) {
    //   target = this.translateService.instant('isUeCoverage');
    // } else if (this.calculateForm.isUeAvgThroughput) {
    //   target = this.translateService.instant('isUeAvgThroughput');
    // } else if (this.calculateForm.isUeTpByDistance) {
    //   target = this.translateService.instant('isUeTpByDistance');
    // }

    let coverageTarget = "";
    let SINRTarget = "";
    let RSRPTarget = "";
    let throughputTarget = "";
    let UEcoverageTarget = "";
    let UEThroughtpuTarget = "";

    let coverageContent = "";
    let SINRContent = "";
    let RSRPContent = "";
    let throughputContent = "";
    let UEcoverageContent = "";
    let UEThroughputContent = "";

    var compliance = "";
    var equal = "=";
    var tab = "";

    for(var x = 0; x < 22; x ++)
      tab += " ";
	

    if (this.calculateForm.evaluationFunc.field.coverage.activate) 
    {
      coverageTarget = this.translateService.instant('isCoverage');
      if(this.unAchievedObj.isFieldCoverageUnAchieved)
        coverageTarget += this.translateService.instant('unachieved');
      else
        coverageTarget += this.translateService.instant('achieved');
      coverageTarget += "\n";

      coverageContent = "  " + this.translateService.instant('setCondition') + "1. " + this.translateService.instant('subfield.coverage') + " >= " + 
        (this.calculateForm.evaluationFunc.field.coverage.ratio*100).toFixed(2) + "%" + "\n" + 
        "  " + this.translateService.instant('realCondition') + "1. " + this.translateService.instant('subfield.coverage') + " " + equal + " " + 
        (this.realFieldCoverage*100).toFixed(2) + "%" + "\n\n";
    }
    if (this.calculateForm.evaluationFunc.field.sinr.activate) 
    {
      SINRTarget = this.translateService.instant('isSINR');
      if(this.unAchievedObj.isFieldSINRUnAchieved)
        SINRTarget += this.translateService.instant('unachieved');
      else
        SINRTarget += this.translateService.instant('achieved');
      SINRTarget += "\n";

      for(var x = 0; x < this.calculateForm.evaluationFunc.field.sinr.ratio.length; x++)
      {
        compliance = this.translateService.instant(this.calculateForm.evaluationFunc.field.sinr.ratio[x].compliance);
        SINRContent += "  " + this.translateService.instant('setCondition') + (x+1) + ". " + 
        this.translateService.instant('FieldArea') + (this.calculateForm.evaluationFunc.field.sinr.ratio[x].areaRatio*100).toFixed(2) + "% " + 
        compliance + " " + this.calculateForm.evaluationFunc.field.sinr.ratio[x].value + "dB" + "\n" + 
        "  " + this.translateService.instant('realCondition') + (x+1) + ". " + 
        this.translateService.instant('FieldArea') + (this.realFieldSINR[x] * 100).toFixed(2) + "% " + 
        compliance + " " + this.calculateForm.evaluationFunc.field.sinr.ratio[x].value + "dB" + 
        "\n";
      }
	    SINRContent += "\n";
    }
    if (this.calculateForm.evaluationFunc.field.rsrp.activate) 
    {
      RSRPTarget = this.translateService.instant('isRSRP');
      if(this.unAchievedObj.isFieldRSRPUnAchieved)
        RSRPTarget += this.translateService.instant('unachieved');
      else
        RSRPTarget += this.translateService.instant('achieved');
      RSRPTarget += "\n"
	  
      for(var x = 0; x < this.calculateForm.evaluationFunc.field.rsrp.ratio.length; x++)
      {
        compliance = this.translateService.instant(this.calculateForm.evaluationFunc.field.rsrp.ratio[x].compliance);
        RSRPContent += "  " + this.translateService.instant('setCondition') + (x+1) + ". " + 
        this.translateService.instant('FieldArea') + (this.calculateForm.evaluationFunc.field.rsrp.ratio[x].areaRatio*100).toFixed(2) + "% " + 
        compliance + " " + this.calculateForm.evaluationFunc.field.rsrp.ratio[x].value + "dB" + "\n" + 
        "  " + this.translateService.instant('realCondition') + (x+1) + ". " + 
        this.translateService.instant('FieldArea') + (this.realFieldRSRP[x] * 100).toFixed(2) + "% " + 
        compliance + " " + this.calculateForm.evaluationFunc.field.rsrp.ratio[x].value + "dB" + 
        "\n";
      }
	  
	    RSRPContent += "\n";
    }
    if (this.calculateForm.evaluationFunc.field.throughput.activate) 
    {
      throughputTarget = this.translateService.instant('isThroughput');
      if(this.unAchievedObj.isFieldThroughputUnAchieved)
        throughputTarget += this.translateService.instant('unachieved');
      else
        throughputTarget += this.translateService.instant('achieved');
      throughputTarget += "\n"

      for(var x = 0; x < this.calculateForm.evaluationFunc.field.throughput.ratio.length; x++)
      {
        if(this.calculateForm.evaluationFunc.field.throughput.ratio[x].ULValue != null || 
          this.calculateForm.evaluationFunc.field.throughput.ratio[x].DLValue != null)
        {
          compliance = this.translateService.instant(this.calculateForm.evaluationFunc.field.throughput.ratio[x].compliance);
          throughputContent += "  " + this.translateService.instant('setCondition') + (x+1) + ". " + 
          this.translateService.instant('FieldArea') + (this.calculateForm.evaluationFunc.field.throughput.ratio[x].areaRatio*100).toFixed(2) + "% ";        
          if(this.calculateForm.evaluationFunc.field.throughput.ratio[x].ULValue != null)
          {
            throughputContent += "UL " + compliance + " " + this.calculateForm.evaluationFunc.field.throughput.ratio[x].ULValue + "Mbps\n";
          } 
          else if(this.calculateForm.evaluationFunc.field.throughput.ratio[x].DLValue != null)
          {
            throughputContent += "DL " + compliance + this.calculateForm.evaluationFunc.field.throughput.ratio[x].DLValue + "Mbps\n";
          } 
          throughputContent += "  " + this.translateService.instant('realCondition') + (x+1) + ". " + 
          this.translateService.instant('FieldArea');
          if(this.calculateForm.evaluationFunc.field.throughput.ratio[x].ULValue != null)
          { 
            throughputContent += (this.realFieldULThroughput[x] * 100).toFixed(2) + "% ";
            throughputContent += "UL " + compliance + " " + this.calculateForm.evaluationFunc.field.throughput.ratio[x].ULValue + "Mbps\n";
          } 
          else if(this.calculateForm.evaluationFunc.field.throughput.ratio[x].DLValue != null)
          {
            throughputContent += (this.realFieldDLThroughput[x] * 100).toFixed(2) + "% ";
            throughputContent += "DL " + compliance + this.calculateForm.evaluationFunc.field.throughput.ratio[x].DLValue + "Mbps\n";
          } 
        }
		  }
	  
	    throughputContent += "\n";
    }
    if (this.calculateForm.evaluationFunc.ue.coverage.activate) 
    {
      UEcoverageTarget = this.translateService.instant('isUeCoverage');
      if(this.unAchievedObj.isUECoverageUnAchieved)
        UEcoverageTarget += this.translateService.instant('unachieved');
      else
        UEcoverageTarget += this.translateService.instant('achieved');
      UEcoverageTarget += "\n";
      
      UEcoverageContent = "  " + this.translateService.instant('setCondition') + "1. " + this.translateService.instant('subfield.coverage') + " >= " + 
        (this.calculateForm.evaluationFunc.ue.coverage.ratio*100).toFixed(2) + "%" + "\n" + 
        "  " + this.translateService.instant('realCondition') + "1. " + this.translateService.instant('subfield.coverage') + " " + equal + " " + 
        (this.realUECoverage * 100).toFixed(2) + "%" + 
        "\n\n";
    }
    if (this.calculateForm.evaluationFunc.ue.throughputByRsrp.activate) 
    {
      UEThroughtpuTarget = this.translateService.instant('isUeAvgThroughput');
      if(this.unAchievedObj.isUEThroughputByRsrpUnAchieved)
        UEThroughtpuTarget += this.translateService.instant('unachieved');
      else
        UEThroughtpuTarget += this.translateService.instant('achieved');
      UEThroughtpuTarget += "\n";

      for(var x = 0; x < this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio.length; x++)
      {
        if(this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].ULValue != null || 
          this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].DLValue != null)
        {
          compliance = this.translateService.instant(this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].compliance);
          UEThroughputContent += "  " + this.translateService.instant('setCondition') + (x+1) + ". " + this.translateService.instant('ue') + " " +
          (this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].countRatio*100).toFixed(2) + "% ";
          if(this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].ULValue != null)
          {
            UEThroughputContent += "UL " + compliance + " " + this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].ULValue + "Mbps\n";
          } 
          else if(this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].DLValue != null)
          {
            UEThroughputContent += "DL " + compliance + " " + this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].DLValue + "Mbps\n";
          }   
          UEThroughputContent += "  " + this.translateService.instant('realCondition') + (x + 1) + ". " + this.translateService.instant('ue') + " ";
          if(this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].ULValue != null)
          {
            UEThroughputContent += (this.realUEULThroughput[x] * 100).toFixed(2) + "% ";
            UEThroughputContent += "UL " + compliance + " " + this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].ULValue + "Mbps\n";
          } 
          else if(this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].DLValue != null)
          {
            UEThroughputContent += (this.realUEDLThroughput[x] * 100).toFixed(2) + "% ";
            UEThroughputContent += "DL " + compliance + " " + this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio[x].DLValue + "Mbps\n";
          }
        }
        
      }
	    UEThroughputContent += "\n";
    }

    let target = coverageTarget + coverageContent + 
    SINRTarget + SINRContent + 
    RSRPTarget + RSRPContent + 
    throughputTarget + throughputContent + 
    UEcoverageTarget + UEcoverageContent + 
    UEThroughtpuTarget + UEThroughputContent;



    let fieldParameter = [
      [this.translateService.instant('taskName'),this.calculateForm['taskName']],
      [this.translateService.instant('createTime'),this.result['createTime']],
      [this.translateService.instant('result.layered.info'),target],
      [this.translateService.instant('result.pdf.width'),this.result['inputWidth']+' '+this.translateService.instant('meter')],
      [this.translateService.instant('result.pdf.height'),this.result['inputHeight']+' '+this.translateService.instant('meter')],
      [this.translateService.instant('result.pdf.altitude'),this.calculateForm['altitude']+' '+this.translateService.instant('meter')],
      [this.translateService.instant('zValue'),this.calculateForm.zValue.replace(new RegExp(',', 'gi'), ', ')+this.translateService.instant('meter')],
      [this.translateService.instant('maxConnectionNum'),this.calculateForm['maxConnectionNum']],
      [this.translateService.instant('resolution'),this.calculateForm['resolution']+' x '+this.calculateForm['resolution']+'('+this.translateService.instant('meter')+')'],
      [this.translateService.instant('compassDirection'),this.calculateForm['geographicalNorth']+' '+this.translateService.instant('angle')],
      // [this.translateService.instant('planning.model'),
    ]
    pdf.autoTable([this.translateService.instant('pdf.total.item'),this.translateService.instant('pdf.content')], fieldParameter, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: specDataHeader,
      startY: pos,
      halign: 'center',
      columnStyles: {
        0: {cellWidth: 90},
        1: {cellWidth: 90},
      }
    });

    console.log("mutil function info over");

    pos = 10;
    pdf.addPage();
    
	  //無線模型資訊
    let pathLossModel = this.pathLossModelList.find(item => item["id"] == this.calculateForm['pathLossModelId']);
    let pathLossModelName = "";
    if (this.authService.lang == 'zh-TW'){
      pathLossModelName = "[" + pathLossModel['chineseName'] + "]";
    } else {
      pathLossModelName = "[" + pathLossModel['name'] + "]";
    }
    let pathLossModelInfo;

    pathLossModelInfo = [
      [this.translateService.instant('planning.model.name'),pathLossModelName],
      [this.translateService.instant('planning.model.disscoefficient'),pathLossModel['distancePowerLoss']],
      [this.translateService.instant('planning.model.fieldLoss'),pathLossModel['fieldLoss']]
    ];

    pdf.autoTable([this.translateService.instant('pdf.pathLossModel.item'),this.translateService.instant('pdf.content')], pathLossModelInfo, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: specDataHeader,
      startY: pos,
      halign: 'center',
      columnStyles: {
        0: {cellWidth: 90},
        1: {cellWidth: 90},
      }
    });

    console.log("pathLossModel info over: "+pathLossModelName);

    pos = 10;
    pdf.addPage();

    let statistics;
    if (this.calculateForm.isSimulation) {
      statistics = [
        [this.translateService.instant('pdf.total.defaultBs'), this.defaultBs.length],
        [this.translateService.instant('pdf.total.ue'), this.ueList.length],
      ];
    } else {
      statistics = [
        [this.translateService.instant('pdf.total.defaultBs'),this.defaultBs.length],
        [this.translateService.instant('pdf.total.candidate'),this.inputBsList.length],
        [this.translateService.instant('pdf.total.propose.candidate'),this.result['chosenCandidate'].length],
        [this.translateService.instant('pdf.total.ue'),this.ueList.length],
      ];
    }

    pdf.autoTable([this.translateService.instant('pdf.total.item'),
    this.translateService.instant('pdf.total')], statistics, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: specDataHeader,
      startY: pos,
      halign: 'center',
      columnStyles: {
        0: {cellWidth: 90},
        1: {cellWidth: 90},
      }
    });

    // 編輯場域畫面
    pos = 10;
    pdf.addPage();
    pdf.setFontSize(17);
    pdf.text(14, pos, this.translateService.instant('pdf.fieldBsAndUeInfo'));
    pos += margin;
    let mapHeight = 0;
    const data = <HTMLDivElement> area.querySelector(`#sitePlanningMap`);
    if (data.querySelector('#is_site_map') != null) {
      await this.sleep(1000);
    }
    
    await this.checkSiteMap();

    // console.log(data);
    console.log('start sitePlanningMap.');
    await html2canvas(data, {
      useCORS: true
    }).then(canvas => {
      // console.log(canvas);
      const imgWidth = 182;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      mapHeight = imgHeight;
      const contentDataURL = canvas.toDataURL('image/png');
      // console.log(contentDataURL);
      // const position = 10;
      pdf.addImage(contentDataURL, 'PNG', 14, pos, imgWidth, imgHeight, undefined, 'FAST');
      console.log('sitePlanningMap add done.');
    });

    pos += margin;
    let specData = [];
    let specData2 = [];
    let tableTitle;
    let tableTitle2;
    let antTableTitle;
    let antData = [];

    let isDASFormat = this.calculateForm.isSimulation && this.calculateForm.bsList != null && this.calculateForm.bsList.length != 0 && this.calculateForm.bsList.defaultBs != null;

    if (!isDASFormat)
    {
      if (this.calculateForm.duplex == 'tdd')
      {
        const defaultBs = this.calculateForm.defaultBs.split('|');
        const defaultBsLen = defaultBs.length;
        var defaultAnt = [];
        // 填舊版無天線功能的欄位
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
        let candidateLen = this.result['candidateIdx'].length;
        var candidateAnt = [];
        if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt))
        {
          let candidateAntList = this.calculateForm.candidateBsAnt.split('|');
          let candidateindex = this.result['candidateIdx'];
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push(candidateAntList[candidateindex[i]]);
          }
        } else
        {
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push("[1,0,0,0]");
          }
        }
        let ulmsc = this.calculateForm.ulMcsTable;
        let dlmsc = this.calculateForm.dlMcsTable;
        let ulMcsTable = ulmsc.substring(1, (ulmsc.length) - 1).split(',');
        // ulMcsTable = ulMcsTable.slice(-(defaultBs.length))
        let dlMcsTable = dlmsc.substring(1, (dlmsc.length) - 1).split(',');
        // dlMcsTable = dlMcsTable.slice(-(defaultBs.length))
        // tableTitle = ['基站編號','X/Y','功率(dBm)','波束形','中心頻率','子載波間距(kHz)','頻寬','上行調變能力',
        // '下行調變能力','上行資料串流層數','下行資料串流層數'];
        //tableTitle = ['#', 'X/Y', 'dBm', 'Frequency', 'SCS(kHz)', 'Bandwidth', 'UL MCStable', 'DL MCStable'];
        //tableTitle2 = ['#', 'UL MIMOLayer', 'DL MIMOLayer', 'bsNoiseFigure', 'Antenna', 'Theta', 'Phi', 'Txgain'];
        tableTitle = ['#',
          'X/Y',
          this.translateService.instant('result.propose.candidateBs.dbm'),
          this.translateService.instant('tddfrequency') + "(MHz)",
          this.translateService.instant('tddscs') + "(kHz)",
          this.translateService.instant('bandwidth'),
          this.translateService.instant('ulModulationCodScheme'),
          this.translateService.instant('dlModulationCodScheme')];
        tableTitle2 = ['#',
          this.translateService.instant('ulMimolayer'),
          this.translateService.instant('dlMimolayer'),
          this.translateService.instant('noise'),
          this.translateService.instant('antenna.rawdata.ant.name'),
          this.translateService.instant('theta.pdf'),
          this.translateService.instant('phi.pdf'),
          this.translateService.instant('TxGain') + "(dB)"];  

        // 'DL MCStable','UL MIMOLayer','DL MIMOLayer','bsTxGain','bsNoiseFigure'];
        // 'DL MCStable','UL MIMOLayer','DL MIMOLayer','bsNoiseFigure'];
        for (let i = 0; i < candidateLen; i++)
        {
          const antObj = JSON.parse(candidateAnt[i]);
          specData.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${this.result['chosenCandidate'][i][0]}/${this.result['chosenCandidate'][i][1]}`,
            `${this.result['candidateBsPower'][i]}`,
            // `${this.result['candidateBeamId'][i]}`,
            `${JSON.parse(this.calculateForm.frequencyList)[0]}`,
            `${JSON.parse(this.calculateForm.scs)[0]}`,
            `${JSON.parse(this.calculateForm.bandwidth)[0]}`,
            `${ulMcsTable[0]}`,
            `${dlMcsTable[0]}`
          ]);
          let antennaName = "";

          antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[0];
          }
          specData2.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[0]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[0]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`
          ]);
        }
        let unsorttxpower = [];
        let unsortbeamid = [];
        let txpower = [];
        let beamid = [];
        if (this.calculateForm.isSimulation)
        {
          //舊格式
          if (this.calculateForm.bsList == null || this.calculateForm.bsList.length == 0 || this.calculateForm.bsList.defaultBs == null)
          {
            txpower = JSON.parse(this.calculateForm.txPower);
          }
          beamid = JSON.parse(this.calculateForm.beamId);
        } else
        {
          unsorttxpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
          unsortbeamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
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
        let defaultLen;
        if (defaultBs[0] == '')
        {
          defaultLen = 0;
        } else
        {
          defaultLen = defaultBs.length;
        }
        for (let i = 0; i < defaultLen; i++)
        {
          const antObj = JSON.parse(defaultAnt[i]);
          specData.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${JSON.parse(defaultBs[i])[0]}/${JSON.parse(defaultBs[i])[1]}`,
            `${txpower[i]}`,
            // `${beamid[i]}`,
            `${JSON.parse(this.calculateForm.frequency)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.scs)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.bandwidth)[i + this.inputBsList.length]}`,
            `${ulMcsTable[i + this.inputBsList.length]}`,
            `${dlMcsTable[i + this.inputBsList.length]}`,
            // `${JSON.parse(this.calculateForm.ulMimoLayer)[i+this.inputBsList.length]}`,
            // `${JSON.parse(this.calculateForm.dlMimoLayer)[i+this.inputBsList.length]}`,
            // `${JSON.parse(this.calculateForm.bsTxGain)[i+this.inputBsList.length]}`,
            // `${JSON.parse(this.calculateForm.bsNoiseFigure)[i+this.inputBsList.length]}`,
          ]);

          let antennaName = "";

          antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[i + this.inputBsList.length]
          }
          specData2.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[i + this.inputBsList.length]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`,
          ]);

        }
      }
      else
      {
        let defaultBs = this.calculateForm.defaultBs.split('|');
        // const defaultAnt = this.calculateForm.defaultBsAnt.split('|');
        // const candidateAnt = this.calculateForm.candidateBsAnt.split('|');
        if (defaultBs.length == 1 && defaultBs[0] == '')
        {
          defaultBs = [];
        }
        const defaultBsLen = defaultBs.length;
        var defaultAnt = [];
        // 填舊版無天線功能的欄位
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
        let candidateLen = this.result['candidateIdx'].length;
        var candidateAnt = [];
        if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt))
        {
          let candidateAntList = this.calculateForm.candidateBsAnt.split('|');
          let candidateindex = this.result['candidateIdx'];
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push(candidateAntList[candidateindex[i]]);
          }
        } else
        {
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push("[1,0,0,0]");
          }
        }
        let ulmsc = this.calculateForm.ulMcsTable;
        let dlmsc = this.calculateForm.dlMcsTable;
        let ulMcsTable = ulmsc.substring(1, (ulmsc.length) - 1).split(',');
        // ulMcsTable = ulMcsTable.slice(-(defaultBs.length))
        let dlMcsTable = dlmsc.substring(1, (dlmsc.length) - 1).split(',');
        // dlMcsTable = dlMcsTable.slice(-(defaultBs.length))
        // Candidate
        // tableTitle = ['基站編號','X/Y','功率(dBm)','波束形','上行中心頻率','下行中心頻率','上行頻寬',
        // '下行頻寬','上行子載波間距(kHz)','下行子載波間距(kHz)','上行調變能力','下行調變能力','上行資料串流層數','下行資料串流層數'];
        // tableTitle = ['#','X/Y','dBm','BeamId','UL Freq','DL Freq','UL Bandwidth',
        // 'DL Bandwidth','UL SCS(kHz)','DL SCS(kHz)','UL MCStable','DL MCStable',
        // 'UL MIMOLayer','DL MIMOLayer','bsTxGain','bsNoiseFigure'];
        // 'UL MIMOLayer','DL MIMOLayer','bsNoiseFigure'];
        //tableTitle = ['#', 'X/Y', 'dBm', 'UL Freq', 'DL Freq', 'UL Bandwidth', 'DL Bandwidth', 'UL MCStable', 'DL MCStable',];
        //tableTitle2 = ['#', 'UL SCS(kHz)', 'DL SCS(kHz)', 'UL MIMOLayer', 'DL MIMOLayer', 'bsNoiseFigure', 'Antenna', 'Theta', 'Phi', 'Txgain'];

        tableTitle = ['#',
          'X/Y',
          this.translateService.instant('result.propose.candidateBs.dbm'),
          this.translateService.instant('ulfrequency') + "(MHz)",
          this.translateService.instant('dlfrequency') + "(MHz)",
          this.translateService.instant('uulBandwidth'),
          this.translateService.instant('ddlBandwidth'),
          this.translateService.instant('ulModulationCodScheme'),
          this.translateService.instant('dlModulationCodScheme')];
        tableTitle2 = ['#',
          this.translateService.instant('ulscs') + '(kHz)',
          this.translateService.instant('dlscs') + '(kHz)',
          this.translateService.instant('ulMimolayer'),
          this.translateService.instant('dlMimolayer'),
          this.translateService.instant('noise'),
          this.translateService.instant('antenna.rawdata.ant.name'),
          this.translateService.instant('theta.pdf'),
          this.translateService.instant('phi.pdf'),
          this.translateService.instant('TxGain') + "(dB)"];        
          

        for (let i = 0; i < candidateLen; i++)
        {
          const antObj = JSON.parse(candidateAnt[i]);
          specData.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${this.result['chosenCandidate'][i][0]}/${this.result['chosenCandidate'][i][1]}`,
            `${this.result['candidateBsPower'][i]}`,
            // `${this.result['candidateBeamId'][i]}`,
            `${JSON.parse(this.calculateForm.ulFrequency)[0]}`,
            `${JSON.parse(this.calculateForm.dlFrequency)[0]}`,
            `${JSON.parse(this.calculateForm.ulBandwidth)[0]}`,
            `${JSON.parse(this.calculateForm.dlBandwidth)[0]}`,
            `${ulMcsTable[0]}`,
            `${dlMcsTable[0]}`
          ]);
          let antennaName = "";

          antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[0];
          }
          specData2.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${JSON.parse(this.calculateForm.ulScs)[0]}`,
            `${JSON.parse(this.calculateForm.dlScs)[0]}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[0]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[0]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`
          ]);
        }

        let unsorttxpower = [];
        let unsortbeamid = [];
        let txpower = [];
        let beamid = [];
        if (this.calculateForm.isSimulation)
        {
          txpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
          beamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
        } else
        {
          unsorttxpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
          unsortbeamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
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
        // console.log(defaultBs);
        let defaultLen = defaultBs.length;
        for (let i = 0; i < defaultLen; i++)
        {
          const antObj = JSON.parse(defaultAnt[i]);
          specData.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${JSON.parse(defaultBs[i])[0]}/${JSON.parse(defaultBs[i])[1]}`,
            `${txpower[i]}`,
            // `${beamid[i]}`,
            `${JSON.parse(this.calculateForm.ulFrequency)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlFrequency)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.ulBandwidth)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlBandwidth)[i + this.inputBsList.length]}`,
            `${ulMcsTable[i + this.inputBsList.length]}`,
            `${dlMcsTable[i + this.inputBsList.length]}`
          ]);
          let antennaName = "";

          antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[i + this.inputBsList.length];
          }
          specData2.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${JSON.parse(this.calculateForm.ulScs)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlScs)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[i + this.inputBsList.length]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`
          ]);
        }
      }
    }
    else
    {
      if (this.calculateForm.duplex == 'tdd')
      {

        let candidateLen = this.result['candidateIdx'].length;
        var candidateAnt = [];
        if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt))
        {
          let candidateAntList = this.calculateForm.candidateBsAnt.split('|');
          let candidateindex = this.result['candidateIdx'];
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push(candidateAntList[candidateindex[i]]);
          }
        } else
        {
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push("[1,0,0,0]");
          }
        }
        let ulmsc = this.calculateForm.ulMcsTable;
        let dlmsc = this.calculateForm.dlMcsTable;
        let ulMcsTable = ulmsc.substring(1, (ulmsc.length) - 1).split(',');
        let dlMcsTable = dlmsc.substring(1, (dlmsc.length) - 1).split(',');
        // tableTitle = ['基站編號','功率(dBm)','中心頻率','子載波間距(kHz)','頻寬','上行調變能力',
        // '下行調變能力','上行資料串流層數','下行資料串流層數'];
        tableTitle = ['Bs#', 'dBm', 'Frequency', 'SCS(kHz)', 'Bandwidth', 'UL MCStable', 'DL MCStable'];
        tableTitle2 = ['Bs#', 'UL MIMOLayer', 'DL MIMOLayer', 'bsNoiseFigure'];

        tableTitle = ['Bs#',
          this.translateService.instant('result.propose.candidateBs.dbm'),
          this.translateService.instant('tddfrequency')+"(MHz)",
          this.translateService.instant('subcarrier'),
          this.translateService.instant('tddBandwidth'),
          this.translateService.instant('ulModulationCodScheme'),
          this.translateService.instant('dlModulationCodScheme')];
        tableTitle2 = ['Bs#',
          this.translateService.instant('ulMimolayer'),
          this.translateService.instant('dlMimolayer'),
          this.translateService.instant('noise')];
       
        antTableTitle = ['Ant#',
          this.translateService.instant('antenna.rawdata.ant.name'),
          this.translateService.instant('antenna.type.fullname'),
          this.translateService.instant('manufactor'),
          'X/Y',
          this.translateService.instant('tddfrequency') + "(MHz)",
          this.translateService.instant('theta.pdf'),
          this.translateService.instant('phi.pdf'),
          this.translateService.instant('TxGain') + "(dB)"];
        for (let i = 0; i < candidateLen; i++)
        {
          const antObj = JSON.parse(candidateAnt[i]);
          specData.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${this.result['chosenCandidate'][i][0]}/${this.result['chosenCandidate'][i][1]}`,
            `${this.result['candidateBsPower'][i]}`,
            // `${this.result['candidateBeamId'][i]}`,
            `${JSON.parse(this.calculateForm.frequencyList)[0]}`,
            `${JSON.parse(this.calculateForm.scs)[0]}`,
            `${JSON.parse(this.calculateForm.bandwidth)[0]}`,
            `${ulMcsTable[0]}`,
            `${dlMcsTable[0]}`
          ]);
          let antennaName = "";

          antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[0];
          }
          specData2.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[0]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[0]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`
          ]);
        }
        let unsorttxpower = [];
        let unsortbeamid = [];
        let txpower = 0;
        let beamid = [];
        let bsNoiseFigure = 0;
        


        // tableTitle = ['基站編號','功率(dBm)','中心頻率','子載波間距(kHz)','頻寬','上行調變能力',
        // '下行調變能力','上行資料串流層數','下行資料串流層數'];

        for (let i = 0; i < this.calculateForm.bsList.defaultBs.length; i++)
        {
          //DAS格式
          txpower = this.calculateForm.bsList.defaultBs[i].txPower;
          specData.push([
            `${this.translateService.instant('default')}${i + 1}`,
            //`${this.calculateForm.bsList.defaultBs[i].position[0]}/${this.calculateForm.bsList.defaultBs[i].position[1]}`,
            `${txpower}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.ul.frequency}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.ul.scs}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.ul.bandwidth}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.ul.mcsTable}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.dl.mcsTable}`,
          ]);


          let bsNoiseFigure = this.calculateForm.bsList.defaultBs[i].noiseFigure;

          specData2.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.ul.mimo}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.tddParam.dl.mimo}`,
            `${bsNoiseFigure}`
          ]);

          let antenna = this.calculateForm.bsList.defaultBs[i].antenna;
          let antennaIndex = this.getAntIndexById(antenna[0].antennaID);
          let antennaName = '-';
          let antennaType = '-';
          let antennaManufactor = '-';

          if (antennaIndex != -1)
          {
            antennaName = this.antennaList[antennaIndex]['antennaName'];
            antennaType = this.antennaList[antennaIndex]['antennaType'];
            antennaManufactor = this.antennaList[antennaIndex]['manufactor'];

          }
          

          for (let a = 0; a < antenna.length; a++)
          {
           // antTableTitle = ['Ant#', 'Name', 'Type', 'Manufacturer', 'X/Y', 'Frequency', 'Theta', 'Phi', 'Gain'];

            
            antData.push(
              [
                `${this.translateService.instant('antenna')}${i + 1}.${a + 1}`,
                this.formatValue(`${antennaName}`),
                this.formatValue(`${antennaType}`),
                this.formatValue(`${antennaManufactor}`),
                this.formatValue(`${antenna[a].position[0]}/${antenna[a].position[1]}`),
                this.formatValue(`${antenna[a].ulFrequency}`),
                this.formatValue(`${antenna[a].theta}`),
                this.formatValue(`${antenna[a].phi}`),
                this.formatValue(`${antenna[a].gain}`),
              ]);
          }

        }

       
      }
      else
      {
        let defaultBs = this.calculateForm.defaultBs.split('|');
        // const defaultAnt = this.calculateForm.defaultBsAnt.split('|');
        // const candidateAnt = this.calculateForm.candidateBsAnt.split('|');
        if (defaultBs.length == 1 && defaultBs[0] == '')
        {
          defaultBs = [];
        }
        const defaultBsLen = defaultBs.length;
        var defaultAnt = [];
        // 填舊版無天線功能的欄位
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
        let candidateLen = this.result['candidateIdx'].length;
        var candidateAnt = [];
        if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt))
        {
          let candidateAntList = this.calculateForm.candidateBsAnt.split('|');
          let candidateindex = this.result['candidateIdx'];
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push(candidateAntList[candidateindex[i]]);
          }
        } else
        {
          for (let i = 0; i < candidateLen; i++)
          {
            candidateAnt.push("[1,0,0,0]");
          }
        }
        let ulmsc = this.calculateForm.ulMcsTable;
        let dlmsc = this.calculateForm.dlMcsTable;
        let ulMcsTable = ulmsc.substring(1, (ulmsc.length) - 1).split(',');
        // ulMcsTable = ulMcsTable.slice(-(defaultBs.length))
        let dlMcsTable = dlmsc.substring(1, (dlmsc.length) - 1).split(',');
        // dlMcsTable = dlMcsTable.slice(-(defaultBs.length))
        // Candidate
        // tableTitle = ['基站編號','X/Y','功率(dBm)','波束形','上行中心頻率','下行中心頻率','上行頻寬',
        // '下行頻寬','上行子載波間距(kHz)','下行子載波間距(kHz)','上行調變能力','下行調變能力','上行資料串流層數','下行資料串流層數'];
        // tableTitle = ['#','X/Y','dBm','BeamId','UL Freq','DL Freq','UL Bandwidth',
        // 'DL Bandwidth','UL SCS(kHz)','DL SCS(kHz)','UL MCStable','DL MCStable',
        // 'UL MIMOLayer','DL MIMOLayer','bsTxGain','bsNoiseFigure'];
        // 'UL MIMOLayer','DL MIMOLayer','bsNoiseFigure'];
        /*tableTitle = ['#',
          'X/Y',
          this.translateService.instant('result.propose.candidateBs.dbm'),
          this.translateService.instant('ulfrequency'),
          this.translateService.instant('dlfrequency'),
          this.translateService.instant('uulBandwidth'),
          this.translateService.instant('ddlBandwidth'),
          this.translateService.instant('ddlBandwidth'),
          this.translateService.instant('ulModulationCodScheme'),
          this.translateService.instant('dlModulationCodScheme')];
        tableTitle2 = ['#',
          this.translateService.instant('ulSubcarrier') + "(kHz)",
          this.translateService.instant('dlSubcarrier') + "(kHz)",
          this.translateService.instant('ulMimolayer') + "(kHz)",
          this.translateService.instant('dlMimolayer') + "(kHz)",
          this.translateService.instant('noise'),
          this.translateService.instant('antenna'),
          this.translateService.instant('theta.pdf'),
          this.translateService.instant('phi.pdf'),
          this.translateService.instant('TxGain')];*/
        tableTitle = ['Bs#',
          this.translateService.instant('result.propose.candidateBs.dbm'),
          this.translateService.instant('tddfrequency') + "(MHz)",
          this.translateService.instant('subcarrier'),
          this.translateService.instant('tddBandwidth'),
          this.translateService.instant('ulModulationCodScheme'),
          this.translateService.instant('dlModulationCodScheme')];
        tableTitle2 = ['Bs#',
          this.translateService.instant('ulMimolayer'),
          this.translateService.instant('dlMimolayer'),
          this.translateService.instant('noise')];

        antTableTitle = ['Ant#',
          this.translateService.instant('antenna.rawdata.ant.name'),
          this.translateService.instant('antenna.type.fullname'),
          this.translateService.instant('manufactor'),
          'X/Y',
          this.translateService.instant('tddfrequency') + "(MHz)",
          this.translateService.instant('theta.pdf'),
          this.translateService.instant('phi.pdf'),
          this.translateService.instant('TxGain') + "(dB)"];

        for (let i = 0; i < candidateLen; i++)
        {
          const antObj = JSON.parse(candidateAnt[i]);
          specData.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${this.result['chosenCandidate'][i][0]}/${this.result['chosenCandidate'][i][1]}`,
            `${this.result['candidateBsPower'][i]}`,
            // `${this.result['candidateBeamId'][i]}`,
            `${JSON.parse(this.calculateForm.ulFrequency)[0]}`,
            `${JSON.parse(this.calculateForm.dlFrequency)[0]}`,
            `${JSON.parse(this.calculateForm.ulBandwidth)[0]}`,
            `${JSON.parse(this.calculateForm.dlBandwidth)[0]}`,
            `${ulMcsTable[0]}`,
            `${dlMcsTable[0]}`
          ]);
          let antennaName = "";

          antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[0];
          }
          specData2.push([
            `${this.translateService.instant('candidate')}${this.result['candidateIdx'][i] + 1}`,
            `${JSON.parse(this.calculateForm.ulScs)[0]}`,
            `${JSON.parse(this.calculateForm.dlScs)[0]}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[0]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[0]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`
          ]);
        }

        let unsorttxpower = [];
        let unsortbeamid = [];
        let txpower = [];
        let beamid = [];
        /*if (this.calculateForm.isSimulation)
        {
          txpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
          beamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
        } else
        {
          unsorttxpower = JSON.parse(JSON.stringify(this.result['defaultBsPower']));
          unsortbeamid = JSON.parse(JSON.stringify(this.result['defaultBeamId']));
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
        // console.log(defaultBs);
        let defaultLen = defaultBs.length;
        for (let i = 0; i < defaultLen; i++)
        {
          const antObj = JSON.parse(defaultAnt[i]);
          specData.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${JSON.parse(defaultBs[i])[0]}/${JSON.parse(defaultBs[i])[1]}`,
            `${txpower[i]}`,
            // `${beamid[i]}`,
            `${JSON.parse(this.calculateForm.ulFrequency)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlFrequency)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.ulBandwidth)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlBandwidth)[i + this.inputBsList.length]}`,
            `${ulMcsTable[i + this.inputBsList.length]}`,
            `${dlMcsTable[i + this.inputBsList.length]}`
          ]);
          let antennaName = "";
          if (this.authService.lang == 'zh-TW')
          {
            antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['chinese_name'];
          } else
          {
            antennaName = this.antennaList[this.AntennaIdToIndex[antObj[0]]]['antennaName'];
          }
          let bsNoiseFigure = 0;
          if (this.calculateForm.bsNoiseFigure != "")
          {
            bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[i + this.inputBsList.length];
          }
          specData2.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${JSON.parse(this.calculateForm.ulScs)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlScs)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.ulMimoLayer)[i + this.inputBsList.length]}`,
            `${JSON.parse(this.calculateForm.dlMimoLayer)[i + this.inputBsList.length]}`,
            `${bsNoiseFigure}`,
            `${antennaName}`,
            `${antObj[1]}`,
            `${antObj[2]}`,
            `${antObj[3]}`
          ]);
        }*/
        for (let i = 0; i < this.calculateForm.bsList.defaultBs.length; i++)
        {
          //DAS格式
          txpower = this.calculateForm.bsList.defaultBs[i].txPower;
          specData.push([
            `${this.translateService.instant('default')}${i + 1}`,
            //`${this.calculateForm.bsList.defaultBs[i].position[0]}/${this.calculateForm.bsList.defaultBs[i].position[1]}`,
            `${txpower}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.ul.frequency}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.ul.scs}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.ul.bandwidth}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.ul.mcsTable}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.dl.mcsTable}`,
          ]);


          let bsNoiseFigure = this.calculateForm.bsList.defaultBs[i].noiseFigure;

          specData2.push([
            `${this.translateService.instant('default')}${i + 1}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.ul.mimo}`,
            `${this.calculateForm.bsList.defaultBs[i].duplex.fddParam.dl.mimo}`,
            `${bsNoiseFigure}`
          ]);

          let antenna = this.calculateForm.bsList.defaultBs[i].antenna;
          let antennaIndex = this.getAntIndexById(antenna[0].antennaID);
          let antennaName = '-';
          let antennaType = '-';
          let antennaManufactor = '-';

          if (antennaIndex != -1)
          {
            antennaName = this.antennaList[antennaIndex]['antennaName'];
            antennaType = this.antennaList[antennaIndex]['antennaType'];
            antennaManufactor = this.antennaList[antennaIndex]['manufactor'];

          }


          for (let a = 0; a < antenna.length; a++)
          {
            // antTableTitle = ['Ant#', 'Name', 'Type', 'Manufacturer', 'X/Y', 'Frequency', 'Theta', 'Phi', 'Gain'];


            antData.push(
              [
                `${this.translateService.instant('antenna')}${i + 1}.${a + 1}`,
                this.formatValue(`${antennaName}`),
                this.formatValue(`${antennaType}`),
                this.formatValue(`${antennaManufactor}`),
                this.formatValue(`${antenna[a].position[0]}/${antenna[a].position[1]}`),
                this.formatValue(`${antenna[a].ulFrequency}`),
                this.formatValue(`${antenna[a].theta}`),
                this.formatValue(`${antenna[a].phi}`),
                this.formatValue(`${antenna[a].gain}`),
              ]);
          }

        }
      }
    }

    pdf.autoTable(tableTitle, specData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal', valign: 'middle', halign: 'center', fontSize:8},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: specDataHeader,
      startY: mapHeight+margin+pos,
      halign: 'center'
    });
    pdf.autoTable(tableTitle2, specData2, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal', valign: 'middle', halign: 'center', fontSize: 8 },
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold' },
      beforePageContent: specDataHeader,
      startY: pdf.autoTable.previous.finalY + 4,
      halign: 'center'
    });
    pdf.autoTable(antTableTitle, antData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal', valign: 'middle', halign: 'center', fontSize: 8 },
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold' },
      beforePageContent: specDataHeader,
      startY: pdf.autoTable.previous.finalY + 4,
      halign: 'center'
    });
    
    // pos = 10;
    // Heatmap ----------------------------------------------------------------------------------------
    let i = 0;
    for (const id of list) {
      pos = 10;
      pdf.addPage();
      // console.log(id);
      pdf.setFontSize(17);
      pdf.text(14, pos, `${this.translateService.instant('pdf.signalCoverage')} - ${this.translateService.instant('altitude.setting')}:${this.zValues[Math.floor(i)]}${this.translateService.instant('meter')}`);
      i+=0.5;
      pos += 2;
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      if (data.querySelector('#is_quality') != null) {
        // console.log(data.querySelector('#is_quality'));
        // 訊號品質圖等待轉png
        await this.sleep(1500);
      }
      if (data.querySelector('#is_strength') != null) {
        // 訊號強度圖等待轉png
        await this.sleep(1500);
      }
      if (data.querySelector('#is_cover') != null) {
        // 訊號覆蓋圖等待轉png
        await this.sleep(1500);
      }
      if (data.querySelector('#is_ulThroughputMap') != null) {
        // 上行傳輸速率圖等待轉png
        await this.sleep(1500);
      }
      if (data.querySelector('#is_dlThroughputMap') != null) {
        // 下行傳輸速率圖等待轉png
        await this.sleep(1500);
      }
      // console.log(data);
      await html2canvas(data, {
        useCORS: true,
        // allowTaint: true,
      }).then(canvas => {
        // console.log(canvas);
        // Few necessary setting options
        // const imgWidth = 182;
        const imgWidth = 150;
        let imgHeight = canvas.height * imgWidth / canvas.width;
        if (imgHeight > 260) {
          imgHeight = 260;
        }
        // console.log(canvas.height);
        // console.log(canvas.width);
        const contentDataURL = canvas.toDataURL('image/png');
        // const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, pos, imgWidth, imgHeight, undefined, 'FAST');
        // console.log(id);
      });
    }

    

    // // 建議方案
    // if (this.inputBsList.length > 0) {
    //   pdf.addPage();
    //   const proposeData = <HTMLDivElement> area.querySelector(`#propose`);
    //   await html2canvas(proposeData, {
    //     useCORS: true,
    //     // allowTaint: true,
    //   }).then(canvas => {
    //     console.log('propose to img');
    //     // Few necessary setting options
    //     const imgWidth = 182;
    //     const imgHeight = canvas.height * imgWidth / canvas.width;
    //     const contentDataURL = canvas.toDataURL('image/png');
    //     const position = 10;
    //     pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
    //   });
    // }

    

    //新增performance頁面
    pdf.addPage();
    pos = 10;
    pdf.setFontSize(17);
    pdf.text(14, pos, this.translateService.instant('pdf.fieldAnalysis'));
    pos += margin;
    //場域平均，切面高度----------------------------------------------------------------------------------
    const performanceHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, pos, 182, 7, 'F'); // y=7
      pdf.text(this.translateService.instant('result.performance.field'), 90, pos+5); //y=12
    };
    const p1Title = [
      this.translateService.instant('result.img.section'),
      this.translateService.instant('coverage.calculate.default'),
      this.translateService.instant('result.coverage.usersrp') + this.rsrpTh + 'dBm\n' + this.translateService.instant('result.coverage.calculate'),
      this.translateService.instant('result.coverage.usesinr') + this.sinrTh + 'dB\n' +this.translateService.instant('result.coverage.calculate'),
      this.translateService.instant('result.averageSinr'),
      this.translateService.instant('result.averageRsrp'),
      ''
    ];

    for (let i = 0; i < this.zValues.length; i++) {
      // this.zCoverageRsrp.push(0);
      for (let j = 0; j < this.result['rsrpMap'].length; j++) {
        for (let k = 0; k < this.result['rsrpMap'][0].length; k++) {
          if (this.result['rsrpMap'][j][k][i] > this.rsrpTh) {
            this.zCoverageRsrp[i]++;
          }
        }
      }
    }
    for (let i = 0; i < this.zValues.length; i++) {
      // this.zCoverageRsrp.push(0);
      for (let j = 0; j < this.result['sinrMap'].length; j++) {
        for (let k = 0; k < this.result['sinrMap'][0].length; k++) {
          if (this.result['sinrMap'][j][k][i] > this.sinrTh) {
            this.zCoverageSinr[i]++;
          }
        }
      }
    }
    this.zCoverageRsrp = this.zCoverageRsrp.map(el => (el / (this.result['rsrpMap'].length * this.result['rsrpMap'][0].length) * 100));
    this.zCoverageSinr = this.zCoverageSinr.map(el => (el / (this.result['sinrMap'].length * this.result['sinrMap'][0].length) * 100));
    
    

    let p1Data = [];
    for (let k = 0; k < this.zValues.length; k++) {
      p1Data.push([
        `${this.zValues[k]}m`,
        `${this.result['layeredCoverage'][k]}%`,
        `${this.zCoverageRsrp[k].toFixed(2)}dBm`,
        `${this.zCoverageSinr[k].toFixed(2)}dB`,
        `${Math.round(this.result['layeredAverageSinr'][k] * 1000) / 1000}dB`,
        `${Math.round(this.result['layeredAverageRsrp'][k] * 1000) / 1000}dBm`
      ]);

      this.avgCoverageRsrp += Number(this.zCoverageRsrp[k]);
      this.avgCoverageSinr += Number(this.zCoverageSinr[k]);

    }
    console.log("rsrpavg = " + this.avgCoverageRsrp);
    console.log("sinravg = " + this.avgCoverageSinr);
    this.avgCoverageRsrp = this.avgCoverageRsrp / this.zValues.length;
    this.avgCoverageSinr = this.avgCoverageSinr / this.zValues.length;
    console.log("rsrpavg = " + this.avgCoverageRsrp);
    console.log("sinravg = " + this.avgCoverageSinr);

    p1Data.push([
      this.translateService.instant('result.average'),
      this.result['coverage'] + '%',
      this.avgCoverageRsrp.toFixed(2) + 'dBm',
      this.avgCoverageSinr.toFixed(2) + 'dB',
      `${Number(this.result['averageSinr'])}dB`,
      `${Number(this.result['averageRsrp'])}dBm`
    ]);
    
    pdf.autoTable(p1Title, p1Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: performanceHeader,
      startY: pos+7,
      
    });

    //UE平均效能分析*****************************************************************************
    // const performanceHeader3 = (data) => {
    //   pdf.setFontSize(12);
    //   pdf.setTextColor(255);
    //   pdf.setFontStyle('normal');
    //   pdf.setFillColor(42, 58, 93);
    //   // pdf.rect(14, 100, 182, 7, 'F');
    //   pdf.rect(14, 53, 182, 7, 'F');
    //   pdf.text(this.translateService.instant('result.performance.ue'), 90, 58);
    //   // pdf.text(this.translateService.instant('result.performance.ue'), 90, 105);
    // };
    pdf.autoTable([this.translateService.instant('result.performance.ue')], [], {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 },
      headerStyles: {
        cellPadding: 1,
        lineWidth: 0,
        fontSize: 12,
        valign: 'bottom',
        halign: 'center',
        fillColor: [42, 58, 93],
        textColor: [255, 255, 255],
      }
    });

    const p3Title = [
      this.translateService.instant('ue.corver'),
      this.translateService.instant('ue.quality'),
      this.translateService.instant('ue.strength'),
      // this.translateService.instant('ue.throughput')
    ];
    let p3Data;
    if (!this.isEmpty(this.calculateForm.ueCoordinate)) {
      p3Data = [[
        this.result['ueCoverage'].toString()+'%', `${Math.round(this.result['ueAverageSinr'] * 1000) / 1000}db`,
        `${Math.round(this.result['ueAverageRsrp'] * 1000) / 1000}dBm`
        // `${Math.round(this.result['ueAverageRsrp'] * 1000) / 1000} `, `${Math.round(this.result['ueThroughput'] * 1000) / 1000} `
      ]];
    } else {
      p3Data = [[
        `-`, `-`, `-`, `-`
      ]];
    }
    pdf.autoTable(p3Title, p3Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 },
      startY: pdf.autoTable.previous.finalY
      // beforePageContent: performanceHeader3
    });

    //基地台效能分析-----------------------------------------------------------------------------------------
    // const performanceHeader2 = (data) => {
    //   pdf.setFontSize(12);
    //   pdf.setTextColor(255);
    //   pdf.setFontStyle('normal');
    //   pdf.setFillColor(42, 58, 93);
    //   pdf.rect(14, 75, 182, 7, 'F');
    //   pdf.text(this.translateService.instant('result.performance.bs'), 90, 80);
    // };
    pdf.autoTable([this.translateService.instant('result.performance.bs')], [], {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 },
      headerStyles: {
        cellPadding: 1,
        lineWidth: 0,
        fontSize: 12,
        valign: 'bottom',
        halign: 'center',
        fillColor: [42, 58, 93],
        textColor: [255, 255, 255],
      }
    });

    const p2Title = [
      this.translateService.instant('result.propose.bs.num'),
      this.translateService.instant('result.bs.per.ue'),
      this.translateService.instant('result.bs.all.uedltpt'),
      this.translateService.instant('result.bs.all.ueultpt'),
      this.translateService.instant('result.bs.avg.uedltpt'),
      this.translateService.instant('result.bs.avg.ueultpt'),
    ];
    let p2Data = [];
    
    if (!this.isEmpty(this.calculateForm.ueCoordinate)) {
      if (this.isHst) {
        let candidateNum = 0;
        if (this.calculateForm.candidateBs.includes('|')) {
          candidateNum = this.calculateForm.candidateBs.split('|').length;
        } else {
          if (this.calculateForm.candidateBs != '') {candidateNum = 1;}
        }
        let choseCand = this.result['candidateIdx'].sort(function(a, b){return a - b});
        console.log(candidateNum);
        // console.log(choseCand);
        let k = 0;
        for (let i = 0;i < candidateNum; i++) {
          if (choseCand[k] != i) {
            continue;
          } else {
            k++
          }
          if (this.result['ueCon_perBsUeConnection'][i] == 0) {
            p2Data.push([
              `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
              0,
              0,
              0,
              0,
              0,
            ]);
          } else {
            p2Data.push([
              `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
              this.result['ueCon_perBsUeConnection'][i],
              `${this.financial(this.result['ueTpt_dlTptIndividualBs'][i])} Mbps`,
              `${this.financial(this.result['ueTpt_ulTptIndividualBs'][i])} Mbps`,
              `${this.financial(this.result['ueTpt_dlTptIndividualBs'][i]/this.result['ueCon_perBsUeConnection'][i])} Mbps`,
              `${this.financial(this.result['ueTpt_ulTptIndividualBs'][i]/this.result['ueCon_perBsUeConnection'][i])} Mbps`,
            ]);
          }
        }
        for (let i = 0;i < this.defaultBs.length; i++) {
          if (this.result['ueCon_perBsUeConnection'][i+candidateNum] == 0) {
            p2Data.push([
              `${this.translateService.instant('result.propose.defaultBs')}${i+1}`,
              0 + ' Mbps',
              0 + ' Mbps',
              0 + ' Mbps',
              0 + ' Mbps',
              0 + ' Mbps',
            ]);
          } else {
            p2Data.push([
              `${this.translateService.instant('result.propose.defaultBs')}${i+1}`,
              this.result['ueCon_perBsUeConnection'][i+candidateNum],
              `${this.financial(this.result['ueTpt_dlTptIndividualBs'][i+candidateNum])} Mbps`,
              `${this.financial(this.result['ueTpt_ulTptIndividualBs'][i+candidateNum])} Mbps`,
              `${this.financial(this.result['ueTpt_dlTptIndividualBs'][i+candidateNum]/this.result['ueCon_perBsUeConnection'][i+candidateNum])} Mbps`,
              `${this.financial(this.result['ueTpt_ulTptIndividualBs'][i+candidateNum]/this.result['ueCon_perBsUeConnection'][i+candidateNum])} Mbps`,
            ]);
          }
        }
      } else {
        let candidateNum = 0;
        // console.log(this.calculateForm.candidateBs);
        if (this.calculateForm.candidateBs.includes('|')) {
          candidateNum = this.calculateForm.candidateBs.split('|').length;
        } else {
          if (this.calculateForm.candidateBs != '') {candidateNum = 1;}
        }
        // console.log(candidateNum);
        let choseCand = this.result['candidateIdx'].sort(function(a, b){return a - b});
        let k = 0;
        for (let i = 0;i < candidateNum; i++) {
          if (choseCand[k] != i) {
            continue;
          } else {
            k++
          }
          if (this.result['ueCon']['perBsUeConnection'][i] == 0) {
            p2Data.push([
              `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
              0,
              0,
              0,
              0,
              0,
            ]);
          } else {
            p2Data.push([
              `${this.translateService.instant('result.propose.candidateBs')}${i+1}`,
              this.result['ueCon']['perBsUeConnection'][i],
              `${this.financial(this.result['ueTpt']['dlTptIndividualBs'][i])} Mbps`,
              `${this.financial(this.result['ueTpt']['ulTptIndividualBs'][i])} Mbps`,
              `${this.financial(this.result['ueTpt']['dlTptIndividualBs'][i]/this.result['ueCon']['perBsUeConnection'][i])} Mbps`,
              `${this.financial(this.result['ueTpt']['ulTptIndividualBs'][i]/this.result['ueCon']['perBsUeConnection'][i])} Mbps`,
            ]);
            // console.log(Number(this.result['ueTpt']['dlTptIndividualBs'][i]));
            // console.log(Number(this.result['ueCon']['perBsUeConnection'][i]));
          }
        }
        // console.log(this.result['defaultBeamId']);
        for (let i = 0;i < this.result['defaultBeamId'].length; i++) {
          if (this.result['ueCon']['perBsUeConnection'][i+candidateNum] == 0) {
            p2Data.push([
              `${this.translateService.instant('result.propose.defaultBs')}${i+1}`,
              0,
              0,
              0,
              0,
              0,
            ]);
          } else {
            p2Data.push([
              `${this.translateService.instant('result.propose.defaultBs')}${i+1}`,
              this.result['ueCon']['perBsUeConnection'][i+candidateNum],
              `${this.financial(this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum])} Mbps`,
              `${this.financial(this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum])} Mbps`,
              `${this.financial(this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum]/this.result['ueCon']['perBsUeConnection'][i+candidateNum])} Mbps`,
              `${this.financial(this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum]/this.result['ueCon']['perBsUeConnection'][i+candidateNum])} Mbps`,
            ]);
          }
        }
      }
      let ueNum = 0;
      let fieldTotalDlTpt = 0;
      let fieldTotalUlTpt = 0;
      for (let i = 0;i < p2Data.length;i++) {
        // console.log();
        // console.log();
        ueNum += Number(p2Data[i][1]);
        if (typeof p2Data[i][2] == 'string') {
          fieldTotalDlTpt += Number(p2Data[i][2].split(' ')[0]);
          fieldTotalUlTpt += Number(p2Data[i][3].split(' ')[0]);
        } else {
          fieldTotalDlTpt += Number(p2Data[i][2]);
          fieldTotalUlTpt += Number(p2Data[i][3]);
        }
        
      }
      p2Data.push([
        this.translateService.instant('pdf.totalInField'),
        ueNum,
        `${this.financial(fieldTotalDlTpt)} Mbps`,
        `${this.financial(fieldTotalUlTpt)} Mbps`,
        `-`,
        `-`,
      ]);
    } else {
      p2Data = [[
        `-`, `-`, `-`, `-`, `-`, `-`
      ]];
    }
    
    pdf.autoTable(p2Title, p2Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 },
      startY: pdf.autoTable.previous.finalY
    });
    

    // 統計資訊
    pos = 10;
    // this.statistics.showTitle = false;
    // pdf.setFontSize(17);
    const statisticsList = ['statistics'];
    for (const id of statisticsList) {
      pdf.addPage();
      pdf.text(14, pos, this.translateService.instant('pdf.statistic'));
      pos += margin;
      pdf.page++;
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      // await this.sleep(1500);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 182;
        const imgHeight = 260;
        const contentDataURL = canvas.toDataURL('image/png');
        // const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, pos, imgWidth, imgHeight, undefined, 'FAST');
        // this.statistics.showTitle = true;
      });
    }

    // 現有基站
    pdf.addPage();
    pos = 10;
    pdf.text(17, pos, this.translateService.instant('pdf.info.defaultBs'));
    pos += margin;
    const defaultBsTitle = [
      this.translateService.instant('result.num'), 
      this.translateService.instant('result.propose.candidateBs.x'),
      this.translateService.instant('result.propose.candidateBs.y'),
      this.translateService.instant('result.propose.candidateBs.z'),
    ];
    const defaultBsHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      // pdf.setFillColor(42, 58, 93);
      // pdf.rect(14, pos, 182, 7, 'F'); //7
      // pdf.text(this.translateService.instant('defaultBs'), 100, pos+5); //12
    };
    const defaultBsData = [];
    for (let k = 0; k < this.defaultBs.length; k++) {
      defaultBsData.push([
        (k + 1), this.defaultBs[k][0], this.defaultBs[k][1], this.defaultBs[k][2]
      ]);
    }
    if (this.defaultBs.length === 0) {
      defaultBsData.push([{ content: this.translateService.instant('result.no.defaultBs'), colSpan: 4, styles: { halign: 'center' } }]);
    }
    pdf.autoTable(defaultBsTitle, defaultBsData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: defaultBsHeader,
      // startY: pdf.autoTable.previous.finalY,
      startY: pos,
      halign: 'center'
    });
    // 新增基站
    if (this.inputBsList.length > 0) {
      pdf.addPage();
      pos = 10;
      pdf.text(14, pos, this.translateService.instant('pdf.info.candidate'));
      pos += margin;
      const candidateHeader = (data) => {
        pdf.setFontSize(12);
        pdf.setTextColor(255);
        pdf.setFontStyle('normal');
        // pdf.setFillColor(42, 58, 93);
        // pdf.rect(14, pos, 182, 7, 'F');
        // pdf.text(this.translateService.instant('candidateBs'), 100, pos+5);
      };
      const candidateTitle = [
        this.translateService.instant('result.num'), 
        this.translateService.instant('result.propose.candidateBs.x'),
        this.translateService.instant('result.propose.candidateBs.y'),
        this.translateService.instant('result.propose.candidateBs.z'),
      ];
      const candidateData = [];
      for (let k = 0; k < this.inputBsList.length; k++) {
        candidateData.push([
          (k + 1), this.inputBsList[k][0], this.inputBsList[k][1], this.inputBsList[k][2]
        ]);
      }
      pdf.autoTable(candidateTitle, candidateData, {
        styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
        headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
        beforePageContent: candidateHeader,
        startY: pos,
      });
    }
    
    // 障礙物資訊
    pdf.addPage();
    pos = 10;
    pdf.text(14, pos, this.translateService.instant('pdf.obstacle.Info'));
    pos += margin;
    const obstacleHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      // pdf.setFillColor(42, 58, 93);
      // pdf.rect(14, pos, 182, 7, 'F');
      // pdf.text(this.translateService.instant('planning.obstacleInfo'), 100, pos+5);
    };
    const obstacleTitle = [
      this.translateService.instant('result.num'),
      this.translateService.instant('result.propose.candidateBs.x'),
      this.translateService.instant('result.propose.candidateBs.y'),
      this.translateService.instant('rotate'),
      this.translateService.instant('altitude.start'),
      `${this.translateService.instant('altitude.obstacle')}(${this.translateService.instant('meter')})`,
      `${this.translateService.instant('result.pdf.width')}(${this.translateService.instant('meter')})`,
      `${this.translateService.instant('result.pdf.height')}(${this.translateService.instant('meter')})`,
      this.translateService.instant('material')
    ];
    const obstacleData = [];
    for (let k = 0; k < this.obstacleList.length; k++) {
      const item = this.obstacleList[k];
      // console.log("-----item------",item);
      obstacleData.push([(k + 1), item.x, item.y, item.rotate, item.z, item.altitude, item.width, item.height, item.materialName]);
    }
    pdf.autoTable(obstacleTitle, obstacleData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: obstacleHeader,
      startY: pos,
    });
    // 行動終端分佈 ----------------------------------------------------------------------------------------------------
    pdf.addPage();
    pos = 10;
    pdf.text(14, pos, this.translateService.instant('pdf.ue.info'));
    pos += margin;
    pdf.page++;
    const ueHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      // pdf.setFillColor(42, 58, 93);
      // pdf.rect(14, pos, 182, 7, 'F');
      // pdf.text(this.translateService.instant('result.pdf.ue'), 100, pos+5);
    };
    const ueTitle = [
      this.translateService.instant('result.num'), 
      this.translateService.instant('result.propose.candidateBs.x'),
      this.translateService.instant('result.propose.candidateBs.y'),
      this.translateService.instant('result.propose.candidateBs.z'),
      this.translateService.instant('pdf.rsrp'),
      this.translateService.instant('pdf.sinr'),
      this.translateService.instant('dl.throughput'),
      this.translateService.instant('ul.throughput'),
      this.translateService.instant('RxGain'),            
    ];
    const ueData = [];
    let uedlTpt = [];
    let ueulTpt = [];
    let ueConInfo = [];
    if (this.isHst) {
      uedlTpt = this.result['ueTpt_dlTptIndividualUe'];
      ueulTpt = this.result['ueTpt_ulTptIndividualUe'];
      ueConInfo = this.result['ueCon_perUeConnectionInfo'];
      // console.log(uedlTpt);
      // console.log(ueulTpt);
    } else {
      uedlTpt = this.result['ueTpt']['dlTptIndividualUe'];
      ueulTpt = this.result['ueTpt']['ulTptIndividualUe'];
      ueConInfo = this.result['ueCon']['perUeConnectionInfo'];
      // console.log(uedlTpt);
      // console.log(ueulTpt);
    }
    // for (let k = 0; k < this.ueList.length; k++) {
    //   if (typeof this.result['ueRsrp'] === 'undefined') {
    //     continue;
    //   }
    //   ueData.push([
    //     (k + 1), this.ueList[k][0], this.ueList[k][1], this.ueList[k][2]
    //     , `${this.financial(this.result['ueRsrp'][k])} dBm`
    //     , `${this.financial(this.result['ueSinr'][k])} dB`
    //     , `${this.financial(uedlTpt[k])} Mbps`
    //     , `${this.financial(ueulTpt[k])} Mbps`
    //   ]);
    // }
    let candidateLen = this.result['candidateIdx'].length;

    if (this.ueList.length != 0)
    {
      for (let i = 0; i < candidateLen; i++)
      {
        ueData.push([
          `${this.translateService.instant('result.propose.candidateBs')}${this.result['candidateIdx'][i] + 1}`]);


        for (let k = 0; k < this.ueList.length; k++)
        {
          if (ueConInfo[k] == this.result['candidateIdx'][i])
          {
            let ueRxGain = 0;
            if (this.calculateForm.ueRxGain != "")
            {
              ueRxGain = JSON.parse(this.calculateForm.ueRxGain)[k]
            }
            ueData.push([
              this.formatValue(`${k + 1}`),
              this.formatValue(this.ueList[k][0]),
              this.formatValue(this.ueList[k][1]),
              this.formatValue(this.ueList[k][2]),
              this.formatValue(`${this.financial(this.result['ueRsrp'][k])} dBm`),
              this.formatValue(`${this.financial(this.result['ueSinr'][k])} dB`),
              this.formatValue(`${this.financial(uedlTpt[k])} Mbps`),
              this.formatValue(`${this.financial(ueulTpt[k])} Mbps`),
              this.formatValue(`${ueRxGain} dB`)
            ]);
          }
        }
      }
      let defaultLen = defaultBs.length;

      for (let i = 0; i < defaultLen; i++)
      {
        ueData.push([`${this.translateService.instant('result.propose.defaultBs')}${i + 1}`]);


        for (let k = 0; k < this.ueList.length; k++)
        {
          if (ueConInfo[k] == i + this.inputBsList.length)
          {
            let ueRxGain = 0;
            if (this.calculateForm.ueRxGain != "")
            {
              ueRxGain = JSON.parse(this.calculateForm.ueRxGain)[k]
            }
            ueData.push([
              this.formatValue(`${k + 1}`),
              this.formatValue(this.ueList[k][0]),
              this.formatValue(this.ueList[k][1]),
              this.formatValue(this.ueList[k][2]),
              this.formatValue(`${this.financial(this.result['ueRsrp'][k])} dBm`),
              this.formatValue(`${this.financial(this.result['ueSinr'][k])} dB`),
              this.formatValue(`${this.financial(uedlTpt[k])} Mbps`),
              this.formatValue(`${this.financial(ueulTpt[k])} Mbps`),
              this.formatValue(`${ueRxGain} dB`)
            ]);
          }
        }
      }
    }
    // console.log(ueData);
    pdf.autoTable(ueTitle, ueData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: ueHeader,
      startY: pos,
    });

    const pageCount = pdf.internal.getNumberOfPages();
    for (let k = 0; k < pageCount; k++) {
      pdf.setFontSize(12);
      pdf.setFontStyle({ font: 'NotoSansCJKtc', fontStyle: 'normal' });
      pdf.setPage(k);
      pdf.text(170, 285, `Page ${pdf.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`);
    }

    document.getElementById('pdf_area').style.display = 'none';
    this.authService.spinnerHide();
    if (this.windowLock != null)
    {
      this.windowLock();
      console.log("unlock");
    }
    pdf.save(`${taskName}_report.pdf`); // Generated PDF

  }

  isEmpty(val) {
    if (val == null || val === 'null' || val === '') {
      return true;
    } else {
      return false;
    }
  }

  async sleep(time: number): Promise<void>{
    return new Promise<void>((res, rej) => {
        setTimeout(res, time);
    });
  }

  async checkSiteMap() {
    let elm;
    this.sitePlanningMap.forEach(element => {
      elm = element;
    });

    if (!elm.drawDown) {
      console.log('recheck');
      await this.sleep(500);
      return this.checkSiteMap();
    } else {
      console.log('site map done');
      return true;
    }
  }
  async getAntennaList() {
    let url_Ant = `${this.authService.API_URL}/getAntenna/${this.authService.userToken}`;
    this.http.get(url_Ant).subscribe(
      res => {
        let result = res;
        this.antennaList = Object.values(result);
        for (let i = 0;i < this.antennaList.length;i++) {
          let id = this.antennaList[i]['antennaID'];
          this.AntennaIdToIndex[id]=i;
        }
        return result;
      },err => {
        console.log(err);
      }
    );
  }
  async getObstacleList() {
    let url_obs = `${this.authService.API_URL}/getObstacle/${this.authService.userToken}`;
    let result;
    this.materialIdToIndex = {};
    this.http.get(url_obs).subscribe(
      res => {
        result = res;
        this.materialList = Object.values(result);
        for (let i = 0;i < this.materialList.length;i++) {
          let id = this.materialList[i]['id'];
          this.materialIdToIndex[id]=i;
        }
        // console.log(result);
      },
      err => {
        console.log(err);
      }
    );
    return result;
  }

  async getPathLossModelList() {
    let url_plm = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
    let result;
    this.http.get(url_plm).subscribe(
      res => {
        result = res;
        this.pathLossModelList = Object.values(result);
        // console.log("****getPathLossModelList",result);
        // console.log("****getPathLossModelList",this.pathLossModelList);
      },
      err => {
        console.log(err);
      }
    );
    return result;
  }

  floatToString(x) {
    return Number.parseFloat(x).toString().slice(0, 5);
  }

  formatValue(value)
  {
    if (value == null || value == '' || value.length == 0)
      return "-";
    else
      return value;
  }

  getAntIndexById(id)
  {
    for (let a = 0; a < this.antennaList.length; a++)
    {
      if (id == this.antennaList[a].antennaID)
        return a;
    }
    return -1;
  }

  /*fixWindow(fix)
  {
    let body = document.body;
    //const html: HTMLElement = <HTMLElement>document.querySelector('html');
    if (fix)
    {
      //html.addClass("noscroll");
      body.classList.add("noscroll");
    }
    else
    {
      body.classList.remove("noscroll");
      //html.removeClass("noscroll");
    }
  }*/

  lockScroll()
  {
    let body = document.body;
    // 记录了锁定滚动条之前body的属性，以便在解锁后恢复锁定前的样式
    let originBodyOverflow = body.style.overflow;
    let originBodyPaddingRight = body.style.paddingRight;
    let originBodyPaddingBottom = body.style.paddingBottom;
    let originBodyHasLockClass = body.classList.contains('bs-lock-scroll');
    let hasScroll = this.hasScroll();
    let scrollWidth = this.scrollWidth(body);
    // 标记本次是否锁定了页面
    let locked = false;


    if (!originBodyHasLockClass)
    {
      body.classList.add('bs-lock-scroll');
    }
    if (originBodyOverflow != 'hidden')
    {
      body.style.overflow = 'hidden';
      locked = true;
      if (hasScroll.vertical)
      {
        body.style.paddingRight = scrollWidth.vertical + 'px';
      }
      if (hasScroll.horizontal)
      {
        body.style.paddingBottom = scrollWidth.horizontal + 'px';
      }
    }

    // 返回一个解除锁定滚动条的函数
    return function ()
    {
      let body = document.body;
      if (!originBodyHasLockClass)
      {
        body.classList.remove('bs-lock-scroll');
      }
      if (!locked)
      {
        return;
      }
      if (originBodyOverflow)
      {
        body.style.overflow = originBodyOverflow;
      } else
      {
        body.style.overflow = ''; // 移除body上的overflow属性
      }

      if (originBodyPaddingRight && parseFloat(originBodyPaddingRight) !== scrollWidth.vertical)
      {
        body.style.paddingRight = originBodyPaddingRight;
      } else
      {
        body.style.paddingRight = ''; // 移除body上的paddingRight属性
      }

      if (originBodyPaddingBottom && parseFloat(originBodyPaddingBottom) !== scrollWidth.horizontal)
      {
        body.style.paddingBottom = originBodyPaddingBottom;
      } else
      {
        body.style.paddingBottom = ''; // 移除body上的paddingBottom属性
      }
    };
  }

  unlock()
  {
    let body = document.body;
    // 记录了锁定滚动条之前body的属性，以便在解锁后恢复锁定前的样式
    let originBodyOverflow = body.style.overflow;
    let originBodyPaddingRight = body.style.paddingRight;
    let originBodyPaddingBottom = body.style.paddingBottom;
    let originBodyHasLockClass = body.classList.contains('bs-lock-scroll');
    let scrollWidth = this.scrollWidth(body);
    // 标记本次是否锁定了页面
    let locked = false;
    
    if (!originBodyHasLockClass)
    {
      body.classList.remove('bs-lock-scroll');
    }
    if (!locked)
    {
      return;
    }
    if (originBodyOverflow)
    {
      body.style.overflow = originBodyOverflow;
    } else
    {
      body.style.overflow = ''; // 移除body上的overflow属性
    }

    if (originBodyPaddingRight && parseFloat(originBodyPaddingRight) !== scrollWidth.vertical)
    {
      body.style.paddingRight = originBodyPaddingRight;
    } else
    {
      body.style.paddingRight = ''; // 移除body上的paddingRight属性
    }

    if (originBodyPaddingBottom && parseFloat(originBodyPaddingBottom) !== scrollWidth.horizontal)
    {
      body.style.paddingBottom = originBodyPaddingBottom;
    } else
    {
      body.style.paddingBottom = ''; // 移除body上的paddingBottom属性
    }
  }

  /**
   * 获取元素或浏览器滚动条的宽高
   * @param ele dom元素
   * @returns {{horizontal: number, vertical: number}}
   */
  scrollWidth(ele)
  {
    var tempDiv;
    var tempInnerDiv = document.createElement('div');
    var result = {
      vertical: 0,
      horizontal: 0
    };
    tempInnerDiv.style.cssText = 'width: 200px;height: 200px';
    if (!ele || ele.nodeType != 1)
    { // 未传递dom元素则获取浏览器的滚动条
      result.vertical = window.innerWidth - document.documentElement.offsetWidth;
      result.horizontal = window.innerHeight - document.documentElement.clientHeight;
      return result;
    }

    tempDiv = ele.cloneNode(true);
    tempDiv.style.cssText = 'width: 100px;height: 100px;opacity: 0;position:absolute;left: -100px;overflow:auto;';
    tempDiv.appendChild(tempInnerDiv);
    document.body.appendChild(tempDiv);

    result.vertical = tempDiv.offsetWidth - tempDiv.clientWidth;
    result.horizontal = tempDiv.offsetHeight - tempDiv.clientHeight;

    document.body.removeChild(tempDiv);
    tempDiv = tempInnerDiv = null;
    return result;
  }

  /**
  * 判断浏览器或dom元素是否有滚动条
  * @returns {{horizontal: boolean, vertical: boolean}}
  */
  hasScroll()
  {
    return {
      vertical: document.body.scrollHeight > window.innerHeight,
      horizontal: document.body.scrollWidth > window.innerWidth
    };
  }
}
