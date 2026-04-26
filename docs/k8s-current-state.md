# ChargeOps Kubernetes Current State

This document captures the current `k8s/` manifest state before any MongoDB, gateway, or storage migration work.

## Important Note

The requested next changes are not a safe refactor:

- MongoDB `Deployment` -> `StatefulSet`
- hostPath / static PV-PVC flow -> dynamic NFS provisioning
- removal of the current `api-gateway`
- replacement with `kgateway`

Those changes can recreate pods and temporarily interrupt traffic. This file is the baseline snapshot before that work.

## Current Folder Layout

The repository currently contains both:

1. Older environment-level aggregate files:
   - `k8s/dev/api-gateway.yaml`
   - `k8s/dev/backend-services.yaml`
   - `k8s/dev/mongodb.yaml`
   - `k8s/dev/storage.yaml`
   - `k8s/dev/frontend.yaml`
   - same pattern under `k8s/prod/`

2. Newer split layout files:
   - `k8s/namespace/`
   - `k8s/gateway/`
   - `k8s/dev/<service>/...`
   - `k8s/prod/<service>/...`
   - `k8s/dev/kustomization.yaml`
   - `k8s/prod/kustomization.yaml`

The split layout was generated from the aggregate manifests and currently preserves the same values.

## Namespaces

Current namespace manifests:

- `k8s/namespace/dev-namespace.yaml`
- `k8s/namespace/prod-namespace.yaml`

Namespaces in use:

- `dev`
- `prod`

## Current Gateway State

### What exists now

The current gateway layer is an application-level API gateway, not an Ingress or Gateway API controller.

Files:

- `k8s/dev/api-gateway.yaml`
- `k8s/prod/api-gateway.yaml`
- `k8s/gateway/deployment.yaml`
- `k8s/gateway/service.yaml`

### Current behavior

- `api-gateway` is deployed separately in both `dev` and `prod`
- service type is `ClusterIP`
- listens on port `8000`
- forwards requests to all backend services using env secrets:
  - `AUTH_SERVICE_URL=http://auth-service:8001`
  - `USER_SERVICE_URL=http://user-service:8002`
  - `STATION_SERVICE_URL=http://station-service:8003`
  - `BOOKING_SERVICE_URL=http://booking-service:8004`
  - `PAYMENT_SERVICE_URL=http://payment-service:8005`
  - `REVIEW_SERVICE_URL=http://review-service:8006`
  - `ADMIN_SERVICE_URL=http://admin-service:8007`

### Current external entrypoint

- `frontend` is the public NodePort entrypoint
- `frontend` talks to `api-gateway`
- there is no Ingress manifest
- there is no Gateway API CRD manifest
- there is no existing kgateway manifest

### Current network policy coupling

Both `dev` and `prod` network policies explicitly allow backend ingress from pods labeled:

- `app: api-gateway`

That means removing the old gateway will require coordinated network policy updates along with kgateway rollout.

## Current MongoDB State

### What exists now

Files:

- `k8s/dev/mongodb.yaml`
- `k8s/dev/storage.yaml`
- `k8s/prod/mongodb.yaml`
- `k8s/prod/storage.yaml`
- split copies under:
  - `k8s/dev/mongodb/`
  - `k8s/prod/mongodb/`

### Runtime model

MongoDB is currently deployed as:

- `Deployment`
- `replicas: 1`
- `Service` type `ClusterIP`
- persistent storage via:
  - static `PersistentVolume`
  - static `PersistentVolumeClaim`
  - `hostPath`
  - `nodeAffinity`

### Current storage details

`dev`:

- PV name: `mongodb-pv-dev`
- PVC name: `mongodb-pvc`
- host path: `/data/chargeops/dev/mongodb`
- node affinity hostname: `ip-172-31-1-99`

`prod`:

- PV name: `mongodb-pv-prod`
- PVC name: `mongodb-pvc`
- host path: `/data/chargeops/prod/mongodb`
- node affinity hostname: `ip-172-31-12-24`

### Important finding

Current manifests do **not** use CSI-backed dynamic provisioning.

Current manifests use:

- `hostPath`
- static PV
- static PVC

So the requested NFS dynamic provisioning setup will be a real storage architecture change, not a reorganization.

## Current Service Inventory

### Dev

- `frontend`
- `api-gateway`
- `auth-service`
- `user-service`
- `station-service`
- `booking-service`
- `payment-service`
- `review-service`
- `admin-service`
- `mongodb`

