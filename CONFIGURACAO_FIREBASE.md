# Configuração do Firebase — Python Escape

1. Crie um projeto gratuito no https://console.firebase.google.com e registre um aplicativo **Web**.
2. Copie os valores do SDK para `firebase-config.js` (sem incluir `measurementId`, que é opcional).
3. Em **Authentication > Sign-in method**, habilite **Anônimo** e **E-mail/senha**.
4. Em **Authentication > Users**, crie uma conta de professor com seu e-mail e a senha inicial solicitada: `programacaoparana`. Recomenda-se alterá-la depois e não compartilhar a conta.
5. Copie o **UID** dessa conta e substitua `SUBSTITUIR_UID_PROFESSOR` em `firestore.rules`.
6. Crie um banco **Cloud Firestore**, no modo produção. Na aba **Rules**, cole e publique o conteúdo de `firestore.rules`.
7. Publique os arquivos em hospedagem HTTPS (Firebase Hosting, GitHub Pages ou equivalente). Não abra `index.html` diretamente via `file://`.
8. Entre em **ÁREA DO PROFESSOR** com e-mail e senha. O ranking é atualizado ao vivo pelo Firestore.

**Limitações importantes:** A senha é verificada no servidor Firebase, nunca no JavaScript. O ranking e as estatísticas são privados ao docente. O cliente envia resultados sem validação independente do jogo; usuários técnicos podem forjar pontuações, portanto não use o ranking para avaliações de alto impacto. A exclusão apaga os documentos `conclusions`, não contas de autenticação nem dados locais nos navegadores. As duas opções de exclusão atualmente afetam a mesma coleção, pois este projeto só mantém resultados de conclusão na nuvem. A gratuidade depende dos limites e condições do plano Firebase vigente. A identificação por nome não impede homônimos ou nomes falsos. Cada navegador salva localmente o progresso do jogo.
