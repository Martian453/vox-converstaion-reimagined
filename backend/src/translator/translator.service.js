// backend/src/translator/translator.service.js
import fetch from "node-fetch";

const LIBRE_URL = process.env.LIBRE_URL;
if (!LIBRE_URL) throw new Error("LIBRE_URL is not defined");

/**
 * Translate text using LibreTranslate
 * @param {string} text
 * @param {string} sourceLang (e.g., "en", "hi", "auto")
 * @param {string} targetLang (e.g., "en", "hi", "fr")
 * @returns {Promise<string>}
 */
export const translateText = async (text, sourceLang = "auto", targetLang = "en") => {
  if (!text || !targetLang) return text;

  try {
    // Build endpoint robustly
    const base = (process.env.LIBRE_URL || "").replace(/\/+$/, "");
    const endpoint = base.endsWith("/translate") ? base : `${base}/translate`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text"
      }),
    });

    if (!res.ok) {
      const snippet = await res.text().catch(() => "");
      console.warn("LibreTranslate returned non-OK status", res.status, snippet);
      return text;
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const snippet = await res.text().catch(() => "");
      console.warn("LibreTranslate returned non-JSON:", contentType, snippet);
      return text;
    }

    const data = await res.json().catch(() => null);
    if (!data || !data.translatedText) {
      console.warn("LibreTranslate response missing translatedText:", data);
      return text;
    }

    return data.translatedText;
  } catch (err) {
    console.error("Translation error:", err.message);
    return text;
  }
};
