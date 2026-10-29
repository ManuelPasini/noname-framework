param([string]$WordPressPath = 'C:\xampp\htdocs\pixelcut-wp')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$themeSource = (Resolve-Path -LiteralPath (Join-Path $projectRoot 'theme')).Path
$wordpressRoot = (Resolve-Path -LiteralPath $WordPressPath).Path
if (-not (Test-Path -LiteralPath (Join-Path $wordpressRoot 'wp-load.php'))) {
    throw "La cartella indicata non contiene WordPress: $wordpressRoot"
}
$themesRoot = (Resolve-Path -LiteralPath (Join-Path $wordpressRoot 'wp-content/themes')).Path
$linkPath = Join-Path $themesRoot 'pixelcut'
if (Test-Path -LiteralPath $linkPath) {
    $existing = Get-Item -LiteralPath $linkPath -Force
    if ($existing.LinkType -eq 'Junction' -and $existing.Target -contains $themeSource) {
        Write-Output "Collegamento gia presente: $linkPath -> $themeSource"
        exit 0
    }
    throw "La destinazione esiste gia. Nessun file modificato: $linkPath"
}
New-Item -ItemType Junction -Path $linkPath -Target $themeSource | Out-Null
Write-Output "Tema collegato: $linkPath -> $themeSource"
