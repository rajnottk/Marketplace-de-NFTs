# Arquitetura — Kurio NFT Marketplace

O header e o rodapé institucional aparecem apenas no desktop; a home mobile mantém busca e filtros próprios. A navegação inferior mobile aparece em todas as rotas, incluindo os detalhes de NFT. Nesse detalhe, uma imagem sem ampliação ocupa o painel `#2F1D15`, com voltar e favorito no topo. O painel de informações `#241612` sobrepõe a imagem e reúne edição, atributos, quantidade, compra e acesso ao carrinho. A nota leva às abas abaixo da primeira dobra; recomendações continuam em carrossel automático. A galeria e os controles desktop são preservados.

## Visão geral

O aplicativo é uma SPA React/TypeScript organizada por módulos de negócio. As telas dependem de hooks e APIs tipadas; nenhuma delas acessa fixtures ou handlers diretamente.

```text
UI → TanStack Query → Axios ───────────→ MSW REST handlers ──┐
 ↑                                                            ├─ mock database (estado + cenários)
 └─ socket.io-client ─→ MSW ws.link + @mswjs/socket.io-binding ┘   publica nft.updated / order.updated
```

## Decisões principais

- **Estilo:** Tailwind CSS e componentes no padrão shadcn/ui. Os tokens provisórios ficam em `src/shared/styles/globals.css` como variáveis CSS globais; são uma interpretação da direção escura, marrom e âmbar do Figma e devem ser substituídos quando os valores oficiais forem disponibilizados.
- **Precisão:** ETH trafega como `string` e todos os cálculos usam `decimal.js`.
- **Sessão:** o token simulado fica em `localStorage`; senhas não são persistidas em texto claro. Dados de mock persistidos carregam somente um verificador derivado da senha de demonstração.
- **Carrinho:** visitante usa a chave `guest`; no login, os itens são mesclados com o carrinho da conta somando as quantidades. Por decisão de produto não há quantidade máxima por compra (só o mínimo de 1); uma edição esgotada (`available: 0`) não pode ser adicionada nem comprada (409 `EDITION_SOLD_OUT`). A seleção de edição no detalhe é apenas visual.
- **Cache:** queries não fazem retry em respostas 4xx e mutations não repetem automaticamente. Login, logout e mutations invalidam ou atualizam somente as chaves afetadas.
- **Falhas de gravação:** o cenário local só muda em memória após persistir com sucesso. Carteiras e pedidos retornam erros específicos para armazenamento cheio ou bloqueado. A UI diferencia esses erros de timeout, falha de conexão e respostas internas inválidas; a confirmação pode repetir uma cotação que falhou sem apagar o carrinho.
- **Perfil:** `/account/profile` e `/account/wallet` compartilham o menu da conta. Perfil e avatar são persistidos no cenário local e sincronizados com a sessão no header. O avatar é recortado e reduzido para 256 × 256 antes de salvar. `PATCH /profile` aceita os dados completos e uma troca de senha opcional; valida a senha atual antes de salvar qualquer alteração. As áreas de atividade, interesse, ofertas, downloads e suporte possuem rotas próprias em construção.
- **Navegação da conta:** o layout de `/account` permanece montado nas subrotas para animar o indicador lateral; respeita a preferência por movimento reduzido. Os ícones laterais usam Iconsax. As páginas em construção reutilizam o mesmo conteúdo visual das demais áreas.
- **Carteiras:** o formulário armazena identificação, rede, tipo de carteira, indicação, contato e ENS. `POST /wallets` cadastra e `PATCH /wallets/:walletId` edita somente carteiras da sessão atual. Marcar “Igual à carteira principal” abre o formulário secundário com rede, tipo, e-mail, ENS e nome do perfil da principal cadastrada. Nome de exibição, apelido, endereço, endereço secundário e indicação ficam vazios. Desmarcar fecha o formulário e restaura o rascunho anterior. A gravação ocorre somente ao enviar o formulário, sem associação automática entre as carteiras. Após sucesso, o formulário secundário fecha em dois segundos; temporizadores são cancelados ao fechar ou sair da página.
- **Pedido:** `POST /orders` recebe `Idempotency-Key` e o corpo `{ network, cartVersion }` (a versão do carrinho revisada). Mesma chave, mesmo dono e mesmo corpo → o mesmo pedido; chave reaproveitada por outro usuário ou com outro corpo → 409 `IDEMPOTENCY_CONFLICT`; carrinho alterado ou cotação ausente, expirada ou de outra rede → 409 `QUOTE_OUTDATED`. Pedidos são privados (`GET /orders/:id` de outro usuário → 404). O checkout confirma sempre contra o carrinho atual do servidor e, se houver mudança que o usuário não viu, pede nova confirmação. A chave é renovada em pedido recusado ou rejeitado e mantida no retry de timeout/falha de rede. O recibo armazena um snapshot dos itens e da cotação; só um pedido confirmado remove do carrinho os itens e quantidades comprados.
- **Pagamento pendente:** o checkout guarda o id do pedido pendente por usuário (`localStorage`) e o acompanha pela query do pedido, atualizada por `order.updated` e pela reconciliação na reconexão. Após um refresh, a página retoma o acompanhamento; a confirmação fica bloqueada enquanto houver pedido pendente.
- **Sessão expirada:** um 401 em requisição autenticada (fora de `/auth/*`) remove o token, limpa os dados privados do cache, mostra um aviso e abre o login sem trocar a página atual.
- **Pagamento mobile:** lista as carteiras conectadas ou com os campos obrigatórios configurados, selecionando a primeira ao montar a página. Uma única carteira configurada é suficiente, mesmo com outras carteiras incompletas. Os três pontos editam a carteira correspondente; “Trocar carteira” edita a selecionada em um modal shadcn. A configuração usa o formulário e a validação do checkout desktop e persiste os dados na carteira. A confirmação valida a selecionada antes de enviar o pedido; a rede dela controla a cotação, cuja atualização é serializada para evitar respostas fora de ordem. O desktop mantém seu formulário e resumo completos.
- **Busca e mobile:** a pesquisa no header filtra somente títulos dos NFTs após 300 ms sem digitação, preserva os filtros da URL e volta para a primeira página. No mobile fica visível; no desktop abre dentro da mesma linha do header. Os filtros compartilham o mesmo componente entre a lateral desktop e o modal shadcn; a ordenação também fica no modal no celular. O hero mobile mantém textos e círculos decorativos de 248 px fixos, com o carrossel limitado à imagem maior do NFT. Destaque, criadores e posts têm versões compactas. A navegação inferior ocupa toda a largura, mantém o perfil como ícone fixo e usa ícones sólidos Font Awesome; o ícone Scanner vem da Iconsax. O botão central translúcido escolhe uma posição aleatória no catálogo completo e abre seu NFT, evitando repetir o atual. A barra respeita a área segura do aparelho e reserva espaço no documento. Favoritos possui uma rota em construção. O botão Perfil do footer leva visitantes para /login e usuários autenticados para /account/profile.

