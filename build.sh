#!/usr/bin/env bash

OLD_DIR=`pwd`

rm -rf dist
rm -rf node_modules

echo Installing dependencies
npm install

echo Running build for production
npm run build


if [[ $? -ne 0 ]]; then
  echo "Gulp failed"
  exit 1
fi

echo Copying docker files

cp -f ./docker/* dist

echo Creating versions file

echo "{\"Writer\": \"#$(git rev-parse --short HEAD)\"}" > dist/versions.json

