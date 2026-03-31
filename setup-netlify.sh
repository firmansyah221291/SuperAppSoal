#!/bin/bash

# Script to set up Netlify environment variables
# Usage: ./setup-netlify.sh YOUR_GEMINI_API_KEY

if [ -z "$1" ]; then
  echo "Usage: ./setup-netlify.sh YOUR_GEMINI_API_KEY"
  exit 1
fi

API_KEY=$1

echo "Setting up Netlify environment variables..."

# Set the variable for the build and runtime
netlify env:set GEMINI_API_KEY "$API_KEY"

echo "Done! Make sure you have the Netlify CLI installed and are logged in."
echo "Run 'netlify deploy --prod' to deploy your changes."
