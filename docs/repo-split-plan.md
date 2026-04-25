# ChargeOps Repo Split Plan

This monorepo can be split into separate repositories like the GitHub organization view in your screenshot.

## Target Repositories

| Repo | Source in monorepo | Notes |
| --- | --- | --- |
| `api-gateway` | `ev-backend/services/api-gateway` | Gateway service |
| `authentication-service` | `ev-backend/services/auth-service` | Authentication service |
| `user-service` | `ev-backend/services/user-service` | User profile service |
| `inventory-service` | `ev-backend/services/station-service` | Closest match to station management service |
| `order-service` | `ev-backend/services/booking-service` | Closest match to booking workflow service |
| `payment-service` | `ev-backend/services/payment-service` | Payment workflow service |
| `review-rating-service` | `ev-backend/services/review-service` | Review and rating service |
| `admin-service` | `ev-backend/services/admin-service` | Admin dashboard API |
| `E-Commerce-App` | `ev-frontend` | React UI |
| `Documentation-K8s` | `k8s`, `k8s-manifests`, `.github/workflows` | Shared deployment/infrastructure repo |

## Generated Output

Run the repo split generator to create a ready-to-push multi-repo export under `split-output/`.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-microservice-repos.ps1
```

Each generated folder includes:

- the service code copied from this monorepo
- a local `.gitignore`
- a small repo-specific `README.md`
- a `repo-origin.txt` marker showing the original monorepo path

## Suggested GitHub Repo Names

If you want the GitHub page to look like your screenshot, create repos with these names:

- `api-gateway`
- `authentication-service`
- `user-service`
- `inventory-service`
- `order-service`
- `payment-service`
- `review-rating-service`
- `admin-service`
- `E-Commerce-App`
- `Documentation-K8s`

## Suggested Push Flow

For each generated repo:

```powershell
cd .\split-output\<repo-name>
git init
git add .
git commit -m "Initial split from ChargeOps monorepo"
git branch -M main
git remote add origin <your-new-repo-url>
git push -u origin main
```

## Notes

- `node_modules` is excluded from generated repos.
- The generated `Documentation-K8s` repo keeps deployment files centralized.
- If you later want one pipeline per service, move the relevant workflow file into each generated repository.
