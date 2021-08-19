import { Component, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ProposeComponent } from '../modules/propose/propose.component';
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
  
  /** 測試用taskId */
  taskId = 'task_sel_365aa925-c004-443c-949d-a2eed2d9dd60_1';
  /** 結果form */
  calculateForm: CalculateForm = new CalculateForm();
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

  /** 建議方案 Component */
  @ViewChild('propose') propose: ProposeComponent;
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
  }

  /**
   * @param taskId
   * @param isHst 歷史紀錄
   */
  async export(taskId, isHst) {
    this.taskId = taskId;
    this.authService.spinnerShow();
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
          if (document.getElementById('pdf_area') != null) {
            document.getElementById('pdf_area').style.display = 'block';
          }
          if (isHst) {
            // 歷史紀錄
            this.isHst = true;
            this.result = this.formService.setHstOutputToResultOutput(res['output']);
            this.result['createTime'] = res['createtime'];
            const form = res;
            delete form['output'];
            this.calculateForm = this.formService.setHstToForm(form);
            this.result['inputWidth'] = this.calculateForm.width;
            this.result['inputHeight'] = this.calculateForm.height;
            console.log(this.calculateForm);
          } else {
            this.isHst = false;
            this.calculateForm = res['input'];
            this.result = res['output'];
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
            // 訊號品質圖
            let index = 0;
            this.quality.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
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
              element.draw(true, this.zValues[index]);
              index++;
            });

            // 上行傳輸速率圖
            index = 0;
            this.ulThroughputMap.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
              index++;
            });

            // 下行傳輸速率圖
            index = 0;
            this.dlThroughputMap.forEach(element => {
              element.calculateForm = this.calculateForm;
              element.result = this.result;
              element.draw(true, this.zValues[index]);
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
                  element.heatmapType = 1;

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
                  element.heatmapType = 2;
      
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
                  element.heatmapType = 3;
      
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
                  element.heatmapType = 4;
      
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

            this.siteInfo.calculateForm = this.calculateForm;
            this.siteInfo.result = this.result;
            window.setTimeout(() => {
              this.siteInfo.inputBsListCount = this.inputBsList.length;
              this.siteInfo.defaultBsCount = this.defaultBs.length;
            }, 0);
            console.log(this.result);
            window.setTimeout(() => {
              this.genericPDF(this.calculateForm.taskName);
            }, 2000);
          }, 0);
        }
      );
    }
  }

  /** export PDF */
  async genericPDF(taskName) {
    this.authService.spinnerShow();
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
    }
    for (let k = 0; k < this.zValues.length; k++) {
      list.push(`signal2_${k}`);
    }
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
    pdf.text(14, pos, `${this.translateService.instant('taskName')}：${this.calculateForm['taskName']}`);
    pos += margin;
    pdf.setFontSize(14);
    pdf.text(14, pos, `${this.translateService.instant('createTime')}：${this.result['createTime']}`);
    pos += margin;
    pdf.text(14, pos, `${this.translateService.instant('result.layered.info')}：`);
    pdf.setFillColor(255, 255, 255);
    pdf.setLineWidth(0.1);
    pdf.rect(14, pos + (margin / 2), 182, 190);
    pos += margin + 5;
    pdf.text(20, pos, `${this.translateService.instant('planning.target')}：`);
    pos += margin;
    if (this.calculateForm.isAverageSinr) {
      pdf.text(leftStart, pos, this.translateService.instant('isAverageSinr'));
      pos += margin;
    }
    if (this.calculateForm.isCoverage) {
      pdf.text(leftStart, pos, this.translateService.instant('isCoverage'));
      pos += margin;
    }
    if (this.calculateForm.isUeAvgSinr) {
      pdf.text(leftStart, pos, this.translateService.instant('isUeAvgSinr'));
      pos += margin;
    }
    if (this.calculateForm.isUeAvgThroughput) {
      pdf.text(leftStart, pos, this.translateService.instant('isUeAvgThroughput'));
      pos += margin;
    }
    if (this.calculateForm.isUeTpByDistance) {
      pdf.text(leftStart, pos, this.translateService.instant('isUeTpByDistance'));
      pos += margin;
    }
    pdf.text(20, pos, `${this.translateService.instant('planning.size')}：`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('result.pdf.width')}： ${this.result['inputWidth']} ${this.translateService.instant('meter')}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('result.pdf.height')}： ${this.result['inputHeight']} ${this.translateService.instant('meter')}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('result.pdf.altitude')}： ${this.calculateForm['altitude']} ${this.translateService.instant('meter')}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('zValue')}： ${this.calculateForm.zValue.replace(new RegExp(',', 'gi'), ', ')} ${this.translateService.instant('meter')}`);
    pos += margin;
    pdf.text(20, pos, `${this.translateService.instant('result.bs.info')}：`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('result.propose.wait_select_1')}： ${this.translateService.instant('result.propose.wait_select_2').replace('{0}', this.inputBsList.length)}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('defaultBs')}： ${this.translateService.instant('result.bs.count').replace('{0}', defaultBsCount)}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('result.dbm.range')}： ${this.calculateForm.powerMinRange} dBm ~ ${this.calculateForm.powerMaxRange} dBm`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('result.beam.range')}： 0 ~ 30`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('bandwidth')}(MHz)： ${this.calculateForm.bandwidth} MHz`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('frequency')}(MHz)： ${this.calculateForm.frequency} MHz`);
    pos += margin;
    pdf.text(20, pos, `${this.translateService.instant('planning.algorithm')}：`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('mctsC')}： ${this.calculateForm.mctsC}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('mctsMimo')}： ${this.calculateForm.mctsMimo}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('mctsTemperature')}： ${this.calculateForm.mctsTemperature}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('mctsTime')}： ${this.calculateForm.mctsTime}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('mctsTestTime')}： ${this.calculateForm.mctsTestTime}`);
    pos += margin;
    pdf.text(leftStart, pos, `${this.translateService.instant('mctsTotalTime')}： ${this.calculateForm.mctsTotalTime}`);

    // 現有基站
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
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, pos + 23, 182, 7, 'F');
      pdf.text(this.translateService.instant('defaultBs'), 100, pos + 28);
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
      startY: pos + 30,
      halign: 'center'
    });
    // 新增基站
    if (this.inputBsList.length > 0) {
      pdf.addPage();
      const candidateHeader = (data) => {
        pdf.setFontSize(12);
        pdf.setTextColor(255);
        pdf.setFontStyle('normal');
        pdf.setFillColor(42, 58, 93);
        pdf.rect(14, 7, 182, 7, 'F');
        pdf.text(this.translateService.instant('candidateBs'), 100, 12);
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
        beforePageContent: candidateHeader
      });
    }
    
    // 障礙物資訊
    pdf.addPage();
    const obstacleHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text(this.translateService.instant('planning.obstacleInfo'), 100, 12);
    };
    const obstacleTitle = [
      this.translateService.instant('result.num'),
      this.translateService.instant('result.propose.candidateBs.x'),
      this.translateService.instant('result.propose.candidateBs.y'),
      `${this.translateService.instant('result.pdf.width')}(${this.translateService.instant('meter')})`,
      `${this.translateService.instant('result.pdf.height')}(${this.translateService.instant('meter')})`,
      `${this.translateService.instant('result.pdf.altitude')}(${this.translateService.instant('meter')})`,
      this.translateService.instant('material')
    ];
    const obstacleData = [];
    for (let k = 0; k < this.obstacleList.length; k++) {
      const item = this.obstacleList[k];
      obstacleData.push([(k + 1), item.x, item.y, item.width, item.height, item.altitude, this.authService.parseMaterial(item.element)]);
    }
    pdf.autoTable(obstacleTitle, obstacleData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: obstacleHeader
    });
    // 行動終端分佈
    pdf.addPage();
    pdf.page++;
    const ueHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text(this.translateService.instant('result.pdf.ue'), 100, 12);
    };
    const ueTitle = [
      this.translateService.instant('result.num'), 
      this.translateService.instant('result.propose.candidateBs.x'),
      this.translateService.instant('result.propose.candidateBs.y'),
      this.translateService.instant('result.propose.candidateBs.z'),
      'RSRP',
      'SINR',
      'DL Throughput',
      'UL Throughput',
    ];
    const ueData = [];
    let uedlTpt = [];
    let ueulTpt = [];
    if (this.isHst) {
      uedlTpt = this.result['ueTpt_dlTptIndividualUe'];
      ueulTpt = this.result['ueTpt_ulTptIndividualUe'];
      console.log(uedlTpt);
      console.log(ueulTpt);
    } else {
      uedlTpt = this.result['ueTpt']['dlTptIndividualUe'];
      ueulTpt = this.result['ueTpt']['ulTptIndividualUe'];
      console.log(uedlTpt);
      console.log(ueulTpt);
    }
    console.log(this.ueList);
    for (let k = 0; k < this.ueList.length; k++) {
      if (typeof this.result['ueRsrp'] === 'undefined') {
        continue;
      }
      // console.log(this.result['uesinr'][k]);
      ueData.push([
        (k + 1), this.ueList[k][0], this.ueList[k][1], this.ueList[k][2]
        , this.result['ueRsrp'][k]
        , this.result['ueSinr'][k]
        , uedlTpt[k]
        , ueulTpt[k]
      ]);
    }
    console.log(ueData);
    pdf.autoTable(ueTitle, ueData, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: ueHeader
    });

    // 建議方案
    if (this.inputBsList.length > 0) {
      pdf.addPage();
      const proposeData = <HTMLDivElement> area.querySelector(`#propose`);
      await html2canvas(proposeData, {
        useCORS: true,
        // allowTaint: true,
      }).then(canvas => {
        console.log('propose to img');
        // Few necessary setting options
        const imgWidth = 182;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
      });
    }

    for (const id of list) {
      pdf.addPage();
      console.log(id);
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      if (data.querySelector('#is_quality') != null) {
        // 訊號品質圖等待轉png
        await this.sleep(1000);
      }
      if (data.querySelector('#is_strength') != null) {
        // 訊號強度圖等待轉png
        await this.sleep(1000);
      }
      if (data.querySelector('#is_ulThroughputMap') != null) {
        // 上行傳輸速率圖等待轉png
        await this.sleep(1000);
      }
      if (data.querySelector('#is_dlThroughputMap') != null) {
        // 下行傳輸速率圖等待轉png
        await this.sleep(1000);
      }
      await html2canvas(data, {
        useCORS: true,
        // allowTaint: true,
      }).then(canvas => {
        // Few necessary setting options
        const imgWidth = 182;
        let imgHeight = canvas.height * imgWidth / canvas.width;
        if (imgHeight > 260) {
          imgHeight = 260;
        }
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
        console.log(id);
      });
    }

    //新增performance頁面
    pdf.addPage();
    //場域平均，切面高度----------------------------------------------------------------------------------
    const performanceHeader = (data) => {
      pdf.setFontSize(12);
      pdf.setTextColor(255);
      pdf.setFontStyle('normal');
      pdf.setFillColor(42, 58, 93);
      pdf.rect(14, 7, 182, 7, 'F');
      pdf.text(this.translateService.instant('result.performance.field'), 90, 12);
    };
    const p1Title = [
      this.translateService.instant('result.img.section'),
      this.translateService.instant('result.coverage'),
      this.translateService.instant('result.averageSinr'),
      this.translateService.instant('result.averageRsrp'),
      ''
    ];

    let p1Data = [];
    for (let k = 0; k < this.zValues.length; k++) {
      p1Data.push([
        `${this.zValues[k]}m`,
        `${this.result['layeredCoverage'][k]}%`,
        `${Math.round(this.result['layeredAverageSinr'][k] * 1000) / 1000}db`,
        `${Math.round(this.result['layeredAverageRsrp'][k] * 1000) / 1000}dBm`
      ]);
    }
    p1Data.push([
      this.translateService.instant('result.average'),
      this.result['coverage']+'%',
      `${Number(this.result['averageSinr'])}db`,
      `${Number(this.result['averageRsrp'])}dBm`
    ]);
    
    pdf.autoTable(p1Title, p1Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      beforePageContent: performanceHeader
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
      this.translateService.instant('result.propose.candidateBs.num'),
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
        console.log(choseCand);
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
              `${this.translateService.instant('result.propose.candidateBs')}${i}`,
              this.result['ueCon_perBsUeConnection'][i],
              this.result['ueTpt_dlTptIndividualBs'][i],
              this.result['ueTpt_ulTptIndividualBs'][i],
              Number(this.result['ueTpt_dlTptIndividualBs'][i])/Number(this.result['ueCon_perBsUeConnection'][i]),
              Number(this.result['ueTpt_ulTptIndividualBs'][i])/Number(this.result['ueCon_perBsUeConnection'][i]),
            ]);
          }
        }
        for (let i = 0;i < this.result['defaultBeamId'].length; i++) {
          if (this.result['ueCon_perBsUeConnection'][i+candidateNum] == 0) {
            p2Data.push([
              `${this.translateService.instant('defaultBs')}${i+1}`,
              0,
              0,
              0,
              0,
              0,
            ]);
          } else {
            p2Data.push([
              `${this.translateService.instant('defaultBs')}${i+candidateNum}`,
              this.result['ueCon_perBsUeConnection'][i+candidateNum],
              this.result['ueTpt_dlTptIndividualBs'][i+candidateNum],
              this.result['ueTpt_ulTptIndividualBs'][i+candidateNum],
              Number(this.result['ueTpt_dlTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon_perBsUeConnection'][i+candidateNum]),
              Number(this.result['ueTpt_ulTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon_perBsUeConnection'][i+candidateNum]),
            ]);
          }
        }
      } else {
        let candidateNum = 0;
        console.log(this.calculateForm.candidateBs);
        if (this.calculateForm.candidateBs.includes('|')) {
          candidateNum = this.calculateForm.candidateBs.split('|').length;
        } else {
          if (this.calculateForm.candidateBs != '') {candidateNum = 1;}
        }
        console.log(candidateNum);
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
              this.result['ueTpt']['dlTptIndividualBs'][i],
              this.result['ueTpt']['ulTptIndividualBs'][i],
              Number(this.result['ueTpt']['dlTptIndividualBs'][i])/Number(this.result['ueCon']['perBsUeConnection'][i]),
              Number(this.result['ueTpt']['ulTptIndividualBs'][i])/Number(this.result['ueCon']['perBsUeConnection'][i]),
            ]);
            // console.log(Number(this.result['ueTpt']['dlTptIndividualBs'][i]));
            // console.log(Number(this.result['ueCon']['perBsUeConnection'][i]));
          }
        }
        // console.log(this.result['defaultBeamId']);
        for (let i = 0;i < this.result['defaultBeamId'].length; i++) {
          if (this.result['ueCon']['perBsUeConnection'][i+candidateNum] == 0) {
            p2Data.push([
              `${this.translateService.instant('defaultBs')}${i+1}`,
              0,
              0,
              0,
              0,
              0,
            ]);
          } else {
            p2Data.push([
              `${this.translateService.instant('defaultBs')}${i+1}`,
              this.result['ueCon']['perBsUeConnection'][i+candidateNum],
              this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum],
              this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum],
              Number(this.result['ueTpt']['dlTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon']['perBsUeConnection'][i+candidateNum]),
              Number(this.result['ueTpt']['ulTptIndividualBs'][i+candidateNum])/Number(this.result['ueCon']['perBsUeConnection'][i+candidateNum]),
            ]);
          }
        }
      }
    }
    
    pdf.autoTable(p2Title, p2Data, {
      styles: { font: 'NotoSansCJKtc', fontStyle: 'normal'},
      headStyles: { font: 'NotoSansCJKtc', fontStyle: 'bold'},
      margin: { top: 0 },
      startY: pdf.autoTable.previous.finalY
    });
    

    // 統計資訊
    const statisticsList = ['statistics'];
    for (const id of statisticsList) {
      pdf.addPage();
      pdf.page++;
      const data = <HTMLDivElement> area.querySelector(`#${id}`);
      await html2canvas(data).then(canvas => {
        // Few necessary setting options
        const imgWidth = 182;
        const imgHeight = 260;
        const contentDataURL = canvas.toDataURL('image/png');
        const position = 10;
        pdf.addImage(contentDataURL, 'PNG', 14, position, imgWidth, imgHeight, undefined, 'FAST');
      });
    }

    const pageCount = pdf.internal.getNumberOfPages();
    for (let k = 0; k < pageCount; k++) {
      pdf.setFontSize(12);
      pdf.setFontStyle({ font: 'NotoSansCJKtc', fontStyle: 'normal' });
      pdf.setPage(k);
      pdf.text(170, 285, `Page ${pdf.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`);
    }

    document.getElementById('pdf_area').style.display = 'none';
    this.authService.spinnerHide();
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

}
