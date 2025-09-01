import React, { useState } from "react";
import LetterComposer from "./LetterComposer";
import PageComposer from "./PageComposer";
import PrintModule from "./PrintModule";

export default function App() {
  // Każdy ciąg znaków z wierszownika to tablica liter (obiektów), np. [{char, img, width}]
  const [lines, setLines] = useState([]);
  const [module, setModule] = useState("letter");
 // const [module, setModule] = useState("page");

  // Dodaj nową linię (ciąg liter) do PageComposer
 function addLine(line) {
  if (line && line.length > 0) {
    setLines(prev => [...prev, line]);
  }
}

 
  function clearLines() {
    setLines([]);
  }

  return (
    <>
      {module === "letter" && (
        <LetterComposer
          onMoveLineToPage={line => {
            addLine(line);
            setModule("page");
          }}
        />
      )}
     {module === "page" && (
  <PageComposer
    lines={lines}
    onLinesChange={setLines}    // <-- MUSI BYĆ! INACZEJ NIE DZIAŁA!
    onBack={() => setModule("letter")}
    onClearLines={clearLines}
    onGoToPrint={() => setModule("print")}
  />
)}

      {module === "print" && (
  <PrintModule
    lines={lines}
    onBack={() => setModule("page")}
  />
)}

    </>
  );
}


