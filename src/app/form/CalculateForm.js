"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EvaluationFuncForm_1 = require("./EvaluationFuncForm");
/**
 * 場域form
 */
var CalculateForm = /** @class */ (function () {
    function CalculateForm() {
        this.sessionid = null;
        this.taskName = null;
        this.totalRound = 1;
        this.mapName = '';
        this.mapImage = null;
        this.createTime = null;
        this.crossover = 0.8;
        this.mutation = 0.4;
        this.iteration = 100;
        this.seed = 10;
        this.defaultBs = null;
        this.candidateBs = null;
        this.width = null;
        this.height = null;
        this.altitude = null;
        this.zValue = null;
        this.pathLossModelId = 0;
        this.resolution = 1;
        this.ueCoordinate = null;
        this.ueRxGain = null;
        this.ueRsrp = null;
        this.ueSinr = null;
        this.ueSignallevel = null;
        this.useUeCoordinate = 1;
        this.powerMaxRange = 10;
        this.powerMinRange = 0;
        this.beamMaxId = null;
        this.beamMinId = null;
        this.objectiveIndex = '1';
        // threshold = null;
        this.obstacleInfo = null;
        this.availableNewBsNumber = 1;
        this.addFixedBsNumber = 0;
        //Field related target
        this.isAverageSinr = false;
        this.sinrRatio = 5;
        this.isAvgThroughput = false;
        this.throughputRatio = 5;
        this.isCoverage = false;
        this.coverageRatio = 0.95;
        //UE related target
        this.isUeCoverage = false;
        this.ueCoverageRatio = 0.95;
        this.isUeAvgSinr = false;
        this.ueAvgSinrRatio = 16;
        this.isUeAvgThroughput = false;
        this.ueAvgThroughputRatio = 100;
        this.isUeTpByDistance = false;
        this.ueTpByDistanceRatio = 100;
        this.isUeTpByRsrp = false;
        this.ueTpByRsrpRatio = 100;
        // modelname: string = null;
        // distanceFactor: number = null;
        // contantFactor: number = null;
        this.mctsC = 1.2;
        this.mctsMimo = 2;
        this.mctsTemperature = 300;
        this.mctsTime = 30;
        this.mctsTestTime = 300;
        this.mctsTotalTime = 500;
        this.txPower = null;
        this.beamId = null;
        this.frequencyList = null;
        this.bandwidthList = null;
        this.isSimulation = false;
        //Bandwidth and Frequency
        this.frequency = null;
        this.bandwidth = null;
        // bandwidth: number = null;
        // frequency: number = null;
        //20210527 Add new parameters
        this.duplex = null;
        this.mapProtocol = null;
        this.tddFrameRatio = null;
        this.dlFrequency = null;
        this.ulFrequency = null;
        this.ulMcsTable = null;
        this.dlMcsTable = null;
        this.ulMimoLayer = null;
        this.dlMimoLayer = null;
        this.scalingFactor = null;
        this.scs = null;
        this.dlScs = null;
        this.ulScs = null;
        this.dlBandwidth = null;
        this.ulBandwidth = null;
        this.wifiProtocol = null;
        this.guardInterval = null;
        this.wifiMimo = null;
        this.mimoNumber = null;
        this.bsNoiseFigure = null;
        this.maxConnectionNum = 32;
        this.geographicalNorth = 0;
        this.candidateBsAnt = null;
        this.defaultBsAnt = null;
        this.evaluationFunc = new EvaluationFuncForm_1.EvaluationFuncForm();
        this.isBsNumberOptimization = false;
        // SINRSettingList = [{area: 0, condition: "moreThan", sinr: 0}];
        // RSRPSettingList = [{area: 0, condition: "moreThan", rsrp: 0}];
        // ThroughputSettingList = [{area: 0, ULCondition: "moreThan", ULThroughput: 0, DLCondition: "moreThan", DLThroughput: 0}];
        // UEThroughputSettingList = [{area: 0, ULCondition: "moreThan", ULThroughput: 0, DLCondition: "moreThan", DLThroughput: 0}];
        // constructor(options: {
        //   sessionid?: string,
        //   taskName?: string,
        //   totalRound?: number,
        //   mapName?: string,
        //   mapImage?: string,
        //   // createTime?: string,
        //   crossover?: number,
        //   mutation?: number,
        //   iteration?: number,
        //   seed?: number,
        //   defaultBs?: string,
        //   candidateBs?: string,
        //   width?: number,
        //   height?: number,
        //   altitude?: number,
        //   zValue?: string,
        //   pathLossModelId?: number,
        //   ueCoordinate?: string,
        //   useUeCoordinate?: number,
        //   powerMaxRange?: number,
        //   powerMinRange?: number,
        //   beamMaxId?: number,
        //   beamMinId?: number,
        //   objectiveIndex?: number,
        //   // threshold?: number,
        //   obstacleInfo?: string,
        //   availableNewBsNumber?: number,
        //   addFixedBsNumber?: number,
        //   bandwidth?: number,
        //   Frequency?: number
        // } = {}) {
        //     this.sessionid = options.sessionid;
        //     this.taskName = options.taskName;
        //     this.mapName = options.mapName;
        //     this.mapImage = options.mapImage;
        //     // this.createTime = options.createTime;
        //     this.crossover = options.crossover;
        //     this.mutation = options.mutation;
        //     this.iteration = options.iteration;
        //     this.seed = options.seed;
        //     this.defaultBs = options.defaultBs;
        //     this.candidateBs = options.candidateBs;
        //     this.width = options.width;
        //     this.height = options.height;
        //     this.altitude = options.altitude;
        //     this.zValue = options.zValue;
        //     this.pathLossModelId = options.pathLossModelId;
        //     this.ueCoordinate = options.ueCoordinate;
        //     this.useUeCoordinate = options.useUeCoordinate;
        //     this.powerMaxRange = options.powerMaxRange;
        //     this.powerMinRange = options.powerMinRange;
        //     this.beamMaxId = options.beamMaxId;
        //     this.beamMinId = options.beamMinId;
        //     this.objectiveIndex = options.objectiveIndex;
        //     // this.threshold = options.threshold;
        //     this.obstacleInfo = options.obstacleInfo;
        //     this.availableNewBsNumber = options.availableNewBsNumber;
        //     this.addFixedBsNumber = options.addFixedBsNumber;
        //     this.bandwidth = options.bandwidth;
        //     this.Frequency = options.Frequency;
        // }
    }
    return CalculateForm;
}());
exports.CalculateForm = CalculateForm;
//# sourceMappingURL=CalculateForm.js.map