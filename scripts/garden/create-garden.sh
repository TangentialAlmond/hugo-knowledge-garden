#!/bin/bash

GARDEN_NAME=$1

if [ -z "$GARDEN_NAME" ]; then
  echo "Usage: ./create-garden.sh <garden-name>"
  exit 1
fi

# Create the content bundle using the archetype
hugo new garden/$GARDEN_NAME/index.md --kind garden

# Create the data directories
mkdir -p data/garden/$GARDEN_NAME/nodes
mkdir -p data/garden/$GARDEN_NAME/connections

# Initialize empty edge lists
touch data/garden/$GARDEN_NAME/connections/main.yaml
touch data/garden/$GARDEN_NAME/connections/detour.yaml

echo "🪴 Garden '$GARDEN_NAME' has been planted!"