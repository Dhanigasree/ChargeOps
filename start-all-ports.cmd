@echo off
setlocal

cd /d "%~dp0"

echo Starting ChargeOps services...
echo Preparing MongoDB containers for local development...
pushd "%~dp0ev-backend"
docker compose up -d auth-mongo user-mongo station-mongo booking-mongo payment-mongo review-mongo admin-mongo
if errorlevel 1 (
  echo.
  echo Failed to start MongoDB containers with Docker Compose.
  echo Make sure Docker Desktop is running, then try again.
  popd
  exit /b 1
)
popd

echo.
echo Frontend: Vite on port 5173
echo API Gateway: port 8000
echo Auth Service: port 8001
echo User Service: port 8002
echo Station Service: port 8003
echo Booking Service: port 8004
echo Payment Service: port 8005
echo Review Service: port 8006
echo Admin Service: port 8007
echo.

start "Frontend - 5173" cmd /k "cd /d ""%~dp0ev-frontend"" && npm.cmd run dev"
start "API Gateway - 8000" cmd /k "cd /d ""%~dp0ev-backend\services\api-gateway"" && npm.cmd run dev"
start "Auth Service - 8001" cmd /k "cd /d ""%~dp0ev-backend\services\auth-service"" && npm.cmd run dev"
start "User Service - 8002" cmd /k "cd /d ""%~dp0ev-backend\services\user-service"" && npm.cmd run dev"
start "Station Service - 8003" cmd /k "cd /d ""%~dp0ev-backend\services\station-service"" && npm.cmd run dev"
start "Booking Service - 8004" cmd /k "cd /d ""%~dp0ev-backend\services\booking-service"" && npm.cmd run dev"
start "Payment Service - 8005" cmd /k "cd /d ""%~dp0ev-backend\services\payment-service"" && npm.cmd run dev"
start "Review Service - 8006" cmd /k "cd /d ""%~dp0ev-backend\services\review-service"" && npm.cmd run dev"
start "Admin Service - 8007" cmd /k "cd /d ""%~dp0ev-backend\services\admin-service"" && npm.cmd run dev"

echo All launcher windows opened.
echo MongoDB containers are running on ports 27018 through 27024.
echo If any service fails, install dependencies in that folder with npm.cmd install.

endlocal
