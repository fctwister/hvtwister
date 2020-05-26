#!/bin/bash
echo "Starting hvtwister"
meteor --port 3003 --settings settings.json &>> /home/betfield/logs/hvtwister.log

