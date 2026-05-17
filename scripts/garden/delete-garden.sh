#!/bin/bash

GARDEN_NAME=$1

if [ -z "$GARDEN_NAME" ]; then
  echo "Usage: ./delete-garden.sh <garden-name>"
  exit 1
fi

content_dir="content/garden/$GARDEN_NAME"
data_dir="data/garden/$GARDEN_NAME"

# Check if at least one directory exists before prompting
if [[ ! -d "$content_dir" && ! -d "$data_dir" ]]; then
  echo "⚠️ Garden '$GARDEN_NAME' does not exist. Did you make a typo?"
  exit 1
fi

# Confirmation Prompt
echo "⚠️  WARNING: You are about to permanently delete the '$GARDEN_NAME' garden."
echo "This will remove all content in '$content_dir' and data in '$data_dir'."
read -p "Are you sure you want to proceed? (y/N): " confirm

# Only proceed if user enters 'y' or 'Y'
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "🚫 Deletion cancelled."
  exit 0
fi

garden_deleted=false
for dir in "$content_dir" "$data_dir"; do
  if [[ -d "$dir" ]]; then
    rm -rf "$dir"
    garden_deleted=true
  fi
done

if [ "$garden_deleted" = true ]; then
  echo "🧨 Garden '$GARDEN_NAME' has been deleted!"
fi