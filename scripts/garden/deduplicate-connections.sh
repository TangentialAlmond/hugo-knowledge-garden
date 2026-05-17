#!/bin/bash

GARDEN_NAME=$1

if [ -z "$GARDEN_NAME" ]; then
  echo "Usage: ./deduplicate-connections.sh <garden-name>"
  exit 1
fi

connections_dir="data/garden/$GARDEN_NAME/connections"
main_path="$connections_dir/main.yaml"
detour_path="$connections_dir/detour.yaml"

if [[ ! -d "$connections_dir" ]]; then
  echo "⚠️ Garden '$GARDEN_NAME' does not exist. Did you make a typo?"
  exit 1
fi

if [ ! -f $main_path ] || [ ! -f $detour_path]; then
  echo "⚠️ Garden '$GARDEN_NAME' does not have a main.yaml or detour.yaml. Please check $connections_dir"
fi

# Function to deduplicate a YAML array of objects
deduplicate_file() {
  local file=$1
  if [[ -f "$file" ]]; then
    # unique_by(.) looks at the entire object (from and to) 
    # to determine if it is a duplicate.
    yq -i ". = (. // [] | unique_by(.))" "$file"
    echo "✨ Deduplicated $(basename "$file")"
  else
    echo "📝 Skipping $(basename "$file") (not found)"
  fi
}

deduplicate_file "$main_path"
deduplicate_file "$detour_path"

echo "✅ Connection cleanup complete for '$GARDEN_NAME'!"