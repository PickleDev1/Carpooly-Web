#!/bin/bash

# Phase 3 Automated Testing Script
# This script runs all Phase 3 tests to verify the matching system works correctly

echo "🚀 Starting Phase 3 Automated Testing Suite"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the carpooly-web directory"
    exit 1
fi

# Install dependencies if needed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install dependencies"
        exit 1
    fi
fi

# Install test dependencies
print_status "Installing test dependencies..."
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom @playwright/test

# Build the project first
print_status "Building project..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Build failed! Please fix compilation errors first."
    exit 1
fi
print_success "Build successful!"

echo ""
echo "🧪 Running Unit Tests..."
echo "========================"

# Run unit tests
npm run test:phase3
if [ $? -eq 0 ]; then
    print_success "Unit tests passed!"
else
    print_error "Unit tests failed!"
    exit 1
fi

echo ""
echo "🔗 Running Integration Tests..."
echo "==============================="

# Run integration tests
npm run test -- --testPathPattern=Phase3.integration
if [ $? -eq 0 ]; then
    print_success "Integration tests passed!"
else
    print_error "Integration tests failed!"
    exit 1
fi

echo ""
echo "🌐 Running End-to-End Tests..."
echo "=============================="

# Install Playwright browsers
print_status "Installing Playwright browsers..."
npx playwright install

# Run E2E tests
npm run test:e2e
if [ $? -eq 0 ]; then
    print_success "End-to-end tests passed!"
else
    print_error "End-to-end tests failed!"
    exit 1
fi

echo ""
echo "📊 Running Coverage Analysis..."
echo "==============================="

# Run tests with coverage
npm run test:coverage -- --testPathPattern=Phase3
if [ $? -eq 0 ]; then
    print_success "Coverage analysis complete!"
else
    print_warning "Coverage analysis had issues, but tests passed"
fi

echo ""
echo "🎯 Phase 3 Testing Summary"
echo "=========================="
print_success "✅ All Phase 3 tests completed successfully!"
print_success "✅ Unit tests: PASSED"
print_success "✅ Integration tests: PASSED"
print_success "✅ End-to-end tests: PASSED"
print_success "✅ Build: SUCCESSFUL"

echo ""
echo "🚀 Phase 3 Matching System is ready for production!"
echo "===================================================="
echo ""
echo "What was tested:"
echo "• Advanced filter system with 15+ filter parameters"
echo "• Real-time updates and polling"
echo "• Advanced matching algorithm with 6 factors"
echo "• Complete UI integration across all tabs"
echo "• API integration with proper error handling"
echo "• State management and persistence"
echo "• Performance with debouncing"
echo "• Mobile responsiveness"
echo "• Error handling and edge cases"
echo ""
echo "You can now confidently deploy Phase 3! 🎉"
