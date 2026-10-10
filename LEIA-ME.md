# Página de vendas do Balconista

Este repositório é **só a página de vendas** (balconista.app.br). O sistema (painel das lojas, robô do WhatsApp, cadastro) fica em outro lugar e não é afetado pelo que muda aqui.

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `index.html` | A página inteira: textos, seções, planos, perguntas frequentes e o estilo (CSS no `<style>` do topo) |
| `js/site.js` | Os botões, o robô de demonstração e as animações. No começo (`CONFIG`) ficam os endereços do painel |
| `img/` | Imagens da página (`og.png` é a imagem que aparece ao compartilhar o link) |
| `fonts/` | Fontes Geist, hospedadas aqui mesmo (a página não usa o Google Fonts) |
| `Abrir landing.bat` | Atalho para Windows: abre a página no seu computador com dois cliques |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png` | Ícones da aba do navegador e do celular |
| `netlify.toml` | Publicação e regras de segurança. Mexa só com ajuda |
| `robots.txt`, `sitemap.xml` | Para o Google achar a página |

## Como publicar uma mudança

1. Crie uma branch, por exemplo `ajuste-planos`, e faça as mudanças nela.
2. Abra um **Pull Request** para a branch `main`.
3. O Netlify gera sozinho um **link de prévia** no Pull Request. Confira no computador **e no celular**.
4. Quando o Thaylon aprovar e juntar na `main`, a mudança vai para **balconista.app.br** em cerca de 1 minuto.

A `main` é o que está no ar. Nada vai para lá sem passar pelo Pull Request.

## Para ver no seu computador

Os endereços começam com `/` (ex.: `/img/painel-vendas.webp`), então abrir o arquivo com dois cliques não mostra as imagens. Rode um servidor simples na pasta:

```
npx serve .
```

Depois abra o endereço que aparecer (normalmente http://localhost:3000).

No Windows, também dá para dar dois cliques em **`Abrir landing.bat`**: ele sobe a página em http://127.0.0.1:8767 e abre o navegador (precisa do Python instalado). Para parar, feche a janela preta.

## O que se mexe na página (tudo em `js/site.js`)

- **Topo:** conversas de vários negócios rolando ao fundo (`WALL`), celular e painel que seguem o mouse, e a conversa do celular em loop (`HERO`).
- **Tour de 30 segundos:** o "vídeo" do produto, feito com animação da própria página (não é YouTube, então não precisa liberar nada).
- **Demonstração** com 3 tipos de negócio (`SCENARIOS`) e **robô de demonstração** (botão no canto): conversa de verdade no navegador, sem enviar nada. O cardápio, os serviços e os horários do robô ficam em `MENU`, `SERVICES` e `PROS`.
- **Painel ao vivo:** simulação com dados fictícios, com pausar e acelerar.
- **Recursos clicáveis:** promoção, cupom, agenda, ordem de serviço e permissões.

Tudo o que é simulação está marcado na página como exemplo ou dado fictício. Quem usa "reduzir movimento" no aparelho vê tudo parado e completo, e as animações pausam quando saem da tela.

## Cuidados

- **Não prometa o que o sistema não faz.** Números, planos e recursos da página precisam bater com o sistema e com os termos de uso. Na dúvida, pergunte antes.
- **Botões "Testar grátis", "Entrar" e dos planos** levam para o painel (`https://painel.balconista.app.br/...`). Esses endereços ficam em `js/site.js`, no `CONFIG`.
- **Termos e privacidade** ficam no painel (`/termos`). O rodapé só aponta para lá.
- **Ferramentas de fora** (Google Analytics, Pixel da Meta, vídeo do YouTube, chat) precisam de duas coisas:
  - liberar o endereço no `netlify.toml`, senão o navegador bloqueia;
  - atualizar a política de privacidade, que hoje diz que não usamos rastreadores de propaganda.
- **Imagens:** use `.webp` ou `.jpg` com até ~300 KB. Página leve carrega rápido no celular e aparece melhor no Google.
- **Acessibilidade:** toda imagem precisa de `alt` descrevendo o que mostra. Mantenha o contraste dos textos.
