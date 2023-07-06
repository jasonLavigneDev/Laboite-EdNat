#!/bin/bash

grep -rEohs "Meteor\.settings\..[^ ,;})]*" * --exclude-dir=node_modules | sort | uniq