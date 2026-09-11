# CD Guarapuava V5 — Login fixo corrigido

Login:
- usuário: cdguarapuava
- senha: gpvede

O login NÃO depende mais de LOGIN_USER nem LOGIN_PASSWORD do Vercel.

## Publicação
Suba TODOS os arquivos desta pasta para a raiz do GitHub e faça Redeploy no Vercel.

## Teste 1
Abra:
https://SEU-SITE.vercel.app/api/health

Deve retornar JSON com `"ok": true`.

## Teste 2
Abra:
https://SEU-SITE.vercel.app/api/login

Deve retornar JSON com:
`"ready": true`

## Apps Script
No Vercel ainda precisam existir:

APPS_SCRIPT_API_URL=https://script.google.com/macros/s/AKfycbyyVUNlMNd2I03cJWx4EnV1Sb8C_51cR7v5hzq1hon5OkouTDXDEYAiNDxBHBGs0ZeY/exec
APPS_SCRIPT_API_KEY=BOBINOU-CD-GUARAPUAVA-2026

Essas duas variáveis são usadas apenas depois do login, para carregar os dados.
