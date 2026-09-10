import { extract } from "../src/index.ts";

let fails = 0;
function eq(actual, expected, label) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  const ok = a === e;
  if (!ok) fails++;
  console.log((ok ? "  ok   " : "  FAIL ") + label + (ok ? "" : `\n         erwartet ${e}\n         bekommen ${a}`));
}

console.log("=== (a) JSON-LD");
eq(extract(`<html><head><script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"Zelt Ultra 2",
 "weight":{"@type":"QuantitativeValue","value":1.24,"unitCode":"KGM"},
 "offers":{"@type":"Offer","price":"549.00","priceCurrency":"CHF"}}
</script></head><body>Irgendwas 999 g für 12.00 EUR</body></html>`),
{ found: true, name: "Zelt Ultra 2", weightGrams: 1240, price: 549, currency: "CHF", confidence: "high" },
"QuantitativeValue in kg, Offer als Objekt");

eq(extract(`<script type="application/ld+json">
{"@graph":[{"@type":"WebPage"},{"@type":["Product"],"name":"Schlafsack X",
"additionalProperty":[{"@type":"PropertyValue","name":"Gewicht","value":"860 g"}],
"offers":[{"@type":"Offer","price":329.9,"priceCurrency":"EUR"}]}]}</script>`),
{ found: true, name: "Schlafsack X", weightGrams: 860, price: 329.9, currency: "EUR", confidence: "high" },
"@graph, additionalProperty, offers als Array");

eq(extract(`<script type="application/ld+json">{kaputt</script>
<script type="application/ld+json">{"@type":"Product","name":"Nach dem Fehler"}</script>`),
{ found: true, name: "Nach dem Fehler", confidence: "high" },
"kaputter Block blockiert die anderen nicht");

eq(extract(`<script type="application/ld+json">{"@type":"Product","name":"Ohne Einheit","weight":{"value":700}}</script>`),
{ found: true, name: "Ohne Einheit", confidence: "high" },
"Gewicht ohne Einheit wird nicht geraten");

console.log("\n=== (b) Open Graph / Meta");
eq(extract(`<meta property="og:title" content="Rucksack Ultra 45 &amp; Co">
<meta property="product:price:amount" content="199.95">
<meta property="product:price:currency" content="eur">`),
{ found: true, name: "Rucksack Ultra 45 & Co", price: 199.95, currency: "EUR", confidence: "low" },
"og:title + product:price:* → 'low', denn 'high' ist laut Vorgabe JSON-LD vorbehalten");

eq(extract(`<meta name="og:title" content="Matte"><meta property="product:weight:value" content="0.48"><meta property="product:weight:units" content="kg">`),
{ found: true, name: "Matte", weightGrams: 480, confidence: "low" },
"product:weight in kg");

console.log("\n=== (c) Regex-Fallback");
eq(extract(`<html><head><title>Kocher Mini – Shop</title></head>
<body><p>Gewicht: 73 g</p><p>Preis 49.90 CHF</p></body></html>`),
{ found: true, name: "Kocher Mini – Shop", weightGrams: 73, price: 49.9, currency: "CHF", confidence: "low" },
"beschriftetes Gewicht, Preis mit Währung dahinter");

eq(extract(`<title>Daunenjacke</title><body>CHF 1'299.00 inkl. MwSt. Gewicht 0,42 kg</body>`),
{ found: true, name: "Daunenjacke", weightGrams: 420, price: 1299, currency: "CHF", confidence: "low" },
"Symbol vorne, Schweizer Tausenderapostroph, Komma-Kilo");

eq(extract(`<title>Stirnlampe</title><body>€ 34,95 &middot; 88 gramm</body>`),
{ found: true, name: "Stirnlampe", weightGrams: 88, price: 34.95, currency: "EUR", confidence: "low" },
"Euro-Symbol, deutsches Komma, 'gramm'");

eq(extract(`<title>Trekkingstöcke</title><body>ab $49.00</body>`),
{ found: true, name: "Trekkingstöcke", price: 49, currency: "USD", confidence: "low" },
"Dollar-Symbol");

eq(extract(`<script type="application/ld+json">{"@type":"Product","name":"Aus JSON-LD",
"offers":{"price":"10.00","priceCurrency":"CHF"}}</script>
<meta property="og:title" content="Aus Meta">`),
{ found: true, name: "Aus JSON-LD", price: 10, currency: "CHF", confidence: "high" },
"JSON-LD schlägt Meta und bleibt 'high'");

console.log("\n=== Mischung und Nicht-Treffer");
eq(extract(`<script type="application/ld+json">{"@type":"Product","name":"Sicher benannt"}</script>
<body>Gewicht 250 g</body>`),
{ found: true, name: "Sicher benannt", weightGrams: 250, confidence: "low" },
"ein geratenes Feld zieht das ganze Ergebnis auf 'low'");

eq(extract(`<html><body><p>Diese Seite hat nichts.</p></body></html>`),
{ found: false }, "nichts Verwertbares → found:false");

eq(extract(`<html><body>Nur Text, kein Titel, 5 Sterne</body></html>`),
{ found: false }, "Sternebewertung ist kein Gewicht und kein Preis");

eq(extract(`<title>Shop</title><body>Versand ab 5.00 CHF</body>`),
{ found: true, name: "Shop", price: 5, currency: "CHF", confidence: "low" },
"Fallback nimmt den ersten Preis – darum 'low' und Bestätigung durch den Nutzer");

console.log("\n" + (fails ? fails + " Fehlschläge" : "Alles grün."));
process.exit(fails ? 1 : 0);
