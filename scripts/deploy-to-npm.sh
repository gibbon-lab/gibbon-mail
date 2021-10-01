#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

(
    cd frontend
    yarn
    yarn run build
)

rm -rf backend/front
mv frontend/build backend/front

(
    cd backend
    npm publish --access public
)