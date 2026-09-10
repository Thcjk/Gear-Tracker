import { NextRequest, NextResponse } from "next/server";
import type { ProductImportSuggestion } from "@/types";

export const runtime = "nodejs";

function extractFromJsonLd(html: string): Partial<ProductImportSuggestion> {
  const scriptRegex =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim()) as unknown;
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        const product = unwrapProduct(candidate);
        if (!product) continue;
        const name =
          typeof product.name === "string" ? product.name : undefined;
        const weightGrams = parseWeightValue(product.weight);
        const price = parsePriceValue(product.offers);
        if (name || weightGrams || price) {
          return { name, weightGrams, price };
        }
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
  }
  return {};
}

function unwrapProduct(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj["@graph"] && Array.isArray(obj["@graph"])) {
    for (const node of obj["@graph"]) {
      const found = unwrapProduct(node);
      if (found) return found;
    }
  }
  const type = obj["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((t) => typeof t === "string" && /product/i.test(t))) {
    return obj;
  }
  return null;
}

function parseWeightValue(weight: unknown): number | undefined {
  if (!weight) return undefined;
  if (typeof weight === "number") return weight;
  if (typeof weight === "string") return parseWeightFromText(weight);
  if (typeof weight === "object") {
    const obj = weight as Record<string, unknown>;
    const value = obj.value ?? obj["@value"];
    const unit = String(obj.unitCode ?? obj.unitText ?? "").toLowerCase();
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return undefined;
    if (unit.includes("kg") || unit === "kilo") return Math.round(num * 1000);
    return Math.round(num);
  }
  return undefined;
}

function parsePriceValue(offers: unknown): number | undefined {
  if (!offers) return undefined;
  const list = Array.isArray(offers) ? offers : [offers];
  for (const offer of list) {
    if (!offer || typeof offer !== "object") continue;
    const price = (offer as Record<string, unknown>).price;
    const num = typeof price === "number" ? price : Number(price);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function extractFromMeta(html: string): Partial<ProductImportSuggestion> {
  const getMeta = (property: string) => {
    const re = new RegExp(
      `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i",
    );
    const m = html.match(re);
    return m?.[1];
  };

  const name = getMeta("og:title") || getMeta("twitter:title");
  const priceRaw =
    getMeta("og:price:amount") ||
    getMeta("product:price:amount") ||
    getMeta("twitter:data1");
  const price = priceRaw ? Number(String(priceRaw).replace(",", ".")) : undefined;

  return {
    name: name || undefined,
    price: Number.isFinite(price) ? price : undefined,
  };
}

function parseWeightFromText(text: string): number | undefined {
  const kg = text.match(/(\d+(?:[.,]\d+)?)\s*kg\b/i);
  if (kg) {
    return Math.round(Number(kg[1].replace(",", ".")) * 1000);
  }
  const g = text.match(/(\d+(?:[.,]\d+)?)\s*g\b/i);
  if (g) {
    return Math.round(Number(g[1].replace(",", ".")));
  }
  return undefined;
}

function extractFromRegex(html: string): Partial<ProductImportSuggestion> {
  const plain = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  const weightGrams = parseWeightFromText(plain);

  const priceMatch = plain.match(
    /(\d+(?:[.,]\d{1,2})?)\s?(CHF|EUR|USD|\$|€)/i,
  );
  const price = priceMatch
    ? Number(priceMatch[1].replace(",", "."))
    : undefined;

  return {
    weightGrams,
    price: Number.isFinite(price) ? price : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url) {
      return NextResponse.json(
        { found: false, sourceUrl: "" } satisfies ProductImportSuggestion,
        { status: 400 },
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("invalid protocol");
      }
    } catch {
      return NextResponse.json({
        found: false,
        sourceUrl: url,
      } satisfies ProductImportSuggestion);
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "UltralightGearTracker/1.0 (+https://github.com; product-import)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json({
        found: false,
        sourceUrl: url,
      } satisfies ProductImportSuggestion);
    }

    const html = await response.text();
    const fromLd = extractFromJsonLd(html);
    const fromMeta = extractFromMeta(html);
    const fromRegex = extractFromRegex(html);

    const suggestion: ProductImportSuggestion = {
      name: fromLd.name || fromMeta.name,
      weightGrams: fromLd.weightGrams || fromRegex.weightGrams,
      price: fromLd.price ?? fromMeta.price ?? fromRegex.price,
      found: false,
      sourceUrl: url,
    };

    suggestion.found = Boolean(
      suggestion.name || suggestion.weightGrams || suggestion.price,
    );

    return NextResponse.json(suggestion);
  } catch {
    return NextResponse.json({
      found: false,
      sourceUrl: "",
    } satisfies ProductImportSuggestion);
  }
}