### Prod

- `frontend`
- `api-gateway`
- `auth-service`
- `user-service`
- `station-service`
- `booking-service`
- `payment-service`
- `review-service`
- `admin-service`
- `mongodb`

## Current Service Types and Ports

### Frontend

`dev`:

- service type: `NodePort`
- service port: `80`
- targetPort: `http`
- nodePort: `32176`
- container port: `8080`

`prod`:

- service type: `NodePort`
- service port: `80`
- targetPort: `http`
- nodePort: `32186`
- container port: `8080`

### API Gateway

Both namespaces:

- service type: `ClusterIP`
- service port: `8000`
- targetPort: `http`
- container port: `8000`

### Backend Services

Both namespaces:

- `auth-service`: `8001`
- `user-service`: `8002`
- `station-service`: `8003`
- `booking-service`: `8004`
- `payment-service`: `8005`
- `review-service`: `8006`
- `admin-service`: `8007`

All are currently `ClusterIP`.

### MongoDB

Both namespaces:

- service type: `ClusterIP`
- service port: `27017`
- targetPort: `mongo`
- container port: `27017`

## Current Config and Secrets

### ConfigMap

Name:

- `chargeops-config`

Exists separately in `dev` and `prod`.

Key values in `dev`:

- `NODE_ENV=development`
- `ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080`
- `JWT_EXPIRES_IN=7d`
- `ALLOW_ADMIN_REGISTRATION=true`
- `AUTO_SEED_STATIONS=true`
- `STRIPE_CURRENCY=usd`
- `STRIPE_MIN_CHARGE_AMOUNT=0.5`
- `FRONTEND_APP_URL=http://localhost:3000`
- `MONGO_HOST=mongodb`

Key values in `prod`:

- `NODE_ENV=production`
- `ALLOWED_ORIGINS=https://chargeops.example.com`
- `JWT_EXPIRES_IN=7d`
- `ALLOW_ADMIN_REGISTRATION=false`
- `AUTO_SEED_STATIONS=true`
- `STRIPE_CURRENCY=usd`
- `STRIPE_MIN_CHARGE_AMOUNT=0.5`
- `FRONTEND_APP_URL=https://chargeops.example.com`
- `REACT_APP_API_URL=http://api-gateway:8000`
- `MONGO_HOST=mongodb`
- `MONGO_URI=mongodb://admin:password123@mongodb:27017/chargeops?authSource=admin`

### Secret

Name:

- `chargeops-secrets`

Keys currently present:

- `MONGO_ROOT_USERNAME`
- `MONGO_ROOT_PASSWORD`
- `JWT_SECRET`
- `API_KEY`
- `INTERNAL_SERVICE_API_KEY`
- `STRIPE_SECRET_KEY`

## Current Communication Map

### Frontend

Calls:

- `api-gateway` over HTTP
- port `8000`
- same namespace

Called by:

- external users through `NodePort`

### API Gateway

Calls:

- `auth-service:8001` HTTP
- `user-service:8002` HTTP
- `station-service:8003` HTTP
- `booking-service:8004` HTTP
- `payment-service:8005` HTTP
- `review-service:8006` HTTP
- `admin-service:8007` HTTP

Called by:

- `frontend`

Cross-namespace communication:

- none in current manifests

### Auth Service

Calls:

- `mongodb:27017` via MongoDB driver

Called by:

- `api-gateway`

Cross-namespace communication:

- none

### User Service

Calls:

- `mongodb:27017` via MongoDB driver

Called by:

- `api-gateway`
- `admin-service`

Cross-namespace communication:

- none

### Station Service

Calls:

- `mongodb:27017` via MongoDB driver

Called by:

- `api-gateway`
- `admin-service`

Cross-namespace communication:

- none

### Booking Service

Calls:

- `mongodb:27017` via MongoDB driver

Called by:

- `api-gateway`
- `admin-service`
- `payment-service`

Cross-namespace communication:

- none

### Payment Service

Calls:

- `mongodb:27017` via MongoDB driver
- `booking-service:8004` HTTP

Called by:

- `api-gateway`
- `admin-service`

Cross-namespace communication:

- none

### Review Service

Calls:

- `mongodb:27017` via MongoDB driver

Called by:

- `api-gateway`

Cross-namespace communication:

- none

### Admin Service

