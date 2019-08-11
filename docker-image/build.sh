#!/usr/bin/env bash
set -e

cd $(dirname "$0")

(
    cd ../frontend
    unset REACT_APP_API_URL
    npm run build
)

(
    cd ..
    docker build . -f docker-image/Dockerfile -t harobed/gibbon-mail:latest
)