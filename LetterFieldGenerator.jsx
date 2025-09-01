import React, { useRef, useState } from "react";

// Edytuj tu swój alfabet, polskie litery wpisz na końcu jeśli chcesz
const ALFABET = [
  "a", "ą", "b", "c", "ć", "d", "e", "ę", "f", "g", "h", "i", "j", "k",
  "l", "ł", "m", "n", "ń", "o", "ó", "p", "q", "r", "s", "ś", "t", "u",
  "v", "w", "x", "y", "z", "ź", "ż",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", ",", "spacja"
];

const KASZTA_WIDTH = 1618;
const KASZTA_HEIGHT = 1080;

export default function LetterFieldGenerator() {
  const [mode, setMode] = useState("male");  // "male" lub "wielkie"
  const [step, setStep] = useState(0);       // 0: pierwszy klik, 1: drugi klik
  const [clicks, setClicks] = useState([]);
  const [fields, setFields] = useState([]);
  const [literaIdx, setLiteraIdx] = useState(0);
  const kasztaRef = useRef();

  // Ustal bieżącą literę (mała/wielka)
  const isMale = mode === "male";
  const litera = ALFABET[literaIdx];
  // Plik obrazka zgodnie z regułą
  const imgFile = isMale
    ? `/assets/letters/${litera}.png`
    : `/assets/letters/${litera}${litera}.png`;

  function handleKasztaClick(e) {
    const rect = kasztaRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (step === 0) {
      setClicks([{ x, y }]);
      setStep(1);
    } else if (step === 1) {
      const nowyField = {
        char: isMale ? litera : litera.toUpperCase(),
        x1: clicks[0].x,
        y1: clicks[0].y,
        x2: x,
        y2: y,
        img: imgFile
      };
      setFields([...fields, nowyField]);
      setClicks([]);
      setStep(0);
      // Następna litera
      if (literaIdx < ALFABET.length - 1) {
        setLiteraIdx(literaIdx + 1);
      } else {
        // Jeśli skończone małe litery, zaczynamy wielkie
        if (isMale) {
          setMode("wielkie");
          setLiteraIdx(0);
        } else {
          alert("Ostatnia litera! Skopiuj poniższy JSON i wklej do swojego projektu.");
        }
      }
    }
  }

  function undoLast() {
    if (fields.length > 0) {
      setFields(fields.slice(0, -1));
      if (literaIdx > 0) setLiteraIdx(literaIdx - 1);
      setClicks([]);
      setStep(0);
    }
  }

return (
  <div style={{ maxWidth: 1080 }}>
    <div style={{ marginBottom: 16 }}>
      <span className="text-lg">
        Kliknij dwa narożniki pola dla <b>{isMale ? "małej" : "wielkiej"}</b> litery:{" "}
      </span>
      <span className="text-2xl font-mono px-3 py-1 bg-yellow-200 rounded">
        {isMale ? litera : litera.toUpperCase()}
      </span>
      <img src={imgFile} alt="" style={{ height: 36, marginLeft: 10, verticalAlign: "middle" }} />
      {step === 1 && (
        <span style={{ color: "#f59e42", marginLeft: 20 }}>
          → wybierz drugi narożnik
        </span>
      )}
    </div>
    <div
      ref={kasztaRef}
      style={{
        position: "relative",
        width: KASZTA_WIDTH,
        height: KASZTA_HEIGHT,
        border: "2px solid #bbb",
        borderRadius: 8,
        cursor: "crosshair",
        marginBottom: 24,
        background: "#fff"
      }}
      onClick={handleKasztaClick}
    >
      <img
        src="/assets/kaszta.png"
        alt="Kaszta"
        width={KASZTA_WIDTH}
        height={KASZTA_HEIGHT}
        style={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }}
      />
      {/* Podgląd aktualnie zaznaczanego prostokąta */}
      {step === 1 && clicks.length === 1 && (
        <div
          style={{
            position: "absolute",
            left: clicks[0].x - 2,
            top: clicks[0].y - 2,
            width: 4,
            height: 4,
            background: "#f59e42",
            borderRadius: "50%",
            zIndex: 5
          }}
        />
      )}
      {/* Prostokąty wszystkich pól */}
      {fields.map((f, idx) => (
        <div key={idx}
          style={{
            position: "absolute",
            left: Math.min(f.x1, f.x2),
            top: Math.min(f.y1, f.y2),
            width: Math.abs(f.x2 - f.x1),
            height: Math.abs(f.y2 - f.y1),
            border: "2px solid #2563eb",
            background: "rgba(96,165,250,0.13)",
            zIndex: 4,
            pointerEvents: "none"
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 2,
              top: 2,
              fontSize: 14,
              color: "#1d4ed8",
              fontWeight: "bold",
              background: "rgba(255,255,255,0.82)",
              borderRadius: 4,
              padding: "0 3px"
            }}
          >{f.char}</span>
        </div>
      ))}
    </div>
    <div className="mb-4">
      <button
        onClick={undoLast}
        className="bg-red-500 text-white px-3 py-1 rounded mr-3"
        disabled={fields.length === 0}
      >Cofnij ostatnie pole</button>
      
    </div>
    
    <textarea
      value={fields.map(f =>
        `  { "char": "${f.char}", "x1": ${f.x1}, "y1": ${f.y1}, "x2": ${f.x2}, "y2": ${f.y2}, "img": "${f.img}" },`
      ).join("\n")}
      readOnly
      style={{
        width: "100%",
        minHeight: "180px",
        fontSize: "14px",
        fontFamily: "monospace",
        background: "#3b3c3d",
        border: "1px solid #d1d5db",
        borderRadius: "4px",
        padding: "8px"
      }}
      onFocus={e => e.target.select()}
    />
    <div style={{fontSize:12, color:"#777", marginTop:10}}>
      Wskazujesz dwa kliknięcia dla każdej litery. Najpierw <b>małe</b>, potem <b>wielkie</b> litery.
      Ścieżka do obrazka dobierana jest automatycznie.
    </div>
  </div>
);
}