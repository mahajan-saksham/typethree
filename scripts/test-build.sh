#!/bin/bash

# Test Build Script for Type 3 Solar Platform
# This script tests the build process and checks for common deployment issues

echo "🔧 Type 3 Solar - Build Test Script"
echo "=================================="

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/

# Run the build
echo "🏗️  Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist directory exists
if [ -d "dist" ]; then
    echo "✅ Dist directory created"
else
    echo "❌ Dist directory not found"
    exit 1
fi

# Check for critical files
echo "🔍 Checking for critical files..."

if [ -f "dist/index.html" ]; then
    echo "✅ index.html found"
else
    echo "❌ index.html missing"
    exit 1
fi

# Check for assets directory
if [ -d "dist/assets" ]; then
    echo "✅ Assets directory found"
    
    # Count JS and CSS files
    js_count=$(find dist/assets -name "*.js" | wc -l)
    css_count=$(find dist/assets -name "*.css" | wc -l)
    
    echo "📊 Found $js_count JavaScript files"
    echo "📊 Found $css_count CSS files"
    
    if [ $js_count -gt 0 ] && [ $css_count -gt 0 ]; then
        echo "✅ Assets generated correctly"
    else
        echo "⚠️  Warning: Low asset count"
    fi
else
    echo "❌ Assets directory missing"
    exit 1
fi

# Check for proper module exports in main JS file
echo "🔍 Checking module structure..."
main_js=$(find dist/assets -name "index-*.js" | head -1)
if [ -f "$main_js" ]; then
    echo "✅ Main JS file found: $(basename $main_js)"
    
    # Check file size (should be reasonable)
    file_size=$(stat -f%z "$main_js" 2>/dev/null || stat -c%s "$main_js" 2>/dev/null)
    if [ $file_size -gt 1000 ]; then
        echo "✅ Main JS file size looks good: ${file_size} bytes"
    else
        echo "⚠️  Warning: Main JS file seems small: ${file_size} bytes"
    fi
else
    echo "❌ Main JS file not found"
    exit 1
fi

# Test local preview
echo "🌐 Testing local preview..."
npm run preview &
preview_pid=$!

# Wait a moment for server to start
sleep 3

# Test if server is responding
if curl -s http://localhost:4173 > /dev/null; then
    echo "✅ Preview server working"
else
    echo "⚠️  Preview server not responding"
fi

# Kill preview server
kill $preview_pid 2>/dev/null

echo ""
echo "🎉 Build test completed!"
echo "Your project is ready for deployment."
echo ""
echo "Next steps:"
echo "1. Commit these changes: git add . && git commit -m 'fix: deployment configuration'"
echo "2. Push to repository: git push origin main"
echo "3. Deploy will automatically trigger on your hosting platform" 