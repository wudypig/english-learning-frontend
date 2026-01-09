#!/bin/bash

# Frontend Deployment Script for Firebase Hosting

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying frontend to Firebase Hosting...${NC}\n"

# Build
echo -e "${YELLOW}📦 Building production bundle...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}\n"

# Deploy
echo -e "${YELLOW}☁️  Deploying to Firebase Hosting...${NC}"
firebase deploy --only hosting

echo -e "${GREEN}✓ Deployment complete${NC}\n"

# Get URL
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Frontend deployed!${NC}"
echo -e "${BLUE}Check Firebase Console for your URL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
