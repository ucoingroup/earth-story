@echo off
cd /d C:\Users\Administrator\.qclaw\workspace\earth-story
"D:\Program Files (x86)\QClaw\v0.2.31.600\resources\git\cmd\git.exe" add -A
"D:\Program Files (x86)\QClaw\v0.2.31.600\resources\git\cmd\git.exe" commit -m "EACO Daily Story Update - 2026-07-07"
"D:\Program Files (x86)\QClaw\v0.2.31.600\resources\git\cmd\git.exe" push origin main
echo DONE
