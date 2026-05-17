#!/bin/bash

GARDEN_NAME=$1
NODE=$2

if [ -z "$GARDEN_NAME" ] || [ -z "$NODE" ]; then
  echo "Usage: ./delete-node.sh <garden-name> <node-id>"
  exit 1
fi

# Matches: only lowercase letters, numbers, and hyphens. 
# Cannot start or end with a hyphen.
KEBAB_REGEX="^[a-z0-9]+(-[a-z0-9]+)*$"
if [[ ! $NODE =~ $KEBAB_REGEX ]]; then
  echo "❌ Error: Node ID '$NODE' is not valid kebab-case."
  echo "Node IDs must be lowercase, use hyphens instead of spaces/underscores, and contain no special characters."
  exit 1
fi

data_dir="data/garden/$GARDEN_NAME"
node_path="$data_dir/nodes/$NODE.yaml"
connections_dir="$data_dir/connections"

# Check if the data directory exists
if [[ ! -d "$data_dir" ]]; then
  echo "⚠️ Garden '$GARDEN_NAME' does not exist. Did you make a typo?"
  exit 1
fi

# Check if the node exists
if [[ ! -f "$node_path" ]]; then
  echo "⚠️ Node '$NODE' does not exist in garden '$GARDEN_NAME'. Did you make a typo?"
  exit 1
fi

# Confirmation Prompt
echo "⚠️  WARNING: You are about to permanently delete the '$NODE' node from '$GARDEN_NAME'."
echo "This will remove the node file and any edges in main.yaml/detour.yaml."
read -p "Are you sure you want to proceed? (y/N): " confirm

# Only proceed if user enters 'y' or 'Y'
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "🚫 Deletion cancelled."
  exit 0
fi

# Delete the node's yaml file
rm -f "$node_path"

clean_connections() {
  local file=$1
  if [[ -f "$file" ]]; then
    # Use yq to filter the array: 
    # Keep only items where 'from' is NOT the node AND 'to' is NOT the node.
    # The -i flag updates the file in-place.
    yq -i "del(.[] | select(.from == \"$NODE\" or .to == \"$NODE\"))" "$file"
    
    echo "🧹 Cleaned connections in $(basename "$file") using yq"
  fi
}

clean_connections "$connections_dir/main.yaml"
clean_connections "$connections_dir/detour.yaml"
 
echo "✂️ Node '$NODE' and its connections have been deleted from '$GARDEN_NAME'!"