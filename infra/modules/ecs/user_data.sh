#!/bin/bash
set -e

# Update system
yum update -y
yum install -y docker git

# Start Docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Clone repository (you'll need to configure authentication)
# git clone https://github.com/ViralgaraJ/beautlyai-salon.git /opt/beautlyai

# Set environment variables from SSM Parameter Store
# This would be customized based on your application needs

echo "EC2 instance initialization complete"

