/* NetecShop - aplicação-alvo para automação de testes
   IFMA Campus Timon
   Estado em memória: recarregar a página zera tudo (garante isolamento entre testes).

   ATRASOS PROPOSITAIS (para exercitar esperas explícitas):
     login ............ 900 ms
     busca ............ 600 ms
     checkout ........ 1200 ms
     selo promoção ... 2500 ms após entrar no catálogo
     newsletter ....... 700 ms (em newsletter.html)
*/

(function () {
  'use strict';

  var ATRASO_LOGIN = 900;
  var ATRASO_BUSCA = 600;
  var ATRASO_CHECKOUT = 1200;
  var ATRASO_SELO = 2500;

  var USUARIOS = {
    'aluno': 'ifma2026',
    'professor': 'ifma2026',
    'bloqueado': 'ifma2026'
  };

  var PRODUTOS = [
    { sku: 'TEC-001', nome: 'Teclado Mecânico ABNT2', preco: 249.90 },
    { sku: 'MOU-002', nome: 'Mouse Óptico 1600 DPI', preco: 79.90 },
    { sku: 'MON-003', nome: 'Monitor 24 polegadas Full HD', preco: 899.00 },
    { sku: 'SSD-004', nome: 'SSD NVMe 1TB', preco: 459.00 },
    { sku: 'HUB-005', nome: 'Hub USB-C 7 portas', preco: 189.50 },
    { sku: 'CAB-006', nome: 'Cabo HDMI 2.1 de 2 metros', preco: 59.90 }
  ];

  var carrinho = [];
  var usuarioAtual = null;
  var seloAgendado = false;

  /* ---------------- utilidades ---------------- */

  function el(id) { return document.getElementById(id); }

  function mostrar(no) { no.classList.remove('oculto'); }
  function esconder(no) { no.classList.add('oculto'); }

  function moeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function mostrarTela(id) {
    var telas = document.querySelectorAll('.tela');
    for (var i = 0; i < telas.length; i++) { telas[i].classList.add('oculto'); }
    mostrar(el(id));
    window.scrollTo(0, 0);
  }

  /* ---------------- login ---------------- */

  function entrar() {
    esconder(el('msg-erro'));
    mostrar(el('carregando'));
    el('btn-entrar').disabled = true;

    var usuario = el('usuario').value.trim();
    var senha = el('senha').value;

    setTimeout(function () {
      esconder(el('carregando'));
      el('btn-entrar').disabled = false;

      if (usuario === 'bloqueado' && senha === USUARIOS.bloqueado) {
        el('msg-erro').textContent = 'Conta bloqueada. Procure o administrador do sistema.';
        mostrar(el('msg-erro'));
        return;
      }

      if (USUARIOS.hasOwnProperty(usuario) && USUARIOS[usuario] === senha) {
        usuarioAtual = usuario;
        el('ola-usuario').textContent = 'Olá, ' + usuario;
        el('barra-usuario').style.display = 'flex';
        renderizarProdutos(PRODUTOS);
        mostrarTela('tela-catalogo');
        agendarSelo();
      } else {
        el('msg-erro').textContent = 'Usuário ou senha inválidos.';
        mostrar(el('msg-erro'));
      }
    }, ATRASO_LOGIN);
  }

  function sair() {
    usuarioAtual = null;
    carrinho = [];
    seloAgendado = false;
    atualizarContador();
    el('usuario').value = '';
    el('senha').value = '';
    el('campo-busca').value = '';
    esconder(el('msg-erro'));
    esconder(el('selo-promocao'));
    el('barra-usuario').style.display = 'none';
    mostrarTela('tela-login');
  }

  function agendarSelo() {
    if (seloAgendado) { return; }
    seloAgendado = true;
    setTimeout(function () { mostrar(el('selo-promocao')); }, ATRASO_SELO);
  }

  /* ---------------- catálogo ---------------- */

  function renderizarProdutos(lista) {
    var container = el('lista-produtos');
    container.innerHTML = '';

    if (lista.length === 0) {
      mostrar(el('msg-vazio'));
      return;
    }
    esconder(el('msg-vazio'));

    lista.forEach(function (p) {
      var cartao = document.createElement('div');
      cartao.className = 'produto';
      cartao.setAttribute('data-sku', p.sku);

      var sku = document.createElement('div');
      sku.className = 'produto-sku';
      sku.textContent = p.sku;

      var nome = document.createElement('div');
      nome.className = 'produto-nome';
      nome.textContent = p.nome;

      var preco = document.createElement('div');
      preco.className = 'produto-preco';
      preco.textContent = moeda(p.preco);

      var botao = document.createElement('button');
      botao.className = 'btn-adicionar';
      botao.id = 'add-' + p.sku;
      botao.setAttribute('data-sku', p.sku);
      botao.textContent = 'Adicionar ao carrinho';
      botao.addEventListener('click', function () { adicionarAoCarrinho(p.sku); });

      cartao.appendChild(sku);
      cartao.appendChild(nome);
      cartao.appendChild(preco);
      cartao.appendChild(botao);
      container.appendChild(cartao);
    });
  }

  function buscar() {
    var termo = el('campo-busca').value.trim().toLowerCase();
    el('lista-produtos').innerHTML = '';
    esconder(el('msg-vazio'));
    mostrar(el('buscando'));
    el('btn-buscar').disabled = true;

    setTimeout(function () {
      esconder(el('buscando'));
      el('btn-buscar').disabled = false;
      var filtrados = PRODUTOS.filter(function (p) {
        return p.nome.toLowerCase().indexOf(termo) !== -1 ||
               p.sku.toLowerCase().indexOf(termo) !== -1;
      });
      renderizarProdutos(filtrados);
    }, ATRASO_BUSCA);
  }

  function limparBusca() {
    el('campo-busca').value = '';
    esconder(el('msg-vazio'));
    renderizarProdutos(PRODUTOS);
  }

  /* ---------------- carrinho ---------------- */

  function adicionarAoCarrinho(sku) {
    var existente = null;
    for (var i = 0; i < carrinho.length; i++) {
      if (carrinho[i].sku === sku) { existente = carrinho[i]; break; }
    }
    if (existente) {
      existente.qtd += 1;
    } else {
      var produto = PRODUTOS.filter(function (p) { return p.sku === sku; })[0];
      carrinho.push({ sku: produto.sku, nome: produto.nome, preco: produto.preco, qtd: 1 });
    }
    atualizarContador();
  }

  function removerDoCarrinho(sku) {
    carrinho = carrinho.filter(function (item) { return item.sku !== sku; });
    atualizarContador();
    renderizarCarrinho();
  }

  function atualizarContador() {
    var total = 0;
    carrinho.forEach(function (item) { total += item.qtd; });
    el('contador-carrinho').textContent = String(total);
  }

  function totalCarrinho() {
    var total = 0;
    carrinho.forEach(function (item) { total += item.preco * item.qtd; });
    return total;
  }

  function renderizarCarrinho() {
    var corpo = el('corpo-carrinho');
    corpo.innerHTML = '';

    if (carrinho.length === 0) {
      mostrar(el('msg-carrinho-vazio'));
      el('btn-finalizar').disabled = true;
    } else {
      esconder(el('msg-carrinho-vazio'));
      el('btn-finalizar').disabled = false;
    }

    carrinho.forEach(function (item) {
      var linha = document.createElement('tr');
      linha.className = 'item-carrinho';
      linha.setAttribute('data-sku', item.sku);

      var tdSku = document.createElement('td');
      tdSku.className = 'item-sku';
      tdSku.textContent = item.sku;

      var tdNome = document.createElement('td');
      tdNome.className = 'item-nome';
      tdNome.textContent = item.nome;

      var tdQtd = document.createElement('td');
      tdQtd.className = 'item-qtd num';
      tdQtd.textContent = String(item.qtd);

      var tdPreco = document.createElement('td');
      tdPreco.className = 'item-preco num';
      tdPreco.textContent = moeda(item.preco * item.qtd);

      var tdAcao = document.createElement('td');
      var botao = document.createElement('button');
      botao.className = 'btn-remover secundario';
      botao.id = 'remover-' + item.sku;
      botao.setAttribute('data-sku', item.sku);
      botao.textContent = 'Remover';
      botao.addEventListener('click', function () { removerDoCarrinho(item.sku); });
      tdAcao.appendChild(botao);

      linha.appendChild(tdSku);
      linha.appendChild(tdNome);
      linha.appendChild(tdQtd);
      linha.appendChild(tdPreco);
      linha.appendChild(tdAcao);
      corpo.appendChild(linha);
    });

    el('total-carrinho').textContent = moeda(totalCarrinho());
  }

  function esvaziarCarrinho() {
    // Dispara um diálogo nativo do navegador: exercício de switch_to.alert
    if (window.confirm('Deseja remover todos os itens do carrinho?')) {
      carrinho = [];
      atualizarContador();
      renderizarCarrinho();
    }
  }

  /* ---------------- checkout ---------------- */

  function confirmarPedido() {
    esconder(el('msg-erro-checkout'));

    var nome = el('nome-completo').value.trim();
    var email = el('email').value.trim();
    var uf = el('uf').value;
    var aceite = el('aceite').checked;

    if (nome === '' || email === '' || uf === '') {
      el('msg-erro-checkout').textContent = 'Preencha nome, e-mail e estado antes de continuar.';
      mostrar(el('msg-erro-checkout'));
      return;
    }

    if (!aceite) {
      el('msg-erro-checkout').textContent = 'É necessário aceitar os termos de uso.';
      mostrar(el('msg-erro-checkout'));
      return;
    }

    mostrar(el('processando'));
    el('btn-confirmar').disabled = true;

    setTimeout(function () {
      esconder(el('processando'));
      el('btn-confirmar').disabled = false;

      var expressa = el('entrega-expressa').checked;
      var frete = expressa ? 29.90 : 0;
      var totalItens = 0;
      carrinho.forEach(function (item) { totalItens += item.qtd; });

      var numero = String(Math.floor(Math.random() * 900000) + 100000);
      el('codigo-pedido').textContent = 'NS-' + numero;
      el('resumo-itens').textContent = totalItens + ' item(ns)';
      el('resumo-entrega').textContent = expressa ? 'Expressa (2 dias úteis)' : 'Padrão (7 dias úteis)';
      el('resumo-total').textContent = moeda(totalCarrinho() + frete);

      carrinho = [];
      atualizarContador();
      mostrarTela('tela-confirmacao');
    }, ATRASO_CHECKOUT);
  }

  function novoPedido() {
    el('nome-completo').value = '';
    el('email').value = '';
    el('cep').value = '';
    el('uf').value = '';
    el('observacoes').value = '';
    el('aceite').checked = false;
    el('entrega-padrao').checked = true;
    esconder(el('msg-erro-checkout'));
    limparBusca();
    mostrarTela('tela-catalogo');
  }

  /* ---------------- ligações de eventos ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    el('btn-entrar').addEventListener('click', entrar);
    el('btn-sair').addEventListener('click', sair);

    el('senha').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { entrar(); }
    });

    el('btn-buscar').addEventListener('click', buscar);
    el('btn-limpar-busca').addEventListener('click', limparBusca);

    el('btn-ir-carrinho').addEventListener('click', function () {
      renderizarCarrinho();
      mostrarTela('tela-carrinho');
    });

    el('btn-voltar-catalogo').addEventListener('click', function () {
      mostrarTela('tela-catalogo');
    });

    el('btn-limpar').addEventListener('click', esvaziarCarrinho);

    el('btn-finalizar').addEventListener('click', function () {
      mostrarTela('tela-checkout');
    });

    el('btn-voltar-carrinho').addEventListener('click', function () {
      renderizarCarrinho();
      mostrarTela('tela-carrinho');
    });

    el('btn-confirmar').addEventListener('click', confirmarPedido);
    el('btn-novo-pedido').addEventListener('click', novoPedido);

    renderizarProdutos(PRODUTOS);
  });
})();
