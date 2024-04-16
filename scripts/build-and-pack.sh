#!/bin/bash

# Stop on error.
set -e

# Get the directory of the script.
SCRIPT_DIR=$(dirname $(readlink -f $0))

# Get the directory of the project.
PROJECT_BASE_DIR=$(dirname $SCRIPT_DIR)

# Change to the project directory.
cd $PROJECT_BASE_DIR

# Install dependencies, build, and test.
echo "npm clean install"
npm ci

echo "npm run build"
npm run build

echo "npm run test"
npm run test

# Create a tarball.
echo "npm pack"
npm pack
