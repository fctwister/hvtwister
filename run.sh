#!/bin/bash
echo "Starting hvtwister"
meteor --port 3003 --settings settings.prod.json | tee /home/betfield/logs/hvtwister.log
