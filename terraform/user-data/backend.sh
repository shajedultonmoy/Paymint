#!/bin/bash
set -euo pipefail

cat >/etc/paymint.env <<ENV
NODE_ENV=production
PORT=5000
DB_HOST=${db_host}
DB_PORT=3306
DB_NAME=${db_name}
DB_USER=${db_username}
ENV

# Install Docker for Amazon Linux style images. Adjust this bootstrap for Ubuntu AMIs.
yum update -y
yum install -y docker git
systemctl enable docker
systemctl start docker
