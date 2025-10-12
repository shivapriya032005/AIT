#!/bin/bash
# Build and Deploy Script for AI Tester (Linux/Mac)

set -e  # Exit on error

echo "========================================"
echo "AI Tester - Build and Deploy Script"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install build tools
echo "Installing build tools..."
pip install build wheel setuptools

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf build/ dist/ *.egg-info

# Build wheel
echo ""
echo "Building wheel package..."
python -m build --wheel

# Check if build was successful
if [ -f "dist/ai_tester-1.0.0-py3-none-any.whl" ]; then
    echo ""
    echo "========================================"
    echo "Build successful!"
    echo "========================================"
    echo ""
    echo "Wheel package created: dist/ai_tester-1.0.0-py3-none-any.whl"
    echo ""
    echo "To install:"
    echo "  pip install dist/ai_tester-1.0.0-py3-none-any.whl"
    echo ""
    echo "To run:"
    echo "  python app.py"
    echo ""
else
    echo ""
    echo "========================================"
    echo "Build failed!"
    echo "========================================"
    echo "Please check the error messages above."
    exit 1
fi

# Ask if user wants to install
read -p "Do you want to install the package now? (y/n): " INSTALL
if [ "$INSTALL" = "y" ] || [ "$INSTALL" = "Y" ]; then
    echo ""
    echo "Installing package..."
    pip install dist/ai_tester-1.0.0-py3-none-any.whl
    echo ""
    echo "Installation complete!"
fi

echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Initialize database: python database.py"
echo "2. Set SECRET_KEY in oauth_config.py"
echo "3. Run application: python app.py"
echo "4. Access at: http://127.0.0.1:5000"
echo ""
