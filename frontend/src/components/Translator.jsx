import { useState } from "react";

export default function Translator() {
  const [text, setText] = useState("");
  const [targetLang, setTargetLang] = useState("hi");
  const [result, setResult] = useState("");

  const handleTranslate = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang }),
      });
      const data = await res.json();
      setResult(data.translated);
    } catch (err) {
      console.error("Error:", err);
      setResult("Translation failed");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🌐 Translator Test</h2>

      <input
        type="text"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
        style={{ marginLeft: "0.5rem" }}
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="bn">Bengali</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
        <option value="ml">Malayalam</option>
        <option value="mr">Marathi</option>
        <option value="gu">Gujarati</option>
        <option value="pa">Punjabi</option>
      </select>

      <button onClick={handleTranslate} style={{ marginLeft: "0.5rem" }}>
        Translate
      </button>

      {result && (
        <p>
          <b>Translated:</b> {result}
        </p>
      )}
    </div>
  );
}
