#!/bin/bash
# LeapJuice Ghost Build Script
# Builds and pushes the LeapJuice Ghost Custom Email Docker image

set -e

# Configuration
IMAGE_NAME="leapjuice/ghost-custom-email"
VERSION="6.20.1-leapjuice"
DOCKERFILE="Dockerfile.leapjuice"

echo "=========================================="
echo "LeapJuice Ghost CMS Build Script"
echo "Version: $VERSION"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if logged in to Docker Hub
echo ""
echo "Step 1: Checking Docker Hub login..."
if ! docker info &> /dev/null; then
    echo "Please log in to Docker Hub:"
    echo "  docker login -u leapjuice"
    exit 1
fi

# Build the image
echo ""
echo "Step 2: Building Docker image..."
echo "This may take several minutes on first build..."

# First, we need to prepare the Ghost build
echo "Preparing Ghost build..."
cd ghost/core

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    yarn install --production --prefer-offline
fi

# Build the admin (required for the Docker image)
echo "Building Ghost admin..."
yarn build:admin

# Go back to root
cd ../..

# Now build the Docker image
echo "Building Docker image: ${IMAGE_NAME}:${VERSION}"
docker build \
    -f ${DOCKERFILE} \
    -t ${IMAGE_NAME}:${VERSION} \
    -t ${IMAGE_NAME}:latest \
    -t ${IMAGE_NAME}:6.20.1 \
    .

echo ""
echo "=========================================="
echo "Build completed successfully!"
echo "=========================================="
echo ""
echo "Image tags created:"
echo "  - ${IMAGE_NAME}:${VERSION}"
echo "  - ${IMAGE_NAME}:latest"
echo "  - ${IMAGE_NAME}:6.20.1"
echo ""

# Push to Docker Hub
read -p "Push to Docker Hub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Pushing to Docker Hub..."
    docker push ${IMAGE_NAME}:${VERSION}
    docker push ${IMAGE_NAME}:latest
    docker push ${IMAGE_NAME}:6.20.1
    echo ""
    echo "=========================================="
    echo "Successfully pushed to Docker Hub!"
    echo "=========================================="
    echo ""
    echo "Your image is available at:"
    echo "  https://hub.docker.com/r/${IMAGE_NAME}"
    echo ""
    echo "To run locally:"
    echo "  docker run -d -p 2368:2368 -e url=http://localhost:2368 ${IMAGE_NAME}:latest"
    echo ""
else
    echo ""
    echo "Build complete. To push later, run:"
    echo "  docker push ${IMAGE_NAME}:${VERSION}"
fi
