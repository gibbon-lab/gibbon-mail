#!/usr/bin/env bash
set -e

cd $(dirname "$0")

(
    cd ..
    docker build . -f docker-image/Dockerfile -t stephaneklein/gibbon-mail:latest
)