#!/bin/bash

# Type 3 Solar Platform - Task Management Helper

PROJECT_ROOT="/Users/sakshammahajan/Documents/type 3"
TASK_DATA_DIR="$PROJECT_ROOT/.task-manager-data"
TASK_MANAGER_PATH="$PROJECT_ROOT/task-manager"

# Ensure data directory exists
mkdir -p "$TASK_DATA_DIR"

# Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Categories
declare -A CATEGORIES=(
  ["Development"]="Technical implementation and coding tasks"
  ["Design"]="UI/UX design and visual planning"
  ["Product Management"]="Feature planning and requirements"
  ["Operations"]="Infrastructure and system maintenance"
  ["Marketing"]="Promotional and communication tasks"
  ["Sales"]="Customer acquisition and business development"
)

add_task() {
  local category="$1"
  shift
  local title="$*"

  # Validate inputs
  if [[ -z "$category" || -z "$title" ]]; then
    echo -e "${RED}Error: Category and title are required${NC}"
    echo "Usage: $0 add <category> <task title>"
    exit 1
  fi

  # Check if category exists
  if [[ -z "${CATEGORIES[$category]}" ]]; then
    echo -e "${RED}Invalid category. Available categories:${NC}"
    for cat in "${!CATEGORIES[@]}"; do
      echo -e "${YELLOW}$cat${NC}: ${CATEGORIES[$cat]}"
    done
    exit 1
  fi

  # Generate unique task ID
  local timestamp=$(date +"%Y%m%d%H%M%S")
  local task_file="$TASK_DATA_DIR/task_${timestamp}.json"

  # Create task JSON
  cat > "$task_file" << EOL
{
  "id": "${timestamp}",
  "title": "$title",
  "category": "$category",
  "status": "pending",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOL

  echo -e "${GREEN}✅ Task created successfully:${NC}"
  echo -e "${YELLOW}ID:${NC} ${timestamp}"
  echo -e "${YELLOW}Title:${NC} $title"
  echo -e "${YELLOW}Category:${NC} $category"
}

list_tasks() {
  local category="${1:-}"

  echo -e "${YELLOW}Current Tasks:${NC}"
  
  if [[ -z "$category" ]]; then
    # List all tasks
    for task_file in "$TASK_DATA_DIR"/task_*.json; do
      [[ -e "$task_file" ]] || continue
      jq -r '.id + " | " + .category + " | " + .title + " | " + .status' "$task_file"
    done
  else
    # List tasks by category
    if [[ -z "${CATEGORIES[$category]}" ]]; then
      echo -e "${RED}Invalid category. Available categories:${NC}"
      for cat in "${!CATEGORIES[@]}"; do
        echo -e "${YELLOW}$cat${NC}: ${CATEGORIES[$cat]}"
      done
      exit 1
    fi

    for task_file in "$TASK_DATA_DIR"/task_*.json; do
      [[ -e "$task_file" ]] || continue
      if jq -e --arg cat "$category" '.category == $cat' "$task_file" > /dev/null; then
        jq -r '.id + " | " + .category + " | " + .title + " | " + .status' "$task_file"
      fi
    done
  fi
}

update_task() {
  local task_id="$1"
  local status="$2"

  local task_file=$(find "$TASK_DATA_DIR" -name "task_${task_id}*.json")
  
  if [[ -z "$task_file" ]]; then
    echo -e "${RED}Task not found${NC}"
    exit 1
  fi

  # Update task status
  jq --arg status "$status" '.status = $status | .updated_at = "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"' "$task_file" > "${task_file}.tmp"
  mv "${task_file}.tmp" "$task_file"

  echo -e "${GREEN}✅ Task updated:${NC}"
  jq -r '.id + " | " + .category + " | " + .title + " | " + .status' "$task_file"
}

categories() {
  echo -e "${YELLOW}Available Categories:${NC}"
  for cat in "${!CATEGORIES[@]}"; do
    echo -e "${GREEN}$cat${NC}: ${CATEGORIES[$cat]}"
  done
}

case "$1" in
  add)
    shift
    add_task "$@"
    ;;
  list)
    shift
    list_tasks "$@"
    ;;
  update)
    shift
    update_task "$@"
    ;;
  categories)
    categories
    ;;
  *)
    echo "Usage:"
    echo "$0 add <category> <task title>"
    echo "$0 list [optional category]"
    echo "$0 update <task_id> <status>"
    echo "$0 categories"
    exit 1
    ;;
esac
  categories)
    echo "Available Categories:"
    printf '%s\n' "${VALID_CATEGORIES[@]}"
    ;;
  *)
    echo "Usage:"
    echo "$0 add <category> <task title>"
    echo "$0 list [optional category]"
    echo "$0 categories"
    exit 1
    ;;
esac
