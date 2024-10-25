#!/bin/bash -xe

cd cypress

node -v

npm -v

npx browserslist@latest --update-db

npm i

# cypress 18 image (used in pipeline) doesn't have curl, run this script with sudo locally
apt-get update
apt-get install -y curl

CYPRESS_CI_COMMIT_BRANCH=$CI_COMMIT_BRANCH
CYPRESS_CI_COMMIT_TAG=$CI_COMMIT_TAG
npx cypress run --config baseUrl=$HOST --spec "cypress/e2e/smoke_tests/**/*"
