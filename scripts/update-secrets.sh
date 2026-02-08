#!/bin/bash
# update-secrets.sh
# Helper script to update Kubernetes secrets for Todo Chatbot deployment

set -e

echo "=========================================="
echo "Todo Chatbot - Update Kubernetes Secrets"
echo "=========================================="
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ Error: kubectl is not installed or not in PATH"
    exit 1
fi

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo "❌ Error: Minikube is not running. Start it with: minikube start"
    exit 1
fi

echo "📋 You need to provide the following credentials:"
echo ""
echo "1. DATABASE_URL - Your Neon PostgreSQL connection string"
echo "   Format: postgresql://username:password@host.neon.tech:5432/dbname?sslmode=require"
echo "   Get this from: https://console.neon.tech/ → Your Project → Connection Details"
echo ""
echo "2. JWT_SECRET - A secure random string (minimum 32 characters)"
echo "   Generate with: openssl rand -base64 32"
echo ""
echo "3. BETTER_AUTH_SECRET - A secure random string (minimum 32 characters)"
echo "   Generate with: openssl rand -base64 32"
echo ""
echo "4. BETTER_AUTH_URL - Your application URL"
echo "   For local development: http://localhost:3000"
echo "   For production: https://yourdomain.com"
echo ""

# Prompt for credentials
read -p "Enter DATABASE_URL: " DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL cannot be empty"
    exit 1
fi

read -p "Enter JWT_SECRET (or press Enter to generate): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated JWT_SECRET: $JWT_SECRET"
fi

read -p "Enter BETTER_AUTH_SECRET (or press Enter to generate): " BETTER_AUTH_SECRET
if [ -z "$BETTER_AUTH_SECRET" ]; then
    BETTER_AUTH_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated BETTER_AUTH_SECRET: $BETTER_AUTH_SECRET"
fi

read -p "Enter BETTER_AUTH_URL [http://localhost:3000]: " BETTER_AUTH_URL
BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:3000}

echo ""
echo "📝 Summary of credentials:"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "  JWT_SECRET: ${JWT_SECRET:0:20}..."
echo "  BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET:0:20}..."
echo "  BETTER_AUTH_URL: $BETTER_AUTH_URL"
echo ""

read -p "Do you want to proceed with updating the secrets? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Aborted by user"
    exit 0
fi

echo ""
echo "🔄 Deleting existing secret..."
kubectl delete secret todo-chatbot-secrets --ignore-not-found=true

echo "✅ Creating new secret..."
kubectl create secret generic todo-chatbot-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
  --from-literal=BETTER_AUTH_URL="$BETTER_AUTH_URL"

echo "✅ Secret created successfully!"
echo ""

echo "🔄 Restarting backend deployment..."
kubectl rollout restart deployment/todo-chatbot-backend

echo "⏳ Waiting for backend pods to be ready..."
if kubectl rollout status deployment/todo-chatbot-backend --timeout=120s; then
    echo "✅ Backend deployment successful!"
    echo ""
    echo "📊 Current pod status:"
    kubectl get pods -n default
    echo ""
    echo "🎉 Deployment complete! Your Todo Chatbot is now running."
    echo ""
    echo "🌐 Access the frontend at:"
    minikube service todo-chatbot-frontend --url
else
    echo "⚠️  Backend deployment is taking longer than expected."
    echo "Check pod status with: kubectl get pods"
    echo "Check pod logs with: kubectl logs <pod-name>"
fi
