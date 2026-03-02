#!/bin/bash
cd "$(dirname "$0")"
echo "Building Jekyll..."
bundle exec jekyll build
echo "Zipping _site..."
rm -f ../achadansori_site.zip
cd _site && zip -r ../../achadansori_site.zip .
echo "Done! File: $(realpath ../../achadansori_site.zip)"
