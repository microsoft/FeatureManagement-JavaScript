#!/bin/bash

# Stop on error.
set -e

SCRIPT_DIR=$(dirname $(readlink -f $0))
PROJECT_BASE_DIR=$(dirname $SCRIPT_DIR)
NPMRC_FILE="$PROJECT_BASE_DIR/.npmrc"
SRC_DIR="$PROJECT_BASE_DIR/src"

PACKAGE="feature-management"
PACKAGE_DIR="$SRC_DIR/$PACKAGE"

if [ -f "$NPMRC_FILE" ]; then
    echo "Copy .npmrc file to $PACKAGE_DIR"
    cp "$NPMRC_FILE" "$PACKAGE_DIR"
fi

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
PACKAGE_DIR="$SRC_DIR/$PACKAGE"

if [ -f "$NPMRC_FILE" ]; then
    echo "Copy .npmrc file to $PACKAGE_DIR"
    cp "$NPMRC_FILE" "$PACKAGE_DIR"
fi

echo "Building package $PACKAGE in $PACKAGE_DIR"
cd "$PACKAGE_DIR"

echo "npm run build in $PACKAGE_DIR"
npm run build

echo "npm pack in $PACKAGE_DIR"
npm pack

echo "copy $PACKAGE package to $PROJECT_BASE_DIR"
cp "$PACKAGE_DIR"/*.tgz "$PROJECT_BASE_DIR"

PACKAGE="feature-management-applicationinsights-node"
PACKAGE_DIR="$SRC_DIR/$PACKAGE"

if [ -f "$NPMRC_FILE" ]; then
    echo "Copy .npmrc file to $PACKAGE_DIR"
    cp "$NPMRC_FILE" "$PACKAGE_DIR"
fi

echo "Building package $PACKAGE in $PACKAGE_DIR"
cd "$PACKAGE_DIR"

echo "npm run build in $PACKAGE_DIR"
npm run build

echo "npm pack in $PACKAGE_DIR"
npm pack

echo "copy $PACKAGE package to $PROJECT_BASE_DIR"
cp "$PACKAGE_DIR"/*.tgz "$PROJECT_BASE_DIR"
