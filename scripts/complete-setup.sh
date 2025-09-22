#!/bin/bash

echo "🚀 Future Frames Strapi Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the Strapi project root directory"
    exit 1
fi

echo ""
print_info "Step 1: Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""
print_info "Step 2: Setting up environment variables..."

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    print_info "Creating .env file from .env.example..."
    cp .env.example .env
    print_status ".env file created"
else
    print_warning ".env file already exists, skipping creation"
fi

echo ""
print_info "Step 3: Extracting blog data from Next.js app..."
node scripts/extract-articles-json.js
if [ $? -eq 0 ]; then
    print_status "Blog data extracted successfully"
else
    print_error "Failed to extract blog data"
    exit 1
fi

echo ""
print_info "Step 4: Starting Strapi in development mode..."
print_warning "This will start Strapi server - keep it running for migration"
print_info "The admin panel will open at http://localhost:1337/admin"
print_info ""
print_info "📋 IMPORTANT: After Strapi starts, you need to:"
print_info "1. Create an admin account in the browser"
print_info "2. Go to Settings → API Tokens"
print_info "3. Create a new token with 'Full access'"
print_info "4. Copy the token and set it as STRAPI_API_TOKEN in .env"
print_info "5. Then run: npm run migrate:data"
print_info ""

# Ask user if they want to continue
read -p "Press Enter to start Strapi development server, or Ctrl+C to exit..."

npm run develop