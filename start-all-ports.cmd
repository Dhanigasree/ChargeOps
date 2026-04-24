@echo off
setlocal

cd /d "%~dp0"

echo Starting ChargeOps services...
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

start "Frontend - 5173" cmd /k "cd /d ""%~dp0ev-frontend"" && npm run dev"
start "API Gateway - 8000" cmd /k "cd /d ""%~dp0ev-backend\services\api-gateway"" && npm run dev"
start "Auth Service - 8001" cmd /k "cd /d ""%~dp0ev-backend\services\auth-service"" && npm run dev"
start "User Service - 8002" cmd /k "cd /d ""%~dp0ev-backend\services\user-service"" && npm run dev"
start "Station Service - 8003" cmd /k "cd /d ""%~dp0ev-backend\services\station-service"" && npm run dev"
start "Booking Service - 8004" cmd /k "cd /d ""%~dp0ev-backend\services\booking-service"" && npm run dev"
start "Payment Service - 8005" cmd /k "cd /d ""%~dp0ev-backend\services\payment-service"" && npm run dev"
start "Review Service - 8006" cmd /k "cd /d ""%~dp0ev-backend\services\review-service"" && npm run dev"
start "Admin Service - 8007" cmd /k "cd /d ""%~dp0ev-backend\services\admin-service"" && npm run dev"

echo All launcher windows opened.
echo If any service fails, install dependencies in that folder with npm install.

endlocal
