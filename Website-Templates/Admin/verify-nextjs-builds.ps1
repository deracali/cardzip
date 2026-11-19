param([int[]]$DashboardNumbers = @(1, 2, 3, 4, 5))

$ErrorActionPreference = 'Stop'

foreach ($number in $DashboardNumbers) {
  $projectPath = Join-Path $PSScriptRoot "admin-dashboard$number\nextjs"
  Write-Output "=== Building admin-dashboard$number/nextjs ==="
  $componentPages = Join-Path $projectPath 'src\pages'
  $componentViews = Join-Path $projectPath 'src\views'
  if (Test-Path $componentPages) {
    if (Test-Path $componentViews) {
      throw "Both src/pages and src/views exist in admin-dashboard$number/nextjs"
    }
    Move-Item -LiteralPath $componentPages -Destination $componentViews
  }
  $nextOutput = Join-Path $projectPath '.next'
  if (Test-Path $nextOutput) {
    Remove-Item -LiteralPath $nextOutput -Recurse -Force
  }
  Push-Location $projectPath
  try {
    npm install
    if ($LASTEXITCODE -ne 0) {
      throw "npm install failed for admin-dashboard$number/nextjs"
    }

    npm run build
    if ($LASTEXITCODE -ne 0) {
      throw "npm run build failed for admin-dashboard$number/nextjs"
    }
  }
  finally {
    Pop-Location
  }
}
