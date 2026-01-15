$source = "C:\Users\ueles\OneDrive\Área de Trabalho\rifa\src"
$dest = "C:\var\www\rifa\src"

Write-Host "Iniciando deploy..."
Write-Host "Origem: $source"
Write-Host "Destino: $dest"

if (!(Test-Path $dest)) {
    Write-Host "Criando diretório de destino..."
    New-Item -ItemType Directory -Force -Path $dest | Out-Null
}

Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force

Write-Host "Deploy concluído com sucesso!"
