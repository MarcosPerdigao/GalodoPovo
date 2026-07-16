const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizarUrl } = require("../lib/urlUtils");

test("remove utm_source", () => {
  assert.equal(
    normalizarUrl("https://exemplo.com/noticia?utm_source=rede"),
    "https://exemplo.com/noticia",
  );
});

test("remove varios parametros de rastreamento", () => {
  assert.equal(
    normalizarUrl(
      "https://exemplo.com/noticia?utm_medium=social&gclid=abc&fbclid=def&id=42",
    ),
    "https://exemplo.com/noticia?id=42",
  );
});

test("preserva parametros funcionais", () => {
  assert.equal(
    normalizarUrl("https://exemplo.com/noticia?categoria=saf&id=42"),
    "https://exemplo.com/noticia?categoria=saf&id=42",
  );
});

test("ordena parametros restantes", () => {
  assert.equal(
    normalizarUrl("https://exemplo.com/noticia?z=9&a=1&m=5"),
    "https://exemplo.com/noticia?a=1&m=5&z=9",
  );
});

test("remove hash", () => {
  assert.equal(
    normalizarUrl("https://exemplo.com/noticia?id=42#comentarios"),
    "https://exemplo.com/noticia?id=42",
  );
});

test("normaliza protocolo e hostname", () => {
  assert.equal(
    normalizarUrl("HTTPS://EXEMPLO.COM/Noticia"),
    "https://exemplo.com/Noticia",
  );
});

test("remove barra final fora da raiz", () => {
  assert.equal(
    normalizarUrl("https://exemplo.com/noticia/"),
    "https://exemplo.com/noticia",
  );
});

test("preserva raiz com barra", () => {
  assert.equal(normalizarUrl("https://exemplo.com/"), "https://exemplo.com/");
});

test("url invalida nao lanca excecao", () => {
  assert.equal(normalizarUrl(" exemplo sem url "), "exemplo sem url");
});

test("entrada vazia", () => {
  assert.equal(normalizarUrl("   "), "");
  assert.equal(normalizarUrl(null), "");
});

test("remove parametro de rastreamento com letras maiusculas", () => {
  assert.equal(
    normalizarUrl("https://exemplo.com/noticia?UTM_SOURCE=rede&id=42"),
    "https://exemplo.com/noticia?id=42",
  );
});
