import { Injectable } from '@angular/core';
import { CalculateForm } from '../form/CalculateForm';
import * as XLSX from 'xlsx';
import { AuthService } from './auth.service';

/**
 * export excel
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor(private authService: AuthService) { }

  /**
   * export excel
   * @param calculateForm 
   */
  export(calculateForm: CalculateForm) {
    console.log(calculateForm);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    const zValues = JSON.parse(calculateForm.zValue);
    const mapData = [
      ['image', 'imageName', 'width', 'height', 'altitude', 'protocol', 'mapLayer'],
      [
        calculateForm.mapImage,
        calculateForm.mapName,
        calculateForm.width,
        calculateForm.height,
        calculateForm.altitude,
        calculateForm.objectiveIndex,
        zValues[0]
      ]
    ];
    if (zValues.length > 1) {
      for (let i = 1; i < zValues.length; i++) {
        mapData.push([
          '', '', '', '', '', '', zValues[i]
        ]);
      }
    }
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(mapData);
    XLSX.utils.book_append_sheet(wb, ws, 'map');
    // defaultBS
    // const baseStationData = [['x', 'y', 'z', 'material', 'color']];
    const baseStationData = [['x', 'y', 'z','material','color',
    'txpower','beamId','tddfrequency', 'tddbandwidth',
    'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
    '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
    'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers']];
    let txpowerArr = [];
    let beamArr = [];
    let defaultBsNum = 0;
    if (calculateForm.defaultBs != '') {defaultBsNum = calculateForm.defaultBs.split('|').length;}
    let candidateNum = 0;
    if (calculateForm.candidateBs != '') {candidateNum = calculateForm.candidateBs.split('|').length;}
    if (calculateForm.isSimulation) {
      txpowerArr = JSON.parse(calculateForm.txPower);
      beamArr = JSON.parse(calculateForm.beamId);
    } else {
      for (let i = 0;i < JSON.parse(calculateForm.txPower).length;i++) {
        txpowerArr.push('');
        beamArr.push('');
      }
    }
    if (!this.authService.isEmpty(calculateForm.defaultBs)) {
      const defaultBs = calculateForm.defaultBs.split('|');
      // console.log(defaultBs);
      
      if (calculateForm.duplex === 'fdd' && calculateForm.mapProtocol === '5g') {
        for (let i = 0;i < defaultBs.length;i++) {
          baseStationData.push([
            JSON.parse(defaultBs[i])[0], JSON.parse(defaultBs[i])[1], JSON.parse(defaultBs[i])[2],'','',
            txpowerArr[i],
            // '',
            beamArr[i],
            // '',
            '','',
            JSON.parse(calculateForm.dlBandwidth)[i+candidateNum],
            JSON.parse(calculateForm.ulBandwidth)[i+candidateNum],
            JSON.parse(calculateForm.dlFrequency)[i+candidateNum],
            JSON.parse(calculateForm.ulFrequency)[i+candidateNum],
            '','',
            calculateForm.dlMcsTable.substring(1,(calculateForm.dlMcsTable.length)-1).split(',')[i+candidateNum],
            calculateForm.ulMcsTable.substring(1,(calculateForm.ulMcsTable.length)-1).split(',')[i+candidateNum],
            JSON.parse(calculateForm.dlMimoLayer)[i+candidateNum],
            JSON.parse(calculateForm.ulMimoLayer)[i+candidateNum],
            JSON.parse(calculateForm.dlScs)[i+candidateNum],
            JSON.parse(calculateForm.ulScs)[i+candidateNum]
          ]);
        }
      } else if (calculateForm.duplex === 'tdd' && calculateForm.mapProtocol === '5g') {
        for (let i = 0;i < defaultBs.length;i++) {
          baseStationData.push([
            JSON.parse(defaultBs[i])[0], JSON.parse(defaultBs[i])[1], JSON.parse(defaultBs[i])[2],'','',
            txpowerArr[i],
            // '',
            beamArr[i],
            // '',
            JSON.parse(calculateForm.frequencyList)[i+candidateNum],
            JSON.parse(calculateForm.bandwidthList)[i+candidateNum],
            '','','','','',
            JSON.parse(calculateForm.scs)[i+candidateNum],
            calculateForm.dlMcsTable.substring(1,(calculateForm.dlMcsTable.length)-1).split(',')[i+candidateNum],
            calculateForm.ulMcsTable.substring(1,(calculateForm.ulMcsTable.length)-1).split(',')[i+candidateNum],
            JSON.parse(calculateForm.dlMimoLayer)[i+candidateNum],
            JSON.parse(calculateForm.ulMimoLayer)[i+candidateNum],
            '',''
          ]);
        }
      } else if (calculateForm.duplex === 'fdd' && calculateForm.mapProtocol === '4g') {
        for (let i = 0;i < defaultBs.length;i++) {
          baseStationData.push([
            JSON.parse(defaultBs[i])[0], JSON.parse(defaultBs[i])[1], JSON.parse(defaultBs[i])[2],'','',
            txpowerArr[i],
            // '',
            beamArr[i],
            // '',
            '','',
            JSON.parse(calculateForm.dlBandwidth)[i+candidateNum],
            JSON.parse(calculateForm.ulBandwidth)[i+candidateNum],
            JSON.parse(calculateForm.dlFrequency)[i+candidateNum],
            JSON.parse(calculateForm.ulFrequency)[i+candidateNum],
            JSON.parse(calculateForm.mimoNumber)[i+candidateNum],
            '','','','','','',''
          ]);
        }
      } else {
        for (let i = 0;i < defaultBs.length;i++) {
          baseStationData.push([
            JSON.parse(defaultBs[i])[0], JSON.parse(defaultBs[i])[1], JSON.parse(defaultBs[i])[2],'','',
            txpowerArr[i],
            // '',
            beamArr[i],
            // '',
            JSON.parse(calculateForm.frequencyList)[i+candidateNum],
            JSON.parse(calculateForm.bandwidthList)[i+candidateNum],
            ,'','','','',
            JSON.parse(calculateForm.mimoNumber)[i+candidateNum],
            '','','','','','',''
          ]);
        }
      }
      // for (const item of defaultBs) {
      //   const data = JSON.parse(item);
      //   baseStationData.push([
      //     data[0], data[1], data[2], data[3]
      //   ]);
      // }
    }
    const baseStationWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(baseStationData);
    XLSX.utils.book_append_sheet(wb, baseStationWS, 'base_station');

    // candidate
    // const candidateData = [['x', 'y', 'z', 'material', 'color']];
    const candidateData = [['x', 'y', 'z','material','color',
    'tddfrequency', 'tddbandwidth',
    'fddDlBandwidth', 'fddUlBandwidth', 'fddDlFrequency', 'fddUlFrequency',
    '4GMimoNumber', 'Subcarriers', 'dlModulationCodScheme', 'ulModulationCodScheme',
    'dlMimoLayer', 'ulMimoLayer', 'dlSubcarriers', 'ulSubcarriers']];
    if (!this.authService.isEmpty(calculateForm.candidateBs)) {
      const candidate = calculateForm.candidateBs.split('|');
      if (calculateForm.duplex === 'fdd' && calculateForm.mapProtocol === '5g') {
        for (let i = 0;i < candidate.length;i++) {
          candidateData.push([
            JSON.parse(candidate[i])[0], JSON.parse(candidate[i])[1], JSON.parse(candidate[i])[2],'','',
            '','',
            JSON.parse(calculateForm.dlBandwidth)[i],
            JSON.parse(calculateForm.ulBandwidth)[i],
            JSON.parse(calculateForm.dlFrequency)[i],
            JSON.parse(calculateForm.ulFrequency)[i],
            '','',
            calculateForm.dlMcsTable.substring(1,(calculateForm.dlMcsTable.length)-1).split(',')[i],
            calculateForm.ulMcsTable.substring(1,(calculateForm.ulMcsTable.length)-1).split(',')[i],
            JSON.parse(calculateForm.dlMimoLayer)[i].toString(),
            JSON.parse(calculateForm.ulMimoLayer)[i].toString(),
            JSON.parse(calculateForm.dlScs)[i],
            JSON.parse(calculateForm.ulScs)[i]
          ]);
        }
      } else if (calculateForm.duplex === 'tdd' && calculateForm.mapProtocol === '5g') {
        for (let i = 0;i < candidate.length;i++) {
          candidateData.push([
            JSON.parse(candidate[i])[0], JSON.parse(candidate[i])[1], JSON.parse(candidate[i])[2],'','',
            JSON.parse(calculateForm.frequencyList)[i],
            JSON.parse(calculateForm.bandwidthList)[i],
            '','','','','',
            JSON.parse(calculateForm.scs)[i].toString(),
            calculateForm.dlMcsTable.substring(1,(calculateForm.dlMcsTable.length)-1).split(',')[i],
            calculateForm.ulMcsTable.substring(1,(calculateForm.ulMcsTable.length)-1).split(',')[i],
            JSON.parse(calculateForm.dlMimoLayer)[i].toString(),
            JSON.parse(calculateForm.ulMimoLayer)[i].toString(),
            '',''
          ]);
        }
      } else if (calculateForm.duplex === 'fdd' && calculateForm.mapProtocol === '4g') {
        for (let i = 0;i < candidate.length;i++) {
          candidateData.push([
            JSON.parse(candidate[i])[0], JSON.parse(candidate[i])[1], JSON.parse(candidate[i])[2],'','',
            ,'','',
            JSON.parse(calculateForm.dlBandwidth)[i],
            JSON.parse(calculateForm.ulBandwidth)[i],
            JSON.parse(calculateForm.dlFrequency)[i],
            JSON.parse(calculateForm.ulFrequency)[i],
            JSON.parse(calculateForm.mimoNumber)[i],
            '','','','','','',''
          ]);
        }
      } else {
        for (let i = 0;i < candidate.length;i++) {
          candidateData.push([
            JSON.parse(candidate[i])[0], JSON.parse(candidate[i])[1], JSON.parse(candidate[i])[2],'','',
            JSON.parse(calculateForm.frequencyList)[i],
            JSON.parse(calculateForm.bandwidthList)[i],
            ,'','','','',
            JSON.parse(calculateForm.mimoNumber)[i],
            '','','','','','',''
          ]);
        }
      }
      // for (const item of candidate) {
      //   const data = JSON.parse(item);
      //   candidateData.push([
      //     data[0], data[1], data[2], data[3]
      //   ]);
      // }
    }
    const candidateWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(candidateData);
    XLSX.utils.book_append_sheet(wb, candidateWS, 'candidate');
    // UE
    const ueData = [['x', 'y', 'z']];
    if (!this.authService.isEmpty(calculateForm.ueCoordinate)) {
      const ue = calculateForm.ueCoordinate.split('|');
      for (const item of ue) {
        const data = JSON.parse(item);
        ueData.push([
          data[0], data[1], data[2]
        ]);
      }
    }
    const ueWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(ueData);
    XLSX.utils.book_append_sheet(wb, ueWS, 'ue');
    // obstacle
    const obstacleData = [['x', 'y', 'width', 'height', 'altitude', 'rotate', 'material', 'color', 'shape']];
    if (!this.authService.isEmpty(calculateForm.obstacleInfo)) {
      const obstacleInfo = calculateForm.obstacleInfo.split('|');
      for (const item of obstacleInfo) {
        const data = JSON.parse(item);
        if (typeof item[7] !== 'undefined') {
          obstacleData.push([
            data[0], data[1], data[2], data[3], data[4], data[5], data[6], 'rgb(115, 128, 92)', data[7]
          ]);
        } else {
          obstacleData.push([
            data[0], data[1], data[2], data[3], data[4], data[5], data[6]
          ]);
        }
      }
    }
    const obstacleWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(obstacleData);
    XLSX.utils.book_append_sheet(wb, obstacleWS, 'obstacle');
    // bs parameters
    let protocolNum = 0;
    if (calculateForm.mapProtocol == '4g') {
      protocolNum = 0;
    } else if (calculateForm.mapProtocol == '5g') {
      protocolNum = 1;
    } else {
      protocolNum = 2;
    }
    let bsData = [];
    if (calculateForm.isSimulation) {
      bsData = [
        // ['bsPowerMax', 'bsPowerMin', 'bsBeamIdMax', 'bsBeamIdMin', 'bandwidth', 'frequency'],
        ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
        'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
        [
          calculateForm.powerMaxRange, calculateForm.powerMinRange,
          protocolNum, calculateForm.duplex, calculateForm.tddFrameRatio,
          false, false, false, false, false
        ]
      ];
    } else {
      bsData = [
        // ['bsPowerMax', 'bsPowerMin', 'bsBeamIdMax', 'bsBeamIdMin', 'bandwidth', 'frequency'],
        ['bsPowerMax', 'bsPowerMin', 'protocol', 'duplex', 'downLinkRatio', 'isAverageSinr',
        'isCoverage', 'isUeAvgSinr', 'isUeAvgThroughput', 'isUeCoverage'],
        [
          calculateForm.powerMaxRange, calculateForm.powerMinRange,
          protocolNum, calculateForm.duplex, calculateForm.tddFrameRatio,
          calculateForm.isAverageSinr,calculateForm.isCoverage,
          calculateForm.isUeAvgSinr,
          calculateForm.isUeAvgThroughput,calculateForm.isUeCoverage
        ]
      ];
    }
    
    const bsWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(bsData);
    XLSX.utils.book_append_sheet(wb, bsWS, 'bs parameters');
    // algorithm parameters

    const algorithmData = [
      ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel'],
      // ['crossover', 'mutation', 'iteration', 'seed', 'computeRound', 'useUeCoordinate', 'pathLossModel', 'TxGain', 'RxGain', 'noiseFigure', 'maxConnectionNum'],
      [
        calculateForm.crossover, calculateForm.mutation,
        calculateForm.iteration, calculateForm.seed,
        1, calculateForm.useUeCoordinate, calculateForm.pathLossModelId
        // 1, calculateForm.useUeCoordinate, calculateForm.pathLossModelId, calculateForm.pathLossModel['TxGain'], calculateForm.pathLossModel['RxGain'], calculateForm.pathLossModel['noiseFigure'],
        // this.calculateForm.maxConnectionNum
      ]
    ];
    const algorithmWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(algorithmData);
    XLSX.utils.book_append_sheet(wb, algorithmWS, 'algorithm parameters');
    // objective parameters
    const objectiveData = [
      ['objective', 'objectiveStopCondition', 'newBsNum'],
      [calculateForm.objectiveIndex, '', calculateForm.availableNewBsNumber - defaultBsNum]
    ];
    const objectiveWS: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(objectiveData);
    XLSX.utils.book_append_sheet(wb, objectiveWS, 'objective parameters');
    console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, `${calculateForm.taskName}`);
  }
}
