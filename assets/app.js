/* Ourivesaria Roque · Catálogo de Natal 2026 — demo
   Configuração: tudo o que muda de loja para loja está aqui em cima.
   Os href do HTML já vêm resolvidos (a página funciona sem JS); este
   ficheiro reconstrói-os a partir das constantes e acrescenta as
   funcionalidades interativas (filtros, guardados, lightbox, partilhar,
   estado "aberto agora"). Sem cookies: só localStorage para os guardados. */

(function () {
  "use strict";

  var WA_NUMBER = "351963499241";          // WhatsApp (formato internacional, sem +)
  var PHONE = "+351261324959";             // telefone fixo da loja
  var GOOGLE_PLACE_ID = "ChIJPf7SMcEtHw0RBXhMA-pOBtg"; // Place ID da ficha "Ourivesaria Roque Lda" (ver README); vazio = pesquisa por nome
  var INSTAGRAM = "";                      // ex.: "https://www.instagram.com/..."
  var FACEBOOK = "";                       // ex.: "https://www.facebook.com/..."
  var NOME = "Ourivesaria Roque";
  var MORADA_MAPS = "Rua Serpa Pinto 28A, Torres Vedras";
  /* Horário por dia (0 = domingo … 6 = sábado), em minutos desde a meia-noite. */
  var HORARIO = {
    1: [[570, 780], [900, 1140]], 2: [[570, 780], [900, 1140]], 3: [[570, 780], [900, 1140]],
    4: [[570, 780], [900, 1140]], 5: [[570, 780], [900, 1140]], 6: [[570, 780]], 0: []
  };
  var DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

  var MSG_PECA = "Olá, vi o catálogo de Natal da " + NOME + " e gostava de saber mais sobre: {nome}.";
  var MSG_PECAS = "Olá, vi o catálogo de Natal da " + NOME + " e gostava de saber mais sobre estas peças: {lista}.";
  var MSG_SERVICO = "Olá, vi o catálogo de Natal da " + NOME + " e gostava de pedir um orçamento para: {servico}.";
  var MSG_VALE = "Olá, vi o catálogo de Natal da " + NOME + " e gostava de pedir um vale-prenda.";
  var MSG_GENERICA = "Olá, vi a demonstração do catálogo de Natal.";

  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function waLink(msg) { return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg); }
  function lista(nomes) {
    if (nomes.length <= 1) return nomes.join("");
    return nomes.slice(0, -1).join(", ") + " e " + nomes[nomes.length - 1];
  }

  /* ---------- Ligações (WhatsApp, telefone, mapa, Google) ---------- */
  $$(".peca").forEach(function (p) {
    var btn = $(".btn-wa", p);
    if (btn) btn.href = waLink(MSG_PECA.replace("{nome}", p.getAttribute("data-nome")));
  });
  $$("[data-servico]").forEach(function (a) { a.href = waLink(MSG_SERVICO.replace("{servico}", a.getAttribute("data-servico"))); });
  $$("[data-generico]").forEach(function (a) { a.href = waLink(MSG_GENERICA); });
  $$("[data-vale]").forEach(function (a) { a.href = waLink(MSG_VALE); });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + PHONE; });
  $$("[data-dir]").forEach(function (a) {
    a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(MORADA_MAPS);
  });
  $$("[data-google]").forEach(function (a) {
    a.href = GOOGLE_PLACE_ID
      ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(GOOGLE_PLACE_ID)
      : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(NOME + ", " + MORADA_MAPS);
  });
  $$("[data-reviews]").forEach(function (a) {
    a.href = GOOGLE_PLACE_ID
      ? "https://search.google.com/local/reviews?placeid=" + encodeURIComponent(GOOGLE_PLACE_ID)
      : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(NOME + ", " + MORADA_MAPS);
  });
  var redes = $("#redes");
  if (redes) {
    var ig = $("[data-instagram]", redes), fb = $("[data-facebook]", redes);
    if (ig) { if (INSTAGRAM) ig.href = INSTAGRAM; else ig.remove(); }
    if (fb) { if (FACEBOOK) fb.href = FACEBOOK; else fb.remove(); }
    if (INSTAGRAM || FACEBOOK) redes.hidden = false;
  }

  /* ---------- Fotos: mostrar só quando carregam; nunca ícone partido ---------- */
  $$(".foto img").forEach(function (img) {
    var fig = img.closest(".foto");
    function ok() { fig.classList.add("has-img"); }
    function falhou() { img.remove(); }
    if (img.complete) { if (img.naturalWidth > 0) ok(); else falhou(); }
    else { img.addEventListener("load", ok); img.addEventListener("error", falhou); }
  });

  /* ---------- Guardados (localStorage, sem cookies) ---------- */
  var KEY = "or-guardados";
  function lerGuardados() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function gravarGuardados(ids) {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) { /* modo privado, etc. */ }
  }
  var guardados = lerGuardados();
  var chipGuardados = $("#chip-guardados");
  var btnGuardados = $("#btn-guardados");

  function atualizarGuardados() {
    var pecas = $$(".peca");
    pecas.forEach(function (p) {
      var on = guardados.indexOf(p.id) !== -1;
      p.classList.toggle("guardada", on);
      var b = $(".fav", p);
      if (b) { b.setAttribute("aria-pressed", on ? "true" : "false"); b.setAttribute("aria-label", (on ? "Remover dos guardados: " : "Guardar: ") + p.getAttribute("data-nome")); }
    });
    var n = guardados.length;
    if (chipGuardados) { chipGuardados.hidden = n === 0; chipGuardados.textContent = "Guardados (" + n + ")"; }
    if (btnGuardados) {
      btnGuardados.hidden = n === 0;
      var nomes = pecas.filter(function (p) { return guardados.indexOf(p.id) !== -1; }).map(function (p) { return p.getAttribute("data-nome"); });
      btnGuardados.href = n ? waLink(MSG_PECAS.replace("{lista}", lista(nomes))) : "#";
    }
    if (n === 0 && filtro.cat === "guardados") aplicarFiltro("tudo", filtro.para);
  }

  $$(".peca").forEach(function (p) {
    var b = $(".fav", p);
    if (!b) return;
    b.hidden = false;
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      var i = guardados.indexOf(p.id);
      if (i === -1) { guardados.push(p.id); toast("Peça guardada"); } else { guardados.splice(i, 1); toast("Peça removida dos guardados"); }
      gravarGuardados(guardados);
      atualizarGuardados();
    });
  });

  /* ---------- Filtros: categoria × "para quem" × guardados ---------- */
  var filtro = { cat: "tudo", para: "" };
  var aviso = $("#sem-resultados");
  var filtroAtivo = $("#filtro-ativo");
  var PARA_LABEL = { ela: "Para ela", ele: "Para ele", bebe: "Para o bebé" };

  function aplicarFiltro(cat, para) {
    filtro.cat = cat; filtro.para = para || "";
    $$(".chip[data-filtro]").forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-filtro") === cat ? "true" : "false"); });
    $$(".tile[data-para]").forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-para") === filtro.para ? "true" : "false"); });
    var visiveis = 0;
    $$(".peca").forEach(function (p) {
      var okCat = cat === "tudo" || (cat === "guardados" ? guardados.indexOf(p.id) !== -1 : p.getAttribute("data-cat") === cat);
      var okPara = !filtro.para || (" " + (p.getAttribute("data-para") || "") + " ").indexOf(" " + filtro.para + " ") !== -1;
      p.hidden = !(okCat && okPara);
      if (!p.hidden) visiveis++;
    });
    if (aviso) aviso.hidden = visiveis > 0;
    if (filtroAtivo) {
      filtroAtivo.hidden = !filtro.para;
      var lab = $("span", filtroAtivo); if (lab) lab.textContent = PARA_LABEL[filtro.para] || "";
    }
  }
  $$(".chip[data-filtro]").forEach(function (c) {
    c.addEventListener("click", function () { aplicarFiltro(c.getAttribute("data-filtro"), filtro.para); });
  });
  $$(".tile[data-para]").forEach(function (t) {
    t.addEventListener("click", function () {
      var p = t.getAttribute("data-para");
      aplicarFiltro("tudo", filtro.para === p ? "" : p);
      if (filtro.para) { var g = $("#catalogo"); if (g) g.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
  });
  var limpar = $("#filtro-ativo button");
  if (limpar) limpar.addEventListener("click", function () { aplicarFiltro(filtro.cat, ""); });

  atualizarGuardados();

  /* ---------- Lightbox ---------- */
  var lb = $("#lb");
  var pecasTodas = $$(".peca");
  var lbIndex = -1;

  function abrirLightbox(i, semHash) {
    if (!lb || typeof lb.showModal !== "function") return;
    var p = pecasTodas[i]; if (!p) return;
    lbIndex = i;
    var img = $(".peca img", p) || null;
    var lbImg = $("#lb-img"), lbPh = $("#lb-ph");
    if (img && img.naturalWidth > 0) { lbImg.src = img.currentSrc || img.src; lbImg.hidden = false; lbPh.hidden = true; }
    else { lbImg.removeAttribute("src"); lbImg.hidden = true; lbPh.hidden = false; lbPh.innerHTML = $(".ph", p).innerHTML; }
    lbImg.alt = p.getAttribute("data-nome");
    $("#lb-nome").textContent = p.getAttribute("data-nome");
    $("#lb-desc").textContent = $("p", p).textContent;
    $("#lb-wa").href = waLink(MSG_PECA.replace("{nome}", p.getAttribute("data-nome")));
    if (!lb.open) lb.showModal();
    document.body.classList.add("lb-aberto");
    if (!semHash && history.replaceState) history.replaceState(null, "", "#" + p.id);
  }
  function fecharLightbox() {
    if (lb && lb.open) lb.close();
  }
  if (lb) {
    lb.addEventListener("close", function () {
      document.body.classList.remove("lb-aberto");
      if (history.replaceState && location.hash) history.replaceState(null, "", location.pathname + location.search);
      var p = pecasTodas[lbIndex]; if (p) { var f = $(".foto", p); if (f) f.focus(); }
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) fecharLightbox(); });
    $("#lb-fechar").addEventListener("click", fecharLightbox);
    $("#lb-ant").addEventListener("click", function () { abrirLightbox((lbIndex - 1 + pecasTodas.length) % pecasTodas.length); });
    $("#lb-seg").addEventListener("click", function () { abrirLightbox((lbIndex + 1) % pecasTodas.length); });
    $("#lb-partilhar").addEventListener("click", function () { partilhar(pecasTodas[lbIndex]); });

    pecasTodas.forEach(function (p, i) {
      var f = $(".foto", p);
      if (!f) return;
      f.setAttribute("role", "button"); f.setAttribute("tabindex", "0");
      f.setAttribute("aria-label", "Ver " + p.getAttribute("data-nome") + " em grande");
      f.addEventListener("click", function () { abrirLightbox(i); });
      f.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirLightbox(i); } });
    });

    /* Ligação direta: catalogo/#anel-ouro abre a peça (ao carregar e ao mudar o hash) */
    function abrirPorHash() {
      var h = location.hash.replace("#", "");
      if (!h) return;
      var idx = pecasTodas.map(function (p) { return p.id; }).indexOf(h);
      if (idx !== -1) abrirLightbox(idx, true);
    }
    if (document.readyState === "complete") abrirPorHash(); else window.addEventListener("load", abrirPorHash);
    window.addEventListener("hashchange", abrirPorHash);
  }

  /* ---------- Partilhar ---------- */
  function partilhar(p) {
    var url = location.origin + location.pathname + "#" + p.id;
    var dados = { title: p.getAttribute("data-nome") + " · " + NOME, text: p.getAttribute("data-nome") + " — " + NOME, url: url };
    if (navigator.share) {
      navigator.share(dados).catch(function () { /* cancelado */ });
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { toast("Ligação copiada"); }, function () { toast(url); });
    } else {
      window.prompt("Copie a ligação:", url);
    }
  }

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("on"); }, 2200);
  }

  /* ---------- Horário: "Aberto agora" e dia de hoje ---------- */
  function hhmm(m) { return Math.floor(m / 60) + ":" + ("0" + (m % 60)).slice(-2); }
  function agoraLisboa(date) {
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date);
    var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
    var dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday);
    return { dia: dia, min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
  }
  function estadoHorario(date) {
    var a = agoraLisboa(date || new Date());
    var hoje = HORARIO[a.dia] || [];
    for (var i = 0; i < hoje.length; i++) {
      if (a.min >= hoje[i][0] && a.min < hoje[i][1]) return { aberto: true, texto: "Aberto agora · fecha às " + hhmm(hoje[i][1]) };
      if (a.min < hoje[i][0]) return { aberto: false, texto: "Fechado · abre hoje às " + hhmm(hoje[i][0]) };
    }
    for (var d = 1; d <= 7; d++) {
      var dia = (a.dia + d) % 7, h = HORARIO[dia] || [];
      if (h.length) return { aberto: false, texto: "Fechado · abre " + (d === 1 ? "amanhã" : DIAS[dia]) + " às " + hhmm(h[0][0]) };
    }
    return { aberto: false, texto: "Fechado" };
  }
  window.estadoHorario = estadoHorario; // exposto para testes

  var estadoEl = $("#estado");
  if (estadoEl) {
    try {
      var e = estadoHorario();
      estadoEl.textContent = e.texto;
      estadoEl.classList.toggle("aberto", e.aberto);
      estadoEl.hidden = false;
    } catch (err) { /* Intl sem timeZone: fica escondido */ }
    var hoje = agoraLisboa(new Date()).dia;
    var linha = $("#horario tr[data-dia='" + hoje + "']");
    if (linha) linha.classList.add("hoje");
  }
})();
