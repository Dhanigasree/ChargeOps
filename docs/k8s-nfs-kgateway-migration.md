# ChargeOps NFS + kgateway Migration Guide

This guide replaces the current hostPath MongoDB and in-app `api-gateway` with:

- NFS-backed dynamic provisioning
- MongoDB `StatefulSet`
- `kgateway` + Gateway API routing
- frontend exposed through `kgateway`
- HAProxy as the external load balancer

## Assumptions Confirmed

- only `k8s/` is the manifest source of truth
- `frontend` moves behind `kgateway` and becomes `ClusterIP`
- existing MongoDB data does not need to be preserved
- no existing ingress controller is used
- `kgateway` is the only gateway layer
- HAProxy is external to the cluster and forwards traffic to NodePort services created by `kgateway`

## Important Behavior Change

The in-app `api-gateway` is removed from the manifest tree and replaced with Gateway API routing:

- `/api/auth` -> `auth-service:8001`
- `/api/users` -> `user-service:8002`
- `/api/stations` -> `station-service:8003`
- `/api/bookings` -> `booking-service:8004`
- `/api/payments` -> `payment-service:8005`
- `/api/reviews` -> `review-service:8006`
- `/api/admin` -> `admin-service:8007`
- `/` -> `frontend:80`

Because the frontend already uses relative `/api` requests, this routing model works without application code changes.

## Files Added or Changed

### Storage

- `k8s/storage/nfs-storageclass.yaml`
- `k8s/storage/kustomization.yaml`
- `k8s/storage/nfs-provisioner-values.yaml`

### Gateway

- `k8s/gateway/dev-gateway-parameters.yaml`
- `k8s/gateway/prod-gateway-parameters.yaml`
- `k8s/gateway/dev-gateway.yaml`
- `k8s/gateway/prod-gateway.yaml`
- `k8s/gateway/dev-httproutes.yaml`
- `k8s/gateway/prod-httproutes.yaml`
- `k8s/gateway/kgateway-values.yaml`
- `k8s/gateway/haproxy.cfg.example`

### Frontend

- `k8s/dev/frontend/service.yaml`
- `k8s/prod/frontend/service.yaml`

### MongoDB

- `k8s/dev/mongodb/deployment.yaml` now contains a `StatefulSet`
- `k8s/prod/mongodb/deployment.yaml` now contains a `StatefulSet`
- `k8s/dev/mongodb/service.yaml` now includes both headless and client services
- `k8s/prod/mongodb/service.yaml` now includes both headless and client services

### Network policies

- `k8s/dev/network-policies.yaml`
- `k8s/prod/network-policies.yaml`

## NFS Dynamic Provisioning Setup

### 1. Install and configure the NFS server

Run on the host you want to use as the NFS server:

```bash
sudo apt update
sudo apt install -y nfs-kernel-server
sudo mkdir -p /srv/nfs/chargeops
sudo chown -R nobody:nogroup /srv/nfs/chargeops
sudo chmod 0777 /srv/nfs/chargeops
echo "/srv/nfs/chargeops *(rw,sync,no_subtree_check,no_root_squash)" | sudo tee /etc/exports
sudo exportfs -rav
sudo systemctl enable --now nfs-kernel-server
sudo exportfs -v
```

Check from a cluster node:

```bash
showmount -e <NFS_SERVER_IP>
```

### 2. Install the NFS subdir external provisioner

Official helm repo:

```bash
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
helm repo update
```

Edit `k8s/storage/nfs-provisioner-values.yaml` and replace:

- `10.0.0.10` with your NFS server IP
- `/srv/nfs/chargeops` with your exported path

Install:

```bash
helm upgrade -i nfs-subdir-external-provisioner \
  nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
  --namespace nfs-provisioner \
  --create-namespace \
  -f k8s/storage/nfs-provisioner-values.yaml
```

### 3. Create the StorageClass

```bash
kubectl apply -k k8s/storage
kubectl get storageclass
```

Expected:

- `chargeops-nfs`

### 4. Validate dynamic PVC binding before MongoDB migration

Create a test claim:

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: nfs-smoke-test
  namespace: dev
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: chargeops-nfs
  resources:
    requests:
      storage: 1Gi
