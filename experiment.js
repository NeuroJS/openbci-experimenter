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
    patternsTotal: 0,
    patterns: []
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
    board.on('sample', addPattern);
    setTimeout(endExperiment, experiment.duration);
}

// Add pattern
function addPattern (sample) {
    var pattern = {
        input: {},
        output: {}
    };
    sample.channelData.forEach(function (channel, index) {
        pattern.input[index + 1] = channel;
    });
    pattern.output[experiment.name] = 1;
    experiment.patternsTotal++;
    experiment.patterns.push(pattern);
    console.log('pattern', pattern);
}

// End Experiment
function endExperiment () {
    board.streamStop()
        .then(board.disconnect());
    jsonfile.writeFile(experiment.filePath, experiment, { spaces: 2 }, function (error) {
        if (!error) {
            console.log(experiment.name + ' experiment finished with ' + experiment.patternsTotal  + ' patterns');
            console.log('Experiment path: ' + experiment.filePath);
        } else {
            console.log(experiment.name + ' experiment failed. sucks to be you.');
        }
    });
}


