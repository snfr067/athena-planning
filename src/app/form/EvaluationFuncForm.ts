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
    throughputByRsrp: UEThroughputForm = new UEThroughputForm();
    coverage: CoverageForm = new CoverageForm();
    throughputByDistance: UEThroughputForm = new UEThroughputForm();
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

export class UEThroughputForm 
{
    activate: boolean = false;
    ratio: UEThroughputRatioForm[] = [];    
}

export class CoverageForm 
{
    activate: boolean = true;
	ratio: number = 95;
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
    ULValue: any;
    DLValue: any;
}

export class UEThroughputRatioForm 
{
    compliance: string = "moreThan";
    countRatio: number = 0.0;
    ULValue: any;
    DLValue: any;
}