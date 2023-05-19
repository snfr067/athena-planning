export class EvaluationFuncForm 
{
    field: FieldForm = new FieldForm();
    ue: UEForm = new UEForm();
}

export class FieldForm 
{
    sinr: SINRForm = new SINRForm();
    rsrp: RSRPForm = new RSRPForm();
    throughput: ThroughputForm = new ThroughputForm();
    coverage: CoverageForm = new CoverageForm();
}

export class UEForm 
{
    sinr: SINRForm = new SINRForm();
    throughput: ThroughputForm = new ThroughputForm();
    throughputByRsrp: ThroughputForm = new ThroughputForm();
    coverage: CoverageForm = new CoverageForm();
    throughputByDistance: CoverageForm = new CoverageForm();
}

export class SINRForm 
{
    activate: boolean = false;
    ratio: RatioForm[] = [];    
}

export class RSRPForm 
{
    activate: boolean = false;
    ratio: RatioForm[] = [];    
}

export class ThroughputForm 
{
    activate: boolean = false;
    ratio: ThroughputRatioForm[] = [];    
}

export class CoverageForm 
{
    activate: boolean = false;
	ratio: number = 0.95;
}

export class RatioForm 
{
    compliance: string = "moreThan";
    areaRatio: number = 0.0;
    value: number = 0;
}

export class ThroughputRatioForm 
{
    compliance: string = "moreThan";
    areaRatio: number = 0.0;
    ULValue: number = 0;
    DLValue: number = 0;
}