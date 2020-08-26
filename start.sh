#!/bin/bash

echo "Performing migrations..."
npx knex migrate:latest --knexfile src/config/knexfile_kmq.js
if [ $1 == "dev" ]; then
    cd src 
    echo "Starting bot..."
    NODE_ENV=development node -r ts-node/register --inspect=9229 kmq
elif [ $1 == "prod" ]; then
    echo "Cleaning build..."
    rm -rf build/
    echo "Compiling typescript..."
    tsc
    echo "Copying assets..."
    cp -r src/assets build/src/assets
    cp -r data/ build/
    cd build/src 
    echo "Starting bot..."
    NODE_ENV=production node kmq.js
fi
