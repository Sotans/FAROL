# FAROL: Registro de alterações (design, navegação e tipos de questão)

> O que foi feito, decidido e deixado pendente na rodada de design e frontend de 2026-11-24 a 2026-11-27, feita com a IA.
> Serve para retomar o trabalho sem reler a conversa. Os detalhes de cada mudança estão nos commits citados.
> Última atualização: 2026-11-27

## Onde está cada coisa

| Branch / PR                                            | Situação         | O que entrou                                                                                                                               |
| ------------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| PR #1 (`bcc1e11`)                                      | Na `main`        | Identidade do frontend: feixe do farol na trilha, botão que brilha, folha de resultado com faixa de luz, card "Para você", seleção em maré |
| PR #2 (`c0ed9d3`)                                      | Na `main`        | Correções da revisão de código: virada do dia, dicas por dia, versão da nuvem, alvo do desafio                                             |
| PR #3 (`b3246ea`)                                      | Na `main`        | Guia refinado (cabelo, cor, 7 expressões) e ícones de interface com Lucide                                                                 |
| PR #4 (`403223b`)                                      | Na `main`        | Ilustrações do farol e do guia (Firefly e ChatGPT) e a nova tela de questões                                                               |
| PR #5 (`1b3fd28`)                                      | Na `main`        | Barra de abas, movimento, correções de navegação e ajustes de design                                                                       |
| `claude/novos-tipos-de-questao` (`7a1f9d6`, `bd4c51c`) | **Sem PR ainda** | 12 tipos novos de questão, com arrastar de verdade, e as correções da revisão de código                                                    |

## 1. Tela de questões (PR #4)

- Instruções como "Certo ou errado?" e "Complete:" ganham linha própria (`src/licao/enunciado.ts`).
- Sem contador de acertos no topo: a barra de progresso ocupa o espaço. Sem "Toque na resposta".
- A dica fica na linha do tipo de questão, à direita do chip.
- Opções em botões largos, com o texto centralizado, no meio do espaço entre o enunciado e o rodapé.
- **Toda escolha passa pelo Confirmar**, que fica apagado até haver resposta. Ligar pares continua conferindo par a par.

**Decisão a registrar no doc 11:** o modo "imediato" (o toque já confere, níveis 1 e 2) deixou de ser usado pelas telas. O campo `modo` continua nos dados, mas hoje não muda nada.

## 2. Ilustrações (PR #4)

- Farol em três estados (apagado, atual, aceso), farol da tela de boas-vindas e o guia de cada carreira (acenando e comemorando).
- O fundo das imagens foi removido com `scripts/preparar-ilustracoes.py`. Os originais estão em `assets/ilustracoes/originais`.
- O guia ilustrado aparece nos momentos especiais (farol aceso, desafio vencido, mapa, conta). O guia em código (`Personagem.tsx`) continua onde há personalização.

## 3. Barra de abas (PR #5)

| Aba          | O que mostra                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Trilha**   | A tela inicial de antes, sem mudança de layout                                                                                                           |
| **Revisar**  | As revisões vencidas, com o número em âmbar no ícone, e o ciclo da revisão explicado em três passos                                                      |
| **Notícias** | Feed filtrado pela carreira. **Notícias de exemplo**, marcadas como tal na tela (`src/noticias/exemplos.ts`)                                             |
| **Você**     | XP, dias seguidos, faróis acesos, conquistas (as alcançadas e as 2 próximas) e ajustes: guia, meta, mapa, **assinatura** (reservada, "em breve") e conta |

- Lição, desafio, mapa e onboarding ficam fora das abas, sem a barra (momentos de foco).
- Guia e meta ganharam um modo de edição a partir do Você.
- Rotas em `src/app/(abas)`. A antiga `src/app/index.tsx` virou `src/app/(abas)/index.tsx`.

## 4. Movimento (PR #5)

- Valores de duração, curva e mola num lugar só: `src/tema/movimento.ts`.
- Barra de progresso com `translateX` (250 ms), em vez de animar a largura.
- Lição, desafio e mapa sobem de baixo; o onboarding entra pela direita.
- Ícones que reagem: visto que se desenha, lanterna da dica, luz da sequência, anel da meta, XP contando, selo de conquista, pílula e número da barra de abas.
- Tudo respeita o "reduzir movimento" do celular.

## 5. Ajustes de design (PR #5)

- **A fonte Fraunces saiu do app.** Títulos e números usam a Nunito, a mesma do onboarding. O pacote foi removido.
- **Âmbar só no próximo passo e nas conquistas:** chips de questão em maré, texto da dica claro, números zerados do perfil em cor suave.
- Trilha: o botão do rodapé some enquanto um cartão está aberto, a rolagem esmaece sob o banner e o banner diz quantas partes faltam para o farol.
- Os três cartões da trilha (parte, módulos, "Pular pra cá?") seguem o mesmo estilo.

## 6. Correções de comportamento (PR #5)

| Problema                                                                                                                        | Correção                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Cada lição concluída empilhava outra cópia da tela inicial (4, 8, 12 abas na memória; o voltar do Android caía em telas velhas) | Voltar à trilha usa `router.dismissTo('/')` em vez de `router.replace('/')` |
| A luz da sequência não acendia no 1º dia                                                                                        | O indicador fica montado (invisível) no zero                                |
| Os valores já vistos sobreviviam a "Reiniciar" e a "Sair da conta"                                                              | `esquecerVistos()` nos dois caminhos                                        |
| A pílula da aba ativa cobria o ícone                                                                                            | O ícone fica numa camada acima                                              |
| O fundo de um cartão da trilha segurava toques enquanto sumia                                                                   | Os cartões saem na hora                                                     |

