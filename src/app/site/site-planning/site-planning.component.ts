import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, OnChanges } from '@angular/core';
import { OnPinch, OnScale, OnDrag, OnRotate, OnResize, OnWarp, MoveableGroupInterface, BeforeRenderableProps } from 'moveable';
import { Frame } from 'scenejs';
import { NgxMoveableComponent } from 'ngx-moveable';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import * as _ from 'lodash';
import { MatMenuTrigger } from '@angular/material/menu';
import html2canvas from 'html2canvas';
import { AuthService } from '../../service/auth.service';
import { View3dComponent } from '../view3d/view3d.component';
import * as XLSX from 'xlsx';
import { MsgDialogComponent } from '../../utility/msg-dialog/msg-dialog.component';
import { FormService } from '../../service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { ChartService } from '../../service/chart.service';
import { AbsoluteSourceSpan } from '@angular/compiler';

/** Plotly套件引用 */
declare var Plotly: any;

/**
 * 場域規劃頁
 */
@Component({
  selector: 'app-site-planning',
  templateUrl: './site-planning.component.html',
  styleUrls: ['./site-planning.component.scss']
})
export class SitePlanningComponent implements OnInit, OnDestroy, OnChanges {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private formService: FormService,
    private translateService: TranslateService,
    private chartService: ChartService,
    private http: HttpClient) {
    }

  /**
   * NgxMoveableComponent
   */
  @ViewChild('moveable') moveable: NgxMoveableComponent;
  /**
   * MatMenuTrigger
   */
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;
  /**
   * moveable target
   */
  target;
  /**
   * resizable enable
   */
  resizable = true;

  /**
   * Planning mode || Simulation mode
   */
  planOrSim = true;

  /**
   * moveable 設定值
   */
  
  frame = new Frame({
    width: '30px',
    height: '30px',
    left: '0px',
    top: '0px',
    'z-index': 99999,
    transform: {
      rotate: '0deg',
      scaleX: 1,
      scaleY: 1
    }
  });
  /**
   * sidenav 展開/收合
   */
  opened = true;
  /**
   * mat-expansion-panel 展開/收合
   */
  panelOpenState = false;
  /**
   * 正在使用moveable物件
   */
  live = false;
  /** calculate form */
  calculateForm: CalculateForm = new CalculateForm();
  /** upload image src */
  imageSrc;
  /** subitem class */
  subitemClass = {
    obstacle: 'subitem active',
    ue: 'subitem active'
  };
  /** 平面高度 */
  zValues = ['1', '', ''];
  /** 障礙物 */
  obstacleList = [];
  /** 互動物件 */
  dragObject = {};
  /** 基站RF參數 */
  bsListRfParam = {};
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  candidateList = [];
  /** 新增ＵＥ */
  ueList = [];
  /** 比例尺 X軸pixel轉長度公式 */
  xLinear;
  /** 比例尺 Y軸pixel轉寬度公式 */
  yLinear;
  /** 比例尺 X軸長度轉pixel公式 */
  pixelXLinear;
  /** 比例尺 Y軸寬度轉pixel公式 */
  pixelYLinear;
  /** 圖區左邊界 */
  chartLeft = 0;
  /** 圖區右邊界 */
  chartRight = 0;
  /** 圖區上邊界 */
  chartTop = 0;
  /** 圖區下邊界 */
  chartBottom = 0;
  /** 圖寬度 */
  chartHeight = 0;
  /** 互動svg種類 */
  svgMap = {
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
    }
  };
  /** 當下互動物件的id */
  svgId;
  svgNum;
  /** 互動物件的真實id，避免互動時id錯亂用 */
  realId;
  /** 互動物件的tooltip */
  tooltipStr = '';
  /** 4捨5入格式化 */
  roundFormat = Plotly.d3.format('.1f');
  /** 預設無線模型 list */
  pathLossModelIdList = [];
  /** 物件移動範圍 */
  bounds = {
    left: 0,
    top: 0,
    right: 400,
    bottom: 500
  };
  /** ue width */
  ueWidth = 9.5;
  /** ue height */
  ueHeight = 14.5;
  /** candidate width */
  candidateWidth = 28;
  /** candidate height */
  candidateHeight = 18;
  /** 右鍵選單position */
  menuTopLeftStyle = {top: '0', left: '0'};
  /** 障礙物顏色 */
  color;
  /** mouseover target */
  hoverObj;
  /** show image file name */
  showFileName = true;
  /** number型態 column list */
  numColumnList = ['totalRound', 'crossover', 'mutation', 'iteration', 'seed',
    'width', 'height', 'altitude', 'pathLossModelId', 'useUeCoordinate',
    'powerMaxRange', 'powerMinRange', 'beamMaxId', 'beamMinId', 'objectiveIndex',
    'availableNewBsNumber', 'addFixedBsNumber', 'sinrRatio',
    'throughputRatio', 'coverageRatio', 'ueAvgSinrRatio', 'ueAvgThroughputRatio', 'ueTpByDistanceRatio',
    'mctsC', 'mctsMimo', 'ueCoverageRatio', 'ueTpByRsrpRatio',
    'mctsTemperature', 'mctsTime', 'mctsTestTime', 'mctsTotalTime'];

  /** task id */
  taskid = '';
  /** progress interval */
  progressInterval = 0;
  /** 畫圖layout參數 */
  plotLayout;
  /** View 3D dialog config */
  view3dDialogConfig: MatDialogConfig = new MatDialogConfig();
  /** Message dialog config */
  msgDialogConfig: MatDialogConfig = new MatDialogConfig();
  /** tooltip position */
  tooltipStyle = {
    left: '0px',
    top: '0px'
  };
  /** span互動物件 style */
  spanStyle = {};
  /** 方形互動物件 style */
  rectStyle = {};
  /** 圓形互動物件 style */
  ellipseStyle = {};
  /** 三角形互動物件 style */
  polygonStyle = {};
  /** 梯形形互動物件 style */
  trapezoidStyle = {};
  /** svg互動物件 style */
  svgStyle = {};
  /** svg path互動物件 style */
  pathStyle = {};
  /** defaultBs編號 style */
  circleStyle = {};
  /** workbook */
  wb: XLSX.WorkBook;
  /** 互動區域範圍 */
  dragStyle = {};
  /** Wifi頻率 */
  wifiFrequency = '0';
  /** 是否為歷史紀錄 */
  isHst = false;
  /** 互動時的position left */
  currentLeft;
  /** 互動時的position top */
  currentTop;
  /** 避免跑版的暫存sapn style */
  ognSpanStyle;
  /** 1: 以整體場域為主進行規劃, 2: 以行動終端為主進行規劃 3:場域模擬*/
  planningIndex = '3';
  /** 障礙物預設顏色 */
  OBSTACLE_COLOR = '#73805c';
  /** defaultBs預設顏色 */
  DEFAULT_BS_COLOR = '#2958be';
  /** candidate預設顏色 */
  CANDIDATE_COLOR = '#d00a67';
  /** UE預設顏色 */
  UE_COLOR = '#0c9ccc';
  /** history output */
  hstOutput = {};
  /** 子載波間距 */
  subcarrier = 15;
  /** 進度 */
  progressNum = 0;
  /** 進度百分比 time interval */
  pgInterval = 0;
  /** 英文亂數用 */
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  /** 移動前紀錄物件 */
  ognDragObject = {};
  /** 移動過程產生error */
  moveError = false;
  bgdivStyle = {
    width: '0px',
    height: '0px',
    'z-index': '0',
    position: 'absolute',
    top: 0,
    left: 0
  };
  /** 畫圖物件 */
  @ViewChild('chart') chart: ElementRef;
  /** 高度設定燈箱 */
  @ViewChild('materialModal') materialModal: TemplateRef<any>;
  @ViewChild('materialModal2') materialModal2: TemplateRef<any>;
  /** RF設定燈箱 */
  @ViewChild('RfModal') rfModal: TemplateRef<any>;
  @ViewChild('RfModalTable') rfModalTable: TemplateRef<any>;

  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;

  

  //4G 5G WiFi new attribute
  duplexMode = "fdd";
  dlRatio = 70;
  scalingFactor = 1;
  tempCalParamSet = {
    txpower: 0,
    beampattern: 0,
    fddDlFrequency: 2400,
    fddUlFrequency: 2400,
    ulModulationCodScheme: "64QAM-table",
    dlModulationCodScheme: "64QAM-table",
    dlMimoLayer: '1',
    ulMimoLayer: '1',
    tddscs: '15',
    tddbandwidth: 5,
    tddfrequency: 2400,
    dlScs: '15',
    ulScs: '15',
    dlBandwidth: '5',
    ulBandwidth: '5',
    // subcarrier: 15,
    scsBandwidth: 0,
    mimoNumber4G: '1',
    // wifiProtocol: 'wifi4',
    // guardInterval: '400ns',
    // wifiMimo: '1x1',
    // wifiBandwidth: 20
  }

  
  /** click外部取消moveable */
  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (typeof this.target !== 'undefined' && this.target != null) {
      if (this.target.contains(event.target)) {
        this.live = true;
      } else {
        this.live = false;
        try {
          this.moveable.destroy();
        } catch (error) {
          this.moveable.ngOnInit();
          this.moveable.destroy();
        }
      }
    }
  }

  /** delete keyCode 刪除物件 */
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (typeof this.target !== 'undefined') {
      if (this.live) {
        if (event.key === 'Delete') {
          this.live = false;
          this.moveable.destroy();
          const id = this.target.closest('span').id;
          const obj = this.dragObject[id];
          if (obj.type === 'obstacle') {
            this.obstacleList.splice(this.obstacleList.indexOf(id), 1);
          } else if (obj.type === 'defaultBS') {
            this.defaultBSList.splice(this.defaultBSList.indexOf(id), 1);
          } else if (obj.type === 'candidate') {
            this.candidateList.splice(this.candidateList.indexOf(id), 1);
          } else if (obj.type === 'UE') {
            this.ueList.splice(this.ueList.indexOf(id), 1);
          }
        }
      }
    }
  }

  // @Input()
  // duplexMode = "fdd";
  // tempDuplexMode;

  ngOnChanges(changes) {
    console.log(changes);
  }

  ngOnInit() {
    this.view3dDialogConfig.autoFocus = false;
    this.view3dDialogConfig.width = '80%';
    this.view3dDialogConfig.hasBackdrop = false;
    this.msgDialogConfig.autoFocus = false;
    sessionStorage.removeItem('planningObj');

    for (let i = 0; i < 9; i++) {
      this.pathLossModelIdList.push(i);
    }
    // 接收URL參數
    this.route.queryParams.subscribe(params => {
      if (typeof params['taskId'] !== 'undefined') {
        this.taskid = params['taskId'];
        if (params['isHst'] === 'true') {
          this.isHst = true;
        }
      }
    });

    if (sessionStorage.getItem('importFile') != null) {
      // from new-planning import file
      this.calculateForm = new CalculateForm();
      const reader = new FileReader();
      reader.onload = (e) => {
        this.readXls(e.target.result);
      };
      reader.readAsBinaryString(this.dataURLtoBlob(sessionStorage.getItem('importFile')));

      sessionStorage.removeItem('importFile');

    // Not import File
    } else {
      
      if (this.taskid !== '') {
        // 編輯場域
        let url;
        if (this.isHst) {
          // 歷史紀錄
          url = `${this.authService.API_URL}/historyDetail/${this.authService.userId}/`;
          url += `${this.authService.userToken}/${this.taskid}`;
        } else {
          url = `${this.authService.API_URL}/completeCalcResult/${this.taskid}/${this.authService.userToken}`;
        }
        this.http.get(url).subscribe(
          res => {
            if (this.isHst) {
              const result = res;
              console.log(result);
              const output = this.formService.setHstOutputToResultOutput(result['output']);
              // delete result['output'];
              // 大小寫不同，各自塞回form
              // console.log(result);
              // console.log(output);
              this.dlRatio = result['tddframeratio'];
              this.calculateForm = this.formService.setHstToForm(result);
              // this.calculateForm.defaultBs = output['defaultBs'];
              // this.calculateForm.bsList = output['defaultBs'];
              let tempBsNum = 0;
              if (this.calculateForm.defaultBs == "") {
                tempBsNum = 0;
              } else {
                tempBsNum = this.calculateForm.defaultBs.split('|').length;
              }
              this.calculateForm.availableNewBsNumber -= tempBsNum;
              
              
              this.hstOutput['gaResult'] = {};
              this.hstOutput['gaResult']['chosenCandidate'] = output['chosenCandidate'];
              this.hstOutput['gaResult']['sinrMap'] = output['sinrMap'];
              this.hstOutput['gaResult']['connectionMapAll'] = output['connectionMapAll'];
              this.hstOutput['gaResult']['rsrpMap'] = output['rsrpMap'];
              this.hstOutput['gaResult']['ulThroughputMap'] = output['ulThroughputMap'];
              this.hstOutput['gaResult']['dlThroughputMap'] = output['throughputMap'];
              if (this.calculateForm.isSimulation) {
                this.planningIndex = '3';
              } else {
                if (this.calculateForm.isCoverage || this.calculateForm.isAverageSinr) {
                // if (this.calculateForm.isCoverage || this.calculateForm.isAvgThroughput || this.calculateForm.isAverageSinr) {
                  this.planningIndex = '1';
                } else {
                  this.planningIndex = '2';
                }
              }

              const sinrAry = [];
              output['sinrMap'].map(v => {
                v.map(m => {
                  m.map(d => {
                    sinrAry.push(d);
                  });
                });
              });

              const rsrpAry = [];
              output['rsrpMap'].map(v => {
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

            } else {
              console.log(res)
              this.calculateForm = res['input'];

              if (this.calculateForm.isSimulation) {
                this.planningIndex = '3';
              } else {
                if (this.calculateForm.isCoverage || this.calculateForm.isAverageSinr) {
                // if (this.calculateForm.isCoverage || this.calculateForm.isAvgThroughput || this.calculateForm.isAverageSinr) {
                  this.planningIndex = '1';
                } else {
                  this.planningIndex = '2';
                }
              }

              let tempBsNum = 0;
              if (this.calculateForm.defaultBs == "") {
                tempBsNum = 0;
              } else {
                tempBsNum = this.calculateForm.defaultBs.split('|').length;
              }
              this.calculateForm.availableNewBsNumber -= tempBsNum;
              // this.calculateForm = res['input'];
              console.log(this.calculateForm);
              this.calculateForm.defaultBs = this.calculateForm.bsList;
            }
            this.zValues = JSON.parse(this.calculateForm.zValue);
            

            console.log(this.calculateForm);
            if (window.sessionStorage.getItem(`form_${this.taskid}`) != null) {
              // 從暫存取出
              // this.calculateForm = JSON.parse(window.sessionStorage.getItem(`form_${this.taskid}`));
            }
            console.log(this.calculateForm);
            
            this.initData(false, false, false);
          },
          err => {
            this.msgDialogConfig.data = {
              type: 'error',
              infoMessage: '無法取得計算結果!'
            };
            this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          }
        );
      } else {
        // 新增場域 upload image
        this.calculateForm = JSON.parse(sessionStorage.getItem('calculateForm'));

        // 頻寬初始值
        this.changeWifiFrequency();
        if (this.calculateForm.objectiveIndex === '0') {
          // this.calculateForm.bandwidth = '[3]';
        } else if (this.calculateForm.objectiveIndex === '1') {
          // this.calculateForm.bandwidth = '[5]';
        } else if (this.calculateForm.objectiveIndex === '2') {
          // this.calculateForm.bandwidth = '[1]';
        }

        this.initData(false, false, false);
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
  }

  /**
   * 離開頁面
   */
  ngOnDestroy(): void {
    this.setForm();
    // 暫存
    localStorage.clear();
    if (this.taskid !== '') {
      window.sessionStorage.setItem(`form_${this.taskid}`, JSON.stringify(this.calculateForm));
    } else {
      window.sessionStorage.setItem(`form_blank_task`, JSON.stringify(this.calculateForm));
    }
    if (typeof this.progressInterval !== 'undefined') {
      window.clearInterval(this.progressInterval);
      for (let i = 0; i < this.progressInterval; i++) {
        window.clearInterval(i);
      }
    }
    try {
      this.moveable.destroy();
    } catch (error) {}
  }

  /**
   * init Data
   * @param isImportXls 是否import xlxs
   * @param isImportImg 是否import image
   */
  initData(isImportXls, isImportImg, isChangeFieldParam) {
    if (typeof this.chart !== 'undefined') {
      this.chart.nativeElement.style.opacity = 0;
    }
    // Plotly繪圖config
    const defaultPlotlyConfiguration = {
      displaylogo: false,
      showTips: false,
      editable: false,
      scrollZoom: false,
      displayModeBar: false
    };
    // 繪圖layout
    this.plotLayout = {
      autosize: true,
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
      margin: { t: 20, b: 20, l: 40, r: (!this.authService.isEmpty(this.calculateForm.mapImage) ? 20 : 50)}
    };

    if (!this.authService.isEmpty(this.calculateForm.mapImage)) {
      const reader = new FileReader();
      reader.readAsDataURL(this.dataURLtoBlob(this.calculateForm.mapImage));
      reader.onload = (e) => {
        // 背景圖
        this.plotLayout['images'] = [{
          source: reader.result,
          x: 0,
          y: 0,
          sizex: this.calculateForm.width,
          sizey: this.calculateForm.height,
          xref: 'x',
          yref: 'y',
          xanchor: 'left',
          yanchor: 'bottom',
          sizing: 'stretch'
        }];

        // draw background image chart
        Plotly.newPlot('chart', {
          data: [],
          layout: this.plotLayout,
          config: defaultPlotlyConfiguration
        }).then((gd) => {
          
          // 設定圖區的長寬
          const image = new Image();
          image.src = reader.result.toString();
          image.onload = () => {
            console.log(image.width, image.height);
            const maxHeight = window.innerHeight - 140;
            const main = gd.getBoundingClientRect();
            console.log(main.width, main.height, maxHeight);
            let imgWidth = image.width;
            let imgHeight = image.height;
            if (imgHeight > maxHeight) {
              console.log('imgHeight > maxHeight');
              for (let i = 0.99; i >= 0; i -= 0.01) {
                imgHeight = image.height * i;
                imgWidth = image.width * i;
                if (imgHeight <= maxHeight) {
                  break;
                }
              }
            }

            if (imgWidth > main.width) {
              for (let i = 0.99; i >= 0; i -= 0.01) {
                imgHeight = image.height * i;
                imgWidth = image.width * i;
                if (imgWidth <= main.width) {
                  break;
                }
              }
            }

            console.log(imgWidth, imgHeight);
            const layoutOption = {
              width: imgWidth,
              height: imgHeight
            };

            // image放進圖裡後需取得比例尺
            Plotly.relayout('chart', layoutOption).then((gd2) => {
              this.chart.nativeElement.style.opacity = 1;
              const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
              const rect2 = xy2.getBoundingClientRect();
              // drag範圍
              this.bounds = {
                left: rect2.left,
                top: rect2.top,
                right: rect2.right,
                bottom: rect2.top + rect2.height
              };

              // 計算比例尺
              this.calScale(gd2);
              
              if (isImportXls) {
                // import xlsx
                this.setImportData();
              } else if (isImportImg) {
                // do noting
              } else if (this.taskid !== '' || sessionStorage.getItem('form_blank_task') != null) {
                // 編輯
                if (!isChangeFieldParam) {
                  this.edit();
                }
                console.log(this.calculateForm);
              }
            });
          };
        });
      };

    } else {
      if (typeof this.chart !== 'undefined') {
        this.chart.nativeElement.style.opacity = 1;
      }
      this.plotLayout['width'] = window.innerWidth * 0.68;
      // draw background image chart
      Plotly.newPlot('chart', {
        data: [],
        layout: this.plotLayout,
        config: defaultPlotlyConfiguration
      }).then((gd) => {

        // 無image時圖長寬
        const sizes = this.chartService.calSize(this.calculateForm, gd);
        const layoutOption = {
          width: sizes[0],
          height: sizes[1]
        };

        // 重設長寬
        Plotly.relayout('chart', layoutOption).then((gd2) => {
          const xy2: SVGRectElement = gd2.querySelector('.xy').querySelectorAll('rect')[0];
          const rect2 = xy2.getBoundingClientRect();
          // drag範圍
          this.bounds = {
            left: rect2.left,
            top: rect2.top,
            right: rect2.right,
            bottom: rect2.top + rect2.height
          };
  
          // 計算比例尺
          this.calScale(gd2);
          // import xlsx
          if (isImportXls) {
            this.setImportData();
          } else if (isImportImg) {
            // do nothing
          } else if (this.taskid !== '' || sessionStorage.getItem('form_blank_task') != null) {
            // 編輯
            console.log(this.calculateForm);
            if (!isChangeFieldParam) {
              this.edit();
            }
          }
        });

        
      });
    }
  }

  /** 計算比例尺 */
  calScale(gd) {
    const xy: SVGRectElement = gd.querySelector('.xy').querySelectorAll('rect')[0];
    const rect = xy.getBoundingClientRect();
    this.chartLeft = rect.left;
    this.chartRight = rect.right;
    this.chartTop = rect.top;
    this.chartBottom = rect.bottom;
    this.chartHeight = rect.height;

    this.dragStyle = {
      left: `${xy.getAttribute('x')}px`,
      top: `${xy.getAttribute('y')}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
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

  }

  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]); // atob(dataURI.split(',')[1]);
      // decodeURIComponent(escape(window.atob(("eyJzdWIiOiJ0ZXN0MyIsInVzZXJJZCI6IjEwMTY5MiIsIm5hbWUiOiLmtYvor5V0ZXN0M-a1i-ivlSIsImV4cCI6MTU3OTUxMTY0OH0").replace(/-/g, "+").replace(/_/g, "/"))));
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }

  /**
   * 新增互動物件
   * @param id 
   */
  addMoveable(id) {
    try {
      this.moveable.destroy();
    } catch (error) {}
    // delete keycode生效
    window.setTimeout(() => {
      this.live = true;
    }, 0);
    this.moveError = false;
    let color;
    let width = 30;
    let height = 30;
    if (id === 'rect') {
      color = this.OBSTACLE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.obstacleList.push(this.svgId);
      this.rectStyle[this.svgId] = {
        width: 30,
        height: 30,
        fill: color
      };

    } else if (id === 'ellipse') {
      color = this.OBSTACLE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.obstacleList.push(this.svgId);
      this.ellipseStyle[this.svgId] = {
        ry: 15,
        rx: 15,
        cx: 15,
        cy: 15,
        fill: color
      };
    } else if (id === 'polygon') {
      color = this.OBSTACLE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.obstacleList.push(this.svgId);
      this.polygonStyle[this.svgId] = {
        points: '15,0 30,30 0,30',
        fill: this.OBSTACLE_COLOR
      };
    } else if (id === 'defaultBS') {
      color = this.DEFAULT_BS_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.defaultBSList.push(this.svgId);
      this.pathStyle[this.svgId] = {
        fill: this.DEFAULT_BS_COLOR
      };
      //Add bs RF param
      this.bsListRfParam[this.svgId] = {
        txpower: 0,
        beampattern: 0,
        // frequency: 2400,
        fddDlFrequency: 2400,
        fddUlFrequency: 2400,
        ulModulationCodScheme: "64QAM-table",
        dlModulationCodScheme: "64QAM-table",
        dlMimoLayer: '1',
        ulMimoLayer: '1',
        // scalingFact: 1,
        //TDD 5G
        // scs: '15',
        tddscs: '15',
        tddbandwidth: 5,
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
        wifiMimo: '1x1',
        wifiBandwidth: 20
      };
      if (this.calculateForm.objectiveIndex === '0') {
        this.bsListRfParam[this.svgId].dlBandwidth = '1.4';
        this.bsListRfParam[this.svgId].ulBandwidth = '1.4';
      }
    } else if (id === 'candidate') {
      color = this.CANDIDATE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
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
        // frequency: 2400,
        fddDlFrequency: 2400,
        fddUlFrequency: 2400,
        ulModulationCodScheme: "64QAM-table",
        dlModulationCodScheme: "64QAM-table",
        dlMimoLayer: '1',
        ulMimoLayer: '1',
        // scalingFact: 1,
        //TDD 5G
        // scs: '15',
        tddscs: '15',
        tddbandwidth: 5,
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
        wifiMimo: '1x1',
        wifiBandwidth: 20
      };
      if (Number(this.calculateForm.objectiveIndex) === 0) {
        this.bsListRfParam[this.svgId].dlBandwidth = '1.4';
        this.bsListRfParam[this.svgId].ulBandwidth = '1.4';
      }
      
      

    } else if (id === 'UE') {
      color = this.UE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.ueList.push(this.svgId);
      this.pathStyle[this.svgId] = {
        fill: this.UE_COLOR
      };
      width = this.ueWidth;
      height = this.ueHeight;
    } else if (id === 'trapezoid') {
      // 梯形
      color = this.OBSTACLE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.obstacleList.push(this.svgId);
      this.trapezoidStyle[this.svgId] = {
        fill: color,
        width: width,
        height: height
      };
    }

    this.spanStyle[this.svgId] = {
      left: `200px`,
      top: `100px`,
      width: `${width}px`,
      height: `${height}px`
    };

    this.svgStyle[this.svgId] = {
      display: 'inherit',
      width: width,
      height: height
    };

    // console.log(this.calculateForm.altitude);

    this.dragObject[this.svgId] = {
      x: 0,
      y: 0,
      z: this.zValues[0],
      width: width,
      height: height,
      altitude: this.calculateForm.altitude,
      rotate: 0,
      title: this.svgMap[id].title,
      type: this.svgMap[id].type,
      color: color,
      material: '0',
      element: this.parseElement(id)
    };

    this.realId = _.cloneDeep(this.svgId);
    // 預設互動外框設定值
    this.frame = new Frame({
      width: `${width}px`,
      height: `${height}px`,
      left: '200px',
      top: '100px',
      'z-index': 99999,
      transform: {
        rotate: '0deg',
        scaleX: 1,
        scaleY: 1
      }
    });

    // 圖加透明蓋子，避免產生物件過程滑鼠碰到其他物件
    this.bgdivStyle.width = `${window.innerWidth}px`;
    this.bgdivStyle.height = `${window.innerHeight}px`;
    this.bgdivStyle['z-index'] = `999999999999`;

    this.currentLeft = _.cloneDeep(this.spanStyle[this.svgId].left);
    this.currentTop = _.cloneDeep(this.spanStyle[this.svgId].top);
    this.ognSpanStyle = _.cloneDeep(this.spanStyle);
    this.ognDragObject = _.cloneDeep(this.dragObject);

    window.setTimeout(() => {
      this.target = document.getElementById(`${this.svgId}`);
      this.live = true;
      if (this.svgMap[id].type === 'obstacle') {
        this.moveable.rotatable = true;
        this.moveable.resizable = true;
      } else {
        this.moveable.rotatable = false;
        this.moveable.resizable = false;
      }
      this.dragObject[this.svgId].y = this.yLinear(this.target.getBoundingClientRect().top);
      this.moveable.ngOnInit();
      window.setTimeout(() => {
        this.setDragData();
        this.hoverObj = this.target;
        // 障礙物若莫名移動，還原位置
        this.backObstacle();
        this.setLabel();
        // 還原蓋子
        this.bgdivStyle.width = `0px`;
        this.bgdivStyle.height = `0px`;
        this.bgdivStyle['z-index'] = `0`;
      }, 100);

      window.setTimeout(() => {
        this.moveNumber(this.svgId);
      }, 0);
      
    }, 0);

  }

  /**
   * click互動物件
   * @param id 
   */
  moveClick(id) {
    try {
      this.moveable.destroy();
    } catch (error) {}
    // delete keycode生效
    window.setTimeout(() => {
      this.live = true;
    }, 0);
    this.moveError = false;
    this.target = document.getElementById(id);
    this.svgId = id;
    this.realId = _.cloneDeep(id);
    this.frame = new Frame({
      width: this.spanStyle[id].width,
      height: this.spanStyle[id].height,
      left: this.spanStyle[id].left,
      top: this.spanStyle[id].top,
      'z-index': 99999,
      transform: {
        rotate: `${this.dragObject[this.svgId].rotate}deg`,
        scaleX: 1,
        scaleY: 1
      }
    });

    this.currentLeft = _.cloneDeep(this.spanStyle[this.svgId].left);
    this.currentTop = _.cloneDeep(this.spanStyle[this.svgId].top);
    this.ognSpanStyle = _.cloneDeep(this.spanStyle);
    this.ognDragObject = _.cloneDeep(this.dragObject);

    this.live = true;
    if (this.dragObject[id].type === 'obstacle') {
      this.moveable.rotatable = true;
      this.moveable.resizable = true;
    } else {
      this.moveable.rotatable = false;
      this.moveable.resizable = false;
    }

    this.moveable.ngOnInit();
    window.setTimeout(() => {
      this.setDragData();
      this.hoverObj = this.target;
      this.setLabel();
    }, 0);
  }

  /**
   * 設定互動外框style
   * @param target 
   */
  setTransform(target) {
    target.style.cssText = this.frame.toCSS();
  }

  /** set tooltip position */
  setLabel() {
    this.live = true;
    window.setTimeout(() => {
      const obj = this.hoverObj.getBoundingClientRect();
      this.tooltipStyle.left = `${obj.left}px`;
      this.tooltipStyle.top = `${obj.top + obj.height + 5}px`;
      this.tooltipStr = this.getTooltip();
    }, 0);
  }

  /** tooltip 文字 */
  getTooltip() {
    const id = this.hoverObj.id;
    let title = `${this.dragObject[id].title}<br>`;
    title += `X: ${this.dragObject[id].x}<br>`;
    title += `Y: ${this.dragObject[id].y}<br>`;
    if (this.dragObject[id].type === 'obstacle') {
      title += `${this.translateService.instant('width')}: ${this.dragObject[id].width}<br>`;
      title += `${this.translateService.instant('height')}: ${this.dragObject[id].height}<br>`;
      title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].altitude}<br>`;
    } else if (this.dragObject[id].type === 'defaultBS' || this.dragObject[id].type === 'candidate') {
      title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].altitude}<br>`;
    } else {
      title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].z}<br>`;
    }
    if (this.dragObject[id].type === 'obstacle') {
      title += `${this.translateService.instant('material')}: ${this.authService.parseMaterial(this.dragObject[id].material)}`;
    }
    return title;
  }

  /** set drag object data */
  setDragData() {
    // const span = this.target.closest('span');
    const rect = this.target.getBoundingClientRect();
    // const rectLeft = rect.left - this.chartLeft;
    // const rectBottom = this.chartBottom - rect.bottom;
    // let xVal = this.roundFormat(this.xLinear(rectLeft));
    // if (xVal < 0) {
    //   xVal = 0;
    // }

    const type = this.dragObject[this.svgId].element;

    // const yVal = this.roundFormat(this.yLinear(rectBottom));
    let wVal;
    let hVal;
    if (Number(type) === 0) {
      // 方形
      wVal = this.roundFormat(this.xLinear(this.rectStyle[this.svgId].width));
      hVal = this.roundFormat(this.yLinear(this.rectStyle[this.svgId].height));
    } else if (Number(type) === 2) {
      // 圓形正圓
      wVal = this.roundFormat(this.xLinear(rect.width));
      hVal = this.roundFormat(this.yLinear(rect.width));

    } else if (Number(type) === 1) {
      // 三角形
      wVal = this.roundFormat(this.xLinear(this.svgStyle[this.svgId].width));
      hVal = this.roundFormat(this.yLinear(this.svgStyle[this.svgId].height));
    } else if (Number(type) === 3) {
      wVal = this.roundFormat(this.xLinear(this.trapezoidStyle[this.svgId].width));
      hVal = this.roundFormat(this.yLinear(this.trapezoidStyle[this.svgId].height));
    }

    const mOrigin = document.querySelector('.moveable-origin');
    console.log(mOrigin)
    if (mOrigin != null) {
      // 有找到中心點
      const moveableOrigin = mOrigin.getBoundingClientRect();
      const x = moveableOrigin.left - this.chartLeft + (moveableOrigin.width / 2) - (this.svgStyle[this.svgId].width / 2);
      const y = this.chartBottom - moveableOrigin.top - (moveableOrigin.height / 2) - (this.svgStyle[this.svgId].height / 2);
  
      this.dragObject[this.svgId].x = this.roundFormat(this.xLinear(x));
      this.dragObject[this.svgId].y = this.roundFormat(this.yLinear(y));
      this.dragObject[this.svgId].width = wVal;
      this.dragObject[this.svgId].height = hVal;
    }
    
  }

  /**
   * moveable移動開始
   * @param e 
   */
  dragStart(e: any) {
    if (this.svgId !== this.realId) {
      this.svgId = _.cloneDeep(this.realId);
    }
    // 紀錄移動前位置
    this.moveError = false;
    this.ognDragObject[this.svgId] = _.cloneDeep(this.dragObject[this.svgId]);
  }

  /**
   * moveable 移動中
   * @param param0 
   */
  onDrag({ target, clientX, clientY, top, left, isPinch }: OnDrag) {
    if (this.svgId !== this.realId) {
      this.svgId = _.cloneDeep(this.realId);
      target = document.querySelector(`#${this.svgId}`);
    }
    try {
      this.target = target;
      this.frame.set('left', `${left}px`);
      this.frame.set('top', `${top}px`);
      this.frame.set('z-index', 9999999);
      this.setTransform(target);
      
      this.spanStyle[this.svgId].left = `${left}px`;
      this.spanStyle[this.svgId].top = `${top}px`;

      this.setDragData();
      if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
        this.circleStyle[this.svgId] = {
          top: `${top - 20}px`,
          left: `${left + 20}px`
        };
      }
      this.setLabel();
    } catch (error) {
      console.log(error);
      // 發生error，onEnd還原位置
      this.moveError = true;
    }
    
  }

  /**
   * moveable 旋轉角度
   * @param param0 
   */
  onRotate({ target, clientX, clientY, beforeDelta, isPinch }: OnRotate) {
    if (this.svgId !== this.realId) {
      this.svgId = _.cloneDeep(this.realId);
      target = document.querySelector(`#${this.svgId}`);
    }

    const deg = parseFloat(this.frame.get('transform', 'rotate')) + beforeDelta;
    this.frame.set('transform', 'rotate', `${deg}deg`);
    this.frame.set('left', this.currentLeft);
    this.frame.set('top', this.currentTop);
    this.setTransform(target);

    this.dragObject[this.svgId].rotate = Math.ceil(deg);
    this.spanStyle[this.svgId].transform = `rotate(${this.dragObject[this.svgId].rotate}deg)`;
    this.setLabel();
  }

  /**
   * moveable resize
   * @param param0 
   */
  onResize({ target, clientX, clientY, width, height, drag }: OnResize) {
    if (this.svgId !== this.realId) {
      // 物件太接近，id有時會錯亂，還原id
      this.svgId = _.cloneDeep(this.realId);
      target = document.querySelector(`#${this.svgId}`);
    }
    if (width < 5) {
      width = 5;
    }
    if (height < 5) {
      height = 5;
    }
    const shape = this.dragObject[this.svgId].element;

    if (Number(shape) === 3) {
      // if (width > height) {
      //   height = width;
      // } else {
      //   width = height;
      // }
      this.frame.set('height', `${height}px`);
    }

    this.frame.set('width', `${width}px`);
    if (Number(shape) === 2) {
      // 圓形正圓
      this.frame.set('height', `${width}px`);
      width = height;
    } else {
      this.frame.set('height', `${height}px`);
    }
    
    this.spanStyle[this.svgId].transform = `rotate(${this.dragObject[this.svgId].rotate}deg)`;   
    this.frame.set('z-index', 9999999);
    this.frame.set('transform', 'rotate', `${this.dragObject[this.svgId].rotate}deg`);
    this.setTransform(target);
    
    const beforeTranslate = drag.beforeTranslate;
    target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px) rotate(${this.dragObject[this.svgId].rotate}deg)`;

    this.svgStyle[this.svgId].width = width;
    this.svgStyle[this.svgId].height = height;
    this.spanStyle[this.svgId].width = `${width}px`;
    this.spanStyle[this.svgId].height = `${height}px`;

    if (Number(shape) === 0) {
      // 方形
      this.rectStyle[this.svgId].width = width;
      this.rectStyle[this.svgId].height = height;
    } else if (Number(shape) === 2) {
      // 圓形正圓
      const x = (width / 2).toString();
      this.ellipseStyle[this.svgId].rx = x;
      this.ellipseStyle[this.svgId].ry = x;
      this.ellipseStyle[this.svgId].cx = x;
      this.ellipseStyle[this.svgId].cy = x;

    } else if (Number(shape) === 1) {
      // 三角形
      const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
      this.polygonStyle[this.svgId].points = points;
      // dragRect.setAttribute('points', points);
    } else if (Number(shape) === 3) {
      this.trapezoidStyle[this.svgId].width = width;
      this.trapezoidStyle[this.svgId].height = height;
    }
    this.setDragData();
    this.setLabel();
  }

  /**
   * moveable 互動結束
   * @param param0 
   */
  onEnd() {
    this.live = false;
    for (const item of this.obstacleList) {
      if (item !== this.svgId) {
        // 其他障礙物有時會跟著動，keep住
        this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
      }
    }
    if (this.moveError) {
      // 移動過程error，回到移動前位置
      this.dragObject[this.svgId] = _.cloneDeep(this.ognDragObject[this.svgId]);
      this.spanStyle[this.svgId] = _.cloneDeep(this.ognSpanStyle[this.svgId]);
    } else {
      this.ognSpanStyle[this.svgId] = _.cloneDeep(this.spanStyle[this.svgId]);
      this.ognDragObject[this.svgId] = _.cloneDeep(this.dragObject[this.svgId]);
    }
    this.moveClick(this.target.id);
  }

  /**
   * destory moveable
   */
  moveableDestroy() {
    this.moveable.destroy();
  }

  /**
   * 右邊選單開合切換時變更上下箭頭
   * @param event 
   * @param type 
   */
  arrowUpDown(event, type) {
    const target = event.target;
    if (target.innerHTML === 'keyboard_arrow_down') {
      target.innerHTML = 'keyboard_arrow_up';
      this.subitemClass[type] = 'subitem active';
    } else {
      target.innerHTML = 'keyboard_arrow_down';
      this.subitemClass[type] = 'subitem';
    }
  }

  /**
   * 右鍵選單
   * @param event 
   * @param svgId 
   */
  onRightClick(event: MouseEvent, svgId, i) {
    this.svgId = svgId;
    this.svgNum = i+1;
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();
    // we record the mouse position in our object
    this.menuTopLeftStyle.left = event.clientX + 'px';
    this.menuTopLeftStyle.top = event.clientY + 'px';
    // we open the menu
    this.matMenuTrigger.openMenu();
  }

  /**
   * 刪除互動物件
   */
  delete() {
    if (this.dragObject[this.svgId].type === 'obstacle') {
      this.obstacleList.splice(this.obstacleList.indexOf(this.svgId), 1);
    } else if (this.dragObject[this.svgId].type === 'defaultBS') {
      this.defaultBSList.splice(this.defaultBSList.indexOf(this.svgId), 1);
    } else if (this.dragObject[this.svgId].type === 'candidate') {
      this.candidateList.splice(this.candidateList.indexOf(this.svgId), 1);
    } else if (this.dragObject[this.svgId].type === 'UE') {
      this.ueList.splice(this.ueList.indexOf(this.svgId), 1);
    }
    this.matDialog.closeAll();
  }

  notDelete() {
    this.matDialog.closeAll();
  }

  /** change color */
  colorChange() {
    this.dragObject[this.svgId].color = this.color;
    if (this.dragObject[this.svgId].type === 'obstacle') {
      if (Number(this.dragObject[this.svgId].element) === 0) {
        this.rectStyle[this.svgId].fill = this.color;
      } else if (Number(this.dragObject[this.svgId].element) === 2) {
        this.ellipseStyle[this.svgId].fill = this.color;
      } else if (Number(this.dragObject[this.svgId].element) === 1) {
        this.polygonStyle[this.svgId].fill = this.color;
      } else if (Number(this.dragObject[this.svgId].element) === 3) {
        this.trapezoidStyle[this.svgId].fill = this.color;
      }
    } else {
      this.pathStyle[this.svgId].fill = this.color;
    }
  }
  /**
   * 開啟RF設定燈箱
  */
  openRfParamSetting(item, i, isNav) {
    this.svgId = item;
    if (isNav) {
      this.svgNum = i + 1;
    } else {
      this.svgNum = i;
    }
    // console.log(this.svgId);
    // console.log(item);
    // this.matDialog.open(this.rfModal);
    this.matDialog.open(this.rfModalTable);
  }

  openDeleteSetting() {
    this.matDialog.open(this.deleteModal);
  }

  /**
   * 開啟高度設定燈箱
   */
  openHeightSetting() {
    // this.matDialog.open(this.materialModal);
    this.matDialog.open(this.materialModal2);
  }

  /** 變更材質 */
  materialChange(val) {
    this.dragObject[this.svgId].material = val;
  }

  /**
   * mouseover info
   * @param event 
   * @param svgId 
   */
  hover(event, svgId) {
    this.live = true;
    this.svgId = svgId;
    this.hoverObj = event.target.closest('span');
    this.setLabel();
  }

  /**
   * mouseout物件
   * @param event 
   */
  hoverout(event) {
    this.live = false;
  }

  /**
   * image upload
   * @param event 
   */
  fileChange(event) {
    // 清除所有物件
    this.obstacleList.length = 0;
    this.defaultBSList.length = 0;
    this.candidateList.length = 0;
    this.ueList.length = 0;
    this.dragObject = {};
    this.calculateForm.obstacleInfo = '';
    this.calculateForm.defaultBs = '';
    this.calculateForm.candidateBs = '';
    this.calculateForm.ueCoordinate = '';

    const file = event.target.files[0];
    this.calculateForm.mapName = file.name;
    this.showFileName = false;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.calculateForm.mapImage = reader.result.toString();
      this.initData(false, true, false);
    };
  }

  /**
   * 數量物件移動position
   * @param svgId 
   */
  moveNumber(svgId) {
    const circleElement: HTMLSpanElement = document.querySelector(`#${svgId}_circle`);
    if (circleElement != null) {
      const top = `${Number(this.spanStyle[svgId].top.replace('px', '')) - 20}px`;
      const width = Number(this.spanStyle[svgId].width.replace('px', ''));
      const left = Number(this.spanStyle[svgId].left.replace('px', ''));
      this.circleStyle[svgId] = {
        top: top,
        left: `${left + width - 10}px`
      };
      // console.log(this.spanStyle[svgId], this.circleStyle[svgId])
    }
  }

  /**
   * Clear
   */
  // clearAllDrag() {
  //   this.dragObject = {};
  // }

  /**
   * 檢查參數是否完整
   */
  checkRFParamIsEmpty(protocol, duplex) {

    let error = false;
    let msg = '<br>';
     if (protocol == '1') { //5G
      if (duplex == 'tdd') {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          // console.log(obj);
          // if (obj.txpower) { msg = '' }
          // if (obj.beampattern) { msg = '' }
          if (obj.tddbandwidth == undefined || obj.tddbandwidth == '') { bsMsg += `頻寬,`; error = true; }
          if (obj.tddscs == undefined || obj.tddscs == '') { bsMsg += `子載波間距,`; error = true; }
          if (obj.ulModulationCodScheme == undefined || obj.ulModulationCodScheme == '') { bsMsg += `上行調變能力,`; error = true; }
          if (obj.dlModulationCodScheme == undefined || obj.dlModulationCodScheme == '') { bsMsg += `下行調變能力,`; error = true; }
          if (obj.ulMimoLayer == undefined || obj.ulMimoLayer == '') { bsMsg += `上行資料串流層數,`; error = true; }
          if (obj.dlMimoLayer == undefined || obj.dlMimoLayer == '') { bsMsg += `下行資料串流層數,`; error = true; }
          if (obj.tddfrequency == undefined || obj.tddfrequency == '') { bsMsg += `中心頻率`; error = true; }
          if (bsMsg != '') {
            msg+= `請輸入BS${i+1}:<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
          }
        }
      } else {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          // console.log(obj);
          // if (obj.txpower) { msg = '' }
          // if (obj.beampattern) { msg = '' }
          if (obj.dlBandwidth == undefined || obj.dlBandwidth == '') { bsMsg += `下行頻寬,`; error = true; }
          if (obj.ulBandwidth == undefined || obj.ulBandwidth == '') { bsMsg += `上行頻寬,`; error = true; }
          if (obj.dlScs == undefined || obj.dlScs == '') { bsMsg += `下行子載波間距,`; error = true; }
          if (obj.ulScs == undefined || obj.ulScs == '') { bsMsg += `上行子載波間距,`; error = true; }
          if (obj.dlModulationCodScheme == '' || obj.dlModulationCodScheme == undefined) { bsMsg += `下行調變能力,`; error = true; }
          if (obj.ulModulationCodScheme == '' || obj.ulModulationCodScheme == undefined) { bsMsg += `上行調變能力,`; error = true; }
          if (obj.dlMimoLayer == undefined || obj.dlMimoLayer == '') { bsMsg += `下行資料串流層數,`; error = true; }
          if (obj.ulMimoLayer == undefined || obj.ulMimoLayer == '') { bsMsg += `上行資料串流層數,`; error = true; }
          if (obj.fddDlFrequency == undefined || obj.fddDlFrequency == '') { bsMsg += `下行頻率,`; error = true; }
          if (obj.fddUlFrequency == undefined || obj.fddUlFrequency == '') { bsMsg += `上行頻率`; error = true; }
          if (bsMsg != '') {
            msg+= `請輸入BS${i+1}:<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
          } else if (obj.fddDlFrequency == obj.fddUlFrequency ) {
            msg+= `BS${i+1}:上行頻率與下行頻率不可相同，請修改`
            msg+= '</p>';
            error = true;
          }
        }
      }
     } else {
      if (duplex == 'tdd') {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          // if (obj.txpower) { msg = `請填上${i+1}的` }
          // if (obj.beampattern) { msg = `請填上${i+1}的` }
          if (obj.mimoNumber4G == undefined || obj.mimoNumber4G == '') { bsMsg += `MIMO天線數,`; error = true; }
          if (obj.tddbandwidth == undefined || obj.tddbandwidth == '') { bsMsg += `頻寬,`; error = true; }
          if (obj.tddfrequency == undefined || obj.tddfrequency == '') { bsMsg += `中心頻率,`; error = true; }
          if (bsMsg != '') {
            msg+= `請輸入BS${i+1}:<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
          }
        }
      } else {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          // if (obj.txpower) { msg = `請填上${i+1}的` }
          // if (obj.beampattern) { msg = `請填上${i+1}的` }
          if (obj.mimoNumber4G == undefined || obj.mimoNumber4G == '') { bsMsg += `MIMO天線數,`; error = true; }
          if (obj.dlBandwidth == undefined || obj.dlBandwidth == '') { bsMsg += `上行頻寬,`; error = true; }
          if (obj.ulBandwidth == undefined || obj.ulBandwidth == '') { bsMsg += `下行頻寬,`; error = true; }
          if (obj.fddDlFrequency == undefined || obj.fddDlFrequency == '') { bsMsg += `下行中心頻率,`; error = true; }
          if (obj.fddUlFrequency == undefined || obj.fddUlFrequency == '') { bsMsg += `上行中心頻率`; error = true; }
          if (bsMsg != '') {
            msg+= `請輸入BS${i+1}:<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
          } else if (obj.fddDlFrequency == obj.fddUlFrequency ) {
            msg+= `BS${i+1}:上行頻率與下行頻率不可相同，請修改`
            msg+= '</p>';
            error = true;
          }
        }
      }
     }
     if (error) {
       console.log(msg);
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
     return error;
  }

  checkDlUlDiff() {
    if (this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
      return true;
    } else {
      return false;
    }
  }

  hintDlUlDiff(uldl) {
    let msg = '';
    if (uldl == 'ul') {
      if (this.duplexMode == 'fdd' && this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
        msg = '上行頻率跟下行頻率重複了，請修改上行頻率'
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        // this.tempCalParamSet.fddUlFrequency = 0;
      }
    } else {
      if (this.duplexMode == 'fdd' && this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
        if (this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
          msg = '下行頻率跟上行頻率重複了，請修改下行頻率'
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: msg
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          // this.tempCalParamSet.fddDlFrequency = 0;
        }
      }
    }
  }

  /**
   * 開始運算
   */
  calculate() {
    try {
      this.moveable.destroy();
    } catch (error) {}

    // 檢查是否有參數未被填入
    if (this.checkRFParamIsEmpty(this.calculateForm.objectiveIndex, this.duplexMode)) {
      return;
    }

    if (this.planningIndex != '3' && this.duplexMode == 'fdd' && this.checkDlUlDiff()) {
      let msg = '上行頻率跟下行頻率重複了，請修改'
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }

    if (this.calculateForm.powerMaxRange == this.calculateForm.powerMinRange || this.calculateForm.powerMinRange > this.calculateForm.powerMaxRange) {
      let msg = '';
      if (this.calculateForm.powerMaxRange == this.calculateForm.powerMinRange) {
        msg = '最大功率與最小功率值相同，請修改';
      } else {
        msg = '最大功率不可小於最小功率，請修改';
      }
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }

    // Candidate
    // DefaultBs [重要!!]
    
    // ---------- 我是分隔線 ----------

    console.log(this.calculateForm);

    if (((this.candidateList.length < this.calculateForm.availableNewBsNumber) || Number(this.calculateForm.availableNewBsNumber) === 0) && this.planningIndex !== '3') {
      let msg;
      if (this.calculateForm.objectiveIndex === '2') {
        msg = this.translateService.instant('availableNewBsNumber.wifi');
      } else {
        msg = this.translateService.instant('availableNewBsNumber.gen');
      }
      if (this.candidateList.length < this.calculateForm.availableNewBsNumber) {
        msg += ' ' + this.translateService.instant('must_less_then') + this.candidateList.length;
      } else { 
        msg += ' ' + this.translateService.instant('must_greater_then') + '0';
      }
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    } else if (this.planningIndex == '3' && this.defaultBSList.length == 0) {
      let msg = "模擬模式既有基站數量不可小於0"
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    } else if (this.ueList.length == 0 && this.planningIndex == '2') {
      let msg = this.translateService.instant('ue.Mandatory');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    } else {
      this.progressNum = 0;
      this.authService.spinnerShowAsHome();
      // console.log(this.calculateForm.bandwidth);
      // console.log(this.calculateForm.frequency);

      // 障礙物計算時若莫名移動，還原位置
      // for (const item of this.obstacleList) {
      //   if (this.dragObject[item].x !== this.ognDragObject[item].x
      //     || this.dragObject[item].y !== this.ognDragObject[item].y) {
      //       this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
      //       this.dragObject[item] = _.cloneDeep(this.ognDragObject[item]);
      //     }
      // }
      this.setForm();
      // 規劃目標
      this.setPlanningObj();

      let apiBody = JSON.parse(JSON.stringify(this.calculateForm));

      apiBody.availableNewBsNumber = apiBody.availableNewBsNumber + this.defaultBSList.length;

      console.log(this.calculateForm);
      let url = '';
      if (this.planningIndex !== '3') {
        url = `${this.authService.API_URL}/calculate`;
        this.calculateForm.isSimulation = false;
      } else {
        url = `${this.authService.API_URL}/simulation`;
        this.calculateForm.isSimulation = true;
      }

      console.log(this.calculateForm);

      this.http.post(url, JSON.stringify(apiBody)).subscribe(
        res => {
          this.taskid = res['taskid'];
          const percentageVal = document.getElementById('percentageVal');
          if (percentageVal != null) {
            percentageVal.innerHTML = '0';
          }
          this.getProgress();
        },
        err => {
          this.authService.spinnerHide();
          console.log(err);
        }
      );
    }
  }

  /** 設定規劃目標  */
  setPlanningObj() {
    // check規劃目標
    if (this.planningIndex === '1') {
      this.calculateForm.isUeAvgSinr = false;
      this.calculateForm.isUeAvgThroughput = false;
      this.calculateForm.isUeCoverage = false;
    } else {
      this.calculateForm.isAverageSinr = false;
      this.calculateForm.isCoverage = false;
    }
    const planningObj = {
      isAverageSinr: this.calculateForm.isAverageSinr,
      isCoverage: this.calculateForm.isCoverage,
      isUeAvgSinr: this.calculateForm.isUeAvgSinr,
      isUeAvgThroughput: this.calculateForm.isUeAvgThroughput,
      isUeCoverage: this.calculateForm.isUeCoverage
    };
    sessionStorage.setItem('planningObj', JSON.stringify(planningObj));
  }

  /** 組form */
  setForm() {
    if (typeof this.calculateForm.isAverageSinr === 'undefined') {
      this.calculateForm.isAverageSinr = false;
    }
    // if (typeof this.calculateForm.isAvgThroughput === 'undefined') {
    //   this.calculateForm.isAvgThroughput = false;
    // }
    if (typeof this.calculateForm.isCoverage === 'undefined') {
      this.calculateForm.isCoverage = false;
    }
    if (typeof this.calculateForm.isUeAvgSinr === 'undefined') {
      this.calculateForm.isUeAvgSinr = false;
    }
    if (typeof this.calculateForm.isUeAvgThroughput === 'undefined') {
      this.calculateForm.isUeAvgThroughput = false;
    }
    if (typeof this.calculateForm.isUeCoverage === 'undefined') {
      this.calculateForm.isUeCoverage = false;
    }
    if (typeof this.calculateForm.isUeTpByDistance === 'undefined') {
      this.calculateForm.isUeTpByDistance = false;
    }
    this.calculateForm.useUeCoordinate = 1;
    // 規劃目標預設值
    this.calculateForm.sinrRatio = this.calculateForm.isAverageSinr ? 5 : null;
    this.calculateForm.throughputRatio = this.calculateForm.isCoverage ? 5 : null;
    this.calculateForm.ueAvgSinrRatio = this.calculateForm.isUeAvgSinr ? 16 : null;
    this.calculateForm.ueCoverageRatio = this.calculateForm.isUeAvgThroughput ? 0.95 : null;
    this.calculateForm.ueAvgThroughputRatio = this.calculateForm.isUeCoverage ? 100 : null;

    this.calculateForm.sessionid = this.authService.userToken;
    const zValue = this.zValues.filter(
      option => option !== ''
    );
    this.calculateForm.zValue = `[${zValue.toString()}]`;
    let obstacleInfo = '';
    this.calculateForm.obstacleInfo = obstacleInfo;
    if (this.obstacleList.length > 0) {
      // 障礙物資訊
      for (let i = 0; i < this.obstacleList.length; i++) {
        const obj = this.dragObject[this.obstacleList[i]];
        const shape = this.parseElement(obj.element);
        obstacleInfo += `[${obj.x},${obj.y},${obj.width},${obj.height},${obj.altitude},${obj.rotate},${obj.material},${shape}]`;
        if (i < this.obstacleList.length - 1) {
          obstacleInfo += '|';
        }
      }
      this.calculateForm.obstacleInfo = obstacleInfo;
    }
    let ueCoordinate = '';
    this.calculateForm.ueCoordinate = ueCoordinate;
    if (this.ueList.length > 0) {
      for (let i = 0; i < this.ueList.length; i++) {
        const obj = this.dragObject[this.ueList[i]];
        // ueCoordinate += `[${obj.x},${obj.y},${obj.z},${obj.material}]`;
        ueCoordinate += `[${obj.x},${obj.y},${obj.z}]`;
        if (i < this.ueList.length - 1) {
          ueCoordinate += '|';
        }
      }
    } else {
      ueCoordinate = '';
    }
    this.calculateForm.ueCoordinate = ueCoordinate;

    let defaultBs = '';
    this.calculateForm.defaultBs = defaultBs;
    if (this.defaultBSList.length > 0) {
      // 現有基站
      for (let i = 0; i < this.defaultBSList.length; i++) {
        const obj = this.dragObject[this.defaultBSList[i]];
        defaultBs += `[${obj.x},${obj.y},${obj.altitude}]`;
        // defaultBs += `[${obj.x},${obj.y},${obj.z}]`;
        if (i < this.defaultBSList.length - 1) {
          defaultBs += '|';
        }
      }
      this.calculateForm.defaultBs = defaultBs;
      this.calculateForm.bsList = defaultBs;
    }
    //　現有基站RF參數
    let txpower = [];
    let beamId = [];
    // let freqList = [];
    let mapProtocol = '';
    if (Number(this.calculateForm.objectiveIndex) === 0) {
      mapProtocol = '4g';
    } else if (Number(this.calculateForm.objectiveIndex) === 1) {
      mapProtocol = '5g';
    } else {
      mapProtocol = 'wifi';
    }
    //4G and 5G
    let duplex = this.duplexMode;
    let tddFrameRatio = this.dlRatio;
    let dlFrequency = []; //Array
    let ulFrequency = []; //Array
    //4G
    let mimoNumber = []; //Array
    //5G
    let ulMcsTable = []; //Array
    let dlMcsTable = []; //Array
    let ulMimoLayer = []; //Array 上行資料串流數
    let dlMimoLayer = []; //Array 下行資料串流數
    let scalingFactor = this.scalingFactor;
    // 5G TDD 
    let scs = []; //Array
    let bandwidthList = []; //Array TDD bandwidth
    let frequencyList = []; //Array TDD frequency
    // 5G FDD
    let dlScs = []; //Array
    let ulScs = []; //Array
    let dlBandwidth = []; //Array
    let ulBandwidth = []; //Array
    //WiFi
    let wifiProtocol = []; //Array
    let guardInterval = []; //Array
    let wifiMimo = []; //Array
    
    if(this.defaultBSList.length > 0 || this.candidateList.length > 0) {

      let candidate = '';
      this.calculateForm.candidateBs = candidate;
      if (this.candidateList.length > 0) {
        for (let i = 0; i < this.candidateList.length; i++) {
          const canObj = this.dragObject[this.candidateList[i]];
          candidate += `[${canObj.x},${canObj.y},${canObj.altitude}]`;
          // candidate += `[${canObj.x},${canObj.y},${canObj.z}]`;
          if (i < this.candidateList.length - 1) {
            candidate += '|';
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
            } else {
              mimoNumber.push(this.tempCalParamSet.mimoNumber4G);
              // mimoNumber.push(obj.mimoNumber4G);
            }
            if (duplex === 'tdd') {
              bandwidthList.push(this.tempCalParamSet.tddbandwidth);
              frequencyList.push(this.tempCalParamSet.tddfrequency);
              // bandwidthList.push(obj.tddbandwidth);
              // frequencyList.push(obj.tddfrequency);
            } else {
              dlFrequency.push(this.tempCalParamSet.fddDlFrequency);
              ulFrequency.push(this.tempCalParamSet.fddUlFrequency);
              dlScs.push(this.tempCalParamSet.dlScs);
              ulScs.push(this.tempCalParamSet.ulScs);
              dlBandwidth.push(this.tempCalParamSet.dlBandwidth);
              ulBandwidth.push(this.tempCalParamSet.ulBandwidth);
            }
          } else {
            // guardInterval.push(this.tempCalParamSet.guardInterval);
            // wifiProtocol.push(this.tempCalParamSet.wifiProtocol);
            // wifiMimo.push(this.tempCalParamSet.wifiMimo);
            // bandwidthList.push(this.tempCalParamSet.wifiBandwidth);
            // guardInterval.push(obj.guardInterval);
            // wifiProtocol.push(obj.wifiProtocol);
            // wifiMimo.push(obj.wifiMimo);
            // bandwidthList.push(obj.wifiBandwidth);
          }
        }
        this.calculateForm.candidateBs = candidate;
      }

      for (let i = 0; i < this.defaultBSList.length; i++) {
        const obj = this.bsListRfParam[this.defaultBSList[i]];
        console.log(`obj: ${JSON.stringify(obj)}`)
        txpower.push(obj.txpower);
        beamId.push(obj.beampattern);
        // freqList.push(obj.frequency);
        
        if (mapProtocol !== 'wifi') {
          if (mapProtocol === '5g') {
            ulMcsTable.push(obj.ulModulationCodScheme);
            dlMcsTable.push(obj.dlModulationCodScheme);
            ulMimoLayer.push(obj.ulMimoLayer);
            dlMimoLayer.push(obj.dlMimoLayer);
            scs.push(obj.tddscs);
            // scs.push(obj.subcarrier);
          } else {
            mimoNumber.push(obj.mimoNumber4G);
          }
          if (duplex === 'tdd') {
            bandwidthList.push(obj.tddbandwidth);
            frequencyList.push(obj.tddfrequency);
          } else {
            dlFrequency.push(obj.fddDlFrequency);
            ulFrequency.push(obj.fddUlFrequency);
            dlScs.push(obj.dlScs);
            ulScs.push(obj.ulScs);
            dlBandwidth.push(obj.dlBandwidth);
            ulBandwidth.push(obj.ulBandwidth);
          }
        } else {
          guardInterval.push(obj.guardInterval);
          wifiProtocol.push(obj.wifiProtocol);
          wifiMimo.push(obj.wifiMimo);
        }
      }

      //API body
      this.calculateForm.mapProtocol = mapProtocol;
      this.calculateForm.duplex = duplex;
      this.calculateForm.scalingFactor = scalingFactor;
      this.calculateForm.tddFrameRatio = tddFrameRatio;

      //4G
      this.calculateForm.mimoNumber = `[${mimoNumber.toString()}]`;
      //5G
      this.calculateForm.scs = `[${scs.toString()}]`;
      this.calculateForm.ulMcsTable = `[${ulMcsTable.toString()}]`;
      this.calculateForm.dlMcsTable = `[${dlMcsTable.toString()}]`;
      this.calculateForm.ulMimoLayer = `[${ulMimoLayer.toString()}]`;
      this.calculateForm.dlMimoLayer = `[${dlMimoLayer.toString()}]`;
      //FDD
      this.calculateForm.dlFrequency = `[${dlFrequency.toString()}]`;
      this.calculateForm.ulFrequency = `[${ulFrequency.toString()}]`;
      this.calculateForm.dlScs = `[${dlScs.toString()}]`;
      this.calculateForm.ulScs = `[${ulScs.toString()}]`;
      this.calculateForm.dlBandwidth = `[${dlBandwidth.toString()}]`;
      this.calculateForm.ulBandwidth = `[${ulBandwidth.toString()}]`;
      //WiFi
      this.calculateForm.wifiProtocol = `[${wifiProtocol.toString()}]`;
      this.calculateForm.guardInterval = `[${guardInterval.toString()}]`;
      this.calculateForm.wifiMimo = `[${wifiMimo.toString()}]`;

      this.calculateForm.txPower = `[${txpower.toString()}]`;
      this.calculateForm.beamId = `[${beamId.toString()}]`;
      this.calculateForm.bandwidthList = `[${bandwidthList.toString()}]`;
      this.calculateForm.frequencyList = `[${frequencyList.toString()}]`;
      this.calculateForm.frequency = `[${frequencyList.toString()}]`;
      this.calculateForm.bandwidth = `[${bandwidthList.toString()}]`;

      console.log(this.calculateForm);
    }

    // number type to number
    Object.keys(this.calculateForm).forEach((key) => {
      if (this.numColumnList.includes(key)) {
        this.calculateForm[key] = Number(this.calculateForm[key]);
      }
    });

    if (Number(this.calculateForm.objectiveIndex) === 2) {
      // Wifi強制指定為wifi模型
      this.calculateForm.pathLossModelId = 9;
    }
  }

  /**
   * BsList Txpower, BeamPattern, Frequency
   */
  changeTxBfFreq(item) {
    console.log(`Bs${item}:${this.bsListRfParam[item]}`);
  }

  /**
   * 進度百分比，3秒加1%
   */
  addInterval() {
    this.pgInterval = window.setInterval(() => {
      if (this.progressNum < 100) {
        const percentageVal = document.getElementById('percentageVal');
        if (percentageVal != null) {
          percentageVal.innerHTML = (this.progressNum++).toString();
        }
      } else {
        window.clearInterval(this.pgInterval);
        for (let i = 0; i < this.pgInterval; i++) {
          window.clearInterval(i);
        }
      }
    }, 3000);
  }

  /** 查詢進度 */
  getProgress() {
    
    const url = `${this.authService.API_URL}/progress/${this.taskid}/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res => {
        window.clearInterval(this.progressInterval);
        for (let i = 0; i < this.progressInterval; i++) {
          window.clearInterval(i);
        }
        
        if (res['progress'] === 1) {
          const percentageVal = document.getElementById('percentageVal');
          if (percentageVal != null) {
            percentageVal.innerHTML = '100';
          }
          // done
          this.authService.spinnerHide();
          // 儲存
          // this.save();
          window.clearInterval(this.pgInterval);
          for (let i = 0; i < this.pgInterval; i++) {
            window.clearInterval(i);
          }
          this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }});
          
        } else {
          // query again
          window.clearInterval(this.progressInterval);
          for (let i = 0; i < this.progressInterval; i++) {
            window.clearInterval(i);
          }
          this.progressInterval = window.setTimeout(() => {
            this.addInterval();
            this.getProgress();
          }, 3000);
        }

      }, err => {
        this.authService.spinnerHide();
        window.clearInterval(this.progressInterval);
        for (let i = 0; i < this.progressInterval; i++) {
          window.clearInterval(i);
        }
        // check has result
        if (err.error['text'] === '{"progress":,"index":-1}') {
          const resultUrl = `${this.authService.API_URL}/completeCalcResult/${this.taskid}/${this.authService.userToken}`;
          this.http.get(resultUrl).subscribe(
            res => {
              this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }});
            }
          );
        }
        
      }
    );
  }

  /**
   * 變更場域size
   * @param svgId 物件id 
   */
  changeSize(svgId) {
    this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    const elementWidth = this.pixelXLinear(this.dragObject[svgId].width);
    const elementHeight = this.pixelYLinear(this.dragObject[svgId].height);
    this.frame.set('width', `${elementWidth}px`);
    this.frame.set('height', `${elementHeight}px`);
    this.setTransform(this.target);

    const svg = this.target.querySelector('svg');
    svg.setAttribute('width', elementWidth.toString());
    svg.setAttribute('height', elementHeight.toString());
    const dragRect = svg.querySelector('.drag_rect');
    const type = this.dragObject[this.svgId].element;
    if (Number(type) === 0) {
      // 方形
      dragRect.setAttribute('width', elementWidth.toString());
      dragRect.setAttribute('height', elementHeight.toString());
    } else if (Number(type) === 2) {
      // 圓形
      const val = (Plotly.d3.min([elementWidth, elementHeight]) / 2).toString();
      dragRect.setAttribute('rx', val.toString());
      dragRect.setAttribute('ry', val.toString());
      dragRect.setAttribute('cx', val.toString());
      dragRect.setAttribute('cy', val.toString());
    } else if (Number(type) === 1) {
      // 三角形
      const points = `${elementWidth / 2},0 ${elementWidth}, ${elementHeight} 0, ${elementHeight}`;
      dragRect.setAttribute('points', points);
    }

    if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate') {
      this.moveNumber(svgId);
    }
  }

  /**
   * 變更物件位置
   * @param svgId 物件id
   */
  changePosition(svgId) {
    // this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    const rect = this.target.getBoundingClientRect();
    const height = rect.height;

    const left = this.pixelXLinear(this.dragObject[svgId].x) + this.chartLeft;
    const bottom = this.chartBottom - this.pixelYLinear(this.dragObject[svgId].y);
    const yPos = bottom - height;
    this.frame.set('left', `${left}px`);
    this.frame.set('top', `${yPos}px`);
    if (this.dragObject[svgId].type === 'obstacle') {
      this.frame.set('width', `${this.pixelXLinear(this.dragObject[svgId].width)}px`);
      this.frame.set('height', `${this.pixelYLinear(this.dragObject[svgId].height)}px`);
    }
    this.setTransform(this.target);

    this.spanStyle[svgId].left = left;
    this.spanStyle[svgId].top = yPos;

    if (this.dragObject[svgId].type === 'defaultBS' || this.dragObject[svgId].type === 'candidate') {
      this.moveNumber(svgId);
    }
  }

  /**
   * 變更物件角度
   * @param svgId 物件id
   */
  changeRotate(svgId) {
    this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    this.frame.set('transform', 'rotate', `${this.dragObject[svgId].rotate}deg`);
    this.setTransform(this.target);
    this.target.setAttribute('style', `transform: rotate(${this.dragObject[svgId].rotate}deg)`);
    if (this.dragObject[svgId].rotate === '0') {
      // 0時click才會生效
      this.target.click();
      this.target.blur();
    }
  }

  /**
   * 清除全部物件
   * @param type 物件類別
   */
  clearAll(type) {
    if (type === 'obstacle') {
      this.obstacleList.length = 0;
    } else if (type === 'defaultBS') {
      this.defaultBSList.length = 0;
    } else if (type === 'candidate') {
      this.candidateList.length = 0;
    } else if (type === 'UE') {
      this.ueList.length = 0;
    } else if (type === 'bsAndCand') {
      this.defaultBSList.length = 0;
      this.candidateList.length = 0;
    }
  }

  /**
   * 切換tdd fdd 4G 5G時補上參數
   * @param type 物件類別
   */
  changeProtoOrDuplex() {
    let msg = "切換雙工模式後請記得檢查是否填入基站RF參數";
    this.msgDialogConfig.data = {
      type: 'error',
      infoMessage: msg
    };
    this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
  }


  /**
   * View 3D
   */
  view3D() {
    const defaultBS = [];
    for (const item of this.defaultBSList) {
      defaultBS.push(this.dragObject[item]);
    }
    const candidate = [];
    for (const item of this.candidateList) {
      candidate.push(this.dragObject[item]);
    }
    const obstacle = [];
    for (const item of this.obstacleList) {
      obstacle.push(this.dragObject[item]);
    }
    console.log(obstacle);
    const ue = [];
    for (const item of this.ueList) {
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
    this.matDialog.open(View3dComponent, this.view3dDialogConfig);
  }

  /** export xlsx */
  export() {
    /* generate worksheet */
    // map
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const mapData = [
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
      for (let i = 1; i < this.zValues.length; i++) {
        mapData.push([
          '', '', '', '', '', '', this.zValues[i]
        ]);
      }
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mapData);
    XLSX.utils.book_append_sheet(wb, ws, 'map');
    // defaultBS
    const baseStationData = [['x', 'y', 'z', 'material',
    'color','txpower','beamId','tddfrequency', 'tddbandwidth',
    'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
    '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
    'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers']];
    for (const item of this.defaultBSList) {
      baseStationData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].altitude, this.dragObject[item].material,
        this.dragObject[item].color,
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
      ]);
    }
    const baseStationWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationData);
    XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');
    // candidate
    const candidateData = [['x', 'y', 'z', 'material', 'color',
    'tddfrequency', 'tddbandwidth',
    'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
    '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
    'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers']];
    for (const item of this.candidateList) {
      candidateData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].altitude, this.dragObject[item].material,
        this.dragObject[item].color,
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
        // this.bsListRfParam[item].dlBandwidth,
        // this.bsListRfParam[item].ulBandwidth,
        // this.bsListRfParam[item].fddDlFrequency,
        // this.bsListRfParam[item].fddUlFrequency,
        //4g only
        this.tempCalParamSet.mimoNumber4G,
        // this.bsListRfParam[item].mimoNumber4G,
        //5g only
        this.tempCalParamSet.tddscs,
        this.tempCalParamSet.dlModulationCodScheme,
        this.tempCalParamSet.ulModulationCodScheme,
        this.tempCalParamSet.dlMimoLayer,
        this.tempCalParamSet.ulMimoLayer,
        // this.bsListRfParam[item].tddscs,
        // this.bsListRfParam[item].dlModulationCodScheme,
        // this.bsListRfParam[item].ulModulationCodScheme,
        // this.bsListRfParam[item].dlMimoLayer,
        // this.bsListRfParam[item].ulMimoLayer,
        //5g fdd only
        this.tempCalParamSet.dlScs,
        this.tempCalParamSet.ulScs,
        // this.bsListRfParam[item].dlScs,
        // this.bsListRfParam[item].ulScs,
      ]);
    }
    const candidateWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(candidateData);
    XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
    // UE
    const ueData = [['x', 'y', 'z', 'material', 'color']];
    for (const item of this.ueList) {
      ueData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].z, this.dragObject[item].material,
        this.dragObject[item].color
      ]);
    }
    const ueWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ueData);
    XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
    // obstacle
    const obstacleData = [['x', 'y', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
    for (const item of this.obstacleList) {
      const shape = this.parseElement(this.dragObject[item].element);
      obstacleData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].width, this.dragObject[item].height,
        this.dragObject[item].altitude, this.dragObject[item].rotate,
        this.dragObject[item].material, this.dragObject[item].color,
        shape
      ]);
    }
    const obstacleWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(obstacleData);
    XLSX.utils.book_append_sheet(wb, obstacleWS, 'obstacle');
    // bs parameters
    const bsData = [
      ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
      'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
      // 'isCoverage', 'isAvgThroughput', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
      // ['bsPowerMax', 'bsPowerMin', 'bsBeamIdMax', 'bsBeamIdMin', 'bandwidth', 'frequency'],
      [
        this.calculateForm.powerMaxRange, this.calculateForm.powerMinRange,
        this.calculateForm.objectiveIndex, this.duplexMode, this.dlRatio,
        this.calculateForm.isAverageSinr,this.calculateForm.isCoverage,
        this.calculateForm.isUeAvgSinr,
        this.calculateForm.isUeAvgThroughput,this.calculateForm.isUeCoverage
        // this.calculateForm.beamMaxId, this.calculateForm.beamMinId,
        //  this.calculateForm.bandwidth, this.calculateForm.frequency
      ]
    ];
    const bsWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(bsData);
    XLSX.utils.book_append_sheet(wb, bsWS, 'bs parameters');
    // algorithm parameters
    const algorithmData = [
      ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel'],
      [
        this.calculateForm.crossover, this.calculateForm.mutation,
        this.calculateForm.iteration, this.calculateForm.seed,
        1, this.calculateForm.useUeCoordinate, this.calculateForm.pathLossModelId
      ]
    ];
    const algorithmWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(algorithmData);
    XLSX.utils.book_append_sheet(wb, algorithmWS, 'algorithm parameters');
    // objective parameters
    const objectiveData = [
      ['objective', 'objectiveStopCondition', 'newBsNum'],
      ['1', '', this.calculateForm.availableNewBsNumber]
    ];
    const objectiveWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(objectiveData);
    XLSX.utils.book_append_sheet(wb, objectiveWS, 'objective parameters');
    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, `${this.calculateForm.taskName}.xlsx`);
  }

  /**
   * 匯入xlsx
   * @param event file
   */
  import(event) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer> (event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const file = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const name = file.name.substring(0, file.name.lastIndexOf('.'));
      sessionStorage.setItem('taskName', name);
      this.readXls(bstr);

      event.target.value = ''; // 清空
    };
    reader.readAsBinaryString(target.files[0]);
  }

  /**
   * Read xlsx
   * @param result Reader result
   */
  readXls(result) {
    this.obstacleList.length = 0;
    this.defaultBSList.length = 0;
    this.candidateList.length = 0;
    this.ueList.length = 0;
    this.calculateForm = new CalculateForm();
    this.calculateForm.taskName = sessionStorage.getItem('taskName');
    this.wb = XLSX.read(result, {type: 'binary'});

    /* map sheet */
    const map: string = this.wb.SheetNames[0];
    const mapWS: XLSX.WorkSheet = this.wb.Sheets[map];
    const mapData = (XLSX.utils.sheet_to_json(mapWS, {header: 1}));

    try {
      this.calculateForm.mapImage = '';
      const keyMap = {};
      Object.keys(mapData[0]).forEach((key) => {
        keyMap[mapData[0][key]] = key;
      });
      this.zValues.length = 0;
      for (let i = 1; i < mapData.length; i++) {
        this.calculateForm.mapImage += mapData[i][0];
        if (typeof mapData[i][keyMap['mapLayer']] !== 'undefined') {
          if (mapData[i][keyMap['mapLayer']] !== '') {
            this.zValues.push(mapData[i][keyMap['mapLayer']]);
          }
        }
      }
      this.calculateForm.width = mapData[1][keyMap['width']];
      this.calculateForm.height = mapData[1][keyMap['height']];
      this.calculateForm.altitude = mapData[1][keyMap['altitude']];
      // mapName or imageName
      if (typeof mapData[1][keyMap['mapName']] === 'undefined') {
        this.calculateForm.mapName = mapData[1][keyMap['imageName']];
      } else {
        this.calculateForm.mapName = mapData[1][keyMap['mapName']];
      }
      // excel無protocol時預設wifi
      if (typeof mapData[1][keyMap['protocol']] === 'undefined') {
        this.calculateForm.objectiveIndex = '2';
      } else {
        if (mapData[1][keyMap['protocol']] === '0' || mapData[1][keyMap['protocol']] === '4G') {
          this.calculateForm.objectiveIndex = '0';
        } else if (mapData[1][keyMap['protocol']] === '1' || mapData[1][keyMap['protocol']] === '5G') {
          this.calculateForm.objectiveIndex = '1';
        } else if (mapData[1][keyMap['protocol']] === '2' || mapData[1][keyMap['protocol']] === 'wifi') {
          this.calculateForm.objectiveIndex = '2';
        }
      }
  
      this.initData(true, false, false);
    } catch (error) {
      console.log(error);
      // fail xlsx
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('xlxs.fail')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      window.setTimeout(() => {
        this.matDialog.closeAll();
        this.router.navigate(['/']);
      }, 2000);
    }

  }

  /**
   * 載入匯入物件
   */
  setImportData() {
    this.obstacleList.length = 0;
    this.defaultBSList.length = 0;
    this.candidateList.length = 0;
    this.ueList.length = 0;


    const materialReg = new RegExp('[0-4]');
    /* base station sheet */
    const sheetNameIndex = {};
    for (let i = 0; i < this.wb.SheetNames.length; i++) {
      sheetNameIndex[this.wb.SheetNames[i]] = i;
    }

    const baseStation: string = this.wb.SheetNames[sheetNameIndex['base_station']];
    const baseStationWS: XLSX.WorkSheet = this.wb.Sheets[baseStation];
    const baseStationData = (XLSX.utils.sheet_to_json(baseStationWS, {header: 1}));
    if (baseStationData.length > 1) {
      this.planningIndex = '3';
      for (let i = 1; i < baseStationData.length; i++) {
        const id = `defaultBS_${(i - 1)}`;
        let material = (typeof baseStationData[i][3] === 'undefined' ? '0' : baseStationData[i][3]);
        // 不在清單內，指定為木頭
        if (!materialReg.test(material)) {
          material = '0';
        }
        const color = (typeof baseStationData[i][4] === 'undefined' ? this.DEFAULT_BS_COLOR : baseStationData[i][4]);
        this.dragObject[id] = {
          x: baseStationData[i][0],
          y: baseStationData[i][1],
          z: baseStationData[i][2],
          width: this.xLinear(30),
          height: this.yLinear(30),
          altitude: baseStationData[i][2],
          rotate: 0,
          title: this.svgMap['defaultBS'].title,
          type: this.svgMap['defaultBS'].type,
          color: color,
          material: material,
          element: this.svgMap['defaultBS'].element
        };
        // RF parameter import
        this.bsListRfParam[id] = {
          txpower: baseStationData[i][5],
          beampattern: baseStationData[i][6],
          tddfrequency: baseStationData[i][7],
          tddbandwidth: baseStationData[i][8],
          dlBandwidth: baseStationData[i][9],
          ulBandwidth: baseStationData[i][10],
          fddDlFrequency: baseStationData[i][11],
          fddUlFrequency: baseStationData[i][12],
          mimoNumber4G: baseStationData[i][13],
          tddscs: baseStationData[i][14],
          dlModulationCodScheme: baseStationData[i][15],
          ulModulationCodScheme: baseStationData[i][16],
          dlMimoLayer: baseStationData[i][17],
          ulMimoLayer: baseStationData[i][18],
          dlScs: baseStationData[i][19],
          ulScs: baseStationData[i][20],
        };
        

        console.log(this.dragObject)
        this.defaultBSList.push(id);
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(baseStationData[i][0])}px`,
          top: `${this.chartHeight - 30 - this.pixelYLinear(baseStationData[i][1])}px`,
          width: `30px`,
          height: `30px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: 30,
          height: 30
        };
        this.pathStyle[id] = {
          fill: color
        };
        window.setTimeout(() => {
          this.moveNumber(id);
        }, 0);
      }
    }
    /* candidate sheet */
    const candidate: string = this.wb.SheetNames[sheetNameIndex['candidate']];
    const candidateWS: XLSX.WorkSheet = this.wb.Sheets[candidate];
    const candidateData = (XLSX.utils.sheet_to_json(candidateWS, {header: 1}));
    if (candidateData.length > 1) {
      this.planningIndex = '1';
      for (let i = 1; i < candidateData.length; i++) {
        const id = `candidate_${(i - 1)}`;
        this.candidateList.push(id);
        let material = (typeof candidateData[i][3] === 'undefined' ? '0' : candidateData[i][3]);
        if (!materialReg.test(material)) {
          material = '0';
        }
        const color = (typeof candidateData[i][4] === 'undefined' ? this.CANDIDATE_COLOR : candidateData[i][4]);

        this.dragObject[id] = {
          x: candidateData[i][0],
          y: candidateData[i][1],
          z: candidateData[i][2],
          width: this.xLinear(this.candidateWidth),
          height: this.yLinear(this.candidateHeight),
          altitude: candidateData[i][2],
          rotate: 0,
          title: this.svgMap['candidate'].title,
          type: this.svgMap['candidate'].type,
          color: color,
          material: material,
          element: this.svgMap['candidate'].element
        };

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
        this.tempCalParamSet.tddfrequency = candidateData[i][5];
        this.tempCalParamSet.tddbandwidth = candidateData[i][6];
        this.tempCalParamSet.dlBandwidth = candidateData[i][7];
        this.tempCalParamSet.ulBandwidth = candidateData[i][8];
        this.tempCalParamSet.fddDlFrequency = candidateData[i][9];
        this.tempCalParamSet.fddUlFrequency = candidateData[i][10];
        this.tempCalParamSet.mimoNumber4G = candidateData[i][11];
        this.tempCalParamSet.tddscs = candidateData[i][12];
        this.tempCalParamSet.dlModulationCodScheme = candidateData[i][13];
        this.tempCalParamSet.ulModulationCodScheme = candidateData[i][14];
        this.tempCalParamSet.dlMimoLayer = candidateData[i][15];
        this.tempCalParamSet.ulMimoLayer = candidateData[i][16];
        this.tempCalParamSet.dlScs = candidateData[i][17];
        this.tempCalParamSet.ulScs = candidateData[i][18];

        this.spanStyle[id] = {
          left: `${this.pixelXLinear(candidateData[i][0])}px`,
          top: `${this.chartHeight - this.candidateHeight - this.pixelYLinear(candidateData[i][1])}px`,
          width: `${this.candidateWidth}px`,
          height: `${this.candidateHeight}px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: this.candidateWidth,
          height: this.candidateHeight
        };
        this.pathStyle[id] = {
          fill: color
        };

        window.setTimeout(() => {
          this.moveNumber(id);
        }, 0);

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
    /* UE sheet */
    const ue: string = this.wb.SheetNames[sheetNameIndex['ue']];
    if (typeof ue !== 'undefined') {
      const ueWS: XLSX.WorkSheet = this.wb.Sheets[ue];
      const ueData = (XLSX.utils.sheet_to_json(ueWS, {header: 1}));
      if (ueData.length > 1) {
        for (let i = 1; i < ueData.length; i++) {
          if (typeof ueData[i][0] === 'undefined') {
            continue;
          }
          const id = `UE_${(i - 1)}`;
          this.ueList.push(id);
          let material = (typeof ueData[i][3] === 'undefined' ? '0' : ueData[i][3]);
          if (!materialReg.test(material)) {
            material = '0';
          }
          const color = (typeof ueData[i][4] === 'undefined' ? this.UE_COLOR : ueData[i][4]);

          this.dragObject[id] = {
            x: ueData[i][0],
            y: ueData[i][1],
            z: ueData[i][2],
            width: this.xLinear(this.ueWidth),
            height: this.yLinear(this.ueHeight),
            altitude: ueData[i][2],
            rotate: 0,
            title: this.svgMap['UE'].title,
            type: this.svgMap['UE'].type,
            color: color,
            material: material,
            element: this.svgMap['UE'].element
          };
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(ueData[i][0])}px`,
            top: `${this.chartHeight - this.ueHeight - this.pixelYLinear(ueData[i][1])}px`,
            width: `19px`,
            height: `29px`
          };
          this.svgStyle[id] = {
            display: 'inherit',
            width: this.ueWidth,
            height: this.ueHeight
          };
          this.pathStyle[id] = {
            fill: color
          };
        }
      }
    }

    /* obstacle sheet */
    const obstacle: string = this.wb.SheetNames[sheetNameIndex['obstacle']];
    const obstacleWS: XLSX.WorkSheet = this.wb.Sheets[obstacle];
    const obstacleData = (XLSX.utils.sheet_to_json(obstacleWS, {header: 1}));
    if (obstacleData.length > 1) {

      for (let i = 1; i < obstacleData.length; i++) {
        if ((<Array<any>> obstacleData[i]).length === 0) {
          continue;
        }
        let id;
        let type;
        let shape = this.parseElement(obstacleData[i][8]);
        if (shape === 'rect' || Number(shape) === 0) {
          id = `rect_${this.generateString(10)}`;
          type = 'rect';

        } else if (shape === 'ellipse' || Number(shape) === 2) {
          id = `ellipse_${this.generateString(10)}`;
          type = 'ellipse';

        } else if (shape === 'polygon' || Number(shape) === 1) {
          id = `polygon_${this.generateString(10)}`;
          type = 'polygon';

        } else if (shape === 'trapezoid' || Number(shape) === 3) {
          id = `trapezoid_${this.generateString(10)}`;
          type = 'trapezoid';

        } else {
          // default
          shape = '0';
          id = `rect_${this.generateString(10)}`;
          type = 'rect';

        }
        let material = (typeof obstacleData[i][6] === 'undefined' ? '0' : obstacleData[i][6].toString());
        if (!materialReg.test(material)) {
          material = '0';
        }
        const color = (typeof obstacleData[i][7] === 'undefined' ? this.OBSTACLE_COLOR : obstacleData[i][7]);
        this.dragObject[id] = {
          x: obstacleData[i][0],
          y: obstacleData[i][1],
          z: 0,
          width: obstacleData[i][2],
          height: obstacleData[i][3],
          altitude: obstacleData[i][4],
          rotate: (typeof obstacleData[i][5] === 'undefined' ? 0 : obstacleData[i][5]),
          title: this.svgMap[type].title,
          type: this.svgMap[type].type,
          color: color,
          material: material,
          element: shape
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: this.pixelXLinear(this.dragObject[id].width),
          height: this.pixelYLinear(this.dragObject[id].height)
        };
        if (shape === 'rect' || Number(shape) === 0) {
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
            top: `${this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(obstacleData[i][1])}px`,
            width: `${this.pixelXLinear(obstacleData[i][2])}px`,
            height: `${this.pixelYLinear(obstacleData[i][3])}px`,
            opacity: 0
            // transform: `rotate(${this.dragObject[id].rotate}deg)`
          };
          this.rectStyle[id] = {
            width: this.pixelXLinear(this.dragObject[id].width),
            height: this.pixelYLinear(this.dragObject[id].height),
            fill: this.dragObject[id].color
          };
        } else if (shape === 'ellipse' || Number(shape) === 2) {
          console.log(this.dragObject[id]);
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
            top: `${this.chartHeight - this.pixelYLinear(this.dragObject[id].height) -  this.pixelYLinear(this.dragObject[id].y)}px`,
            width: `${this.pixelXLinear(this.dragObject[id].width * 2)}px`,
            height: `${this.pixelYLinear(this.dragObject[id].height * 2)}px`,
            opacity: 0
            // transform: `rotate(${this.dragObject[id].rotate}deg)`
          };
          console.log(this.spanStyle[id]);
          const x = (this.pixelXLinear(this.dragObject[id].width) / 2).toString();
          const y = (this.pixelYLinear(this.dragObject[id].height) / 2).toString();
          this.ellipseStyle[id] = {
            cx: x,
            cy: y,
            rx: x,
            ry: y,
            fill: this.dragObject[id].color
          };
        } else if (shape === 'polygon' || Number(shape) === 1) {
          console.log(this.dragObject[id]);
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
            top: `${this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(this.dragObject[id].y)}px`,
            width: `${this.pixelXLinear(obstacleData[i][2] / 2)}px`,
            height: `${this.pixelYLinear(obstacleData[i][3] / 2)}px`,
            opacity: 0
            // transform: `rotate(${this.dragObject[id].rotate}deg)`
          };
          console.log(this.spanStyle[id]);
          const width = this.pixelXLinear(this.dragObject[id].width);
          const height = this.pixelYLinear(this.dragObject[id].height);
          const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
          this.polygonStyle[id] = {
            points: points,
            fill: this.dragObject[id].color
          };
        } else if (shape === 'trapezoid' || Number(shape) === 3) {
          console.log(this.svgStyle[id]);
          console.log(this.dragObject[id]);
          this.spanStyle[id] = {
            left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
            top: `${this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(this.dragObject[id].y)}px`,
            width: `${this.pixelXLinear(obstacleData[i][2] / 2)}px`,
            height: `${this.pixelYLinear(obstacleData[i][3] / 2)}px`,
            opacity: 0
            // transform: `rotate(${this.dragObject[id].rotate}deg)`
          };
          console.log(this.spanStyle[id]);
          // const width = this.pixelXLinear(this.dragObject[id].width);
          // const height = this.pixelYLinear(this.dragObject[id].height);
          // const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
          this.trapezoidStyle[id] = {
            // points: points,
            fill: this.dragObject[id].color
          };
        }
        // 延遲轉角度，讓位置正確
        window.setTimeout(() => {
          this.spanStyle[id]['transform'] = `rotate(${this.dragObject[id].rotate}deg)`;
          this.spanStyle[id].opacity = 1;
        }, 0);
        this.obstacleList.push(id);
      }
    }
    /* bs parameters sheet */
    const bsParameters: string = this.wb.SheetNames[sheetNameIndex['bs parameters']];
    const bsParametersWS: XLSX.WorkSheet = this.wb.Sheets[bsParameters];
    const bsParametersData = (XLSX.utils.sheet_to_json(bsParametersWS, {header: 1}));
    if (bsParametersData.length > 1) {
      this.calculateForm.powerMaxRange = Number(bsParametersData[1][0]);
      this.calculateForm.powerMinRange = Number(bsParametersData[1][1]);
      this.calculateForm.objectiveIndex = bsParametersData[1][2];
      this.duplexMode = bsParametersData[1][3];
      this.dlRatio = Number(bsParametersData[1][4]);
      this.calculateForm.isAverageSinr = JSON.parse(bsParametersData[1][5]);
      this.calculateForm.isCoverage = JSON.parse(bsParametersData[1][6]);
      // this.calculateForm.isAvgThroughput = JSON.parse(bsParametersData[1][7]);
      this.calculateForm.isUeAvgSinr = JSON.parse(bsParametersData[1][7]);
      this.calculateForm.isUeAvgThroughput = JSON.parse(bsParametersData[1][8]);
      this.calculateForm.isUeCoverage = JSON.parse(bsParametersData[1][9]);
      if (this.calculateForm.isAverageSinr || this.calculateForm.isCoverage) {
      // if (this.calculateForm.isAverageSinr || this.calculateForm.isCoverage || this.calculateForm.isAvgThroughput) {
        this.planningIndex = '1';
      } else if (this.calculateForm.isUeAvgSinr || this.calculateForm.isUeAvgThroughput || this.calculateForm.isUeCoverage) {
        this.planningIndex = '2';
      } else {
        this.planningIndex = '3';
      }
      
      // this.calculateForm.beamMaxId = Number(bsParametersData[1][2]);
      // this.calculateForm.beamMinId = Number(bsParametersData[1][3]);
      // this.calculateForm.bandwidth = bsParametersData[1][4];
      // this.calculateForm.frequency = bsParametersData[1][5];
      // this.calculateForm.bandwidth = Number(bsParametersData[1][4]);
      // this.calculateForm.frequency = Number(bsParametersData[1][5]);
    }
    /* algorithm parameters sheet */
    const algorithmParameters: string = this.wb.SheetNames[sheetNameIndex['algorithm parameters']];
    const algorithmParametersWS: XLSX.WorkSheet = this.wb.Sheets[algorithmParameters];
    const algorithmParametersData = (XLSX.utils.sheet_to_json(algorithmParametersWS, {header: 1}));
    if (algorithmParametersData.length > 1) {
      this.calculateForm.crossover = Number(algorithmParametersData[1][0]);
      this.calculateForm.mutation = Number(algorithmParametersData[1][1]);
      this.calculateForm.iteration = Number(algorithmParametersData[1][2]);
      this.calculateForm.seed = Number(algorithmParametersData[1][3]);
      // this.calculateForm.computeRound = Number(algorithmParametersData[1][4]);
      this.calculateForm.useUeCoordinate = Number(algorithmParametersData[1][5]);
      this.calculateForm.pathLossModelId = Number(algorithmParametersData[1][6]);
    }
    /* objective parameters sheet */
    const objectiveParameters: string = this.wb.SheetNames[sheetNameIndex['objective parameters']];
    const objectiveParametersWS: XLSX.WorkSheet = this.wb.Sheets[objectiveParameters];
    const objectiveParametersData = (XLSX.utils.sheet_to_json(objectiveParametersWS, {header: 1}));
    if (objectiveParametersData.length > 1) {
      this.calculateForm.availableNewBsNumber = Number(objectiveParametersData[1][2]);
    }
    if (this.calculateForm.objectiveIndex === '2') {
      // 切換到2.4Ghz
      if (Number(Number(this.calculateForm.bandwidth) >= 20)) {
        this.wifiFrequency = '1';
      }
      this.changeWifiFrequency();
    } else if (this.calculateForm.objectiveIndex === '1') {
      // 5G set子載波間距
      this.setSubcarrier();
    }

    this.ognSpanStyle = _.cloneDeep(this.spanStyle);
    this.ognDragObject = _.cloneDeep(this.dragObject);

  }

  /**
   * 儲存場域
   */
  save() {
    this.authService.spinnerShowAsHome();
    this.setForm();

    const url = `${this.authService.API_URL}/storeResult`;
    this.http.post(url, JSON.stringify(this.calculateForm)).subscribe(
      res => {
        this.taskid = res['taskid'];
        this.authService.spinnerHide();
      },
      err => {
        this.authService.spinnerHide();
        console.log(err);
      }
    );
  }

  /**
   * 首頁點編輯場域
   */
  edit() {
    // obstacleInfo
    if (!this.authService.isEmpty(this.calculateForm.obstacleInfo)) {
      const obstacle = this.calculateForm.obstacleInfo.split('|');
      const obstacleLen = obstacle.length;
      for (let i = 0; i < obstacleLen; i++) {
        if (obstacle[i].indexOf('undefined') !== -1) {
          continue;
        }
        const item = JSON.parse(obstacle[i]);
        let shape = '0';
        if (typeof item[7] !== 'undefined') {
          shape = this.parseElement(item[7]);
        }
        const id = `${this.parseShape(shape)}_${this.generateString(10)}`;
        
        this.dragObject[id] = {
          x: item[0],
          y: item[1],
          z: 0,
          width: item[2],
          height: item[3],
          altitude: item[4],
          rotate: item[5],
          title: this.translateService.instant('obstacleInfo'),
          type: this.svgElmMap(shape).type,
          color: this.OBSTACLE_COLOR,
          material: item[6].toString(),
          element: shape
        };

        this.spanStyle[id] = {
          left: `${this.pixelXLinear(item[0])}px`,
          top: `${this.chartHeight - this.pixelYLinear(item[3]) - this.pixelYLinear(item[1])}px`,
          width: `${this.pixelXLinear(item[2])}px`,
          height: `${this.pixelYLinear(item[3])}px`,
          // transform: `rotate(${this.dragObject[id].rotate}deg)`,
          opacity: 0
        };
        // 延遲轉角度，讓位置正確
        window.setTimeout(() => {
          this.spanStyle[id]['transform'] = `rotate(${this.dragObject[id].rotate}deg)`;
          this.spanStyle[id].opacity = 1;
        }, 0);
  
        const width = this.pixelXLinear(item[2]);
        const height = this.pixelYLinear(item[3]);
        this.svgStyle[id] = {
          display: 'inherit',
          width: width,
          height: height
        };
  
        if (Number(shape) === 0) {
          // 方形
          this.rectStyle[id] = {
            width: width,
            height: height,
            fill: this.dragObject[id].color
          };
        } else if (Number(shape) === 2) {
          // 圓形
          const x = (width / 2).toString();
          const y = (height / 2).toString();
          this.ellipseStyle[id] = {
            ry: x,
            rx: y,
            cx: x,
            cy: y,
            fill: this.dragObject[id].color
          };
  
        } else if (Number(shape) === 1) {
          // 三角形
          const points = `${width / 2},0 ${width}, ${height} 0, ${height}`;
          this.polygonStyle[id] = {
            points: points,
            fill: this.dragObject[id].color
          };
        } else if (Number(shape) === 3) {
          // 梯形
          this.trapezoidStyle[id] = {
            fill: this.dragObject[id].color,
            width: width,
            height: height
          };
        }
        this.obstacleList.push(id);
      }
    }
    // candidate
    if (!this.authService.isEmpty(this.calculateForm.candidateBs)) {
      const candidate = this.calculateForm.candidateBs.split('|');
      const candidateLen = candidate.length;
      const txpower = JSON.parse(this.calculateForm.txPower);
      const beamId = JSON.parse(this.calculateForm.beamId);
      for (let i = 0; i < candidateLen; i++) {
        const item = JSON.parse(candidate[i]);
        const id = `candidate_${this.generateString(10)}`;
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
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(item[0])}px`,
          top: `${this.chartHeight - this.candidateHeight - this.pixelYLinear(item[1])}px`,
          width: `${this.candidateWidth}px`,
          height: `${this.candidateHeight}px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: this.candidateWidth,
          height: this.candidateHeight
        };
        this.pathStyle[id] = {
          fill: this.dragObject[id].color
        };
        window.setTimeout(() => {
          this.moveNumber(id);
        }, 0);

        this.tempCalParamSet.txpower = txpower[0];
        this.tempCalParamSet.beampattern = beamId[0];
        if (this.calculateForm.duplex === 'fdd' && this.calculateForm.mapProtocol === '5g') {
          this.tempCalParamSet.dlScs = JSON.parse(this.calculateForm.dlScs)[i];
          this.tempCalParamSet.ulScs = JSON.parse(this.calculateForm.ulScs)[i];
        }
        if (this.calculateForm.duplex === 'fdd') {
          this.duplexMode = 'fdd';
          this.tempCalParamSet.fddDlFrequency = JSON.parse(this.calculateForm.dlFrequency)[i];
          this.tempCalParamSet.fddUlFrequency = JSON.parse(this.calculateForm.ulFrequency)[i];
          this.tempCalParamSet.dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth)[i];
          this.tempCalParamSet.ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth)[i];
        } else {
          this.duplexMode = 'tdd';
          this.tempCalParamSet.tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i];
          this.tempCalParamSet.tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
        }
        if (this.calculateForm.mapProtocol === '4g') {
          this.tempCalParamSet.mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i];
        }
        if (this.calculateForm.mapProtocol === '5g') {
          let ulmsc = this.calculateForm.ulMcsTable;
          let dlmsc = this.calculateForm.dlMcsTable;
          this.tempCalParamSet.ulModulationCodScheme = ulmsc.substring(1,(ulmsc.length)-1).split(',')[i];
          this.tempCalParamSet.dlModulationCodScheme = dlmsc.substring(1,(dlmsc.length)-1).split(',')[i];
          this.tempCalParamSet.tddscs = JSON.parse(this.calculateForm.scs)[i].toString();
          this.tempCalParamSet.ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i].toString();
          this.tempCalParamSet.dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i].toString();
          this.scalingFactor = this.calculateForm.scalingFactor;
        }
        // this.bsListRfParam[id] = {
        //   txpower: txpower[i],
        //   beampattern: beamId[i],
        //   ulModulationCodScheme: "64QAM-table",
        //   dlModulationCodScheme: "64QAM-table",
        //   mimoLayer: 1,
        //   subcarrier: 15,
        //   scsBandwidth: 10,
        // };
        // if (this.calculateForm.duplex === 'fdd' && this.calculateForm.mapProtocol === '5g') {
        //   this.bsListRfParam[id].dlScs = JSON.parse(this.calculateForm.dlScs)[i];
        //   this.bsListRfParam[id].ulScs = JSON.parse(this.calculateForm.ulScs)[i];
        // }
        // if (this.calculateForm.duplex === 'fdd') {
        //   this.duplexMode = 'fdd';
        //   this.bsListRfParam[id].fddDlFrequency = JSON.parse(this.calculateForm.dlFrequency)[i];
        //   this.bsListRfParam[id].fddUlFrequency = JSON.parse(this.calculateForm.ulFrequency)[i];
        //   this.bsListRfParam[id].dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth)[i];
        //   this.bsListRfParam[id].ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth)[i];
        //   console.log(this.bsListRfParam[id].dlScs);
        //   console.log(this.bsListRfParam[id].dlBandwidth);
        //   console.log(this.bsListRfParam[id].ulScs);
        //   console.log(this.bsListRfParam[id].ulBandwidth);
        // } else {
        //   this.duplexMode = 'tdd';
        //   this.bsListRfParam[id].tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i];
        //   this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
        // }
        // if (this.calculateForm.mapProtocol === '4g') {
        //   this.bsListRfParam[id].mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i];
        // }
        // if (this.calculateForm.mapProtocol === '5g') {
        //   this.bsListRfParam[id].tddscs = JSON.parse(this.calculateForm.scs)[i].toString();
        //   this.bsListRfParam[id].ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i].toString();
        //   this.bsListRfParam[id].dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i].toString();
        //   this.scalingFactor = this.calculateForm.scalingFactor;
        // }
        // if (this.calculateForm.objectiveIndex === '2') {
        //   this.bsListRfParam[id].wifiBandwidth = JSON.parse(this.calculateForm.bandwidthList)[i].toString();
        // }
      }
    }
    // defaultBs
    this.calculateForm.defaultBs = this.calculateForm.bsList;
    if (!this.authService.isEmpty(this.calculateForm.defaultBs)) {
      const defaultBS = this.calculateForm.defaultBs.split('|');
      const txpower = JSON.parse(this.calculateForm.txPower);
      const beamId = JSON.parse(this.calculateForm.beamId);
      // this.dlRatio = this.calculateForm.tddFrameRatio;
      const defaultBSLen = defaultBS.length;
      for (let i = 0; i < defaultBSLen; i++) {
        const item = JSON.parse(defaultBS[i]);
        const id = `defaultBS_${this.generateString(10)}`;
        this.defaultBSList.push(id);
        //20210521
        this.bsListRfParam[id] = {
          txpower: txpower[i],
          beampattern: beamId[i],
          // frequency: frequencyList[i],
          // ulModulationCodScheme: "64QAM-table",
          // dlModulationCodScheme: "64QAM-table",
          mimoLayer: 1,
          // scalingFact: 1,
          subcarrier: 15,
          scsBandwidth: 10,
        };
        if (this.calculateForm.duplex === 'fdd' && this.calculateForm.mapProtocol === '5g') {
          this.bsListRfParam[id].dlScs = JSON.parse(this.calculateForm.dlScs)[i];
          this.bsListRfParam[id].ulScs = JSON.parse(this.calculateForm.ulScs)[i];
        }
        if (this.calculateForm.duplex === 'fdd') {
          this.duplexMode = 'fdd';
          this.bsListRfParam[id].fddDlFrequency = JSON.parse(this.calculateForm.dlFrequency)[i];
          this.bsListRfParam[id].fddUlFrequency = JSON.parse(this.calculateForm.ulFrequency)[i];
          this.bsListRfParam[id].dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth)[i];
          this.bsListRfParam[id].ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth)[i];
          // console.log(this.bsListRfParam[id].dlScs);
          // console.log(this.bsListRfParam[id].dlBandwidth);
          // console.log(this.bsListRfParam[id].ulScs);
          // console.log(this.bsListRfParam[id].ulBandwidth);
        } else {
          this.duplexMode = 'tdd';
          this.bsListRfParam[id].tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i];
          this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
        }
        if (this.calculateForm.duplex === 'tdd' && this.calculateForm.mapProtocol === '4g') {
          // this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
        }
        if (this.calculateForm.mapProtocol === '4g') {
          this.bsListRfParam[id].mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i];
        }
        if (this.calculateForm.mapProtocol === '5g') {
          let ulmsc = this.calculateForm.ulMcsTable;
          let dlmsc = this.calculateForm.dlMcsTable;
          this.bsListRfParam[id].ulModulationCodScheme = ulmsc.substring(1,(ulmsc.length)-1).split(',')[i];
          this.bsListRfParam[id].dlModulationCodScheme = dlmsc.substring(1,(dlmsc.length)-1).split(',')[i];
          console.log(this.bsListRfParam[id].dlMcsTable);
          this.bsListRfParam[id].tddscs = JSON.parse(this.calculateForm.scs)[i].toString();
          this.bsListRfParam[id].ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i].toString();
          this.bsListRfParam[id].dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i].toString();
          // this.bsListRfParam[id].ulMcsTable = JSON.parse(this.calculateForm.ulMcsTable)[i].toString();
          // this.bsListRfParam[id].dlMcsTable = JSON.parse(this.calculateForm.dlMcsTable)[i].toString();
          this.scalingFactor = this.calculateForm.scalingFactor;
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
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(item[0])}px`,
          top: `${this.chartHeight - 30 - this.pixelYLinear(item[1])}px`,
          width: `30px`,
          height: `30px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: 30,
          height: 30
        };
        this.pathStyle[id] = {
          fill: this.dragObject[id].color
        };
        window.setTimeout(() => {
          this.moveNumber(id);
        }, 0);
      }
    }
    
    // UE
    if (!this.authService.isEmpty(this.calculateForm.ueCoordinate)) {
      const ue = this.calculateForm.ueCoordinate.split('|');
      const ueLen = ue.length;
      for (let i = 0; i < ueLen; i++) {
        const item = JSON.parse(ue[i]);
        const id = `ue_${this.generateString(10)}`;
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
        this.spanStyle[id] = {
          left: `${this.pixelXLinear(item[0])}px`,
          top: `${this.chartHeight - this.ueHeight - this.pixelYLinear(item[1])}px`,
          width: `${this.ueWidth}px`,
          height: `${this.ueHeight}px`
        };
        this.svgStyle[id] = {
          display: 'inherit',
          width: this.ueWidth,
          height: this.ueHeight
        };
        this.pathStyle[id] = {
          fill: this.dragObject[id].color
        };
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

  }

  /** 運算結果 */
  result() {
    // 規劃目標
    this.setPlanningObj();

    if (this.isHst) {
      this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid, isHst: true }});
    } else {
      this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }});
    }
    
  }

  /**
   * 歷史資料塞回form
   * @param result 
   */
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

  protocolSwitchWarning() {
    if (this.defaultBSList.length !== 0 ) {
      let msg = "切換協定後請記得檢查是否填入基站RF參數";
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }
  }

  /** Wifi頻率切換 */
  changeWifiFrequency() {

    if (Number(this.wifiFrequency) === 0) {
      // this.calculateForm.frequency = '950';
    } else if (Number(this.wifiFrequency) === 1) {
      // this.calculateForm.frequency = '2400';
    } else if (Number(this.wifiFrequency) === 2) {
      // this.calculateForm.frequency = '5800';
    }
    // 場域內無線訊號衰減模型 default value
    if (Number(this.calculateForm.objectiveIndex) === 2) {
      this.calculateForm.pathLossModelId = 9;
    } else {
      this.calculateForm.pathLossModelId = 0;
    }
  }

  /**
   * 互動結束event
   */
  dragEnd() {
    for (const item of this.obstacleList) {
      if (item !== this.svgId) {
        // 其他障礙物有時會跟著動，keep住
        this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
      }
    }
  }

  /** 場域標題 */
  getTitle() {
    if (this.calculateForm.objectiveIndex.toString() === '0') {
      return this.translateService.instant('planning.title').replace('{0}', '4G');
    } else if (this.calculateForm.objectiveIndex.toString() === '1') {
      return this.translateService.instant('planning.title').replace('{0}', '5G');
    } else if (this.calculateForm.objectiveIndex.toString() === '2') {
      return this.translateService.instant('planning.title').replace('{0}', 'Wifi');
    }
  }

  /** set子載波間距 */
  setSubcarrier() {
    const list15 = [5, 10, 15, 20, 25, 30, 40, 50];
    const list30 = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
    const list60 = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 200];
    const list120 = [50, 100, 200, 400];
    const bandwidth = Number(this.calculateForm.bandwidth);
    if (list15.includes(bandwidth)) {
      this.subcarrier = 15;
    } else if (list30.includes(bandwidth)) {
      this.subcarrier = 30;
    } else if (list60.includes(bandwidth)) {
      this.subcarrier = 60;
    } else if (list120.includes(bandwidth)) {
      this.subcarrier = 120;
    }
  }

  /** 規劃目標切換 */
  changePlanningIndex() {
    // 設定預設值
    if (this.planningIndex === '1') {
      // this.clearAll('defaultBS');
      if (!this.calculateForm.isAverageSinr && !this.calculateForm.isCoverage) {
        this.calculateForm.isAverageSinr = true;
      }
    } else if (this.planningIndex === '2') {
      // this.clearAll('defaultBS');
      if (!this.calculateForm.isUeAvgSinr 
        && !this.calculateForm.isUeAvgThroughput 
        && !this.calculateForm.isUeTpByDistance) {
        this.calculateForm.isUeAvgSinr = true;
      }
    } else {
      this.clearAll('candidate');
      // this.clearAllDrag();
    }
  }

  /**
   * 亂數字串
   * @param len 
   */
  generateString(len) {
    let result = ' ';
    const charactersLength = this.characters.length;
    for (let i = 0; i < len; i++) {
        result += this.characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result.trim();
  }

  /**
   * 障礙物物件類型判別
   * @param type 物件類型
   */
  svgElmMap(type) {
    if (Number(type) === 0) {
      return {
        id: 'svg_1',
        title: this.translateService.instant('obstacleInfo'),
        type: 'obstacle',
        element: '0'
      };
    } else if (Number(type) === 1) {
      return {
        id: 'svg_3',
        title: this.translateService.instant('obstacleInfo'),
        type: 'obstacle',
        element: '1'
      };
    } else if (Number(type) === 2) {
      return {
        id: 'svg_2',
        title: this.translateService.instant('obstacleInfo'),
        type: 'obstacle',
        element: '2'
      };
    } else if (Number(type) === 3) {
      return {
        id: 'svg_7',
        title: this.translateService.instant('obstacleInfo'),
        type: 'obstacle',
        element: '3'
      };
    } else {
      return {
        id: 'svg_1',
        title: this.translateService.instant('obstacleInfo'),
        type: 'obstacle',
        element: '0'
      };
    }
  }

  /**
   * 障礙物形狀轉換
   * @param type 形狀
   */
  parseElement(type) {
    if (type === 'rect') {
      return 0;
    } else if (type === 'ellipse') {
      return 2;
    } else if (type === 'polygon') {
      return 1;
    } else if (type === 'trapezoid') {
      return 3;
    } else {
      return type;
    }
  }

  /**
   * 右側清單刪除互動物件
   * @param id 
   */
  removeObj(id) {
    this.svgId = id;
    this.delete();
  }

  /**
   * 障礙物形狀轉換
   * @param type 形狀
   */
  parseShape(type) {
    if (type.toString() === '0') {
      return 'rect';
    } else if (type.toString() === '2') {
      return 'ellipse';
    } else if (type.toString() === '1') {
      return 'polygon';
    } else if (type.toString() === '3') {
      return 'trapezoid';
    } else {
      return type;
    }
  }

  /** 障礙物若莫名移動，還原位置 */
  backObstacle() {
    for (const item of this.obstacleList) {
      if (this.dragObject[item].x !== this.ognDragObject[item].x
        || this.dragObject[item].y !== this.ognDragObject[item].y) {
          this.spanStyle[item] = _.cloneDeep(this.ognSpanStyle[item]);
          this.dragObject[item] = _.cloneDeep(this.ognDragObject[item]);
        }
    }
  }

}