## REST simulado

Os contratos ficam em `src/shared/contracts/marketplace.ts`; handlers em `src/mocks/rest/handlers.ts`.

| Recurso   | Operações                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| Sessão    | cadastro, login, sessão e logout                                                                                     |
| NFTs      | lista com filtros, ordenação e detalhe                                                                               |
| Carrinho  | leitura, adição, edição, remoção e cotação                                                                           |
| Favoritos | leitura e alternância para usuário autenticado                                                                       |
| Pedido    | criação idempotente (409 de conflito, cotação desatualizada e edição esgotada) e consulta do recibo restrita ao dono |
| Conta     | perfil e carteiras                                                                                                   |

## Tempo real

- **Transporte:** o cliente usa `socket.io-client` (`src/shared/hooks/use-realtime.ts`) com transporte WebSocket. No modo mock, o servidor é simulado na própria página pelo MSW (`ws.link` na origem do app) com `@mswjs/socket.io-binding`, que traduz o protocolo Engine.IO/Socket.IO (`src/mocks/realtime/socket-handlers.ts`). Por isso o tempo real funciona no `npm run dev`, no `build:demo` e no deploy.
- **Origem dos eventos:** o mock database publica `nft.updated` e `order.updated` (`src/mocks/realtime/event-bus.ts`) depois de gravar cada mudança. REST e eventos descrevem sempre o mesmo estado. Os eventos têm `eventId`, `resourceId`, `resourceType`, `version` e `occurredAt`.
- **Isolamento:** a conexão se identifica com o token de sessão (`session:subscribe`). `nft.updated` é público; `order.updated` só é entregue ao dono do pedido. Trocar de usuário encerra a conexão e abre outra, e zera as versões já vistas.
- **Duplicatas e eventos antigos:** um evento só é aplicado se a versão for maior que a última vista e que a versão já em cache vinda do REST.
- **Carrinho:** preço, versão e cotação do carrinho pertencem ao servidor. O evento só atualiza o NFT dentro do item e refaz a busca do carrinho; quando o preço ou a disponibilidade de um item muda, um aviso acessível (`aria-live`) informa a mudança.
- **Reconexão:** a cada conexão o cliente invalida catálogo, detalhes, carrinho e pedidos, reconciliando por REST o que foi perdido durante a queda.
- **Limitações do binding:** o `@mswjs/socket.io-binding` não tem salas, namespaces nem heartbeat; o handler envia o ping do Engine.IO a cada 20 s e faz a entrega por usuário no barramento de eventos. Outros WebSockets da mesma origem (como o HMR do Vite) são repassados ao servidor real. O app só é carregado depois de o MSW iniciar, porque o `socket.io-client` captura o construtor `WebSocket` no import.

