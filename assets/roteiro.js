/* Roteiro guiado de automação com Selenium - IFMA Campus Timon
   As etapas são reveladas uma a uma. O progresso fica em localStorage. */

(function () {
  'use strict';

  var CHAVE = 'netecshop-roteiro-progresso';

  function escapar(txt) {
    return txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function bloco(codigo) {
    return '<div class="bloco-codigo">' +
           '<button class="btn-copiar" type="button">copiar</button>' +
           '<pre><code>' + escapar(codigo.trim()) + '</code></pre></div>';
  }

  /* =========================================================
     ETAPAS
     ========================================================= */

  var ETAPAS = [

  /* ---------- 1 ---------- */
  {
    titulo: 'Preparar o ambiente',
    objetivo: 'Deixar a máquina pronta antes de escrever qualquer teste.',
    html:
      '<ol>' +
      '<li>Confirme que o <strong>Python 3.12 ou superior</strong> está instalado.</li>' +
      '<li>Confirme que o <strong>Firefox</strong> está instalado e atualizado. Usaremos o Firefox porque a extensão Selenium IDE não está mais disponível para o Chrome.</li>' +
      '<li>Crie uma pasta para o projeto e, dentro dela, um ambiente virtual.</li>' +
      '<li>Instale as bibliotecas.</li>' +
      '<li>Confira a versão instalada.</li>' +
      '</ol>' +
      bloco(
'mkdir testes-netecshop\n' +
'cd testes-netecshop\n' +
'python3 -m venv .venv\n' +
'source .venv/bin/activate        # Windows: .venv\\Scripts\\activate\n' +
'pip install selenium pytest\n' +
'python -c "import selenium; print(selenium.__version__)"') +
      '<div class="dica"><strong>Você não precisa baixar o geckodriver.</strong> Desde a versão 4.6 o ' +
      '<em>Selenium Manager</em> localiza e baixa o driver correto automaticamente na primeira execução.</div>' +
      '<div class="atencao"><strong>Se a rede do campus bloquear o download</strong>, avise o professor: ' +
      'existe uma cópia do geckodriver para colocar manualmente no PATH.</div>'
  },

  /* ---------- 2 ---------- */
  {
    titulo: 'Conhecer a aplicação-alvo manualmente',
    objetivo: 'Antes de automatizar, é preciso entender o comportamento do sistema.',
    html:
      '<p>Abra a <a href="app.html" target="_blank" rel="noopener">aplicação NetecShop</a> em outra aba e percorra o fluxo completo <strong>à mão</strong>.</p>' +
      '<p><strong>Credenciais:</strong></p>' +
      '<ul>' +
      '<li><code class="inline">aluno</code> / <code class="inline">ifma2026</code> &mdash; acesso normal</li>' +
      '<li><code class="inline">professor</code> / <code class="inline">ifma2026</code> &mdash; acesso normal</li>' +
      '<li><code class="inline">bloqueado</code> / <code class="inline">ifma2026</code> &mdash; conta bloqueada</li>' +
      '</ul>' +
      '<p><strong>Checklist de observação</strong> &mdash; anote as respostas no seu caderno:</p>' +
      '<ol>' +
      '<li>Quanto tempo, aproximadamente, a tela demora para responder depois de clicar em <em>Entrar</em>?</li>' +
      '<li>O que acontece ao digitar uma senha errada? E com o usuário <code class="inline">bloqueado</code>?</li>' +
      '<li>Faça uma busca por "mouse". A lista muda instantaneamente?</li>' +
      '<li>Adicione 2 produtos e clique em <em>Esvaziar carrinho</em>. Que tipo de janela aparece?</li>' +
      '<li>Tente confirmar o pedido sem marcar o aceite dos termos. Qual é a mensagem?</li>' +
      '<li>Espere alguns segundos na tela do catálogo. O que surge sozinho no topo?</li>' +
      '</ol>' +
      '<div class="dica">Esses atrasos são <strong>propositais</strong>. Eles existem para que você aprenda a diferença entre ' +
      'um teste que espera direito e um teste instável (<em>flaky</em>).</div>'
  },

  /* ---------- 3 ---------- */
  {
    titulo: 'Mapa de seletores da aplicação',
    objetivo: 'Ter a referência dos identificadores estáveis sempre à mão.',
    html:
      '<p>Todos os elementos importantes possuem <code class="inline">id</code> fixo. ' +
      'Use esta tabela como referência durante todo o roteiro &mdash; volte aqui sempre que precisar.</p>' +
      '<h3>Tela de login</h3>' +
      '<table><tbody>' +
      '<tr><td><code class="inline">#usuario</code></td><td>campo de usuário</td></tr>' +
      '<tr><td><code class="inline">#senha</code></td><td>campo de senha</td></tr>' +
      '<tr><td><code class="inline">#btn-entrar</code></td><td>botão Entrar</td></tr>' +
      '<tr><td><code class="inline">#carregando</code></td><td>indicador exibido durante a verificação</td></tr>' +
      '<tr><td><code class="inline">#msg-erro</code></td><td>mensagem de erro do login</td></tr>' +
      '</tbody></table>' +
      '<h3>Catálogo</h3>' +
      '<table><tbody>' +
      '<tr><td><code class="inline">#ola-usuario</code></td><td>saudação, ex.: "Olá, aluno"</td></tr>' +
      '<tr><td><code class="inline">#campo-busca</code> / <code class="inline">#btn-buscar</code></td><td>busca de produtos</td></tr>' +
      '<tr><td><code class="inline">.produto</code></td><td>cartão de produto (classe, vários elementos)</td></tr>' +
      '<tr><td><code class="inline">.produto-nome</code> / <code class="inline">.produto-preco</code></td><td>dados do cartão</td></tr>' +
      '<tr><td><code class="inline">#add-TEC-001</code></td><td>botão adicionar (o id termina com o SKU)</td></tr>' +
      '<tr><td><code class="inline">#contador-carrinho</code></td><td>quantidade de itens no carrinho</td></tr>' +
      '<tr><td><code class="inline">#msg-vazio</code></td><td>"Nenhum produto encontrado."</td></tr>' +
      '<tr><td><code class="inline">#selo-promocao</code></td><td>aparece sozinho após alguns segundos</td></tr>' +
      '<tr><td><code class="inline">#frame-newsletter</code></td><td>iframe da newsletter</td></tr>' +
      '<tr><td><code class="inline">#btn-ir-carrinho</code> / <code class="inline">#btn-sair</code></td><td>navegação</td></tr>' +
      '</tbody></table>' +
      '<h3>Carrinho</h3>' +
      '<table><tbody>' +
      '<tr><td><code class="inline">tr.item-carrinho</code></td><td>linha de item</td></tr>' +
      '<tr><td><code class="inline">.item-sku</code> / <code class="inline">.item-nome</code> / <code class="inline">.item-qtd</code> / <code class="inline">.item-preco</code></td><td>células</td></tr>' +
      '<tr><td><code class="inline">#total-carrinho</code></td><td>valor total</td></tr>' +
      '<tr><td><code class="inline">#btn-limpar</code></td><td>esvaziar (abre diálogo nativo)</td></tr>' +
      '<tr><td><code class="inline">#btn-finalizar</code></td><td>ir para o checkout</td></tr>' +
      '</tbody></table>' +
      '<h3>Checkout e confirmação</h3>' +
      '<table><tbody>' +
      '<tr><td><code class="inline">#nome-completo</code>, <code class="inline">#email</code>, <code class="inline">#cep</code></td><td>campos de texto</td></tr>' +
      '<tr><td><code class="inline">#uf</code></td><td>lista suspensa (elemento select)</td></tr>' +
      '<tr><td><code class="inline">#entrega-padrao</code> / <code class="inline">#entrega-expressa</code></td><td>botões de rádio</td></tr>' +
      '<tr><td><code class="inline">#aceite</code></td><td>caixa de seleção dos termos</td></tr>' +
      '<tr><td><code class="inline">#observacoes</code></td><td>área de texto</td></tr>' +
      '<tr><td><code class="inline">#btn-confirmar</code></td><td>confirmar pedido</td></tr>' +
      '<tr><td><code class="inline">#msg-erro-checkout</code></td><td>erro de validação</td></tr>' +
      '<tr><td><code class="inline">#codigo-pedido</code></td><td>código no formato NS-999999</td></tr>' +
      '</tbody></table>' +
      '<div class="dica">Guarde esta regra: <strong>prefira sempre o id</strong>. Só use CSS quando precisar de vários ' +
      'elementos de uma vez, e evite XPath absoluto (aquele gerado automaticamente, cheio de <code class="inline">div[2]/div[3]</code>).</div>'
  },

  /* ---------- 4 ---------- */
  {
    titulo: 'Instalar o Selenium IDE e gravar o login',
    objetivo: 'Conhecer a ferramenta de gravação e reprodução do ecossistema Selenium.',
    html:
      '<ol>' +
      '<li>No <strong>Firefox</strong>, abra a loja de complementos e instale a extensão <strong>Selenium IDE</strong>.</li>' +
      '<li>Abra a extensão e escolha <em>Record a new test in a new project</em>.</li>' +
      '<li>Nome do projeto: <code class="inline">netecshop</code>. Nome do teste: <code class="inline">login_valido</code>.</li>' +
      '<li>Informe a URL base da aplicação (peça ao professor o endereço publicado no GitHub Pages).</li>' +
      '<li>Com a gravação ligada, faça <strong>exatamente</strong> esta sequência: digitar <code class="inline">aluno</code>, digitar <code class="inline">ifma2026</code>, clicar em <em>Entrar</em>, esperar o catálogo carregar.</li>' +
      '<li>Pare a gravação e clique em <em>Run current test</em>. Ele deve passar.</li>' +
      '</ol>' +
      '<div class="atencao"><strong>Não tente instalar no Chrome.</strong> A extensão foi descontinuada na Chrome Web Store ' +
      'por causa do fim do Manifest V2 e exibe a mensagem "This extension is no longer available". Isso é, por si só, ' +
      'uma lição sobre dependência de ferramentas em um pipeline de testes.</div>' +
      '<p><strong>Observe na lista de comandos gravados:</strong> que tipo de seletor o IDE escolheu sozinho? ' +
      'Ele usou <code class="inline">id</code>, <code class="inline">css</code> ou <code class="inline">xpath</code>? Anote.</p>'
  },

  /* ---------- 5 ---------- */
  {
    titulo: 'Adicionar uma asserção e exportar para Python',
    objetivo: 'Transformar uma gravação em código de teste de verdade.',
    html:
      '<ol>' +
      '<li>No Selenium IDE, clique com o botão direito na última linha e adicione um novo comando.</li>' +
      '<li>Comando: <code class="inline">assert text</code> &nbsp;|&nbsp; Alvo: <code class="inline">id=ola-usuario</code> &nbsp;|&nbsp; Valor: <code class="inline">Olá, aluno</code>.</li>' +
      '<li>Execute novamente para confirmar que a asserção passa.</li>' +
      '<li>Salve o projeto como <code class="inline">netecshop.side</code> dentro da pasta do seu trabalho. <strong>Este arquivo faz parte da entrega.</strong></li>' +
      '<li>Clique com o botão direito no nome do teste, escolha <em>Export</em> e selecione <strong>Python pytest</strong>.</li>' +
      '<li>Salve o arquivo exportado como <code class="inline">test_gravado.py</code>.</li>' +
      '</ol>' +
      '<div class="dica">Um teste que apenas navega e não verifica nada <strong>não é um teste</strong> &mdash; é um passeio. ' +
      'A asserção é o que transforma automação em verificação.</div>'
  },

  /* ---------- 6 ---------- */
  {
    titulo: 'Executar o código exportado e criticá-lo',
    objetivo: 'Ver que o código gerado funciona, mas não é código que se mantém.',
    html:
      '<p>Rode o arquivo exportado:</p>' +
      bloco('pytest test_gravado.py -v') +
      '<p>Agora abra o arquivo e responda por escrito (vai para o README da entrega):</p>' +
      '<ol>' +
      '<li>Há chamadas de <code class="inline">time.sleep()</code> ou esperas fixas no código?</li>' +
      '<li>Os seletores são legíveis ou são XPaths longos e frágeis?</li>' +
      '<li>Se um desenvolvedor mudar a posição de uma div na página, esse teste quebra?</li>' +
      '<li>Dá para reaproveitar o login em outros testes, ou ele está duplicado?</li>' +
      '</ol>' +
      '<div class="atencao"><strong>Conclusão da etapa:</strong> a gravação serve para descobrir o fluxo e os seletores rapidamente. ' +
      'A partir daqui, vamos reescrever tudo à mão &mdash; e esse é o trabalho real de quem automatiza testes.</div>'
  },

  /* ---------- 7 ---------- */
  {
    titulo: 'Montar o projeto de testes do zero',
    objetivo: 'Criar a estrutura com pytest e uma fixture de navegador reutilizável.',
    html:
      '<p>Crie o arquivo <code class="inline">conftest.py</code>. Ele guarda a configuração compartilhada por todos os testes:</p>' +
      bloco(
'# conftest.py\n' +
'import os\n' +
'import pytest\n' +
'from selenium import webdriver\n' +
'\n' +
'URL = "https://cristianomacedo19.github.io/netecshop/app.html"\n' +
'\n' +
'\n' +
'@pytest.fixture\n' +
'def navegador():\n' +
'    opcoes = webdriver.FirefoxOptions()\n' +
'    if os.getenv("HEADLESS") == "1":\n' +
'        opcoes.add_argument("-headless")\n' +
'\n' +
'    driver = webdriver.Firefox(options=opcoes)\n' +
'    driver.set_window_size(1280, 900)\n' +
'    driver.get(URL)\n' +
'\n' +
'    yield driver          # o teste roda aqui\n' +
'\n' +
'    driver.quit()         # sempre executado, mesmo se o teste falhar') +
      '<div class="dica">O endereço da aplicação já vem preenchido. Se o professor indicar outro, altere apenas a linha <code class="inline">URL = ...</code>.</div>' +
      '<p>Agora um primeiro teste, só para validar a estrutura. Crie <code class="inline">test_login.py</code>:</p>' +
      bloco(
'# test_login.py\n' +
'def test_pagina_abre(navegador):\n' +
'    assert "NetecShop" in navegador.title') +
      bloco('pytest -v') +
      '<div class="dica">A fixture garante que <strong>cada teste começa com um navegador limpo</strong> e que ele é fechado no fim. ' +
      'Testes que dependem do estado deixado por outro teste são a segunda maior fonte de instabilidade em suítes reais.</div>'
  },

  /* ---------- 8 ---------- */
  {
    titulo: 'Login com espera explícita',
    objetivo: 'Substituir tempo fixo por espera por condição - o conceito central da aula.',
    html:
      '<p>Lembre-se: a aplicação demora cerca de 900 ms para responder ao login. Acrescente ao <code class="inline">test_login.py</code>:</p>' +
      bloco(
'# test_login.py\n' +
'from selenium.webdriver.common.by import By\n' +
'from selenium.webdriver.support.ui import WebDriverWait\n' +
'from selenium.webdriver.support import expected_conditions as EC\n' +
'\n' +
'\n' +
'def fazer_login(driver, usuario="aluno", senha="ifma2026"):\n' +
'    driver.find_element(By.ID, "usuario").send_keys(usuario)\n' +
'    driver.find_element(By.ID, "senha").send_keys(senha)\n' +
'    driver.find_element(By.ID, "btn-entrar").click()\n' +
'\n' +
'\n' +
'def test_login_valido(navegador):\n' +
'    fazer_login(navegador)\n' +
'\n' +
'    espera = WebDriverWait(navegador, 10)\n' +
'    saudacao = espera.until(\n' +
'        EC.visibility_of_element_located((By.ID, "ola-usuario"))\n' +
'    )\n' +
'\n' +
'    assert saudacao.text == "Olá, aluno"') +
      '<p><strong>Experimento obrigatório.</strong> Comente as três linhas do <code class="inline">WebDriverWait</code> e ' +
      'troque por uma busca direta do elemento. Rode o teste. O que acontece? Anote o nome da exceção.</p>' +
      '<div class="dica"><strong>Por que não usar <code class="inline">time.sleep(3)</code>?</strong> Porque em uma máquina rápida ' +
      'você desperdiça 3 segundos por teste, e em uma máquina lenta 3 segundos não bastam. A espera explícita ' +
      'devolve o controle assim que a condição é satisfeita, e falha com mensagem clara se não for.</div>' +
      '<p><strong>Desafio:</strong> escreva <code class="inline">test_selo_promocional</code> verificando que ' +
      '<code class="inline">#selo-promocao</code> fica visível. Ele só aparece cerca de 2,5 s depois do login &mdash; ' +
      'sem espera explícita esse teste é impossível de escrever de forma confiável.</p>'
  },

  /* ---------- 9 ---------- */
  {
    titulo: 'Casos negativos',
    objetivo: 'Testar o que o sistema deve recusar, não apenas o caminho feliz.',
    html:
      '<p>Acrescente ao <code class="inline">test_login.py</code>:</p>' +
      bloco(
'def test_login_senha_invalida(navegador):\n' +
'    fazer_login(navegador, "aluno", "senha-errada")\n' +
'\n' +
'    msg = WebDriverWait(navegador, 10).until(\n' +
'        EC.visibility_of_element_located((By.ID, "msg-erro"))\n' +
'    )\n' +
'\n' +
'    assert "inválidos" in msg.text\n' +
'    assert not navegador.find_element(By.ID, "tela-catalogo").is_displayed()\n' +
'\n' +
'\n' +
'def test_conta_bloqueada(navegador):\n' +
'    fazer_login(navegador, "bloqueado", "ifma2026")\n' +
'\n' +
'    msg = WebDriverWait(navegador, 10).until(\n' +
'        EC.visibility_of_element_located((By.ID, "msg-erro"))\n' +
'    )\n' +
'\n' +
'    assert "bloqueada" in msg.text.lower()') +
      '<div class="dica">Repare na segunda asserção do primeiro teste: além de verificar a mensagem, ela garante que o ' +
      'usuário <strong>não entrou</strong>. Verificar a mensagem sozinha não provaria isso &mdash; um sistema pode exibir ' +
      'o erro e liberar o acesso mesmo assim. Essa é uma falha de segurança real, e o teste a detectaria.</div>' +
      '<p>Rode a suíte inteira: <code class="inline">pytest -v</code>. Três testes devem passar.</p>'
  },

  /* ---------- 10 ---------- */
  {
    titulo: 'Busca dinâmica e coleções de elementos',
    objetivo: 'Trabalhar com find_elements, listas e condições personalizadas.',
    html:
      '<p>Crie <code class="inline">test_catalogo.py</code>:</p>' +
      bloco(
'# test_catalogo.py\n' +
'from selenium.webdriver.common.by import By\n' +
'from selenium.webdriver.support.ui import WebDriverWait\n' +
'from selenium.webdriver.support import expected_conditions as EC\n' +
'\n' +
'from test_login import fazer_login\n' +
'\n' +
'\n' +
'def entrar_no_catalogo(driver):\n' +
'    fazer_login(driver)\n' +
'    WebDriverWait(driver, 10).until(\n' +
'        EC.visibility_of_element_located((By.ID, "campo-busca"))\n' +
'    )\n' +
'\n' +
'\n' +
'def test_catalogo_lista_seis_produtos(navegador):\n' +
'    entrar_no_catalogo(navegador)\n' +
'    produtos = navegador.find_elements(By.CSS_SELECTOR, ".produto")\n' +
'    assert len(produtos) == 6\n' +
'\n' +
'\n' +
'def test_busca_filtra_resultados(navegador):\n' +
'    entrar_no_catalogo(navegador)\n' +
'\n' +
'    navegador.find_element(By.ID, "campo-busca").send_keys("mouse")\n' +
'    navegador.find_element(By.ID, "btn-buscar").click()\n' +
'\n' +
'    # condição personalizada: espera a lista ter exatamente 1 item\n' +
'    WebDriverWait(navegador, 10).until(\n' +
'        lambda d: len(d.find_elements(By.CSS_SELECTOR, ".produto")) == 1\n' +
'    )\n' +
'\n' +
'    nome = navegador.find_element(By.CSS_SELECTOR, ".produto .produto-nome").text\n' +
'    assert "Mouse" in nome\n' +
'\n' +
'\n' +
'def test_busca_sem_resultado(navegador):\n' +
'    entrar_no_catalogo(navegador)\n' +
'\n' +
'    navegador.find_element(By.ID, "campo-busca").send_keys("impressora")\n' +
'    navegador.find_element(By.ID, "btn-buscar").click()\n' +
'\n' +
'    aviso = WebDriverWait(navegador, 10).until(\n' +
'        EC.visibility_of_element_located((By.ID, "msg-vazio"))\n' +
'    )\n' +
'\n' +
'    assert "Nenhum produto" in aviso.text\n' +
'    assert navegador.find_elements(By.CSS_SELECTOR, ".produto") == []') +
      '<div class="dica"><code class="inline">find_element</code> lança exceção quando não acha; ' +
      '<code class="inline">find_elements</code> (no plural) devolve lista vazia. Por isso a última asserção pode ' +
      'comparar com <code class="inline">[]</code> sem quebrar o teste.</div>'
  },

  /* ---------- 11 ---------- */
  {
    titulo: 'Carrinho e diálogo nativo do navegador',
    objetivo: 'Manipular alert/confirm, que não fazem parte do DOM.',
    html:
      '<p>Crie <code class="inline">test_carrinho.py</code>:</p>' +
      bloco(
'# test_carrinho.py\n' +
'from selenium.webdriver.common.by import By\n' +
'from selenium.webdriver.support.ui import WebDriverWait\n' +
'from selenium.webdriver.support import expected_conditions as EC\n' +
'\n' +
'from test_catalogo import entrar_no_catalogo\n' +
'\n' +
'\n' +
'def test_adicionar_itens_ao_carrinho(navegador):\n' +
'    entrar_no_catalogo(navegador)\n' +
'    espera = WebDriverWait(navegador, 10)\n' +
'\n' +
'    navegador.find_element(By.ID, "add-TEC-001").click()\n' +
'    navegador.find_element(By.ID, "add-SSD-004").click()\n' +
'\n' +
'    espera.until(\n' +
'        EC.text_to_be_present_in_element((By.ID, "contador-carrinho"), "2")\n' +
'    )\n' +
'\n' +
'    navegador.find_element(By.ID, "btn-ir-carrinho").click()\n' +
'\n' +
'    linhas = navegador.find_elements(By.CSS_SELECTOR, "tr.item-carrinho")\n' +
'    assert len(linhas) == 2\n' +
'\n' +
'    skus = [linha.find_element(By.CSS_SELECTOR, ".item-sku").text for linha in linhas]\n' +
'    assert "TEC-001" in skus\n' +
'    assert "SSD-004" in skus\n' +
'\n' +
'\n' +
'def test_esvaziar_carrinho_aceitando_dialogo(navegador):\n' +
'    entrar_no_catalogo(navegador)\n' +
'    espera = WebDriverWait(navegador, 10)\n' +
'\n' +
'    navegador.find_element(By.ID, "add-MOU-002").click()\n' +
'    navegador.find_element(By.ID, "btn-ir-carrinho").click()\n' +
'    navegador.find_element(By.ID, "btn-limpar").click()\n' +
'\n' +
'    alerta = espera.until(EC.alert_is_present())\n' +
'    assert "remover todos" in alerta.text.lower()\n' +
'    alerta.accept()\n' +
'\n' +
'    espera.until(\n' +
'        EC.text_to_be_present_in_element((By.ID, "contador-carrinho"), "0")\n' +
'    )\n' +
'    assert navegador.find_elements(By.CSS_SELECTOR, "tr.item-carrinho") == []') +
      '<p><strong>Desafio:</strong> escreva a versão com <code class="inline">alerta.dismiss()</code> ' +
      '(usuário cancela) e verifique que o item <strong>continua</strong> no carrinho.</p>' +
      '<div class="dica">Diálogos nativos não existem no DOM: nenhum seletor os encontra. Eles são tratados por um canal ' +
      'separado do protocolo WebDriver, via <code class="inline">switch_to.alert</code>. Se você ignorar um diálogo aberto, ' +
      'o próximo comando falha com <code class="inline">UnexpectedAlertPresentException</code>.</div>'
  },

  /* ---------- 12 ---------- */
  {
    titulo: 'Checkout: select, rádio, caixa de seleção e validação',
    objetivo: 'Dominar os controles de formulário e o fluxo completo de ponta a ponta.',
    html:
      '<p>Crie <code class="inline">test_checkout.py</code>:</p>' +
      bloco(
'# test_checkout.py\n' +
'import re\n' +
'\n' +
'from selenium.webdriver.common.by import By\n' +
'from selenium.webdriver.support.ui import WebDriverWait, Select\n' +
'from selenium.webdriver.support import expected_conditions as EC\n' +
'\n' +
'from test_catalogo import entrar_no_catalogo\n' +
'\n' +
'\n' +
'def ir_para_checkout(driver):\n' +
'    entrar_no_catalogo(driver)\n' +
'    driver.find_element(By.ID, "add-MON-003").click()\n' +
'    driver.find_element(By.ID, "btn-ir-carrinho").click()\n' +
'    driver.find_element(By.ID, "btn-finalizar").click()\n' +
'    WebDriverWait(driver, 10).until(\n' +
'        EC.visibility_of_element_located((By.ID, "nome-completo"))\n' +
'    )\n' +
'\n' +
'\n' +
'def preencher_dados(driver):\n' +
'    driver.find_element(By.ID, "nome-completo").send_keys("Maria Souza")\n' +
'    driver.find_element(By.ID, "email").send_keys("maria@acad.ifma.edu.br")\n' +
'    driver.find_element(By.ID, "cep").send_keys("65630-000")\n' +
'    Select(driver.find_element(By.ID, "uf")).select_by_value("MA")\n' +
'    driver.find_element(By.ID, "entrega-expressa").click()\n' +
'    driver.find_element(By.ID, "observacoes").send_keys("Entregar no turno da tarde.")\n' +
'\n' +
'\n' +
'def test_checkout_exige_aceite_dos_termos(navegador):\n' +
'    ir_para_checkout(navegador)\n' +
'    preencher_dados(navegador)\n' +
'\n' +
'    # aceite NAO marcado de proposito\n' +
'    navegador.find_element(By.ID, "btn-confirmar").click()\n' +
'\n' +
'    msg = WebDriverWait(navegador, 10).until(\n' +
'        EC.visibility_of_element_located((By.ID, "msg-erro-checkout"))\n' +
'    )\n' +
'    assert "termos" in msg.text.lower()\n' +
'\n' +
'\n' +
'def test_pedido_confirmado_com_sucesso(navegador):\n' +
'    ir_para_checkout(navegador)\n' +
'    preencher_dados(navegador)\n' +
'\n' +
'    navegador.find_element(By.ID, "aceite").click()\n' +
'    navegador.find_element(By.ID, "btn-confirmar").click()\n' +
'\n' +
'    codigo = WebDriverWait(navegador, 15).until(\n' +
'        EC.visibility_of_element_located((By.ID, "codigo-pedido"))\n' +
'    ).text\n' +
'\n' +
'    assert re.fullmatch(r"NS-\\d{6}", codigo), "formato inesperado: " + codigo\n' +
'\n' +
'    entrega = navegador.find_element(By.ID, "resumo-entrega").text\n' +
'    assert "Expressa" in entrega\n' +
'\n' +
'    # o carrinho deve ser zerado apos a compra\n' +
'    assert navegador.find_element(By.ID, "contador-carrinho").text == "0"') +
      '<div class="dica">O código do pedido é <strong>gerado aleatoriamente</strong>. Por isso a asserção usa expressão ' +
      'regular para validar o <em>formato</em>, não o valor. Testar valor exato de dado dinâmico é um erro clássico ' +
      'que produz suítes que falham sem motivo.</div>' +
      '<p><strong>Desafio:</strong> use <code class="inline">Select(...).first_selected_option.text</code> para verificar ' +
      'que a UF selecionada é "Maranhão", e <code class="inline">.is_selected()</code> para conferir o rádio marcado.</p>'
  },

  /* ---------- 13 ---------- */
  {
    titulo: 'Trabalhando dentro de um iframe',
    objetivo: 'Entender contexto de navegação: o Selenium só enxerga um documento por vez.',
    html:
      '<p>No rodapé do catálogo existe um formulário de newsletter dentro de um <code class="inline">iframe</code>. ' +
      'Acrescente ao <code class="inline">test_catalogo.py</code>:</p>' +
      bloco(
'def test_assinar_newsletter_dentro_do_iframe(navegador):\n' +
'    entrar_no_catalogo(navegador)\n' +
'    espera = WebDriverWait(navegador, 10)\n' +
'\n' +
'    # 1) entrar no contexto do iframe\n' +
'    espera.until(\n' +
'        EC.frame_to_be_available_and_switch_to_it((By.ID, "frame-newsletter"))\n' +
'    )\n' +
'\n' +
'    # 2) agora os seletores valem para o documento interno\n' +
'    navegador.find_element(By.ID, "email-news").send_keys("aluno@acad.ifma.edu.br")\n' +
'    navegador.find_element(By.ID, "btn-assinar").click()\n' +
'\n' +
'    msg = espera.until(\n' +
'        EC.visibility_of_element_located((By.ID, "msg-news"))\n' +
'    )\n' +
'    assert "inscrito" in msg.text.lower()\n' +
'\n' +
'    # 3) voltar ao documento principal\n' +
'    navegador.switch_to.default_content()\n' +
'    assert navegador.find_element(By.ID, "contador-carrinho").is_displayed()') +
      '<p><strong>Experimento:</strong> remova a linha do passo 1 e rode. Qual exceção aparece? Por quê, se o elemento ' +
      'está visivelmente ali na tela?</p>' +
      '<div class="dica">Esquecer o <code class="inline">switch_to.default_content()</code> no fim é uma das causas mais ' +
      'comuns de testes que passam isolados e falham em sequência: o próximo comando continua preso dentro do iframe.</div>'
  },

  /* ---------- 14 ---------- */
  {
    titulo: 'Refatorar com Page Object Model',
    objetivo: 'Separar "o que o teste verifica" de "onde os elementos estão".',
    html:
      '<p>Crie a pasta <code class="inline">paginas/</code> e o arquivo <code class="inline">paginas/pagina_login.py</code>:</p>' +
      bloco(
'# paginas/pagina_login.py\n' +
'from selenium.webdriver.common.by import By\n' +
'from selenium.webdriver.support.ui import WebDriverWait\n' +
'from selenium.webdriver.support import expected_conditions as EC\n' +
'\n' +
'\n' +
'class PaginaLogin:\n' +
'    CAMPO_USUARIO = (By.ID, "usuario")\n' +
'    CAMPO_SENHA = (By.ID, "senha")\n' +
'    BOTAO_ENTRAR = (By.ID, "btn-entrar")\n' +
'    MENSAGEM_ERRO = (By.ID, "msg-erro")\n' +
'    SAUDACAO = (By.ID, "ola-usuario")\n' +
'\n' +
'    def __init__(self, driver, tempo=10):\n' +
'        self.driver = driver\n' +
'        self.espera = WebDriverWait(driver, tempo)\n' +
'\n' +
'    def entrar(self, usuario, senha):\n' +
'        self.driver.find_element(*self.CAMPO_USUARIO).send_keys(usuario)\n' +
'        self.driver.find_element(*self.CAMPO_SENHA).send_keys(senha)\n' +
'        self.driver.find_element(*self.BOTAO_ENTRAR).click()\n' +
'        return self\n' +
'\n' +
'    def saudacao(self):\n' +
'        return self.espera.until(\n' +
'            EC.visibility_of_element_located(self.SAUDACAO)\n' +
'        ).text\n' +
'\n' +
'    def mensagem_de_erro(self):\n' +
'        return self.espera.until(\n' +
'            EC.visibility_of_element_located(self.MENSAGEM_ERRO)\n' +
'        ).text') +
      '<p>O teste fica assim &mdash; sem um único seletor à vista:</p>' +
      bloco(
'# test_login_pom.py\n' +
'from paginas.pagina_login import PaginaLogin\n' +
'\n' +
'\n' +
'def test_login_valido(navegador):\n' +
'    pagina = PaginaLogin(navegador)\n' +
'    pagina.entrar("aluno", "ifma2026")\n' +
'    assert pagina.saudacao() == "Olá, aluno"\n' +
'\n' +
'\n' +
'def test_login_invalido(navegador):\n' +
'    pagina = PaginaLogin(navegador)\n' +
'    pagina.entrar("aluno", "errada")\n' +
'    assert "inválidos" in pagina.mensagem_de_erro()') +
      '<p><strong>Sua tarefa:</strong> crie também <code class="inline">PaginaCatalogo</code> e ' +
      '<code class="inline">PaginaCheckout</code>, e reescreva pelo menos dois dos testes anteriores usando essas classes.</p>' +
      '<div class="dica">O ganho aparece na manutenção: se o desenvolvedor renomear o id ' +
      '<code class="inline">btn-entrar</code>, você corrige <strong>uma linha</strong> na classe, e não vinte arquivos de teste.</div>'
  },

  /* ---------- 15 ---------- */
  {
    titulo: 'Execução headless, suíte completa e entrega',
    objetivo: 'Rodar tudo como rodaria em um servidor de integração contínua e fechar o trabalho.',
    html:
      '<p>A fixture do passo 7 já prevê o modo sem interface gráfica. Rode a suíte inteira das duas formas:</p>' +
      bloco(
'pytest -v                        # com janela visível\n' +
'HEADLESS=1 pytest -v             # sem interface (Windows: set HEADLESS=1)\n' +
'\n' +
'pytest -k login -v               # apenas os testes de login\n' +
'pytest --maxfail=1 -q            # para no primeiro erro') +
      '<p>Rode a suíte <strong>três vezes seguidas</strong>. Todos os testes passaram nas três? ' +
      'Se algum falhou de forma intermitente, você encontrou um teste instável &mdash; corrija a espera antes de entregar.</p>' +
      '<h3>Checklist de entrega</h3>' +
      '<ul>' +
      '<li><code class="inline">netecshop.side</code> &mdash; gravação do Selenium IDE</li>' +
      '<li><code class="inline">conftest.py</code> com a fixture do navegador</li>' +
      '<li>Arquivos de teste cobrindo: login válido, login inválido, conta bloqueada, busca, carrinho, diálogo nativo, checkout completo e iframe</li>' +
      '<li>Pasta <code class="inline">paginas/</code> com pelo menos duas classes de Page Object</li>' +
      '<li><code class="inline">README.md</code> de meia página</li>' +
      '<li>Captura de tela da suíte completa passando</li>' +
      '</ul>' +
      '<h3>O que o README deve responder</h3>' +
      '<ol>' +
      '<li>Como executar seus testes (comandos exatos).</li>' +
      '<li>Por que você escolheu cada tipo de seletor.</li>' +
      '<li>Onde havia risco de teste instável e como você resolveu.</li>' +
      '<li>As críticas ao código exportado pelo Selenium IDE (etapa 6).</li>' +
      '<li>Qual teste foi o mais difícil e por quê.</li>' +
      '</ol>' +
      '<h3>Critérios de avaliação</h3>' +
      '<table><thead><tr><th>Critério</th><th class="num">Pontos</th></tr></thead><tbody>' +
      '<tr><td>Suíte executa do início ao fim sem erro</td><td class="num">25</td></tr>' +
      '<tr><td>Uso correto de esperas explícitas (nenhum sleep fixo)</td><td class="num">25</td></tr>' +
      '<tr><td>Qualidade e estabilidade dos seletores</td><td class="num">20</td></tr>' +
      '<tr><td>Page Object Model aplicado corretamente</td><td class="num">15</td></tr>' +
      '<tr><td>README e justificativas técnicas</td><td class="num">15</td></tr>' +
      '</tbody></table>'
  }

  ];

  /* =========================================================
     MOTOR DO ROTEIRO
     ========================================================= */

  var container = document.getElementById('etapas');
  var barra = document.getElementById('progresso-preenchido');
  var textoProgresso = document.getElementById('progresso-texto');
  var msgFinal = document.getElementById('msg-final');

  var reveladas = carregarProgresso();

  function carregarProgresso() {
    try {
      var valor = window.localStorage.getItem(CHAVE);
      var numero = parseInt(valor, 10);
      if (!isNaN(numero) && numero >= 1 && numero <= ETAPAS.length) { return numero; }
    } catch (e) { /* localStorage indisponível: segue sem salvar */ }
    return 1;
  }

  function salvarProgresso(n) {
    try { window.localStorage.setItem(CHAVE, String(n)); } catch (e) { /* ignora */ }
  }

  function atualizarProgresso() {
    var pct = Math.round((reveladas / ETAPAS.length) * 100);
    barra.style.width = pct + '%';
    if (reveladas >= ETAPAS.length) {
      textoProgresso.textContent = 'Etapa ' + ETAPAS.length + ' de ' + ETAPAS.length + ' - todas liberadas';
    } else {
      textoProgresso.textContent = 'Etapa ' + reveladas + ' de ' + ETAPAS.length;
    }
  }

  function montarEtapa(indice) {
    var dados = ETAPAS[indice];
    var artigo = document.createElement('section');
    artigo.className = 'etapa';
    artigo.id = 'etapa-' + (indice + 1);

    var rodapeEtapa = '';
    if (indice + 1 < ETAPAS.length) {
      rodapeEtapa = '<div class="acoes"><button class="btn-concluir" type="button" data-indice="' + indice + '">' +
                    'Concluí esta etapa &mdash; mostrar a próxima</button></div>';
    } else {
      rodapeEtapa = '<div class="acoes"><button class="btn-concluir" type="button" data-indice="' + indice + '">' +
                    'Concluí o roteiro</button></div>';
    }

    artigo.innerHTML =
      '<span class="etapa-num">Etapa ' + (indice + 1) + ' de ' + ETAPAS.length + '</span>' +
      '<h3>' + dados.titulo + '</h3>' +
      '<p class="objetivo">' + dados.objetivo + '</p>' +
      dados.html +
      rodapeEtapa;

    container.appendChild(artigo);
  }

  function renderizar() {
    container.innerHTML = '';
    for (var i = 0; i < reveladas; i++) { montarEtapa(i); }

    // marca como concluídas todas menos a última revelada
    var secoes = container.querySelectorAll('.etapa');
    for (var j = 0; j < secoes.length - 1; j++) {
      secoes[j].classList.add('concluida');
      var botao = secoes[j].querySelector('.btn-concluir');
      if (botao) {
        botao.parentNode.innerHTML = '<span class="selo-concluida">&#10003; Etapa concluída</span>';
      }
    }

    atualizarProgresso();
  }

  container.addEventListener('click', function (ev) {
    var alvo = ev.target;

    if (alvo.classList.contains('btn-concluir')) {
      var indice = parseInt(alvo.getAttribute('data-indice'), 10);

      if (indice + 1 < ETAPAS.length) {
        reveladas = Math.max(reveladas, indice + 2);
        salvarProgresso(reveladas);
        renderizar();
        var nova = document.getElementById('etapa-' + (indice + 2));
        if (nova) { nova.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      } else {
        alvo.parentNode.innerHTML = '<span class="selo-concluida">&#10003; Roteiro concluído</span>';
        msgFinal.classList.remove('oculto');
        msgFinal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (alvo.classList.contains('btn-copiar')) {
      var pre = alvo.parentNode.querySelector('pre');
      var texto = pre ? pre.textContent : '';
      var original = alvo.textContent;

      function avisar(ok) {
        alvo.textContent = ok ? 'copiado!' : 'falhou';
        setTimeout(function () { alvo.textContent = original; }, 1400);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(function () { avisar(true); },
                                                  function () { avisar(false); });
      } else {
        avisar(false);
      }
    }
  });

  document.getElementById('link-reiniciar').addEventListener('click', function (ev) {
    ev.preventDefault();
    if (window.confirm('Reiniciar o roteiro? Todas as etapas voltarão a ficar ocultas.')) {
      reveladas = 1;
      salvarProgresso(1);
      msgFinal.classList.add('oculto');
      renderizar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  renderizar();
})();
