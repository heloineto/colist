#!/usr/bin/env bash
# Roll an ECS service onto an exact image.
#
# Terraform owns the task definition but ignores its container images
# (`ignore_changes = [task_definition]`), so deploys happen here: copy the live
# task definition, swap the `api` and `web` container images, register a new
# revision, and point the service at it. Both images ship in one revision so the
# SPA and the API it talks to always move together.
#
# Usage: deploy-ecs.sh <cluster> <service> <family> <api-image> <web-image>
set -euo pipefail

cluster="$1"
service="$2"
family="$3"
api_image="$4"
web_image="$5"

echo "Rolling $service onto api=$api_image web=$web_image"

current=$(aws ecs describe-task-definition --task-definition "$family" --query 'taskDefinition')

# Swap both images, then strip only the read-only fields describe returns that
# register-task-definition rejects. Denylisting these (the set is fixed by the
# ECS API) rather than whitelisting the fields we keep means any task-def field
# Terraform adds later carries through untouched instead of being silently dropped.
revision_input=$(echo "$current" | jq \
  --arg api_image "$api_image" --arg web_image "$web_image" \
  '.containerDefinitions |= map(
      if .name == "api" then .image = $api_image
      elif .name == "web" then .image = $web_image
      else . end)
   | del(.taskDefinitionArn, .revision, .status, .requiresAttributes,
         .compatibilities, .registeredAt, .registeredBy)')

revision_arn=$(aws ecs register-task-definition \
  --cli-input-json "$revision_input" \
  --query 'taskDefinition.taskDefinitionArn' --output text)
echo "Registered $revision_arn"

aws ecs update-service \
  --cluster "$cluster" \
  --service "$service" \
  --task-definition "$revision_arn" >/dev/null
echo "Updated service, waiting for it to become stable"

aws ecs wait services-stable --cluster "$cluster" --services "$service"
echo "Service $service is stable on $revision_arn"
