# Devin CLI Authentication Script
$Code = "0QqvG-6PCKpMMpWPOmVudous19rjopG5t8k2LgbmY8I"
$DevinPath = "C:\Users\CHAITANYA SRI\AppData\Local\Devin\cli\bin\devin.exe"

Write-Host "Starting Devin CLI authentication..." -ForegroundColor Green
Write-Host "Using code: $Code" -ForegroundColor Yellow

# Start the auth process
$Process = Start-Process -FilePath $DevinPath -ArgumentList "auth login --force-manual-token-flow" -PassThru -NoNewWindow

# Wait a moment for the prompt to appear
Start-Sleep -Seconds 2

# Send the code
$Process.StandardInput.WriteLine($Code)
$Process.StandardInput.WriteLine()

# Wait for completion
$Process.WaitForExit()

Write-Host "Authentication completed with exit code: $($Process.ExitCode)" -ForegroundColor Green

# Now install the plugin
Write-Host "Installing ponytail plugin..." -ForegroundColor Green
& $DevinPath plugins install DietrichGebert/ponytail
