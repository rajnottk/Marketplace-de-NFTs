# Desafio Frontend — Marketplace de NFTs

Implemente o **NFT Marketplace** em React e TypeScript, seguindo o [layout no Figma](https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge?node-id=0-1).

O desafio avalia fidelidade visual, qualidade das interações, integração com APIs, gerenciamento de estado assíncrono, tempo real, acessibilidade e performance.

## 1. Escopo

Entregue os fluxos de descoberta, compra e conta do colecionador, com versões desktop e mobile. APIs, autenticação, carteiras e pagamentos devem funcionar com dados simulados. Integrações reais com blockchain, extensões de carteira e gateways de pagamento estão fora do escopo.

O Figma define a identidade visual e a composição das telas. Este enunciado define os comportamentos e os cenários de avaliação. Estados não desenhados devem seguir o mesmo padrão visual.

## 2. Stack obrigatória

| Responsabilidade                     | Tecnologia      |
| ------------------------------------ | --------------- |
| Interface                            | React           |
| Linguagem                            | TypeScript      |
| Roteamento                           | TanStack Router |
| Estado remoto                        | TanStack Query  |
| Cliente HTTP                         | Axios           |
| Integração de dados                  | REST APIs       |
| Tempo real                           | Socket.IO       |
| Estilização                          | Tailwind CSS    |
| Componentes                          | shadcn/ui       |
| Mocking                              | MSW             |
| Testes E2E e regressão visual        | Playwright      |
| Auditoria de performance e qualidade | Lighthouse      |

As tecnologias devem participar efetivamente da solução. A ferramenta de build, a organização do projeto e as bibliotecas complementares ficam a critério do candidato.

## 3. Telas e fluxos

| Tela                   | Funcionalidades obrigatórias                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| Início                 | Destaques, catálogo, busca, filtros, ordenação e navegação para o NFT        |
| Detalhes do NFT        | Galeria, informações, edição, quantidade, favoritos e compra                 |
| Carrinho de NFTs       | Edição de quantidades, remoção, cupom e resumo de valores                    |
| Pagamento              | Dados do colecionador, seleção de carteira e rede, revisão e envio do pedido |
| Confirmação de pedido  | Resultado, identificação da transação, itens, taxas e total                  |
| Login                  | Autenticação, validação e retorno ao fluxo anterior                          |
| Cadastro               | Criação de conta, validação e tratamento de conflito                         |
| Perfil do colecionador | Edição dos dados, avatar e alteração de senha                                |
| Carteiras              | Cadastro e edição de carteiras principal e secundária                        |

Implemente os frames desktop e mobile disponíveis. Perfil, carteiras e confirmação também devem funcionar em mobile, mesmo sem um frame específico.

Páginas editoriais, suporte, atividade, ofertas e downloads não fazem parte da entrega. Links externos e ações auxiliares devem ter comportamento coerente; ações fora do escopo não devem aparentar sucesso funcional.

### Catálogo e detalhe

- Busca, filtros, ordenação e paginação devem compor o estado da URL e sobreviver a refresh e navegação pelo histórico.
- Filtros devem ser combináveis; mudança de filtro deve reiniciar a paginação.
- As consultas devem refletir os parâmetros enviados à API, com tratamento de resultados vazios, falhas e respostas fora de ordem.
- O detalhe deve suportar acesso direto, NFT inexistente, edição indisponível e limite de quantidade.
- Favoritos devem persistir para o usuário autenticado.

### Carrinho

- Adicionar, alterar e remover itens, respeitando a disponibilidade por NFT e edição.
- Manter o carrinho após refresh e preservar os itens do visitante ao autenticar.
- Aplicar e remover cupom, com tratamento de código inválido ou expirado.
- Exibir subtotal, desconto, taxa de rede e total coerentes com a resposta da API.
- Refletir alterações de preço e disponibilidade recebidas enquanto o carrinho estiver aberto.

Valores em ETH devem trafegar como strings decimais e manter precisão nos cálculos e na apresentação. Quantidades são inteiras. A cotação da API é a referência para finalizar o pedido.

### Pagamento e confirmação

