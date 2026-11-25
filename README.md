# FAROL (app)

Protótipo em código do fluxo de uma lição (submeta 1.5). Expo SDK 58, React Native, TypeScript, Expo Router e Reanimated.

> **Conteúdo de demonstração.** As questões em `src/conteudo/` não foram revisadas por professor e servem só para testar a mecânica.

## Como rodar no celular

1. Instale o app **Expo Go** no celular (App Store ou Google Play).
2. No computador, na pasta `app`:
   ```
   npm install
   npx expo start
   ```
3. Escaneie o QR code que aparece no terminal (Câmera no iPhone, Expo Go no Android). O celular e o computador precisam estar na **mesma rede Wi-Fi**.
4. Se a conexão falhar, tente `npx expo start --tunnel`.

Vibrações só funcionam em aparelho real, não no simulador.

## Se o Expo Go ficar carregando e der timeout

O celular não está alcançando o computador. Tente, nesta ordem:

1. **Modo túnel:** `npx expo start --tunnel` (a primeira vez pode pedir para instalar um pacote; aceite). Funciona mesmo com redes diferentes ou firewall.
2. **Mesma rede:** celular e computador no **mesmo Wi-Fi**, com os dados móveis e qualquer VPN desligados. Algumas redes (Wi-Fi de empresa, faculdade ou hotel) **isolam** os aparelhos entre si.
3. **Firewall do Windows:** quando o Windows perguntar se o Node.js pode acessar a rede, permita em redes **privadas**. Se a rede estiver marcada como "Pública", mude para "Privada" nas configurações de Wi-Fi.
4. **Sem celular:** `npx expo start --web` abre o protótipo no navegador do computador (as vibrações não funcionam no navegador).

## Nuvem (Supabase)

O app funciona sem nuvem: o progresso fica no aparelho. Com a nuvem configurada, cada pessoa ganha uma **conta anônima** ao abrir o app, e o progresso é copiado para o Supabase alguns segundos depois de cada mudança. Ao abrir o app, a cópia da nuvem é combinada com a do aparelho sem perder avanço (`src/estado/mesclar.ts`).

Para ligar:

1. No painel do Supabase, em **Authentication > Sign In / Providers**, ative **Allow anonymous sign-ins**.
2. No **SQL Editor**, rode o conteúdo de `supabase/migrations/20261121120000_progresso.sql` (cria a tabela `progresso` e as regras de acesso).
3. Copie `.env.example` para `.env.local` e preencha a URL do projeto e a chave **publishable**. O `.env.local` não vai para o GitHub. Nunca use a chave secreta nem a senha do banco no app.
4. Reinicie com `npx expo start --clear`. O rodapé da trilha mostra o estado da nuvem.

### Conta (login por código, sem senha)

A pessoa guarda o progresso ligando um e-mail à conta anônima, ou entra numa conta existente em outro aparelho. Nos dois casos, recebe um **código de 6 dígitos** por e-mail; não há senha.

Para o código chegar no e-mail:

1. Configure um **servidor de e-mail próprio (SMTP)** em **Authentication > Emails > SMTP Settings** (por exemplo, Brevo, com plano gratuito). Sem isso, o Supabase só envia para a equipe do projeto, no máximo 2 e-mails por hora, e não deixa editar os modelos.
2. Nos modelos **Magic Link** e **Change Email Address**, inclua o código com `{{ .Token }}`.
3. Em **Authentication > Sign In / Providers**, ative **Allow manual linking**.

## O que o protótipo tem

