#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-dev}"

DEPLOYMENTS=(
  mongodb
  api-gateway
  auth-service
  user-service
  station-service
  booking-service
  payment-service
  review-service
  admin-service
  frontend
)

echo "Deleting current deployments in ${NAMESPACE}..."
kubectl delete deployment "${DEPLOYMENTS[@]}" -n "${NAMESPACE}" --ignore-not-found=true

echo "Deleting old ReplicaSets in ${NAMESPACE}..."
kubectl delete rs --all -n "${NAMESPACE}" --ignore-not-found=true

echo "Deleting old pods in ${NAMESPACE}..."
kubectl delete pod --all -n "${NAMESPACE}" --ignore-not-found=true

echo "Re-applying manifests..."
kubectl apply -f k8s/dev/

echo "Waiting for deployments..."
for deploy in "${DEPLOYMENTS[@]}"; do
  kubectl rollout status deployment/"${deploy}" -n "${NAMESPACE}" --timeout=180s
done

echo "Final pod state:"
kubectl get pods -n "${NAMESPACE}"
