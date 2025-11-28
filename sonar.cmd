@echo off
call npm run test
call .\.sonar-scanner\bin\sonar-scanner.bat  -Dsonar.host.url=http://sonarqube25-pac-cicd.192.168.180.190.nip.io/ -Dsonar.token=squ_254cde0ec641a10b911a2bebff9401496070e762 