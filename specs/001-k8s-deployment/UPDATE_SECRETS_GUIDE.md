# Update Kubernetes Secrets - Quick Guide

This guide helps you update the Kubernetes secrets with your actual Neon PostgreSQL credentials to complete the deployment.

## Prerequisites

- Minikube cluster running
- Neon PostgreSQL database created
- kubectl configured

## Option 1: Using the Helper Script (Recommended)

We've created a helper script that guides you through the process:

```bash
# Make the script executable
chmod +x scripts/update-secrets.sh

# Run the script
./scripts/update-secrets.sh
```

The script will:
1. Prompt you for your credentials
2. Generate secure secrets for JWT and Better Auth (if you don't provide them)
3. Update the Kubernetes secret
4. Restart the backend deployment
5. Wait for pods to become ready
6. Show you the access URL

## Option 2: Manual Update

### Step 1: Get Your Neon PostgreSQL Credentials

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech:5432/dbname?sslmode=require
   ```

### Step 2: Generate Secure Secrets

Generate secure random strings for JWT and Better Auth:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate BETTER_AUTH_SECRET
openssl rand -base64 32
```

### Step 3: Update the Kubernetes Secret

```bash
# Delete the existing secret
kubectl delete secret todo-chatbot-secrets

# Create new secret with your actual values
kubectl create secret generic todo-chatbot-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/db?sslmode=require" \
  --from-literal=JWT_SECRET="your-generated-jwt-secret" \
  --from-literal=BETTER_AUTH_SECRET="your-generated-auth-secret" \
  --from-literal=BETTER_AUTH_URL="http://localhost:3000"
```

### Step 4: Restart Backend Deployment

```bash
# Restart the backend pods to pick up new secrets
kubectl rollout restart deployment/todo-chatbot-backend

# Wait for the rollout to complete
kubectl rollout status deployment/todo-chatbot-backend
```

### Step 5: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n default

# Expected output:
# NAME                                     READY   STATUS    RESTARTS   AGE
# todo-chatbot-backend-xxxxx-xxxxx         1/1     Running   0          1m
# todo-chatbot-backend-xxxxx-xxxxx         1/1     Running   0          1m
# todo-chatbot-frontend-xxxxx-xxxxx        1/1     Running   0          10m
# todo-chatbot-frontend-xxxxx-xxxxx        1/1     Running   0          10m
```

### Step 6: Test the Application

```bash
# Get the frontend URL
minikube service todo-chatbot-frontend --url

# Test backend health
kubectl exec -it deployment/todo-chatbot-frontend -- wget -O- http://todo-chatbot-backend:8000/health
```

## Troubleshooting

### Backend pods still crashing

Check the logs:
```bash
kubectl logs deployment/todo-chatbot-backend
```

Common issues:
- **Invalid database URL**: Verify the connection string format
- **Network connectivity**: Ensure Minikube can reach Neon (check firewall)
- **Database doesn't exist**: Create the database in Neon console
- **Wrong credentials**: Double-check username and password

### Connection timeout to Neon

If you see "connection timeout" errors:
1. Check your internet connection
2. Verify Neon database is running (not paused)
3. Check if your IP is allowed in Neon's IP allowlist (if configured)

### Secrets not updating

If pods don't pick up new secrets:
```bash
# Force delete and recreate pods
kubectl delete pods -l app=todo-chatbot-backend
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit secrets to Git**: The secrets are stored in Kubernetes only
2. **Use strong secrets**: Minimum 32 characters for JWT and auth secrets
3. **Rotate secrets regularly**: Update secrets periodically for security
4. **Limit database access**: Configure Neon IP allowlist if possible
5. **Use SSL**: Always use `sslmode=require` in DATABASE_URL

## Next Steps

Once the backend is running:

1. **Test the API**: Try creating a todo item
2. **Check logs**: Monitor for any errors
3. **Set up monitoring**: Consider adding Prometheus/Grafana
4. **Configure ingress**: For production, replace NodePort with Ingress
5. **Set up CI/CD**: Automate deployments with GitHub Actions

## Need Help?

- Check deployment status: `kubectl get all -n default`
- View events: `kubectl get events --sort-by='.lastTimestamp'`
- Describe pod: `kubectl describe pod <pod-name>`
- View logs: `kubectl logs <pod-name> --follow`
