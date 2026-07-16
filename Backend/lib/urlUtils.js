const PARAMETROS_RASTREAMENTO = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "mc_cid",
  "mc_eid",
]);

function normalizarUrl(url) {
  if (typeof url !== "string") return "";

  const urlAparada = url.trim();
  if (!urlAparada) return "";

  try {
    const parsedUrl = new URL(urlAparada);

    parsedUrl.protocol = parsedUrl.protocol.toLowerCase();
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
    parsedUrl.hash = "";

    const parametros = Array.from(parsedUrl.searchParams.entries())
      .filter(([nome]) => !PARAMETROS_RASTREAMENTO.has(nome.toLowerCase()))
      .sort(([nomeA, valorA], [nomeB, valorB]) => {
        const comparacaoNome = nomeA.localeCompare(nomeB);
        if (comparacaoNome !== 0) return comparacaoNome;
        return valorA.localeCompare(valorB);
      });

    parsedUrl.search = "";
    for (const [nome, valor] of parametros) {
      parsedUrl.searchParams.append(nome, valor);
    }

    if (parsedUrl.pathname !== "/" && parsedUrl.pathname.endsWith("/")) {
      parsedUrl.pathname = parsedUrl.pathname.slice(0, -1);
    }

    return parsedUrl.toString();
  } catch (err) {
    return urlAparada;
  }
}

module.exports = {
  normalizarUrl,
};