EOF
```

Verify:

```bash
kubectl get pvc -n dev nfs-smoke-test
kubectl describe pvc -n dev nfs-smoke-test
kubectl get pv
```

Delete after success:

```bash
kubectl delete pvc -n dev nfs-smoke-test
```

## kgateway Installation Steps

### 1. Install Gateway API CRDs

Use the official standard CRDs:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.4.0/standard-install.yaml
kubectl get crd gateways.gateway.networking.k8s.io httproutes.gateway.networking.k8s.io
```

### 2. Install kgateway CRDs

```bash
helm upgrade -i --create-namespace \
  --namespace kgateway-system \
  --version v2.1.2 \
  kgateway-crds oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds
```

### 3. Install kgateway control plane

```bash
helm upgrade -i -n kgateway-system kgateway \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway \
  --version v2.1.2 \
  -f k8s/gateway/kgateway-values.yaml
```

### 4. Wait for kgateway readiness

```bash
kubectl get pods -n kgateway-system
kubectl rollout status deploy/kgateway -n kgateway-system --timeout=180s
kubectl get gatewayclass
```

## Full Sequential Deployment Guide

### Pre-flight checks

```bash
kubectl get ns
kubectl version
kubectl get sc
helm version
```

### 1. Namespaces

```bash
kubectl apply -f k8s/namespace/
```

### 2. NFS server and provisioner

Complete the NFS setup and install steps above first.

### 3. Gateway API and kgateway

Run the Gateway API and kgateway install commands above.

### 4. Apply kgateway resources

```bash
kubectl apply -k k8s/gateway
kubectl get gateway -A
kubectl get httproute -A
```

### 5. Remove the old API gateway resources

```bash
kubectl delete deployment api-gateway -n dev --ignore-not-found=true
kubectl delete service api-gateway -n dev --ignore-not-found=true
kubectl delete deployment api-gateway -n prod --ignore-not-found=true
kubectl delete service api-gateway -n prod --ignore-not-found=true
```

### 6. Replace old MongoDB storage model

Because data does not need to be preserved:

```bash
kubectl delete deployment mongodb -n dev --ignore-not-found=true
kubectl delete deployment mongodb -n prod --ignore-not-found=true
kubectl delete pvc mongodb-pvc -n dev --ignore-not-found=true
kubectl delete pvc mongodb-pvc -n prod --ignore-not-found=true
kubectl delete pv mongodb-pv-dev --ignore-not-found=true
kubectl delete pv mongodb-pv-prod --ignore-not-found=true
```

### 7. Apply application manifests

```bash
kubectl apply -k k8s/dev
kubectl apply -k k8s/prod
```

### 8. Verify StatefulSet and routes

```bash
kubectl get statefulset -n dev
kubectl get statefulset -n prod
kubectl get pods -n dev
kubectl get pods -n prod
kubectl get svc -n dev
kubectl get svc -n prod
kubectl get pvc -n dev
kubectl get pvc -n prod
```

### 9. Discover the kgateway NodePorts

```bash
kubectl get svc -n dev -l gateway=chargeops
kubectl get svc -n prod -l gateway=chargeops
```

Record the NodePort values and update `k8s/gateway/haproxy.cfg.example`.

### 10. Configure HAProxy

Use `k8s/gateway/haproxy.cfg.example` as the starting point.

Update:

- backend node IPs
- dev NodePort
- prod NodePort
- DNS hostnames

Restart HAProxy and test:

```bash
curl -H "Host: dev.chargeops.local" http://<HAPROXY_IP>/
curl -H "Host: prod.chargeops.local" http://<HAPROXY_IP>/
curl -H "Host: dev.chargeops.local" http://<HAPROXY_IP>/api/auth/health
curl -H "Host: prod.chargeops.local" http://<HAPROXY_IP>/api/users/health
```

## Updated Communication Map

### External

- client -> HAProxy : HTTP/HTTPS
- HAProxy -> kgateway proxy NodePort : HTTP

### Gateway layer

- kgateway -> `frontend:80`
- kgateway -> `auth-service:8001`
- kgateway -> `user-service:8002`
- kgateway -> `station-service:8003`
- kgateway -> `booking-service:8004`
- kgateway -> `payment-service:8005`
- kgateway -> `review-service:8006`
- kgateway -> `admin-service:8007`

### East-west service calls still unchanged

