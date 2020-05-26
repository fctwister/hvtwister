#!/bin/bash
echo "Starting hvtwister"
meteor --port 3010 --settings settings.json &>> /home/betfield/logs/hvtwister.log

