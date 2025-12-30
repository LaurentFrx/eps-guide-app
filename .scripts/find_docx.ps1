# .scripts/find_docx.ps1 - search for docx files (EPS) in common user folders
Write-Output "Search started: $(Get-Date -Format s)"

Function Show-List($items) {
    if ($null -eq $items) { return }
    if ($items.Count -eq 0) { Write-Output "(none)"; return }
    $items | Select-Object FullName, @{Name='KB';Expression={[math]::Round($_.Length/1KB,1)}}, LastWriteTime | Format-Table -AutoSize
}

# 1A: targeted roots
$roots = @((Join-Path $env:USERPROFILE 'Documents'), (Join-Path $env:USERPROFILE 'Downloads'), (Join-Path $env:USERPROFILE 'Desktop'))
Write-Output "--- Targeted search for '*eps*.docx' in Documents/Downloads/Desktop ---"
foreach ($r in $roots) {
    if (Test-Path $r) {
        Write-Output "Searching: $r"
        $found = Get-ChildItem -Path $r -Recurse -File -Filter '*eps*.docx' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
        Show-List $found
    } else {
        Write-Output "Path not found: $r"
    }
}

# 1B: OneDrive
$one = Join-Path $env:USERPROFILE 'OneDrive'
Write-Output "--- OneDrive search for '*.docx' (first 100) ---"
if (Test-Path $one) { Show-List (Get-ChildItem -Path $one -Recurse -File -Filter '*.docx' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 100) } else { Write-Output 'OneDrive not found' }

# 1C: iCloud
Write-Output "--- iCloud search for '*.docx' (first 100) ---"
$icloudCand = @((Join-Path $env:USERPROFILE 'iCloudDrive'), (Join-Path $env:USERPROFILE 'iCloud Drive'))
foreach ($p in $icloudCand) {
    if (Test-Path $p) { Write-Output "Searching: $p"; Show-List (Get-ChildItem -Path $p -Recurse -File -Filter '*.docx' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 100) }
}

# 1D: global search in USERPROFILE (top 200)
Write-Output "--- Global search in USERPROFILE for '*.docx' (top 200) ---"
$globalFound = Get-ChildItem -Path $env:USERPROFILE -Recurse -File -Filter '*.docx' -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\' } | Sort-Object LastWriteTime -Descending | Select-Object -First 200
Show-List $globalFound

Write-Output "Search finished: $(Get-Date -Format s)"