- `admin-service` -> `user-service:8002`
- `admin-service` -> `station-service:8003`
- `admin-service` -> `booking-service:8004`
- `admin-service` -> `payment-service:8005`
- `payment-service` -> `booking-service:8004`
- all backend services -> `mongodb:27017`

### Previously through old gateway, now through kgateway

Moved from old `api-gateway` to `kgateway`:

- `/api/auth`
- `/api/users`
- `/api/stations`
- `/api/bookings`
- `/api/payments`
- `/api/reviews`
- `/api/admin`
- `/`

Cross-namespace communication remains:

- none between app namespaces
- HAProxy is external to the cluster

## Troubleshooting

### MongoDB StatefulSet

Check:

```bash
kubectl get statefulset -n dev
kubectl describe statefulset mongodb -n dev
kubectl get pods -n dev -l app=mongodb
kubectl logs -n dev statefulset/mongodb
kubectl get pvc -n dev
```

Top failure modes:

1. PVC stuck `Pending`
   - cause: NFS provisioner or StorageClass issue
   - fix: verify `chargeops-nfs` exists and provisioner pod is running

2. pod stuck `ContainerCreating`
   - cause: mount failure to NFS
   - fix: confirm NFS export is reachable from cluster nodes

3. app services failing after Mongo restart
   - cause: MongoDB not ready yet
   - fix: wait for StatefulSet readiness, then restart app deployments if needed

### NFS PVC Binding

Check:

```bash
kubectl get storageclass
kubectl get pods -n nfs-provisioner
kubectl logs -n nfs-provisioner deploy/nfs-subdir-external-provisioner
kubectl describe pvc -n dev <pvc-name>
kubectl get events -A --sort-by=.lastTimestamp
```

Top failure modes:

1. `ProvisioningFailed`
   - cause: wrong `nfs.server` or `nfs.path`
   - fix: update `k8s/storage/nfs-provisioner-values.yaml` and upgrade Helm release

2. permission denied on export
   - cause: NFS export permissions
   - fix: update `/etc/exports`, re-run `exportfs -rav`, verify `chmod/chown`

3. provisioner running but no PV created
   - cause: StorageClass provisioner name mismatch
   - fix: ensure `k8s/storage/nfs-storageclass.yaml` uses `k8s-sigs.io/nfs-subdir-external-provisioner`

### kgateway Routing

Check:

```bash
kubectl get gateway -A
kubectl describe gateway chargeops -n dev
kubectl get httproute -A
kubectl describe httproute chargeops-api -n dev
kubectl get svc -A | grep chargeops
kubectl get pods -A | grep kgateway
kubectl logs -n kgateway-system deploy/kgateway
```

Top failure modes:

1. Gateway not accepted
   - cause: CRDs or kgateway controller not ready
   - fix: confirm Gateway API CRDs and kgateway CRDs installed before applying Gateway manifests

2. route accepted but backend unreachable
   - cause: network policy denies ingress from kgateway proxy
   - fix: verify proxy pod labels match `app: kgateway-proxy`

3. HAProxy gets connection refused
   - cause: wrong NodePort or wrong node IP
   - fix: re-check `kubectl get svc -A -l gateway=chargeops`

4. frontend loads but `/api/*` fails
   - cause: HTTPRoute ordering or hostname mismatch
   - fix: confirm the request host matches `dev.chargeops.local` or `prod.chargeops.local`

## Commands Summary

```bash
kubectl apply -f k8s/namespace/
kubectl apply -k k8s/storage
kubectl apply -k k8s/gateway
kubectl apply -k k8s/dev
kubectl apply -k k8s/prod
```

Helm:

```bash
helm upgrade -i nfs-subdir-external-provisioner \
  nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
  --namespace nfs-provisioner \
  --create-namespace \
  -f k8s/storage/nfs-provisioner-values.yaml

helm upgrade -i --create-namespace \
  --namespace kgateway-system \
  --version v2.1.2 \
  kgateway-crds oci://cr.kgateway.dev/kgateway-dev/charts/kgateway-crds

helm upgrade -i -n kgateway-system kgateway \
  oci://cr.kgateway.dev/kgateway-dev/charts/kgateway \
  --version v2.1.2 \
  -f k8s/gateway/kgateway-values.yaml
```
