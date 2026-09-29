# Laboratório de Automação de Testes com Selenium

Material didático da disciplina de **Teste de Software** — IFMA Campus Timon.
Prof. Francisco Cristiano da Silva Macêdo.

Dois sites estáticos, sem dependências e sem build:

| Arquivo | Função |
|---|---|
| `index.html` | Portal de entrada, com os dois caminhos |
| `app.html` | **NetecShop** — aplicação-alvo dos testes |
| `newsletter.html` | Documento carregado dentro do iframe da NetecShop |
| `roteiro.html` | **Roteiro guiado** de 15 etapas reveladas por botão |
| `assets/estilo.css` | Folha de estilo compartilhada |
| `assets/app.js` | Lógica da aplicação-alvo |
| `assets/roteiro.js` | Conteúdo e motor das etapas do roteiro |

---

## Publicar no GitHub Pages

1. Crie um repositório **público** chamado `netecshop`.
2. Envie todos os arquivos preservando a pasta `assets/`:

```bash
git init
git add .
git commit -m "Laboratório Selenium - IFMA Timon"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/netecshop.git
git push -u origin main
```

3. No repositório: **Settings → Pages → Build and deployment**.
   Em *Source* escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`. Salve.
4. Após um ou dois minutos os endereços ficam disponíveis:

```
https://SEU-USUARIO.github.io/netecshop/            (portal)
https://SEU-USUARIO.github.io/netecshop/app.html    (aplicação-alvo)
https://SEU-USUARIO.github.io/netecshop/roteiro.html (roteiro)
```

5. **Passe o endereço de `app.html` aos alunos.** Ele substitui o texto
   `SEU-USUARIO` que aparece no `conftest.py` da etapa 7 do roteiro.

Para testar antes de publicar, rode localmente:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

> O `file://` não serve: o iframe da newsletter é bloqueado. Use sempre um servidor HTTP.

---

## Credenciais da aplicação-alvo

| Usuário | Senha | Comportamento |
|---|---|---|
| `aluno` | `ifma2026` | acesso normal |
| `professor` | `ifma2026` | acesso normal |
| `bloqueado` | `ifma2026` | mensagem de conta bloqueada |

Qualquer outra combinação produz "Usuário ou senha inválidos."

## Atrasos propositais

Existem para forçar o uso de esperas explícitas em vez de `time.sleep()`:

| Ação | Atraso |
|---|---|
| Login | 900 ms |
| Busca no catálogo | 600 ms |
| Confirmação do pedido | 1200 ms |
| Selo de promoção (aparece sozinho) | 2500 ms após o login |
| Assinar newsletter (iframe) | 700 ms |

## Recursos exercitados pelo roteiro

- Campos de texto, senha, e-mail e área de texto
- Lista suspensa (`Select`), botões de rádio e caixa de seleção
- Lista dinâmica de produtos, reconstruída no DOM a cada busca (`find_elements`)
- Diálogo nativo `confirm()` (`switch_to.alert`)
- `iframe` (`switch_to.frame` / `switch_to.default_content`)
- Código de pedido aleatório no formato `NS-999999`, para asserção por expressão regular

## Estado da aplicação

Tudo fica em memória. Recarregar a página zera login e carrinho — cada teste começa limpo,
sem necessidade de `localStorage.clear()` ou de rotinas de limpeza entre execuções.

## Ajustes para outras turmas

- **Mais ou menos atraso:** constantes `ATRASO_*` no topo de `assets/app.js`.
- **Outros produtos ou usuários:** arrays `PRODUTOS` e `USUARIOS` em `assets/app.js`.
- **Alterar etapas do roteiro:** array `ETAPAS` em `assets/roteiro.js` — cada item tem
  `titulo`, `objetivo` e `html`. A numeração e a barra de progresso se ajustam sozinhas.

---

Selenium é um projeto de código aberto mantido pelo SeleniumHQ.
Documentação oficial: <https://www.selenium.dev/documentation/>
