#!/usr/bin/env bash
set -e

cd $(dirname "$0")

(
    cd ..
    docker build . -f docker-image/Dockerfile -t gibbonlab/gibbon-mail:latest
)