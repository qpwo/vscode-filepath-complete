#!/usr/bin/env bash
set -e
rm -rf dist
mkdir -p dist/out
cp package.json pnpm-lock.yaml README.md .vscodeignore dist/
cp -r out/* dist/out/