- **Onboarding:** boas-vindas, escolha da carreira (3 ativas, 4 "em breve" com toques contados), apresentação do guia (personagem provisório) e meta diária. Sem cadastro: termina direto na **lição de boas-vindas**, curta e fácil.
- **Diagnóstico inicial** ("mapa do ponto de partida"): 6 perguntas após a primeira lição, sem nota e com "Ainda não vi isso". O resultado mostra nível e ponto forte por matéria.
- **Trilha na linha da costa:** nós numa linha reta, com a legenda ao lado, e o feixe do farol apontando o nó de hoje (ele desce até o próximo nó quando uma parte é concluída). A trilha abre no nó atual, tem o botão "Continuar a Parte N" fixo na base e um cartão "Para você" com um assunto por vez (revisão, mapa ou guardar o progresso).
- **"Pular pra cá?"**: tocar num nó bloqueado abre o convite. O desafio tem 5 luzes (cada erro apaga uma) e, se passar, as partes puladas ficam dominadas (+50 XP). Limite de 1 desafio por dia, com vídeo recompensado **simulado**.
- **Lição** com 10 questões em 3 tipos (múltipla escolha, certo ou errado e completar), nos dois modos de resposta (imediato e com confirmação).
- **Sequência de acertos:** uma só, que atravessa questões, lições e o desafio. Contador na barra e pop-up animado a cada 5 seguidos; ao errar, só recomeça, sem aviso.
- **Progresso salvo no aparelho** (AsyncStorage): trilha, sequência de dias, meta e mapa sobrevivem ao fechar o app. Os contadores "hoje" zeram na virada do dia.
- **Erro gentil:** 1º erro deixa tentar de novo, 2º erro mostra a resposta guiada, e a questão errada volta ao final da lição.
- **Dica** sempre disponível, com limite de 3 por dia e vídeo recompensado **simulado**.
- **Conclusão** com o farol girando, XP contando, vibrações e o pop-up da próxima lição ("Não deixe para amanhã o que pode fazer hoje").
- **Sons provisórios**, gerados por síntese (sinos curtos numa escala única): toque, acertos em sequência com a nota subindo, erro macio, luz apagada, lição concluída, meta do dia, pop-up e o farol. Volume baixo; respeitam o modo silencioso do aparelho.
- Respeita "reduzir movimento" do sistema.

## O que ainda não tem

- O kit sonoro definitivo e a música ao selecionar um nó (submeta 1.11).
- Ícones e personagem definitivos (1.10 e 1.12). Os glifos e emojis são provisórios.
- Revisão espaçada, download de lições para offline, login e sincronização com o backend.
- Os outros 3 tipos de exercício (ligar pares, ordenar, identificar o erro).

O progresso fica salvo no aparelho. Para recomeçar do zero, abra o **Laboratório** (toque longo no banner do módulo, na trilha) e use "Reiniciar demonstração", que volta ao onboarding. O Laboratório também guarda o experimento de erro, o teste de som, o catálogo de ícones e o estado da nuvem.

## Estrutura

```
src/
  app/          rotas (Expo Router): boas-vindas, carreira, guia, meta, trilha (index), lição, conclusão, diagnóstico, mapa, desafio
  carreiras/    carreiras de lançamento e "em breve"
  conteudo/     módulos de conteúdo (matéria → módulo → partes → questões) e testes de integridade
  componentes/  Botão, Opção, Barra de progresso, Folha de feedback, Nó da trilha, Luzes, Farol, Luz, Personagem, Balão, Aviso
  desafio/      motor do desafio "Pular pra cá?" (useDesafio)
  diagnostico/  questões do diagnóstico e cálculo do mapa
  licao/        tipos, montagem das sessões (montar.ts) e motor da lição (useLicao)
  estado/       progresso de demonstração
  servicos/     vibrações
  tema/         tokens do design system
```

Tokens: `src/tema/tokens.ts` espelha `docs/design-system/tokens.json`.

Sons: `assets/sons/*.wav` são gerados pelo script `scripts/gerar-sons.py`. Para regenerar: `python -I scripts/gerar-sons.py assets/sons`.

## Comandos úteis

```
npm run typecheck   # checa os tipos
npm run lint        # ESLint + Prettier (avisos de formatação não bloqueiam)
npm run lint:fix    # corrige a formatação
npm test            # testes automatizados (Jest)
npx expo-doctor     # confere dependências e configuração
```

Rode `typecheck`, `lint` e `test` antes de dar uma tarefa por concluída.
