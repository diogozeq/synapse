@echo off
chcp 65001 >nul
cd /d "%~dp0backend"
set PYTHONPATH=%~dp0
set PYTHONIOENCODING=utf-8
python app.py
