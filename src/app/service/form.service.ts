import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';

/**
 * Form service
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {

  constructor() { }

  /**
   * 歷史資料回寫CalculateForm
   * @param result 
   */
  setHstToForm(result) {
    // console.log(result);
    const calculateForm = new CalculateForm();
    calculateForm.addFixedBsNumber = result['addfixedbsnumber'];
    calculateForm.availableNewBsNumber = result['availablenewbsnumber'];
    calculateForm.bandwidth = result['bandwidth'];
    calculateForm.beamMaxId = result['beammaxid'];
    calculateForm.beamMinId = result['beamminid'];
    calculateForm.candidateBs = result['candidatebs'];
    calculateForm.crossover = result['crossover'];
    calculateForm.defaultBs = result['defaultbs'];
    // calculateForm.frequency = result['frequency'];
    calculateForm.frequencyList = result['frequency'];
    //Add RF Param
    calculateForm.ulMcsTable = result['ulmcstable'];
    calculateForm.dlMcsTable = result['dlmcstable'];
    calculateForm.ulMimoLayer = result['ulmimolayer'];
    calculateForm.dlMimoLayer = result['dlmimolayer'];
    calculateForm.dlFrequency = result['dlfrequency'];
    calculateForm.ulFrequency = result['ulfrequency'];
    calculateForm.scalingFactor = result['scalingfactor'];
    calculateForm.scs = result['scs'];
    calculateForm.dlScs = result['dlscs'];
    calculateForm.ulScs = result['ulscs'];
    calculateForm.dlBandwidth = result['dlbandwidth'];
    calculateForm.ulBandwidth = result['ulbandwidth'];
    calculateForm.wifiProtocol = result['wifiprotocol'];
    calculateForm.guardInterval = result['guardinterval'];
    calculateForm.wifiMimo = result['wifimimo'];
    calculateForm.mimoNumber = result['mimonumber'];
    calculateForm.isSimulation = JSON.parse(result['issimulation']);
  
    // console.log(result);
    // console.log(result['output']['defaultbspower']);
    // console.log(result['output']['defaultbeamid']);
    calculateForm.mapProtocol = result['mapprotocol'];
    calculateForm.bandwidthList = result['bandwidth'];
    try {
      calculateForm.txPower = result['output']['defaultbspower'];
      calculateForm.beamId = result['output']['defaultbeamid'];  
    } catch (error) {
      calculateForm.txPower = result['defaultbspower'];
      calculateForm.beamId = result['defaultbeamid'];
    }
    
    calculateForm.bsList = result['defaultbs'];
    calculateForm.duplex = result['duplex'];

    calculateForm.iteration = result['iteration'];
    calculateForm.zValue = result['mapdepth'];
    calculateForm.altitude = result['mapaltitude'];
    calculateForm.height = result['mapheight'];
    calculateForm.mapImage = result['mapimage'];
    calculateForm.mapName = result['mapname'];
    calculateForm.width = result['mapwidth'];
    calculateForm.mutation = result['mutation'];
    calculateForm.objectiveIndex = result['objectiveindex'];
    calculateForm.obstacleInfo = result['obstacleinfo'];
    calculateForm.pathLossModelId = result['pathlossmodelid'];
    calculateForm.powerMaxRange = result['powermaxrange'];
    calculateForm.powerMinRange = result['powerminrange'];
    calculateForm.seed = result['seed'];
    calculateForm.taskName = result['taskname'];
    calculateForm.totalRound = result['totalround'];
    calculateForm.ueCoordinate = result['uecoordinate'];
    calculateForm.useUeCoordinate = result['useuecoordinate'];
    calculateForm.beamMaxId = result['beammaxid'];
    calculateForm.createTime = result['createtime'];

    calculateForm.isUeAvgSinr = JSON.parse(result['isueavgsinr']);
    calculateForm.isUeAvgThroughput = JSON.parse(result['isueavgthroughput']);
    calculateForm.isUeCoverage = JSON.parse(result['isuecoverage']);
    calculateForm.isCoverage = JSON.parse(result['iscoverage']);
    calculateForm.isAverageSinr = JSON.parse(result['isaveragesinr']);
    // calculateForm.isAvgThroughput = JSON.parse(result['isaveragethroughput']);

    return calculateForm;
  }

  /**
   * 轉換跟結果一樣的key
   * @param result 
   */
  setHstOutputToResultOutput(result) {
    const output = {};
    output['averageRsrp'] = result['averagersrp'];
    output['averageSinr'] = result['averagesinr'];
    if (typeof result['candidatebeamid'] !== 'undefined') {
      output['candidateBeamId'] = JSON.parse(result['candidatebeamid']);
    }
    if (typeof result['candidatebs_power'] !== 'undefined') {
      output['candidateBsPower'] = JSON.parse(result['candidatebs_power']);
    }
    if (typeof result['candidateconnection'] !== 'undefined') {
      output['candidateConnection'] = JSON.parse(result['candidateconnection']);
    }
    if (typeof result['candidatethroughput'] !== 'undefined') {
      output['candidateThroughput'] = JSON.parse(result['candidatethroughput']);
    }

    output['chosenCandidate'] = JSON.parse(result['chosecandidate']);
    output['connectionMap'] = JSON.parse(result['connectionmap']);
    // output['connectionMapAll'] = JSON.parse(result['connectionmapall']);
    output['coverage'] = result['coverage'];
    output['cqiCount'] = result['cqicount'];
    output['cqiMap'] = JSON.parse(result['cqimap']);
    output['defaultBeamId'] = JSON.parse(result['defaultbeamid']);
    output['defaultidx'] = JSON.parse(result['defaultidx']);
    // output['defaultBs'] = JSON.parse(result['defaultbs']);
    // output['defaultBs'] = result['defaultbs'];
    // output['txPower'] = result['defaultbspower'];
    // output['beamId'] = result['defaultbeamid'];
    // output['txPower'] = JSON.parse(result['defaultbspower']);
    // output['beamId'] = JSON.parse(result['defaultbeamid']);
    output['defaultConnection'] = JSON.parse(result['defaultconnection']);
    output['defaultThroughput'] = JSON.parse(result['defaultthroughput']);
    output['layeredAverageRsrp'] = JSON.parse(result['layeredaveragersrp']);
    output['layeredAverageSinr'] = JSON.parse(result['layeredaveragesinr']);
    output['layeredCoverage'] = JSON.parse(result['layeredcoverage']);
    output['layeredCqiCount'] = JSON.parse(result['layeredcqicount']);
    output['layeredMcsCount'] = JSON.parse(result['layeredmcscount']);
    output['layeredModulationCount'] = JSON.parse(result['layeredmodulationcount']);
    output['layeredSignalLevelCount'] = JSON.parse(result['layeredsignallevelcount']);
    output['layeredThroughput'] = JSON.parse(result['layeredthroughput']);
    output['mcsCount'] = result['mcscount'];
    output['mcsMap'] = JSON.parse(result['mcsmap']);
    output['modulationCount'] = result['modulationcount'];
    output['modulationMap'] = JSON.parse(result['modulationmap']);
    output['rsrpMap'] = JSON.parse(result['rsrpmap']);
    output['signalLevelCount'] = result['signallevelcount'];
    output['signalLevelMap'] = JSON.parse(result['signallevelmap']);
    output['sinrMap'] = JSON.parse(result['sinrmap']);
    output['throughput'] = result['throughput'];
    output['throughputMap'] = JSON.parse(result['throughputmap']);
    output['ueAverageRsrp'] = result['ueaveragersrp'];
    if (output['ueAverageRsrp'] === 'null') {
      output['ueAverageRsrp'] = null;
    }
    output['ueAverageSinr'] = result['ueaveragesinr'];
    if (output['ueAverageSinr'] === 'null') {
      output['ueAverageSinr'] = null;
    }
    output['ueConnection'] = result['ueconnection'];
    output['ueCoverage'] = result['uecoverage'];
    if (output['ueCoverage'] === 'null') {
      output['ueCoverage'] = null;
    }
    output['ueCqi'] = result['uecqi'];
    output['ueCqiCount'] = JSON.parse(result['uecqicount']);
    output['ueMcs'] = result['uemcs'];
    output['ueMcsCount'] = JSON.parse(result['uemcscount']);
    output['ueModulation'] = result['uemodulation'];
    output['ueModulationCount'] = JSON.parse(result['uemodulationcount']);
    output['ueRsrp'] = JSON.parse(result['uersrp']);
    output['ueSignalLevel'] = JSON.parse(result['uesignallevel']);
    output['ueSignalLevelCount'] = JSON.parse(result['uesignallevelcount']);
    output['ueSinr'] = JSON.parse(result['uesinr']);
    output['ueThroughput'] = result['uethroughput'];
    if (output['ueThroughput'] === 'null') {
      output['ueThroughput'] = null;
    }
    output['ueThroughputIndividual'] = result['uethroughputindividual'];
    output['ulThroughputMap'] = JSON.parse(result['ulthroughputmap']);
    output['throughputMap'] = JSON.parse(result['throughputmap']);
    output['candidateIdx'] = JSON.parse(result['candidateidx']);
    output['uersrp'] = JSON.parse(result['uersrp']);
    output['uesinr'] = JSON.parse(result['uesinr']);
    //For UE Tpt
    output['ueCon_perBsUeConnection'] = JSON.parse(result['ueCon_perBsUeConnection']);
    output['ueCon_perUeConnectionInfo'] = JSON.parse(result['ueCon_perUeConnectionInfo']);
    output['ueTpt_dlTpt'] = Number(result['ueTpt_dlTpt']);
    output['ueTpt_ulTpt'] = Number(result['ueTpt_ulTpt']);
    output['ueTpt_dlTptIndividualBs'] = JSON.parse(result['ueTpt_dlTptIndividualBs']);
    output['ueTpt_ulTptIndividualBs'] = JSON.parse(result['ueTpt_ulTptIndividualBs']);
    output['uesiueTpt_dlTptIndividualUenr'] = JSON.parse(result['ueTpt_dlTptIndividualUe']);
    output['ueTpt_ulTptIndividualUe'] = JSON.parse(result['ueTpt_ulTptIndividualUe']);
    output['ueTpt_dlTptIndividualUe'] = JSON.parse(result['ueTpt_dlTptIndividualUe']);


    return output;
  }
}
