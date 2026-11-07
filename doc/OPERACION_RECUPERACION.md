# Operación y recuperación de la base de datos

## Copia de seguridad

Prerequisitos: cliente PostgreSQL (`pg_dump` y `pg_restore`) actualizado y acceso a la base. No guardes el archivo de copia en el repositorio ni compartas la URL de conexión.

En PowerShell, desde la raíz del proyecto, carga la URL desde `.env.local` sin imprimirla y genera el respaldo fuera del repositorio:

```powershell
$linea = Select-String -Path .env.local -Pattern '^POSTGRES_URL_NON_POOLING='
$env:POSTGRES_URL_NON_POOLING = $linea.Line.Substring('POSTGRES_URL_NON_POOLING='.Length).Trim().Trim('"')
$carpetaCopias = Join-Path $env:USERPROFILE 'notaflux-backups'
New-Item -ItemType Directory -Force -Path $carpetaCopias | Out-Null
$copia = Join-Path $carpetaCopias ("notaflux-{0}.dump" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
pg_dump --format=custom --no-owner --file="$copia" "$env:POSTGRES_URL_NON_POOLING"
if ($LASTEXITCODE -ne 0) { throw 'Falló pg_dump.' }
pg_restore --list "$copia" | Select-Object -First 10
```

Guarda las copias cifradas, restringe el acceso y define una retención según las necesidades del curso. Una copia no se considera validada hasta que pueda restaurarse en una base aislada.

## Restauración de prueba

La restauración elimina y recrea objetos con el mismo nombre en el destino. Usa un proyecto/base de **staging separado**; nunca apuntes esta operación a producción. Configura `STAGING_DATABASE_URL` desde el gestor de secretos de tu entorno, sin imprimirla ni guardarla en el repositorio.

```powershell
$env:STAGING_DATABASE_URL = '<URL de la base aislada de staging>'
pg_restore --clean --if-exists --no-owner --dbname="$env:STAGING_DATABASE_URL" "$copia"
if ($LASTEXITCODE -ne 0) { throw 'Falló la restauración en staging.' }
$env:POSTGRES_URL_NON_POOLING = $env:STAGING_DATABASE_URL
npm.cmd run db:verificar
if ($LASTEXITCODE -ne 0) { throw 'La verificación de la base restaurada falló.' }
npm.cmd run probar:flujo
if ($LASTEXITCODE -ne 0) { throw 'El flujo de datos en staging falló.' }
```

El flujo de prueba crea y elimina registros de prueba; ejecútalo solo en staging. Comprueba los resultados, conserva el registro de la fecha y duración de la restauración y no conectes la aplicación de producción a la base de prueba.

## Autoría de los cortes

La migración `0003_cortes_autoria.sql` añade `cortes.registrado_por`. La API toma ese valor de la sesión autenticada; los cortes previos y los creados por scripts pueden conservar `NULL`. Los cortes no se editan ni eliminan desde la aplicación.