## Cenários do mock

`src/mocks/scenarios.ts` define latência (normal, lenta e variável com semente fixa), conexão (online/offline), falha HTTP por prefixo de rota, resultado do pagamento (confirmado, recusado, pendente) e timeout após a criação do pedido. Os cenários ficam no `localStorage` e são controlados por `window.kurioMocks` ou por `?mock-scenario=`. As ações (mudar preço, esgotar edição, reenviar evento, derrubar/restaurar socket, expirar sessões, confirmar pendentes e reset) estão em `src/mocks/controls/mock-controls.ts`, usado também pelos testes E2E. O passo a passo para reproduzir cada falha está no README.

## Figma e desvios atuais

O arquivo foi inspecionado visualmente, mas não concedeu acesso estruturado para tokens ou exportação de assets. A implementação reproduz a direção de arte — navegação persistente, catálogo de cards, tipografia monoespaçada, superfícies escuras e CTAs âmbar — usando imagens provisórias. A etapa de refinamento deve substituir imagens remotas, registrar os tokens oficiais e executar a comparação visual por frame.

## Limitações conhecidas

- Blockchain e pagamento são simulados. Google e Facebook usam OAuth real via Firebase Authentication quando configurados; a sessão do marketplace continua local no modo MSW, após verificar o ID token em `accounts:lookup`. O backend de produção precisa implementar a troca de token descrita em [Configuração do Firebase](docs/firebase-auth.md).
- O desktop e os acessos contextuais usam o modal global de autenticação. O footer mobile abre /login e /register, com recuperação visual de senha na tela de login. As telas e o modal compartilham validação, login social e atualização da sessão/cache. Entrar ou cadastrar, pelas telas ou pelo modal, leva à página inicial. O botão Perfil do footer continua abrindo a configuração do perfil para quem já está autenticado. A recuperação não envia e-mails.
- O Socket.IO é simulado no navegador pelo MSW. Com uma API real, o mesmo cliente se conecta a um servidor Socket.IO que implemente o evento `session:subscribe` e entregue `order.updated` só ao dono do pedido.
- A etapa atual privilegia fluxos e responsividade; a comparação pixel-perfect com o Figma é posterior, como acordado.