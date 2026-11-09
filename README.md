# CP3 - Site pessoal

Site pessoal desenvolvido como entrega da CP3, com cinco páginas interligadas por um menu de navegação comum.

## Páginas e recursos

- `index.html` — apresentação e interesses salvos.
- `curriculo.html` — formação, experiência e habilidades.
- `formulario.html` — formulário de contato com validação.
- `multimidia.html` — vídeo e áudio locais.
- `graficos.html` — gráficos e ilustrações.
- `css/estilos.css` e `js/scripts.js` — estilos e interações compartilhados.

## Visualização local

Sirva a pasta com um servidor HTTP local (por exemplo, a extensão Live Server do VS Code) e abra `index.html`.
Usar um servidor mantém as páginas na mesma origem para compartilhar as preferências do `localStorage`.

## Publicação no GitHub Pages

No repositório do GitHub, acesse **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`, e salve. O site será publicado no endereço indicado nessa tela.

O tema, os interesses salvos, o nome de boas-vindas e as preferências de contato/newsletter ficam no `localStorage` do navegador. O formulário valida os campos e apresenta feedback; como não há backend, ele não envia mensagens.
