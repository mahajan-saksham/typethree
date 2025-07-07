#!/bin/bash

echo "🌐 LANGUAGE FUNCTIONALITY DIAGNOSTIC"
echo "====================================="
echo ""

echo "🔍 CHECKING RUNNING SERVERS..."
echo ""

# Check if dev server is running
if curl -s http://localhost:5173/ > /dev/null; then
    echo "✅ Development server (5173) is running"
    DEV_RUNNING=true
else
    echo "❌ Development server (5173) is NOT running"
    DEV_RUNNING=false
fi

# Check if preview server is running
if curl -s http://localhost:4173/ > /dev/null; then
    echo "✅ Production preview (4173) is running"  
    PREVIEW_RUNNING=true
else
    echo "❌ Production preview (4173) is NOT running"
    PREVIEW_RUNNING=false
fi

echo ""
echo "🔧 CONFIGURATION CHECK..."
echo ""

# Check if Google Translate script is in the HTML
if grep -q "translate.google.com" index.html; then
    echo "✅ Google Translate script found in index.html"
else
    echo "❌ Google Translate script NOT found in index.html"
fi

# Check if LanguageSwitcher component exists
if [ -f "src/components/LanguageSwitcher.tsx" ]; then
    echo "✅ LanguageSwitcher component exists"
else
    echo "❌ LanguageSwitcher component missing"
fi

# Check CSP configuration
if grep -q "translate.googleapis.com" vercel.json; then
    echo "✅ Google Translate domains in Vercel CSP"
else
    echo "❌ Google Translate domains missing from Vercel CSP"
fi

if grep -q "fonts.googleapis.com" vercel.json; then
    echo "✅ Google Fonts domains in Vercel CSP"
else
    echo "❌ Google Fonts domains missing from Vercel CSP"
fi

echo ""
echo "📋 MANUAL TESTING STEPS:"
echo ""
echo "1. 🌐 Open: http://localhost:5173/ (if running)"
echo "2. 👀 Look for Globe icon (🌐) in top-right navbar"
echo "3. 🖱️  Click the language switcher dropdown"
echo "4. 🇮🇳 Select 'हिन्दी' to test Hindi translation"
echo "5. 🇬🇧 Select 'English' to switch back"
echo "6. 📱 Test on mobile (resize browser < 640px)"
echo "7. 🔍 Check browser console for errors"
echo ""

echo "🎯 EXPECTED BEHAVIOR:"
echo ""
echo "✅ Language switcher appears in navbar"
echo "✅ Dropdown shows 'English' and 'हिन्दी' options"
echo "✅ Clicking options translates page content"
echo "✅ No CSP errors in browser console"
echo "✅ Smooth switching between languages"
echo ""

echo "🚨 COMMON ISSUES TO CHECK:"
echo ""
echo "❌ Language switcher not visible"
echo "❌ 'Refused to load stylesheet' errors"
echo "❌ Google Translate script blocked by CSP"
echo "❌ Translation not working when clicked"
echo "❌ Page reload instead of smooth translation"
echo ""

echo "🔗 QUICK LINKS:"
echo ""
if [ "$DEV_RUNNING" = true ]; then
    echo "🚀 Dev Site: http://localhost:5173/"
fi
if [ "$PREVIEW_RUNNING" = true ]; then
    echo "📦 Preview: http://localhost:4173/"
fi
echo "🧪 Diagnostic Tool: file://$(pwd)/language_diagnostic.html"
echo ""

echo "✨ DIAGNOSIS COMPLETE!"
echo "Now manually test the language functionality in your browser."
