// backend/src/translator/translator.controller.js
import { translateText } from "./translator.service.js";

export async function handleTranslation(req, res) {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: "Text and targetLang are required" });
    }

    // correct order: text, sourceLang, targetLang
    const translated = await translateText(text, "auto", targetLang);
    res.json({ translated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
