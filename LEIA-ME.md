# Página de vendas do Balconista

Este repositório é **só a página de vendas** (balconista.app.br). O sistema (painel das lojas, robô do WhatsApp, cadastro) fica em outro lugar e não é afetado pelo que muda aqui.

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `index.html` | A página inteira: textos, seções, planos, perguntas frequentes e o estilo (CSS no `<style>` do topo) |
| `js/site.js` | Os botões, o robô de demonstração e as animações. No começo ficam os endereços do painel (`PAINEL` e `CONFIG`) |
| `img/` | Imagens da página (`og.png` é a imagem que aparece ao compartilhar o link) |
| `fonts/` | Fontes Geist, hospedadas aqui mesmo (a página não usa o Google Fonts) |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png` | Ícones da aba do navegador e do celular |
| `robots.txt`, `sitemap.xml` | Para o Google achar a página |
| `Abrir landing.bat` | Atalho para Windows: abre a página no seu computador com dois cliques |

## Como uma mudança vai para o ar

1. **Branch e Pull Request:** crie uma branch (ex.: `ajuste-planos`), faça as mudanças e abra um **Pull Request** para a `main`.
2. **Revisão:** o Thaylon revisa. Se precisar de ajuste, ele comenta ou corrige no próprio Pull Request.
3. **Teste:** a versão do Pull Request é publicada na **página de teste**, https://site.179-236-243-185.sslip.io. Ela fica fora do Google, e os botões levam ao **painel de teste**, então dá para clicar em tudo sem criar conta de verdade.
4. **Produção:** aprovado no teste, o Pull Request entra na `main` e a `main` é publicada em **balconista.app.br**.

A `main` é o que está no ar. Ninguém publica direto nela, tudo passa pelo Pull Request.

**Antes de começar uma mudança nova, atualize a sua cópia com a `main`** (`git pull origin main`). Assim o Pull Request não desfaz o que já foi publicado.

## Para ver no seu computador

Os endereços começam com `/` (ex.: `/img/painel-vendas.webp`), então abrir o arquivo com dois cliques não mostra as imagens. Rode um servidor simples na pasta:

```
npx serve .
```

Depois abra o endereço que aparecer (normalmente http://localhost:3000).

No Windows, também dá para dar dois cliques em **`Abrir landing.bat`**: ele sobe a página em http://127.0.0.1:8767 e abre o navegador (precisa do Python instalado). Para parar, feche a janela preta.

No seu computador, os botões levam ao painel de teste.

## O que se mexe na página (tudo em `js/site.js`)

- **Topo:**
  - conversas de vários negócios rolando ao fundo (`WALL`);
  - celular e painel que seguem o mouse;
  - a conversa do celular em loop (`HERO`).
- **Tour de 30 segundos:** o "vídeo" do produto, feito com animação da própria página. Não é YouTube, então não precisa liberar nada.
- **Demonstração:** 3 tipos de negócio (`SCENARIOS`).
- **Robô de demonstração** (botão no canto): conversa de verdade no navegador, sem enviar nada. O cardápio, os serviços e os horários do robô ficam em `MENU`, `SERVICES` e `PROS`.
- **Painel ao vivo:** simulação com dados fictícios, com pausar e acelerar.
- **Recursos clicáveis:** promoção, cupom, agenda, ordem de serviço e permissões.

Tudo o que é simulação está marcado na página como exemplo ou dado fictício. Quem usa "reduzir movimento" no aparelho vê tudo parado e completo, e as animações pausam quando saem da tela.

## Cuidados

- **Não prometa o que o sistema não faz.** Números, planos e recursos da página precisam bater com o sistema e com os termos de uso. Na dúvida, pergunte antes.
- **Botões "Testar grátis", "Entrar" e dos planos** levam para o painel. Os endereços ficam em `js/site.js` (`PAINEL` e `CONFIG`). Os links do HTML precisam ter `data-signup`, `data-login` ou `data-legal`, para o script trocar o endereço.
- **Termos e privacidade** ficam no painel (`/termos`). O rodapé só aponta para lá.
- **Ferramentas de fora** (Google Analytics, Pixel da Meta, vídeo do YouTube, chat) precisam de duas coisas:
  - o servidor precisa liberar o endereço nas regras de segurança da página, senão o navegador bloqueia;
  - a política de privacidade precisa ser atualizada, porque hoje ela diz que não usamos rastreadores de propaganda.

  Avise antes de colocar.
- **Script sempre em `js/site.js`**, nunca dentro do HTML (`<script>...</script>` ou `onclick=`): as regras de segurança bloqueiam script dentro da página. Dados para o Google em `<script type="application/ld+json">` podem ficar.
- **Imagens:** use `.webp` ou `.jpg` com até ~300 KB. Página leve carrega rápido no celular e aparece melhor no Google.
- **Acessibilidade:** toda imagem precisa de `alt` descrevendo o que mostra. Mantenha o contraste dos textos.
