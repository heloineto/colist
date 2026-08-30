#!/usr/bin/env bash
# Port-forward the private RDS instance to localhost:5432 through the EC2 box
# (SSM Session Manager, no SSH). Needs the session-manager-plugin and the
# voto-a-voto AWS profile (see scripts/setup-aws-prod.sh). Ctrl-C to close.
#
# Usage: scripts/db-tunnel.sh [local-port]
set -euo pipefail

stack=iac/environments/production
local_port="${1:-5432}"
instance=$(terraform -chdir="$stack" output -raw instance_id)
db_host=$(terraform -chdir="$stack" output -raw db_address)

echo "Forwarding localhost:$local_port → $db_host:5432 via $instance (sslmode=require)"
aws ssm start-session --target "$instance" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "host=$db_host,portNumber=5432,localPortNumber=$local_port"