- Validar os campos do layout e permitir revisão antes do envio.
- Utilizar as carteiras cadastradas, com seleção de rede e simulação de conexão, recusa e desconexão.
- Revalidar preço, disponibilidade, cupom e taxas antes de confirmar a compra. Mudanças devem exigir nova confirmação do usuário.
- Impedir pedidos duplicados em cliques repetidos ou reenvios após timeout.
- Representar pedido pendente, confirmado e recusado, com recuperação após refresh ou reconexão.
- Exibir a confirmação somente para pedido efetivamente confirmado na simulação.
- Preservar os itens em falhas; após confirmação, remover do carrinho apenas os itens e quantidades comprados.

O recibo deve reproduzir o snapshot do pedido. Alterações posteriores no catálogo não podem modificar seus valores. Referências de transação e links de exploração são simulados.

### Conta e sessão

Cadastro, login, logout e sessão são obrigatórios, integrados à API simulada. Checkout, perfil, carteiras, favoritos e pedidos exigem autenticação.

A sessão deve ser recuperável após refresh. Trate expiração durante a navegação e durante o checkout, preservando o contexto para retomada. Logout e troca de usuário devem limpar dados privados em cache e subscriptions da sessão anterior.

Valide os formulários de cadastro, perfil, senha e carteiras, incluindo erros retornados pela API. Alterações confirmadas devem permanecer após refresh. Use credenciais fictícias e não armazene senhas em claro.

## 4. Integração e estado

Use TanStack Router nas rotas, parâmetros de busca e proteção dos fluxos privados. Use TanStack Query nas consultas, mutations e sincronização do cache. As chamadas REST devem passar pelo Axios.

A solução deve garantir:

- contratos tipados entre transporte, estado e interface;
- estados de carregamento, vazio, erro, sucesso e atualização em segundo plano;
- invalidação coerente após mutations e eventos;
- cancelamento ou descarte de respostas obsoletas;
- isolamento dos dados por usuário e pelos parâmetros da consulta;
- recuperação de falhas sem duplicar operações;
- tratamento de rotas inexistentes e acesso direto a qualquer tela prevista.

Aplique atualização otimista em pelo menos uma interação, com rollback em caso de falha. A política de cache, retries e sincronização deve ser documentada.

## 5. Contratos REST

Defina e documente os contratos utilizados. Os recursos mínimos são:

| Recurso        | Operações                                                                  |
| -------------- | -------------------------------------------------------------------------- |
| Sessão e conta | Cadastro, login, consulta da sessão, logout e expiração                    |
| NFTs           | Listagem com busca/filtros/ordenação/paginação e detalhe por identificador |
| Favoritos      | Consulta, inclusão e remoção                                               |
| Carrinho       | Consulta, inclusão, alteração e remoção de itens                           |
| Cotação        | Validação de cupom, disponibilidade, descontos, taxas e total              |
| Pedidos        | Criação idempotente e consulta do estado e recibo                          |
| Perfil         | Consulta, atualização de dados/avatar e alteração de senha                 |
| Carteiras      | Consulta, cadastro e atualização                                           |

As respostas devem representar erros de validação, sessão inválida, falta de permissão, recurso inexistente, conflito de disponibilidade e falha transitória.

As mutations de pedido devem aceitar uma chave de idempotência. Na simulação, a mesma tentativa deve recuperar o mesmo pedido; reutilizar a chave com conteúdo diferente deve gerar conflito.

## 6. Mocking com MSW

Implemente os mocks na camada de rede, reutilizando contratos e cenários entre desenvolvimento, demonstração e testes. Componentes, hooks e cliente Axios não devem conter respostas fictícias ou caminhos alternativos de negócio.

Os mocks devem manter estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos. Persistência local é permitida para sustentar refresh; o reset deve restaurar integralmente um cenário conhecido.

### Simulating Network Conditions and Failures

Simule condições de rede e falhas com MSW, incluindo lentidão, latência variável, timeouts, indisponibilidade de conexão e respostas HTTP de erro. Os cenários devem ser configuráveis e reproduzíveis, permitindo avaliar o carregamento, o feedback de erro e a recuperação da interface.

