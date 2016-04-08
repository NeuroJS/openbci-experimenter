# OpenBCI Experimenter

Node.js app for recording experiments based on OpenBCI Data samples

This project is under development, this is just a first draft.

## Setup

* npm install
* Plug in OpenBCI dongle
* Turn on OpenBCI board
* Run:

``` bash
node experimenter with [subject_name] about [keyword] for [time_milliseconds]
```

The recorded JSON data for experiments can be found at ./data/[keyword].json