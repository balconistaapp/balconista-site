# Página de vendas do Balconista

Este repositório é **só a página de vendas** (balconista.app.br). O sistema (painel das lojas, robô do WhatsApp, cadastro) fica em outro lugar e não é afetado pelo que muda aqui.

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `index.html` | A página inteira: textos, seções, planos, perguntas frequentes e o estilo (CSS no `<style>` do topo) |
| `js/site.js` | Os botões e as animações. No começo ficam os endereços do painel (`PAINEL` e `CONFIG`) |
| `img/` | Imagens da página |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png` | Ícones da aba do navegador e do celular |
| `robots.txt`, `sitemap.xml` | Para o Google achar a página |

## Como uma mudança vai para o ar

1. **Branch e Pull Request:** crie uma branch (ex.: `ajuste-planos`), faça as mudanças e abra um **Pull Request** para a `main`.
2. **Revisão:** o Thaylon revisa. Se precisar de ajuste, ele comenta ou corrige no próprio Pull Request.
3. **Teste:** a versão do Pull Request é publicada na **página de teste**, https://site.179-236-243-185.sslip.io. Ela fica fora do Google, e os botões levam ao **painel de teste**, então dá para clicar em tudo sem criar conta de verdade.
4. **Produção:** aprovado no teste, o Pull Request entra na `main` e a `main` é publicada em **balconista.app.br**.

A `main` é o que está no ar. Ninguém publica direto nela, tudo passa pelo Pull Request.

## Para ver no seu computador

Os endereços começam com `/` (ex.: `/img/painel-vendas.webp`), então abrir o arquivo com dois cliques não mostra as imagens. Rode um servidor simples na pasta:

```
npx serve .
```

Depois abra o endereço que aparecer (normalmente http://localhost:3000). No seu computador, os botões também levam ao painel de teste.

## Cuidados

- **Não prometa o que o sistema não faz.** Números, planos e recursos da página precisam bater com o sistema e com os termos de uso. Na dúvida, pergunte antes.
- **Botões "Testar grátis", "Entrar" e dos planos** levam para o painel. Os endereços ficam em `js/site.js` (`PAINEL` e `CONFIG`).
- **Termos e privacidade** ficam no painel (`/termos`). O rodapé só aponta para lá.
- **Ferramentas de fora** (Google Analytics, Pixel da Meta, vídeo do YouTube, chat) precisam de duas coisas:
  - o servidor precisa liberar o endereço nas regras de segurança da página, senão o navegador bloqueia;
  - a política de privacidade precisa ser atualizada, porque hoje ela diz que não usamos rastreadores de propaganda.

  Avise antes de colocar.
- **Script sempre em `js/site.js`**, nunca dentro do HTML (`<script>...</script>` ou `onclick=`): as regras de segurança bloqueiam script dentro da página.
- **Imagens:** use `.webp` ou `.jpg` com até ~300 KB. Página leve carrega rápido no celular e aparece melhor no Google.
- **Acessibilidade:** toda imagem precisa de `alt` descrevendo o que mostra. Mantenha o contraste dos textos.