Disponibilize fixtures com variedade suficiente para exercitar filtros e paginação, pelo menos dois usuários e cenários determinísticos de:

- sucesso e resultado vazio;
- latência variável e respostas fora de ordem;
- falhas de conexão e respostas HTTP 4xx/5xx;
- sessão expirada e acesso não autorizado;
- conflito de cadastro ou de validação de formulário;
- cupom inválido ou expirado;
- preço alterado ou edição esgotada durante a compra;
- timeout após criação do pedido, com recuperação por idempotência;
- pagamento confirmado e pagamento recusado.

Use MSW também na simulação dos eventos, com uma integração compatível com o protocolo Socket.IO, como [@mswjs/socket.io-binding](https://github.com/mswjs/socket.io-binding). Documente o transporte utilizado e suas limitações no ambiente de mocks.

Os cenários devem exercitar `socket.io-client`. Substituir o socket por chamadas diretas a setters, callbacks ou ao cache não atende ao requisito.

A camada de mocks deve ser ativada por configuração e estar disponível no build de demonstração. Mudanças nos dados simulados devem ser refletidas tanto nas respostas REST quanto nos eventos correspondentes.

## 7. Tempo real com Socket.IO

Implemente, no mínimo, os seguintes eventos:

| Evento          | Comportamento esperado                                            |
| --------------- | ----------------------------------------------------------------- |
| `nft.updated`   | Atualizar preço e disponibilidade no catálogo, detalhe e carrinho |
| `order.updated` | Atualizar o estado do pedido e apresentar confirmação ou recusa   |

Os eventos devem carregar identidade estável, recurso afetado e versão. O cliente deve tolerar duplicatas e eventos antigos, sem regredir um estado mais recente nem reaplicar efeitos.

Após reconexão, reconcilie os recursos ativos com a API REST. Eventos de uma sessão anterior não podem atualizar dados de outro usuário. Listeners e subscriptions devem ser liberados ao encerrar seu ciclo de vida.

Implemente o cenário:

1. Um NFT está no carrinho.
2. Seu preço ou disponibilidade muda durante a navegação.
3. A interface informa a alteração e atualiza o resumo.
4. O checkout impede a confirmação com uma cotação desatualizada.

Também deve funcionar uma interrupção de conexão enquanto o pedido está pendente. Após reconectar ou recarregar a página, o usuário deve recuperar seu estado sem criar outra compra. Pedidos confirmados ou recusados são terminais.

## 8. Interface, responsividade e acessibilidade

Preserve tipografia, cores, espaçamentos, hierarquia, imagens, proporções e composição do Figma. Adapte os componentes shadcn/ui à identidade visual do projeto.

Todas as telas devem funcionar em desktop, tablet e mobile, com atenção a filtros, navegação, formulários, carrinho e checkout. Avalie, no mínimo, larguras de 390, 768 e 1440 pixels.

Use **skeletons com shimmer effect** nos componentes dependentes de dados durante o carregamento, incluindo catálogo, detalhe e resumo do carrinho. Preserve as dimensões do conteúdo para evitar deslocamentos de layout e respeite a preferência por movimento reduzido.

São obrigatórios:

- navegação por teclado e foco visível;
- controle de foco em diálogos e drawers;
- semântica adequada, labels e mensagens de erro associadas aos campos;
- alternativas textuais para imagens relevantes;
- contraste legível e estados não dependentes apenas de cor;
- feedback acessível para mutations e alterações em tempo real;
- ausência de overflow horizontal indevido e perda de conteúdo com zoom.

Use os assets do arquivo quando disponíveis e mantenha imagens e fontes necessárias acessíveis à execução local. Documente qualquer substituição de asset ou ajuste de acessibilidade em relação ao layout.

## 9. Testes com Playwright

Entregue testes E2E executáveis com os mocks, cobrindo:

1. Busca, filtros combinados, ordenação, paginação e restauração pelo histórico.
2. Acesso direto ao detalhe e tratamento de recurso inexistente.
3. Cadastro, login, expiração de sessão, logout e troca de usuário.
4. Favoritos, incluindo falha de mutation e recuperação do estado.
5. Carrinho, quantidades, remoção, cupom e persistência após refresh/login.
6. Compra completa, do catálogo ao recibo confirmado.
7. Falha de pagamento, clique repetido e timeout com recuperação do mesmo pedido.
8. Edição de perfil, avatar, senha e carteiras, com erros de validação.
9. Alteração de preço/disponibilidade via Socket.IO durante o checkout.
10. Eventos duplicados ou antigos, desconexão e retomada de pedido pendente.
11. Navegação por teclado, foco de diálogos e validação de formulários.
12. Skeletons durante carregamento lento, feedback de falha e recuperação após nova tentativa.

Execute os fluxos principais em Chromium, nos viewports desktop e mobile. Inclua regressão visual de início, detalhe, carrinho e pagamento, com baselines versionadas e dados estáveis.

Cada teste deve partir de um estado isolado. Controle relógio, latência e disparo dos eventos nos cenários sensíveis a tempo. Entregue relatório HTML e traces das falhas.

As verificações devem observar a interface e os resultados das operações. Os testes de tempo real precisam passar pelo cliente Socket.IO e os de REST pelos handlers MSW.

## 10. Performance e Lighthouse

Audite início e detalhe do NFT com Lighthouse em perfis mobile e desktop, usando build otimizado e o cenário padrão dos mocks.

| Categoria      | Meta |
| -------------- | ---: |
| Performance    | ≥ 90 |
| Accessibility  | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO            | ≥ 90 |

Execute três medições por página e perfil e reporte a mediana de cada categoria. Versione a configuração da auditoria e entregue relatórios HTML/JSON, versões das ferramentas, ambiente e condições de execução.

Registre LCP, CLS e TBT. Justifique resultados abaixo das metas e identifique as causas. A auditoria deve carregar as imagens, fontes e funcionalidades da entrega, sem simplificações exclusivas para melhorar a pontuação.

## 11. Critérios de avaliação

| Critério                           |  Pontos | Evidência esperada                                          |
| ---------------------------------- | ------: | ----------------------------------------------------------- |
| Fidelidade visual e responsividade |      20 | Aderência ao Figma e consistência entre tamanhos de tela    |
| Fluxos e experiência de uso        |      20 | Compra e conta completas, validações e recuperação de erros |
| Integração e estado                |      15 | Router, Query, Axios, contratos e cache coerentes           |
| Tempo real                         |      10 | Eventos, reconexão, ordenação e sincronização com REST      |
| Mocking                            |      10 | MSW, cenários determinísticos, persistência e reset         |
| Testes                             |      10 | Cobertura dos fluxos e falhas com Playwright                |
| Acessibilidade                     |       5 | Operação por teclado, semântica, foco e feedback            |
| Performance                        |       5 | Resultados e análise das auditorias Lighthouse              |
| Arquitetura e documentação         |       5 | Tipagem, responsabilidades e execução reproduzível          |
| **Total**                          | **100** |                                                             |

São eliminatórios: ausência de uso efetivo da stack obrigatória, fluxos principais apenas visuais, compra confirmada sem resposta da simulação, exposição de dados entre usuários, eventos simulados diretamente na UI ou ausência de testes E2E executáveis.

## 12. Entrega

Entregue código-fonte, lockfile, assets, mocks, fixtures, testes e configurações de auditoria.

O **deploy é obrigatório**. Envie o link do repositório e uma URL pública da aplicação. Recomenda-se [Vercel](https://vercel.com/docs/frameworks/frontend/vite); [Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/) e [Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/) também são aceitos.

A versão publicada deve corresponder ao código entregue e permanecer acessível durante a avaliação, com os mocks e os fluxos de tempo real funcionando. Acesso direto e refresh das rotas devem funcionar no ambiente publicado.

O `README.md` da solução deve conter setup, variáveis de ambiente, credenciais fictícias, seleção e reset dos cenários, comandos de execução e instruções para reproduzir os fluxos de falha.

Documente os contratos REST e eventos, a política de sessão, o estado do carrinho, a estratégia de cache e a reconciliação entre REST e Socket.IO. Registre limitações, decisões de UX e eventuais desvios do Figma em `ARCHITECTURE.md`.

Disponibilize comandos para desenvolvimento com mocks, build, preview, verificação de tipos, lint, testes Playwright e auditoria Lighthouse.

A entrega deve executar a partir de um checkout limpo, sem depender de serviços privados ou do backend de produção.

---

## Implementação atual

Esta solução inicia um marketplace funcional com dados simulados por MSW, rotas TanStack Router, cache TanStack Query, Axios, Socket.IO no ambiente de desenvolvimento e Tailwind + componentes no padrão shadcn/ui.

### Pré-requisitos

- Node.js 22 ou superior
- npm 10 ou superior

### Executar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

Os mocks (MSW) só sobem com `VITE_ENABLE_MOCKS=true`, de forma explícita:

| Comando              | Mocks                                  | Origem da flag                                            |
| -------------------- | -------------------------------------- | --------------------------------------------------------- |
| `npm run dev`        | Ligados                                | `.env.development`                                        |
| `npm run build:demo` | Ligados (build de demonstração/deploy) | `.env.demo` (`vite --mode demo`)                          |
| `npm run build`      | **Desligados**                         | Sem a flag, o MSW nem entra no bundle                     |
| `npm run test:e2e`   | Ligados                                | `playwright.config.ts` (servidor próprio na porta `5180`) |

Um `.env.local` tem prioridade sobre esses arquivos. Para usar uma API real, defina `VITE_ENABLE_MOCKS=false` e `VITE_API_URL`.

### Credenciais de demonstração

| Item           | Valor                                                 |
| -------------- | ----------------------------------------------------- |
| Usuária 1      | `collector@kurio.test` / `Kurio#2026` (Ana Coleciona) |
| Usuária 2      | `lia@kurio.test` / `Kurio#2026` (Lia Coleciona)       |
| Cupom válido   | `KURIO10` (10% de desconto)                           |
| Cupom expirado | `KURIO-EXPIRADO`                                      |

### Comandos

```bash
npm run typecheck
npm run lint
npm run build
npm run build:demo
npx playwright install chromium   # uma vez por máquina
npm run test:e2e
npm run test:visual:update
npm run preview
npm run audit:lighthouse
```

### Testes E2E e regressão visual

- `npm run test:e2e` sobe um servidor próprio na porta `5180` (`VITE_ENABLE_MOCKS=true`, Firebase desligado), independente do `.env.local` e de um `npm run dev` aberto.
- As baselines visuais (início, detalhe, carrinho e pagamento, em desktop e mobile) ficam em `tests/visual/__screenshots__/`, sem sufixo de sistema operacional. Os testes visuais fixam a data da página, o fuso (`America/Sao_Paulo`), o locale (`pt-BR`) e `reducedMotion`, esperam fontes e imagens e mascaram os carrosséis com autoplay.
- A renderização de fontes varia entre sistemas: as baselines atuais foram geradas no macOS. Para rodar em Linux/CI, regenere com `npm run test:visual:update` no mesmo ambiente do CI (por exemplo, a imagem `mcr.microsoft.com/playwright`) e versione o resultado.
- Relatório HTML em `playwright-report/` e traces das falhas em `test-results/`.

`audit:lighthouse` espera uma aplicação em preview na porta `4173`; execute `npm run build:demo && npm run preview` em outro terminal antes da auditoria. Os relatórios são gravados em `lighthouse-reports/`.

### Cenários e reset

O estado de demonstração é compartilhado entre os handlers REST e o Socket.IO simulado, e é persistido localmente para sustentar refresh. Com os mocks ligados, há duas formas equivalentes de controlar os cenários:

- **Console:** `window.kurioMocks` (por exemplo, `kurioMocks.setScenario({ payment: "declined" })`).
- **URL:** `?mock-scenario=chave:valor,chave:valor` aplica um cenário ao carregar; `?mock-reset=1` restaura os dados e o cenário padrão.

| Cenário                         | Valores                                                                    | Efeito                                                                                                                              |
| ------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `latency`                       | `normal` (220 ms), `slow` (2 s), `variable` (100 ms a 1,5 s, semente fixa) | Latência das respostas; `variable` gera respostas fora de ordem de forma reproduzível                                               |
| `network`                       | `online`, `offline`                                                        | `offline` faz toda chamada à API falhar por conexão                                                                                 |
| `failurePath` + `failureStatus` | prefixo de rota (ex.: `/api/nfts`) + status (500, 503, 404, 429)           | Força o erro HTTP nas rotas com esse prefixo                                                                                        |
| `payment`                       | `confirmed`, `declined`, `pending`                                         | Resultado do pagamento; `pending` é confirmado em 4 s via `order.updated` (ou com `confirmPendingOrders()`)                         |
| `orderTimeout`                  | `true`, `false`                                                            | Cria o pedido, mas responde depois do timeout do cliente (8 s); a nova tentativa recupera o mesmo pedido pela chave de idempotência |

Ações disponíveis em `window.kurioMocks`:

| Ação                                               | Uso                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `changeNftPrice(nftId, priceEth)`                  | Muda o preço, atualiza os carrinhos que têm o NFT e emite `nft.updated`                     |
| `markNftSoldOut(nftId)`                            | Esgota a edição: o carrinho avisa e o pedido é recusado com 409                             |
| `redeliverNftEvent(nftId, "latest" \| "previous")` | Reenvia um evento duplicado ou antigo, que o cliente deve ignorar                           |
| `dropRealtime()` / `restoreRealtime()`             | Derruba e restaura o Socket.IO; ao reconectar, o cliente reconcilia via REST                |
| `expireSessions()`                                 | Expira as sessões: a próxima requisição autenticada responde 401 e o login é pedido de novo |
| `confirmPendingOrders()`                           | Confirma os pedidos pendentes                                                               |
| `reset()`                                          | Restaura os dados e o cenário padrão e recarrega a página                                   |

#### Reproduzir os fluxos de falha

| Fluxo                      | Como reproduzir                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Pagamento recusado         | Cenário `payment: declined` → confirmar a compra → mensagem de recusa; trocar para `confirmed` e confirmar de novo              |
| Timeout com recuperação    | Ativar `orderTimeout` → confirmar → mensagem de demora (8 s) → desativar e confirmar de novo: o mesmo pedido é recuperado       |
| Pedido pendente            | Cenário `payment: pending` → confirmar → recarregar a página → `kurioMocks.confirmPendingOrders()` mostra o recibo              |
| Preço alterado no checkout | No checkout, `kurioMocks.changeNftPrice("emerald-ape-042", "2.50")` com o NFT no carrinho → aviso e resumo atualizados          |
| Edição esgotada            | No checkout, `kurioMocks.markNftSoldOut(<id>)` → aviso → a confirmação é bloqueada                                              |
| Falha 5xx e nova tentativa | `failurePath: /api/nfts`, `failureStatus: 503` → recarregar → "Tentar novamente" depois de remover a falha                      |
| Sem conexão                | `network: offline` → recarregar → mensagem de conexão → voltar para `online` e tentar de novo                                   |
| Sessão expirada            | Logada, `kurioMocks.expireSessions()` → navegar para outra página da conta → aviso e modal de login                             |
| Socket caído               | `kurioMocks.dropRealtime()` → alterar um preço (o evento se perde) → `kurioMocks.restoreRealtime()` → a tela reconcilia o preço |
| Cupom inválido / expirado  | No carrinho, `CUPOM-ERRADO` ou `KURIO-EXPIRADO`                                                                                 |

As decisões de sessão, cache, contratos, eventos e desvios provisórios do Figma estão em [ARCHITECTURE.md](ARCHITECTURE.md).

### Autenticação

Login, cadastro e recuperação visual de senha abrem em um modal sobre a página atual. Para habilitar Google e Facebook, siga o [guia passo a passo do Firebase Authentication](docs/firebase-auth.md). E-mail/senha continuam usando a API do marketplace; a recuperação de senha não envia e-mails.