## 7. Tipos novos de questão (branch `claude/novos-tipos-de-questao`)

Aprovados pelo fundador depois de um protótipo interativo. Todos estão na lição de demonstração: **Laboratório → "Novos tipos de questão"**, que não conta para a trilha, a meta nem a revisão, e não gasta dicas.

| Tipo                    | Como funciona                                                         | Matéria pensada                       |
| ----------------------- | --------------------------------------------------------------------- | ------------------------------------- |
| Régua                   | Arrastar o marcador até o valor                                       | Raciocínio Lógico                     |
| Proporção               | Escolher direta ou inversa e arrastar os números para a regra de três | Raciocínio Lógico                     |
| Combinatória            | Ajustar n, p e se a ordem importa; a conta se monta sozinha           | Raciocínio Lógico                     |
| Tabela-verdade          | Tocar nas casas para alternar V e F                                   | Raciocínio Lógico                     |
| Diagrama de Venn        | Tocar na região (ou no nome dela)                                     | Raciocínio Lógico                     |
| Montar a frase          | Arrastar blocos, com alguns que sobram                                | Raciocínio Lógico                     |
| Grade de associação     | Marcar ✓ e ✗ a partir das pistas                                      | Raciocínio Lógico                     |
| Caso concreto           | Uma situação curta e "o que se aplica?"                               | Administrativo, Penal, Constitucional |
| Lacuna na lei           | Completar o artigo com a palavra que a banca troca                    | Constitucional, Administrativo        |
| Certo, errado e corrige | Achar o trecho errado e escolher a correção                           | Todas                                 |
| Classificar             | Arrastar itens para duas colunas                                      | Administrativo                        |
| Passo a passo           | Completar o passo que falta na resolução                              | Raciocínio Lógico                     |

**Como foi feito**

- Arrastar com `react-native-gesture-handler` (versão recomendada para o SDK 58). Tocar faz o mesmo que arrastar, para leitor de tela e para quem prefere.
- Enquanto a pessoa arrasta, uma cópia da ficha voa numa camada por cima da área da questão (no Android, o `zIndex` só vale entre irmãos).
- A resposta fica no motor da lição e do desafio. A conferência está em funções puras em `src/licao/interativas.ts`, com testes.
- Regras de conteúdo para os tipos novos em `src/conteudo/validar.ts`.

**Descartado:** "tela do sistema" (Informática). O fundador avaliou que não parece profissional e não cai assim nas provas.

## 8. Decisões de produto tomadas nesta rodada

- **Matérias livres:** a pessoa escolhe a matéria do dia. O botão principal continua na última matéria estudada, e ela troca quando quiser.
- **Carreira quase fixa:** trocar de carreira fica para depois, escondido nas configurações ou como recurso Pro.
- **Estudar para dois concursos ao mesmo tempo:** ideia nova, anotada para o futuro.
- "Matemática" entra como **Raciocínio Lógico**, como nos editais das três carreiras.

## 9. Pendências, da mais urgente para a menos

| #   | Pendência                                                                          | Por quê                                                                                                     | Quem                                 |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | **Abrir o PR de `claude/novos-tipos-de-questao`**                                  | Os tipos novos ainda não estão na `main`                                                                    | Fundador decide                      |
| 2   | **Testar num celular de verdade** (Expo Go ou development build)                   | Transições de tela, molas, arrastar com o dedo e a camada da ficha no Android só foram vistos no navegador  | Fundador, com a IA                   |
| 3   | **Conteúdo com os tipos novos**                                                    | Hoje eles só aparecem na demonstração. Faltam módulos de Raciocínio Lógico, Administrativo e Constitucional | Fundador mapeia; IA redige rascunhos |
| 4   | **Aceitar os tipos novos nos rascunhos em JSON** (`src/conteudo/rascunho.ts`)      | O leitor de rascunhos ainda só conhece os 6 tipos antigos                                                   | IA                                   |
| 5   | **Troca de matéria pelo banner da Trilha**                                         | Combinado, ainda não feito. Hoje há uma trilha só, a de Português                                           | IA                                   |
| 6   | **Registrar no doc 11** o fim do modo "imediato" e a regra do âmbar                | As telas mudaram e o design system ainda descreve o comportamento antigo                                    | Fundador                             |
| 7   | **Notícias reais** (fonte, curadoria, atualização)                                 | A aba mostra exemplos inventados, marcados como tal                                                         | Fundador decide                      |
| 8   | **Tela de assinatura**                                                             | O item existe no perfil, com o aviso "em breve"                                                             | Depois da Meta 7                     |
| 9   | Toques pequenos: botão Dica e filtros das Notícias com 36 px, link "Pular pra cá?" | Abaixo dos 44 a 48 px recomendados                                                                          | IA                                   |
| 10  | Entradas com mola não animam no navegador                                          | Limitação do Reanimated na web; no celular funcionam                                                        | Acompanhar                           |

### Atualização das pendências técnicas (doc 16)

- Testes automatizados: de 238 para **344**.
- Item 5: `src/app/index.tsx` agora é `src/app/(abas)/index.tsx`, ainda grande. `src/estado/progresso.tsx` cresceu um pouco (esquecer os valores vistos ao reiniciar).
- Item 3 (um branch e um pull request por etapa): seguido nesta rodada, com os PRs #1 a #5 aprovados pela verificação automática antes da `main`.
