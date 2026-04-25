#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${1:-dev}"

echo "Cleaning failed pods in namespace ${NAMESPACE}..."
kubectl delete pod -n "${NAMESPACE}" --field-selector=status.phase=Failed --ignore-not-found=true

echo "Deleting evicted pods in namespace ${NAMESPACE}..."
kubectl get pods -n "${NAMESPACE}" --no-headers 2>/dev/null | awk '$3=="Evicted" {print $1}' | xargs -r kubectl delete pod -n "${NAMESPACE}"

echo "Deleting non-current ReplicaSets for app deployments..."
for deploy in mongodb api-gateway auth-service user-service station-service booking-service payment-service review-service admin-service frontend; do
  kubectl rollout restart deployment/"${deploy}" -n "${NAMESPACE}"
done

sleep 5

for deploy in mongodb api-gateway auth-service user-service station-service booking-service payment-service review-service admin-service frontend; do
  current_rs="$(kubectl get rs -n "${NAMESPACE}" -l app=${deploy} -o jsonpath='{range .items[?(@.status.replicas>0)]}{.metadata.name}{"\n"}{end}' | head -n 1 || true)"
  if [[ -n "${current_rs}" ]]; then
    kubectl get rs -n "${NAMESPACE}" -l app=${deploy} -o name | grep -v "${current_rs}" | xargs -r kubectl delete -n "${NAMESPACE}"
  fi
done

echo "Current pods:"
kubectl get pods -n "${NAMESPACE}"
