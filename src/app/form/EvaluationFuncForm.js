"use strict";
exports.__esModule = true;
var EvaluationFuncForm = /** @class */ (function () {
    function EvaluationFuncForm() {
        this.field = new FieldForm();
        this.ue = new UEForm();
    }
    return EvaluationFuncForm;
}());
exports.EvaluationFuncForm = EvaluationFuncForm;
var FieldForm = /** @class */ (function () {
    function FieldForm() {
        this.sinr = new SINRForm();
        this.rsrp = new RSRPForm();
        this.throughput = new ThroughputForm();
        this.coverage = new CoverageForm();
    }
    return FieldForm;
}());
exports.FieldForm = FieldForm;
var UEForm = /** @class */ (function () {
    function UEForm() {
        this.sinr = new SINRForm();
        this.throughput = new ThroughputForm();
        this.throughputByRsrp = new UEThroughputForm();
        this.coverage = new CoverageForm();
        this.throughputByDistance = new UEThroughputForm();
    }
    return UEForm;
}());
exports.UEForm = UEForm;
var SINRForm = /** @class */ (function () {
    function SINRForm() {
        this.activate = false;
        this.ratio = [];
    }
    return SINRForm;
}());
exports.SINRForm = SINRForm;
var RSRPForm = /** @class */ (function () {
    function RSRPForm() {
        this.activate = false;
        this.ratio = [];
    }
    return RSRPForm;
}());
exports.RSRPForm = RSRPForm;
var ThroughputForm = /** @class */ (function () {
    function ThroughputForm() {
        this.activate = false;
        this.ratio = [];
    }
    return ThroughputForm;
}());
exports.ThroughputForm = ThroughputForm;
var UEThroughputForm = /** @class */ (function () {
    function UEThroughputForm() {
        this.activate = false;
        this.ratio = [];
    }
    return UEThroughputForm;
}());
exports.UEThroughputForm = UEThroughputForm;
var CoverageForm = /** @class */ (function () {
    function CoverageForm() {
        this.activate = true;
        this.ratio = 95;
    }
    return CoverageForm;
}());
exports.CoverageForm = CoverageForm;
var RatioForm = /** @class */ (function () {
    function RatioForm() {
        this.compliance = "moreThan";
        this.areaRatio = 0.0;
        this.value = 0;
    }
    return RatioForm;
}());
exports.RatioForm = RatioForm;
var ThroughputRatioForm = /** @class */ (function () {
    function ThroughputRatioForm() {
        this.compliance = "moreThan";
        this.areaRatio = 0.0;
    }
    return ThroughputRatioForm;
}());
exports.ThroughputRatioForm = ThroughputRatioForm;
var UEThroughputRatioForm = /** @class */ (function () {
    function UEThroughputRatioForm() {
        this.compliance = "moreThan";
        this.countRatio = 0.0;
    }
    return UEThroughputRatioForm;
}());
exports.UEThroughputRatioForm = UEThroughputRatioForm;
