#!/bin/bash

# Stop on error.
set -e

SCRIPT_DIR=$(dirname $(readlink -f $0))
PROJECT_BASE_DIR=$(dirname $SCRIPT_DIR)
SDK_DIR="$PROJECT_BASE_DIR/sdk"

PACKAGE="feature-management"
PACKAGE_DIR="$SDK_DIR/$PACKAGE"

echo "Building package $PACKAGE in $PACKAGE_DIR"
cd "$PACKAGE_DIR"

echo "npm clean install in $PACKAGE_DIR"
npm ci

echo "npm run build in $PACKAGE_DIR"
npm run build

echo "npm run test in $PACKAGE_DIR"
npm run test

echo "npm pack in $PACKAGE_DIR"
npm pack

echo "copy $PACKAGE package to $PROJECT_BASE_DIR"
cp "$PACKAGE_DIR"/*.tgz "$PROJECT_BASE_DIR"

PACKAGE="feature-management-applicationinsights-browser"
PACKAGE_DIR="$SDK_DIR/$PACKAGE"

echo "Building package $PACKAGE in $PACKAGE_DIR"
cd "$PACKAGE_DIR"

echo "npm run build in $PACKAGE_DIR"
npm run build

echo "npm pack in $PACKAGE_DIR"
npm pack

echo "copy $PACKAGE package to $PROJECT_BASE_DIR"
cp "$PACKAGE_DIR"/*.tgz "$PROJECT_BASE_DIR"

PACKAGE="feature-management-applicationinsights-node"
PACKAGE_DIR="$SDK_DIR/$PACKAGE"

echo "Building package $PACKAGE in $PACKAGE_DIR"
cd "$PACKAGE_DIR"

echo "npm run build in $PACKAGE_DIR"
npm run build

echo "npm pack in $PACKAGE_DIR"
npm pack

echo "copy $PACKAGE package to $PROJECT_BASE_DIR"
cp "$PACKAGE_DIR"/*.tgz "$PROJECT_BASE_DIR"