Calls:

- `mongodb:27017` via MongoDB driver
- `user-service:8002` HTTP
- `station-service:8003` HTTP
- `booking-service:8004` HTTP
- `payment-service:8005` HTTP

Called by:

- `api-gateway`

Cross-namespace communication:

- none

### MongoDB

Calls:

- none

Called by:

- all backend services

Cross-namespace communication:

- none

## Current Network Policy Model

Both `dev` and `prod` use namespace-local `NetworkPolicy` rules:

- `frontend` -> `api-gateway`
- `api-gateway` -> all backend services
- `admin-service` also reaches:
  - `user-service`
  - `station-service`
  - `booking-service`
  - `payment-service`
- `payment-service` also reaches:
  - `booking-service`
- all `tier: backend` pods can reach `mongodb:27017`

Implication for kgateway migration:

- policies referencing `app: api-gateway` will need to be updated
- the new gateway entrypoint must be reflected in ingress policy rules

## Current Kustomize State

### `k8s/gateway/kustomization.yaml`

Includes only:

- `deployment.yaml`
- `service.yaml`

It intentionally does not include:

- `hpa.yaml`
- `routes-config.yaml`

because those are placeholders today.

### `k8s/dev/kustomization.yaml`

Includes:

- `configmap.yaml`
- `secret.yaml`
- `network-policies.yaml`
- per-service deployment/service manifests
- mongodb storage/pvc/deployment/service
- frontend deployment/service

It does **not** include the gateway.

### `k8s/prod/kustomization.yaml`

Same pattern as `dev`.

## Current Gaps Relative to Requested Future State

### MongoDB

Requested:

- `StatefulSet`
- `volumeClaimTemplates`
- NFS-backed dynamic provisioning
- no hardcoded PV

Current:

- `Deployment`
- static PV
- static PVC
- `hostPath`
- node affinity

### Gateway

Requested:

- remove old API gateway deployment/service
- install `kgateway`
- create `Gateway` + `HTTPRoute`

Current:

- in-app `api-gateway` deployment/service
- no Gateway API manifests
- no kgateway install files

### Storage

Requested:

- NFS server from scratch
- dynamic provisioning
- NFS provisioner
- StorageClass-backed PVC binding

Current:

- local node filesystem hostPath
- manual PV/PVC

## Assumptions That Need Confirmation Before Final Manifests

Please confirm these before I generate the final MongoDB StatefulSet + NFS + kgateway manifests:

1. Cluster version:
   - I am assuming your cluster is modern enough for Gateway API CRDs and current kgateway Helm charts.

2. Gateway choice:
   - I am assuming you want **Gateway API with kgateway only**, and no NGINX Ingress, Traefik Ingress, or other ingress controller.

3. API gateway replacement scope:
   - I am assuming the current `api-gateway` deployment and service should be removed completely from both `dev` and `prod`.

4. External traffic path:
   - I am assuming external users should reach the system through kgateway, not directly through the frontend NodePort.
   - If frontend should remain public by NodePort, I need that confirmed because it changes the Gateway and route design.

5. MongoDB availability:
   - I am assuming single-replica MongoDB is acceptable and you do not need replica set mode.

6. Storage scope:
   - I am assuming the same NFS-backed StorageClass can be used for both `dev` and `prod`.

7. Existing data:
   - I am assuming you are okay with a storage migration plan being provided.
   - If current MongoDB data must be preserved, I need to treat migration differently than a clean redeploy.

8. Current manifest source of truth:
   - I am assuming the `k8s/` folder is now the source of truth and that `k8s-manifests/` is legacy.

9. Placeholder HPA files:
   - I am assuming no HPA should be added unless you explicitly want one, because none exists now.

10. Namespace model:
   - I am assuming all service-to-service traffic should stay namespace-local, with no cross-namespace calls introduced by kgateway.

## Recommended Next Step

Before I generate final replacement manifests, confirm:

- whether frontend should stay NodePort or move behind kgateway
- whether existing MongoDB data must be preserved
- whether `k8s/` is the only manifest tree I should modify

After you confirm those three, I can produce the final:

- NFS setup instructions from scratch
- dynamic StorageClass manifest
- MongoDB StatefulSet manifests
- removal of old `api-gateway`
- kgateway install steps
- `Gateway` and `HTTPRoute` manifests
- full sequential deployment guide
- troubleshooting guide
