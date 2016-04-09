var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;
var jsonfile = require('jsonfile');
var OpenBCIBoard = require('openbci-sdk');

// Experiment Model
var experiment = {
    name: argv._[3],
    subject: argv._[1],
    duration: argv._[5],
    filePath: path.join(__dirname, 'data', argv._[3] + '-' + argv._[1] + '.json'),
    samplesTotal: 0,
    features: [],
    labels: []
};

console.log(experiment);

// OpenBCI

const board = new OpenBCIBoard.OpenBCIBoard();

board.autoFindOpenBCIBoard()
    .then(onBoardFind);

// Board find handler
function onBoardFind (portName) {
    if (portName) {
        console.log('board found', portName);
        board.connect(portName)
            .then(onBoardConnect);
    }
}

// Board connect handler
function onBoardConnect () {
    board.on('ready', onBoardReady);
}

// Board ready handler
function onBoardReady () {
    console.log(experiment.name + ' experiment started');
    board.streamStart();
    board.on('sample', addSample);
    setTimeout(disconnectBoard, experiment.duration);
}

// Add sample
function addSample (sample) {
    experiment.samplesTotal++;
    experiment.features.push(sample.channelData);
    experiment.labels.push(experiment.name);
    console.log('pattern', sample.channelData, experiment.name);
}

// Save experiment
function saveExperiment () {
    jsonfile.writeFile(experiment.filePath, experiment, { spaces: 2 }, function (error) {
        if (!error) {
            console.log(experiment.name + ' experiment finished with ' + experiment.samplesTotal  + ' samples');
            console.log('Experiment path: ' + experiment.filePath);
        } else {
            console.log(experiment.name + ' experiment failed. sucks to be you.');
        }
    });
}

/**
 * Disconnect board
 */
function disconnectBoard () {
    board.streamStop()
        .then(function () {
            setTimeout(function () {
                board.disconnect();
                saveExperiment();
                console.log('board disconnected');
            }, 50);
        });
}


