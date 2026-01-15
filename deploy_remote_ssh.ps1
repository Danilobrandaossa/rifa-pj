$server = "145.223.93.235"
$user = "root"
$remotePath = "/var/www/rifa"
$localZip = "deploy_package.zip"

Write-Host "📦 Preparando pacote para deploy em $user@$server..."

# Remover zip anterior se existir
if (Test-Path $localZip) { Remove-Item $localZip }

# Compactar arquivos importantes (excluindo node_modules, .next, .git)
Write-Host "📚 Compactando arquivos..."
Compress-Archive -Path src, public, prisma, package.json, next.config.ts, tsconfig.json, postcss.config.mjs, eslint.config.mjs, components.json, tailwind.config.ts, .env -DestinationPath $localZip -Force

# Enviar para o servidor
Write-Host "🚀 Enviando arquivo para o servidor (digite a senha se solicitado)..."
scp $localZip $user@$server`:$remotePath/

# Executar comandos no servidor
Write-Host "🔧 Executando instalação e build no servidor..."
ssh $user@$server "cd $remotePath && apt-get install -y unzip && unzip -o $localZip && rm $localZip && npm install && npm run build && pm2 restart all || echo '⚠️ Verifique se o PM2 está rodando ou use npm start'"

Write-Host "✅ Deploy finalizado!"
Remove-Item $localZip
