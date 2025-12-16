#!/bin/bash

# API Mapper Installation Script
# This script installs dependencies and builds the project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        API Mapper - Installation         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

cd "$PROJECT_DIR"

# Check for Node.js
echo "▸ Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "  ✗ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "  ✗ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "  ✓ Node.js $(node -v)"

# Check for npm
echo ""
echo "▸ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "  ✗ npm is not installed."
    exit 1
fi
echo "  ✓ npm $(npm -v)"

# Install dependencies
echo ""
echo "▸ Installing dependencies..."
npm install --silent
echo "  ✓ Dependencies installed"

# Build the project
echo ""
echo "▸ Building project..."
npm run build --silent
echo "  ✓ Build complete"

# Link globally (optional)
echo ""
echo "▸ Linking api-mapper command..."
npm link --silent 2>/dev/null || true
echo "  ✓ api-mapper command available"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         Installation Complete!           ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Usage:"
echo "  api-mapper generate <url>     Generate client from OpenAPI spec"
echo "  api-mapper list               List generated clients"
echo "  api-mapper serve <origin>     Serve generated files"
echo ""
echo "Or run the full workflow:"
echo "  ./scripts/run.sh <url>        Generate and serve in one command"
echo ""
