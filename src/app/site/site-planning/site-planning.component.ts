import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, TemplateRef, OnChanges } from '@angular/core';
import { OnPinch, OnScale, OnDrag, OnRotate, OnResize, OnWarp, MoveableGroupInterface, BeforeRenderableProps } from 'moveable';
import { Frame } from 'scenejs';
import { NgxMoveableComponent } from 'ngx-moveable';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatRadioChange, MatRadioButton } from '@angular/material/radio';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ConfirmDailogComponent } from '../../utility/confirm-dailog/confirm-dailog.component';
import { HttpClient } from '@angular/common/http';
import { CalculateForm } from '../../form/CalculateForm';
import { CoverageForm, EvaluationFuncForm, FieldForm, RatioForm, RSRPForm, SINRForm, ThroughputForm, UEForm, UEThroughputForm } from '../../form/EvaluationFuncForm';
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
import { AbsoluteSourceSpan, ReturnStatement } from '@angular/compiler';
import { convertActionBinding } from '@angular/compiler/src/compiler_util/expression_converter';
import  booleanContains from "@turf/boolean-contains";
import { polygon } from "@turf/helpers";
import circle from '@turf/circle';
import CryptoJS from 'crypto-js';
import * as echarts from 'echarts';
import { transcode } from 'buffer';
import { reject } from 'q';

/** Plotly套件引用 */
declare var Plotly: any;
declare var Intersection: any;
declare var Point2D: any;
// declare var require: any;


/**
 * 場域規劃頁
 */
@Component({
  selector: 'app-site-planning',
  templateUrl: './site-planning.component.html',
  styleUrls: ['./site-planning.component.scss',
  ]
})
export class SitePlanningComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

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


  // UC 新增變數使用
  selected = -1; //將checkbox改成單選
  // changePlanningTarget();
  
  /**
   * NgxMoveableComponent
   */
  @ViewChild('moveable') moveable: NgxMoveableComponent;
  /**
   * MatMenuTrigger
   */
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;
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
  /** evaluationFunc form  */
  evaluationFuncForm: EvaluationFuncForm = new EvaluationFuncForm();
  /** material list */
  materialList = [];
  /** model list */
  modelList = [];
  /** antenna list */
  antennaList = [];
  /** new antenna list */
  allAntennaList = [];
  filterAntennaList = [];
  defaultAntennaList = [];
  customizedAntennaList = [];
  /** new material & new model */
  materialId: number = 0;
  materialName: string = null;
  materialLossCoefficient: number = 0.1;
  materialProperty: string = null;
  materialIdToIndex = {};
  deleteMaterialList = [];
  modelName: string = null;
  modelDissCoefficient: number = 0.1;
  modelfieldLoss: number = 0.1;
  calModelDissCoefficient: number = 0.1;
  calModelfieldLoss: number = 0.1;
  modelProperty: string = null;
  modelIdToIndex = {};
  modelFileName = '';
  createMethod = 'formula';
  /** upload image src */
  imageSrc;
  file;
  /** subitem class */
  subitemClass = {
    obstacle: 'subitem active',
    ue: 'subitem active'
  };
  /** 平面高度 */
  zValues = [1];
  /** 障礙物 IDList */
  obstacleList = [];
  /** 互動物件 */
  dragObject = {};
  /** 基站RF參數 */
  bsListRfParam = {};
  /** color list */
  colorList = {};
  /** 現有基站 */
  defaultBSList = [];
  /** 新增基站 */
  candidateList = [];
  /** 新增ＵＥ */
  ueList = [];
  ueListParam = {};
  /** 要被刪除的List */
  deleteList = [];
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
    },
    subField: {
      id: 'svg_8',
      title: this.translateService.instant('subfield'),
      // title: '子場域',
      type: 'subField',
      element: '4'
    },
    antenna: {
      id: 'svg_9',
      title: this.translateService.instant('antenna'),
      type: 'antenna',
      element: ''
    }
  };

  /** 用來判斷是否讀取完成 */
  isMovingNumber = true;

  /** 當下互動物件的id */
  svgId;
  svgNum = 1;
  svgAntNum = '1.1';
  selectBsSvgId = '';
  selectAntSvgId = '';
  /** 新增物件的起始pixel位置 */
  initpxl = 50;
  /** 互動物件的真實id，避免互動時id錯亂用 */
  realId;
  /** 互動物件的tooltip */
  tooltipStr = '';
  /** 4捨5入格式化 */
  roundFormat = Plotly.d3.format('.1f');
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
  candidateWidth = 32;
  /** candidate height */
  candidateHeight = 32;
  /** 右鍵選單position */
  menuTopLeftStyle = { top: '0', left: '0' };
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
    'mctsTemperature', 'mctsTime', 'mctsTestTime', 'mctsTotalTime', 'resolution', 'maxConnectionNum', 'geographicalNorth'];

  /** task id */
  taskid = '';
  /** progress interval */
  progressInterval = 0;
  /** polling interval  */
  pollingInterval = 0;
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
  antSpanStyle = {};
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
  /** candidate、Ant編號 style */
  circleStyle = {};
  /** defaultBs編號 style */
  dfBsCircleStyle = {};
  /** workbook */
  wb: XLSX.WorkBook;
  /** 互動區域範圍 */
  dragStyle = {};
  dragTimes = 0;
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
  /** defaultBs的號碼預設顏色 */
  DEFAULT_BS_CIRCLE_COLOR = '#338aee';
  /** candidate預設顏色 */
  CANDIDATE_COLOR = '#d00a67';
  /** UE預設顏色 */
  UE_COLOR = '#0c9ccc';
  /** 單一基站最多天線數 */
  MAX_ANT_OF_BS = 10;
  /** 基站預設頻率 */
  DEFAULT_BS_FREQ = 4850;
  DEFAULT_BS_FDD_UL_FREQ = 4700;
  DEFAULT_BS_FDD_DL_FREQ = 4900;
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
  /** 左邊寬度 */
  leftWidth = 0;
  scrollLeft = 0;
  scrollTop = 0;
  /** 子場域物件 **/
  subFieldList = [];
  subFieldStyle = {};
  isShowSubField = true;
  /** 解析度List  **/
  resolutionList = [1];
  /** smart antenna **/
  manufactor = "All";
  manufactorCal = "All";
  AntennaManufactorList = [];
  AntennaIdToIndex = {};
  /**  for antenna frequency check msg **/
  infoMsg = "";
  /** http error */
  statusCode = "";
  errMsg = "";
  fieldThroughputTypeArr = [];
  ueThroughputTypeArr = [];
  fieldThroughputValueArr = [];
  ueThroughputValueArr = [];
  isBsNumberOptimization = "custom";
  isDefaultSINRSetting = "custom";
  isDefaultRSRPSetting = "custom";
  isDefaultThroughputSetting = "custom";
  isDefaultUEThroughputSetting = "customized";
  defaultArea = 95;
  defaultSINRSetting = 15;
  sinrUpperLimit = 40;
  sinrLowerLimit = -23;
  defaultRSRPSetting = -110;
  rsrpUpperLimit = -44;
  rsrpLowerLimit = -140;
  defaultULThroughputSetting = 250;
  ulThroughputUpperLimit = 800;
  ulThroughputLowerLimit = 0;
  defaultDLThroughputSetting = 350;
  dlThroughputUpperLimit = 1800;
  dlThroughputLowerLimit = 0;
  defaultUEULThroughputSetting = 5;
  defaultUEDLThroughputSetting = 5;
  antCountOfBS = 1;

  firstLayerDialogRef = null;
  secondLayerDialogRef = null;
  thirdLayerDialogRef = null;
  confirmDialogConfig = null;

  isAntennaDefault = "default";
  addAntenna = {
    antennaID: 1,
    name: "",
    type: "Directional",
    band: [],
    port: 1,
    model: "",
    manufactor: "",
    file: null,
    fileName: "",
    sha256sum: "",
    property: "customized"
  };
  editAntenna = {
    antennaID: 1,
    name: "",
    type: "",
    band: [],
    port: 1,
    model: "",
    manufactor: "",
    fileName: "",
    file: null,
    sha256sum: "",
    property: "customized",
    isNewFile: false
  };
  checkRawdataAntenna = {
    antennaID: 1,
    name: "",
    type: "",
    property: "customized",
    rawData: [],
    portList: [],
    freqList: [],
    selectPort: '',
    selectFreq: 0,
    selectPortGain: 0
  };
  dftOmiAntSimulationTxGain = 0;
  antennaWarnMsg = {
    name: "",
    band: "",
    port: "",
    model: "",
    manufactor: "",
    file: "",
    changePortFreqTitle: "",
    changePort: "",
    changeFreq: ""
  }
  defaultAntennaPage = 1;
  customizedAntennaPage = 1;
  maxAntRowInPage = 10;

  fieldStr = {
    coverage: "field.coverage",
    sinr: "field.sinr",
    rsrp: "field.rsrp",
    throughput: "field.throughput",
  };
  ueStr = {
    coverage: "ue.coverage",
    throughputByRsrp: "ue.throughputByRsrp",
  };
  evaluationString = {
    field: this.fieldStr,
    ue: this.ueStr
  };

  testColor = 'background-color: #FF0000 !important;';
  root = document.documentElement;

  // useSmartAntenna = "false";
  /** 畫圖物件 */
  @ViewChild('chart') chart: ElementRef;
  /** 高度設定燈箱 */
  @ViewChild('materialModal') materialModal: TemplateRef<any>;
  @ViewChild('materialModal2') materialModal2: TemplateRef<any>;
  /** RF設定燈箱 */
  @ViewChild('RfModal') rfModal: TemplateRef<any>;
  @ViewChild('RfModalTable') rfModalTable: TemplateRef<any>;
  @ViewChild('AntRfModalTable') antRfModalTable: TemplateRef<any>;
  @ViewChild('UeModalTable') ueModalTable: TemplateRef<any>;
  @ViewChild('SINRModalTable') SINRModalTable: TemplateRef<any>;
  @ViewChild('FieldCoverageModalTable') FieldCoverageModalTable: TemplateRef<any>;
  @ViewChild('RSRPModalTable') RSRPModalTable: TemplateRef<any>;
  @ViewChild('ThroughputModalTable') ThroughputModalTable: TemplateRef<any>;
  @ViewChild('UECoverageModalTable') UECoverageModalTable: TemplateRef<any>;
  @ViewChild('UEThroughputModalTable') UEThroughputModalTable: TemplateRef<any>;
  @ViewChild('AntennaModalTable') AntennaModalTable: TemplateRef<any>;
  @ViewChild('AddAntennaModalTable') AddAntennaModalTable: TemplateRef<any>;
  @ViewChild('EditAntennaModalTable') EditAntennaModalTable: TemplateRef<any>;
  @ViewChild('CheckAntennaRawdataModalTable') CheckAntennaRawdataModalTable: TemplateRef<any>;
  @ViewChild('AntennaWarnMsgModalTable') AntennaWarnMsgModalTable: TemplateRef<any>;
  @ViewChild('AntCountOfBSModal') AntCountOfBSModal: TemplateRef<any>;
  /** 新增自訂材質 */
  @ViewChild('materialCustomizeModal') materialCustomizeModal: TemplateRef<any>;
  @ViewChild('modelCustomizeModal') modelCustomizeModal: TemplateRef<any>;
  @ViewChild('confirmDeleteMaterial') confirmDeleteMaterial: TemplateRef<any>;
  @ViewChild('confirmDeleteModel') confirmDeleteModel: TemplateRef<any>;
  @ViewChild('createModelSuccessModal') createModelSuccessModal: TemplateRef<any>;
  @ViewChild('createMaterialSuccessModal') createMaterialSuccessModal: TemplateRef<any>;
  @ViewChild('calculateModelSuccessModal') calculateModelSuccessModal: TemplateRef<any>;
  @ViewChild('coordinateInfoModal') coordinateInfoModal: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;
  @ViewChild('deleteModal2') deleteModal2: TemplateRef<any>;
  @ViewChild('changeToSimulationModal') changeToSimulationModal: TemplateRef<any>;
  /** 統計圖 效能分析 */
  @ViewChild('dftOmiAntGain') dftOmiAntGain: any; 
  // @ViewChild('deleteModal3') deleteModal3: TemplateRef<any>;
  // @ViewChild('deleteModal4') deleteModal4: TemplateRef<any>;
  // @ViewChild('deleteModal5') deleteModal5: TemplateRef<any>;


  // WiFi頻段:2.4G+5G
  wifiFreqList2_4g = [
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
  ]
  wifiFreqList5g = [
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
  ]

  //4G 5G WiFi new attribute
  duplexMode = "tdd";
  dlRatio = 70;
  scalingFactor = 1;
  rsrpThreshold = -90;
  sinrThreshold = 15;

  tempCalParamSet = {
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
    phi: 0,
    isAntennaDefault: 'default'
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

  @HostListener('window:resize') windowResize() {
    try {
      this.moveable.ngOnDestroy();
    }
    catch (error)
    {
      console.log(JSON.stringify(error));
    }
    this.chartResize();
  }

  // @Input()
  // duplexMode = "fdd";
  // tempDuplexMode;

  ngOnChanges(changes) {
    console.log(changes);
  }

  ngAfterViewInit(): void
  {
    this.pollingLoading();
    // 物件就位後再顯示
    this.chart.nativeElement.style.opacity = 0;
    this.resetChartWidth();
    // 隱藏規劃目標及場域設定的button位置跑掉
    const matSidenav: HTMLElement = <HTMLElement>document.querySelector('.mat-sidenav');
    const matSidenavContent: HTMLElement = document.querySelector('.mat-sidenav-content');
    matSidenav.style.width = matSidenavContent.style.marginRight;

    //取得天線資料
    //this.getAntenna();
    
  }

  pollingLoading()
  {
    //此處方法為每5秒檢查一次是否還有執行this.moveNumber()，若有則代表還在讀取，若無則代表已經有至少5秒沒有執行this.moveNumber()，視為讀取完畢
    this.authService.spinnerShow();
    if (this.isMovingNumber)
    {
      setTimeout(() =>
      {
        this.pollingLoading();
      }, 2000);
      this.isMovingNumber = false;
    }
    else
    {
      this.authService.spinnerHide();
    }
  }
  

  ngOnInit()
  {
    window.sessionStorage.removeItem('tempParamForSelect');
    if (!sessionStorage.getItem('rsrpThreshold')) {
      sessionStorage.setItem('rsrpThreshold', JSON.stringify(-90));
      this.rsrpThreshold = -90;
    } else {
      this.rsrpThreshold = Number(sessionStorage.getItem('rsrpThreshold'));
    }
    if (!sessionStorage.getItem('sinrThreshold')) {
      sessionStorage.setItem('sinrThreshold', JSON.stringify(15));
      this.sinrThreshold = 15;
    } else {
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
    this.route.queryParams.subscribe(params => {
      if (typeof params['taskId'] !== 'undefined') {
        this.taskid = params['taskId'];
        if (params['isHst'] === 'true') {
          this.isHst = true;
        }
      }
    });

    //取得材質列表
    const promise = new Promise((resolve, reject) => {
      let url_obs = `${this.authService.API_URL}/getObstacle/${this.authService.userToken}`;
      this.materialIdToIndex = {};
      this.http.get(url_obs).subscribe(
        res => {
          // console.log("----get",url_obs);
          let result = res;
          this.materialList = Object.values(result);
          // console.log('this.materialList',this.materialList);
          // let sorted = this.materialList.sort((a,b) => a.id - b.id);
          this.materialId = this.materialList[0]['id'];
          for (let i = 0; i < this.materialList.length; i++) {
            let id = this.materialList[i]['id'];
            this.materialIdToIndex[id] = i;
          }
          resolve(res);
        },
        err => {
          console.log(err);
          return reject(err);
        }
      );
    });
    //取得模型列表
    promise.then((promiseResult) => new Promise((resolve, reject) => {
      console.log(promiseResult);
      this.modelIdToIndex = {};
      let url_model = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
      this.http.get(url_model).subscribe(
        res => {
          // console.log("----get",url_model);
          let result = res;
          this.modelList = Object.values(result);
          // let sorted = this.modelList.sort((a,b) => a.id - b.id);
          for (let i = 0; i < this.modelList.length; i++) {
            // if( this.modelList[i]['name'].includes("Pegatron") ){
            //   this.modelList[i]['name'] = this.modelList[i]['name'].replace("Pegatron","P")
            //   this.modelList[i]['chineseName'] = this.modelList[i]['chineseName'].replace("和碩","P")
            // }
            let id = this.modelList[i]['id'];
            this.modelIdToIndex[id] = i;
          }
          resolve(res);
        }, err => {
          console.log(err);
          return reject(err);
        }
      );
    }).then(promiseResult => new Promise((resolve, reject) => {
      console.log(promiseResult);
      /*let url_Ant = `${this.authService.API_URL}/getAntenna/${this.authService.userToken}`;
      // let url_model = `http://192.168.1.109:4444/antenna`;
      this.http.get(url_Ant).subscribe(
        res => {
          let result = res;
          this.antennaList = Object.values(result);
          for (let i = 0; i < this.antennaList.length; i++) {
            let id = this.antennaList[i]['antennaID'];
            this.AntennaIdToIndex[id] = i;
            // if( this.antennaList[i]['antennaName'].includes("Pegatron") ){
            //   this.antennaList[i]['antennaName'] = this.antennaList[i]['antennaName'].replace("Pegatron","P")
            //   this.antennaList[i]['chinese_name'] = this.antennaList[i]['chinese_name'].replace("Pegatron","P")
            //   this.antennaList[i]['manufactor'] = this.antennaList[i]['manufactor'].replace("Pegatron","P")
            // }
          }
          for (let item of this.antennaList) {
            if (!(this.AntennaManufactorList.includes(item['manufactor']))) {
              this.AntennaManufactorList.push(item['manufactor']);
            }
          }
          console.log(result);
        }, err => {
          console.log(err);
        }
      );*/
      let url = `${this.authService.API_URL}/getAntenna/${this.authService.userToken}`;
      console.log("1")
      this.http.get(url).subscribe(
        res =>
        {
          let result = res;

          this.antennaList = Object.values(result);

          this.allAntennaList = [];
          for (var ant = 0; ant < this.antennaList.length; ant++)
          {
            this.allAntennaList.push
              (
              {
                antennaID: this.antennaList[ant].antennaID,
                name: this.antennaList[ant].antennaName,
                type: this.antennaList[ant].antennaType,
                band: this.antennaList[ant].band,
                availableFrequency: this.antennaList[ant].availableFrequency,
                port: this.antennaList[ant].availableFrequency[0].ports.length,
                model: this.antennaList[ant].model,
                manufactor: this.antennaList[ant].manufactor,
                fileName: `${this.antennaList[ant].antennaName}.xlsx`,
                property: this.antennaList[ant].property
              }
              );
          }
          
          this.defaultAntennaList = [];
          this.customizedAntennaList = [];
          for (var ant = 0; ant < this.allAntennaList.length; ant++)
          {
            if (this.allAntennaList[ant].property == 'default')
            {
              console.log(this.allAntennaList[ant]);
              this.defaultAntennaList.push(this.allAntennaList[ant]);
            }
            else 
            {
              console.log(this.allAntennaList[ant]);
              this.customizedAntennaList.push(this.allAntennaList[ant]);
            }
          }

          resolve(res);
        },
        err =>
        {
          reject(err);
          console.log(err);
        }
      );
      })).then(() =>
      {
        console.log("2")
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
              // console.log("----request url:",url);
              if (this.isHst) {
                const result = res;
                console.log(result);
                const output = this.formService.setHstOutputToResultOutput(result['output']);
                // delete result['output'];
                // 大小寫不同，各自塞回form
                console.log(result);
                // console.log(output);
                this.dlRatio = result['tddframeratio'];
                this.calculateForm = this.formService.setHstToForm(result);


                //this.statistics.result = output;
                //this.statistics.drawChart(false);
                //console.log("this.statistics.drawChart");



                this.isBsNumberOptimization = this.formService.setHstToBsNumOpt(result);
                this.evaluationFuncForm = this.calculateForm.evaluationFunc;
                this.checkEvaluationFuncForm();
                this.oldFormatEvaluation();
                this.changeAreaFormatToPercent();
                console.log("this.evaluationFuncForm = " + JSON.stringify(this.evaluationFuncForm));
                this.setThroughputTypeAndValue();
                this.setStorageEvaluationFuncForm();

                if (!(Number(this.calculateForm.maxConnectionNum) > 0)) {
                  this.calculateForm['maxConnectionNum'] = 32;
                }
                if (!(Number(this.calculateForm.resolution) > 0)) {
                  this.calculateForm['resolution'] = 1;
                }
                if (this.authService.isEmpty(this.calculateForm.geographicalNorth)) {
                  this.calculateForm['geographicalNorth'] = 0;
                }
                // this.calculateForm.defaultBs = output['defaultBs'];
                // this.calculateForm.bsList = output['defaultBs'];
                if (!(this.calculateForm.pathLossModelId in this.modelIdToIndex)) {
                  if (this.calculateForm.pathLossModelId < this.modelList.length) {
                    this.calculateForm.pathLossModelId = this.modelList[this.calculateForm.pathLossModelId]['id'];
                  }
                  else {
                    this.calculateForm.pathLossModelId = this.modelList[0]['id'];
                  }
                }
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
                // this.hstOutput['gaResult']['connectionMapAll'] = output['connectionMapAll'];
                this.hstOutput['gaResult']['rsrpMap'] = output['rsrpMap'];
                this.hstOutput['gaResult']['ulThroughputMap'] = output['ulThroughputMap'];
                this.hstOutput['gaResult']['dlThroughputMap'] = output['throughputMap'];
                if (this.calculateForm.isSimulation === true) {
                  this.planningIndex = '3';
                }
                else {
                  var isFieldOrUEActive = this.changePlaningIndexByEvaluationForm();
                  this.setPlanningIndex();
                  console.log("this.planningIndex = " + this.planningIndex);

                  // 此if的block是為了相容舊版本產生的場域，若以後開放sinr相關目標請拿掉
                  // if(!isFieldOrUEActive)
                  // {
                  //   if (this.calculateForm.isCoverage || this.calculateForm.isAverageSinr) 
                  //   {                  
                  //     this.planningIndex = '1';console.log(this.planningIndex);
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
                } catch (e) {
                  // console.log('No ulThorughput data, it may be an old record');
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
                } catch (e) {
                  // console.log('No dlThorughput data, it may be an old record');
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
                console.log(res);
                this.calculateForm = res['input'];

                if (this.calculateForm.isSimulation === true) {
                  this.planningIndex = '3';
                } else {
                  if (this.calculateForm.isCoverage || this.calculateForm.isAverageSinr) {
                    // if (this.calculateForm.isCoverage || this.calculateForm.isAvgThroughput || this.calculateForm.isAverageSinr) {
                    this.planningIndex = '1';console.log(this.planningIndex);
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

              // console.log(this.calculateForm);
              if (window.sessionStorage.getItem(`form_${this.taskid}`) != null) {
                // 從暫存取出
                // this.calculateForm = JSON.parse(window.sessionStorage.getItem(`form_${this.taskid}`));
              }
              // console.log(this.calculateForm);
              this.initData(false, false, '');
            },
            err => {
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: this.translateService.instant('cant_get_result')
              };
              this.authService.spinnerHide();
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
          this.initData(false, false, '');
          if (!(this.calculateForm.pathLossModelId in this.modelIdToIndex)) {
            this.calculateForm.pathLossModelId = this.modelList[0]['id'];
          }

          // evaluationForm初始值
          this.planningIndex = '1';console.log(this.planningIndex);
          this.evaluationFuncForm = new EvaluationFuncForm();
          if (this.evaluationFuncForm.field.sinr.ratio.length == 0)
            this.addSINR();

          if (this.evaluationFuncForm.field.rsrp.ratio.length == 0)
            this.addRSRP();

          if (this.evaluationFuncForm.field.throughput.ratio.length == 0)
            this.addThroughput();

          if (this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
            this.addUEThroughput();
        }


        // setTimeout(()=> {
        //   if (this.calculateForm.defaultBs !== "") {
        //     this.planningIndex = '3';

        //     console.log('Simulation')
        //   } else {
        //     this.planningIndex = '1';console.log(this.planningIndex);
        //     console.log('Calculation')
        //   }
        // }, 1000);


      }

    })
      .catch(err => console.log(err))
    )


  }

  checkHeiWidAlt(fieldOrId , altitude, zValueArr) {
    console.log('Check altitdue function works:'+ altitude + ' Field altitude:' + this.calculateForm.altitude);
    altitude = Number(altitude);
    let msg = '';
    if (altitude < 0 || altitude > this.calculateForm.altitude) {
      if (altitude < 0) {
        msg = this.translateService.instant('alt_less_0');
      } else {
        msg = this.translateService.instant('alt_greater_than_field');
      }
      // 障礙物or基地台
      if (fieldOrId.length > 1) { //障礙物
        this.dragObject[fieldOrId].altitude = this.calculateForm.altitude;
      } else { //zValue
        let existed = false;
        for (let i = 0;i < this.zValues.length;i++) {
          // if (this.zValues[i] == this.calculateForm.altitude.toString()) {
          if (this.zValues[i] == this.calculateForm.altitude) {
            existed = true;
          }
        }
        if (!existed) {
          this.zValues[Number(fieldOrId)] = Number(this.calculateForm.altitude);
          // this.zValues[Number(fieldOrId)] = this.calculateForm.altitude.toString();
        } else {
          delete this.zValues[Number(fieldOrId)];
        }
      }
    }
    //zValues
    if (fieldOrId.length == 1) {
      // 先檢視是否有重複高度
      for (let i = 0; i < 3; i++) {
        if (Number(fieldOrId) == i) {
          continue;
        } else {
          if (Number(this.zValues[i]) == altitude) { //找到重複高度的了 刪掉剛剛改的zValue
            delete this.zValues[Number(fieldOrId)];
            msg = this.translateService.instant('already_same_alt');
            if (i == 0 && this.zValues[1] === undefined && this.zValues[2] === undefined) {
              this.zValues.length = 1;
              console.log(this.zValues);
            } else if (i == 0 && this.zValues[1] !== undefined && this.zValues[2] === undefined){
              this.zValues.length = 2;
            } else if (i == 0 && this.zValues[1] === undefined && this.zValues[2] === undefined){
              this.zValues.length = 3;
            } else if (i == 1){
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
        } else if (this.zValues[1] !== undefined && this.zValues[2] !== undefined) {
          this.zValues[0] = this.zValues[1];
          this.zValues[1] = this.zValues[2];
          delete this.zValues[2];
          this.zValues.length = 2;
        } else if (this.zValues[1] === undefined && this.zValues[2] !== undefined) {
          this.zValues[0] = this.zValues[2];
          delete this.zValues[2];
          this.zValues.length = 1;
        } else if (this.zValues[1] !== undefined && this.zValues[2] === undefined) {
          this.zValues[0] = this.zValues[1];
          delete this.zValues[1];
          this.zValues.length = 1;
        }
      } else if (this.zValues[1] === undefined || this.zValues[1] === null) {
        if (this.zValues[0] === undefined && this.zValues[2] === undefined) {
          this.zValues[0] = 0;
          this.zValues.length = 1;
        } else if (this.zValues[0] !== undefined && this.zValues[2] !== undefined) {
          this.zValues[1] = this.zValues[2];
          delete this.zValues[2];
          this.zValues.length = 2;
        } else if (this.zValues[0] !== undefined && this.zValues[2] === undefined) {
          delete this.zValues[1];
          this.zValues.length = 1;
        } else if (this.zValues[0] === undefined && this.zValues[2] !== undefined) {
          this.zValues[0] = this.zValues[2];
          delete this.zValues[2];
          this.zValues.length = 1;
        }
      } else if (this.zValues[2] === undefined || this.zValues[2] === null) {
        if (this.zValues[0] === undefined && this.zValues[1] === undefined) {
          this.zValues[0] = 0;
          this.zValues.length = 1;
        } else if (this.zValues[0] === undefined && this.zValues[1] !== undefined) {
          this.zValues[0] = this.zValues[1];
          delete this.zValues[1];
          this.zValues.length = 1;
        } else if (this.zValues[0] !== undefined && this.zValues[1] === undefined) {
          this.zValues[1] = this.zValues[2];
          delete this.zValues[2];
          this.zValues.length = 2;
        } else { 
          this.zValues.length = 2;
        }
      }
      for (let i = 0;i < 3;i++) {
        for (let j = 0;j < 3;j++) {
          if (Number(this.zValues[i]) < Number(this.zValues[j])) {
            let temp = this.zValues[i];
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
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }
  }

  /**
   * 離開頁面
   */
  ngOnDestroy(): void
  {
    this.setForm();
    // 暫存
    // window.sessionStorage.clear();
    if (this.taskid !== '') {
      // window.sessionStorage.setItem(`form_${this.taskid}`, JSON.stringify(this.calculateForm));
    } else {
      window.sessionStorage.setItem(`form_blank_task`, JSON.stringify(this.calculateForm));
    }
    if (typeof this.progressInterval !== 'undefined') {
      window.clearInterval(this.progressInterval);
      for (let i = 0; i < this.progressInterval; i++) {
        window.clearInterval(i);
      }
    }
    try
    {
      this.moveable.destroy();
    }
    catch (error)
    {
      console.log(JSON.stringify(error));
    }
    document.querySelector('body').style.overflow = 'auto';
  }

  tempParamStorageForSelect (temp) {
    // console.log(window.sessionStorage.getItem('tempParamForSelect'));
    if (null == window.sessionStorage.getItem('tempParamForSelect')) {
      // console.log('tempParamStorageForSelect');
      window.sessionStorage.setItem('tempParamForSelect',temp);
    }
  }

  tempParamStorage (temp) {
    window.sessionStorage.setItem('tempParam',temp);
    // console.log("--this.dragObject",this.dragObject);
  }

  checkFieldWidHei(isHWChange) {
    // this.deleteList.length = 0;
    // FoolProof Height and Width -----------------------
    if (isHWChange == 'width' || isHWChange == 'height') {
      //障礙物
      for (let i = 0;i < this.obstacleList.length;i++) {
        if (isHWChange == 'width') {
          if (this.calculateForm.width < this.dragObject[this.obstacleList[i]].x) {
            this.deleteList.push([this.obstacleList[i],i]);
          } else if (this.calculateForm.width < this.dragObject[this.obstacleList[i]].x + this.dragObject[this.obstacleList[i]].width) {
            this.deleteList.push([this.obstacleList[i],i]);
          } else { //rotation

          }
        } else {
          if (this.calculateForm.height < this.dragObject[this.obstacleList[i]].y) {
            this.deleteList.push([this.obstacleList[i],i]);
          } else if (this.calculateForm.height < this.dragObject[this.obstacleList[i]].y + this.dragObject[this.obstacleList[i]].head) {
            this.deleteList.push([this.obstacleList[i],i]);
          } else { //rotation

          }
        }
      }
      //既有基地台
      for (let i = 0;i < this.defaultBSList.length;i++) {
        if (isHWChange == 'width') {
          if (this.calculateForm.width < this.dragObject[this.defaultBSList[i]].x) {
            this.deleteList.push([this.defaultBSList[i],i]);
          }
        } else {
          if (this.calculateForm.height < this.dragObject[this.defaultBSList[i]].y) {
            this.deleteList.push([this.defaultBSList[i],i]);
          }
        }
      }
      //待選基地台
      for (let i = 0;i < this.candidateList.length;i++) {
        if (isHWChange == 'width') {
          if (this.calculateForm.width < this.dragObject[this.candidateList[i]].x) {
            this.deleteList.push([this.candidateList[i],i]);
          }
        } else {
          if (this.calculateForm.height < this.dragObject[this.candidateList[i]].y) {
            this.deleteList.push([this.candidateList[i],i]);
          }
        }
      }
      // UE
      for (let i = 0;i < this.ueList.length;i++) {
        if (isHWChange == 'width') {
          if (this.calculateForm.width < this.dragObject[this.ueList[i]].x) {
            this.deleteList.push([this.ueList[i],i]);
            console.log('push',this.ueList[i],i);
          }
        } else {
          if (this.calculateForm.height < this.dragObject[this.ueList[i]].y) {
            this.deleteList.push([this.ueList[i],i]);
          }
        }
      }
      if (this.deleteList.length != 0) {
        console.log(this.deleteList);
        console.log(this.defaultBSList);
        this.matDialog.open(this.deleteModal2);
      } else {
        this.initData(false, false, 'delete');
      }
    }
  }

  /**
   * init Data
   * @param isImportXls 是否import xlxs
   * @param isImportImg 是否import image
   */
  initData(isImportXls, isImportImg, isHWAChange) {
    // console.log('--initData.');

    try
    {
      this.createResolutionList();
      //檢查有沒有場域長寬高被改成負數
      if (this.calculateForm.height < 0 || this.calculateForm.altitude <= 0 || this.calculateForm.width < 0) {
        if (this.calculateForm.height < 0) {
          this.calculateForm.height = Number(window.sessionStorage.getItem('tempParam'));
          window.sessionStorage.removeItem('tempParam');
          // this.calculateForm.height = 100;
        } else if (this.calculateForm.altitude <= 0) {
          this.calculateForm.altitude = Number(window.sessionStorage.getItem('tempParam'));
          window.sessionStorage.removeItem('tempParam');
          // this.calculateForm.altitude = 3;
        } else {
          this.calculateForm.width = Number(window.sessionStorage.getItem('tempParam'));
          window.sessionStorage.removeItem('tempParam');
          // this.calculateForm.width = 100;
        }
        let msg = this.translateService.instant('field_alt_less_0');
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      }

      // FoolProof Altitude
      if (isHWAChange == 'altitude') { 
        let msg = this.translateService.instant('field_alt_fix_then_all_fix');
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

        //檢查場域高度有沒有小於場域所有的物件高度
        //zValues
        for (let i = 0;i < this.zValues.length;i++) {
          if (this.calculateForm.altitude < Number(this.zValues[i])) {
            delete this.zValues[i];
          }
        }
        if (this.zValues[0] == undefined && this.zValues[1] == undefined && this.zValues[2] == undefined) {
          this.zValues[0] = 0;
          this.zValues.length = 1;
        } else if (this.zValues[0] != undefined && this.zValues[1] != undefined && this.zValues[2] == undefined) {
          this.zValues.length = 2;
        } else if (this.zValues[0] != undefined && this.zValues[1] == undefined && this.zValues[2] == undefined) {
          this.zValues.length = 1;
        }
        //障礙物
        for (let i = 0;i < this.obstacleList.length;i++) {
          // console.log('障礙物'+this.dragObject[this.obstacleList[i]].altitude+' '+this.calculateForm.altitude);
          if (this.calculateForm.altitude < this.dragObject[this.obstacleList[i]].altitude) {
            this.dragObject[this.obstacleList[i]].altitude = this.calculateForm.altitude;
            // console.log('障礙物高度被修改成場域高度'+this.dragObject[this.obstacleList[i]].altitude);
          }
        }
        //既有基地台
        for (let i = 0;i < this.defaultBSList.length;i++) {
          // console.log('既有基地台'+this.dragObject[this.defaultBSList[i]].altitude+' '+this.calculateForm.altitude);
          if (this.calculateForm.altitude < this.dragObject[this.defaultBSList[i]].altitude) {
            this.dragObject[this.defaultBSList[i]].altitude = this.calculateForm.altitude;
            // console.log('既有基地台高度被修改成場域高度'+this.dragObject[this.defaultBSList[i]].altitude);
          }
        }
        //待選基地台
        for (let i = 0;i < this.candidateList.length;i++) {
          if (this.calculateForm.altitude < this.dragObject[this.candidateList[i]].altitude) {
            this.dragObject[this.candidateList[i]].altitude = this.calculateForm.altitude;
          }
        }
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
        margin: { t: 20, b: 20, l: 50, r: 50}
      };

      window.setTimeout(() => {
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
              // this.chartService.calSize(this.calculateForm, gd).then(res => {
              //   const layoutOption = {
              //     width: res[0],
              //     height: res[1]
              //   };
              //   // image放進圖裡後需取得比例尺
              //   Plotly.relayout('chart', layoutOption).then((gd2) => {
                  // 計算比例尺
                  this.calScale(gd);
                  if (isImportXls) {
                    // import xlsx
                    this.setImportData();
                  } else if (isImportImg) {
                    // do noting
                  } else if (this.taskid !== '' || sessionStorage.getItem('form_blank_task') != null) {
                    // 編輯
                    if (isHWAChange !== '') {
                      // this.edit(false);
                    } else {
                      this.edit(true);
                    }
                    console.log(this.calculateForm);
                  }
                  // 重設場域尺寸與載入物件
                  this.chartResize();
              //   }); 
              // });
            });
          };
    
        } else {
          // this.plotLayout['width'] = window.innerWidth * 0.68;
          // this.plotLayout['width'] = window.innerWidth;
          // draw background image chart
          Plotly.newPlot('chart', {
            data: [],
            layout: this.plotLayout,
            config: defaultPlotlyConfiguration
          }).then((gd) => {
            // this.chartService.calSize(this.calculateForm, gd).then(res => {
            //   const layoutOption = {
            //     width: res[0],
            //     height: res[1]
            //   };
            //   // 重設長寬
            //   Plotly.relayout('chart', layoutOption).then((gd2) => {
                  
                // 計算比例尺
                this.calScale(gd);
                // import xlsx
                if (isImportXls) {
                  this.setImportData();
                } else if (isImportImg) {
                  // do nothing
                } else if (this.taskid !== '' || sessionStorage.getItem('form_blank_task') != null) {
                  // 編輯
                  console.log(this.calculateForm);
                  if (isHWAChange !== '') {
                    // this.edit(false);
                  } else {
                    this.edit(true);
                  }
                }
                // 重設場域尺寸與載入物件
                this.chartResize();
            //   });
            // });
            
          });
        }

        if (isHWAChange != '') {
          window.setTimeout(() => {
            for (const item of this.obstacleList) {
              if (this.dragObject[item].element == '2') {
                // 切換場域尺寸後圓形會變形，重新初始化物件設定長寬
                this.moveClick(item);
                this.target = document.querySelector(`#${item}`);
                this.setTransform(this.target);
                const width = this.target.getBoundingClientRect().width;
                this.frame.set('height', `${width}px`);
                this.frame.set('width', `${width}px`);
                const x = (width / 2).toString();
                this.ellipseStyle[this.svgId].rx = x;
                this.ellipseStyle[this.svgId].ry = x;
                this.ellipseStyle[this.svgId].cx = x;
                this.ellipseStyle[this.svgId].cy = x;
                this.moveable.destroy();
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
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
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

  checkSize(width, height, w, h) {
    if (width > height) {
      w--;
      this.pixelXLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.width])
        .range([0, w]);
      width = Math.ceil(this.pixelXLinear(5));
    } else if (width < height) {
      h--;
      this.pixelYLinear = Plotly.d3.scale.linear()
        .domain([0, this.calculateForm.height])
        .range([0, h]);
      height = Math.ceil(this.pixelXLinear(5));
    }
    if (width !== height) {
      console.log(width, height);
      this.checkSize(width, height, w, h);
    } else {
      console.log(width, height, w, h);
    }

    return [w, h];
  }
  /**
   * dataURI to blob
   * @param dataURI
   */
  dataURLtoBlob(dataURI) {
    let byteString;
    try
    {
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
    catch (error) {
      console.log(error);
      // fail xlsx
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('xlxs.fail')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      throw error;
    }
  }

  /**
   * 新增互動物件
   * @param id 
   */
  addMoveable(id)
  {
    /*if (this.planningIndex == '3')
    {
      if (id == 'defaultBS' && this.antCountOfBS <= 0)
      {
        let msg = this.translateService.instant('bs.antenna.count.error.msg');
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }
    }*/

    try
    {
      this.moveable.destroy();
    }
    catch (error) { }


    
    this.closeFirstLayer();

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
    } else if (id === 'defaultBS')
    {

      if (this.planningIndex == '3' && this.antCountOfBS > this.MAX_ANT_OF_BS)     //+1代表基站本身的天線
      {
        let msg = this.translateService.instant('antenna.greater.than.max').replace("{0}", this.MAX_ANT_OF_BS);
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }
      else if (this.planningIndex == '3' && this.antCountOfBS <= 0)
      {
        let msg = this.translateService.instant('bs.antenna.count.error.msg');
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }

      this.svgId = `${id}_${this.generateString(10)}`;
      this.selectBsSvgId = this.svgId;
      this.colorList[this.svgId] = this.authService.getRandomColorByHsl(this.planningIndex, this.defaultBSList.length);
      this.defaultBSList.push(this.svgId);
      color = this.colorList[this.svgId][1];
      this.pathStyle[this.svgId] = {
        fill: this.colorList[this.svgId][1]
      };
      //Add bs RF param
      this.bsListRfParam[this.svgId] = {
        txpower: 0,
        beampattern: 0,
        fddDlFrequency: this.DEFAULT_BS_FDD_DL_FREQ,
        fddUlFrequency: this.DEFAULT_BS_FDD_UL_FREQ,
        ulModulationCodScheme: "64QAM-table",
        dlModulationCodScheme: "64QAM-table",
        dlMimoLayer: this.allAntennaList[0].availableFrequency[0].ports.length,
        ulMimoLayer: this.allAntennaList[0].availableFrequency[0].ports.length,
        //TDD 5G
        tddscs: '15',
        tddbandwidth: '5',
        tddfrequency: this.DEFAULT_BS_FREQ,
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

        isAntennaDefault: this.allAntennaList[0].property,
        AntennaId: this.allAntennaList[0].antennaID,
        antennaType: this.allAntennaList[0].type,
        antennaManufactor: this.allAntennaList[0].manufactor,
        ulAntFreq: this.allAntennaList[0].availableFrequency[0].frequency,
        dlAntFreq: this.allAntennaList[0].availableFrequency[0].frequency,

        theta: 0,
        phi: 0,
        antenna:[]
      };
      if (this.calculateForm.objectiveIndex === '0') {
        this.bsListRfParam[this.svgId].dlBandwidth = '1.4';
        this.bsListRfParam[this.svgId].ulBandwidth = '1.4';
      } else if (this.calculateForm.objectiveIndex == '2') {
        this.bsListRfParam[this.svgId].wifiBandwidth = '20'
      }
      if (this.planningIndex == '3')
      {
        this.addBSAntenna(this.antCountOfBS - 1);
        this.antCountOfBS = 1;   
      }   
    }
    else if (id === 'candidate')
    {
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
        antennaType: 'Omnidirectional',
        antennaManufactor: '',
        ulAntFreq: -1,
        dlAntFreq: -1,
        theta:0,
        phi: 0,
        isAntennaDefault: 'default'
      };
      if (Number(this.calculateForm.objectiveIndex) === 0) {
        this.bsListRfParam[this.svgId].dlBandwidth = '1.4';
        this.bsListRfParam[this.svgId].ulBandwidth = '1.4';
      }
    } else if (id === 'UE') {
      color = this.UE_COLOR;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.ueList.push(this.svgId);
      this.ueListParam[this.svgId] = {
        ueRxGain:0
      };
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
    } else if (id === 'subField') {
      this.isShowSubField = true;
      this.svgId = `${id}_${this.generateString(10)}`;
      this.subFieldList.push(this.svgId);
      this.subFieldStyle[this.svgId] = {
        width: 30,
        height: 30,
        // fill: '#ffffff',
        fill: 'pink',
        fillOpacity:0.2,
        stroke:'pink',
        // strokeWidth:5,
        strokeWidth: 3,
        // opacity: 0.5
      };
      if (sessionStorage.getItem('sub_field_coor') != undefined) {
        console.log(sessionStorage.getItem('sub_field_coor'));
        let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
        console.log(sub_field_arr);
        sub_field_arr.push({
          id: this.svgId,
          x: 0,
          y: 0,
          width: 30,
          height: 30,
          width_px: width,
          height_px: height
        });
        console.log(sub_field_arr);
        sessionStorage.setItem(`sub_field_coor`,JSON.stringify(sub_field_arr));
      } else {
        let sub_field_arr = [];
        sub_field_arr[0] = {
          id: this.svgId,
          x: 0,
          y: 0,
          width: 30,
          height: 30,
          width_px: width,
          height_px: height
        };
        
        sessionStorage.setItem(`sub_field_coor`,JSON.stringify(sub_field_arr));
      }
    }

    this.spanStyle[this.svgId] = {
      left: `${this.initpxl}px`,
      top: `${this.initpxl}px`,
      width: `${width}px`,
      height: `${height}px`
    };    

    this.svgStyle[this.svgId] = {
      display: 'inherit',
      width: width,
      height: height
    };
    let materialName = '';
    if(this.authService.lang =='zh-TW'){
      materialName = this.materialList[0]['chineseName'];
    }else{
      materialName = this.materialList[0]['name'];
    }

    let altitude = 0;
    let z = 0;
    if (id !== 'defaultBS')
    {
      altitude = this.calculateForm.altitude;
      z = 0;
    }
    else
    {
      altitude = 0;
      z = this.calculateForm.altitude;
    }

    this.dragObject[this.svgId] = {
      x: 0,
      y: 0,
      // z: this.zValues[0],
      z: z,
      width: width,
      height: height,
      altitude: altitude,
      rotate: 0,
      title: this.svgMap[id].title,
      type: this.svgMap[id].type,
      color: color,
      material: this.materialList[0]['id'],
      element: this.parseElement(id),
      materialName: materialName
    };


    if (id == 'UE'){
      this.dragObject[this.svgId].z = this.zValues[0];
    }

    this.realId = _.cloneDeep(this.svgId);
    // 預設互動外框設定值
    this.frame = new Frame({
      width: `${width}px`,
      height: `${height}px`,
      left: `${this.initpxl}px`,
      top: `${this.initpxl}px`,
      'z-index': 100,
      transform: {
        rotate: '0deg',
        scaleX: 1,
        scaleY: 1
      }
    });
    // this.initpxl += 10;

    // 圖加透明蓋子，避免產生物件過程滑鼠碰到其他物件
    this.bgdivStyle.width = `${window.innerWidth}px`;
    this.bgdivStyle.height = `${window.innerHeight}px`;
    this.bgdivStyle['z-index'] = `999999999999`;

    window.setTimeout(() => {
      this.target = document.getElementById(`${this.svgId}`);
      this.live = true;
      if (this.svgMap[id].type === 'obstacle' || this.svgMap[id].type === 'subField') {
        if (this.dragObject[this.svgId].element === 2)
        {
          // 圓形關閉旋轉
          this.moveable.rotatable = false;
          // 只開4個拖拉點
          this.moveable.renderDirections = ['nw', 'ne', 'sw', 'se'];
        } else if (this.svgMap[id].type !== 'subField')
        {
          this.moveable.rotatable = true;
          // 拖拉點全開
          this.moveable.renderDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 'se'];
        }
        else if (this.svgMap[id].type === 'subField')
        {
          this.moveable.rotatable = false;
        }
        this.moveable.resizable = true;
      } else {
        this.moveable.rotatable = false;
        this.moveable.resizable = false;
      }
      this.dragObject[this.svgId].y = this.yLinear(this.target.getBoundingClientRect().top);
      this.moveable.ngOnInit();
      window.setTimeout(() => {
        this.setDragData();
        this.currentLeft = _.cloneDeep(this.spanStyle[this.svgId].left);
        this.currentTop = _.cloneDeep(this.spanStyle[this.svgId].top);
        this.ognSpanStyle = _.cloneDeep(this.spanStyle);
        this.ognDragObject = _.cloneDeep(this.dragObject);
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

  addBSAntenna(count)
  {
    let id = 'antenna';
    let antSvgIdArray = [];
    const SHIFT_PX = 50;
    const ANT_WIDTH = 30;
    const ANT_HEIGHT = 30;

    let antLeft = ``;
    let antTop = ``;
    let xShift = 0, yShift = 0;

    const MAX_WIDTH = this.pixelXLinear(this.calculateForm.width);
    const NEXT_LINE = Math.floor((MAX_WIDTH - this.initpxl) / SHIFT_PX);
    console.log(NEXT_LINE)


    if (this.bsListRfParam[this.selectBsSvgId].antenna.length + 1 + count > this.MAX_ANT_OF_BS)     //+1代表基站本身的天線
    {
      let msg = this.translateService.instant('antenna.greater.than.max').replace("{0}", this.MAX_ANT_OF_BS);
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }

    
    
    for (let a = 0; a < count; a++)                     
    {
      this.svgId = `${id}_${this.generateString(10)}`;

      this.bsListRfParam[this.selectBsSvgId].antenna.push
      (
        {
            svgId: this.svgId,
            gain: 0, 
            theta: 0,
            phi: 0
        }
      );
      

      antSvgIdArray.push(this.svgId);

      console.log(((a + 1)))
      console.log(Math.floor((a + 1) / NEXT_LINE))
      console.log("yShift = " + Math.floor((a + 1) / NEXT_LINE) * SHIFT_PX)
      yShift = Math.floor((a + 1) / NEXT_LINE) * SHIFT_PX;
      xShift = ((a + 1) % NEXT_LINE) * SHIFT_PX;      

      antLeft = `${Number(this.initpxl + xShift)}px`;
      antTop = `${Number(this.initpxl + yShift)}px`;

      this.spanStyle[this.svgId] = {
        left: antLeft,
        top: antTop,
        width: `${ANT_WIDTH}px`,
        height: `${ANT_HEIGHT}px`
      };

      this.svgStyle[this.svgId] = {
        display: 'inherit',
        width: ANT_WIDTH,
        height: ANT_HEIGHT
      };
      let materialName = '';
      if (this.authService.lang == 'zh-TW')
      {
        materialName = this.materialList[0]['chineseName'];
      } else
      {
        materialName = this.materialList[0]['name'];
      }


      this.dragObject[this.svgId] = {
        x: this.roundFormat(this.xLinear(this.initpxl + xShift)),
        y: this.calculateForm.height - this.roundFormat(this.yLinear(this.initpxl + yShift + ANT_HEIGHT)),
        z: this.calculateForm.altitude,
        width: ANT_WIDTH,
        height: ANT_HEIGHT,
        altitude: 0,
        rotate: 0,
        title: this.svgMap[id].title,
        type: this.svgMap[id].type,
        color: this.colorList[this.selectBsSvgId][1],
        material: this.materialList[0]['id'],
        element: this.parseElement(id),
        materialName: materialName,
        belongWhichBS: this.selectBsSvgId
      };

      this.realId = _.cloneDeep(this.svgId);

      // 圖加透明蓋子，避免產生物件過程滑鼠碰到其他物件
      this.bgdivStyle.width = `${window.innerWidth}px`;
      this.bgdivStyle.height = `${window.innerHeight}px`;
      this.bgdivStyle['z-index'] = `999999999999`;
      // 還原蓋子
      this.bgdivStyle.width = `0px`;
      this.bgdivStyle.height = `0px`;
      this.bgdivStyle['z-index'] = `0`;

      this.svgAntNum = `${this.getBsIndexFromBsSvgId(this.selectBsSvgId)}.${a + 2}`;
      this.setLabel();
      
    }

    //設定場域天線座標
    for (let a = 0; a < antSvgIdArray.length; a++)
    {
      window.setTimeout(() =>
      {
        this.moveNumber(antSvgIdArray[a]);
      }, 0);

      window.setTimeout(() =>
      {
        //this.setAntPosition(antSvgIdArray[a], this.selectBsSvgId);
        this.setAntSize(antSvgIdArray[a]);
      }, 100);
    }


    console.log("this.svgId = " + this.svgId);
    console.log(`bf[${this.selectBsSvgId}] = ${JSON.stringify(this.bsListRfParam[this.selectBsSvgId])}`);
    console.log(`this.dragObject[${this.svgId}] = ${JSON.stringify(this.dragObject[this.svgId])}`);
    
    this.svgId = this.selectBsSvgId;
  }

  changeZvalue(id){
    try {
      this.moveable.destroy();
    } catch (error) { }

    //基站在計算上，不將本體高度(Height)納入考量
    if (Number(this.dragObject[id].z) < 0 || Number(this.dragObject[id].z) > Number(this.calculateForm.altitude)) {
      // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
      this.recoverParam(id,'z');
      let msg = this.translateService.instant('z_greater_then_field_altitude');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }
    this.target = document.getElementById(id);
    this.svgId = id;
    this.realId = _.cloneDeep(id);
    this.frame = new Frame({
      width: this.spanStyle[id].width,
      height: this.spanStyle[id].height,
      left: this.spanStyle[id].left,
      top: this.spanStyle[id].top,
      'z-index': 100+10*this.dragObject[this.svgId].z,
      transform: {
        rotate: `${this.dragObject[this.svgId].rotate}deg`,
        scaleX: 1,
        scaleY: 1
      }
    });
    this.setTransform(this.target);
  }
  /**
   * click互動物件
   * @param id 
   */
  moveClick(id) {
    try
    {
      this.moveable.destroy();
    }
    catch (error)
    {
      console.log(error);
    }
    // delete keycode生效
    window.setTimeout(() => {
      this.live = true;
    }, 0);
    console.log(id);
    this.moveError = false;
    this.target = document.getElementById(id);
    this.svgId = id;

    if (id.includes('defaultBs'))
    {
      this.selectBsSvgId = id;
      this.selectAntSvgId = '';
    }
    else if (id.includes('antenna'))
    {
      this.selectBsSvgId = this.dragObject[id].belongWhichBS;
      this.selectAntSvgId = id;
    }

    this.realId = _.cloneDeep(id);
    this.frame = new Frame({
      width: this.spanStyle[id].width,
      height: this.spanStyle[id].height,
      left: this.spanStyle[id].left,
      top: this.spanStyle[id].top,
      'z-index': 100+10*this.dragObject[this.svgId].z,
      transform: {
        rotate: `${this.dragObject[this.svgId].rotate}deg`,
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
      } else if (this.dragObject[id].type !== 'subField')
      {
        // console.log('Resizeeeee!');
        this.moveable.rotatable = true;
        // 拖拉點全開
        this.moveable.renderDirections = ['nw', 'n', 'ne', 'w', 'e', 'sw', 'se'];
      } else if (this.dragObject[id].type === 'subField')
      {
        // console.log('Resizeeeee!');
        this.moveable.rotatable = false;
        
      }
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
    let title = '';
    let antTitle = '';
    console.log(id);
    let antBsSvgId = '';
    let bsIndex = 0;
    let antIndex = 0;
    let antNum = '';


    if (id.includes('antenna'))
    {
      antBsSvgId = this.dragObject[id].belongWhichBS;
      bsIndex = this.getBsIndexFromBsSvgId(antBsSvgId);
      antIndex = this.getBsAntIndexBySvgId(id, antBsSvgId);
      antNum = `${bsIndex}.${antIndex + 2}`;
      antTitle = `${this.translateService.instant('antenna')}: ${antNum}`;
      title = antTitle;
    }
    else if (id.includes('defaultBS'))
    {
      bsIndex = this.getBsIndexFromBsSvgId(id);
      antNum = `${bsIndex}.${1}`;
      antTitle = `${this.translateService.instant('antenna')}: ${antNum}`;
      title = `${this.dragObject[id].title}: ${this.svgNum}<br>` + antTitle;
    }
    else
    {
      title = `${this.dragObject[id].title}: ${this.svgNum}`;
    }

    let overlappedIdList = this.checkObstacleIsOverlaped(id);
    if (overlappedIdList.length > 0){
      title += `<br>${this.translateService.instant('overlap')}: ${overlappedIdList}`;  
    }
    title +=`<br><strong>—————</strong><br>`;
    title += `X: ${this.dragObject[id].x}<br>`;
    title += `Y: ${this.dragObject[id].y}<br>`;
    if (this.dragObject[id].type === 'obstacle') {
      title += `${this.translateService.instant('altitude.start')}: ${this.dragObject[id].z}<br>`;
      title += `${this.translateService.instant('altitude.obstacle')}: ${this.dragObject[id].altitude}<br>`;
      title += `${this.translateService.instant('width')}: ${this.dragObject[id].width}<br>`;
      title += `${this.translateService.instant('height')}: ${this.dragObject[id].height}<br>`;
    /*
    } else if (this.dragObject[id].type === 'defaultBS' || this.dragObject[id].type === 'candidate') {
      // title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].altitude}<br>`;
    } else if (this.dragObject[id].type === 'subField') {

    } else {
      // title += `${this.translateService.instant('result.pdf.altitude')}: ${this.dragObject[id].z}<br>`;
    }
    if (this.dragObject[id].type === 'obstacle') {
    */
      let index = this.materialIdToIndex[Number(this.dragObject[id].material)];
      title += `${this.translateService.instant('material')}: `;
      // if(this.materialList[index]['property'] == "default"){
      title += `${this.dragObject[id].materialName}`;
      // } else {
      //   title += `${this.translateService.instant('customize')}_${this.dragObject[id].materialName}`;
      // }
      
    } else if (this.dragObject[id].type != 'subField') {
      title += `Z: ${this.dragObject[id].z}<br>`;
    }
    /*
    if (this.dragObject[id].type === 'UE') {
      title += `${this.translateService.instant('RxGain')}: ${this.ueListParam[id].ueRxGain}<br>`;
    }
    */
    return title;
  }
  checkObstacleIsOverlaped(ObjId){
    if (ObjId.split('_')[0] != "rect" && ObjId.split('_')[0] != "polygon" && ObjId.split('_')[0] != "trapezoid" && ObjId.split('_')[0] != "ellipse"){
      return [];
    }
    let overlapedIDList = [];
    let obj = this.dragObject[ObjId];
    let shape = Number(obj.element);
    // console.log("new check obstacle1:",ObjId);
    let coordinateObj = this.calculateCoordinate(obj,shape);
    let coordinate = coordinateObj[0];
    let turfobj = coordinateObj[1];
    for (let i=0; i<this.obstacleList.length; i++){
      let id = this.obstacleList[i];
      // console.log("obstacle2:",id);
      if (id == ObjId){
        continue;
      } else {
        let obj2 = this.dragObject[id];
        let shape2 = Number(obj2.element);
        let coordinateobj2 = this.calculateCoordinate(obj2,shape2);
        let coordinate2 = coordinateobj2[0];
        let turfobj2 = coordinateobj2[1];
        let interObj;
        if (shape == 2 && shape2 == 2){
          interObj = Intersection.intersectCircleCircle(coordinate[0],coordinate[1],coordinate2[0],coordinate2[1]);
        } else if(shape == 2){
          interObj = Intersection.intersectCirclePolygon(coordinate[0],coordinate[1],coordinate2);
        } else if(shape2 == 2){
          interObj = Intersection.intersectCirclePolygon(coordinate2[0],coordinate2[1],coordinate);
        } else {
          interObj = Intersection.intersectPolygonPolygon(coordinate,coordinate2);
        }
        // console.log('interObj',interObj);
        if (interObj.status == "Intersection" || interObj.status == "Inside" || booleanContains(turfobj, turfobj2) || booleanContains(turfobj2, turfobj)){
          overlapedIDList.push(i+1);
        }
      }
    }
    return overlapedIDList;
  }
  calculateCoordinate(obj,shape){
    let coordinate = [];
    let turfObj;
    let angle = Number(obj.rotate%360);
    let obWid = Number(obj.width);
    let obHei = Number(obj.height);
    let deg = 2*Math.PI/360;
    let x = Number(obj.x);
    let y = Number(obj.y);
    let tempAngle = 360 - angle; 
    if (angle < 0) {angle+=360};
    if (shape == 0) { // 0:矩形, 1:三角形, 2:正圓形, 3:梯形
      let rcc = [x+obWid/2,y+obHei/2];
      let leftbot = [x,y];
      let lefttop = [x,y+obHei];
      let rightbot = [x+obWid,y];
      let righttop = [x+obWid,y+obHei];
      if (angle == 0){
        coordinate = [
          new Point2D(leftbot[0],leftbot[1]),
          new Point2D(rightbot[0],rightbot[1]),
          new Point2D(righttop[0],righttop[1]),
          new Point2D(lefttop[0],lefttop[1])
        ];
        turfObj = polygon([[leftbot,rightbot,righttop,lefttop,leftbot]]);
      } else {
        let rotleftbot = [
          (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotlefttop = [
          (lefttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(lefttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (lefttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(lefttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotrightbot = [
          (rightbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(rightbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (rightbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(rightbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotrighttop = [
          (righttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(righttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (righttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(righttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        coordinate = [
          new Point2D(rotleftbot[0],rotleftbot[1]),
          new Point2D(rotrightbot[0],rotrightbot[1]),
          new Point2D(rotrighttop[0],rotrighttop[1]),
          new Point2D(rotlefttop[0],rotlefttop[1])
        ];
        turfObj = polygon([[rotleftbot,rotrightbot,rotrighttop,rotlefttop,rotleftbot]]);
      }
    } else if (shape == 1) { // width: X, height: Y
      let rcc = [x+obWid/2,y+obHei/2];
      let top = [x+obWid/2,y+obHei];
      let left = [x,y];
      let right = [x+obWid,y];
      if (angle == 0){
        coordinate = [
          new Point2D(left[0],left[1]),
          new Point2D(right[0],right[1]),
          new Point2D(top[0],top[1])
        ];
        turfObj = polygon([[left,right,top,left]]);
      } else {
        let rottop = [
          (top[0]-rcc[0])*Math.cos(tempAngle*deg)-(top[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (top[0]-rcc[0])*Math.sin(tempAngle*deg)+(top[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotleft = [
          (left[0]-rcc[0])*Math.cos(tempAngle*deg)-(left[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (left[0]-rcc[0])*Math.sin(tempAngle*deg)+(left[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotright = [
          (right[0]-rcc[0])*Math.cos(tempAngle*deg)-(right[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (right[0]-rcc[0])*Math.sin(tempAngle*deg)+(right[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        coordinate = [
          new Point2D(rotleft[0],rotleft[1]),
          new Point2D(rotright[0],rotright[1]),
          new Point2D(rottop[0],rottop[1])
        ];
        turfObj = polygon([[rotleft,rotright,rottop,rotleft]]);
      }
    } else if (shape == 2) { 
      let r = 0.5*obWid;
      let rx = x + r;
      let ry = y + r;
      let x1y1 = new Point2D(rx,ry);
      coordinate = [x1y1,r];
      turfObj = circle([rx,ry],r);
    } else if (shape == 3) { 
      let rcc = [x+obWid/2,y+obHei/2];
      let leftbot = [x,y];
      let lefttop = [x+obWid/4,y+obHei];
      let rightbot = [x+obWid,y];
      let righttop = [x+(3*obWid/4),y+obHei];
      if (angle == 0){
        coordinate = [
          new Point2D(leftbot[0],leftbot[1]),
          new Point2D(rightbot[0],rightbot[1]),
          new Point2D(righttop[0],righttop[1]),
          new Point2D(lefttop[0],lefttop[1])
        ];
        turfObj = polygon([[leftbot,rightbot,righttop,lefttop,leftbot]]);
      } else {
        let rotleftbot = [
          (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotlefttop = [
          (lefttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(lefttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (lefttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(lefttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotrightbot = [
          (rightbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(rightbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (rightbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(rightbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        let rotrighttop = [
          (righttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(righttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
          (righttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(righttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
        ];
        coordinate = [
          new Point2D(rotleftbot[0],rotleftbot[1]),
          new Point2D(rotrightbot[0],rotrightbot[1]),
          new Point2D(rotrighttop[0],rotrighttop[1]),
          new Point2D(rotlefttop[0],rotlefttop[1])
        ];
        turfObj = polygon([[rotleftbot,rotrightbot,rotrighttop,rotlefttop,rotleftbot]]);
      }
    }
    return [coordinate,turfObj];
  }
  setMaterialName(id,material){
    let index = this.materialIdToIndex[Number(material)];
    let materialName = '';
    if(this.authService.lang =='zh-TW'){
      materialName = this.materialList[index]['chineseName'];
    }else{
      materialName = this.materialList[index]['name'];
    }
    if(this.materialList[index]['property'] == "default"){
      this.dragObject[id].materialName = materialName;
    } else {
      this.dragObject[id].materialName = this.translateService.instant('customize') + "_" + materialName;
    }
  }
  /** set drag object data */
  setDragData() {
    const rect = this.target.getBoundingClientRect();
    const type = this.dragObject[this.svgId].element;
    let wVal;
    let hVal;
    if (this.dragObject[this.svgId].type === 'obstacle' || this.dragObject[this.svgId].type === 'subField') {
      // 障礙物才需取長寬
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
        //梯形
        wVal = this.roundFormat(this.xLinear(this.trapezoidStyle[this.svgId].width));
        hVal = this.roundFormat(this.yLinear(this.trapezoidStyle[this.svgId].height));
      } else if (Number(type) === 4) {
        //子場域
        wVal = this.roundFormat(this.xLinear(this.subFieldStyle[this.svgId].width));
        hVal = this.roundFormat(this.yLinear(this.subFieldStyle[this.svgId].height));
      }
    }
    const mOrigin = document.querySelector('.moveable-origin');
    console.log(mOrigin)
    if (mOrigin != null) {
      // 有找到中心點
      const moveableOrigin = mOrigin.getBoundingClientRect();
      const x = moveableOrigin.left - this.chartLeft + (moveableOrigin.width / 2) - (this.svgStyle[this.svgId].width / 2) + this.scrollLeft;
      const y = this.chartBottom - moveableOrigin.top - (moveableOrigin.height / 2) - (this.svgStyle[this.svgId].height / 2) - this.scrollTop;
      this.dragObject[this.svgId].x = this.roundFormat(this.xLinear(x));
      this.dragObject[this.svgId].y = this.roundFormat(this.yLinear(y));
      
      
      if (this.dragObject[this.svgId].type === 'obstacle' || this.dragObject[this.svgId].type === 'subField') {
        this.dragObject[this.svgId].width = wVal;
        this.dragObject[this.svgId].height = hVal;

        // 檢查加上長寬後是否超出邊界
        const numX = Number(this.dragObject[this.svgId].x);
        const xEnd = numX + Number(this.dragObject[this.svgId].width);
        if (xEnd > this.calculateForm.width && Number(this.dragObject[this.svgId].rotate) == 0) {
          this.dragObject[this.svgId].x = Number(this.calculateForm.width) - Number(this.dragObject[this.svgId].width);
        } else if (numX < 0  && Number(this.dragObject[this.svgId].rotate) == 0) {
          this.dragObject[this.svgId].x = 0;
        }

        const numY = Number(this.dragObject[this.svgId].y);
        const yEnd = numY + Number(this.dragObject[this.svgId].height);
        if (yEnd > this.calculateForm.height && Number(this.dragObject[this.svgId].rotate) == 0) {
          this.dragObject[this.svgId].y = Number(this.calculateForm.height) - Number(this.dragObject[this.svgId].height);
        } else if (numY < 0  && Number(this.dragObject[this.svgId].rotate) == 0) {
          this.dragObject[this.svgId].y = 0;
        }

        if (this.dragObject[this.svgId].type === 'subField') {
          // console.log('sdfgjsgjslkgjklsdgjlskdjglksdjglksjlkgjslkgjsdlg');
          let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
          // console.log(sub_field_arr);
          for (let i = 0;i < sub_field_arr.length;i++) {
            // console.log(sub_field_arr[i].id);
            // console.log(this.svgId);
            if (sub_field_arr[i].id == this.svgId) {
              sub_field_arr.splice(i, 1, {
                id: this.svgId,
                x: this.dragObject[this.svgId].x,
                y: this.dragObject[this.svgId].y,
                width: this.dragObject[this.svgId].width,
                height: this.dragObject[this.svgId].height,
                width_px: this.subFieldStyle[this.svgId].width,
                height_px: this.subFieldStyle[this.svgId].height
              });
              sessionStorage.setItem(`sub_field_coor`,JSON.stringify(sub_field_arr));
            }
          }
        }
      }  
    }
    
  }

  setAntPosition(svgId, bsSvgId)
  {
    const mOrigin = document.querySelector('.moveable-origin');
    console.log(mOrigin)
    if (mOrigin != null)
    {
      // 有找到中心點
      const moveableOrigin = mOrigin.getBoundingClientRect();
      const y = this.chartBottom - moveableOrigin.top - (moveableOrigin.height / 2) - (this.svgStyle[svgId].height / 2) - this.scrollTop;
      //this.dragObject[svgId].y = this.roundFormat(this.yLinear(y));
      //console.log(`y = ${y}`);
      //console.log(`moveableOrigin = ${moveableOrigin}`);
      //console.log(`this.chartBottom = ${this.chartBottom}`);
      //console.log(`moveableOrigin.top = ${moveableOrigin.top}`);
      //console.log(`moveableOrigin.height = ${moveableOrigin.height}`);
      //console.log(`this.svgStyle[${svgId}].height = ${this.svgStyle[svgId].height}`);
      //console.log(`scrollTop = ${this.scrollTop}`);
    }
    //console.log(`this.dragObject[${svgId}].y = ${this.dragObject[svgId].y}`);

    //this.bsListRfParam[bsSvgId].antenna[this.getBsAntIndexBySvgId(svgId, bsSvgId)].position =
    //  [this.dragObject[svgId].x, this.dragObject[svgId].y, this.dragObject[svgId].z];
  }

  getBsAntIndexBySvgId(antSvgId, bsSvgId)
  {
    for (let a = 0; a < this.bsListRfParam[bsSvgId].antenna.length; a++)
    {
      if (this.bsListRfParam[bsSvgId].antenna[a].svgId == antSvgId)
        return a;
    }

    return -1;
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
      this.frame.set('z-index', 100+10*this.dragObject[this.svgId].z);
      this.setTransform(target);

      this.spanStyle[this.svgId].left = `${left}px`;
      this.spanStyle[this.svgId].top = `${top}px`;

      this.setDragData();
      if (this.dragObject[this.svgId].type === 'defaultBS' || this.dragObject[this.svgId].type === 'candidate'
        || this.dragObject[this.svgId].type === 'antenna')
      {
        this.circleStyle[this.svgId] = {
          top: `${top - 20}px`,
          left: `${left + 20}px`,
        };
        this.dfBsCircleStyle[this.svgId] = {
          top: `${top + 5}px`,
          left: `${left + 20}px`,
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
    // 超出邊界即中斷
    const rect = target.getBoundingClientRect();
    // console.log(rect, this.bounds)
    if (rect.right >= this.bounds.right
      || rect.top <= this.bounds.top
      || rect.bottom >= this.bounds.bottom
      || rect.left <= this.bounds.left ) {
      return;
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
    this.frame.set('z-index', 100+10*this.dragObject[this.svgId].z);
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
    } else if (Number(shape) === 4)
    {
      this.subFieldStyle[this.svgId].width = width;
      this.subFieldStyle[this.svgId].height = height;
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
    // 讓xy正確
    window.setTimeout(() => {
      this.moveClick(this.target.id);
      window.setTimeout(() => {
        this.moveable.destroy();
      }, 0);
    }, 0);
    
  }

  /** resize end */
  resizeEnd() {

    // resize後bound會跑掉，重設frame
    const left = `${this.pixelXLinear(this.dragObject[this.svgId].x)}px`;
    const top = `${this.chartHeight - this.pixelYLinear(this.dragObject[this.svgId].height) - this.pixelYLinear(this.dragObject[this.svgId].y)}px`;
    this.frame.set('left', left);
    this.frame.set('top', top);
    this.setTransform(this.target);
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
    this.selectBsSvgId = svgId;

    if (svgId.includes('defaultBS'))
    {
      this.selectBsSvgId = svgId;
      this.selectAntSvgId = '';
    }

    this.svgNum = i + 1;
    this.svgAntNum = (i + 1) + '.' + 1;
    // console.log('this.svgNum',this.svgNum);
    // preventDefault avoids to show the visualization of the right-click menu of the browser
    event.preventDefault();
    // we record the mouse position in our object
    this.menuTopLeftStyle.left = event.clientX + 'px';
    this.menuTopLeftStyle.top = event.clientY + 'px';
    // we open the menu
    this.matMenuTrigger.openMenu();
  }

  /**
 * 天線右鍵選單
 * @param event 
 * @param svgId 
 */
  onRightClickForAnt(event: MouseEvent, svgId, bsIndex, antIndex)
  {
    this.svgId = svgId;
    this.selectBsSvgId = this.dragObject[svgId].belongWhichBS;
    this.selectAntSvgId = svgId;

    this.svgAntNum = (bsIndex + 1) + '.' + (antIndex + 2);
    
    // console.log('this.svgNum',this.svgNum);
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
  delete(all) {
    if (!all) {
      if (this.dragObject[this.svgId].type === 'obstacle') {
        this.obstacleList.splice(this.obstacleList.indexOf(this.svgId), 1);
      } else if (this.dragObject[this.svgId].type === 'defaultBS') {
        this.defaultBSList.splice(this.defaultBSList.indexOf(this.svgId), 1);
      } else if (this.dragObject[this.svgId].type === 'antenna')
      {
        let antennaIndex = -1;
        for (let a = 0; a < this.bsListRfParam[this.dragObject[this.svgId].belongWhichBS].antenna.length; a++)
        {
          if (this.bsListRfParam[this.dragObject[this.svgId].belongWhichBS].antenna[a].svgId == this.svgId)
            antennaIndex = a;
        }

        if (antennaIndex == -1)
        {
          let msg = this.translateService.instant('delete.fail');
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: msg
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          return;
        }

        this.bsListRfParam[this.dragObject[this.svgId].belongWhichBS]
          .antenna.splice(antennaIndex, 1);

      } else if (this.dragObject[this.svgId].type === 'candidate')
      {
        this.candidateList.splice(this.candidateList.indexOf(this.svgId), 1);
      } else if (this.dragObject[this.svgId].type === 'UE') {
        this.ueList.splice(this.ueList.indexOf(this.svgId), 1);
      } else if (this.dragObject[this.svgId].type === 'subField') {
        this.subFieldList.splice(this.subFieldList.indexOf(this.svgId), 1);
        let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
        for (let i = 0;i < sub_field_arr.length;i++) {
          if (sub_field_arr[i].id == this.svgId) {
            sub_field_arr.splice(i, 1);
            sessionStorage.setItem(`sub_field_coor`,JSON.stringify(sub_field_arr));
          }
        }
      }
      this.matDialog.closeAll();
    } else {
      console.log(this.defaultBSList);
      this.initData(false, false, 'delete');
      this.deleteList.forEach(el => {
        let type = el[0].split('_')[0];
        if (type == 'candidate') {
          this.candidateList.splice(el[1], 1);
        } else if (type == 'defaultBS') {
          this.defaultBSList.splice(el[1], 1);
        } else if (type == 'UE') {
          this.ueList.splice(el[1], 1);
        } else {
          this.obstacleList.splice(el[1], 1);
        }
      });
      this.edit(false);
      this.deleteList.length = 0;
      // console.log(this.deleteList);
      this.matDialog.closeAll();
    }
    
  }

  notDelete() {
    window.sessionStorage.removeItem('tempParamForSelect');
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
  openRfParamSetting(item, i, isNav)
  {
    this.svgId = item;
    if (isNav) {
      this.svgNum = i + 1;
    } else {
      this.svgNum = i;
    }
    // console.log(this.svgId);
    // console.log(item);
    // console.log(this.svgNum);
    // this.matDialog.open(this.rfModal);
    this.manufactor = 'All';


    /*if (this.bsListRfParam[this.svgId].isAntennaDefault == 'default')
    {
      if (this.bsListRfParam[this.svgId].AntennaId == null)
        this.bsListRfParam[this.svgId].AntennaId = this.defaultAntennaList[0].antennaID;
    }
    else
    {
      if (this.bsListRfParam[this.svgId].AntennaId == null)
        this.bsListRfParam[this.svgId].AntennaId = this.customizedAntennaList[0].antennaID;
    }*/

    //console.log(`bsListRfParam[${this.svgId}].ulAntFreq = ${this.bsListRfParam[this.svgId].ulAntFreq}`)
    //this.antennaChangeCheck(this.svgId);

    this.firstLayerDialogRef = this.matDialog.open(this.rfModalTable, { disableClose: true });

    this.saveBsListRfParam(this.svgId);
  }

  /**
 * 開啟Ant RF設定燈箱
*/
  openAntRfParamSetting(antSvgId, bsSvgId)
  {
    if (antSvgId == '')       //基站上天線
    {
      this.svgId = bsSvgId;
    }
    else
    {
      this.svgId = antSvgId;
    }
    
    this.selectBsSvgId = bsSvgId;
    this.selectAntSvgId = antSvgId;

    let antIndex = this.getAntIndexFromAntSvgId(bsSvgId, antSvgId);
    let bsIndex = this.getBsIndexFromBsSvgId(bsSvgId);
    

    this.svgAntNum = bsIndex + '.' + antIndex;
    this.selectBsSvgId = bsSvgId;    
    
    this.manufactor = 'All';
    
    this.firstLayerDialogRef = this.matDialog.open(this.antRfModalTable, { disableClose: true });

    //this.antennaChangeCheck(this.selectBsSvgId);
    this.saveBsListRfParam(this.svgId);
  }
  /**
   *
   *開啟多目標函數設定燈箱
  */
  openFieldCoverageSetting() {    
    this.matDialog.open(this.FieldCoverageModalTable, { disableClose: true }); 
  }
  openSINRSetting() {
    if(this.evaluationFuncForm.field.sinr.ratio.length == 0)
      this.addSINR();
    this.matDialog.open(this.SINRModalTable, { disableClose: true });
  }  
  openRSRPSetting()
  {
    if(this.evaluationFuncForm.field.rsrp.ratio.length == 0)
      this.addRSRP();
    this.matDialog.open(this.RSRPModalTable, { disableClose: true });
  }  
  openThroughputSetting() {
    if(this.evaluationFuncForm.field.throughput.ratio.length == 0)
      this.addThroughput();
    this.matDialog.open(this.ThroughputModalTable, { disableClose: true });
  }  
  openUEThroughputSetting() {
    if(this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
      this.addUEThroughput();
    this.matDialog.open(this.UEThroughputModalTable, { disableClose: true });
  }
  openUECoverageSetting() {    
    this.matDialog.open(this.UECoverageModalTable, { disableClose: true });  
  }

  /**
   *
   *開啟Ant設定燈箱
  */
  openAntennaSetting() {
    this.getAntenna();
    this.firstLayerDialogRef = this.matDialog.open(this.AntennaModalTable, { disableClose: true });  
  }

  openAddAntennaSetting() {
    this.secondLayerDialogRef = this.matDialog.open(this.AddAntennaModalTable, { disableClose: true });
  }

  openEditAntennaSetting(index)
  {
    this.editAntenna = JSON.parse(JSON.stringify(this.customizedAntennaList[index]));     //用複製的
    this.editAntenna.isNewFile = false;
    this.secondLayerDialogRef = this.matDialog.open(this.EditAntennaModalTable, { disableClose: true });
  }

  openAntennaRawdata(index, isDefault)
  {
    this.getAntennaRawdata(index, false, isDefault);
  }

  openAntennaCountOfBSSetting()
  {
    if (this.planningIndex == '3')
      this.firstLayerDialogRef = this.matDialog.open(this.AntCountOfBSModal, { disableClose: true });
    else
      this.addMoveable('defaultBS');
  }

  openUEParamSetting(item, i, isNav) {
    this.svgId = item;
    if (isNav) { // 右方障礙物資訊id與左方平面圖障礙物id序號差1
      this.svgNum = i + 1;
    } else {
      this.svgNum = i;
    }

    this.saveParam(this.ueListParam, item, 'ueListParam');
    this.matDialog.open(this.ueModalTable, { disableClose: true});
  }
  openDeleteSetting() {
    this.matDialog.open(this.deleteModal);
  }

  /**
   * 開啟高度設定燈箱
   */
  openHeightSetting() {
    // this.matDialog.open(this.materialModal);
    this.saveParam(this.dragObject, this.svgId, 'material');
    this.matDialog.open(this.materialModal2, { disableClose: true });
  }

  /** 變更材質 */
  materialChange(val) {
    this.dragObject[this.svgId].material = val;
  }

  /**
   * mouseover info
   * @param event 
   * @param svgId 
   * @param i
   */
  hover(event, svgId, i) {
    this.live = true;
    this.svgId = svgId;
    this.svgNum = i+1;
    this.hoverObj = event.target.closest('span');
    // console.log('this.svgNum',this.svgNum);
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
    
    // 載入圖檔
    const file = event.target.files[0];

    if (!/\.(jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name))
    {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('planning.image.file.error')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return ;
    }

    this.calculateForm.mapName = file.name;
    this.showFileName = false;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.calculateForm.mapImage = reader.result.toString();
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
        sizing: 'stretch',
        layer: 'below'
      }];
      Plotly.relayout('chart', this.plotLayout);
      // this.initData(false, true, false, false);
    };
  }
  /**
   * 數量物件移動position
   * @param svgId 
   */
  moveNumber(svgId)
  {
    const circleElement: HTMLSpanElement = document.querySelector(`#${svgId}_circle`);
    const bsCircleElement: HTMLSpanElement = document.querySelector(`#${svgId}_bs_circle`);

    let colorId = '';
    let circleColor = this.DEFAULT_BS_COLOR;

    if (this.planningIndex == '3')
    {
      if (svgId.includes('antenna'))
        colorId = this.dragObject[svgId].belongWhichBS;
      else
        colorId = svgId;

      if (this.colorList[colorId] != null && this.colorList[colorId][0] != null)
        circleColor = this.colorList[colorId][0];
      else
        circleColor = this.DEFAULT_BS_COLOR;
    }

    if (circleElement != null)
    {
      const circleTop = `${Number(this.spanStyle[svgId].top.replace('px', '')) - 20}px`;
      const dfBsCircleTop = `${Number(this.spanStyle[svgId].top.replace('px', '')) + 5}px`;
      const itemWidth = Number(this.spanStyle[svgId].width.replace('px', ''));
      const left = Number(this.spanStyle[svgId].left.replace('px', ''));
      
      
      this.circleStyle[svgId] = {
        top: circleTop,
        left: `${left + itemWidth - 10}px`,
      };
      this.dfBsCircleStyle[svgId] = {
        top: dfBsCircleTop,
        left: `${left + itemWidth - 10}px`,
      };

      if (this.planningIndex == '3')
      {
        circleElement.style.backgroundColor = circleColor;
      }
    }

    if (this.planningIndex == '3' && bsCircleElement != null)
      bsCircleElement.style.backgroundColor = circleColor;

    this.isMovingNumber = true;
  }

  /**
   * Clear
   */
  // clearAllDrag() {
  //   this.dragObject = {};
  // }
  isEmpty(str) {
    if (str === undefined || str === null || str.length === 0) {
      return true;
    } else {
      return false;
    }
    // if (Number(str) == 0) {
    //   return false;
    // } else {
    //   return (!str || str.length === 0 );
    // }
  }

  /**
   * 檢查參數是否完整
   */
   checkRFParamIsEmpty(protocol, duplex) {
    let error = false;
    let msg = '<br>';
    if (this.calculateForm.pathLossModelId == 999 || !(this.calculateForm.pathLossModelId in this.modelIdToIndex)) {
        error = true;
        msg += `${this.translateService.instant('plz_fill_pathLossModel')}<br/>`;
        msg+= '</p>';
    }
     if (protocol == '1') { //5G
      if (duplex == 'tdd') {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          if (this.planningIndex == '3') {
            if (this.isEmpty(obj.txpower)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('txpower')}<br/>`; }
            if (this.isEmpty(obj.beampattern)) { obj.beampattern = 0; }
            // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
          if (this.isEmpty(obj.beampattern)) {this.bsListRfParam[this.defaultBSList[i]].beampattern = 0;}
          }
          if (this.isEmpty(obj.AntennaId)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('Antenna')}<br/>`;  }
          if (this.isEmpty(obj.theta)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('theta')}<br/>`;  }
          if (this.isEmpty(obj.phi)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('phi')}<br/>`;  }
          if (this.isEmpty(obj.bsTxGain)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('TxGain')}<br/>`;  }
          if (this.isEmpty(obj.bsNoiseFigure)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('noise')}<br/>`;  }
          if (this.isEmpty(obj.tddbandwidth)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('tddbandwidth')}<br/>`;  }
          if (this.isEmpty(obj.tddscs)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('tddscs')}<br/>`;  }
          if (this.isEmpty(obj.ulModulationCodScheme)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulModulationCodScheme')}<br/>`;  }
          if (this.isEmpty(obj.dlModulationCodScheme)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlModulationCodScheme')}<br/>`; }
          if (this.isEmpty(obj.ulMimoLayer)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulMimoLayer')}<br/>`;  }
          if (this.isEmpty(obj.dlMimoLayer)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlMimoLayer')}<br/>`;  }
          if (this.isEmpty(obj.tddfrequency)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('tddfrequency')}<br/>`;  }
          else if (obj.tddfrequency < 0) { bsMsg += `${this.translateService.instant('tddfrequency_less_than_0')}<br/>`;  }
          if (bsMsg !== '') {
            msg+= `${this.translateService.instant('bs_problem1')}${i+1}:${this.translateService.instant('bs_problem2')}<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
            error = true;
          }
        }
      } else {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          if (this.planningIndex == '3') {
            if (this.isEmpty(obj.txpower)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('txpower')}<br/>`;  }
            if (this.isEmpty(obj.beampattern)) { obj.beampattern = 0; }
            // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
          }
          if (this.isEmpty(obj.AntennaId)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('Antenna')}<br/>`;  }
          if (this.isEmpty(obj.theta)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('theta')}<br/>`;  }
          if (this.isEmpty(obj.phi)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('phi')}<br/>`;  }
          if (this.isEmpty(obj.bsTxGain)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('TxGain')}<br/>`;  }
          if (this.isEmpty(obj.bsNoiseFigure)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('noise')}<br/>`;  }
          if (this.isEmpty(obj.dlBandwidth)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ddlBandwidth')}<br/>`;  }
          if (this.isEmpty(obj.ulBandwidth)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('uulBandwidth')}<br/>`;  }
          if (this.isEmpty(obj.dlScs)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlscs')}<br/>`;  }
          if (this.isEmpty(obj.ulScs)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulscs')}<br/>`;  }
          if (this.isEmpty(obj.dlModulationCodScheme)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlModulationCodScheme')}<br/>`;  }
          if (this.isEmpty(obj.ulModulationCodScheme)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulModulationCodScheme')}<br/>`;  }
          if (this.isEmpty(obj.dlMimoLayer)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlMimoLayer')}<br/>`;  }
          if (this.isEmpty(obj.ulMimoLayer)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulMimoLayer')}<br/>`;  }
          if (this.isEmpty(obj.fddDlFrequency)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlfrequency')}<br/>`;  }
          else if (obj.fddDlFrequency < 0) { bsMsg += `${this.translateService.instant('dlfrequency_less_than_0')}<br/>`;  }
          if (this.isEmpty(obj.fddUlFrequency)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulfrequency')}<br/>`;  }
          else if (obj.fddUlFrequency < 0) { bsMsg += `${this.translateService.instant('ulfrequency_less_than_0')}<br/>`;  }
          if (obj.fddDlFrequency == obj.fddUlFrequency
            && !this.isEmpty(obj.fddDlFrequency)
            && !this.isEmpty(obj.fddUlFrequency)) {
            bsMsg+= `${this.translateService.instant('dlfrequency_same_ulfrequency')}<br/>`
          }
          if (bsMsg !== '') {
            msg+= `${this.translateService.instant('bs_problem1')}${i+1}:${this.translateService.instant('bs_problem2')}<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
            error = true;
          }
        }
      }
    } else if (protocol == '0') {
      if (duplex == 'tdd') {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          // console.log(obj.tddbandwidth);
          // console.log(obj.tddfrequency);
          if (this.planningIndex == '3') {
            if (this.isEmpty(obj.txpower)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('txpower')}<br/>`;  }
            if (this.isEmpty(obj.beampattern)) { obj.beampattern = 0; }
            // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
          }
          if (this.isEmpty(obj.mimoNumber4G)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('mimonum')}<br/>`;  }
          if (this.isEmpty(obj.tddbandwidth)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('tddbandwidth')}<br/>`;  }
          else if (obj.tddbandwidth < 0) { bsMsg += `${this.translateService.instant('tddbandwidth_less_than_0')}<br/>`;  }
          if (this.isEmpty(obj.tddfrequency)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('tddfrequency')}<br/>`;  }
          else if (obj.tddfrequency < 0) { bsMsg += `${this.translateService.instant('tddfrequency_less_than_0')}<br/>`;  }
          if (bsMsg !== '') {
            msg+= `${this.translateService.instant('bs_problem1')}${i+1}:${this.translateService.instant('bs_problem2')}<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
            error = true;
          }
        }
      } else {
        for (let i = 0; i < this.defaultBSList.length; i++) {
          const obj = this.bsListRfParam[this.defaultBSList[i]];
          let bsMsg = '';
          if (this.planningIndex == '3') {
            if (this.isEmpty(obj.txpower)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('txpower')}<br/>`;  }
            if (this.isEmpty(obj.beampattern)) { obj.beampattern = 0; }
            // { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('beamid')}<br/>`; }
          }
          if (this.isEmpty(obj.mimoNumber4G)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('mimonum')}<br/>`;  }
          if (this.isEmpty(obj.dlBandwidth)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ddlBandwidth')}<br/>`;  }
          else if (obj.dlBandwidth < 0) { bsMsg += `${this.translateService.instant('dlbandwidth_less_than_0')}<br/>`;  }
          if (this.isEmpty(obj.ulBandwidth)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('uulBandwidth')}<br/>`;  }
          else if (obj.ulBandwidth < 0) { bsMsg += `${this.translateService.instant('ulbandwidth_less_than_0')}<br/>`;  }
          if (this.isEmpty(obj.fddDlFrequency)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('dlfrequency')}<br/>`;  }
          else if (obj.fddDlFrequency < 0) { bsMsg += `${this.translateService.instant('dlfrequency_less_than_0')}<br/>`;  }
          if (this.isEmpty(obj.fddUlFrequency)) { bsMsg += `${this.translateService.instant('plz_fill')} ${this.translateService.instant('ulfrequency')}<br/>`;  }
          else if (obj.fddUlFrequency < 0) { bsMsg += `${this.translateService.instant('ulfrequency_less_than_0')}<br/>`;  }
          if (obj.fddDlFrequency == obj.fddUlFrequency
            && !this.isEmpty(obj.fddUlFrequency)
            && !this.isEmpty(obj.fddDlFrequency)) {
            bsMsg+= `${this.translateService.instant('dlfrequency_same_ulfrequency')}<br/>`
          }
          if (bsMsg !== '') {
            msg+= `${this.translateService.instant('bs_problem1')}${i+1}:${this.translateService.instant('bs_problem2')}<br><p style="color: red;">`;
            msg+= bsMsg;
            msg+= '</p>';
            error = true;
          }
        }
      }
    } else {

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

  checkSubFieldOverlaped() {
    if (sessionStorage.getItem('sub_field_coor') == null) {
      return false;
    }
    let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
    for (let i = 0;i < sub_field_arr.length;i++) {
      let subfield = sub_field_arr[i];
      let x2 = Number(subfield.x) + Number(subfield.width);
      let x1 = Number(subfield.x);
      let y1 = Number(subfield.y);
      let y2 = Number(subfield.y) + Number(subfield.height);
      console.log(`${x1} ${x2} ${y1} ${y2}`);
      for (let j = i+1;j < sub_field_arr.length;j++) {
        let subfield2 = sub_field_arr[j];
        let flag1, flag2;
        let xx2 = Number(subfield2.x) + Number(subfield2.width);
        let xx1 = Number(subfield2.x);
        let yy1 = Number(subfield2.y);
        let yy2 = Number(subfield2.y) + Number(subfield2.height);
        console.log(`${xx1} ${xx2} ${yy1} ${yy2}`);
        if (x1 > xx2 || x2 < xx1) {
          flag1 = false;
        } else {
          flag1 = true;
        }
        if (y1 > yy2 || y2 < yy1) {
          flag2 = false;
        } else {
          flag2 = true;
        }
        if (flag1 && flag2) {
          let warnmsg = this.translateService.instant('subfield.overlap');
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: warnmsg
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          return true; // overlaped
        }
      }
    }
    return false;
  }

  // 檢查是否有基地台的參數重疊
  checkRFParamIsOverlaped() {
    let warnmsg = "";
    console.log('duplex = ' + this.duplexMode);
    if (this.duplexMode == 'tdd' || this.calculateForm.objectiveIndex == '2') {
      //模擬和規劃都會用到
      let freq, band, mainMax, mainMin, max, min;
      for (let i = 0; i < this.defaultBSList.length; i++) {
        if (this.calculateForm.objectiveIndex == '2') {
          freq = this.bsListRfParam[this.defaultBSList[i]].wifiFrequency;
          band = this.bsListRfParam[this.defaultBSList[i]].wifiBandwidth;
        } else {
          freq = this.bsListRfParam[this.defaultBSList[i]].tddfrequency;
          band = this.bsListRfParam[this.defaultBSList[i]].tddbandwidth;
        }
        mainMax = freq + band/2;
        mainMin = freq - band/2;
        for (let j = i;  j < this.defaultBSList.length; j++) {
          if (this.defaultBSList[i] == this.defaultBSList[j]) {continue;}
          if (this.calculateForm.objectiveIndex == '2') {
            max = this.bsListRfParam[this.defaultBSList[j]].wifiFrequency +
              this.bsListRfParam[this.defaultBSList[j]].wifiBandwidth / 2;
            min = this.bsListRfParam[this.defaultBSList[j]].wifiFrequency -
              this.bsListRfParam[this.defaultBSList[j]].wifiBandwidth / 2;
          } else {
            max = this.bsListRfParam[this.defaultBSList[j]].tddfrequency +
              this.bsListRfParam[this.defaultBSList[j]].tddbandwidth / 2;
            min = this.bsListRfParam[this.defaultBSList[j]].tddfrequency -
              this.bsListRfParam[this.defaultBSList[j]].tddbandwidth / 2;
          }
          
          if (mainMax == max && mainMin == min) {
            continue;
          }
          if (mainMax > max && mainMin < min) {
            warnmsg+=`${this.translateService.instant('default')}${i+1} ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1} ${this.translateService.instant('tddfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((mainMax > min && mainMax < max) || (mainMin > min && mainMin < max)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1} ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1} ${this.translateService.instant('tddfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
        }
      }
      //規劃才需要比較Candidate
      if (!this.calculateForm.isSimulation) {                    
        let freq, band;
        if (this.calculateForm.objectiveIndex == '2') {
          freq = this.tempCalParamSet.wifiFrequency;
          band = Number(this.tempCalParamSet.wifiBandwidth);
        } else {
          freq = this.tempCalParamSet.tddfrequency;
          band = Number(this.tempCalParamSet.tddbandwidth);
        }
        let mainMax = freq + band/2;
        let mainMin = freq - band/2;
        let max, min;
        for (let i = 0;  i < this.defaultBSList.length; i++) {
          if (this.calculateForm.objectiveIndex == '2') {
            max = this.bsListRfParam[this.defaultBSList[i]].wifiFrequency + this.bsListRfParam[this.defaultBSList[i]].wifiBandwidth/2;
            min = this.bsListRfParam[this.defaultBSList[i]].wifiFrequency - this.bsListRfParam[this.defaultBSList[i]].wifiBandwidth/2;
          } else {
            max = this.bsListRfParam[this.defaultBSList[i]].tddfrequency + this.bsListRfParam[this.defaultBSList[i]].tddbandwidth/2;
            min = this.bsListRfParam[this.defaultBSList[i]].tddfrequency - this.bsListRfParam[this.defaultBSList[i]].tddbandwidth/2;
          }
          if (mainMax == max && mainMin == min) {
            continue;
          }
          if (mainMax > max && mainMin < min) {
            warnmsg+=`${this.translateService.instant('default')}${i+1} ${this.translateService.instant('and')} 
            ${this.translateService.instant('candidate')} ${this.translateService.instant('tddfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((mainMax > min && mainMax < max) || (mainMin > min && mainMin < max)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1} ${this.translateService.instant('and')} 
            ${this.translateService.instant('candidate')} ${this.translateService.instant('tddfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
        }
      }
    } else { // ------------------------------- FDD ----------------------------------------
      //模擬和規劃都會用到
      let dlfreq, ulfreq, dlband, ulband;
      let dlmainMax, dlmainMin, ulmainMax, ulmainMin;
      let dlmax, dlmin, ulmax, ulmin;
      for (let i = 0; i < this.defaultBSList.length; i++) {
        dlfreq = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency;
        ulfreq = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency;
        dlband = Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth);
        ulband = Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth);
        dlmainMax = dlfreq + dlband/2;
        dlmainMin = dlfreq - dlband/2;
        ulmainMax = ulfreq + ulband/2;
        ulmainMin = ulfreq - ulband/2;
        console.log(`${dlmainMax} ${dlmainMin} ${ulmainMax} ${ulmainMin}`);
        // 自己的上下行不能包含於
        if (dlmainMax == ulmainMax && dlmainMin == ulmainMin) {
          warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        } else if (dlmainMax >= ulmainMax && dlmainMin <= ulmainMin) {
          warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        } else if (ulmainMax >= dlmainMax && ulmainMin <= dlmainMin) {
          warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        }
        // 自己的上下行不能重疊到
        else if ((dlmainMax > ulmainMin && dlmainMax < ulmainMax) || (dlmainMin > ulmainMin && dlmainMin < ulmainMax)) {
          warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        }
        // 跟其他既有基站比
        for (let j = i;  j < this.defaultBSList.length; j++) {
          if (this.defaultBSList[i] == this.defaultBSList[j]) {continue;}
          dlmax = this.bsListRfParam[this.defaultBSList[j]].fddDlFrequency + Number(this.bsListRfParam[this.defaultBSList[j]].dlBandwidth)/2;
          ulmax = this.bsListRfParam[this.defaultBSList[j]].fddUlFrequency + Number(this.bsListRfParam[this.defaultBSList[j]].ulBandwidth)/2;
          dlmin = this.bsListRfParam[this.defaultBSList[j]].fddDlFrequency - Number(this.bsListRfParam[this.defaultBSList[j]].dlBandwidth)/2;
          ulmin = this.bsListRfParam[this.defaultBSList[j]].fddUlFrequency - Number(this.bsListRfParam[this.defaultBSList[j]].ulBandwidth)/2;
          // default 下行與 default完全重合，上行亦然
          if ((dlmainMax == dlmax && dlmainMin == dlmin) && (ulmainMax == ulmax && ulmainMin == ulmin)) {
            continue;
          }
          if (dlmainMax == ulmax && dlmainMin == ulmin) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          } else if (ulmainMax == dlmax && ulmainMin == dlmin) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          // default 頻率範圍完全蓋過 defualt
          if ((dlmainMax >= dlmax && dlmainMin < dlmin) || (dlmainMax > dlmax && dlmainMin <= dlmin)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((dlmainMax >= ulmax && dlmainMin < ulmin) || (dlmainMax > ulmax && dlmainMin <= ulmin)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax >= dlmax && ulmainMin < dlmin) || (ulmainMax > dlmax && ulmainMin <= dlmin)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax >= ulmax && ulmainMin < ulmin) || (ulmainMax > ulmax && ulmainMin <= ulmin)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((dlmainMax > dlmin && dlmainMax < dlmax) || (dlmainMin > dlmin && dlmainMin < dlmax)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((dlmainMax > ulmin && dlmainMax < ulmax) || (dlmainMin > ulmin && dlmainMin < ulmax)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax > ulmin && ulmainMax < ulmax) || (ulmainMin > ulmin && ulmainMin < ulmax)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax > dlmin && ulmainMax < dlmax) || (ulmainMin > dlmin && ulmainMin < dlmax)) {
            warnmsg+=`${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${j+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
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
        dlmainMax = dlfreq + dlband/2;
        dlmainMin = dlfreq - dlband/2;
        ulmainMax = ulfreq + ulband/2;
        ulmainMin = ulfreq - ulband/2;
        console.log(`${dlmainMax} ${dlmainMin} ${ulmainMax} ${ulmainMin}`)
        // 自己的上下行不能包含於
        if (dlmainMax == ulmainMax && dlmainMin == ulmainMin) {
          warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        } else if (dlmainMax >= ulmainMax && dlmainMin <= ulmainMin) {
          warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        } else if (ulmainMax >= dlmainMax && ulmainMin <= dlmainMin) {
          warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        }
        else if ((dlmainMax > ulmainMin && dlmainMax < ulmainMax) || (dlmainMin > ulmainMin && dlmainMin < ulmainMax)) {
          warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}
          ${this.translateService.instant('dlfrequency')} ${this.translateService.instant('and')} ${this.translateService.instant('ulfrequency')}
          ${this.translateService.instant('overlap')} <br/>`;
        }
        for (let i = 0;  i < this.defaultBSList.length; i++) {
          dlmax = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth)/2;
          ulmax = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency + Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth)/2;
          dlmin = this.bsListRfParam[this.defaultBSList[i]].fddDlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].dlBandwidth)/2;
          ulmin = this.bsListRfParam[this.defaultBSList[i]].fddUlFrequency - Number(this.bsListRfParam[this.defaultBSList[i]].ulBandwidth)/2;
          // console.log(`${dlmax} ${dlmin} ${ulmax} ${ulmin}`)
          // Candidate 下行與 default完全重合，上行亦然
          if ((dlmainMax == dlmax && dlmainMin == dlmin) && (ulmainMax == ulmax && ulmainMin == ulmin)) {
            continue;
          }
          if (dlmainMax == ulmax && dlmainMin == ulmin) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          } else if (ulmainMax == dlmax && ulmainMin == dlmin) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          // Candidate 頻率範圍完全蓋過 defualt
          if ((dlmainMax >= dlmax && dlmainMin < dlmin) || (dlmainMax > dlmax && dlmainMin <= dlmin)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((dlmainMax >= ulmax && dlmainMin < ulmin) || (dlmainMax > ulmax && dlmainMin <= ulmin)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax >= dlmax && ulmainMin < dlmin) || (ulmainMax > dlmax && ulmainMin <= dlmin)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax >= ulmax && ulmainMin < ulmin) || (ulmainMax > ulmax && ulmainMin <= ulmin)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          // Candidate 頻率範圍與部分 defualt 重疊
          if ((dlmainMax > dlmin && dlmainMax < dlmax) || (dlmainMin > dlmin && dlmainMin < dlmax)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((dlmainMax > ulmin && dlmainMax < ulmax) || (dlmainMin > ulmin && dlmainMin < ulmax)) {
            // warnmsg+=`Candidate's DL and Default BS${i+1}'s UL frequency overlaped <br/>`;
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax > ulmin && ulmainMax < ulmax) || (ulmainMin > ulmin && ulmainMin < ulmax)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
          if ((ulmainMax > dlmin && ulmainMax < dlmax) || (ulmainMin > dlmin && ulmainMin < dlmax)) {
            warnmsg+=`${this.translateService.instant('candidate')}${this.translateService.instant('de')}${this.translateService.instant('ulfrequency')} 
            ${this.translateService.instant('and')} 
            ${this.translateService.instant('default')}${i+1}${this.translateService.instant('de')}${this.translateService.instant('dlfrequency')} 
            ${this.translateService.instant('overlap')} <br/>`;
          }
        }
      }
    }
    if (warnmsg != '') {
      // console.log(warnmsg);
      warnmsg = '<br/>'+warnmsg;
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: warnmsg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return true
    } else {
      return false;
    }
  }

  //Todo
  checkCandidateRFParamIsEmpty(protocol, duplex) {
    let error = false;
    let msg = '';
    const obj = this.tempCalParamSet;
    if (this.isEmpty(this.scalingFactor)) {msg+= `${this.translateService.instant('nf_scalingFactor')}<br/>`}
    else if (this.scalingFactor < 0 || this.scalingFactor > 1) {msg+= `${this.translateService.instant('0to1_scalingFactor')}<br/>`}
    // console.log(this.calculateForm.powerMinRange);
    // console.log(this.calculateForm.powerMaxRange);
    if (this.isEmpty(this.calculateForm.powerMaxRange) || this.isEmpty(this.calculateForm.powerMinRange)) {
      if (this.isEmpty(this.calculateForm.powerMaxRange)) {
        msg+= `${this.translateService.instant('nf_maxpower')}<br/>`
      } else {
        msg+= `${this.translateService.instant('nf_minpower')}<br/>`
      }
    }
    if (protocol == '1') {
      if (duplex == 'tdd') {
        if (this.isEmpty(this.dlRatio)) { msg += `${this.translateService.instant('nf_dlratio')}<br/>`;  }
        else if (this.dlRatio < 0 || this.dlRatio > 100) { msg += `${this.translateService.instant('0_100_dlratio')}<br/>`;  }
        if (this.isEmpty(obj.tddscs)) { msg += `${this.translateService.instant('nf_tddscs')}<br/>`;  }
        if (this.isEmpty(obj.tddbandwidth)) { msg += `${this.translateService.instant('nf_tddbandwidth')}<br/>`;  }
        if (this.isEmpty(obj.ulModulationCodScheme)) { msg += `${this.translateService.instant('nf_ulModulationCodScheme')}<br/>`;  }
        if (this.isEmpty(obj.dlModulationCodScheme)) { msg += `${this.translateService.instant('nf_dlModulationCodScheme')}<br/>`;  }
        if (this.isEmpty(obj.ulMimoLayer)) { msg += `${this.translateService.instant('nf_ulMimoLayer')}<br/>`;  }
        if (this.isEmpty(obj.dlMimoLayer)) { msg += `${this.translateService.instant('nf_dlMimoLayer')}<br/>`;  }
        if (this.isEmpty(obj.tddfrequency)) { msg += `${this.translateService.instant('nf_tddfrequency')}<br/>`;  }
        else if (obj.tddfrequency < 0) { msg += `${this.translateService.instant('less_0_tddfrequency')}<br/>`;  }
      } else {
        if (this.isEmpty(obj.dlBandwidth)) { msg += `${this.translateService.instant('nf_dlBandwidth')}<br/>`;  }
        if (this.isEmpty(obj.ulBandwidth)) { msg += `${this.translateService.instant('nf_ulBandwidth')}<br/>`;  }
        if (this.isEmpty(obj.dlScs)) { msg += `${this.translateService.instant('nf_dlScs')}<br/>`;  }
        if (this.isEmpty(obj.ulScs)) { msg += `${this.translateService.instant('nf_ulScs')}<br/>`;  }
        if (this.isEmpty(obj.dlModulationCodScheme)) { msg += `${this.translateService.instant('nf_dlModulationCodScheme')}<br/>`;  }
        if (this.isEmpty(obj.ulModulationCodScheme)) { msg += `${this.translateService.instant('nf_ulModulationCodScheme')}<br/>`;  }
        if (this.isEmpty(obj.dlMimoLayer)) { msg += `${this.translateService.instant('nf_dlMimoLayer')}<br/>`;  }
        if (this.isEmpty(obj.ulMimoLayer)) { msg += `${this.translateService.instant('nf_ulMimoLayer')}<br/>`;  }
        if (this.isEmpty(obj.fddDlFrequency)) { msg += `${this.translateService.instant('nf_fddDlFrequency')}<br/>`;  }
        else if (obj.fddDlFrequency < 0) { msg += `${this.translateService.instant('less_0_fddDlFrequency')}<br/>`;  }
        if (this.isEmpty(obj.fddUlFrequency)) { msg += `${this.translateService.instant('nf_fddUlFrequency')}<br/>`;  }
        else if (obj.fddUlFrequency < 0) { msg += `${this.translateService.instant('less_0_fddUlFrequency')}<br/>`;  }
        if (obj.fddDlFrequency == obj.fddUlFrequency
          && !this.isEmpty(obj.fddUlFrequency)
          && !this.isEmpty(obj.fddDlFrequency)) {
          msg+= `${this.translateService.instant('fddDlFrequency_same_fddUlFrequency')}<br/>`
        }
      }
    } else {
      if (duplex == 'tdd') {
        if (this.isEmpty(this.dlRatio)  === null) { msg += `${this.translateService.instant('nf_dlratio')}<br/>`;  }
        else if (this.dlRatio < 0 || this.dlRatio > 100) { msg += `${this.translateService.instant('0_100_dlratio')}<br/>`;  }
        if (this.isEmpty(obj.mimoNumber4G)) { msg += `${this.translateService.instant('nf_mimonum')}<br/>`;  }
        if (this.isEmpty(obj.tddbandwidth)) { msg += `${this.translateService.instant('nf_tddbandwidth')}<br/>`;  }
        else if (Number(obj.tddbandwidth) < 0) { msg += `${this.translateService.instant('less_0_tddbandwidth')}<br/>`;  }
        if (this.isEmpty(obj.tddfrequency)) { msg += `${this.translateService.instant('nf_tddfrequency')}<br/>`;  }
        else if (obj.tddfrequency < 0) { msg += `${this.translateService.instant('less_0_tddfrequency')}<br/>`;  }
      } else {
        if (this.isEmpty(obj.mimoNumber4G)) { msg += `${this.translateService.instant('nf_mimonum')}<br/>`;  }
        console.log(this.isEmpty(obj.dlBandwidth));
        console.log(obj.dlBandwidth);
        if (this.isEmpty(obj.dlBandwidth)) { msg += `${this.translateService.instant('nf_ulBandwidth')}<br/>`;  }
        else if (Number(obj.dlBandwidth) < 0) { msg += `${this.translateService.instant('less_0_ulBandwidth')}<br/>`;  }
        if (this.isEmpty(obj.ulBandwidth)) { msg += `${this.translateService.instant('nf_dlBandwidth')}<br/>`;  }
        else if (Number(obj.ulBandwidth) < 0) { msg += `${this.translateService.instant('less_0_dlBandwidth')}<br/>`;  }
        if (this.isEmpty(obj.fddDlFrequency)) { msg += `${this.translateService.instant('nf_fddDlFrequency')}<br/>`;  }
        else if (obj.fddDlFrequency < 0) { msg += `${this.translateService.instant('less_0_fddDlFrequency')}<br/>`;  }
        if (this.isEmpty(obj.fddUlFrequency)) { msg += `${this.translateService.instant('nf_fddUlFrequency')}<br/>`;  }
        else if (obj.fddUlFrequency < 0) { msg += `${this.translateService.instant('less_0_fddUlFrequency')}<br/>`;  }
        if (obj.fddDlFrequency == obj.fddUlFrequency
          && !this.isEmpty(obj.fddUlFrequency)
          && !this.isEmpty(obj.fddDlFrequency)) {
          msg+= `${this.translateService.instant('fddDlFrequency_same_fddUlFrequency')}<br/>`
        }
      }
    }
    if (msg !== '') {
      msg = `${this.translateService.instant('following_fix_plz')}<br/>` + msg;
      error = true;
      console.log(msg);
    }
    if (error) {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }
    return error;
  }

  /**
   * 開始運算
   */
  async calculate() {
    try
    {
      this.moveable.destroy();
    }
    catch (error)
    {
    }

    // 檢查既有基地台是否有參數未被填入
    if (this.checkRFParamIsEmpty(this.calculateForm.objectiveIndex, this.duplexMode)) { return; }
    // 檢查待選基地台參數 Todo
    if (this.checkCandidateRFParamIsEmpty(this.calculateForm.objectiveIndex, this.duplexMode)) { return;}
    //檢查是否有基地台頻寬重疊
    //if (this.checkRFParamIsOverlaped()) {return;}
    //檢查子場域是否重疊
    if (this.checkSubFieldOverlaped()) {return;} 

    if (this.planningIndex != '3' && this.duplexMode == 'fdd' && this.checkDlUlDiff()) {
      let msg = this.translateService.instant('dl_ul_freq_same')
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }

    if (this.planningIndex !='3' && Number(this.calculateForm.powerMaxRange) == Number(this.calculateForm.powerMinRange) || 
    Number(this.calculateForm.powerMinRange) > Number(this.calculateForm.powerMaxRange)) {
      let msg = '';
      if (this.calculateForm.powerMaxRange == this.calculateForm.powerMinRange) {
        msg = this.translateService.instant('max_min_txpower_same');
      } else {
        msg = this.translateService.instant('min_txpower_greater_than_max');
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

    let isCanLessAvl = this.candidateList.length < this.calculateForm.availableNewBsNumber && this.isBsNumberOptimization == 'custom';
    let isAvlLessZero = Number(this.calculateForm.availableNewBsNumber) <= 0 && this.isBsNumberOptimization == 'custom';
    let isCanLessZero = Number(this.candidateList.length) <= 0;

    if ((isCanLessAvl || isAvlLessZero || isCanLessZero) && this.planningIndex !== '3') 
    {
      let msg;

      if (this.candidateList.length == 0)
      {
        msg = this.translateService.instant('calculate.candidate.Mandatory');
      }
      else
      {
        if (this.calculateForm.objectiveIndex === '2') {
          msg = this.translateService.instant('availableNewBsNumber.wifi');
        } else {
          msg = this.translateService.instant('availableNewBsNumber.gen');
        }
        
        if (this.candidateList.length < this.calculateForm.availableNewBsNumber) {
          msg += ' ' + this.translateService.instant('must_less_than_candidateBs') + this.candidateList.length;
        } else { 
          msg += ' ' + this.translateService.instant('must_greater_than') + '0';
        }
      }
      
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    } 
    else if (!(Number(this.calculateForm.maxConnectionNum)>0)) {
      let msg = this.translateService.instant('maxConnectionNum') +' '+ this.translateService.instant('must_greater_than') + ' 0';
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);  
    } else if (!(Number(this.calculateForm.maxConnectionNum)<=1000)) {
      let msg = this.translateService.instant('maxConnectionNum') +' '+ this.translateService.instant('must_less_than_or_equal_to') + ' 1000';
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);  
    } else if (!(Number(this.calculateForm.geographicalNorth)<=360)) {
      let msg = this.translateService.instant('compassDirection') +' '+ this.translateService.instant('must_less_than_or_equal_to') + ' 360';
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);  
    } else if (!(Number(this.calculateForm.geographicalNorth)>=0)) {
      let msg = this.translateService.instant('compassDirection') +' '+ this.translateService.instant('must_greater_than_or_equal_to') + ' 0';
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);  
    }  else if (this.planningIndex == '3' && this.defaultBSList.length == 0) {
      let msg = this.translateService.instant('bs_must_greater_than_zero')
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
    } else if (this.planningIndex === '1' && !this.evaluationFuncForm.field.coverage.activate && 
    !this.evaluationFuncForm.field.rsrp.activate && !this.evaluationFuncForm.field.sinr.activate && 
    !this.evaluationFuncForm.field.throughput.activate) {
      let msg = this.translateService.instant('no_target_fault');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    } else if (this.planningIndex === '2' && !this.evaluationFuncForm.ue.coverage.activate && 
    !this.evaluationFuncForm.ue.throughputByRsrp.activate) {
      let msg = this.translateService.instant('no_target_fault');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    } else {
      this.progressNum = 0;
      // console.log(this.calculateForm.bandwidth);
      // console.log(this.calculateForm.frequency);
      
      this.setForm();
      
      // 規劃目標
      this.setPlanningObj();

      // let apiBody = JSON.parse(JSON.stringify(this.calculateForm));


      let url = '';
      if (this.planningIndex !== '3') {
        this.calculateForm.isSimulation = false;
        url = `${this.authService.API_URL}/calculate`;
      } else {
        this.calculateForm.isSimulation = true;
        url = `${this.authService.API_URL}/simulation`;
      }
      let apiBody = JSON.parse(JSON.stringify(this.calculateForm));
    
      apiBody.availableNewBsNumber = apiBody.availableNewBsNumber + this.defaultBSList.length;
      // apiBody.isBsNumberOptimization = (this.isBsNumberOptimization == 'default');
    
      console.log(this.calculateForm);



      this.authService.spinnerShowAsHome();

      window.setTimeout(() => {
        this.http.post(url, JSON.stringify(apiBody)).subscribe(
          res => {
            this.taskid = res['taskid'];
            this.getProgress();
          },
          err => {
            this.authService.spinnerHide();
            console.log(err);
          }
        );
      }, 100);
    }
  }

  /** 設定規劃目標  */
  setPlanningObj() {
    // check規劃目標
    if (this.planningIndex === '1') 
    {
      this.calculateForm.isUeAvgSinr = false;
      this.calculateForm.isUeAvgThroughput = false;
      this.calculateForm.isUeCoverage = false;

      this.evaluationFuncForm.ue.coverage.activate = false;
      this.evaluationFuncForm.ue.throughputByRsrp.activate = false;
    } 
    else if (this.planningIndex === '2') 
    {
      this.calculateForm.isAverageSinr = false;
      this.calculateForm.isCoverage = false;

      this.evaluationFuncForm.field.coverage.activate = false;
      this.evaluationFuncForm.field.throughput.activate = false;
      this.evaluationFuncForm.field.sinr.activate = false;
      this.evaluationFuncForm.field.rsrp.activate = false;
    }
    else
    {
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
    

    this.calculateForm.evaluationFunc = new EvaluationFuncForm();

    if(this.evaluationFuncForm.field.coverage.activate)
    {
      this.calculateForm.evaluationFunc.field.coverage.activate = true;
      this.calculateForm.evaluationFunc.field.coverage.ratio = this.evaluationFuncForm.field.coverage.ratio / 100;
    }
    else
    {
      this.calculateForm.evaluationFunc.field.coverage.activate = false;
      this.calculateForm.evaluationFunc.field.coverage.ratio = this.defaultArea / 100;
    }

    if(this.evaluationFuncForm.field.sinr.activate)
    {
      this.calculateForm.evaluationFunc.field.sinr.activate = true;
      for(var i = 0; i < this.evaluationFuncForm.field.sinr.ratio.length; i++)
      {
        this.calculateForm.evaluationFunc.field.sinr.ratio.push
        (
          {
            "areaRatio": this.evaluationFuncForm.field.sinr.ratio[i].areaRatio/100,
            "compliance": this.evaluationFuncForm.field.sinr.ratio[i].compliance,
            "value": this.evaluationFuncForm.field.sinr.ratio[i].value
          }
        );
      }
    }
    else
    {
      this.calculateForm.evaluationFunc.field.sinr.activate = false;
      this.calculateForm.evaluationFunc.field.sinr.ratio = [];
    }

    if(this.evaluationFuncForm.field.rsrp.activate)
    {
      this.calculateForm.evaluationFunc.field.rsrp.activate = true;
      for(var i = 0; i < this.evaluationFuncForm.field.rsrp.ratio.length; i++)
      {
        this.calculateForm.evaluationFunc.field.rsrp.ratio.push
        (
          {
            "areaRatio": this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio/100,
            "compliance": this.evaluationFuncForm.field.rsrp.ratio[i].compliance,
            "value": this.evaluationFuncForm.field.rsrp.ratio[i].value
          }
        );
      }
    }
    else
    {
      this.calculateForm.evaluationFunc.field.rsrp.ratio = [];
    }

    if(this.evaluationFuncForm.field.throughput.activate)
    {
      this.calculateForm.evaluationFunc.field.throughput.activate = true;
      for(var i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++)
      {
        this.calculateForm.evaluationFunc.field.throughput.ratio.push
        (
          {
            "areaRatio": this.evaluationFuncForm.field.throughput.ratio[i].areaRatio/100,
            "compliance": this.evaluationFuncForm.field.throughput.ratio[i].compliance,
            "ULValue": this.evaluationFuncForm.field.throughput.ratio[i].ULValue,
            "DLValue": this.evaluationFuncForm.field.throughput.ratio[i].DLValue
          }
        );
      }
    }
    else
    {
      this.calculateForm.evaluationFunc.field.throughput.activate = false;
      this.calculateForm.evaluationFunc.field.throughput.ratio = [];
    }

    if(this.evaluationFuncForm.ue.throughputByRsrp.activate)
    {
      this.calculateForm.evaluationFunc.ue.throughputByRsrp.activate = true;
      for(var i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++)
      {
        this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio.push
        (
          {
            "countRatio": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio/100,
            "compliance": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].compliance,
            "ULValue": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue,
            "DLValue": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue
          }
        );
      }
    }
    else
    {
      this.calculateForm.evaluationFunc.ue.throughputByRsrp.activate = false;
      this.calculateForm.evaluationFunc.ue.throughputByRsrp.ratio = [];
    }

    if(this.evaluationFuncForm.ue.coverage.activate)
    {
      this.calculateForm.evaluationFunc.ue.coverage.activate = true;
      this.calculateForm.evaluationFunc.ue.coverage.ratio = 
      this.evaluationFuncForm.ue.coverage.ratio / 100;
    }
    else
    {
      this.calculateForm.evaluationFunc.ue.coverage.activate = false;
      this.calculateForm.evaluationFunc.ue.coverage.ratio = this.defaultArea / 100;
    }
  }

  /** 組form */
  setForm()
  {
    // if (typeof this.calculateForm.isAverageSinr === 'undefined') {
    this.calculateForm.isAverageSinr = false;
    // }
    // if (typeof this.calculateForm.isAvgThroughput === 'undefined') {
    this.calculateForm.isAvgThroughput = false;
    // }
    if (typeof this.calculateForm.isCoverage === 'undefined')
    {
      this.calculateForm.isCoverage = false;
    }
    // if (typeof this.calculateForm.isUeAvgSinr === 'undefined') {
    this.calculateForm.isUeAvgSinr = false;
    // }
    if (typeof this.calculateForm.isUeAvgThroughput === 'undefined')
    {
      this.calculateForm.isUeAvgThroughput = false;
    }
    if (typeof this.calculateForm.isUeCoverage === 'undefined')
    {
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
    if (this.calculateForm.isCoverage == true)
    {
      this.calculateForm.isUeAvgThroughput = false;
      this.calculateForm.isUeCoverage = false;
    } else if (this.calculateForm.isUeAvgThroughput == true)
    {
      this.calculateForm.isCoverage = false;
      this.calculateForm.isUeCoverage = false;
    } else
    {
      this.calculateForm.isCoverage = false;
      this.calculateForm.isUeAvgThroughput = false;
    }

    this.calculateForm.sessionid = this.authService.userToken;
    const zValue = this.zValues.filter(
      option => option !== null
      // option => option !== ''
    );
    this.calculateForm.zValue = `[${zValue.toString()}]`;
    // this.calculateForm.zValue = `[${zValue.toString()}]`;
    let obstacleInfo = '';
    this.calculateForm.obstacleInfo = obstacleInfo;
    if (this.obstacleList.length > 0)
    {
      // 障礙物資訊
      for (let i = 0; i < this.obstacleList.length; i++)
      {
        const obj = this.dragObject[this.obstacleList[i]];
        const shape = this.parseElement(obj.element);
        obstacleInfo += `[${obj.x},${obj.y},${obj.z},${obj.width},${obj.height},${obj.altitude},${obj.rotate},${Number(obj.material)},${shape}]`;
        if (i < this.obstacleList.length - 1)
        {
          obstacleInfo += '|';
        }
      }
      this.calculateForm.obstacleInfo = obstacleInfo;
    }
    let ueCoordinate = '';
    let ueRxGain = [];
    this.calculateForm.ueCoordinate = ueCoordinate;
    if (this.ueList.length > 0)
    {
      for (let i = 0; i < this.ueList.length; i++)
      {
        const obj = this.dragObject[this.ueList[i]];
        // ueCoordinate += `[${obj.x},${obj.y},${obj.z},${obj.material}]`;
        ueCoordinate += `[${obj.x},${obj.y},${obj.z}]`;
        ueRxGain.push(this.ueListParam[this.ueList[i]].ueRxGain);
        if (i < this.ueList.length - 1)
        {
          ueCoordinate += '|';
        }
      }
    } else
    {
      ueCoordinate = '';
    }
    this.calculateForm.ueCoordinate = ueCoordinate;
    this.calculateForm.ueRxGain = `[${ueRxGain.toString()}]`;

    /******舊格式先保留******/
    let defaultBs = '';
    this.calculateForm.defaultBs = defaultBs;
    if (this.defaultBSList.length > 0)
    {
      // 現有基站
      for (let i = 0; i < this.defaultBSList.length; i++)
      {
        const obj = this.dragObject[this.defaultBSList[i]];
        // defaultBs += `[${obj.x},${obj.y},${obj.altitude}]`;
        defaultBs += `[${obj.x},${obj.y},${obj.z}]`;
        if (i < this.defaultBSList.length - 1)
        {
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
    if (Number(this.calculateForm.objectiveIndex) === 0)
    {
      mapProtocol = '4g';
    } else if (Number(this.calculateForm.objectiveIndex) === 1)
    {
      mapProtocol = '5g';
    } else
    {
      mapProtocol = 'wifi';
    }
    //4G and 5G
    let bsNoiseFigure = [];
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

    if (this.defaultBSList.length > 0 || this.candidateList.length > 0)
    {

      let candidate = '';
      let candidateBsAnt = '';
      if (this.candidateList.length > 0)
      {
        for (let i = 0; i < this.candidateList.length; i++)
        {
          const canObj = this.dragObject[this.candidateList[i]];
          bsNoiseFigure.push(this.tempCalParamSet.bsNoiseFigure);
          candidate += `[${canObj.x},${canObj.y},${canObj.altitude}]`;
          // candidate += `[${canObj.x},${canObj.y},${canObj.z}]`;
          if (i < this.candidateList.length - 1)
          {
            candidate += '|';
          }
          candidateBsAnt += `[${this.tempCalParamSet.AntennaId},${this.tempCalParamSet.theta},${this.tempCalParamSet.phi},${this.tempCalParamSet.bsTxGain}]`;
          if (i < this.candidateList.length - 1)
          {
            candidateBsAnt += '|';
          }
          // const obj = this.bsListRfParam[this.candidateList[i]];
          // console.log(`obj: ${JSON.stringify(obj)}`);
          if (mapProtocol !== 'wifi')
          {
            if (mapProtocol === '5g')
            {
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
            } else
            {
              mimoNumber.push(this.tempCalParamSet.mimoNumber4G);
              // mimoNumber.push(obj.mimoNumber4G);
            }
            if (duplex === 'tdd')
            {
              bandwidthList.push(this.tempCalParamSet.tddbandwidth);
              frequencyList.push(this.tempCalParamSet.tddfrequency);
            } else
            {
              dlFrequency.push(this.tempCalParamSet.fddDlFrequency);
              ulFrequency.push(this.tempCalParamSet.fddUlFrequency);
              dlScs.push(this.tempCalParamSet.dlScs);
              ulScs.push(this.tempCalParamSet.ulScs);
              dlBandwidth.push(this.tempCalParamSet.dlBandwidth);
              ulBandwidth.push(this.tempCalParamSet.ulBandwidth);
            }
          } else
          {
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

      let defaultBsAnt = '';
      for (let i = 0; i < this.defaultBSList.length; i++)
      {
        const obj = this.bsListRfParam[this.defaultBSList[i]];
        txpower.push(obj.txpower);
        beamId.push(obj.beampattern);
        bsNoiseFigure.push(obj.bsNoiseFigure);
        // freqList.push(obj.frequency);
        defaultBsAnt += `[${obj.AntennaId},${obj.theta},${obj.phi},${obj.bsTxGain}]`;
        if (i < this.defaultBSList.length - 1)
        {
          defaultBsAnt += '|';
        }
        if (mapProtocol !== 'wifi')
        {
          if (mapProtocol === '5g')
          {
            ulMcsTable.push(obj.ulModulationCodScheme);
            dlMcsTable.push(obj.dlModulationCodScheme);
            ulMimoLayer.push(obj.ulMimoLayer);
            dlMimoLayer.push(obj.dlMimoLayer);
            scs.push(obj.tddscs);
            // scs.push(obj.subcarrier);
          } else
          {
            mimoNumber.push(obj.mimoNumber4G);
          }
          if (duplex === 'tdd')
          {
            bandwidthList.push(obj.tddbandwidth);
            frequencyList.push(obj.tddfrequency);
          } else
          {
            dlFrequency.push(obj.fddDlFrequency);
            ulFrequency.push(obj.fddUlFrequency);
            dlScs.push(obj.dlScs);
            ulScs.push(obj.ulScs);
            dlBandwidth.push(obj.dlBandwidth);
            ulBandwidth.push(obj.ulBandwidth);
          }
        } else
        {
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
      if (this.calculateForm.mapProtocol != 'wifi')
      {
        this.calculateForm.duplex = duplex;
      } else
      {
        this.calculateForm.duplex = '';
      }
      this.calculateForm.scalingFactor = scalingFactor;
      this.calculateForm.tddFrameRatio = tddFrameRatio;
      this.calculateForm.bsNoiseFigure = `[${bsNoiseFigure.toString()}]`;
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
      let tempWifiProtocol = '';
      let tempGuardInterval = '';
      let tempWifiMimo = '';
      for (let i = 0; i < wifiProtocol.length; i++)
      {
        if (i == 0)
        {
          tempWifiProtocol += "[" + wifiProtocol[i] + ",";
          tempGuardInterval += "[" + guardInterval[i] + ",";
          tempWifiMimo += "[" + wifiMimo[i] + ",";
        } else if (i < wifiProtocol.length - 1)
        {
          tempWifiProtocol += "" + wifiProtocol[i] + ",";
          tempGuardInterval += "" + guardInterval[i] + ",";
          tempWifiMimo += "" + wifiMimo[i] + ",";
        } else
        {
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

      this.calculateForm.txPower = `[${txpower.toString()}]`;
      this.calculateForm.beamId = `[${beamId.toString()}]`;
      this.calculateForm.bandwidthList = `[${bandwidthList.toString()}]`;
      this.calculateForm.frequencyList = `[${frequencyList.toString()}]`;
      this.calculateForm.frequency = `[${frequencyList.toString()}]`;
      this.calculateForm.bandwidth = `[${bandwidthList.toString()}]`;
      
    }
    /************/

    /*******DAS格式*******/
    if (this.planningIndex == '3')
    {
      let dfBsSvgId = '';
      let bsID = 0;
      let bsPosition = [];
      let bsTxPower = 0;
      let bsNoiseFigure = 0;
      let bsDuplex = {};
      let bsIsTdd = true;
      let bsIsFdd = false;
      let bsTddParam = {
      };
      let bsFddParam = {
        ul:
        {
          frequency: 0,
          bandwidth: 0,
          scs: 0,
          mcsTable: '',
          mimo: 8
        },
        dl:
        {
          frequency: 0,
          bandwidth: 0,
          scs: 0,
          mcsTable: '',
          mimo: 8
        }
      };
      let bsAntenna = [];
      let antennaBsSelect = null;
      let antennaSvgId = '';
      let defaultBs = [];


      for (let bs = 0; bs < this.defaultBSList.length; bs++)
      {
        bsAntenna = [];
        dfBsSvgId = this.defaultBSList[bs];
        antennaBsSelect = this.getAntennaById(this.bsListRfParam[dfBsSvgId].AntennaId);
        bsID = bs;
        bsPosition = [Number(this.dragObject[dfBsSvgId].x), Number(this.dragObject[dfBsSvgId].y), Number(this.dragObject[dfBsSvgId].z)];
        bsTxPower = this.bsListRfParam[dfBsSvgId].txpower;
        bsNoiseFigure = this.bsListRfParam[dfBsSvgId].bsNoiseFigure;
        bsIsTdd = (this.duplexMode == 'tdd');
        bsIsFdd = (this.duplexMode == 'fdd');
        if (bsIsTdd)
        {
          bsTddParam ={
            ul:
            {
              frameRatio: this.dlRatio,
              frequency: this.bsListRfParam[dfBsSvgId].tddfrequency,
              bandwidth: this.bsListRfParam[dfBsSvgId].tddbandwidth,
              scs: this.bsListRfParam[dfBsSvgId].tddscs,
              mcsTable: this.bsListRfParam[dfBsSvgId].ulModulationCodScheme,    
              mimo: this.bsListRfParam[dfBsSvgId].ulMimoLayer
            },
            dl:
            {
              frameRatio: this.dlRatio,
              frequency: this.bsListRfParam[dfBsSvgId].tddfrequency,
              bandwidth: this.bsListRfParam[dfBsSvgId].tddbandwidth,
              scs: this.bsListRfParam[dfBsSvgId].tddscs,
              mcsTable: this.bsListRfParam[dfBsSvgId].dlModulationCodScheme,
              mimo: this.bsListRfParam[dfBsSvgId].dlMimoLayer
            }
			        /*frameRatio: this.dlRatio,
              frequency: this.bsListRfParam[dfBsSvgId].tddfrequency,
              bandwidth: this.bsListRfParam[dfBsSvgId].tddbandwidth,
              scs: this.bsListRfParam[dfBsSvgId].tddscs,
              mcsTable: this.bsListRfParam[dfBsSvgId].dlModulationCodScheme,    
              mimo: antennaBsSelect.port*/
         };
        }
        else if (bsIsFdd)
        {
          bsFddParam = {
            ul:
            {
              frequency: this.bsListRfParam[dfBsSvgId].fddUlFrequency,
              bandwidth: this.bsListRfParam[dfBsSvgId].ulBandwidth,
              scs: this.bsListRfParam[dfBsSvgId].ulScs,
              mcsTable: this.bsListRfParam[dfBsSvgId].ulModulationCodScheme,
              mimo: this.bsListRfParam[dfBsSvgId].ulMimoLayer
            },
            dl:
            {
              frequency: this.bsListRfParam[dfBsSvgId].fddDlFrequency,
              bandwidth: this.bsListRfParam[dfBsSvgId].dlBandwidth,
              scs: this.bsListRfParam[dfBsSvgId].dlScs,
              mcsTable: this.bsListRfParam[dfBsSvgId].dlModulationCodScheme,
              mimo: this.bsListRfParam[dfBsSvgId].dlMimoLayer
            }
          };
        }


        //加入基站上的天線
        bsAntenna.push(
          {
            antennaID: this.bsListRfParam[dfBsSvgId].AntennaId,
            position: [Number(this.dragObject[dfBsSvgId].x), Number(this.dragObject[dfBsSvgId].y),
            Number(this.dragObject[dfBsSvgId].z)],
            gain: this.bsListRfParam[dfBsSvgId].bsTxGain,
            ulFrequency: this.bsListRfParam[dfBsSvgId].ulAntFreq,
            dlFrequency: this.bsListRfParam[dfBsSvgId].dlAntFreq,
            theta: this.bsListRfParam[dfBsSvgId].theta,
            phi: this.bsListRfParam[dfBsSvgId].phi,
          }
        );
        for (let a = 0; a < this.bsListRfParam[dfBsSvgId].antenna.length; a++)
        {
          antennaSvgId = this.bsListRfParam[dfBsSvgId].antenna[a].svgId;
          bsAntenna.push(
            {
              antennaID: this.bsListRfParam[dfBsSvgId].AntennaId,
              position: [Number(this.dragObject[antennaSvgId].x),
                Number(this.dragObject[antennaSvgId].y), Number(this.dragObject[antennaSvgId].z)],
              gain: this.bsListRfParam[dfBsSvgId].antenna[a].gain,
              ulFrequency: this.bsListRfParam[dfBsSvgId].ulAntFreq,   //全部天線上行頻率都相同
              dlFrequency: this.bsListRfParam[dfBsSvgId].dlAntFreq,   //全部天線下行頻率都相同
              theta: this.bsListRfParam[dfBsSvgId].antenna[a].theta,
              phi: this.bsListRfParam[dfBsSvgId].antenna[a].phi,
            }
          );
        }

        defaultBs.push
        (
          {
            ID: bsID,
            color: this.colorList[dfBsSvgId],
            position: bsPosition,
            txPower: bsTxPower,
            noiseFigure: bsNoiseFigure,
            duplex:
            {
              isTdd: bsIsTdd,
              isFdd: bsIsFdd,
              tddParam: bsTddParam,
              fddParam: bsFddParam
            },
            antenna: bsAntenna
          }
        );

      }
      this.calculateForm.bsList =
      {
        defaultBs: defaultBs
      };

      
    }
    /**************/


    // number type to number
    Object.keys(this.calculateForm).forEach((key) => {
      if (this.numColumnList.includes(key)) {
        this.calculateForm[key] = Number(this.calculateForm[key]);
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
  }

  /**
   * BsList Txpower, BeamPattern, Frequency
   */
  changeTxBfFreq(item) {
    console.log(`Bs${item}:${this.bsListRfParam[item]}`);
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
        console.log(res);

        if (res['progress'] === 1) {

          this.authService.showFinish();

          const resultUrl = `${this.authService.API_URL}/completeCalcResult/${this.taskid}/${this.authService.userToken}`;
          this.http.get(resultUrl).subscribe(
            resCalcResult => {

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

              if(unAchieved)
              {
                this.authService.spinnerHide();

                var msg = this.translateService.instant('target.unachieved');
                this.msgDialogConfig.data = {
                  infoMessage: msg
                };
                const dialogRef = this.matDialog.open(ConfirmDailogComponent, this.msgDialogConfig);
                
                dialogRef.componentInstance.onOK.subscribe(() => {
                                    // done
                  this.authService.spinnerHide();
                  // 儲存
                  // this.save();
                  window.clearInterval(this.pgInterval);
                  for (let i = 0; i < this.pgInterval; i++) {
                    window.clearInterval(i);
                  }
                  localStorage.setItem(`unAchievedObj`, JSON.stringify(unAchievedObj));
                  sessionStorage.removeItem('importFile');
                  sessionStorage.removeItem('taskName');
                  this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }}).then(() => {
                    // location.reload();
                  });;
                });
              }
              else{

                // done
                this.authService.spinnerHide();
                // 儲存
                // this.save();
                window.clearInterval(this.pgInterval);
                for (let i = 0; i < this.pgInterval; i++) {
                  window.clearInterval(i);
                }
                sessionStorage.removeItem('importFile');
                sessionStorage.removeItem('taskName');
                this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }}).then(() => {
                  // location.reload();
                });;
              }
              
            },
            errCalcResult => {
              let msg = this.translateService.instant('cant_get_result');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
            }
          );


          
        } else {
          // query again
          window.clearInterval(this.progressInterval);
          for (let i = 0; i < this.progressInterval; i++) {
            window.clearInterval(i);
          }
          this.progressInterval = window.setTimeout(() => {
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
              this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }}).then(() => {
                // location.reload();
              });;
            }
          );
        }
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: this.translateService.instant('cant_get_result')
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        
      }
    );
  }

  changePlanningTarget(target) {
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

  }

  changeEvaluationFuncCheckBox()
  {
    if(this.evaluationFuncForm.field.sinr.activate && this.evaluationFuncForm.field.sinr.ratio.length == 0)
    {
      this.addSINR();
    }
    if(this.evaluationFuncForm.field.rsrp.activate && this.evaluationFuncForm.field.rsrp.ratio.length == 0)
    {
      this.addRSRP();
    }
    if(this.evaluationFuncForm.field.throughput.activate && this.evaluationFuncForm.field.throughput.ratio.length == 0)
    {
      this.addThroughput();
    }
    if(this.evaluationFuncForm.ue.throughputByRsrp.activate && this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
    {
      this.addUEThroughput();
    }
    this.setStorageEvaluationFuncForm();
  }

  setStorageEvaluationFuncForm() {
    window.sessionStorage.setItem(`evaluationFuncForm`, JSON.stringify(this.evaluationFuncForm));
  }

  getStorageEvaluationFuncForm() {
    if(window.sessionStorage.getItem(`evaluationFuncForm`) != null)
    {
      this.evaluationFuncForm = JSON.parse(window.sessionStorage.getItem(`evaluationFuncForm`));
    }
    this.setThroughputTypeAndValue();
  }

  changeBsNumOpti() {
    window.sessionStorage.setItem(`isBsNumberOptimization`, this.isBsNumberOptimization);
  }

  /**
   * 變更障礙物size
   * @param svgId 物件id 
   */
  changeSize(svgId, type, first) {
    if (type == 'altitude') {
      if (this.dragObject[svgId].altitude <= 0) {
        this.dragObject[svgId].altitude = Number(window.sessionStorage.getItem('tempParam'));
        let msg = this.translateService.instant('wha_cant_less_than_0');
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      } else if (Number(this.dragObject[svgId].z) + Number(this.dragObject[svgId].altitude) > Number(this.calculateForm.altitude)) {
        this.recoverParam(svgId,'altitude');
        let msg = this.translateService.instant('z_greater_then_field_altitude');
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
      return;
    }
    if (type == 'width' && this.dragObject[svgId].width <= 0) {
      this.dragObject[svgId].width = Number(window.sessionStorage.getItem('tempParam'));
      let msg = this.translateService.instant('wha_cant_less_than_0');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    } else if (type == 'height' && this.dragObject[svgId].height <= 0) {
      this.dragObject[svgId].height = Number(window.sessionStorage.getItem('tempParam'));
      let msg = this.translateService.instant('wha_cant_less_than_0');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }
    this.svgId = svgId;
    // this.target = document.querySelector(`#${svgId}`);
    const elementWidth = this.pixelXLinear(this.dragObject[svgId].width);
    const elementHeight = this.pixelYLinear(this.dragObject[svgId].height);

    this.spanStyle[svgId].width = `${elementWidth}px`;
    this.spanStyle[svgId].height = `${elementHeight}px`;
    this.svgStyle[svgId].width = elementWidth;
    this.svgStyle[svgId].height = elementHeight;

    const shape = this.dragObject[svgId].element;
    if (shape === 'rect' || Number(shape) === 0) {
      this.rectStyle[svgId] = {
        width: elementWidth,
        height: elementHeight,
        fill: this.dragObject[svgId].color
      };
    } else if (shape === 'ellipse' || Number(shape) === 2) {
      let x;
      let y;
      if (type === 'width') {
        x = elementWidth / 2;
        y = elementWidth / 2;
        const y2 = y * 2;
        this.spanStyle[svgId].height = `${y2}px`;
        this.svgStyle[svgId].height = y2;
        this.dragObject[svgId].height = this.roundFormat(this.yLinear(y2));
      } else {
        x = elementHeight / 2;
        y = elementHeight / 2;
        const x2 = x * 2;
        this.spanStyle[svgId].width = `${x2}px`;
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
      
    } else if (shape === 'polygon' || Number(shape) === 1) {
      const points = `${elementWidth / 2},0 ${elementWidth}, ${elementHeight} 0, ${elementHeight}`;
      this.polygonStyle[svgId] = {
        points: points,
        fill: this.dragObject[svgId].color
      };
    } else if (shape === 'trapezoid' || Number(shape) === 3) {
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
  }

  modalParam = {
    dir: '',
    isCandidate: false
  }
  // 檢查頻率+頻寬是否與其他基地台重疊
  changeFrequency(svgId, dir, isCandidate) {
    // console.log('changeFrequency changeFrequency changeFrequency');
    // 若為FDD先檢查上下行有沒有一樣
    if (isCandidate) {
      let msg = '';
      if (dir == '' && (Number(this.tempCalParamSet.tddfrequency) > 6000 || Number(this.tempCalParamSet.tddfrequency) < 450)) {
        msg = this.translateService.instant('frequency_out_of_fr1');
        this.tempCalParamSet.tddfrequency = Number(window.sessionStorage.getItem('tempParam'))
      } else if (dir == 'dl' && (Number(this.tempCalParamSet.fddDlFrequency) > 6000 || Number(this.tempCalParamSet.fddDlFrequency) < 450)) {
        this.tempCalParamSet.fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        msg = this.translateService.instant('frequency_out_of_fr1');
      } else if (dir == 'ul' && (Number(this.tempCalParamSet.fddUlFrequency) > 6000 || Number(this.tempCalParamSet.fddUlFrequency) < 450)) {
        this.tempCalParamSet.fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        msg = this.translateService.instant('frequency_out_of_fr1');
      } else if (dir != '' && this.tempCalParamSet.fddUlFrequency == this.tempCalParamSet.fddDlFrequency) {
        if (dir == 'dl') {
          this.tempCalParamSet.fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        } else {
          this.tempCalParamSet.fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        }
        msg = (dir == 'ul' ? this.translateService.instant('dlfrequency_same_ulfrequency2'):this.translateService.instant('dlfrequency_same_ulfrequency3'));
      }
      if (msg != '') {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }
    } else {
      let msg = '';
      if (dir == '' && (Number(this.bsListRfParam[svgId].tddfrequency) > 6000 || Number(this.bsListRfParam[svgId].tddfrequency) < 450)) {
        msg = this.translateService.instant('frequency_out_of_fr1');
        this.bsListRfParam[svgId].tddfrequency = Number(window.sessionStorage.getItem('tempParam'))
      } else if (dir == 'dl' && (Number(this.bsListRfParam[svgId].fddDlFrequency) > 6000 || Number(this.bsListRfParam[svgId].fddDlFrequency) < 450)) {
        this.bsListRfParam[svgId].fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        msg = this.translateService.instant('frequency_out_of_fr1');
      } else if (dir == 'ul' && (Number(this.bsListRfParam[svgId].fddUlFrequency) > 6000 || Number(this.bsListRfParam[svgId].fddUlFrequency) < 450)) {
        this.bsListRfParam[svgId].fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        msg = this.translateService.instant('frequency_out_of_fr1');
      } else if (dir != '' && this.bsListRfParam[svgId].fddUlFrequency == this.bsListRfParam[svgId].fddDlFrequency) {
        if (dir == 'dl') {
          this.bsListRfParam[svgId].fddDlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        } else {
          this.bsListRfParam[svgId].fddUlFrequency = Number(window.sessionStorage.getItem('tempParam'))
        }
        msg = (dir == 'ul' ? this.translateService.instant('dlfrequency_same_ulfrequency2'):this.translateService.instant('dlfrequency_same_ulfrequency3'));
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }
      if (msg != '') {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: msg
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }

      console.log(`${this.bsListRfParam[this.selectBsSvgId].AntennaId}`);
      console.log(`${JSON.stringify(this.getAntennaById(this.bsListRfParam[this.selectBsSvgId].AntennaId))}`);

      if (this.getAntennaById(this.bsListRfParam[this.selectBsSvgId].AntennaId).type != 'Omnidirectional' ||
        this.getAntennaById(this.bsListRfParam[this.selectBsSvgId].AntennaId).property != 'default')
      {
        let AntULfrequency = Number(this.bsListRfParam[this.selectBsSvgId].ulAntFreq);
        let AntDLfrequency = Number(this.bsListRfParam[this.selectBsSvgId].dlAntFreq);
        let thershold = 100;
        let error = false;
        let multiple = false;

        // 檢查天線frequency與基站frequency是否一致(+-100);

        if (this.duplexMode == 'tdd' && !(this.authService.isEmpty(this.bsListRfParam[this.selectBsSvgId].tddfrequency)))
        {
          if (((AntULfrequency + thershold <= this.bsListRfParam[this.selectBsSvgId].tddfrequency) ||
            (AntULfrequency - thershold >= this.bsListRfParam[this.selectBsSvgId].tddfrequency)) )
          {
            msg += this.translateService.instant('tddfrequency') + ' ' + this.bsListRfParam[this.selectBsSvgId].tddfrequency + ' ';
            error = true;
          }
        }
        else if (this.duplexMode == 'fdd' && !(this.authService.isEmpty(this.bsListRfParam[this.selectBsSvgId].fddUlFrequency))
          && !(this.authService.isEmpty(this.bsListRfParam[this.selectBsSvgId].fddDlFrequency)))
        {
          if (((AntULfrequency + thershold <= this.bsListRfParam[this.selectBsSvgId].fddUlFrequency) ||
            (AntULfrequency - thershold >= this.bsListRfParam[this.selectBsSvgId].fddUlFrequency)))
          {
            msg += this.translateService.instant('uplink.frequency') + ' ' + this.bsListRfParam[this.selectBsSvgId].fddUlFrequency + ' ';
            error = true;
          }
          if (((AntDLfrequency + thershold <= this.bsListRfParam[this.selectBsSvgId].fddDlFrequency) ||
            (AntDLfrequency - thershold >= this.bsListRfParam[this.selectBsSvgId].fddDlFrequency)))
          {
            if (error)
            {
              if (this.checkIfChinese())
              {
                msg += ' 和 ';
              } else
              {
                msg += ' and the ';
              }
              multiple = true;
            }
            msg += this.translateService.instant('downlink.frequency') + ' ' + this.bsListRfParam[this.selectBsSvgId].fddDlFrequency + ' ';
            error = true;
          }
        }

        
        if (error)
        {
          if (this.checkIfChinese())
          {
            if (this.duplexMode == 'tdd')
              this.infoMsg = "您所設置的" + msg + " 與天線頻率 " + AntULfrequency + " 差異較大, 可能導致計算結果不準確";
            else if (this.duplexMode == 'fdd')
              this.infoMsg = "您所設置的" + msg + " 與天線頻率 (" + AntULfrequency + "/" + AntDLfrequency
                + ") 差異較大, 可能導致計算結果不準確";

          } else
          {
            let msgString = "you set is ";
            if (multiple)
            {
              msgString = "you set are ";
            }
            if (this.duplexMode == 'tdd')
              this.infoMsg = "<br>The " + msg + msgString + "quite different from the antenna frequency " + AntULfrequency + ",<br> which may cause inaccurate calculation results.";
            else if (this.duplexMode == 'fdd')
              this.infoMsg = "<br>The " + msg + msgString + "quite different from the antenna frequency (" +
                AntDLfrequency + "/" + "),<br> which may cause inaccurate calculation results.";



          }
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: this.infoMsg
          };

          window.setTimeout(() =>
          {
            this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          }, 100);
        }
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
  }

  changeWifiProtocol(value, isCandidate) {
    if (value == 'wifi4') {
      if (isCandidate) {
        this.tempCalParamSet.wifiBandwidth = '20';
        this.tempCalParamSet.wifiFrequency = 2412;
        this.tempCalParamSet.guardInterval = '400ns';
        this.tempCalParamSet.wifiMimo = '2x2';
      } else {
        this.bsListRfParam[this.svgId].wifiBandwidth = '20';
        this.bsListRfParam[this.svgId].wifiFrequency = 2412;
        this.bsListRfParam[this.svgId].guardInterval = '400ns';
        this.bsListRfParam[this.svgId].wifiMimo = '2x2';
      }
    } else if (value == 'wifi5') {
      if (isCandidate) {
        this.tempCalParamSet.wifiBandwidth = '40';
        this.tempCalParamSet.wifiFrequency = 5170;
        this.tempCalParamSet.guardInterval = '400ns';
        this.tempCalParamSet.wifiMimo = '2x2';
      } else {
        this.bsListRfParam[this.svgId].wifiBandwidth = '40';
        this.bsListRfParam[this.svgId].wifiFrequency = 5170;
        this.bsListRfParam[this.svgId].guardInterval = '400ns';
        this.bsListRfParam[this.svgId].wifiMimo = '2x2';
      }
    } else {
      if (isCandidate) {
        this.tempCalParamSet.wifiBandwidth = '20';
        this.tempCalParamSet.wifiFrequency = 2412;
        this.tempCalParamSet.guardInterval = '400ns';
        this.tempCalParamSet.wifiMimo = '2x2';
      } else {
        this.bsListRfParam[this.svgId].wifiBandwidth = '20';
        this.bsListRfParam[this.svgId].wifiFrequency = 2412;
        this.bsListRfParam[this.svgId].guardInterval = '400ns';
        this.bsListRfParam[this.svgId].wifiMimo = '2x2';
      }
    }
  }

  changeScs(value, dir, isCandidate) {
    if (value == 15) {
      if (isCandidate) {
        if (dir == 'tdd') {
          this.tempCalParamSet.tddbandwidth = '5';
        } else if (dir == 'dl') {
          this.tempCalParamSet.dlBandwidth = '5';
        } else {
          this.tempCalParamSet.ulBandwidth = '5';
        }
      } else {
        if (dir == 'tdd') {
          this.bsListRfParam[this.svgId].tddbandwidth = '5';
        } else if (dir == 'dl') {
          this.bsListRfParam[this.svgId].dlBandwidth = '5';
        } else {
          this.bsListRfParam[this.svgId].ulBandwidth = '5';
        }
      }
    } else if (value == 30) {
      if (isCandidate) {
        if (dir == 'tdd') {
          this.tempCalParamSet.tddbandwidth = '5';
        } else if (dir == 'dl') {
          this.tempCalParamSet.dlBandwidth = '5';
        } else {
          this.tempCalParamSet.ulBandwidth = '5';
        }
      } else {
        if (dir == 'tdd') {
          this.bsListRfParam[this.svgId].tddbandwidth = '5';
        } else if (dir == 'dl') {
          this.bsListRfParam[this.svgId].dlBandwidth = '5';
        } else {
          this.bsListRfParam[this.svgId].ulBandwidth = '5';
        }
      }
    } else {
      if (isCandidate) {
        if (dir == 'tdd') {
          this.tempCalParamSet.tddbandwidth = '10';
        } else if (dir == 'dl') {
          this.tempCalParamSet.dlBandwidth = '10';
        } else {
          this.tempCalParamSet.ulBandwidth = '10';
        }
      } else {
        if (dir == 'tdd') {
          this.bsListRfParam[this.svgId].tddbandwidth = '10';
        } else if (dir == 'dl') {
          this.bsListRfParam[this.svgId].dlBandwidth = '10';
        } else {
          this.bsListRfParam[this.svgId].ulBandwidth = '10';
        }
      }
    }
  }

  changeBandwidth(dir, isCandidate) {
    
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
  }

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

  recoverParam(svgId,type) {
    // console.log(`svgId: ${svgId}`);
    // console.log(`type: ${type}`);
    if (type == 'x') {
      this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
    } else if (type == 'y') {
      this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
    } else if (type == 'rotate') {
      this.dragObject[svgId].rotate = Number(window.sessionStorage.getItem('tempParam'));
    } else if (type == 'width') {
      this.dragObject[svgId].width = Number(window.sessionStorage.getItem('tempParam'));
      this.changeSize(svgId,'width',false);
    } else if (type == 'height') {
      this.dragObject[svgId].height = Number(window.sessionStorage.getItem('tempParam'));
      this.changeSize(svgId,'height',false);
    } else if (type == 'z'){
      this.dragObject[svgId].z = Number(window.sessionStorage.getItem('tempParam'));
    } else if (type == 'altitude' ){
      this.dragObject[svgId].altitude = Number(window.sessionStorage.getItem('tempParam'));
    }
  }

  /**
   * 變更物件位置
   * @param svgId 物件id
   */
  changePosition(type,svgId) {
    // 先進行檢查，數字不可為負數，且不可超過場域長寬
    //有一些專案在轉換後可能有大小寫問題，目前未知為什麼會有大小寫問題
    const isOb = (svgId.split('_')[0].toLowerCase() != 'UE'.toLowerCase() &&
      svgId.split('_')[0].toLowerCase() != 'defaultBS'.toLowerCase() &&
      svgId.split('_')[0].toLowerCase() != 'antenna'.toLowerCase() &&
      svgId.split('_')[0].toLowerCase() != 'candidate'.toLowerCase()) ? true : false;
    console.log(`svgId = ${svgId}`);
    if (type != 'y') {
    // if (type == 'x') {
      // console.log(typeof this.calculateForm.width);
      if (!isOb) {
        if (Number(this.dragObject[svgId].x) < 0 || Number(this.dragObject[svgId].x) > Number(this.calculateForm.width)) {
          // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
          this.recoverParam(svgId,type);
          let msg = this.translateService.instant('x_greater_then_field_width');
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: msg
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          return;
        }
      } else {
        let isRotate = (this.dragObject[svgId].rotate == 0) ? false : true;
        console.log(`rotate: ${isRotate}`)
        let width = 0;
        if (isRotate) {
          let angle = Number(this.dragObject[svgId].rotate%360);
          let obWid = Number(this.dragObject[svgId].width);
          let obHei = Number(this.dragObject[svgId].height);
          let deg = 2*Math.PI/360;
          let x = Number(this.dragObject[svgId].x);
          let y = Number(this.dragObject[svgId].y);
          if (angle < 0) {angle+=360};
          if (svgId.split('_')[0] == 'rect') {
            let tempAngle = 360 - angle; 
            let rcc = [x+obWid/2,y+obHei/2];
            let leftbot = [x,y];
            let lefttop = [x,y+obHei];
            let rightbot = [x+obWid,y];
            let righttop = [x+obWid,y+obHei];
            let rotleftbot = [
              (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotlefttop = [
              (lefttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(lefttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (lefttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(lefttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrightbot = [
              (rightbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(rightbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (rightbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(rightbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrighttop = [
              (righttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(righttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (righttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(righttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let maxX = Math.max(rotleftbot[0],rotlefttop[0],rotrightbot[0],rotrighttop[0]);
            let minX = Math.min(rotleftbot[0],rotlefttop[0],rotrightbot[0],rotrighttop[0]);
            if (minX.toString().length > 10) {
              minX = 0;
            }
            console.log(maxX);
            console.log(minX);
            if (maxX > this.calculateForm.width || minX < 0) {
              // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
              this.recoverParam(svgId,type);
              let msg = this.translateService.instant('x_greater_then_field_width');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
              return;
            }
          } else if (svgId.split('_')[0] == 'polygon') {
            let tempAngle = 360 - angle; 
            let rcc = [x+obWid/2,y+obHei/2];
            let top = [x+obWid/2,y+obHei];
            let left = [x,y];
            let right = [x+obWid,y];
            let rotTop = [
              (top[0]-rcc[0])*Math.cos(tempAngle*deg)-(top[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (top[0]-rcc[0])*Math.sin(tempAngle*deg)+(top[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotLeft = [
              (left[0]-rcc[0])*Math.cos(tempAngle*deg)-(left[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (left[0]-rcc[0])*Math.sin(tempAngle*deg)+(left[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotRight = [
              (right[0]-rcc[0])*Math.cos(tempAngle*deg)-(right[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (right[0]-rcc[0])*Math.sin(tempAngle*deg)+(right[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let maxX = Math.max(rotTop[0],rotLeft[0],rotRight[0]);
            let minX = Math.min(rotTop[0],rotLeft[0],rotRight[0]);
            if (minX.toString().length > 10) {
              minX = 0;
            }
            if (maxX > this.calculateForm.width || minX < 0) {
              // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
              this.recoverParam(svgId,type);
              let msg = this.translateService.instant('x_greater_then_field_width');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
              return;
            }
          } else if (svgId.split('_')[0] == 'trapezoid') {
            let tempAngle = 360 - angle; 
            let rcc = [x+obWid/2,y+obHei/2];
            let leftbot = [x,y];
            let lefttop = [x+obWid/4,y+obHei];
            let rightbot = [x+obWid,y];
            let righttop = [x+(3*obWid/4),y+obHei];
            let rotleftbot = [
              (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotlefttop = [
              (lefttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(lefttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (lefttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(lefttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrightbot = [
              (rightbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(rightbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (rightbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(rightbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrighttop = [
              (righttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(righttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (righttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(righttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let maxX = Math.max(rotleftbot[0],rotlefttop[0],rotrightbot[0],rotrighttop[0]);
            let minX = Math.min(rotleftbot[0],rotlefttop[0],rotrightbot[0],rotrighttop[0]);
            if (minX.toString().length > 10) {
              minX = 0;
            }
            if (maxX > this.calculateForm.width || minX < 0) {
              // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
              this.recoverParam(svgId,type);
              let msg = this.translateService.instant('x_greater_then_field_width');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
              return;
            }
          } 
          // else if (svgId.split('_')[0] == 'ellipse') {}
        } else {
          console.log(Number(this.dragObject[svgId].width));
          console.log(Number(this.dragObject[svgId].x));
          console.log(Number(this.calculateForm.width));
          width = Number(this.dragObject[svgId].width);
          if (width + Number(this.dragObject[svgId].x) > Number(this.calculateForm.width) || Number(this.dragObject[svgId].x) < 0) {
            // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
            this.recoverParam(svgId,type);
            let msg = this.translateService.instant('x_greater_then_field_width');
            this.msgDialogConfig.data = {
              type: 'error',
              infoMessage: msg
            };
            this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
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
          this.recoverParam(svgId,type);
          let msg = this.translateService.instant('y_greater_then_field_height');
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: msg
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
          return;
        }
      } else {
        let isRotate = (this.dragObject[svgId].rotate == 0) ? false : true;
        console.log(`rotate: ${isRotate}`)
        let height = 0;
        if (isRotate) {
          let angle = Number(this.dragObject[svgId].rotate%360);
          let obWid = Number(this.dragObject[svgId].width);
          let obHei = Number(this.dragObject[svgId].height);
          let deg = 2*Math.PI/360;
          let x = Number(this.dragObject[svgId].x);
          let y = Number(this.dragObject[svgId].y);
          if (svgId.split('_')[0] == 'rect') {
            let tempAngle = 360 - angle; 
            let rcc = [x+obWid/2,y+obHei/2];
            let leftbot = [x,y];
            let lefttop = [x,y+obHei];
            let rightbot = [x+obWid,y];
            let righttop = [x+obWid,y+obHei];
            let rotleftbot = [
              (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotlefttop = [
              (lefttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(lefttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (lefttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(lefttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrightbot = [
              (rightbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(rightbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (rightbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(rightbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrighttop = [
              (righttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(righttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (righttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(righttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let maxY = Math.max(rotleftbot[1],rotlefttop[1],rotrightbot[1],rotrighttop[1]);
            let minY = Math.min(rotleftbot[1],rotlefttop[1],rotrightbot[1],rotrighttop[1]);
            if (minY.toString().length > 10) {
              minY = 0;
            }
            if (maxY > this.calculateForm.height || minY < 0) {
              // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
              this.recoverParam(svgId,type);
              let msg = this.translateService.instant('y_greater_then_field_height');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
              return;
            }
          } else if (svgId.split('_')[0] == 'polygon') {
            let tempAngle = 360 - angle; 
            let rcc = [x+obWid/2,y+obHei/2];
            let top = [x+obWid/2,y+obHei];
            let left = [x,y];
            let right = [x+obWid,y];
            let rotTop = [
              (top[0]-rcc[0])*Math.cos(tempAngle*deg)-(top[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (top[0]-rcc[0])*Math.sin(tempAngle*deg)+(top[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotLeft = [
              (left[0]-rcc[0])*Math.cos(tempAngle*deg)-(left[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (left[0]-rcc[0])*Math.sin(tempAngle*deg)+(left[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotRight = [
              (right[0]-rcc[0])*Math.cos(tempAngle*deg)-(right[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (right[0]-rcc[0])*Math.sin(tempAngle*deg)+(right[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            // console.log(rotTop);
            // console.log(rotLeft);
            // console.log(rotRight);
            let maxY = Math.max(rotTop[1],rotLeft[1],rotRight[1]);
            let minY = Math.min(rotTop[1],rotLeft[1],rotRight[1]);
            if (minY.toString().length > 10) {
              minY = 0;
            }
            if (maxY > this.calculateForm.height || minY < 0) {
              // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
              this.recoverParam(svgId,type);
              let msg = this.translateService.instant('y_greater_then_field_height');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
              return;
            }
          } else if (svgId.split('_')[0] == 'trapezoid') {
            let tempAngle = 360 - angle; 
            let rcc = [x+obWid/2,y+obHei/2];
            let leftbot = [x,y];
            let lefttop = [x+obWid/4,y+obHei];
            let rightbot = [x+obWid,y];
            let righttop = [x+(3*obWid/4),y+obHei];
            let rotleftbot = [
              (leftbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(leftbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (leftbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(leftbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotlefttop = [
              (lefttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(lefttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (lefttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(lefttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrightbot = [
              (rightbot[0]-rcc[0])*Math.cos(tempAngle*deg)-(rightbot[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (rightbot[0]-rcc[0])*Math.sin(tempAngle*deg)+(rightbot[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let rotrighttop = [
              (righttop[0]-rcc[0])*Math.cos(tempAngle*deg)-(righttop[1]-rcc[1])*Math.sin(tempAngle*deg)+rcc[0],
              (righttop[0]-rcc[0])*Math.sin(tempAngle*deg)+(righttop[1]-rcc[1])*Math.cos(tempAngle*deg)+rcc[1]
            ];
            let maxY = Math.max(rotleftbot[1],rotlefttop[1],rotrightbot[1],rotrighttop[1]);
            let minY = Math.min(rotleftbot[1],rotlefttop[1],rotrightbot[1],rotrighttop[1]);
            if (minY.toString().length > 10) {
              minY = 0;
            }
            if (maxY > this.calculateForm.height || minY < 0) {
              // this.dragObject[svgId].y = Number(window.sessionStorage.getItem('tempParam'));
              this.recoverParam(svgId,type);
              let msg = this.translateService.instant('y_greater_then_field_height');
              this.msgDialogConfig.data = {
                type: 'error',
                infoMessage: msg
              };
              this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
              return;
            }
          } 
          // else if (svgId.split('_')[0] == 'ellipse') {}
        } else {
          height = Number(this.dragObject[svgId].height);
          if (height + Number(this.dragObject[svgId].y) > Number(this.calculateForm.height) || Number(this.dragObject[svgId].y) < 0) {
            // this.dragObject[svgId].x = Number(window.sessionStorage.getItem('tempParam'));
            this.recoverParam(svgId,type);
            let msg = this.translateService.instant('y_greater_then_field_height');
            this.msgDialogConfig.data = {
              type: 'error',
              infoMessage: msg
            };
            this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
            return;
          }
        }
      }
      
    }
    // 0713 Xean修改
    this.spanStyle[svgId].left = `${this.pixelXLinear(this.dragObject[svgId].x)}px`;
    if (this.dragObject[svgId].type === 'obstacle') {
      this.spanStyle[svgId].top = `${this.chartHeight - this.pixelYLinear(this.dragObject[svgId].height) - this.pixelYLinear(this.dragObject[svgId].y)}px`;
      this.spanStyle[svgId].opacity = 0;
      // 障礙物先還原角度，移動後再轉動
      this.spanStyle[svgId]['transform'] = `rotate(0deg)`;
      // 延遲轉角度，讓位置正確
      window.setTimeout(() => {
        this.spanStyle[svgId]['transform'] = `rotate(${this.dragObject[svgId].rotate}deg)`;
        this.spanStyle[svgId].opacity = 1;
      }, 0);
    } else if (this.dragObject[svgId].type === 'UE') {
      this.spanStyle[svgId].top = `${this.chartHeight - this.ueHeight - this.pixelYLinear(this.dragObject[svgId].y)}px`;
    } else if (this.dragObject[svgId].type === 'candidate') {
      this.spanStyle[svgId].top = `${this.chartHeight - this.candidateHeight - this.pixelYLinear(this.dragObject[svgId].y)}px`;
    } else if (this.dragObject[svgId].type === 'defaultBS')
    {
      this.spanStyle[svgId].top = `${this.chartHeight - 30 - this.pixelYLinear(this.dragObject[svgId].y)}px`;
    } else if (this.dragObject[svgId].type === 'antenna')
    {
      this.spanStyle[svgId].top = `${this.chartHeight - 30 - this.pixelYLinear(this.dragObject[svgId].y)}px`;
    }

    if (this.dragObject[svgId].type === 'defaultBS' || this.dragObject[svgId].type === 'candidate' || this.dragObject[svgId].type === 'antenna') {
      this.moveNumber(svgId);
    }
    // this.setTransform(this.target);
    // this.moveClick(svgId);
  }

  /**
   * 變更物件角度
   * @param svgId 物件id
   */
  changeRotate(svgId) {
    this.svgId = svgId;
    this.target = document.querySelector(`#${svgId}`);
    this.frame.set('transform', 'rotate', `${this.dragObject[svgId].rotate}deg`);
    // 初始化物件
    this.changePosition('rotate', svgId);
    this.moveClick(svgId);
    this.setTransform(this.target);
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
  changeProtoOrDuplex()
  {
    for (let bs = 0; bs < this.defaultBSList.length; bs++)
    {
      if (this.bsListRfParam[this.defaultBSList[bs]].fddUlFrequency == null || this.bsListRfParam[this.defaultBSList[bs]].fddUlFrequency == '')
        this.bsListRfParam[this.defaultBSList[bs]].fddUlFrequency = this.DEFAULT_BS_FDD_UL_FREQ;
      if (this.bsListRfParam[this.defaultBSList[bs]].fddDlFrequency == null || this.bsListRfParam[this.defaultBSList[bs]].fddDlFrequency == '')
        this.bsListRfParam[this.defaultBSList[bs]].fddDlFrequency = this.DEFAULT_BS_FDD_DL_FREQ;

      if (this.bsListRfParam[this.defaultBSList[bs]].fddDlFrequency == this.bsListRfParam[this.defaultBSList[bs]].fddUlFrequency)
      {
        this.bsListRfParam[this.defaultBSList[bs]].fddUlFrequency = this.bsListRfParam[this.defaultBSList[bs]].fddDlFrequency + 200;
      }

      if (this.bsListRfParam[this.defaultBSList[bs]].ulScs == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].ulScs = 15;
      }
      if (this.bsListRfParam[this.defaultBSList[bs]].dlScs == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].dlScs = 15;
      }

      if (this.bsListRfParam[this.defaultBSList[bs]].ulBandwidth == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].ulBandwidth = 5;
      }
      if (this.bsListRfParam[this.defaultBSList[bs]].dlBandwidth == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].dlBandwidth = 5;
      }

      if (this.bsListRfParam[this.defaultBSList[bs]].ulScs == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].ulScs = 15;
      }
      if (this.bsListRfParam[this.defaultBSList[bs]].dlScs == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].dlScs = 15;
      }

      if (this.bsListRfParam[this.defaultBSList[bs]].tddbandwidth == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].tddbandwidth = 5;
      }
      if (this.bsListRfParam[this.defaultBSList[bs]].tddscs == 0)
      {
        this.bsListRfParam[this.defaultBSList[bs]].tddscs = 15;
      }
      
    }



    let msg = this.translateService.instant('switch_duplex_hint');
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
    // 不知為何，只開一次dialog位置會偏移
    this.matDialog.closeAll();
    this.matDialog.open(View3dComponent, this.view3dDialogConfig);
  }  

  getAntennaRawdata(index, isDownload, isDefault)
  {
    console.log(index);
    console.log(JSON.stringify(this.defaultAntennaList));
    if (isDefault == 'default')
    {
      this.checkRawdataAntenna.name = this.defaultAntennaList[index].name;
      this.checkRawdataAntenna.antennaID = this.defaultAntennaList[index].antennaID;
      this.checkRawdataAntenna.type = this.defaultAntennaList[index].type;
      this.checkRawdataAntenna.property = this.defaultAntennaList[index].property;
    }
    else
    {
      console.log(JSON.stringify(this.customizedAntennaList));
      this.checkRawdataAntenna.name = this.customizedAntennaList[index].name;
      this.checkRawdataAntenna.antennaID = this.customizedAntennaList[index].antennaID;
      this.checkRawdataAntenna.type = this.customizedAntennaList[index].type;
      this.checkRawdataAntenna.property = this.customizedAntennaList[index].property; 
    }


    var isSame = false;

    if (this.checkRawdataAntenna.property == 'default' && this.checkRawdataAntenna.type == 'Omnidirectional')
    {
      this.secondLayerDialogRef = this.matDialog.open(this.CheckAntennaRawdataModalTable);
      this.changedftOmiAntRawdataPattern(this.dftOmiAntSimulationTxGain);
    }
    else
    {
      let url = `${this.authService.API_URL}/getAntennaRawData/${this.checkRawdataAntenna.antennaID}/${this.authService.userToken}`;

      this.http.get(url).subscribe(
        res =>
        {
          this.checkRawdataAntenna.rawData = res['rawData'];
          this.checkRawdataAntenna.portList = [];
          this.checkRawdataAntenna.freqList = [];
          for (var r = 0; r < this.checkRawdataAntenna.rawData.length; r++)
          {
            isSame = false;
            for (var p = 0; p < this.checkRawdataAntenna.portList.length; p++)
            {
              if (this.checkRawdataAntenna.portList[p] == this.checkRawdataAntenna.rawData[r].portName)
              {
                isSame = true;
                break;
              }
            }
            if (!isSame)
              this.checkRawdataAntenna.portList.push(this.checkRawdataAntenna.rawData[r].portName);
            isSame = false;
            for (var f = 0; f < this.checkRawdataAntenna.freqList.length; f++)
            {
              if (this.checkRawdataAntenna.freqList[f] == this.checkRawdataAntenna.rawData[r].frequency)
              {
                isSame = true;
                break;
              }
            }
            if (!isSame)
              this.checkRawdataAntenna.freqList.push(this.checkRawdataAntenna.rawData[r].frequency);
          }
          this.checkRawdataAntenna.selectPort = this.checkRawdataAntenna.portList[0];
          this.checkRawdataAntenna.selectFreq = this.checkRawdataAntenna.freqList[0];

          if (isDownload)
            this.exportAntData();
          else
          {
            this.secondLayerDialogRef = this.matDialog.open(this.CheckAntennaRawdataModalTable);
            this.changeAntennaRawdataPattern();
          }
        },
        err =>
        {
          this.checkRawdataAntenna.rawData = [];
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: this.translateService.instant('antenna.get.error')
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        }
      );
    }

  }

  exportAntData()
  {
    var portName = "";
    var frequency = 0;
    var portGain = 0;
    var pattern = [];

    let PORT_NAME_CELL = 'B1';
    let FREQ_CELL = 'B2';
    let GAIN_CELL = 'B3';
    let HORI_COL = 'C';
    let VERT_COL = 'F';
    let ANGLE0_ROW = 6;

    var horiCell = '';
    var vertCell = '';

    const NEG = -1, POS = 1;
    let hSign = NEG;
    let vSign = NEG;
    let hValueToWrite = 0;
    let vValueToWrite = 0;

    fetch("../../assets/file/ITRI_antenna_template.xlsx")
      .then(res => res.blob()) // returns URL data a blob
      .then((blob) =>
      {
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) =>
        {
          const bstr: string = e.target.result;

          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
          const ws: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[0]]; // get original worksheet

          var copy_ws = JSON.parse(JSON.stringify(ws)); // make a copy of the object
          for (var i = 0; i < this.checkRawdataAntenna.rawData.length; i++)
          {
            portName = this.checkRawdataAntenna.rawData[i].portName;
            frequency = this.checkRawdataAntenna.rawData[i].frequency;
            portGain = this.checkRawdataAntenna.rawData[i].portGain;

            copy_ws = JSON.parse(JSON.stringify(wb.Sheets[wb.SheetNames[0]]));  //複製樣本sheet
            XLSX.utils.book_append_sheet(wb, copy_ws, `${portName}_${frequency}`);
            const wsToWrite: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[i+1]];
            
            pattern = this.checkRawdataAntenna.rawData[i].pattern;
            // 在 myPromise 被 resolve 時執行
            XLSX.utils.sheet_add_aoa(wsToWrite, [[portName]], { origin: PORT_NAME_CELL });
            XLSX.utils.sheet_add_aoa(wsToWrite, [[frequency]], { origin: FREQ_CELL });
            XLSX.utils.sheet_add_aoa(wsToWrite, [[portGain]], { origin: GAIN_CELL });
            for (var j = 0; j < pattern.length; j++)
            {
              horiCell = HORI_COL + (pattern[j][0] + ANGLE0_ROW);
              vertCell = VERT_COL + (pattern[j][0] + ANGLE0_ROW);
              hSign = Number(pattern[j][3]);
              vSign = Number(pattern[j][4]);

              if (hSign == POS)
                hValueToWrite = Math.abs(pattern[j][1]);
              else
                hValueToWrite = (pattern[j][1]);
              if (vSign == POS)
                vValueToWrite = Math.abs(pattern[j][2]);
              else
                vValueToWrite = (pattern[j][2]);
              
              XLSX.utils.sheet_add_aoa(wsToWrite, [[hValueToWrite]], { origin: horiCell });
              XLSX.utils.sheet_add_aoa(wsToWrite, [[vValueToWrite]], { origin: vertCell });
            }
          }

          //刪除樣本sheet
          delete wb.Sheets[wb.SheetNames[0]];
          delete wb.SheetNames[0];
          wb.SheetNames.splice(0, 1);

          //save
          XLSX.writeFile(wb, `${this.checkRawdataAntenna.name}.xlsx`);
        };
        reader.readAsBinaryString(blob);
      })
      .catch((e) => console.error(e));

  }

  /** export xlsx */
  export() {
    /* generate worksheet */
    // map
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    var maxLength = 32767;
    // console.log("calculateForm.mapImage,",this.calculateForm.mapImage);
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
    if (!(this.calculateForm.mapImage == null)){
      if (this.calculateForm.mapImage.length >= maxLength){
        let splitTimes = parseInt((this.calculateForm.mapImage.length / maxLength)+"") + 1;
        console.log("exceed",maxLength,", splitTimes:",splitTimes);
        for (let i = 1; i < splitTimes; i++) {
          if (i < mapData.length){
            console.log("i:",i,"maxLength*(i-1)",maxLength*(i-1),"maxLength*i",maxLength*i);
            mapData[i][0] = this.calculateForm.mapImage.substring(maxLength*(i-1),maxLength*i);
          }
          else{
            mapData.push([
              this.calculateForm.mapImage.substring(maxLength*(i-1),maxLength*i), '', '', '', '', '', ''
            ]);
          }
        }
        // 切割完剩下的最後一塊
        mapData.push([
          this.calculateForm.mapImage.substring(maxLength*(splitTimes-1),this.calculateForm.mapImage.length), '', '', '', '', '', ''
        ]);
        console.log("mapData.length",mapData.length);
      }
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mapData);
    XLSX.utils.book_append_sheet(wb, ws, 'map');

    // defaultBS
    const baseStationData = [['x', 'y', 'z', 'material', 'color', 'txpower', 'beamId', 'tddfrequency', 'tddbandwidth',
      'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
      '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
      'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers',
      'wifiProtocol', 'guardInterval', 'wifiMimo', 'wifiBandwidth', 'wifiFrequency',
      'bsTxGain', 'bsNoiseFigure', 'AntennaId', 'theta', 'phi', 'gain',
      'ulAntFreq', 'dlAntFreq']];
    for (const item of this.defaultBSList) {
      baseStationData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].z, '', '',
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

        //Base station Antenna
        this.bsListRfParam[item].AntennaId,
        this.bsListRfParam[item].theta,
        this.bsListRfParam[item].phi,
        this.bsListRfParam[item].bsTxGain,
        this.bsListRfParam[item].ulAntFreq,
        this.bsListRfParam[item].dlAntFreq,
      ]);
    }
    const baseStationWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationData);
    XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');

    // bs ant
    const baseStationAntData = [['positionX', 'positionY', 'positionZ', 'gain', 'theta', 'phi', 'isOnBs']];
    for (const item of this.defaultBSList)
    {
      baseStationAntData.push([
        this.dragObject[item].x,
        this.dragObject[item].y,
        this.dragObject[item].z,
        this.bsListRfParam[item].bsTxGain,
        this.bsListRfParam[item].theta,
        this.bsListRfParam[item].phi,
        true
      ]);
      if (this.bsListRfParam[item].antenna != null)
      {
        for (let a = 0; a < this.bsListRfParam[item].antenna.length; a++)
        {
          baseStationAntData.push([
            this.dragObject[this.bsListRfParam[item].antenna[a].svgId].x,
            this.dragObject[this.bsListRfParam[item].antenna[a].svgId].y,
            this.dragObject[this.bsListRfParam[item].antenna[a].svgId].z,
            this.bsListRfParam[item].antenna[a].gain,
            this.bsListRfParam[item].antenna[a].theta,
            this.bsListRfParam[item].antenna[a].phi,
            false
          ]);
        }
      }
    }
    const baseStationAntWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationAntData);
    XLSX.utils.book_append_sheet(wb, baseStationAntWS, 'base_station_ant');

    // candidate
    const candidateData = [['x', 'y', 'z','material','color',
    'tddfrequency', 'tddbandwidth',
    'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
    '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
    'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers',
    'wifiProtocol', 'guardInterval', 'wifiMimo', 'wifiBandwidth', 'wifiFrequency',
    'bsTxGain','bsNoiseFigure','AntennaId','theta','phi']];
    for (const item of this.candidateList) {
      candidateData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].altitude,'','',
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
    const candidateWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(candidateData);
    XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
    // UE
    const ueData = [['x', 'y', 'z','ueRxGain']];
    for (const item of this.ueList) {
      ueData.push([
        this.dragObject[item].x, this.dragObject[item].y,
        this.dragObject[item].z, 
        this.ueListParam[item].ueRxGain
        // this.dragObject[item].material,
        // this.dragObject[item].color
      ]);
    }
    const ueWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ueData);
    XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
    // obstacle
    const obstacleData = [['x', 'y', 'z', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
    for (const item of this.obstacleList) {
      const shape = this.parseElement(this.dragObject[item].element);
      obstacleData.push([
        this.dragObject[item].x, this.dragObject[item].y,this.dragObject[item].z,
        this.dragObject[item].width, this.dragObject[item].height,
        this.dragObject[item].altitude, this.dragObject[item].rotate,
        this.dragObject[item].material, this.dragObject[item].color,
        shape
      ]);
    }
    const obstacleWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(obstacleData);
    XLSX.utils.book_append_sheet(wb, obstacleWS, 'obstacle');
    // bs parameters
    let bsData = [];
    if (this.calculateForm.isSimulation) {
      bsData = [
        ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
        'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
        [
          this.calculateForm.powerMaxRange, this.calculateForm.powerMinRange,
          this.calculateForm.objectiveIndex, this.duplexMode, this.dlRatio,
          false,false,false,false,false
        ]
      ];
    } else {
      bsData = [
        ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
        'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
        [
          this.calculateForm.powerMaxRange, this.calculateForm.powerMinRange,
          this.calculateForm.objectiveIndex, this.duplexMode, this.dlRatio,
          this.calculateForm.isAverageSinr,this.calculateForm.isCoverage,
          this.calculateForm.isUeAvgSinr,
          this.calculateForm.isUeAvgThroughput,this.calculateForm.isUeCoverage
        ]
      ];
    }
    
    const bsWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(bsData);
    XLSX.utils.book_append_sheet(wb, bsWS, 'bs parameters');
    // algorithm parameters
    if (!(Number(this.calculateForm.maxConnectionNum)>0)){
      this.calculateForm.maxConnectionNum = 32;
    }
    if (!(Number(this.calculateForm.resolution)>0)){
      this.calculateForm['resolution'] = 1;
    }
    if (this.authService.isEmpty(this.calculateForm.geographicalNorth)){
      this.calculateForm['geographicalNorth'] = 0;
    }
    
    const algorithmData = [
      // ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel','maxConnectionNum'],
      ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 
      'pathLossModel', 'maxConnectionNum','resolution','geographicalNorth'],
      [
        
        this.calculateForm.crossover, this.calculateForm.mutation,
        this.calculateForm.iteration, this.calculateForm.seed,
        // 1, this.calculateForm.useUeCoordinate, this.calculateForm.pathLossModelId,
        1, this.calculateForm.useUeCoordinate, this.calculateForm.pathLossModelId, 
        this.calculateForm.maxConnectionNum, this.calculateForm.resolution, this.calculateForm.geographicalNorth
        
      ]
    ];
    const algorithmWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(algorithmData);
    XLSX.utils.book_append_sheet(wb, algorithmWS, 'algorithm parameters');

    // objective parameters
    let spec;
    if (this.calculateForm.objectiveIndex == '0') { spec = '4G' }
    else if (this.calculateForm.objectiveIndex == '1') { spec = '5G' }
    else { spec = 'wifi' }
    const objectiveData = [
      ['objective', 'objectiveStopCondition', 'newBsNum', 'isBsOptm'],
      [spec, '', this.calculateForm.availableNewBsNumber, this.isBsNumberOptimization]
    ];
    const objectiveWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(objectiveData);
    XLSX.utils.book_append_sheet(wb, objectiveWS, 'objective parameters');

    // subfield parameters

    const subData = [
      ['x', 'y', 'width_px', 'height_px', 'width_real', 'height_real']
    ];
    let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));

    for (const item of this.subFieldList)
    {
      let wr, hr;
      for (let i = 0; i < sub_field_arr.length; i++)
      {
        if (sub_field_arr[i].id == item)
        {
          wr = sub_field_arr[i].width;
          hr = sub_field_arr[i].height;
        }
      }
      subData.push([
        this.dragObject[item].x,
        this.dragObject[item].y,
        this.subFieldStyle[item].width,
        this.subFieldStyle[item].height,
        wr,
        hr]);
    }
    const subWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(subData);
    XLSX.utils.book_append_sheet(wb, subWS, 'subfield parameters');

    // MutilFunction Setting
    const mutilFunctionSettingData = [['PlanningIndex',	
    'Field.coverage.active', 'Field.sinr.active',	'Field.rsrp.active', 'Field.throughput.active',	
    'ue.coverage.active',	'ue.throughputbyrsrp.active',	
    'Field.sinr.length', 'Field.rsrp.length',	'Field.throughput.length', 
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
    const mutilFunctionSettingWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionSettingData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionSettingWS, 'mutil function setting');

    // MutilFunction Coverage
    const mutilFunctionCoverageData = [['Field.coverage.ratio']];
    mutilFunctionCoverageData.push([String(this.evaluationFuncForm.field.coverage.ratio)]);    
    const mutilFunctionCoverageWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionCoverageData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionCoverageWS, 'mutil function coverage');

    // MutilFunction SINR
    const mutilFunctionSINRData = [['Field.sinr.areaRatio', 'Field.sinr.compliance', 'Field.sinr.value']];
    for (var i = 0; i < this.evaluationFuncForm.field.sinr.ratio.length; i++) {
      mutilFunctionSINRData.push([
        String(this.evaluationFuncForm.field.sinr.ratio[i].areaRatio),
        String(this.evaluationFuncForm.field.sinr.ratio[i].compliance),
        String(this.evaluationFuncForm.field.sinr.ratio[i].value)]);   
    } 
    const mutilFunctionSINRWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionSINRData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionSINRWS, 'mutil function sinr');

    // MutilFunction RSRP
    const mutilFunctionRSRPData = [['Field.rsrp.areaRatio', 'Field.rsrp.compliance', 'Field.rsrp.value']];
    for (var i = 0; i < this.evaluationFuncForm.field.rsrp.ratio.length; i++) {
      mutilFunctionRSRPData.push([
        String(this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio),
        String(this.evaluationFuncForm.field.rsrp.ratio[i].compliance),
        String(this.evaluationFuncForm.field.rsrp.ratio[i].value)]);   
    } 
    const mutilFunctionRSRPWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionRSRPData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionRSRPWS, 'mutil function rsrp');

    // MutilFunction Throughput
    const mutilFunctionThroughputData = [['Field.throughput.areaRatio', 'Field.throughput.compliance', 'Field.throughput.ULValue', 'Field.throughput.DLValue']];
    for (var i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++) {
      mutilFunctionThroughputData.push([
        String(this.evaluationFuncForm.field.throughput.ratio[i].areaRatio),
        String(this.evaluationFuncForm.field.throughput.ratio[i].compliance),
        String(this.evaluationFuncForm.field.throughput.ratio[i].ULValue),
        String(this.evaluationFuncForm.field.throughput.ratio[i].DLValue)]);   
    } 
    const mutilFunctionThroughputWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionThroughputData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionThroughputWS, 'mutil function throughput');    

    // MutilFunction UE Coverage
    const mutilFunctionUECoverageData = [['ue.coverage.ratio']];
    mutilFunctionUECoverageData.push([
        String(this.evaluationFuncForm.ue.coverage.ratio)]);   
    
    const mutilFunctionUECoverageWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionUECoverageData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionUECoverageWS, 'mutil function UE coverage');

    // MutilFunction UE Throughput
    const mutilFunctionUEThroughputData = [['ue.throughputbyrsrp.countRatio', 'ue.throughputbyrsrp.compliance', 'ue.throughputbyrsrp.value']];
    for (var i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++) {
      mutilFunctionUEThroughputData.push([
        String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio),
        String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].compliance),
        String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue),
        String(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue)]);   
    } 
    const mutilFunctionUEThroughputWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mutilFunctionUEThroughputData);
    XLSX.utils.book_append_sheet(wb, mutilFunctionUEThroughputWS, 'mutil function UE throughput');  

    // console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, `${this.calculateForm.taskName}`);
  }

  /**
   * 匯入xlsx
   * @param event file
   */
  import(event)
  {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    console.log(event.target);
    if (target.files.length !== 1) 
    {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('mutil.import.file.fault')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      throw new Error('Cannot use multiple files');
    }
    const file = event.target.files[0];
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      // const name = file.name.substring(0, file.name.lastIndexOf('.'));
      const name = file.name;
      sessionStorage.setItem('taskName', name);

      this.pollingLoading();
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
	  
	try {
		this.obstacleList.length = 0;
		this.defaultBSList.length = 0;
		this.candidateList.length = 0;
		this.ueList.length = 0;
		this.calculateForm = new CalculateForm();
		this.calculateForm.taskName = sessionStorage.getItem('taskName');
		this.wb = XLSX.read(result, {type: 'binary'});

		if(this.wb.SheetNames[0] == 'map')
		{
		  /* map sheet */
		  const map: string = this.wb.SheetNames[0]; //第0個工作表名稱
		  const mapWS: XLSX.WorkSheet = this.wb.Sheets[map]; //map工作表內容
		  const mapData = (XLSX.utils.sheet_to_json(mapWS, {header: 1})); //轉成array
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
			const keyMap = {};
			Object.keys(mapData[0]).forEach((key) => {
			  keyMap[mapData[0][key]] = key; // keymap = image:"0", imageName:"1" ...
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
		
			this.initData(true, false, '');
		  } catch (error) {
			console.log(error);
			// fail xlsx
			this.msgDialogConfig.data = {
			  type: 'error',
			  infoMessage: this.translateService.instant('xlxs.fail')
			};
			this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
		  }
		}
		else
		{
		  this.msgDialogConfig.data = {
			type: 'error',
			infoMessage: this.translateService.instant('xlxs.fail')
		  };
		  this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
		}
	} catch (error) {
		console.log(error);
		// fail xlsx
		this.msgDialogConfig.data = {
		  type: 'error',
		  infoMessage: this.translateService.instant('xlxs.fail')
		};
		this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
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


    try
    {
      const materialReg = new RegExp('[0-4]');
      /* base station sheet */
      const sheetNameIndex = {};
      for (let i = 0; i < this.wb.SheetNames.length; i++) {
        sheetNameIndex[this.wb.SheetNames[i]] = i;
      }



      /* candidate sheet */
      const candidate: string = this.wb.SheetNames[sheetNameIndex['candidate']];
      const candidateWS: XLSX.WorkSheet = this.wb.Sheets[candidate];
      const candidateData = (XLSX.utils.sheet_to_json(candidateWS, {header: 1}));
      if (candidateData.length > 1) {
        this.planningIndex = '1';     //if there is any candidate, planning index should be 1 or 2
        for (let i = 1; i < candidateData.length; i++) {
          const id = `candidate_${(i - 1)}`;
          this.candidateList.push(id);
          // let material = (typeof candidateData[i][3] === 'undefined' ? '0' : candidateData[i][3]);
          // if (!materialReg.test(material)) {
            // material = '0';
          // }
          // const color = (typeof candidateData[i][4] === 'undefined' ? this.CANDIDATE_COLOR : candidateData[i][4]);

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
          const offset = 2;
          this.tempCalParamSet.tddfrequency = candidateData[i][3+offset];
          this.tempCalParamSet.tddbandwidth = candidateData[i][4+offset];
          this.tempCalParamSet.dlBandwidth = candidateData[i][5+offset];
          this.tempCalParamSet.ulBandwidth = candidateData[i][6+offset];
          this.tempCalParamSet.fddDlFrequency = candidateData[i][7+offset];
          this.tempCalParamSet.fddUlFrequency = candidateData[i][8+offset];
          this.tempCalParamSet.mimoNumber4G = candidateData[i][9+offset];
          this.tempCalParamSet.tddscs = candidateData[i][10+offset];
          this.tempCalParamSet.dlModulationCodScheme = candidateData[i][11+offset];
          this.tempCalParamSet.ulModulationCodScheme = candidateData[i][12+offset];
          this.tempCalParamSet.dlMimoLayer = candidateData[i][13+offset];
          this.tempCalParamSet.ulMimoLayer = candidateData[i][14+offset];
          this.tempCalParamSet.dlScs = candidateData[i][15+offset];
          this.tempCalParamSet.ulScs = candidateData[i][16+offset];
          this.tempCalParamSet.wifiProtocol = candidateData[i][17+offset];
          this.tempCalParamSet.guardInterval = candidateData[i][18+offset];
          this.tempCalParamSet.wifiMimo = candidateData[i][19+offset];
          this.tempCalParamSet.wifiBandwidth = candidateData[i][20+offset];
          this.tempCalParamSet.wifiFrequency = candidateData[i][21+offset];
          let bsTxGain = 0
          let bsNoiseFigure = 0
          let AntennaId = 1;
          let theta = 0;
          let phi = 0;
          if (Object.values(candidateData[0]).includes("bsTxGain")){
            bsTxGain= candidateData[i][22+offset];
          }
          if (Object.values(candidateData[0]).includes("bsNoiseFigure")){
            bsNoiseFigure= candidateData[i][23+offset];
          }
          if (Object.values(candidateData[0]).includes("AntennaId")){
            AntennaId= candidateData[i][24+offset];
          }
          if (Object.values(candidateData[0]).includes("theta")){
            theta = candidateData[i][25+offset];
          }
          if (Object.values(candidateData[0]).includes("phi")){
            phi = candidateData[i][26+offset];
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
      else
      {
        this.planningIndex = '3';
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
            if (Object.values(ueData[0]).includes("ueRxGain")){
              //新增欄位
              var ueRxGain= ueData[i][3]
            } else {
              var ueRxGain = 0
            }
            this.ueListParam[id] = {
              ueRxGain: ueRxGain
            }
            // set UE位置
            // this.setUeSize(id);
          }
        }
      }

      /* obstacle sheet */
      const obstacle: string = this.wb.SheetNames[sheetNameIndex['obstacle']];
      const obstacleWS: XLSX.WorkSheet = this.wb.Sheets[obstacle];
      const obstacleData = (XLSX.utils.sheet_to_json(obstacleWS, {header: 1}));
      // console.log("obstacle sheet obstacleData",obstacleData);
      if (obstacleData.length > 1) {
        for (let i = 1; i < obstacleData.length; i++) {
          if ((<Array<any>> obstacleData[i]).length === 0) {
            continue;
          }
          let id;
          let type;
          let diff = Object.keys(obstacleData[i]).length - 10; //因應版本不同,欄位長度不同
          let shape = this.parseElement(obstacleData[i][9+diff]);
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
          let material = (typeof obstacleData[i][7+diff] === 'undefined' ? '0' : obstacleData[i][7+diff].toString());
          // if (!materialReg.test(material)) {
          //   material = '0';
          // }
          if(!(obstacleData[i][7+diff] in this.materialIdToIndex)){ 
            if(Number(obstacleData[i][7+diff]) < this.materialList.length){
              material = this.materialList[Number(obstacleData[i][7+diff])]['id'];
            } else {
              material = this.materialList[0]['id'];
            }
          }else{
            let index = this.materialIdToIndex[obstacleData[i][7+diff]];
            material = this.materialList[index]['id'];
          }
          const color = (typeof obstacleData[i][8+diff] === 'undefined' ? this.OBSTACLE_COLOR : obstacleData[i][8+diff]);
          let zValue = obstacleData[i][2+diff];
          if (diff == -1){
            zValue = 0;
          }
          let materialName = '';
          if(this.authService.lang =='zh-TW'){
            materialName = this.materialList[this.materialIdToIndex[material]]['chineseName'];
          }else{
            materialName = this.materialList[this.materialIdToIndex[material]]['name'];
          }
          this.dragObject[id] = {
            x: obstacleData[i][0],
            y: obstacleData[i][1],
            z: zValue,
            width: obstacleData[i][3+diff],
            height: obstacleData[i][4+diff],
            altitude: obstacleData[i][5+diff],
            rotate: (typeof obstacleData[i][6+diff] === 'undefined' ? 0 : obstacleData[i][6+diff]),
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
          if(this.evaluationFuncForm.field.throughput.ratio.length == 0)
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
          if(this.evaluationFuncForm.field.sinr.ratio.length == 0)
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
          if(this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
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
          this.planningIndex = '1';console.log(this.planningIndex);
        } else if (this.calculateForm.isUeAvgSinr || this.calculateForm.isUeAvgThroughput || this.calculateForm.isUeCoverage) {
          this.planningIndex = '2';
        } else {
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
        // this.calculateForm.maxConnectionNum = Number(algorithmParametersData[1][7]);
        if(!(this.calculateForm.pathLossModelId in this.modelIdToIndex)){ 
          if(this.calculateForm.pathLossModelId < this.modelList.length){
            this.calculateForm.pathLossModelId = this.modelList[this.calculateForm.pathLossModelId]['id'];
          }
          else{
            this.calculateForm.pathLossModelId = this.modelList[0]['id'];
          }
        }
        this.calculateForm.maxConnectionNum = Number(algorithmParametersData[1][7]);
        if (!(Number(this.calculateForm.maxConnectionNum)>0)){
          this.calculateForm.maxConnectionNum = 32;
        }
        this.calculateForm.resolution = Number(algorithmParametersData[1][8]);
        if (!(Number(this.calculateForm.resolution)>0)){
          this.calculateForm['resolution'] = 1;
        }
        this.calculateForm.geographicalNorth = Number(algorithmParametersData[1][9]);
        if (this.authService.isEmpty(this.calculateForm.geographicalNorth) || isNaN(this.calculateForm.geographicalNorth)){
          this.calculateForm['geographicalNorth'] = 0;
        }
      }
      /* objective parameters sheet */
      const objectiveParameters: string = this.wb.SheetNames[sheetNameIndex['objective parameters']];
      const objectiveParametersWS: XLSX.WorkSheet = this.wb.Sheets[objectiveParameters];
      const objectiveParametersData = (XLSX.utils.sheet_to_json(objectiveParametersWS, {header: 1}));
      if (objectiveParametersData.length > 1) {
        this.calculateForm.availableNewBsNumber = Number(objectiveParametersData[1][2]);
        if(objectiveParametersData[1][3] != null)
        {
          this.isBsNumberOptimization = objectiveParametersData[1][3];
          if(this.isBsNumberOptimization != 'default' && this.isBsNumberOptimization != 'custom')
          {
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
      } else if (this.calculateForm.objectiveIndex === '1') {
        // 5G set子載波間距
        this.setSubcarrier();
      }

      this.ognSpanStyle = _.cloneDeep(this.spanStyle);
      this.ognDragObject = _.cloneDeep(this.dragObject);

      /* subfield sheet */
      this.subFieldList = [];
      const sub: string = this.wb.SheetNames[sheetNameIndex['subfield parameters']];
      if (typeof sub !== 'undefined')
      {
        const subWS: XLSX.WorkSheet = this.wb.Sheets[sub];
        const subData = (XLSX.utils.sheet_to_json(subWS, { header: 1 }));
        if (subData.length > 1)
        {
          let sub_field_arr = [];
          
          for (let i = 1; i < subData.length; i++)
          {
            if (typeof subData[i][0] === 'undefined')
            {
              continue;
            }
            const id = `subField_${(i - 1)}`;
            this.subFieldList.push(id);
            let x = Number(subData[i][0]);
            let y = Number(subData[i][1]);
            let width = Number(subData[i][2]);
            let height = Number(subData[i][3]);
            let width_real = Number(subData[i][4]);
            let height_real = Number(subData[i][5]);


            this.dragObject[id] = {
              x: x,
              y: y,
              z: 0,
              width: width,
              height: height,
              altitude: 0,
              rotate: 0,
              title: this.svgMap['subField'].title,
              type: this.svgMap['subField'].type,
              color: 'pink',
              material: '',
              element: this.svgMap['subField'].element
            };
            this.subFieldStyle[id] = {
              width: width,
              height: height,
              fill: 'pink',
              fillOpacity: 0.2,
              stroke: 'pink',
              strokeWidth: 3,
            }


            sub_field_arr.push({
              id: id,
              x: x,
              y: y,
              width: width_real,
              height: height_real,
              width_px: width,
              height_px: height
            });

            
          }
          sessionStorage.setItem(`sub_field_coor`, JSON.stringify(sub_field_arr));
        }
      }

      /* Mutil Function sheets */
      if(this.wb.SheetNames.length >= 9)    // new format
      {
        const mutilFunctionSetting: string = this.wb.SheetNames[sheetNameIndex['mutil function setting']];
        const mutilFunctionSettingWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionSetting];
        const mutilFunctionSettingData = (XLSX.utils.sheet_to_json(mutilFunctionSettingWS, {header: 1}));
        if (mutilFunctionSettingData.length > 1) 
        {
          this.planningIndex = mutilFunctionSettingData[1][0];
          if(this.planningIndex == '0')
          {
            this.planningIndex = '1';console.log(this.planningIndex);
          }
          console.log("mutilFunctionSettingData[1][0]: " + mutilFunctionSettingData[1][0]);
          console.log("mutilFunctionSettingData[1][1]: " + mutilFunctionSettingData[1][1]);
          console.log("b-mutilFunctionSettingData[1][1]: "+JSON.parse(mutilFunctionSettingData[1][1]));
          this.evaluationFuncForm.field.coverage.activate = JSON.parse(mutilFunctionSettingData[1][1]);
          this.evaluationFuncForm.field.sinr.activate = JSON.parse(mutilFunctionSettingData[1][2]);
          this.evaluationFuncForm.field.rsrp.activate = JSON.parse(mutilFunctionSettingData[1][3]);
          this.evaluationFuncForm.field.throughput.activate = JSON.parse(mutilFunctionSettingData[1][4]);
          this.evaluationFuncForm.ue.coverage.activate = JSON.parse(mutilFunctionSettingData[1][5]);
          console.log("mutilFunctionSettingData[1][6]: "+mutilFunctionSettingData[1][6]);
          console.log("b-mutilFunctionSettingData[1][6]: "+JSON.parse(mutilFunctionSettingData[1][6]));
          this.evaluationFuncForm.ue.throughputByRsrp.activate = JSON.parse(mutilFunctionSettingData[1][6]);
          var fieldSINRLen = Number(mutilFunctionSettingData[1][7]);
          var fieldRSRPLen = Number(mutilFunctionSettingData[1][8]);
          var fieldThroughputLen = Number(mutilFunctionSettingData[1][9]);
          var ueThroughputLen = Number(mutilFunctionSettingData[1][10]);
        }

        const mutilFunctionCoverage: string = this.wb.SheetNames[sheetNameIndex['mutil function coverage']];
        const mutilFunctionCoverageWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionCoverage];
        const mutilFunctionCoverageData = (XLSX.utils.sheet_to_json(mutilFunctionCoverageWS, {header: 1}));
        if (mutilFunctionCoverageData.length > 1) 
        {
          this.evaluationFuncForm.field.coverage.ratio = Number(mutilFunctionCoverageData[1][0]);
        }

        const mutilFunctionSINR: string = this.wb.SheetNames[sheetNameIndex['mutil function sinr']];
        const mutilFunctionSINRWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionSINR];
        const mutilFunctionSINRData = (XLSX.utils.sheet_to_json(mutilFunctionSINRWS, {header: 1}));
        this.evaluationFuncForm.field.sinr.ratio = [];
        for(var i = 0; i < fieldSINRLen; i++)
        {
          this.evaluationFuncForm.field.sinr.ratio.push(
            {
              "areaRatio": Number(mutilFunctionSINRData[i+1][0]),
              "compliance": mutilFunctionSINRData[i+1][1],
              "value": Number(mutilFunctionSINRData[i+1][2])
            }
          );
        }

        const mutilFunctionRSRP: string = this.wb.SheetNames[sheetNameIndex['mutil function rsrp']];
        const mutilFunctionRSRPWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionRSRP];
        const mutilFunctionRSRPData = (XLSX.utils.sheet_to_json(mutilFunctionRSRPWS, {header: 1}));
        this.evaluationFuncForm.field.rsrp.ratio = [];
        for(var i = 0; i < fieldRSRPLen; i++)
        {
          this.evaluationFuncForm.field.rsrp.ratio.push(
            {
              "areaRatio": Number(mutilFunctionRSRPData[i+1][0]),
              "compliance": mutilFunctionRSRPData[i+1][1],
              "value": Number(mutilFunctionRSRPData[i+1][2])
            }
          );
        }

        const mutilFunctionThroughput: string = this.wb.SheetNames[sheetNameIndex['mutil function throughput']];
        const mutilFunctionThroughputWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionThroughput];
        const mutilFunctionThroughputData = (XLSX.utils.sheet_to_json(mutilFunctionThroughputWS, {header: 1}));
        this.evaluationFuncForm.field.throughput.ratio = [];

        for(var i = 0; i < fieldThroughputLen; i++)
        {
          if(!isNaN(Number(mutilFunctionThroughputData[i+1][2])) && !isNaN(Number(mutilFunctionThroughputData[i+1][3]))) 
          {          
            this.evaluationFuncForm.field.throughput.ratio.push(
              {
                "areaRatio": Number(mutilFunctionThroughputData[i+1][0]),
                "compliance": mutilFunctionThroughputData[i+1][1],
                "ULValue": Number(mutilFunctionThroughputData[i+1][2]),
                "DLValue": null
              }
            );
            this.evaluationFuncForm.field.throughput.ratio.push(
              {
                "areaRatio": Number(mutilFunctionThroughputData[i+1][0]),
                "compliance": mutilFunctionThroughputData[i+1][1],
                "ULValue": null,
                "DLValue": Number(mutilFunctionThroughputData[i+1][3])
              }
            );          
          }
          else if(!isNaN(Number(mutilFunctionThroughputData[i+1][2])))
          {
            this.evaluationFuncForm.field.throughput.ratio.push(
              {
                "areaRatio": Number(mutilFunctionThroughputData[i+1][0]),
                "compliance": mutilFunctionThroughputData[i+1][1],
                "ULValue": Number(mutilFunctionThroughputData[i+1][2]),
                "DLValue": null
              }
            );
            
          }
          else if(!isNaN(Number(mutilFunctionThroughputData[i+1][3])))
          {
            this.evaluationFuncForm.field.throughput.ratio.push(
              {
                "areaRatio": Number(mutilFunctionThroughputData[i+1][0]),
                "compliance": mutilFunctionThroughputData[i+1][1],
                "ULValue": null,
                "DLValue": Number(mutilFunctionThroughputData[i+1][3])
              }
            );          
          }
        }


        const mutilFunctionUECoverage: string = this.wb.SheetNames[sheetNameIndex['mutil function UE coverage']];
        const mutilFunctionUECoverageWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionUECoverage];
        const mutilFunctionUECoverageData = (XLSX.utils.sheet_to_json(mutilFunctionUECoverageWS, {header: 1}));
        if (mutilFunctionUECoverageData.length > 1) 
        {
          this.evaluationFuncForm.ue.coverage.ratio = Number(mutilFunctionUECoverageData[1][0]);
        }
        
        const mutilFunctionUEThroughput: string = this.wb.SheetNames[sheetNameIndex['mutil function UE throughput']];
        const mutilFunctionUEThroughputWS: XLSX.WorkSheet = this.wb.Sheets[mutilFunctionUEThroughput];
        const mutilFunctionUEThroughputData = (XLSX.utils.sheet_to_json(mutilFunctionUEThroughputWS, {header: 1}));
        this.evaluationFuncForm.ue.throughputByRsrp.ratio = [];


        for(var i = 0; i < ueThroughputLen; i++)
        {
          if(!isNaN(Number(mutilFunctionUEThroughputData[i+1][2])) && !isNaN(Number(mutilFunctionUEThroughputData[i+1][3])))  //old format
          {
            this.evaluationFuncForm.ue.throughputByRsrp.ratio.push(
              {
                "countRatio": Number(mutilFunctionUEThroughputData[i+1][0]),
                "compliance": mutilFunctionUEThroughputData[i+1][1],
                "ULValue": Number(mutilFunctionUEThroughputData[i+1][2]),
                "DLValue": null
              }
            );

            this.evaluationFuncForm.ue.throughputByRsrp.ratio.push(
              {
                "countRatio": Number(mutilFunctionUEThroughputData[i+1][0]),
                "compliance": mutilFunctionUEThroughputData[i+1][1],
                "ULValue": null,
                "DLValue": Number(mutilFunctionUEThroughputData[i+1][3])
              }
            );
          }
          else if(!isNaN(Number(mutilFunctionUEThroughputData[i+1][2])))
          {
            this.evaluationFuncForm.ue.throughputByRsrp.ratio.push(
              {
                "countRatio": Number(mutilFunctionUEThroughputData[i+1][0]),
                "compliance": mutilFunctionUEThroughputData[i+1][1],
                "ULValue": Number(mutilFunctionUEThroughputData[i+1][2]),
                "DLValue": null
              }
            );
          }
          else if(!isNaN(Number(mutilFunctionUEThroughputData[i+1][3])))
          {
            this.evaluationFuncForm.ue.throughputByRsrp.ratio.push(
              {
                "countRatio": Number(mutilFunctionUEThroughputData[i+1][0]),
                "compliance": mutilFunctionUEThroughputData[i+1][1],
                "ULValue": null,
                "DLValue": Number(mutilFunctionUEThroughputData[i+1][3])
              }
            );
          }
        } 

        this.setThroughputTypeAndValue();
        window.sessionStorage.setItem(`planningIndex`, this.planningIndex);
        window.sessionStorage.setItem(`evaluationFuncForm`, JSON.stringify(this.evaluationFuncForm));
      }

      this.calculateForm.isSimulation = (this.planningIndex == '3');

      /* 必須先取得planningIndex才能畫基地台 */
      const baseStation: string = this.wb.SheetNames[sheetNameIndex['base_station']];
      const baseStationWS: XLSX.WorkSheet = this.wb.Sheets[baseStation];
      const baseStationData = (XLSX.utils.sheet_to_json(baseStationWS, { header: 1 }));
      if (baseStationData.length > 1)
      {
        // this.planningIndex = '3';
        for (let i = 1; i < baseStationData.length; i++)
        {
          const id = `defaultBS_${(i - 1)}`;
          // let material = (typeof baseStationData[i][3] === 'undefined' ? '0' : baseStationData[i][3]);
          // 不在清單內，指定為木頭
          // if (!materialReg.test(material)) {
          // material = '0';
          // }
          // const color = (typeof baseStationData[i][4] === 'undefined' ? this.DEFAULT_BS_COLOR : baseStationData[i][4]);
          this.colorList[id] = this.authService.getRandomColorByHsl(this.planningIndex, i-1);
          console.log(`this.colorList = ${JSON.stringify(this.colorList)}`);
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
            color: this.colorList[id][1],
            // material: material,
            element: this.svgMap['defaultBS'].element
          };
          if (this.dragObject[id].altitude > this.calculateForm.altitude)
          {
            this.dragObject[id].altitude = this.calculateForm.altitude;
          }
          // RF parameter import
          const offset = 2;
          let bsTxGain = 0;
          let bsNoiseFigure = 0;
          let AntennaId = 1;
          let theta = 0;
          let phi = 0;
          let isAntennaDefault = '';
          let ulAntFreq = 0;
          let dlAntFreq = 0;
          let antennaType = 0;
          let antennaManufactor = 0;
          let gain = 0;
          let antenna = null;

          if (Object.values(baseStationData[0]).includes("bsTxGain"))
          {
            bsTxGain = baseStationData[i][24 + offset];
          }
          if (Object.values(baseStationData[0]).includes("bsNoiseFigure"))
          {
            bsNoiseFigure = baseStationData[i][25 + offset];
          }

          if (Object.values(baseStationData[0]).includes("AntennaId"))
          {
            AntennaId = baseStationData[i][26 + offset];
            if (!this.checkAntennaExist(AntennaId) && this.allAntennaList.length > 0)
            {
              AntennaId = this.allAntennaList[0].antennaID;
            }
          }
          else if (this.allAntennaList.length > 0)
            AntennaId = this.allAntennaList[0].antennaID;
          else
            AntennaId = 1;

          antenna = this.getAntennaById(AntennaId);

          if (antenna != null)
          {
            isAntennaDefault = antenna.property;
            antennaType = antenna.type;
            antennaManufactor = antenna.manufactor;
          }

          if (Object.values(baseStationData[0]).includes("theta"))
          {
            theta = baseStationData[i][27 + offset];
          }
          if (Object.values(baseStationData[0]).includes("phi"))
          {
            phi = baseStationData[i][28 + offset];
          }
          if (Object.values(baseStationData[0]).includes("gain"))
          {
            gain = baseStationData[i][29 + offset];
          }
          if (Object.values(baseStationData[0]).includes("ulAntFreq"))
          {
            ulAntFreq = baseStationData[i][30 + offset];
          }
          if (Object.values(baseStationData[0]).includes("dlAntFreq"))
          {
            dlAntFreq = baseStationData[i][31 + offset];
          }


          if (isAntennaDefault != 'default' && isAntennaDefault != 'customized')
          {
            isAntennaDefault = 'default';
          }

          this.bsListRfParam[id] = {
            txpower: baseStationData[i][3 + offset],
            beampattern: baseStationData[i][4 + offset],
            tddfrequency: baseStationData[i][5 + offset],
            tddbandwidth: baseStationData[i][6 + offset],
            dlBandwidth: baseStationData[i][7 + offset],
            ulBandwidth: baseStationData[i][8 + offset],
            fddDlFrequency: baseStationData[i][9 + offset],
            fddUlFrequency: baseStationData[i][10 + offset],
            mimoNumber4G: baseStationData[i][11 + offset],
            tddscs: baseStationData[i][12 + offset],
            dlModulationCodScheme: baseStationData[i][13 + offset],
            ulModulationCodScheme: baseStationData[i][14 + offset],
            dlMimoLayer: baseStationData[i][15 + offset],
            ulMimoLayer: baseStationData[i][16 + offset],
            dlScs: baseStationData[i][17 + offset],
            ulScs: baseStationData[i][18 + offset],
            wifiProtocol: baseStationData[i][19 + offset],
            guardInterval: baseStationData[i][20 + offset],
            wifiMimo: baseStationData[i][21 + offset],
            wifiBandwidth: baseStationData[i][22 + offset],
            wifiFrequency: baseStationData[i][23 + offset],
            bsTxGain: bsTxGain,
            bsNoiseFigure: bsNoiseFigure,

            isAntennaDefault: isAntennaDefault,
            AntennaId: AntennaId,
            antennaType: antennaType,
            antennaManufactor: antennaManufactor,
            ulAntFreq: ulAntFreq,
            dlAntFreq: dlAntFreq,
            gain: gain,
            theta: theta,
            phi: phi,
            antenna: [],
          };

          this.defaultBSList.push(id);
          // set 既有基站位置
          // this.setDefaultBsSize(id);
        }
      }

      const baseStationAnt: string = this.wb.SheetNames[sheetNameIndex['base_station_ant']];
      if (baseStationAnt != null)
      {
        const baseStationAntWS: XLSX.WorkSheet = this.wb.Sheets[baseStationAnt];
        const baseStationAntData = (XLSX.utils.sheet_to_json(baseStationAntWS, { header: 1 }));
        if (baseStationAntData.length > 1)
        {
          let bsId = -1;
          let bsSvgId = `defaultBS_${(bsId + 1)}`;

          const IS_ON_BS_COL = 6;
          const PHI_COL = 5;
          const THETA_COL = 4;
          const GAIN_COL = 3;
          const Z_COL = 2;
          const Y_COL = 1;
          const X_COL = 0;
          const ANT_WIDTH = 30;
          const ANT_HEIGHT = 30;




          for (let i = 1; i < baseStationAntData.length; i++)
          {

            if (baseStationAntData[i][IS_ON_BS_COL] == true)     //是基站上的天線
            {
              bsId++;
              bsSvgId = `defaultBS_${bsId}`;
              this.bsListRfParam[bsSvgId].gain = baseStationAntData[i][GAIN_COL];
              this.bsListRfParam[bsSvgId].theta = baseStationAntData[i][THETA_COL];
              this.bsListRfParam[bsSvgId].phi = baseStationAntData[i][PHI_COL];
            }
            else
            {
              this.bsListRfParam[bsSvgId].antenna.push
                (
                {
                  svgId: `antenna_${i}`,
                  //position: [baseStationAntData[i][X_COL], baseStationAntData[i][Y_COL], baseStationAntData[i][Z_COL]],
                  gain: baseStationAntData[i][GAIN_COL],
                  theta: baseStationAntData[i][THETA_COL],
                  phi: baseStationAntData[i][PHI_COL]
                }
                );


              this.dragObject[`antenna_${i}`] = {
                x: baseStationAntData[i][X_COL],
                y: baseStationAntData[i][Y_COL],
                z: baseStationAntData[i][Z_COL],
                width: ANT_WIDTH,
                height: ANT_HEIGHT,
                altitude: 0,
                rotate: 0,
                title: this.svgMap['antenna'].title,
                type: this.svgMap['antenna'].type,
                color: this.colorList[bsSvgId][1],
                material: this.materialList[0]['id'],
                element: this.parseElement('antenna'),
                materialName: '',
                belongWhichBS: bsSvgId
              };

              this.svgAntNum = `${this.getBsIndexFromBsSvgId(bsSvgId)}.${i + 1}`;
              this.setLabel();
              this.setAntSize(`antenna_${i}`);

            }
          }


          console.log(`this.bsListRfParam=${JSON.stringify(this.bsListRfParam)}`);
          console.log(`this.dragObject=${JSON.stringify(this.dragObject)}`);
        }
      }
    }
    catch (error) {
      console.log(error);
      // fail xlsx
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('xlxs.fail')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }
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
  edit(redraw) {
    // 兩個走向，一個重新拿取API的值，所以要先清空陣列，一個只是要重新算pixel位置
    if (!redraw) {
      this.obstacleList.forEach(el => {
        this.setObstacleSize(el);
      });
      this.candidateList.forEach(el => {
        this.setCandidateSize(el);
      });
      this.defaultBSList.forEach(el => {
        this.setDefaultBsSize(el);
      });
      this.ueList.forEach(el => {
        this.setUeSize(el);
      });
      this.subFieldList.forEach(el => {
        this.setSubFieldSize(el);
      })
    } else {
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
        let sub_field_arr = JSON.parse(sessionStorage.getItem('sub_field_coor'));
        let sub_field_arr2 = []
        console.log(sub_field_arr.length);
        const subFieldLen = sub_field_arr.length;
        for (let i = 0; i < subFieldLen; i++) {
          const id = `subField_${this.generateString(10)}`;
          const item = sub_field_arr[i];
          this.dragObject[id] = {
            x: Number(item['x']),
            y: Number(item['y']),
            // z: 0,
            width: Number(item['width_px']),
            height: Number(item['height_px']),
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
            x: Number(item['x']),
            y: Number(item['y']),
            width: Number(item['width']),
            height: Number(item['height']),
            width_px: Number(item['width_px']),
            height_px: Number(item['height_px']),
          });
          this.subFieldList.push(id);
          this.subFieldStyle[id] = {
            width: Number(item['width_px']),
            height: Number(item['height_px']),
            fill: 'pink',
            fillOpacity: 0.2,
            stroke: 'pink',
            strokeWidth: 3,
          }
        }
        sessionStorage.setItem('sub_field_coor',JSON.stringify(sub_field_arr2));
      }
      if (!this.authService.isEmpty(this.calculateForm.obstacleInfo)) {
        const obstacle = this.calculateForm.obstacleInfo.split('|');
        const obstacleLen = obstacle.length;
        for (let i = 0; i < obstacleLen; i++) {
          if (obstacle[i].indexOf('undefined') !== -1) {
            continue;
          }
          const item = JSON.parse(obstacle[i]);
          let diff = item.length - 9;
          let shape = '0';
          if (typeof item[8+diff] !== 'undefined') {
            shape = this.parseElement(item[8+diff]);
          }
          const id = `${this.parseShape(shape)}_${this.generateString(10)}`;
          let index = this.materialIdToIndex[Number(item[7+diff])];
          let material = item[7+diff].toString();
          
          /*
          if(!(item[7+diff] in this.materialIdToIndex)){ 
            index = 0;
            material = Number(this.materialList[index]['id']);
          }
          */
          if(!(item[7+diff] in this.materialIdToIndex)){ 
            index = 0;
            if(Number(item[7+diff]) < this.materialList.length){ // 對舊專案的處理
              material = this.materialList[Number(item[7+diff])]['id'];
            } else {
              material = this.materialList[0]['id'];
            }
          }
          
          let materialName = "";
          if (Object.keys(this.materialList).length < 1 || Object.keys(this.materialIdToIndex).length < 1 ){
            console.log('*DEBUG:this.materialList',this.materialList);
            console.log('index',index);
            console.log('this.materialIdToIndex',this.materialIdToIndex);
            console.log('item[7]',item[7+diff]);
            console.log('do not init!');
            materialName = "need init";
            this.ngOnInit();
          } 
          if(this.authService.lang =='zh-TW'){
            materialName = this.materialList[index]['chineseName'];
          }else{
            materialName = this.materialList[index]['name'];
          }
          let zValue = item[2+diff];
          if (diff == -1){
            zValue = 0;
          }
          // console.log("diff",diff);
          this.dragObject[id] = {
            x: item[0],
            y: item[1],
            z: zValue,
            width: item[3+diff],
            height: item[4+diff],
            altitude: item[5+diff],
            rotate: item[6+diff],
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
        const candidate = this.calculateForm.candidateBs.split('|');
        const candidateLen = candidate.length;
        const txpower = JSON.parse(this.calculateForm.txPower);
        const beamId = JSON.parse(this.calculateForm.beamId);
        var candidateAnt = [];
        if (!this.authService.isEmpty(this.calculateForm.candidateBsAnt)){
          candidateAnt = this.calculateForm.candidateBsAnt.split('|');
        } else {
          for (let i = 0; i < candidateLen; i++) {
            candidateAnt.push("[1,0,0,0]");
          }
        }
        console.log("candidateAnt",candidateAnt);
        for (let i = 0; i < candidateLen; i++) {
          const item = JSON.parse(candidate[i]);
          const id = `candidate_${this.generateString(10)}`;
          const antObj = JSON.parse(candidateAnt[i]);
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
          if (this.authService.isEmpty(this.calculateForm.bsNoiseFigure)){ 
            this.tempCalParamSet.bsNoiseFigure = 0;
          } else {
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
          } else {
            this.duplexMode = 'tdd';
            this.tempCalParamSet.tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i];
            this.tempCalParamSet.tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
            // this.tempCalParamSet.tddscs = JSON.parse(this.calculateForm.scs)[i].toString();
          }
          if (this.calculateForm.mapProtocol === '4g') {
            this.tempCalParamSet.mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i];
          }
          if (this.calculateForm.mapProtocol === '5g') {
            let ulmsc = this.calculateForm.ulMcsTable;
            let dlmsc = this.calculateForm.dlMcsTable;
            this.tempCalParamSet.ulModulationCodScheme = ulmsc.substring(1,(ulmsc.length)-1).split(',')[i];
            this.tempCalParamSet.dlModulationCodScheme = dlmsc.substring(1,(dlmsc.length)-1).split(',')[i];
            this.tempCalParamSet.ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i].toString();
            this.tempCalParamSet.dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i].toString();
            this.scalingFactor = this.calculateForm.scalingFactor;
          }

          if (this.calculateForm.mapProtocol === 'wifi') {
            this.tempCalParamSet.wifiFrequency = JSON.parse(this.calculateForm.frequencyList)[i];
            this.tempCalParamSet.wifiBandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
            let wifiProtocol = this.calculateForm.wifiProtocol;
            let guardInterval = this.calculateForm.guardInterval;
            let wifiMimo = this.calculateForm.wifiMimo;
            this.tempCalParamSet.wifiProtocol = wifiProtocol.substring(1,(wifiProtocol.length)-1).split(',')[i];
            this.tempCalParamSet.guardInterval = guardInterval.substring(1,(guardInterval.length)-1).split(',')[i];
            this.tempCalParamSet.wifiMimo = wifiMimo.substring(1,(wifiMimo.length)-1).split(',')[i];
          }
        }
      }

      if (this.calculateForm.isSimulation)
         this.calculateForm = this.authService.changeOldFormToDASForm(this.calculateForm, this.allAntennaList);
      
      // defaultBs
      if (this.calculateForm.bsList == null || this.calculateForm.bsList.length == 0 || this.calculateForm.bsList.defaultBs == null)     
      {
        //舊版本
        this.manufactor = 'All';
        if (!this.authService.isEmpty(this.calculateForm.defaultBs))
        {
          console.log(`this.calculateForm.defaultBs = ${JSON.stringify(this.calculateForm.defaultBs)}`);
          const defaultBS = this.calculateForm.defaultBs.split('|');
          const txpower = JSON.parse(this.calculateForm.txPower);
          const beamId = JSON.parse(this.calculateForm.beamId);
          // this.dlRatio = this.calculateForm.tddFrameRatio;
          let candidateNum = 0;
          if (this.candidateList.length != 0) { candidateNum = this.candidateList.length; }
          const defaultBSLen = defaultBS.length;
          var defaultAnt = [];
          if (!this.authService.isEmpty(this.calculateForm.defaultBsAnt))
          {
            defaultAnt = this.calculateForm.defaultBsAnt.split('|');
          } else
          {
            for (let i = 0; i < defaultBSLen; i++)
            {
              defaultAnt.push("[1,0,0,0]");
            }
          }
          for (let i = 0; i < defaultBSLen; i++)
          {
            const item = JSON.parse(defaultBS[i]);
            const id = `defaultBS_${this.generateString(10)}`;
            this.colorList[id] = this.authService.getRandomColorByHsl(this.planningIndex, this.defaultBSList.indexOf(id));
            this.defaultBSList.push(id);
            const antObj = JSON.parse(defaultAnt[i]);
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
              scsBandwidth: 10,
              isAntennaDefault: 'default',
              antenna: []
            };
            console.log(JSON.stringify(this.bsListRfParam));
            if (this.authService.isEmpty(this.calculateForm.bsNoiseFigure))
            {
              this.bsListRfParam[id].bsNoiseFigure = 0
            } else
            {
              this.bsListRfParam[id].bsNoiseFigure = JSON.parse(this.calculateForm.bsNoiseFigure)[i + candidateNum];
            }
            if (antObj[0] != null && this.checkAntennaExist(antObj[0]))
              this.bsListRfParam[id].AntennaId = antObj[0];
            else
              this.bsListRfParam[id].AntennaId = this.allAntennaList[0].antennaID;

            this.bsListRfParam[id].antennaType = this.getAntennaById(this.bsListRfParam[id].AntennaId).type;
            this.bsListRfParam[id].antennaManufactor = this.getAntennaById(this.bsListRfParam[id].AntennaId).manufactor,


            this.bsListRfParam[id].theta = antObj[1] != null ? antObj[1] : 0;
            this.bsListRfParam[id].phi = antObj[2] != null ? antObj[2] : 0;
            this.bsListRfParam[id].bsTxGain = antObj[3] != null ? antObj[3] : 0;
            if (this.calculateForm.duplex === 'fdd' && this.calculateForm.mapProtocol === '5g')
            {
              this.bsListRfParam[id].dlScs = JSON.parse(this.calculateForm.dlScs)[i + candidateNum];
              this.bsListRfParam[id].ulScs = JSON.parse(this.calculateForm.ulScs)[i + candidateNum];
            }
            if (this.calculateForm.duplex === 'tdd' && this.calculateForm.mapProtocol === '5g')
            {
              this.bsListRfParam[id].tddscs = JSON.parse(this.calculateForm.scs)[i + candidateNum];
            }
            if (this.calculateForm.duplex === 'fdd')
            {
              this.duplexMode = 'fdd';
              this.bsListRfParam[id].fddDlFrequency = JSON.parse(this.calculateForm.dlFrequency)[i + candidateNum];
              this.bsListRfParam[id].fddUlFrequency = JSON.parse(this.calculateForm.ulFrequency)[i + candidateNum];
              this.bsListRfParam[id].dlBandwidth = JSON.parse(this.calculateForm.dlBandwidth)[i + candidateNum];
              this.bsListRfParam[id].ulBandwidth = JSON.parse(this.calculateForm.ulBandwidth)[i + candidateNum];
              // console.log(this.bsListRfParam[id].dlScs);
              // console.log(this.bsListRfParam[id].dlBandwidth);
              // console.log(this.bsListRfParam[id].ulScs);
              // console.log(this.bsListRfParam[id].ulBandwidth);
            } else
            {
              this.duplexMode = 'tdd';
              this.bsListRfParam[id].tddfrequency = JSON.parse(this.calculateForm.frequencyList)[i + candidateNum];
              this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i + candidateNum];
              // this.bsListRfParam[id].tddscs = JSON.parse(this.calculateForm.scs)[i+candidateNum].toString();
            }
            if (this.calculateForm.duplex === 'tdd' && this.calculateForm.mapProtocol === '4g')
            {
              // this.bsListRfParam[id].tddbandwidth = JSON.parse(this.calculateForm.bandwidthList)[i];
            }
            if (this.calculateForm.mapProtocol === '4g')
            {
              this.bsListRfParam[id].mimoNumber4G = JSON.parse(this.calculateForm.mimoNumber)[i + candidateNum];
            }
            if (this.calculateForm.mapProtocol === '5g')
            {
              let ulmsc = this.calculateForm.ulMcsTable;
              let dlmsc = this.calculateForm.dlMcsTable;
              this.bsListRfParam[id].ulModulationCodScheme = ulmsc.substring(1, (ulmsc.length) - 1).split(',')[i + candidateNum];
              this.bsListRfParam[id].dlModulationCodScheme = dlmsc.substring(1, (dlmsc.length) - 1).split(',')[i + candidateNum];
              this.bsListRfParam[id].ulMimoLayer = JSON.parse(this.calculateForm.ulMimoLayer)[i + candidateNum].toString();
              this.bsListRfParam[id].dlMimoLayer = JSON.parse(this.calculateForm.dlMimoLayer)[i + candidateNum].toString();
              // this.bsListRfParam[id].ulMcsTable = JSON.parse(this.calculateForm.ulMcsTable)[i].toString();
              // this.bsListRfParam[id].dlMcsTable = JSON.parse(this.calculateForm.dlMcsTable)[i].toString();
              this.scalingFactor = this.calculateForm.scalingFactor;
            }
            if (this.calculateForm.mapProtocol === 'wifi')
            {
              this.bsListRfParam[id].wifiFrequency = JSON.parse(this.calculateForm.frequencyList)[i + candidateNum];
              this.bsListRfParam[id].wifiBandwidth = JSON.parse(this.calculateForm.bandwidthList)[i + candidateNum];
              let wifiProtocol = this.calculateForm.wifiProtocol;
              let guardInterval = this.calculateForm.guardInterval;
              let wifiMimo = this.calculateForm.wifiMimo;
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
              color: this.colorList[id][1],
              material: '0',
              element: 'defaultBS'
            };
            // set 既有基站位置
            this.setDefaultBsSize(id);

          }
        }
        //this.changeOldBsFormatToNew();
      }
      else
      {
        //DAS版本
        const beamId = JSON.parse(this.calculateForm.beamId);
        for (let bs = 0; bs < this.calculateForm.bsList.defaultBs.length; bs++)
        {
          let svgId = `defaultBS_${this.generateString(10)}`;
          let ulMCS = '';
          let dlMCS = '';
          let antennaID = 1;
          let bsTxGain = 0;
          let freq = '', bandwith = '', ulBandwidth = '', dlBandwidth = '', ulFreq = '',
            dlFreq = '', scs = '', ulscs = '', dlscs = '', dlMimo = '', ulMimo = '';

          console.log(this.allAntennaList);

          if (this.checkAntennaExist(this.calculateForm.bsList.defaultBs[bs].antenna[0].antennaID))
            antennaID = Number(this.calculateForm.bsList.defaultBs[bs].antenna[0].antennaID);
          else if (this.allAntennaList.length > 0)
            antennaID = Number(this.allAntennaList[0].antennaID);
          else
            antennaID = 1;
          //this.colorList[svgId] = this.authService.getRandomColorByHsl(this.planningIndex, this.defaultBSList.length);
          this.colorList[svgId] = this.calculateForm.bsList.defaultBs[bs].color;

          if (this.calculateForm.bsList.defaultBs[bs].duplex.isTdd)
          {
            this.duplexMode = 'tdd';
            ulMCS = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.ul.mcsTable;
            dlMCS = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.dl.mcsTable;
            freq = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.ul.frequency;
            bandwith = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.ul.bandwidth;
            scs = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.ul.scs;
            dlMimo = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.dl.mimo;
            ulMimo = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.ul.mimo;

            //ulMCS = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.mcsTable;
            //dlMCS = this.calculateForm.bsList.defaultBs[bs].duplex.tddParam.mcsTable;
          }
          else
          {
            this.duplexMode = 'fdd';
            ulMCS = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.ul.mcsTable;
            dlMCS = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.dl.mcsTable;
            dlBandwidth = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.dl.bandwidth;
            ulBandwidth = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.ul.bandwidth;
            ulFreq = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.dl.frequency;
            dlFreq = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.ul.frequency;
            ulscs = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.dl.scs;
            dlscs = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.ul.scs;
            dlMimo = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.dl.mimo;
            ulMimo = this.calculateForm.bsList.defaultBs[bs].duplex.fddParam.ul.mimo;
          }

          

          this.bsListRfParam[svgId] =
          {
            txpower: this.calculateForm.bsList.defaultBs[bs].txPower,
            beampattern: beamId,
            tddfrequency: freq,
            tddbandwidth: bandwith,
            dlBandwidth: dlBandwidth,
            ulBandwidth: ulBandwidth,
            fddDlFrequency: dlFreq,
            fddUlFrequency: ulFreq,
            ulModulationCodScheme: ulMCS,
            dlModulationCodScheme: dlMCS,
            tddscs: scs,
            dlMimoLayer: dlMimo,
            ulMimoLayer: ulMimo,
            dlScs: dlscs,
            ulScs: ulscs,
            bsTxGain: this.calculateForm.bsList.defaultBs[bs].antenna[0].gain,
            bsNoiseFigure: this.calculateForm.bsList.defaultBs[bs].noiseFigure,
            isAntennaDefault: this.getAntennaById(antennaID).property,
            AntennaId: antennaID,
            antennaType: this.getAntennaById(antennaID).type,
            antennaManufactor: this.getAntennaById(antennaID).manufactor,
            ulAntFreq: this.calculateForm.bsList.defaultBs[bs].antenna[0].ulFrequency,
            dlAntFreq: this.calculateForm.bsList.defaultBs[bs].antenna[0].dlFrequency,
            theta: this.calculateForm.bsList.defaultBs[bs].antenna[0].theta,
            phi: this.calculateForm.bsList.defaultBs[bs].antenna[0].phi,
            antenna: [],
          };

          this.dragObject[svgId] = {
            x: this.calculateForm.bsList.defaultBs[bs].position[0],
            y: this.calculateForm.bsList.defaultBs[bs].position[1],
            z: this.calculateForm.bsList.defaultBs[bs].position[2],
            width: 30,
            height: 30,
            altitude: 0,
            rotate: 0,
            title: this.svgMap['defaultBS'].title,
            type: this.svgMap['defaultBS'].type,
            color: this.colorList[svgId][1],
            material: '0',
            element: 'defaultBS'
          };
          // set 既有基站位置
          this.defaultBSList.push(svgId);
          this.setDefaultBsSize(svgId);

          for (let a = 1; a < this.calculateForm.bsList.defaultBs[bs].antenna.length; a++)
          {
            let antSvgId = `antenna_${this.generateString(10)}`;
            this.bsListRfParam[svgId].antenna.push(
              {
                svgId: antSvgId,
                gain: this.calculateForm.bsList.defaultBs[bs].antenna[a].gain,
                theta: this.calculateForm.bsList.defaultBs[bs].antenna[a].theta,
                phi: this.calculateForm.bsList.defaultBs[bs].antenna[a].phi,
              }
            );
            this.dragObject[antSvgId] = {
              x: this.calculateForm.bsList.defaultBs[bs].antenna[a].position[0],
              y: this.calculateForm.bsList.defaultBs[bs].antenna[a].position[1],
              z: this.calculateForm.bsList.defaultBs[bs].antenna[a].position[2],
              width: 30,
              height: 30,
              altitude: 0,
              rotate: 0,
              title: this.svgMap['antenna'].title,
              type: this.svgMap['antenna'].type,
              color: this.colorList[svgId][1],
              material: this.materialList[0]['id'],
              element: this.parseElement('antenna'),
              materialName: '',
              belongWhichBS: svgId
            };

            this.svgAntNum = `${this.getBsIndexFromBsSvgId(svgId)}.${a + 1}`;
            this.setLabel();
            this.setAntSize(antSvgId);
          }
        }
      }


      for (let bs = 0; bs < this.defaultBSList.length; bs++)
      {
        if (this.planningIndex == '3')
          this.colorList[this.defaultBSList[bs]] = this.authService.getRandomColorByHsl(this.planningIndex, bs);
        else
          this.colorList[this.defaultBSList[bs]] = [this.DEFAULT_BS_CIRCLE_COLOR, this.DEFAULT_BS_COLOR];
        this.dragObject[this.defaultBSList[bs]].color = this.colorList[this.defaultBSList[bs]][1];
        this.setDefaultBsSize(this.defaultBSList[bs]);
        this.moveNumber(this.defaultBSList[bs]);
        for (let a = 0; a < this.bsListRfParam[this.defaultBSList[bs]].antenna.length; a++)
        {
          this.setAntSize(this.bsListRfParam[this.defaultBSList[bs]].antenna[a].svgId);
          this.moveNumber(this.bsListRfParam[this.defaultBSList[bs]].antenna[a].svgId);
        }
        if (this.planningIndex != '3')      //規劃模式尚未支援指向性天線
        {
          this.bsListRfParam[this.defaultBSList[bs]].AntennaId = 1;
          this.bsListRfParam[this.defaultBSList[bs]].isAntennaDefault = 'default';
          this.bsListRfParam[this.defaultBSList[bs]].antennaType = 'Omnidirectional';
          this.bsListRfParam[this.defaultBSList[bs]].antennaManufactor = 'ITRI';
        }
      }


      // UE
      if (!this.authService.isEmpty(this.calculateForm.ueCoordinate)) {
        const ue = this.calculateForm.ueCoordinate.split('|');
        const ueLen = ue.length;
        console.log("this.ueListParam",this.ueListParam);
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
          if (this.authService.isEmpty(this.calculateForm.ueRxGain)){ 
            this.ueListParam[id] = {
              ueRxGain:0
            };
          } else {
            this.ueListParam[id] = {
              ueRxGain: JSON.parse(this.calculateForm.ueRxGain)[i]
            }
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

      console.log(this.bsListRfParam);
    }
    
  }

  /** 運算結果 */
  async result() {
    //檢查子場域是否重疊
    if (this.checkSubFieldOverlaped()) {return;} 
    // 規劃目標
    // this.setPlanningObj();

    this.authService.spinnerShow();
    this.authService.spinnerHide();
    if (this.isHst) {
      this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid, isHst: true }}).then(() => {
        // location.reload();
      });
    } else {
      this.router.navigate(['/site/result'], { queryParams: { taskId: this.taskid }}).then(() => {
        // location.reload();
      });
    }
  }

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
  protocolSwitchWarning() {
    if (this.defaultBSList.length !== 0 ) {
      let msg = this.translateService.instant('planning.protocolSwitchWarning');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }
    if (this.calculateForm.objectiveIndex == '1') {
      if (this.duplexMode == 'tdd') {
        this.tempCalParamSet.tddscs = '15';
        this.tempCalParamSet.tddbandwidth = '5';
      } else {
        this.tempCalParamSet.dlScs = '15';
        this.tempCalParamSet.dlBandwidth = '5';
        this.tempCalParamSet.ulScs = '15';
        this.tempCalParamSet.ulBandwidth = '5';
      }
    } else if (this.calculateForm.objectiveIndex == '0') {
      if (this.duplexMode == 'tdd') {
        this.tempCalParamSet.tddbandwidth = '5';
      } else {
        this.tempCalParamSet.dlBandwidth = '1.4';
        this.tempCalParamSet.ulBandwidth = '1.4';
        
      }
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
    // if (Number(this.calculateForm.objectiveIndex) === 2) {
    //   this.calculateForm.pathLossModelId = 9;
    // } else {
    //   this.calculateForm.pathLossModelId = 0;
    // }
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
      return `4G${this.translateService.instant('taskName')}`;
      // return this.translateService.instant('planning.title').replace('{0}', '4G');
    } else if (this.calculateForm.objectiveIndex.toString() === '1') {
      return `5G${this.translateService.instant('taskName')}`;
      // return this.translateService.instant('planning.title').replace('{0}', '5G');
    } else if (this.calculateForm.objectiveIndex.toString() === '2') {
      return `WiFi${this.translateService.instant('taskName')}`;
      // return this.translateService.instant('planning.title').replace('{0}', 'Wifi');
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
      this.calculateForm.isSimulation = false;
      this.calculateForm.isCoverage = true;
      this.calculateForm.isUeCoverage = false;
      this.calculateForm.isUeAvgThroughput = false;
      //this.changeAntennaToOmidirectial();
      window.sessionStorage.setItem(`planningIndex`, this.planningIndex);
    } else if (this.planningIndex === '2') {
      this.calculateForm.isSimulation = false;
      this.calculateForm.isUeCoverage = false;
      this.calculateForm.isUeAvgThroughput = true;
      this.calculateForm.isCoverage = false;
      //this.changeAntennaToOmidirectial();
      window.sessionStorage.setItem(`planningIndex`, this.planningIndex);
    } else {
      if (this.candidateList.length != 0) {
        // this.msgDialogConfig.data = {
        //   type: 'error',
        //   infoMessage: '<br>這個目標設定的改變，會刪除掉場域上所有的待選位置! <br>是否繼續執行?'
        // };
        // this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        this.matDialog.open(this.changeToSimulationModal, { disableClose: true });
      } else {
        this.calculateForm.isSimulation = true;
        // this.clearAll('candidate');
        this.calculateForm.isAverageSinr = false;
        this.calculateForm.isCoverage = false;
        this.calculateForm.isUeCoverage = false;
        this.calculateForm.isUeAvgSinr = false;
        this.calculateForm.isUeAvgThroughput = false;
      }
    }
    for (let bs = 0; bs < this.defaultBSList.length; bs++)
    {
      if (this.planningIndex == '3')
        this.colorList[this.defaultBSList[bs]] = this.authService.getRandomColorByHsl(this.planningIndex, bs);
      else
        this.colorList[this.defaultBSList[bs]] = [this.DEFAULT_BS_CIRCLE_COLOR, this.DEFAULT_BS_COLOR];
      this.dragObject[this.defaultBSList[bs]].color = this.colorList[this.defaultBSList[bs]][1];
      this.setDefaultBsSize(this.defaultBSList[bs]);
      this.moveNumber(this.defaultBSList[bs]);
      for (let a = 0; a < this.bsListRfParam[this.defaultBSList[bs]].antenna.length; a++)
      {
        this.setAntSize(this.bsListRfParam[this.defaultBSList[bs]].antenna[a].svgId);
        this.moveNumber(this.bsListRfParam[this.defaultBSList[bs]].antenna[a].svgId);
      }
      if (this.planningIndex != '3')      //規劃模式尚未支援指向性天線
      {
        this.bsListRfParam[this.defaultBSList[bs]].AntennaId = 1;
        this.bsListRfParam[this.defaultBSList[bs]].isAntennaDefault = 'default';
        this.bsListRfParam[this.defaultBSList[bs]].antennaType = 'Omnidirectional';
        this.bsListRfParam[this.defaultBSList[bs]].antennaManufactor = 'ITRI';        
      }
    }
  }

  changeToSimulation(flag) {
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
      window.sessionStorage.setItem(`planningIndex`, this.planningIndex);
    } else {
      // if (this.calculateForm.isCoverage) {
      //   this.planningIndex = '1';console.log(this.planningIndex);
      //   this.getPlanningIndex();
      // } else {
      //   this.planningIndex = '2';
        this.getPlanningIndex();
      // }
      this.matDialog.closeAll();

      for (let bs = 0; bs < this.defaultBSList.length; bs++)
      {
        this.colorList[this.defaultBSList[bs]] = [this.DEFAULT_BS_CIRCLE_COLOR, this.DEFAULT_BS_COLOR];
        this.dragObject[this.defaultBSList[bs]].color = this.colorList[this.defaultBSList[bs]][1];
        this.setDefaultBsSize(this.defaultBSList[bs]);
        this.moveNumber(this.defaultBSList[bs]);
      }
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
    } else if (type === 'subField') {
      return 4;
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
    this.delete(false);
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

  /** 檢查圓形高度 */
  checkCircle() {
    for (const svgId of this.obstacleList) {
      const obstacle = this.dragObject[svgId];
      if (obstacle.element === 2) {
        const spanHeight = Number(this.spanStyle[svgId].height.replace('px', ''));
        const cy2 = this.ellipseStyle[svgId].cy * 2;
        if (cy2 > spanHeight || cy2 > this.svgStyle[svgId].height) {
          // 圓形高度超出外框，還原正常尺寸
          console.log(spanHeight, this.svgStyle[svgId].height, cy2);
          this.svgStyle[svgId].height = spanHeight;
          const newCy = spanHeight / 2;
          this.ellipseStyle[svgId].rx = newCy;
          this.ellipseStyle[svgId].ry = newCy;
          this.ellipseStyle[svgId].cx = newCy;
          this.ellipseStyle[svgId].cy = newCy;
        }
      }
    }
  }

  /** 圖區resize */
  chartResize() {
    window.setTimeout(() => {
      // 重取區域寬度
      this.resetChartWidth();

      const dArea = <HTMLDivElement>document.getElementById('top_area');
      // top區域+head menu + 一點buffer
      const dAreaHeight = dArea.clientHeight + 90;
      document.getElementById('chart').style.height = `${window.innerHeight - dAreaHeight}px`;

      Plotly.relayout('chart', {
        width: this.leftWidth,
        // autosize: true
        // height: '100%'
      }).then((gd) => {

        this.chartService.calSize(this.calculateForm, gd).then(res => {
          const layoutOption = {
            width: res[0],
            height: res[1]
          };
          // resize layout
          console.log(layoutOption);
          Plotly.relayout('chart', layoutOption).then((gd2) => {
            window.setTimeout(() => {
              // 重新計算比例尺
              this.calScale(gd2);
              // set 障礙物尺寸與位置
              for (const id of this.obstacleList) {
                this.setObstacleSize(id);
              }
              // set 新增基站位置
              for (const id of this.candidateList) {
                this.setCandidateSize(id);
              }
              // set 既有基站位置
              for (const id of this.defaultBSList) {
                this.setDefaultBsSize(id);
                for (let a = 0; a < this.bsListRfParam[id].antenna.length; a++)
                {
                  this.setAntSize(this.bsListRfParam[id].antenna[a].svgId);
                }
              }
              // set 既有基站位置
              for (const id of this.ueList) {
                this.setUeSize(id);
              }
              for (const id of this.subFieldList) {
                this.setSubFieldSize(id);
              }

              // scrollbar event
              gd2.addEventListener('scroll', (event) => {
                event.preventDefault();
                this.scrollLeft = gd2.scrollLeft;
                this.scrollTop = gd2.scrollTop;
                const xy = gd2.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();
                this.bounds = {
                  left: xy.left - this.scrollLeft,
                  top: xy.top - this.scrollTop,
                  right: xy.right,
                  bottom: xy.top + xy.height
                };
              });

              // drag範圍
              window.setTimeout(() => {
                const xy = gd2.querySelector('.xy').querySelectorAll('rect')[0].getBoundingClientRect();
                this.bounds = {
                  left: xy.left,
                  top: xy.top,
                  right: xy.right,
                  bottom: xy.top + xy.height
                };
              }, 0);

              if (typeof this.chart !== 'undefined') {
                this.chart.nativeElement.style.opacity = 1;
              }
            }, 0);
            
          });
        });



        
      });
    }, 0);
    

  }

  /**
   * set 障礙物尺寸與位置
   * @param id 
   */
  setObstacleSize(id) {

    let target =  this.target = document.getElementById(`${id}`);
    this.frame.set('z-index', 100+10*this.dragObject[id].z);
    this.setTransform(target);
    try {
      this.moveable.destroy();
    } catch (error) {
      this.moveable.ngOnInit();
      this.moveable.destroy();
    }
    this.spanStyle[id] = {
      left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
      top: `${this.chartHeight - this.pixelYLinear(this.dragObject[id].height) - this.pixelYLinear(this.dragObject[id].y)}px`,
      width: `${this.pixelXLinear(this.dragObject[id].width)}px`,
      height: `${this.pixelYLinear(this.dragObject[id].height)}px`,
      // transform: `rotate(${this.dragObject[id].rotate}deg)`,
      opacity: 0
    };
    // 延遲轉角度，讓位置正確
    window.setTimeout(() => {
      this.spanStyle[id]['transform'] = `rotate(${this.dragObject[id].rotate}deg)`;
      this.spanStyle[id].opacity = 1;
    }, 0);

    const width = this.pixelXLinear(this.dragObject[id].width);
    const height = this.pixelYLinear(this.dragObject[id].height);
    this.svgStyle[id] = {
      display: 'inherit',
      width: width,
      height: height
    };

    const shape = this.dragObject[id].element;
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
      this.ellipseStyle[id] = {
        ry: x,
        rx: x,
        cx: x,
        cy: x,
        fill: this.dragObject[id].color
      };
      // 重新指定圓形span跟svg的高，避免變形
      this.svgStyle[id].height = width;
      this.spanStyle[id].height = `${width}px`;

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
  }
  /**
   * set 新增子場域位置
   * @param id 
   */
  setSubFieldSize(id) {
    this.spanStyle[id] = {
      left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
      top: `${this.chartHeight - (this.dragObject[id].height) - this.pixelYLinear(this.dragObject[id].y)}px`,
      width: `${(this.dragObject[id].width)}px`,
      height: `${(this.dragObject[id].height)}px`,
      // transform: `rotate(${this.dragObject[id].rotate}deg)`,
      opacity: 0
    };
    console.log(this.spanStyle[id])
    // 延遲轉角度，讓位置正確
    window.setTimeout(() => {
      this.spanStyle[id]['transform'] = `rotate(${this.dragObject[id].rotate}deg)`;
      this.spanStyle[id].opacity = 1;
    }, 0);

    const width = (this.dragObject[id].width);
    const height = (this.dragObject[id].height);
    this.svgStyle[id] = {
      display: 'inherit',
      width: width,
      height: height
    };
    /*this.subFieldStyle[id] = {
      width: width,
      height: height,
      fill: 'pink',
      fillOpacity:0.2,
      stroke:'pink',
      strokeWidth: 3,
    };*/
    
  }
  /**
   * set 新增基站位置
   * @param id 
   */
  setCandidateSize(id) {
    this.spanStyle[id] = {
      left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
      top: `${this.chartHeight - this.candidateHeight - this.pixelYLinear(this.dragObject[id].y)}px`,
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

  }

  /**
   * set 既有基站位置
   * @param id 
   */
  setDefaultBsSize(id) {
    this.spanStyle[id] = {
      left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
      top: `${this.chartHeight - 30 - this.pixelYLinear(this.dragObject[id].y)}px`,
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

  /**
 * set 天線位置
 * @param id 
 */
  setAntSize(id)
  {
    this.spanStyle[id] = {
      left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
      top: `${this.chartHeight - 30 - this.pixelYLinear(this.dragObject[id].y)}px`,
      width: `30px`,
      height: `30px`
    };
    console.log(`this.spanStyle[${id}] = ${JSON.stringify(this.spanStyle[id])}`);
    this.svgStyle[id] = {
      display: 'inherit',
      width: 30,
      height: 30
    };
    this.pathStyle[id] = {
      fill: this.dragObject[id].color
    };
    window.setTimeout(() =>
    {
      this.moveNumber(id);
    }, 0);
  }

  /**
   * set UE位置
   * @param id 
   */
  setUeSize(id) {
    this.spanStyle[id] = {
      left: `${this.pixelXLinear(this.dragObject[id].x)}px`,
      top: `${this.chartHeight - this.ueHeight - this.pixelYLinear(this.dragObject[id].y)}px`,
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

  /** 重設區域寬度 */
  resetChartWidth() {
    const contentWidth = window.innerWidth - 64;
    this.leftWidth = contentWidth - (contentWidth * 0.3) - 50;
    // document.getElementById('chart').style.width = `${this.leftWidth}px`;
    // document.getElementById('chart').style.overflowY = 'hidden';
  }

  /** 更改RSRP閥值 */
  changeRsrpThreshold() {

    var msg = '';

    if (this.rsrpThreshold < this.rsrpLowerLimit || this.rsrpThreshold > this.rsrpUpperLimit || isNaN(Number(this.rsrpThreshold)))
      msg = this.translateService.instant('rsrp_fault');

    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

      this.rsrpThreshold = Number(sessionStorage.getItem('rsrpThreshold'));
    }
    else
    {
      this.rsrpThreshold = Number(this.rsrpThreshold);
      sessionStorage.setItem('rsrpThreshold', JSON.stringify(this.rsrpThreshold));
    }
    
  }

  /** 更改SINR閥值 */
  changeSinrThreshold() {

    var msg = '';

    console.log(Number(this.sinrThreshold));

    if (this.sinrThreshold < this.sinrLowerLimit || this.sinrThreshold > this.sinrUpperLimit || isNaN(Number(this.sinrThreshold)))
      msg = this.translateService.instant('sinr_fault');

    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

      this.sinrThreshold = Number(sessionStorage.getItem('sinrThreshold'));
    }
    else
    {
      this.sinrThreshold = Number(this.sinrThreshold);
      sessionStorage.setItem('sinrThreshold', JSON.stringify(this.sinrThreshold));
    }
    
  }

  /**
   * 自訂材質Dialog
   * @param materialId
   */
  materialCustomizeDialog(materialId){
    if (materialId != 999){
      let index = this.materialIdToIndex[materialId];
      let materialName = '';
      if(this.authService.lang =='zh-TW'){
        materialName = this.materialList[index]['chineseName'];
      }else{
        materialName = this.materialList[index]['name'];
      }
      this.materialName = materialName;
      this.materialLossCoefficient = this.materialList[index]['decayCoefficient'];
      this.materialProperty = this.materialList[index]['property'];
    } else {
      this.materialName = "";
      this.materialLossCoefficient = 0.1;
      this.materialProperty = "customized";
    }
    this.matDialog.open(this.materialCustomizeModal,{autoFocus: false});
  }

  /**
   * 自訂PathLossModel Dialog
   * @param modelId
   */
  pathLossCustomizeDialog(modelId){
    if (modelId != 999){
      let index = this.modelIdToIndex[modelId];
      let modelName = '';
      if(this.authService.lang =='zh-TW'){
        modelName = this.modelList[index]['chineseName'];
      }else{
        modelName = this.modelList[index]['name'];
      }
      this.modelName = modelName;
      this.modelDissCoefficient = this.modelList[index]['distancePowerLoss'];
      this.modelfieldLoss = this.modelList[index]['fieldLoss'];
      this.modelProperty = this.modelList[index]['property'];
    } else {
      this.modelName = "";
      this.modelDissCoefficient = 0.1;
      this.modelfieldLoss = 0.1;
      this.modelProperty = "customized";
    }
    this.matDialog.open(this.modelCustomizeModal,{autoFocus: false});
  }

  /** 發送post requset 編輯材質 */
  materialCustomize(){
    window.setTimeout(() => {
      let url = `${this.authService.API_URL}/updateObstacle/${this.authService.userToken}`;
      let url_get = `${this.authService.API_URL}/getObstacle/${this.authService.userToken}`;
      // console.log("----update",url);
      let isDefault = this.materialProperty == 'default' ? true : false;
      let chName = isDefault ? this.materialList[this.materialIdToIndex[this.materialId]]['chineseName'] : this.materialName;
      let materialName = isDefault? this.materialList[this.materialIdToIndex[this.materialId]]['name'] : this.materialName;
      let data = {
          'id': Number(this.materialId),
          'name': materialName,
          'chineseName': chName,
          'decayCoefficient': this.materialLossCoefficient,
          'property': this.materialProperty
      }
      console.log(JSON.stringify(data));
      
      if(this.checkMaterialForm(false,isDefault)){
        this.http.post(url, JSON.stringify(data)).subscribe(
          res => {
            console.log(res);
            this.matDialog.closeAll();
            // this.ngOnInit();
            this.http.get(url_get).subscribe(
              (res: any[]) => {
                // console.log("----get",url_get);
                let result = res;
                let index = 0;
                for(let i = 0; i < (result).length; i++){
                  if(result[i]['id'] == this.materialId){
                    index = i;
                    // console.log('i',i,'result',result[i]);
                    break;
                  } 
                }
                this.materialList[this.materialIdToIndex[this.materialId]]['decayCoefficient'] = result[index]['decayCoefficient'];
                this.materialList[this.materialIdToIndex[this.materialId]]['name'] = result[index]['name'];
                this.materialList[this.materialIdToIndex[this.materialId]]['chineseName'] = result[index]['chineseName'];
              },
              err => {
                console.log(err);
              }
            );
          },
          err => {
            console.log(err);
          }
        );
      }
    }, 100);
  }

  /** 發送post requset 編輯PathLossModel */
  pathLossCustomize(){
    window.setTimeout(() => {
      let url_update = `${this.authService.API_URL}/updatePathLossModel/${this.authService.userToken}`;
      let url_get = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
      // console.log("----update",url_update);
      let isDefault = this.modelProperty == 'default' ? true : false;
      let chName = isDefault ? this.modelList[this.modelIdToIndex[Number(this.calculateForm.pathLossModelId)]]['chineseName'] : this.modelName;
      let modelName = isDefault ? this.modelList[this.modelIdToIndex[Number(this.calculateForm.pathLossModelId)]]['name'] : this.modelName;
      let data = {
          'id': Number(this.calculateForm.pathLossModelId),
          'name': modelName,
          'chineseName': chName,
          'distancePowerLoss': this.modelDissCoefficient,
          'fieldLoss': this.modelfieldLoss,
          'property': this.modelProperty
      }
      console.log(JSON.stringify(data));
      
      console.log("isDefault",isDefault);
      if(this.checkModelForm(false,isDefault,false)){
        this.http.post(url_update, JSON.stringify(data)).subscribe(
          res => {
            console.log(res);
            this.matDialog.closeAll();
            this.http.get(url_get).subscribe(
              (res: any[]) => {
                // console.log("----get",url_get);
                let result = res;
                let index = 0;
                for(let i = 0; i < (result).length; i++){
                  if(result[i]['id'] == this.calculateForm.pathLossModelId){
                    index = i;
                    // console.log('i',i,'result',result[i]);
                    break;
                  } 
                }
                this.modelList[this.modelIdToIndex[this.calculateForm.pathLossModelId]]['name'] = result[index]['name'];
                this.modelList[this.modelIdToIndex[this.calculateForm.pathLossModelId]]['chineseName'] = result[index]['chineseName'];
                this.modelList[this.modelIdToIndex[this.calculateForm.pathLossModelId]]['distancePowerLoss'] = result[index]['distancePowerLoss'];
                this.modelList[this.modelIdToIndex[this.calculateForm.pathLossModelId]]['fieldLoss'] = result[index]['fieldLoss'];
              },
              err => {
                console.log(err);
              }
            );

          },
          err => {
            console.log(err);
          }
        );
      }
    }, 100);
    
  }

  /** 發送post requset 新增材質 */
  createNewMaterial(){
    // console.log("createNewMaterial",this.materialName,this.materialLossCoefficient);
    // console.log("this.materialName.length",String(this.materialName).length);
    if(this.checkMaterialForm(true,false)){
      // 新增材質到後端
      let url = `${this.authService.API_URL}/addObstacle/${this.authService.userToken}`;
      let url_get = `${this.authService.API_URL}/getObstacle/${this.authService.userToken}`;
      window.setTimeout(() => {
        // console.log("----post----",url);
        let data = {
          'name': this.materialName,
          'decayCoefficient': this.materialLossCoefficient,
          'property': "customized"
        }
        console.log(JSON.stringify(data));
        this.http.post(url, JSON.stringify(data)).subscribe(
          res => {
            console.log(res);
            this.http.get(url_get).subscribe(
              (res: any[]) => {
                // console.log("----get",url_get);
                let result = res;
                this.materialList.push(result[(result.length-1)]);
                for (let i = 0;i < this.materialList.length;i++) {
                  let id = this.materialList[i]['id'];
                  this.materialIdToIndex[id]=i;
                }
                // this.materialId = result[(result.length-1)]['id'];
              },
              err => {
                console.log(err);
              }
            );
            this.materialName = "";
            this.materialLossCoefficient = 0.1;
            this.createMaterialSuccessDialog();
            // this.matDialog.closeAll();
            // this.ngOnInit();
          },
          err => {
            console.log(err);
          }
        );
      }, 100);
    }
  }

  /** 
   * 檢查材質相關欄位
   * @param create 新增或編輯
   * @param isDefault 預設或自訂
  */
  checkMaterialForm(isCreate,isDefault){
    let pass = true; 
    let duplicate = false;
    let reg_ch = new RegExp('[\u4E00-\u9FFF]+');
    let reg_tch = new RegExp('[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+');
    let reg_en = new RegExp('[\A-Za-z]+');
    let reg_num = new RegExp('[\0-9]+');
    let reg_spc = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~《》~！@#￥……&\*（）——\|{}【】‘；：”“'。，、?]/;
    // format checking 包含特殊字元 || 不是英文中文數字
    let illegal = ((reg_spc.test(this.materialName) || reg_tch.test(this.materialName)) || (!(reg_ch.test(this.materialName)) && !(reg_en.test(this.materialName)) && !(reg_num.test(this.materialName))));
    if (isDefault) { illegal=false; }
    // 檢查現有材質名稱是否已存在
    if(isCreate){
      for (let i = 0; i < this.materialList.length; i++) {
        if(this.materialName == this.materialList[i]['name'] || this.materialName == this.materialList[i]['chineseName']){
          console.log("duplicate by",this.materialName);
          duplicate = true;
          break;
        }
      }
    }
    // 錯誤訊息
    if( !this.materialName || !(Number(this.materialLossCoefficient)>-1000) || this.materialLossCoefficient == null || Number(this.materialLossCoefficient>1000) || duplicate || illegal ){
      pass = false;
      let msg = "";
      if (!this.materialName) {
        msg += this.translateService.instant('material.name') +' '+ this.translateService.instant('length') +' '+ this.translateService.instant('must_greater_than') + ' 0' ;
      } else if(!(Number(this.materialLossCoefficient)>-1000)) { 
        msg += this.translateService.instant('material.loss.coefficient') +' '+ this.translateService.instant('must_greater_than') + ' -1000';
      } else if(Number(this.materialLossCoefficient)>1000) { 
        msg += this.translateService.instant('material.loss.coefficient') +' '+ this.translateService.instant('must_less_than') + ' 1000';
      } else if(this.materialLossCoefficient == null){ 
        msg += this.translateService.instant('material.loss.coefficient') +' '+ this.translateService.instant('contain_special_character') + '!';
      } else if(illegal){
        msg += this.translateService.instant('material.name') +' '+ this.translateService.instant('contain_special_character') + '!';
      } else {
        msg += this.translateService.instant('material.name') +': '+ this.materialName +' '+this.translateService.instant('alreadyexist') + '!'
      } 
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }
    return pass
  }

  /** 發送post request 新增PathLossModel */
  createNewModel(){
    if(this.checkModelForm(true,false,false)){
      // 新增無線模型到後端
      let url_add = `${this.authService.API_URL}/addPathLossModel/${this.authService.userToken}`;
      let url_get = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
      window.setTimeout(() => {
        // console.log("----post",url_add);
        let data = {
            'name': this.modelName,
            'distancePowerLoss': this.modelDissCoefficient,
            'fieldLoss': this.modelfieldLoss,
            'property': "customized"
        }
        console.log(JSON.stringify(data));
        this.http.post(url_add, JSON.stringify(data)).subscribe(
          res => {
            console.log(res);
            this.http.get(url_get).subscribe(
              (res: any[]) => {
                // console.log("----get",url_get);
                let result = res;
                this.modelList.push(result[(result.length-1)]);
                for (let i = 0;i < this.modelList.length;i++) {
                  let id = this.modelList[i]['id'];
                  this.modelIdToIndex[id]=i;
                }
                // this.calculateForm.pathLossModelId = result[(result.length-1)]['id'];
                console.log('this.calculateForm.pathLossModelId',this.calculateForm.pathLossModelId);
                console.log('this.modelList.push',this.modelList);
              },
              err => {
                console.log(err);
              }
            );
            this.createModelSuccessDialog();
            // this.modelName = "";
            // this.modelDissCoefficient = 0.1;
            // this.modelfieldLoss = 0.1;
            // this.matDialog.closeAll();
            // this.ngOnInit();
          },
          err => {
            console.log(err);
          }
        );
      }, 100);
    }
  }
  
  /** 
   * 檢查PathLossModel相關欄位
   * @param isCreate 新增或編輯
   * @param isDefault 預設或自訂
   * @param isCalculate 是否為PathLossModel校正
  */
  checkModelForm(isCreate,isDefault,isCalculate){
    let pass = true; 
    let duplicate = false;
    let reg_ch = new RegExp('[\u4E00-\u9FFF]+');
    let reg_tch = new RegExp('[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+');
    let reg_en = new RegExp('[\A-Za-z]+');
    let reg_num = new RegExp('[\0-9]+');
    let reg_spc = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~《》~！@#￥……&\*（）——\|{}【】‘；：”“'。，、?]/;
    let msg = "";
    let noFile = false;
    // format checking 包含特殊字元 || 不是英文中文數字
    let illegal = ((reg_spc.test(this.modelName) || reg_tch.test(this.modelName)) || (!(reg_ch.test(this.modelName)) && !(reg_en.test(this.modelName)) && !(reg_num.test(this.modelName))));
    if (isDefault) { illegal=false; }
    // 檢查現有模型名稱是否已存在
    if (isCreate || isCalculate){
      for (let i = 0; i < this.modelList.length; i++) {
        if(this.modelName == this.modelList[i]['name'] || this.modelName == this.modelList[i]['chineseName']){
          console.log("duplicate by",this.modelName);
          duplicate = true;
          break;
        }
      }
    }
    if(isCalculate){
      if(this.modelFileName == ''){
        console.log('empty!');
        noFile = true;
      }
    }
    if(!this.modelName || duplicate || illegal || noFile){
      pass = false;
      if (!this.modelName) {
        msg += this.translateService.instant('planning.model.name') +' '+ this.translateService.instant('length') +' '+ this.translateService.instant('must_greater_than') + '0' ;
      } else if(illegal) {
        msg += this.translateService.instant('planning.model.name') +' '+ this.translateService.instant('contain_special_character') + '!';
      } else if(duplicate){
        msg += this.translateService.instant('planning.model.name') +': '+ this.modelName +' '+ this.translateService.instant('alreadyexist') + '!'
      } else {
        msg += this.translateService.instant('plz_import') + ' ' + this.translateService.instant('pathLossModelData');
      }
    } else if(!isCalculate && (!(Number(this.modelDissCoefficient)>-1000) || this.modelDissCoefficient == null || Number(this.modelDissCoefficient>1000) || !(Number(this.modelfieldLoss)>-1000) || this.modelfieldLoss == null || Number(this.modelfieldLoss>1000))){
      pass = false;
      if (!(Number(this.modelDissCoefficient)>-1000)) { 
        msg += this.translateService.instant('planning.model.disscoefficient') +' '+ this.translateService.instant('must_greater_than') + ' -1000';
      } else if(this.modelDissCoefficient == null) { 
        msg += this.translateService.instant('planning.model.disscoefficient') +' '+ this.translateService.instant('contain_special_character') + '!';
      } else if(Number(this.modelDissCoefficient>1000)) { 
        msg += this.translateService.instant('planning.model.disscoefficient') +' '+ this.translateService.instant('must_less_than') + ' 1000';
      } else if(!(Number(this.modelfieldLoss)>-1000)) { 
        msg += this.translateService.instant('planning.model.fieldLoss') +' '+ this.translateService.instant('must_greater_than') + ' -1000';
      } else if(this.modelfieldLoss == null) { 
        msg += this.translateService.instant('planning.model.fieldLoss') +' '+ this.translateService.instant('contain_special_character') + '!';
      } else if(Number(this.modelfieldLoss>1000)) { 
        msg += this.translateService.instant('planning.model.fieldLoss') +' '+ this.translateService.instant('must_less_than') + ' 1000';
      }
    }

    if (msg != ""){
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }

    return pass
  }

  /** 依照匯入的觀測點建立無線模型 */
  async calculatePathlossModel(){
    if(this.checkModelForm(true,false,true)){
      let url_add = `${this.authService.API_URL}/calculatePathLossModel/${this.authService.userToken}`;
      let url_get = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
      let url_poll = `${this.authService.API_URL}/pollingPathLossModel/${this.authService.userToken}`;
      let formData = new FormData();
      let hash = await this.hashfile(this.file).then(res => res.toString());
      let posResult;
      formData.append('file', this.file);
      formData.append('name', this.modelName);
      formData.append('sha256sum', hash);
      formData.append('property','customized');
      try {
        posResult = await this.postRequest(url_add, formData);
        let body = [{"id": posResult['id']}];
        let status = await this.postRequest(url_poll, JSON.stringify(body));
        console.log(status);
        while(status[0]['status'] == 503){
          console.log("computing",status);
            status = await this.postRequest(url_poll, JSON.stringify(body));
            // await this.delay(1000);
        }
        if (status[0]['status'] == 200) {
          console.log(posResult['id'],'done');
          this.calModelDissCoefficient = status[0]['distancePowerLoss'];
          this.calModelfieldLoss = status[0]['fieldLoss'];
          let getResult:any = await this.getRequest(url_get);
          console.log("getResult",getResult);
          this.modelList.push(getResult[(getResult.length-1)]);
          for (let i = 0;i < this.modelList.length;i++) {
            let id = this.modelList[i]['id'];
            this.modelIdToIndex[id]=i;
          }
          // this.calculateForm.pathLossModelId = getResult[(getResult.length-1)]['id'];
          // console.log('this.calculateForm.pathLossModelId',this.calculateForm.pathLossModelId);
          console.log('new model id',getResult[(getResult.length-1)]['id']);
          console.log(this.modelList);
          this.calculateSuccessDialog();
          this.createMethod = 'formula';
          // this.modelName = "";
          // this.modelDissCoefficient = 0.1;
          // this.modelfieldLoss = 0.1;
          // this.modelFileName = "";
          // this.matDialog.closeAll();
        }
      } catch (error) {
        console.log('error',error);
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: this.translateService.instant(error.error.msg)
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        return;
      }
    }
  }

  /** error handle */
  async handleError(error: any): Promise<any> {
    console.log('An error occurred in MyService', error);
    return Promise.reject(error.message || error);
  }

  /** http post request */
  postRequest(url,data){
    return this.http.post(url, data)
      .toPromise()
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
  }

  /** http get request */
  getRequest(url){
    return this.http.get(url)
      .toPromise();
    // .catch(this.handleError);
  }

  /** close all Dialog */
  selectAndClose(){
    this.matDialog.closeAll();
  }

  /** open delete material dialog */
  deleteMaterialDialog(){
    this.matDialog.open(this.confirmDeleteMaterial);
  }

  /** open delete model dialog */
  deleteModelDialog(){
    this.matDialog.open(this.confirmDeleteModel);
  }

  /** open create model success modal */
  createModelSuccessDialog(){
    this.matDialog.open(this.createModelSuccessModal);
  }

  /** open create material success modal */
  createMaterialSuccessDialog(){
    this.matDialog.open(this.createMaterialSuccessModal);
  }

  /** open complate calculate model success modal */
  calculateSuccessDialog(){
    this.matDialog.open(this.calculateModelSuccessModal);
  }
  

  /**
   * 刪除材質
   * @param flag 是否確認刪除
   */
  deleteMaterial(flag){
    this.matDialog.closeAll();
    if(flag) {
      let url = `${this.authService.API_URL}/deleteObstacle/${this.authService.userToken}`;
      window.setTimeout(() => {
        // console.log("----(post) delete",url);
        let data = {
          'id': Number(this.materialId),
          'name': this.materialName
        }
        this.deleteMaterialList.push(Number(this.materialId));
        this.materialList[this.materialIdToIndex[this.materialId]].name = "";
        this.http.post(url,JSON.stringify(data)).subscribe(
          res => {
            console.log(res);
            for(let i = 0; i < this.obstacleList.length; i++){
              const obj = this.dragObject[this.obstacleList[i]];
              if( obj.type != "obstacle"){
                continue;
              }
              else if( !(Number(obj.material) in this.materialIdToIndex) || this.deleteMaterialList.includes(Number(obj.material))){
                // console.log("replace:",this.dragObject[this.obstacleList[i]]);
                this.dragObject[this.obstacleList[i]].material = this.materialList[0]['id'];
                this.dragObject[this.obstacleList[i]].materialName = (this.checkIfChinese()) ? this.materialList[0]['chineseName'] : this.materialList[0]['name'];
                // this.dragObject[this.obstacleList[i]].materialName = this.materialList[0]['name'];
              }
            }
          },
          err => {
            console.log('err:',err);
          }
        );
      }, 100);

    } else {
      this.matDialog.open(this.materialCustomizeModal);
    }
  }

  /** 
   * 刪除模型
   * @param flag 確認是否刪除
   */
  deleteModel(flag){
    this.matDialog.closeAll();
    if(flag) {
      // DELETE API
      window.setTimeout(() => {
        let url = `${this.authService.API_URL}/deletePathLossModel/${this.authService.userToken}`
        let url_get = `${this.authService.API_URL}/getPathLossModel/${this.authService.userToken}`;
        // console.log("----(post) delete",url);
        let data = {
          'id': Number(this.calculateForm.pathLossModelId),
          'name': this.modelName
        }
        console.log(JSON.stringify(data));
        /*
        let httpOptions = {
          headers: {},
          body: JSON.stringify(data)
        }
        */
        this.http.post(url,JSON.stringify(data)).subscribe(
          res => {
            console.log(res);
            // this.ngOnInit();
            this.http.get(url_get).subscribe(
              (res: any[]) => {
                // console.log("----get",url_get);
                this.modelList = Object.values(res);
                for (let i = 0;i < this.modelList.length;i++) {
                  let id = this.modelList[i]['id'];
                  this.modelIdToIndex[id]=i;
                }
                this.calculateForm.pathLossModelId = this.modelList[0]['id'];
              },
              err => {
                console.log(err);
              }
            );
          },
          err => {
            console.log('err:',err);
            // this.ngOnInit();
          }
        );
      }, 100);
    } else {
      this.matDialog.open(this.modelCustomizeModal);
    }
  }

  /** 檢查目前語言是否為中文 */
  checkIfChinese(){
    if (this.authService.lang == 'zh-TW') {
      return true;
    } else {
      return false;
    }
  }

  /** 根據場域長寬建立解析度list */
  createResolutionList(){
    let resolution = 2;
    while((this.calculateForm.width / resolution >=6) && (this.calculateForm.height /resolution >= 6) && resolution <= 10){
      this.resolutionList.push(resolution);
      resolution += 2;
    }
  }

  /** 座標軸說明視窗 */
  coordinateInfo(){
    this.matDialog.open(this.coordinateInfoModal);
  }

  /** 
   * 天線製造商filter
   * @param svgid 既有基站的id
   */
  manufactorChange(svgid){
    // svgid ==> deafault, else ==> candidate
    if (svgid != null){
      var manufactor = this.manufactor;
    } else {
      var manufactor = this.manufactorCal;
    }
    if(manufactor == 'All'){ // all manufactor not specify
      return;
    }else{
      // take first antenna of manufactor
      let firstAntenna = 0;
      for (let item of this.antennaList) {
        if(item['manufactor'] == manufactor){
          firstAntenna = item['antennaID'];
          break;
        }
      }
      if (svgid != null){
        this.bsListRfParam[svgid].AntennaId = firstAntenna;
      }else{
        this.tempCalParamSet.AntennaId = firstAntenna;;
      }
      this.antennaChangeCheck(svgid);
    }
  }

  antennaProptypeChangeCheck(svgid)
  {
    //this.filterAntennaByProperty(this.bsListRfParam[svgid].isAntennaDefault);
    if (this.bsListRfParam[svgid].isAntennaDefault == 'default')
    {
      this.bsListRfParam[svgid].AntennaId = this.defaultAntennaList[0].antennaID;
      this.antennaChangeCheck(svgid);
    }
    else if (this.customizedAntennaList.length != 0)
    {
      this.bsListRfParam[svgid].AntennaId = this.customizedAntennaList[0].antennaID;
      this.antennaChangeCheck(svgid);
    }
    else
    {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('antenna.no.data.in.custom')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

      setTimeout(() =>
      {
        this.bsListRfParam[svgid].isAntennaDefault = 'default';
        this.bsListRfParam[svgid].AntennaId = this.defaultAntennaList[0].antennaID;
        this.antennaChangeCheck(svgid);
      }, 10);
    }
  }

  /**
   * 根據檢查天線相關欄位
   * @param svgid 既有基站的id
   */
  antennaChangeCheck(svgid){
    var antId = 1;
    antId = this.bsListRfParam[svgid].AntennaId;
    let antenna = this.getAntennaById(antId);

    if (this.bsListRfParam[svgid].AntennaId != antenna.antennaID)   //選到了已經被刪掉的天線
      this.bsListRfParam[svgid].AntennaId = antenna.antennaID;

    this.bsListRfParam[svgid].isAntennaDefault = antenna.property;
    this.bsListRfParam[svgid].antennaManufactor = antenna.manufactor;
    this.bsListRfParam[svgid].antennaType = antenna.type;
    this.bsListRfParam[svgid].ulMimoLayer = antenna.availableFrequency[0].ports.length;
    this.bsListRfParam[svgid].dlMimoLayer = antenna.availableFrequency[0].ports.length;
    this.bsListRfParam[svgid].ulAntFreq = antenna.availableFrequency[0].frequency;
    this.bsListRfParam[svgid].dlAntFreq = antenna.availableFrequency[0].frequency;

    console.log(`this.bsListRfParam[${svgid}] = ` + JSON.stringify(this.bsListRfParam[svgid]));

    this.antennaFreqPortChangeCheck(svgid);
  }

  antennaFreqPortChangeCheck(bsSvgId)
  {
    let noFindULFreq = true;
    let noFindDLFreq = true;
    let thershold = 100;
    let msg = '';
    let error = false;
    let multiple = false;
    for (var f = 0; f < this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).availableFrequency.length; f++)
    {
      if (this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).availableFrequency[f].frequency ==
        this.bsListRfParam[bsSvgId].ulAntFreq)
      {
        noFindULFreq = false;        
      }
      if (this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).availableFrequency[f].frequency ==
        this.bsListRfParam[bsSvgId].dlAntFreq)
      {
        noFindDLFreq = false;    
      }

      if (!noFindULFreq && !noFindDLFreq)
        break;
    }

    if (noFindULFreq)
    {
      this.bsListRfParam[bsSvgId].ulAntFreq = this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).availableFrequency[0].frequency;
    }
    if (noFindDLFreq)
    {
      this.bsListRfParam[bsSvgId].dlAntFreq = this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).availableFrequency[0].frequency;
    }
    
    if (this.duplexMode == 'tdd')
    {
      this.bsListRfParam[bsSvgId].dlAntFreq = this.bsListRfParam[bsSvgId].ulAntFreq;
    }

    let AntULfrequency = Number(this.bsListRfParam[this.selectBsSvgId].ulAntFreq);
    let AntDLfrequency = Number(this.bsListRfParam[this.selectBsSvgId].dlAntFreq);

    if (this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).type != 'Omnidirectional' ||
      this.getAntennaById(this.bsListRfParam[this.svgId].AntennaId).property != 'default')
    {
      if (bsSvgId != null)
      {
        this.bsListRfParam[bsSvgId].bsTxGain = 0;
        // 檢查天線frequency與基站frequency是否一致(+-100)
        console.log(`this.bsListRfParam[bsSvgId].tddfrequency = ${JSON.stringify(this.bsListRfParam[bsSvgId].tddfrequency)}`);
        console.log(`AntULfrequency = ${AntULfrequency}`);

        if (this.duplexMode == 'tdd' && !(this.authService.isEmpty(this.bsListRfParam[bsSvgId].tddfrequency)))
        {
          if (((AntULfrequency + thershold <= this.bsListRfParam[bsSvgId].tddfrequency) ||
            (AntULfrequency - thershold >= this.bsListRfParam[bsSvgId].tddfrequency)))
          {
            msg += this.translateService.instant('tddfrequency') + ' ' + this.bsListRfParam[bsSvgId].tddfrequency + ' ';
            error = true;
          }
        }
        else if (this.duplexMode == 'fdd' && !(this.authService.isEmpty(this.bsListRfParam[bsSvgId].fddUlFrequency)) &&
          !(this.authService.isEmpty(this.bsListRfParam[bsSvgId].fddDlFrequency)))
        {
          if (((AntULfrequency + thershold <= this.bsListRfParam[bsSvgId].fddUlFrequency) ||
            (AntULfrequency - thershold >= this.bsListRfParam[bsSvgId].fddUlFrequency)))
          {
            msg += this.translateService.instant('uplink.frequency') + ' ' + this.bsListRfParam[bsSvgId].fddUlFrequency + ' ';
            error = true;
          }
          if (((AntDLfrequency + thershold <= this.bsListRfParam[bsSvgId].fddDlFrequency) ||
            (AntDLfrequency - thershold >= this.bsListRfParam[bsSvgId].fddDlFrequency)))
          {
            if (error)
            {
              if (this.checkIfChinese())
              {
                msg += ' 和 ';
              } else
              {
                msg += ' and the ';
              }
              multiple = true;
            }
            msg += this.translateService.instant('downlink.frequency') + ' ' + this.bsListRfParam[bsSvgId].fddDlFrequency + ' ';
            error = true;
          }
        }
        
      }
      if (error)
      {
        if (this.checkIfChinese())
        {
          if (this.duplexMode == 'tdd')
            this.infoMsg = "您所設置的" + msg + " 與天線頻率 " + AntULfrequency + " 差異較大, 可能導致計算結果不準確";
          else if (this.duplexMode == 'fdd')
            this.infoMsg = "您所設置的" + msg + " 與天線頻率 (" + AntULfrequency + "/" + AntDLfrequency 
              + ") 差異較大, 可能導致計算結果不準確";

        } else
        {
          let msgString = "you set is ";
          if (multiple)
          {
            msgString = "you set are ";
          }
          if (this.duplexMode == 'tdd')
            this.infoMsg = "<br>The " + msg + msgString + "quite different from the antenna frequency " + AntULfrequency + ",<br> which may cause inaccurate calculation results.";
          else if (this.duplexMode == 'fdd')
            this.infoMsg = "<br>The " + msg + msgString + "quite different from the antenna frequency (" +
              AntDLfrequency + "/" + "),<br> which may cause inaccurate calculation results.";


          
        }
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: this.infoMsg
        };

        window.setTimeout(() =>
        {
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        }, 100);
      }
    }
    
  }

  /**
   * 檢查theta改變後是否超出範圍
   * @param svgId 既有基站的id
   * @param isCandidate 
   */
  changeTheta(svgId, isCandidate){
    let msg = '';
    if (isCandidate) {
      if ((Number(this.tempCalParamSet.theta) > 180 || Number(this.tempCalParamSet.theta) < 0)) {
        msg = this.translateService.instant('theta_out_of_range');
        this.tempCalParamSet.theta = Number(window.sessionStorage.getItem('tempParam'))
      }
    } else {
      if ( (Number(this.bsListRfParam[svgId].theta) > 180 || Number(this.bsListRfParam[svgId].theta) < 0)) {
        msg = this.translateService.instant('theta_out_of_range');
        this.bsListRfParam[svgId].theta = Number(window.sessionStorage.getItem('tempParam'))
      }
    }
    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      // return;
    }
    console.log('theta = ' + msg);
  }

  /**
 * 檢查天線theta改變後是否超出範圍
 * @param svgId 既有基站的id
 * @param antIndex 天線的index
 */
  changeAntTheta(svgId, antIndex)
  {
    let msg = '';
    let max = 180;
    let min = 0;

    if ((Number(this.bsListRfParam[svgId].antenna[antIndex].theta) > max ||
      Number(this.bsListRfParam[svgId].antenna[antIndex].theta) < min))
    {
      msg = this.translateService.instant('theta_out_of_range');
      this.bsListRfParam[svgId].antenna[antIndex].theta = Number(window.sessionStorage.getItem('tempParam'))
    }
    if (msg != '')
    {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      // return;
    }
    console.log('theta = ' + msg);
  }

  /**
   * 檢查phi改變後是否超出範圍
   * @param svgId 既有基站的id
   * @param isCandidate 
   */
  changePhi(svgId, isCandidate){
    let msg = '';
    if (isCandidate) {
      if ((Number(this.tempCalParamSet.phi) > 360 || Number(this.tempCalParamSet.phi) < 0)) {
        msg = this.translateService.instant('phi_out_of_range');
        this.tempCalParamSet.phi = Number(window.sessionStorage.getItem('tempParam'))
      }
    } else {
      if ( (Number(this.bsListRfParam[svgId].phi) > 360 || Number(this.bsListRfParam[svgId].phi) < 0)) {
        msg = this.translateService.instant('phi_out_of_range');
        this.bsListRfParam[svgId].phi = Number(window.sessionStorage.getItem('tempParam'))
      }
    }
    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      // return;
    }
  }

  /**
* 檢查天線phi改變後是否超出範圍
* @param svgId 既有基站的id
* @param antIndex 天線的index
*/
  changeAntPhi(svgId, antIndex)
  {
    let msg = '';
    let max = 360;
    let min = 0;

    if ((Number(this.bsListRfParam[svgId].antenna[antIndex].phi) > max ||
      Number(this.bsListRfParam[svgId].antenna[antIndex].phi) < min))
    {
      msg = this.translateService.instant('phi_out_of_range');
      this.bsListRfParam[svgId].antenna[antIndex].phi = Number(window.sessionStorage.getItem('tempParam'))
    }
    if (msg != '')
    {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      // return;
    }
    console.log('phi = ' + msg);
  }

  /** 將天線類型轉換為全向性 */
  changeAntennaToOmidirectial(){
    this.manufactor = "All";
    this.manufactorCal = "All";
    for(let svgid of this.defaultBSList){
      this.bsListRfParam[svgid].AntennaId = 1;
    }
    this.tempCalParamSet.AntennaId = 1;
  }

  /**
   * 上傳檔案
   * @param event 
   * @returns 無上傳檔案則終止
   */
  async uploadFile(event) {
    const file = event.target.files[0];
    event.target.value = null;
    if (file == undefined){
      return;
    }
    this.file = file;
    this.modelFileName = this.showPartName(file.name);
  }

  /**
 * 上傳檔案
 * @param event 
 * @returns 無上傳檔案則終止
 */
  async importAntFile(event, isAdd)
  {
    const file = event.target.files[0];
    event.target.value = null;
    if (file == undefined)
    {
      return;
    }
    this.file = file;

    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))
    {
      if (isAdd == true)
      {
        this.addAntenna.file = file;
        this.changeAntennaFreqAndPortCountByFile(this.addAntenna);
        this.addAntenna.fileName = this.showPartName(file.name);
      }
      else
      {
        this.editAntenna.file = file;
        this.editAntenna.isNewFile = true;
        console.log(this.editAntenna.file);
        this.changeAntennaFreqAndPortCountByFile(this.editAntenna);
        this.editAntenna.fileName = this.showPartName(file.name);
      }
    }
    else
    {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: this.translateService.instant('antenna.file.error.not.excel')
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
    }



  }

  /**
   * 當字元長度超過25僅顯示前後10字元
   * @param name 
   * @returns 
   */
  showPartName(name){
    if( name.length > 25){
      return name.slice(0,10)+'...'+name.slice(-10);
    } else {
      return name;
    }
  }

  /** 清除新增無線模型相關欄位資料 */
  cleanData(){
    this.file= null;
    this.modelName = "";
    this.modelDissCoefficient = null;
    this.modelfieldLoss = null;
    this.modelFileName = "";
  }

  /**
   * SHA256 hash
   * @param file 
   * @returns 
   */
  hashfile(file) {
   return new Promise((resolve) => {
      var reader = new FileReader();
      var hash = '';
      reader.readAsArrayBuffer(file);
      reader.onload = function () {
          var wordArray = CryptoJS.lib.WordArray.create(reader.result);
          hash = CryptoJS.SHA256(wordArray).toString();
          resolve(hash.toString());
      }
    });
  }
  
  /**
   * delay ms second
   */
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  /** change create pathLossModel method */
  changeCreateMethod(){
    console.log('change',this.createMethod);
    if(this.createMethod == 'importFile'){
      this.modelDissCoefficient = null;
      this.modelfieldLoss = null;
    }else{
      this.modelDissCoefficient = 0.1;
      this.modelfieldLoss = 0.1;
    }
  }

  addSINR() {
    
    this.evaluationFuncForm.field.sinr.ratio.push(
      {
        "areaRatio": this.defaultArea, 
        "compliance": "moreThan",
        "value": this.defaultSINRSetting
      });
    this.setStorageEvaluationFuncForm();
  }

  delSINR(index) {    
    this.evaluationFuncForm.field.sinr.ratio.splice(index, 1);
    this.setStorageEvaluationFuncForm();
  }

  addRSRP() {
    
    this.evaluationFuncForm.field.rsrp.ratio.push(
    {
      "areaRatio": this.defaultArea, 
      "compliance": "moreThan",
      "value": this.defaultRSRPSetting
    });
    this.setStorageEvaluationFuncForm();
  }

  delRSRP(index) {    
    this.evaluationFuncForm.field.rsrp.ratio.splice(index, 1);
    this.setStorageEvaluationFuncForm();
  }

  addThroughput() {
    
    this.fieldThroughputTypeArr[this.evaluationFuncForm.field.throughput.ratio.length] = 'UL';
    this.fieldThroughputValueArr[this.evaluationFuncForm.field.throughput.ratio.length] = this.defaultULThroughputSetting;
    this.evaluationFuncForm.field.throughput.ratio.push(
    {
      "areaRatio": this.defaultArea, 
      "compliance": "moreThan",
      "ULValue":  this.defaultULThroughputSetting,
      "DLValue":  null
    });
    this.setStorageEvaluationFuncForm();
  }

  delThroughput(index) {    
    this.evaluationFuncForm.field.throughput.ratio.splice(index, 1);
    this.fieldThroughputTypeArr.splice(index, 1);
    this.fieldThroughputValueArr.splice(index, 1);
    this.setStorageEvaluationFuncForm();
  }

  addUEThroughput() {
    
    this.ueThroughputTypeArr[this.evaluationFuncForm.ue.throughputByRsrp.ratio.length] = 'UL';
    this.ueThroughputValueArr[this.evaluationFuncForm.ue.throughputByRsrp.ratio.length] = this.defaultUEULThroughputSetting;
    this.evaluationFuncForm.ue.throughputByRsrp.ratio.push(
    {
      "countRatio": this.defaultArea, 
      "compliance": "moreThan",
      "ULValue":  this.defaultUEULThroughputSetting,
      "DLValue":  null
    });
    this.setStorageEvaluationFuncForm();
  }

  delUEThroughput(index) {    
    this.evaluationFuncForm.ue.throughputByRsrp.ratio.splice(index, 1);
    this.ueThroughputTypeArr.splice(index, 1);
    this.ueThroughputValueArr.splice(index, 1);
    this.setStorageEvaluationFuncForm();
  }


  checkPercent(area) {
    console.log('Check area:'+ area);
    let msg = '';

    if (area < 1 || area > 100 || isNaN(Number(area)) || area == '')
    {
      msg = this.translateService.instant('percent_fault');
     
    }

    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

      this.getStorageEvaluationFuncForm();    //還原舊參數
    }
  }

  checkSINR(sinr) {
    console.log('Check sinr:'+ sinr);
    let msg = '';

    if(sinr < this.sinrLowerLimit || sinr > this.sinrUpperLimit || isNaN(Number(sinr)) || sinr == '')
      msg = this.translateService.instant('sinr_fault');

    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      this.getStorageEvaluationFuncForm();    //還原舊參數
    }
  }

  checkRSRP(rsrp) {
    console.log('Check rsrp:'+ rsrp);
    let msg = '';

    if (rsrp < this.rsrpLowerLimit || rsrp > this.rsrpUpperLimit || isNaN(Number(rsrp)) || rsrp == '')
      msg = this.translateService.instant('rsrp_fault');

    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      this.getStorageEvaluationFuncForm();    //還原舊參數
    }
  }

  checkThroughput(throughput, isULorDL, index) 
  {
    console.log('Check throughput:'+ throughput);
    let msg = '';

    if(isULorDL == 'UL')
    {
      if(throughput < this.ulThroughputLowerLimit || throughput > this.ulThroughputUpperLimit || isNaN(Number(throughput)))
        msg = this.translateService.instant('ulthroughput_fault');
    }
    else if(isULorDL == 'DL')
    {
      if(throughput < this.dlThroughputLowerLimit || throughput > this.dlThroughputUpperLimit || isNaN(Number(throughput)))
        msg = this.translateService.instant('dlthroughput_fault');
    }


    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      this.getStorageEvaluationFuncForm();    //還原舊參數
    }
    else
    {      
      if(isULorDL == 'UL')
      {
        this.evaluationFuncForm.field.throughput.ratio[index].ULValue = throughput;
        this.evaluationFuncForm.field.throughput.ratio[index].DLValue = null;
      }
      else if(isULorDL == 'DL')
      {
        this.evaluationFuncForm.field.throughput.ratio[index].DLValue = throughput;
        this.evaluationFuncForm.field.throughput.ratio[index].ULValue = null;
      }
    }
  }

  checkUEThroughput(throughput, isULorDL, index) 
  {
    console.log('Check throughput:'+ throughput);
    let msg = '';

    if(isULorDL == 'UL')
    {
      if(throughput < this.ulThroughputLowerLimit || throughput > this.ulThroughputUpperLimit || isNaN(Number(throughput)))
        msg = this.translateService.instant('ulthroughput_fault');
    }
    else if(isULorDL == 'DL')
    {
      if(throughput < this.dlThroughputLowerLimit || throughput > this.dlThroughputUpperLimit || isNaN(Number(throughput)))
        msg = this.translateService.instant('dlthroughput_fault');
    }

    if (msg != '') {
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      this.getStorageEvaluationFuncForm();    //還原舊參數
    }
    else
    {      
      if(isULorDL == 'UL')
      {
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = throughput;
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = null;
      }
      else if(isULorDL == 'DL')
      {
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = throughput;
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = null;
      }
    }
  }

  getPlanningIndex()
  {
    if(window.sessionStorage.getItem(`planningIndex`) != null)
    {
      this.planningIndex = window.sessionStorage.getItem(`planningIndex`);
      console.log("this.planningIndex = "+this.planningIndex);
    }
    else
    {
      this.changePlaningIndexByEvaluationForm();
      console.log("this.planningIndex = "+this.planningIndex);
    }
  } 

  setPlanningIndex()
  {
    window.sessionStorage.setItem(`planningIndex`, this.planningIndex);
    console.log("this.planningIndex = " + this.planningIndex);
  }


  changePlaningIndexByEvaluationForm()
  {
    var isField = (this.evaluationFuncForm.field.coverage.activate || this.evaluationFuncForm.field.sinr.activate ||
                  this.evaluationFuncForm.field.rsrp.activate || this.evaluationFuncForm.field.throughput.activate);
    var isUe = (this.evaluationFuncForm.ue.coverage.activate || this.evaluationFuncForm.ue.throughputByRsrp.activate);

    var isFieldOld = this.calculateForm.isAverageSinr || this.calculateForm.isCoverage;
    var isOldUe = this.calculateForm.isUeCoverage || this.calculateForm.isUeAvgThroughput;

    console.log(this.evaluationFuncForm);
    
    if (isField)
    {
      this.planningIndex = '1';console.log(this.planningIndex);
      return true;
    }
    else if (isUe)
    {
      this.planningIndex = '2';
      return true;
    }
    else if (isFieldOld)
    {
      this.planningIndex = '1'; console.log(this.planningIndex);
      return true;
    }
    else if (isOldUe)
    {
      this.planningIndex = '2';
      return true;
    }
    else if (this.calculateForm.isSimulation)
    {
      this.planningIndex = '3';
      return true;
    }
    else
    {
      this.planningIndex = '1';console.log(this.planningIndex);console.log(this.planningIndex);
      return false;
    }
  }

  changeAreaFormatToPercent()
  {
    var i = 0;
    if (this.evaluationFuncForm.field.coverage.ratio * 100 <= 100)
      this.evaluationFuncForm.field.coverage.ratio = this.evaluationFuncForm.field.coverage.ratio * 100;
    for(i = 0; i < this.evaluationFuncForm.field.sinr.ratio.length; i++)
    {
      if (this.evaluationFuncForm.field.sinr.ratio[i].areaRatio * 100 <= 100)
        this.evaluationFuncForm.field.sinr.ratio[i].areaRatio = this.evaluationFuncForm.field.sinr.ratio[i].areaRatio * 100;
    }
    for(i = 0; i < this.evaluationFuncForm.field.rsrp.ratio.length; i++)
    {
      if (this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio * 100 <= 100)
        this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio = this.evaluationFuncForm.field.rsrp.ratio[i].areaRatio * 100;
    }
    for(i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++)
    {
      if (this.evaluationFuncForm.field.throughput.ratio[i].areaRatio * 100 <= 100)
        this.evaluationFuncForm.field.throughput.ratio[i].areaRatio = this.evaluationFuncForm.field.throughput.ratio[i].areaRatio * 100;
    }
    if (this.evaluationFuncForm.ue.coverage.ratio < 1)
      this.evaluationFuncForm.ue.coverage.ratio = this.evaluationFuncForm.ue.coverage.ratio * 100;
    for(i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++)
    {
      if (this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio * 100 <= 100)
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio = this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio * 100;
    }
  }

  changeFieldULDL(index, value)
  {
    if( this.fieldThroughputTypeArr[index] === 'UL')
    {
      this.evaluationFuncForm.field.throughput.ratio[index].ULValue = value;
      this.evaluationFuncForm.field.throughput.ratio[index].DLValue = null;
    }
    else if( this.fieldThroughputTypeArr[index] === 'DL')
    {
      this.evaluationFuncForm.field.throughput.ratio[index].ULValue = null;
      this.evaluationFuncForm.field.throughput.ratio[index].DLValue = value;
    }
    //this.setStorageEvaluationFuncForm();
  }

  changeUEULDL(index, value)
  {
    if( this.ueThroughputTypeArr[index] === 'UL')
    {
      this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = value;
      this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = null;
    }
    else if( this.ueThroughputTypeArr[index] === 'DL')
    {
      this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].ULValue = null;
      this.evaluationFuncForm.ue.throughputByRsrp.ratio[index].DLValue = value;
    }
    //this.setStorageEvaluationFuncForm();
  }

  setThroughputTypeAndValue()
  {
    this.fieldThroughputTypeArr = [];
    this.fieldThroughputValueArr = [];
    this.ueThroughputTypeArr = [];
    this.ueThroughputValueArr = [];
    for(var i = 0; i < this.evaluationFuncForm.field.throughput.ratio.length; i++)
    {
      if(this.evaluationFuncForm.field.throughput.ratio[i].ULValue != null && this.evaluationFuncForm.field.throughput.ratio[i].DLValue != null)
      {
        this.fieldThroughputTypeArr.push("UL");
        this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].ULValue);
        this.fieldThroughputTypeArr.push("DL");
        this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].DLValue);

        this.evaluationFuncForm.field.throughput.ratio.splice(i+1, 0, 
          {
            "areaRatio": this.evaluationFuncForm.field.throughput.ratio[i].areaRatio, 
            "compliance": this.evaluationFuncForm.field.throughput.ratio[i].compliance,
            "ULValue":  null,
            "DLValue":  this.evaluationFuncForm.field.throughput.ratio[i].DLValue
          }
        );
        this.evaluationFuncForm.field.throughput.ratio[i].DLValue = null;
      }
      else if(this.evaluationFuncForm.field.throughput.ratio[i].ULValue != null)
      {
        this.fieldThroughputTypeArr.push("UL");
        this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].ULValue);
      }
      else if(this.evaluationFuncForm.field.throughput.ratio[i].DLValue != null)
      {
        this.fieldThroughputTypeArr.push("DL");
        this.fieldThroughputValueArr.push(this.evaluationFuncForm.field.throughput.ratio[i].DLValue);
      }
      else
      {
        this.fieldThroughputTypeArr.push("UL");
        this.fieldThroughputValueArr.push(0);
      }
    }
    for(var i = 0; i < this.evaluationFuncForm.ue.throughputByRsrp.ratio.length; i++)
    {
      if(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue != null && this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue != null)
      {
        this.ueThroughputTypeArr.push("UL");
        this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue);
        this.ueThroughputTypeArr.push("DL");
        this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue);

        this.evaluationFuncForm.ue.throughputByRsrp.ratio.splice(i+1, 0, 
          {
            "countRatio": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].countRatio, 
            "compliance": this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].compliance,
            "ULValue":  null,
            "DLValue":  this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue
          }
        );
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue = null;
      }
      else if(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue != null)
      {
        this.ueThroughputTypeArr.push("UL");
        this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].ULValue);
      }
      else if(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue != null)
      {
        this.ueThroughputTypeArr.push("DL");
        this.ueThroughputValueArr.push(this.evaluationFuncForm.ue.throughputByRsrp.ratio[i].DLValue);
      }
      else
      {
        this.ueThroughputTypeArr.push("UL");
        this.ueThroughputValueArr.push(0);
      }
    }
  }

  oldFormatEvaluation()
  {
    if(this.evaluationFuncForm == null || 
      (this.evaluationFuncForm.field.coverage.activate == false && 
       this.evaluationFuncForm.field.sinr.activate == false && 
       this.evaluationFuncForm.field.rsrp.activate == false && 
       this.evaluationFuncForm.field.throughput.activate == false && 
       this.evaluationFuncForm.ue.coverage.activate == false && 
       this.evaluationFuncForm.ue.throughputByRsrp.activate == false))
       {
        this.evaluationFuncForm.field.coverage.activate = this.calculateForm.isCoverage;
        this.evaluationFuncForm.ue.coverage.activate = this.calculateForm.isUeCoverage;
        this.evaluationFuncForm.ue.coverage.ratio = this.defaultArea / 100;
        this.evaluationFuncForm.ue.throughputByRsrp.activate = this.calculateForm.isUeAvgThroughput;
        if(this.evaluationFuncForm.ue.throughputByRsrp.activate && this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
          this.addUEThroughput();
        console.log(this.evaluationFuncForm);
       }
  }

  evaluationOK()
  {
    this.setStorageEvaluationFuncForm();
    this.matDialog.closeAll();
  }

  evaluationCancel()
  {
    this.getStorageEvaluationFuncForm();
    this.matDialog.closeAll();
  }

  async EditAntennaOk()
  {
    var isWarn = this.checkEditAntennaForm();
    var msg = '';
    var type = 'error';

    if (!isWarn)
    {

      let url = `${this.authService.API_URL}/updateAntenna/${this.authService.userToken}`;


      this.authService.spinnerUploadData();

      if (this.editAntenna.file != null && this.editAntenna.file != '')
        this.editAntenna.sha256sum = await this.hashfile(this.editAntenna.file).then(res => res.toString());

      let formData = new FormData();
      formData.append('file', this.editAntenna.file);
      formData.append('name', this.editAntenna.name);
      formData.append('sha256sum', this.editAntenna.sha256sum);
      formData.append('property', this.editAntenna.property);
      formData.append('type', this.editAntenna.type);
      formData.append('band', JSON.stringify(this.editAntenna.band));
      formData.append('port', JSON.stringify(this.editAntenna.port));
      formData.append('model', this.editAntenna.model);
      formData.append('manufactor', this.editAntenna.manufactor);
      formData.append('antennaID', JSON.stringify(this.editAntenna.antennaID));      

      try
      {
        let status = await this.postRequest(url, formData);

        console.log(status);



        if (status['statusCode'] == '200')
        {
          type = 'success';
          msg = this.translateService.instant('antenna.edit.success');
          this.closeSecondLayer();
        }
        else
        {
          msg = this.translateService.instant('antenna.edit.failed');
        }

      }
      catch (error)
      {
        msg = this.uploadAntRawdataErrorMsg(false, error);
      }


      this.msgDialogConfig.data = {
        type: type,
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

      this.authService.spinnerHide();
      this.getAntenna();
      
    }
    else
    {
      this.thirdLayerDialogRef = this.matDialog.open(this.AntennaWarnMsgModalTable);
    }

  }

  EditAntennaCancel()
  {
    this.getAntenna();
    this.closeSecondLayer();
  }

  async AddAntennaOk()
  {
    var isWarn = this.checkAddAntennaForm();
    var msg = '';
    var type = 'error';

    if (!isWarn)
    {

      let url = `${this.authService.API_URL}/uploadAntenna/${this.authService.userToken}`;

      this.authService.spinnerUploadData();
      
      this.addAntenna.sha256sum = await this.hashfile(this.addAntenna.file).then(res => res.toString());


      let formData = new FormData();
      formData.append('file', this.addAntenna.file);
      formData.append('name', this.addAntenna.name);
      formData.append('sha256sum', this.addAntenna.sha256sum);
      formData.append('property', this.addAntenna.property);
      formData.append('type', this.addAntenna.type);
      formData.append('band', JSON.stringify(this.addAntenna.band));
      formData.append('port', JSON.stringify(this.addAntenna.port));
      formData.append('model', this.addAntenna.model);
      formData.append('manufactor', this.addAntenna.manufactor);
      formData.append('antennaID', JSON.stringify(this.addAntenna.antennaID));


      try
      {
        let status = await this.postRequest(url, formData);

        console.log(status);



        if (status['statusCode'] == '200')
        {
          type = 'success';
          msg = this.translateService.instant('antenna.add.success');
          this.customizedAntennaPage = Math.floor(this.customizedAntennaList.length / this.maxAntRowInPage + 1);
          this.closeSecondLayer();
        }
        else
        {
          msg = this.translateService.instant('antenna.add.failed');
        }
        this.addAntenna = {
          antennaID: 1,
          name: "",
          type: "Directional",
          band: [],
          port: 1,
          model: "",
          manufactor: "",
          file: null,
          fileName: "",
          sha256sum: "",
          property: "customized"
        };
      }
      catch (error)
      {
        msg = this.uploadAntRawdataErrorMsg(true, error);

        if (error.error['statusCode'] == '422_005')
        {
          this.addAntenna.band = [];
        }
        else if (error.error['statusCode'] == '422_006')
        {
          this.addAntenna.port = 1;
        }
        else if (error.error['statusCode'] == '422_007')
        {
          this.addAntenna.band = [];
          this.addAntenna.port = 1;
        }
      }


      this.msgDialogConfig.data = {
        type: type,
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);

      this.authService.spinnerHide();
      this.getAntenna();


    }
    else
    {
      this.thirdLayerDialogRef = this.matDialog.open(this.AntennaWarnMsgModalTable);
    }
  }

  AddAntennaCancel()
  {
    this.closeSecondLayer();
    this.addAntenna = {
      antennaID: 1,
      name: "",
      type: "Directional",
      band: [],
      port: 1,
      model: "",
      manufactor: "",
      file: null,
      fileName: "",
      sha256sum: "",
      property: "customized"
    };
  }

  async delAntenna(index)
  {
    let isAntInUse = false;

    for (let bs = 0; bs < this.defaultBSList.length; bs++)
    {
      if (this.bsListRfParam[this.defaultBSList[bs]].AntennaId == this.customizedAntennaList[index].antennaID)
      {
        isAntInUse = true;
      }
    }

    if (isAntInUse)
    {
      let msg = this.translateService.instant('antenna.inuse.cant.delete');
      this.msgDialogConfig.data = {
        type: 'error',
        infoMessage: msg
      };
      this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      return;
    }


    var msg = `${this.translateService.instant('confirm.delete')} ${this.customizedAntennaList[index].name}?`;
    this.msgDialogConfig.data = {
      infoMessage: msg
    };
    const dialogRef = this.matDialog.open(ConfirmDailogComponent, this.msgDialogConfig);

    dialogRef.componentInstance.onOK.subscribe(async () => {
      // done

      let url = `${this.authService.API_URL}/deleteAntenna/${this.customizedAntennaList[index].antennaID}/${this.authService.userToken}`;
      
      this.http.get(url).subscribe(
        res =>
        {
          let result = res;
          console.log(result);
          this.getAntenna();
        },
        err =>
        {
          this.msgDialogConfig.data = {
            type: 'error',
            infoMessage: this.translateService.instant('antenna.delete.error')
          };
          this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
        }
      );

      dialogRef.close();
      
    });
  }

  checkIfAntNameExist(name)
  {
    for (let ant of this.allAntennaList)
    {
      if (name == ant.name)
      {
        return true;
      }
    }
    return false;
  }

  checkAddAntennaForm()
  {
    let reg_ch = new RegExp('[\u4E00-\u9FFF]+');
    let reg_tch = new RegExp('[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+');
    let reg_en = new RegExp('[\A-Za-z]+');
    let reg_num = new RegExp('[\0-9]+');
    let reg_spc = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~《》~！@#￥……&\*（）——\|{}【】‘；：”“'。，、?]/;

    var isWarn = false;
    let isNameIllegal = ((reg_spc.test(this.addAntenna.name) ||
      reg_tch.test(this.addAntenna.name)) ||
      (!(reg_ch.test(this.addAntenna.name)) && !(reg_en.test(this.addAntenna.name)) && !(reg_num.test(this.addAntenna.name))));
    let isManufactorNameIllegal = ((reg_spc.test(this.addAntenna.manufactor) ||
      reg_tch.test(this.addAntenna.manufactor)) ||
      (!(reg_ch.test(this.addAntenna.manufactor)) && !(reg_en.test(this.addAntenna.manufactor)) && !(reg_num.test(this.addAntenna.manufactor))));
    let isModelNameIllegal = ((reg_spc.test(this.addAntenna.model) ||
      reg_tch.test(this.addAntenna.model)) ||
      (!(reg_ch.test(this.addAntenna.model)) && !(reg_en.test(this.addAntenna.model)) && !(reg_num.test(this.addAntenna.model))));

    if (this.addAntenna.name == null || this.addAntenna.name == '' || this.addAntenna.name.length > 16 || isNameIllegal) {
      this.antennaWarnMsg.name = this.translateService.instant('antenna.name.fault');
      isWarn = true;
    }
    else if (this.checkIfAntNameExist(this.addAntenna.name ))
    {
      this.antennaWarnMsg.name = this.translateService.instant('antenna.name.same');
      isWarn = true;
    }
    else
    {
      this.antennaWarnMsg.name = "";
    }
    if (this.addAntenna.band.length != 2 || !Number.isInteger(this.addAntenna.band[1]) || !Number.isInteger(this.addAntenna.band[0]) || 
      (this.addAntenna.band.length == 2 && this.addAntenna.band[1] < this.addAntenna.band[0]) || this.addAntenna.band[0] < 0 || this.addAntenna.band[1] < 0)
    {
      this.antennaWarnMsg.band = this.translateService.instant('antenna.band.fault');
      isWarn = true;
    }
    else {
      this.antennaWarnMsg.band = "";
    }
    if (!Number.isInteger(this.addAntenna.port) || this.addAntenna.port <= 0)
    {
      this.antennaWarnMsg.port = this.translateService.instant('antenna.port.fault');
      isWarn = true;
    }
    else {
      this.antennaWarnMsg.port = "";
    }
    if (this.addAntenna.manufactor == null || this.addAntenna.manufactor == '' ||
      this.addAntenna.manufactor.length > 16 || isManufactorNameIllegal)
    {
      this.antennaWarnMsg.manufactor = this.translateService.instant('antenna.manufactor.fault');
      isWarn = true;
    }
    else {
      this.antennaWarnMsg.manufactor = "";
    }
    if (this.addAntenna.model == null || this.addAntenna.model == '' || this.addAntenna.model.length > 16 || isModelNameIllegal)
    {
      this.antennaWarnMsg.model = this.translateService.instant('antenna.model.fault');
      isWarn = true;
    }
    else {
      this.antennaWarnMsg.model = "";
    }
    if (this.addAntenna.file == null)
    {
      this.antennaWarnMsg.file = this.translateService.instant('antenna.rawdata.empty');
      isWarn = true;
    }
    else {
      this.antennaWarnMsg.file = "";
    }
    

    return isWarn;
  }

  checkEditAntennaForm()
  {
    let reg_ch = new RegExp('[\u4E00-\u9FFF]+');
    let reg_tch = new RegExp('[\u3105-\u3129\u02CA\u02C7\u02CB\u02D9]+');
    let reg_en = new RegExp('[\A-Za-z]+');
    let reg_num = new RegExp('[\0-9]+');
    let reg_spc = /[ `!@#$%^&*()+\=\[\]{};':"\\|,<>\/?~《》~！@#￥……&\*（）——\|{}【】‘；：”“'。，、?]/;

    var isWarn = false;
    let isNameIllegal = ((reg_spc.test(this.editAntenna.name) ||
      reg_tch.test(this.editAntenna.name)) ||
      (!(reg_ch.test(this.editAntenna.name)) && !(reg_en.test(this.editAntenna.name)) && !(reg_num.test(this.editAntenna.name))));
    let isManufactorNameIllegal = ((reg_spc.test(this.editAntenna.manufactor) ||
      reg_tch.test(this.editAntenna.manufactor)) ||
      (!(reg_ch.test(this.editAntenna.manufactor)) && !(reg_en.test(this.editAntenna.manufactor)) && !(reg_num.test(this.editAntenna.manufactor))));
    let isModelNameIllegal = ((reg_spc.test(this.editAntenna.model) ||
      reg_tch.test(this.editAntenna.model)) ||
      (!(reg_ch.test(this.editAntenna.model)) && !(reg_en.test(this.editAntenna.model)) && !(reg_num.test(this.editAntenna.model))));

    if (this.editAntenna.name == null || this.editAntenna.name == '' || this.editAntenna.name.length > 16
      || isNameIllegal)
    {
      this.antennaWarnMsg.name = this.translateService.instant('antenna.name.fault');
      isWarn = true;
    }
    else if (this.checkIfAntNameExist(this.addAntenna.name))
    {
      this.antennaWarnMsg.name = this.translateService.instant('antenna.name.same');
      isWarn = true;
    }
    else
    {
      this.antennaWarnMsg.name = "";
    }
    if (this.editAntenna.band.length != 2 || !Number.isInteger(this.editAntenna.band[1]) || !Number.isInteger(this.editAntenna.band[0]) ||
      (this.editAntenna.band.length == 2 && this.editAntenna.band[1] < this.editAntenna.band[0]))
    {
      this.antennaWarnMsg.band = this.translateService.instant('antenna.band.fault');
      isWarn = true;
    }
    else
    {
      this.antennaWarnMsg.band = "";
    }
    if (!Number.isInteger(this.editAntenna.port) || this.editAntenna.port <= 0)
    {
      this.antennaWarnMsg.port = this.translateService.instant('antenna.port.fault');
      isWarn = true;
    }
    else
    {
      this.antennaWarnMsg.port = "";
    }
    if (this.editAntenna.manufactor == null || this.editAntenna.manufactor == '' ||
      this.editAntenna.manufactor.length > 16 || isManufactorNameIllegal)
    {
      this.antennaWarnMsg.manufactor = this.translateService.instant('antenna.manufactor.fault');
      isWarn = true;
    }
    else
    {
      this.antennaWarnMsg.manufactor = "";
    }
    if (this.editAntenna.model == null || this.editAntenna.model == '' || this.editAntenna.model.length > 16 || isModelNameIllegal)
    {
      this.antennaWarnMsg.model = this.translateService.instant('antenna.model.fault');
      isWarn = true;
    }
    else
    {
      this.antennaWarnMsg.model = "";
    }
    
    return isWarn;
  }

  

  changeOldAntToNew()
  {
    this.allAntennaList = [];
    for (var ant = 0; ant < this.antennaList.length; ant++)
    {
      this.allAntennaList.push
      (
        {
            antennaID: this.antennaList[ant].antennaID,
            name: this.antennaList[ant].antennaName,
            type: this.antennaList[ant].antennaType,
            band: this.antennaList[ant].band,
            availableFrequency: this.antennaList[ant].availableFrequency,
            port: this.antennaList[ant].availableFrequency[0].ports.length,
            model: this.antennaList[ant].model,
            manufactor: this.antennaList[ant].manufactor,
            fileName: `${this.antennaList[ant].antennaName}.xlsx`,
            property: this.antennaList[ant].property
        }
      );
    }
  }
  

  classifyAntenna()
  {
    this.defaultAntennaList = [];
    this.customizedAntennaList = [];
    for (var ant = 0; ant < this.allAntennaList.length; ant++)
    {
      if (this.allAntennaList[ant].property == 'default')
      {
        console.log(this.allAntennaList[ant]);
        this.defaultAntennaList.push(this.allAntennaList[ant]);
      }
      else 
      {
        console.log(this.allAntennaList[ant]);
        this.customizedAntennaList.push(this.allAntennaList[ant]);
      }
    }
  }

  filterAntennaByProperty(property)
  {
    //切換天線種類時，頁數應回到第一頁
    this.customizedAntennaPage = 1;
    console.log(property);
    this.filterAntennaList = [];
    for (var ant = 0; ant < this.allAntennaList.length; ant++)
    {
      if (this.allAntennaList[ant].property == property)
      {
        console.log(this.allAntennaList[ant]);
        this.filterAntennaList.push(this.allAntennaList[ant]);
      }
    }
    
    console.log(this.filterAntennaList);
  }

  getAntenna()
  {
    let url = `${this.authService.API_URL}/getAntenna/${this.authService.userToken}`;
    this.http.get(url).subscribe(
      res =>
      {
        let result = res;

        const promise = new Promise((resolve, reject) =>
        {
          this.antennaList = Object.values(result);
          resolve();
        });
        promise.then(() => new Promise((resolve, reject) =>
        {
          this.changeOldAntToNew();
          resolve();
        }).then(() => new Promise((resolve, reject) =>
        {
          this.classifyAntenna();
          return true;
        })));

      },
      err =>
      {
        this.msgDialogConfig.data = {
          type: 'error',
          infoMessage: this.translateService.instant('antenna.get.error')
        };
        this.matDialog.open(MsgDialogComponent, this.msgDialogConfig);
      }
    );
    return false;
  }

  changeAntPage(index, isDefault)
  {
    if (isDefault == 'default')
    {
      this.defaultAntennaPage = index;
    }
    else
      this.customizedAntennaPage = index;
  }

  setEditAntStorage()
  {
    window.sessionStorage.setItem(`editAntenna`, JSON.stringify(this.editAntenna));
  }

  getEditAntStorage()
  {
    this.editAntenna = JSON.parse(window.sessionStorage.getItem(`editAntenna`));
  }

  checkNullAngle(pattern)     //暫時不使用
  {
    let MIN_ANGLE = 0;
    let MAX_ANGLE = 359;
    var hori = pattern[0][1];
    var vert = pattern[0][2];
    var angle = pattern[0][0];
    var len = pattern.length;
    var changeAngle = 0;
    var changeTimes = 0;
    var retPattern = [];

    if (len >= 2)
      changeAngle = Math.round((angle + pattern[1][0]) / 2);
    else
      changeAngle = MAX_ANGLE+1;

    for (var i = MIN_ANGLE; i <= MAX_ANGLE; i++)
    {
      if (i <= changeAngle)
      {
        retPattern.push([i, hori, vert, pattern[i][3], pattern[i][4]]);
      }

      if (i == changeAngle)
      {
        changeTimes++;
        if (len >= 2 + changeTimes)
        {
          changeAngle = Math.round((pattern[changeTimes][0] + pattern[changeTimes+1][0]) / 2);
        }
        else
          changeAngle = MAX_ANGLE + 1;


        hori = pattern[changeTimes][1];
        vert = pattern[changeTimes][2];
        angle = pattern[changeTimes][0];
      }
    }

    return retPattern;
  }

  getAntennaById(antennaID)
  {
    for (var ant = 0; ant < this.allAntennaList.length; ant++)
    {
      if (antennaID == this.allAntennaList[ant].antennaID)
      {
        return this.allAntennaList[ant];
      }
    }

    //基地台選到A天線，若之後A天線被刪除，則給予第一個天線
    return this.allAntennaList[0];
  }

  getAntennaIndexById(antennaID)
  {
    for (var ant = 0; ant < this.allAntennaList.length; ant++)
    {
      if (antennaID == this.allAntennaList[ant].antennaID)
      {
        return ant;
      }
    }
  }

  getCusAntennaIndexById(antennaID)
  {
    for (var ant = 0; ant < this.customizedAntennaList.length; ant++)
    {
      if (antennaID == this.customizedAntennaList[ant].antennaID)
      {
        return ant;
      }
    }
    
  }

  changeAntennaRawdataPattern()
  {
    var pattern = [];
    console.log(this.checkRawdataAntenna.selectPort);
    console.log(this.checkRawdataAntenna.selectFreq);

    for (var r = 0; r < this.checkRawdataAntenna.rawData.length; r++)
    {
      if (this.checkRawdataAntenna.rawData[r].portName == this.checkRawdataAntenna.selectPort &&
        this.checkRawdataAntenna.rawData[r].frequency == this.checkRawdataAntenna.selectFreq)
      {
        pattern = this.checkRawdataAntenna.rawData[r].pattern;
        this.checkRawdataAntenna.selectPortGain = this.checkRawdataAntenna.rawData[r].portGain;
        break;
      }
    }

    this.drawAntennaRawdata(pattern);
  }

  changedftOmiAntRawdataPattern(value)
  {
    this.dftOmiAntSimulationTxGain = value;
    var pattern = [];

    let MIN_ANGLE = 0;
    let MAX_ANGLE = 360;

    for (var p = MIN_ANGLE; p < MAX_ANGLE; p++)
    {
      pattern.push([p, this.dftOmiAntSimulationTxGain, this.dftOmiAntSimulationTxGain]);     
    }

    this.drawAntennaRawdata(pattern);
  }

  drawAntennaRawdata(pattern)
  {
    var theta = [];
    var phi = [];
    let THETA_RADAR_ID = 'thetaRawdata';
    let PHI_RADAR_ID = 'phiRawdata';
    let MAX_ANGLE = 360;


    theta.push(Number(pattern[0][1]));
    phi.push(Number(pattern[0][2]));
    for (var k = 1; k < MAX_ANGLE; k++)
    {
      //為符合套件繪圖方向(套件不能改順逆時針繪圖)，除零度外首尾對調
      theta.push(Number(pattern[MAX_ANGLE - k][1]));
      phi.push(Number(pattern[MAX_ANGLE - k][2]));
    }

    this.drawRadarByEcharts(theta, THETA_RADAR_ID);
    this.drawRadarByEcharts(phi, PHI_RADAR_ID);

  }

  drawRadarByEcharts(gainArray, radarID)
  {
    var MIN_ANGLE = 0;
    var MAX_ANGLE = 360;
    var el = echarts.init(document.getElementById(radarID) as HTMLDivElement);
    const dataRange = [];                         //雷達圖每個方向的資料範圍

    for (var v = MIN_ANGLE; v < MAX_ANGLE; v++)
    {
      if (v == 0)
      {
        dataRange.push(
          {
            name: `${v}°`,
            max: Math.max.apply(Math, gainArray),
            min: Math.min.apply(Math, gainArray),
            axisLabel: {
              show: true,
              formatter: function (v)
              {
                return Number(v).toFixed(2);
              },
              color: '#000000',   //black
              z: 2
            },
            axisLine: { show: true },
            fontSize: 15,
            color: '#0541f5',   //blue
          });
      }
      else if (v % 90 == 0)//在30、60...度角顯示軸線、label，順逆對調
      {
        dataRange.push(
          {
            name: `${Math.abs(v-360)}°`,
            max: Math.max.apply(Math, gainArray),
            min: Math.min.apply(Math, gainArray),
            axisLine:
            {
              show: true,
              color: '#000000'
            },
            fontSize: 15,
            color: '#0541f5',   //blue
          });
      }
      else if (v % 30 == 0)//在10、20、...度角顯示軸線
      {
        dataRange.push(
          {
            name: ``,
            max: Math.max.apply(Math, gainArray),
            min: Math.min.apply(Math, gainArray),
            axisLine:
            {
              show: true,
              color: '#cccccc'
            }
          });
      }
      else
      {
        dataRange.push(
          {
            name: '',
            max: Math.max.apply(Math, gainArray),
            min: Math.min.apply(Math, gainArray),
            axisLine: { show: false }
          });
      }
    }    

    var option: any ={

      //legend: {
      //  right: 10,
      //  bottom: 5,
      //  data: [this.translateService.instant('antenna.gain')],
      //  itemGap: 20,
      //  textStyle: {
      //    color: '#000',
      //    fontSize: 14
      //  },
      //  icon: 'none'                            //取消顯示圖標
      //},
      radar: {
        indicator: dataRange, //雷達各方向的範圍
        shape: 'circle',      //圓形雷達圖，多邊形為polygon
        splitNumber: 5,
        splitArea: {
          show: true,
          areaStyle: {          //背景            
            color: ['rgba(255,255,255,1)'],   //white
          }
        },

        splitLine: {
          lineStyle: {          //圈圈分隔線      
            color: '#ECEDEF',              //gray 
            width: 1,
          },
        },
        axisLine: { show: false },
      },
      
      series: [
        {
          type: 'radar', 
          label:
          {
            show: false, //不顯示每個緯度的數值(360個太多)
          },
          symbol: "none",
          itemStyle: {
            color: 'rgba(32, 183, 234, 0.7)'
          },
          data: [
            {
              name: this.translateService.instant('antenna.gain'),
              value: gainArray,
              lineStyle:
              {
                normal:
                {
                  color: 'rgba(32, 183, 234, 0.7)'
                }
              },
              areaStyle:
              {
                normal:
                {
                  color: 'rgba(0,0,0,0)'
                }
              }
            },
          ]
        }
      ],
    };
    el.setOption(option);
  }

  changeAntennaFreqAndPortCountByFile(antenna)
  {
    var isChange = false;
    var freqList = [];
    var portList = [];
    var isSame = false;
    var cell = '';
    var changePort = 0;
    var changeBand = [];

    let PORT_NAME_LABEL_CELL = 'A1';
    let FREQ_LABEL_CELL = 'A2';
    let PORT_NAME_CELL = 'B1';
    let FREQ_CELL = 'B2';

    if (antenna.file != null)
    {
      const promise = new Promise((resolve, reject) =>
      {
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) =>
        {
          const bstr: string = e.target.result;

          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
          var ws: XLSX.WorkSheet = wb.Sheets[wb.SheetNames[0]]; // get original worksheet

          var sh = 0, p = 0, f = 0;

          for (sh = 0; sh < wb.SheetNames.length; sh++)
          {
            ws = wb.Sheets[wb.SheetNames[sh]];

            isSame = false;
            cell = ws[PORT_NAME_CELL].v;
            console.log(cell);
            for (p = 0; p < portList.length; p++)
            {
              if (portList[p] == cell)
              {
                isSame = true;
                break;
              }
            }
            if (!isSame)
              portList.push(cell);

            isSame = false;
            cell = ws[FREQ_CELL].v;
            console.log(cell);
            for (f = 0; f < freqList.length; f++)
            {
              if (freqList[f] == cell)
              {
                isSame = true;
                break;
              }
            }
            if (!isSame)
              freqList.push(Number(cell));
            
          }
          console.log('read over');
          resolve();
        };
        console.log('reader start');
        reader.readAsBinaryString(antenna.file);
        console.log('reader over');
      });
      promise.then(() => new Promise((resolve, reject) =>
      {
        if (portList.length != 0 && freqList.length != 0)
        {
          changePort = JSON.parse(JSON.stringify(antenna.port));
          if (antenna.port != portList.length)
          {
            isChange = true;
            changePort = portList.length;
          }
          
          if (antenna.band[0] == null || antenna.band[0] == '')
            changeBand[0] = Number.MAX_SAFE_INTEGER;
          else
            changeBand[0] = antenna.band[0];
          if (antenna.band[1] == null || antenna.band[1] == '')
            changeBand[1] = 0;
          else
            changeBand[1] = antenna.band[1];
          

          if (changeBand[0] > Math.min.apply(Math, freqList))
          {
            isChange = true;
            changeBand[0] = Math.min.apply(Math, freqList);
          }
          
          if (changeBand[1] < Math.max.apply(Math, freqList))
          {
            isChange = true;
            changeBand[1] = Math.max.apply(Math, freqList);   
          }       
        }

        resolve(isChange);
      }).then((result) => new Promise((resolve, reject) =>
      {
        if (result)
        {
          var msg = this.translateService.instant('auto.modify.port.freq');
          this.msgDialogConfig.data = {
            infoMessage: msg
          };

          const dialogRef = this.matDialog.open(ConfirmDailogComponent, this.msgDialogConfig);

          dialogRef.componentInstance.onOK.subscribe(() =>
          {
            antenna.port = changePort;
            antenna.band = changeBand;
          });
        }
      })));

    }
  }

  closeFirstLayer()
  {
    if (this.firstLayerDialogRef != null)
      this.firstLayerDialogRef.close();
  }

  closeSecondLayer()
  {
    if (this.secondLayerDialogRef != null)
      this.secondLayerDialogRef.close();
  }

  closeThirdLayer()
  {
    if (this.thirdLayerDialogRef != null)
      this.thirdLayerDialogRef.close();
  }

  uploadAntRawdataErrorMsg(isAdd, error)
  {
    var msg = '';

    let PORT_NAME_CELL = 'B1';
    let FREQ_CELL = 'B2';
    let GAIN_CELL = 'B3';

    if (error.error['statusCode'] == '422_001')
    {
      msg = this.translateService.instant('antenna.file.error.empty');
    }
    else if (error.error['statusCode'] == '422_002')
    {
      if (error.error['errorLocation'].cell == PORT_NAME_CELL)
      {
        msg = this.translateService.instant('antenna.file.error.port.empty')
          .replace('{0}', error.error['errorLocation'].page)
          .replace('{1}', error.error['errorLocation'].cell);
      }
      else if (error.error['errorLocation'].cell == FREQ_CELL)
      {
        msg = this.translateService.instant('antenna.file.error.freq.fault')
          .replace('{0}', error.error['errorLocation'].page)
          .replace('{1}', error.error['errorLocation'].cell);
      }
      else if (error.error['errorLocation'].cell == GAIN_CELL)
      {
        msg = this.translateService.instant('antenna.file.error.gain.fault')
          .replace('{0}', error.error['errorLocation'].page)
          .replace('{1}', error.error['errorLocation'].cell);
      }
      else
      {
        msg = this.translateService.instant('antenna.add.failed');
      }
    }
    else if (error.error['statusCode'] == '422_003')
    {
      msg = this.translateService.instant('antenna.file.error.angle.gain.fault')
        .replace('{0}', error.error['errorLocation'].page)
        .replace('{1}', error.error['errorLocation'].cell);
    }
    else if (error.error['statusCode'] == '422_004')
    {
      msg = this.translateService.instant('antenna.file.error.no.gain')
        .replace('{0}', error.error['errorLocation'].page);
    }
    else if (error.error['statusCode'] == '422_005')
    {
      msg = this.translateService.instant('antenna.file.error.band.out.range')
        .replace('{0}', error.error['errorLocation'].page)
        .replace('{1}', error.error['errorLocation'].cell);
    }
    else if (error.error['statusCode'] == '422_006')
    {
      msg = this.translateService.instant('antenna.file.error.port.no.equal');
    }
    else if (error.error['statusCode'] == '422_007')
    {
      msg = this.translateService.instant('antenna.file.error.port.count.fault');
    }
    else if (error.error['statusCode'] == '400_010')      //File 與 SHA256碼不和
    {
      msg = this.translateService.instant('antenna.file.sha256.error');
    }
    else if (error.error['statusCode'] == '401')          //登入過期
    {
      msg = this.translateService.instant('antenna.api.session.fault');
    }
    else if (error.error['statusCode'] == '415')          //非excel
    {
      msg = this.translateService.instant('antenna.file.error.not.excel');
    }
    else if (error.error['statusCode'] == '422')          
    {
      msg = this.translateService.instant('antenna.rawdata.empty');
    }
    else if (error.error['statusCode'].startsWith('400'))      //API欄位缺漏，通常不會發生
    {
      msg = this.translateService.instant('antenna.api.error')
        .replace('{0}', error.error['statusCode']);
    }
    else
    {
      if(isAdd)
        msg = this.translateService.instant('antenna.add.failed');
      else
        msg = this.translateService.instant('antenna.edit.failed');
    }
    return msg;
  }

  checkEvaluationFuncForm()
  {
    try
    {
      if (this.evaluationFuncForm.field == null)
      {
        this.evaluationFuncForm.field = new FieldForm();
      }
      if (this.evaluationFuncForm.ue == null)
      {
        this.evaluationFuncForm.ue = new UEForm();
      }

      if (this.evaluationFuncForm.field.sinr == null)
      {
        this.evaluationFuncForm.field.sinr = new SINRForm();
      }
      if (this.evaluationFuncForm.field.rsrp == null)
      {
        this.evaluationFuncForm.field.rsrp = new RSRPForm();
      }
      if (this.evaluationFuncForm.field.throughput == null)
      {
        this.evaluationFuncForm.field.throughput = new ThroughputForm();
      }
      if (this.evaluationFuncForm.field.coverage == null)
      {
        this.evaluationFuncForm.field.coverage = new CoverageForm();
      }
      if (this.evaluationFuncForm.ue.coverage == null)
      {
        this.evaluationFuncForm.ue.coverage = new CoverageForm();
      }
      if (this.evaluationFuncForm.ue.throughputByRsrp == null)
      {
        this.evaluationFuncForm.ue.throughputByRsrp = new UEThroughputForm();
      }
      if (this.evaluationFuncForm.field.sinr.ratio == null || this.evaluationFuncForm.field.sinr.ratio.length == 0 ||
        this.evaluationFuncForm.field.sinr.ratio[0].compliance == null ||
        this.evaluationFuncForm.field.sinr.ratio[0].areaRatio == null ||
        this.evaluationFuncForm.field.sinr.ratio[0].value == null)
      {
        this.evaluationFuncForm.field.sinr.ratio.push
          (
          {
            compliance: "moreThan",
            areaRatio: this.defaultArea,
            value: this.defaultSINRSetting
          }
          )
      }
      if (this.evaluationFuncForm.field.rsrp.ratio == null || this.evaluationFuncForm.field.rsrp.ratio.length == 0 ||
        this.evaluationFuncForm.field.rsrp.ratio[0].compliance == null ||
        this.evaluationFuncForm.field.rsrp.ratio[0].areaRatio == null ||
        this.evaluationFuncForm.field.rsrp.ratio[0].areaRatio == null)
      {
        this.evaluationFuncForm.field.rsrp.ratio.push
          (
          {
            compliance: "moreThan",
            areaRatio: this.defaultArea,
            value: this.defaultRSRPSetting
          }
          )
      }
      if (this.evaluationFuncForm.field.throughput.ratio == null || this.evaluationFuncForm.field.throughput.ratio.length == 0 ||
        this.evaluationFuncForm.field.throughput.ratio[0].compliance == null ||
        this.evaluationFuncForm.field.throughput.ratio[0].areaRatio == null ||
        (this.evaluationFuncForm.field.throughput.ratio[0].ULValue == null &&
        this.evaluationFuncForm.field.throughput.ratio[0].DLValue == null))
      {
        this.evaluationFuncForm.field.throughput.ratio.push
          (
          {
              compliance: "moreThan",
              areaRatio: this.defaultArea,
              ULValue: this.defaultULThroughputSetting,
              DLValue: this.defaultDLThroughputSetting
          }
          )
      }

      if (this.evaluationFuncForm.ue.throughputByRsrp.ratio == null || this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0 ||
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[0].compliance == null ||
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[0].countRatio == null ||
        (this.evaluationFuncForm.ue.throughputByRsrp.ratio[0].ULValue == null &&
        this.evaluationFuncForm.ue.throughputByRsrp.ratio[0].DLValue == null))
      {
        this.evaluationFuncForm.ue.throughputByRsrp.ratio.push
          (
          {
            compliance: "moreThan",
            countRatio: this.defaultArea,
            ULValue: this.defaultUEULThroughputSetting,
            DLValue: this.defaultUEDLThroughputSetting
          }
          )
      }
    }
    catch
    {
      this.evaluationFuncForm = new EvaluationFuncForm();
      if (this.evaluationFuncForm.field.sinr.ratio.length == 0)
        this.addSINR();
      if (this.evaluationFuncForm.field.rsrp.ratio.length == 0)
        this.addRSRP();
      if (this.evaluationFuncForm.field.throughput.ratio.length == 0)
        this.addThroughput();
      if (this.evaluationFuncForm.ue.throughputByRsrp.ratio.length == 0)
        this.addUEThroughput();
    }


  }

  getAntIndexFromSvgAntNum()
  {
    let index = parseInt(this.svgAntNum.substring(this.svgAntNum.indexOf('.') + 1)) - 2;
    if (index < 0)
      index = 0;
    return index;
  }

  getAntIndexFromAntSvgId(bsSvgId, antSvgId)
  {
    let index = 1;

    for (let a = 0; a < this.bsListRfParam[bsSvgId].antenna.length; a++)
    {
      if (antSvgId == this.bsListRfParam[bsSvgId].antenna[a].svgId)
        index = a + 2;      //找到符合的，代表為場域上天線(.2+)；否則為基站天線(.1)
    }

    return index;
  }

  getBsIndexFromBsSvgId(bsSvgId)
  {
    let index = 0;

    for (index = 0; index < this.defaultBSList.length; index++)
    {
      if (bsSvgId == this.defaultBSList[index])
        return index+1;
    }

    return 0;
  }
  

  closeRfDialog(isOk, svgId)
  {
    if (isOk)
      this.saveBsListRfParam(svgId);
    else
    {
      this.loadBsListRfParam(svgId);
    }

    this.closeFirstLayer();
  }
  

  saveBsListRfParam(svgId)
  {
    sessionStorage.setItem('bsListRfParam', JSON.stringify(this.bsListRfParam));
    let position = [this.dragObject[svgId].x, this.dragObject[svgId].y, this.dragObject[svgId].z];
    sessionStorage.setItem('position', JSON.stringify(position));
  }
  

  loadBsListRfParam(svgId)
  {
    if (sessionStorage.getItem('bsListRfParam') != null)
    {
      this.bsListRfParam = JSON.parse(sessionStorage.getItem('bsListRfParam'));
      sessionStorage.removeItem('bsListRfParam');
    }

    let position = JSON.parse(sessionStorage.getItem('position'));
    if (position != null)
    {
      this.dragObject[svgId].x = Number(position[0]);
      this.dragObject[svgId].y = Number(position[1]);
      this.dragObject[svgId].z = Number(position[2]);
    }

    if (this.selectAntSvgId != '')
      this.setAntSize(this.selectAntSvgId);
    this.setDefaultBsSize(this.selectBsSvgId);

    for (let bs = 0; bs < this.defaultBSList.length; bs++)
    {
      this.setDefaultBsSize(this.defaultBSList[bs]);
      this.moveNumber(this.defaultBSList[bs]);
      for (let a = 0; a < this.bsListRfParam[this.defaultBSList[bs]].antenna.length; a++)
      {
        this.setAntSize(this.bsListRfParam[this.defaultBSList[bs]].antenna[a].svgId);
        this.moveNumber(this.bsListRfParam[this.defaultBSList[bs]].antenna[a].svgId);
      }
    }
  }

  saveParam(obj, param, name)
  {
    sessionStorage.setItem(name, JSON.stringify(obj[param]));
    this.matDialog.closeAll();
  }

  loadParam(obj, param, name)
  {
    if (sessionStorage.getItem(name) != null)
    {
      obj[param] = JSON.parse(sessionStorage.getItem(name));
      sessionStorage.removeItem(name);
    }
    this.matDialog.closeAll();
  }

  checkAntennaExist(antId)
  {
    let isExist = false;
    for (let ant = 0; ant < this.allAntennaList.length; ant++)
    {
      if (antId == this.allAntennaList[ant].antennaID)
      {
        isExist = true;
        break;
      }
    }
    return isExist;
  }
  

  changeOldBsFormatToNew()
  {
    let bs = 0;
    let bsSvgId = '';

    if (this.planningIndex == '3')
      {
      for (bs = 0; bs < this.defaultBSList.length; bs++)
      {
        bsSvgId = this.defaultBSList[bs];
        if (this.bsListRfParam[bsSvgId].isAntennaDefault == null)
        {
          this.bsListRfParam[bsSvgId].isAntennaDefault = this.allAntennaList[0].property;
        }

        if (this.bsListRfParam[bsSvgId].AntennaId == null)
        {
          this.bsListRfParam[bsSvgId].AntennaId = this.allAntennaList[0].antennaID;
        }

        if (this.bsListRfParam[bsSvgId].antennaType == null)
        {
          this.bsListRfParam[bsSvgId].antennaType = this.allAntennaList[0].type;
        }

        if (this.bsListRfParam[bsSvgId].antennaManufactor == null)
        {
          this.bsListRfParam[bsSvgId].antennaManufactor = this.allAntennaList[0].manufactor;
        }

        if (this.bsListRfParam[bsSvgId].ulAntFreq == null)
        {
          this.bsListRfParam[bsSvgId].ulAntFreq = this.allAntennaList[0].availableFrequency[0].frequency;
        }

        if (this.bsListRfParam[bsSvgId].dlAntFreq == null)
        {
          this.bsListRfParam[bsSvgId].dlAntFreq = this.allAntennaList[0].availableFrequency[0].frequency;
        }

        if (this.bsListRfParam[bsSvgId].theta == null)
        {
          this.bsListRfParam[bsSvgId].theta = 0;
        }

        if (this.bsListRfParam[bsSvgId].phi == null)
        {
          this.bsListRfParam[bsSvgId].phi = 0;
        }
      }

    }
  }
}
