#!/bin/bash
# Neural Solver - NPM Installation Script
# Use this script to install all dependencies with correct versions
# Resolves INVALIDTAGNAME errors and manages peer dependency conflicts

echo "🚀 Installing Neural Solver Frontend Dependencies..."
echo "=================================================="

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Clean previous installations (optional, uncomment if needed)
# rm -rf node_modules package-lock.json

# Install with legacy peer deps flag (required for Codespaces)
npm install --legacy-peer-deps

echo ""
echo "✅ Installation complete!"
echo ""
echo "📦 Installed packages:"
echo "  - react@^18.2.0"
echo "  - react-dom@^18.2.0"
echo "  - three@^0.157.0"
echo "  - @react-three/fiber@^8.14.0"
echo "  - @react-three/drei@^9.90.0"
echo "  - @react-three/postprocessing@^2.15.0"
echo "  - gsap@^3.12.2"
echo "  - framer-motion@^10.16.0"
echo ""
echo "🎯 Next steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Open http://localhost:5173"
echo "  3. Use the Neural Solver dashboard!"
