#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/../"

(
    cd frontend
    pnpm install
    pnpm run build
)

rm -rf backend/front
mv frontend/dist backend/front

(
    cd backend
    npm publish --access public
)