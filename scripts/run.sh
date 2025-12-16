#!/bin/bash

# API Mapper - End-to-End Runner Script
# Generates a TypeScript client from an OpenAPI spec and serves it

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="./api-clients"
PORT=3000
OPEN_BROWSER=false
NO_SERVE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print usage
usage() {
    echo ""
    echo "Usage: $0 <url> [options]"
    echo ""
    echo "Arguments:"
    echo "  url                    URL to OpenAPI/Swagger specification"
    echo ""
    echo "Options:"
    echo "  -o, --output <dir>     Output directory (default: ./api-clients)"
    echo "  -p, --port <port>      Port to serve on (default: 3000)"
    echo "  --open                 Open browser automatically"
    echo "  --no-serve             Generate only, don't start server"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 https://petstore3.swagger.io/api/v3/openapi.json"
    echo "  $0 https://api.example.com --port 8080 --open"
    echo "  $0 https://api.example.com --no-serve"
    echo ""
    exit 1
}

# Parse arguments
URL=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -o|--output)
            OUTPUT_DIR="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        --open)
            OPEN_BROWSER=true
            shift
            ;;
        --no-serve)
            NO_SERVE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            ;;
        *)
            if [ -z "$URL" ]; then
                URL="$1"
            fi
            shift
            ;;
    esac
done

# Validate URL
if [ -z "$URL" ]; then
    echo -e "${RED}Error: URL is required${NC}"
    usage
fi

# Print header
echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║              ${CYAN}API Mapper${NC}${BOLD} - End-to-End Workflow              ║${NC}"
echo -e "${BOLD}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check if built
echo -e "${BLUE}━━━ Step 1/4: Checking installation ━━━${NC}"
echo ""
if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
    echo -e "  ${YELLOW}▸${NC} Project not built. Running installation..."
    cd "$PROJECT_DIR"
    npm install --silent
    npm run build --silent
    echo -e "  ${GREEN}✓${NC} Installation complete"
else
    echo -e "  ${GREEN}✓${NC} API Mapper is installed and ready"
fi
echo ""

# Step 2: Generate client
echo -e "${BLUE}━━━ Step 2/4: Fetching and parsing OpenAPI specification ━━━${NC}"
echo ""
echo -e "  ${YELLOW}▸${NC} Source URL: ${CYAN}$URL${NC}"
echo ""

cd "$PROJECT_DIR"

# Capture output and extract origin name
GENERATE_OUTPUT=$(node dist/index.js generate "$URL" -o "$OUTPUT_DIR" 2>&1) || {
    echo -e "${RED}$GENERATE_OUTPUT${NC}"
    echo ""
    echo -e "${RED}✗ Failed to generate client${NC}"
    exit 1
}

# Print generation output with formatting
echo "$GENERATE_OUTPUT" | while IFS= read -r line; do
    if [[ "$line" == *"✓"* ]]; then
        echo -e "  ${GREEN}$line${NC}"
    elif [[ "$line" == *"✗"* ]]; then
        echo -e "  ${RED}$line${NC}"
    elif [[ "$line" == *"Trying:"* ]]; then
        echo -e "  ${YELLOW}$line${NC}"
    elif [[ "$line" == *"API:"* ]] || [[ "$line" == *"Found:"* ]]; then
        echo -e "  ${CYAN}$line${NC}"
    elif [[ "$line" == *"Generated to:"* ]]; then
        echo -e "  ${GREEN}$line${NC}"
    else
        echo "  $line"
    fi
done

# Extract origin name from output
ORIGIN_NAME=$(echo "$GENERATE_OUTPUT" | grep "Generated to:" | sed 's/.*\///' | tr -d '[:space:]')

if [ -z "$ORIGIN_NAME" ]; then
    echo -e "${RED}✗ Could not determine generated client folder${NC}"
    exit 1
fi

echo ""

# Step 3: Show generated files
echo -e "${BLUE}━━━ Step 3/4: Generated files ━━━${NC}"
echo ""
CLIENT_DIR="$OUTPUT_DIR/$ORIGIN_NAME"

if [ -d "$CLIENT_DIR" ]; then
    for file in "$CLIENT_DIR"/*; do
        filename=$(basename "$file")
        filesize=$(ls -lh "$file" | awk '{print $5}')
        echo -e "  ${GREEN}✓${NC} $filename ${YELLOW}($filesize)${NC}"
    done
fi
echo ""

# Step 4: Serve (unless --no-serve)
if [ "$NO_SERVE" = true ]; then
    echo -e "${BLUE}━━━ Step 4/4: Complete ━━━${NC}"
    echo ""
    echo -e "  ${GREEN}✓${NC} Client generated successfully"
    echo ""
    echo -e "${BOLD}Generated files:${NC} $CLIENT_DIR"
    echo ""
    echo -e "To serve later, run:"
    echo -e "  ${CYAN}api-mapper serve $ORIGIN_NAME --port $PORT${NC}"
    echo ""
else
    echo -e "${BLUE}━━━ Step 4/4: Starting development server ━━━${NC}"
    echo ""

    SERVER_URL="http://localhost:$PORT"

    echo -e "  ${GREEN}▸${NC} Server starting on port ${CYAN}$PORT${NC}..."
    echo ""
    echo -e "╔══════════════════════════════════════════════════════════════╗"
    echo -e "║                                                              ║"
    echo -e "║  ${BOLD}${GREEN}Server is ready!${NC}                                          ║"
    echo -e "║                                                              ║"
    echo -e "║  ${BOLD}Open in browser:${NC}                                           ║"
    echo -e "║                                                              ║"
    echo -e "║    ${CYAN}${BOLD}➜  $SERVER_URL/${NC}                              ║"
    echo -e "║                                                              ║"
    echo -e "║  ${BOLD}Download files:${NC}                                            ║"
    echo -e "║    ${CYAN}$SERVER_URL/types.ts${NC}                       ║"
    echo -e "║    ${CYAN}$SERVER_URL/client.ts${NC}                      ║"
    echo -e "║    ${CYAN}$SERVER_URL/API.md${NC}                         ║"
    echo -e "║                                                              ║"
    echo -e "║  Press ${BOLD}Ctrl+C${NC} to stop the server                           ║"
    echo -e "║                                                              ║"
    echo -e "╚══════════════════════════════════════════════════════════════╝"
    echo ""

    # Open browser if requested
    if [ "$OPEN_BROWSER" = true ]; then
        echo -e "  ${YELLOW}▸${NC} Opening browser..."
        sleep 1
        if command -v open &> /dev/null; then
            open "$SERVER_URL"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$SERVER_URL"
        fi
    fi

    # Start server (this will block)
    node "$PROJECT_DIR/dist/index.js" serve "$ORIGIN_NAME" -o "$OUTPUT_DIR" -p "$PORT"
fi
