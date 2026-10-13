/* Ourivesaria Roque · Catálogo de Natal 2026 — demo
   Único sítio onde vive o número de WhatsApp. Os href do HTML já vêm
   resolvidos (a página funciona sem JS); aqui apenas se reconstroem a
   partir de WA_NUMBER para que baste mudar o número neste ficheiro. */

(function () {
  "use strict";

  var WA_NUMBER = "351963499241";
  var MSG_PECA = "Olá, vi o catálogo de Natal da Ourivesaria Roque e gostava de saber mais sobre: {nome}.";
  var MSG_GENERICA = "Olá, vi a demonstração do catálogo de Natal.";

  function waLink(msg) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  /* Ligações WhatsApp */
  document.querySelectorAll(".peca").forEach(function (peca) {
    var nome = peca.getAttribute("data-nome");
    var btn = peca.querySelector(".btn-wa");
    if (nome && btn) btn.href = waLink(MSG_PECA.replace("{nome}", nome));
  });
  document.querySelectorAll("a[data-generico]").forEach(function (a) {
    a.href = waLink(MSG_GENERICA);
  });

  /* Fotos: mostrar a imagem só quando carrega; sem ícone partido */
  document.querySelectorAll(".peca img").forEach(function (img) {
    var peca = img.closest(".peca");
    function ok() { peca.classList.add("has-img"); }
    function falhou() { img.remove(); }
    if (img.complete) {
      if (img.naturalWidth > 0) ok(); else falhou();
    } else {
      img.addEventListener("load", ok);
      img.addEventListener("error", falhou);
    }
  });

  /* Filtros por categoria */
  var chips = document.querySelectorAll(".chip");
  var pecas = document.querySelectorAll(".peca");
  var aviso = document.getElementById("sem-resultados");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var cat = chip.getAttribute("data-filtro");
      var visiveis = 0;
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
      pecas.forEach(function (p) {
        var mostrar = cat === "tudo" || p.getAttribute("data-cat") === cat;
        p.hidden = !mostrar;
        if (mostrar) visiveis++;
      });
      if (aviso) aviso.hidden = visiveis > 0;
    });
  });
})();
