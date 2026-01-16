$server = "145.223.93.235"
$user = "root"
$remotePath = "/var/www/rifa"

Write-Host "🚀 Iniciando atualização via GitHub no servidor $server..."

# Comando para rodar no servidor
$command = "cd $remotePath && git pull origin main && npm install && npm run build && npx prisma generate && pm2 restart all"

Write-Host "🔧 Executando: $command"
Write-Host "🔑 Digite a senha do servidor se solicitado:"

ssh $user@$server $command

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Atualização concluída com sucesso!"
} else {
    Write-Host "❌ Erro ao atualizar."
}
