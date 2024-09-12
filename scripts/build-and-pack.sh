#!/bin/bash

# Stop on error.
set -e

# Get the directory of the script.
SCRIPT_DIR=$(dirname $(readlink -f $0))

# Get the directory of the project.
PROJECT_BASE_DIR=$(dirname $SCRIPT_DIR)

# Define the SDK directory.
SDK_DIR="$PROJECT_BASE_DIR/sdk"

# Check if a package directory argument is provided.
if [ -z "$1" ]; then
  echo "Please specify a package directory."
  exit 1
fi

# The directory of the package to build.
PACKAGE_DIR="$SDK_DIR/$1"

if [ -d "$PACKAGE_DIR" ]; then
  echo "Building package in $PACKAGE_DIR"
  
  # Change to the package directory.
  cd "$PACKAGE_DIR"
  
  # Install dependencies, build, and test.
  echo "npm clean install in $PACKAGE_DIR"
  npm ci

  echo "npm run build in $PACKAGE_DIR"
  npm run build

  echo "npm run test in $PACKAGE_DIR"
  npm run test

  # Create a tarball.
  echo "npm pack in $PACKAGE_DIR"
  npm pack
else
  echo "The specified package directory does not exist."
  exit 1
fi
