import React, { useEffect, useState } from "react";

const A4_WIDTH = 796;
const A4_HEIGHT = 1123;

export default function PrintModule({ lines, onBack }) {
  const [pageW, setPageW] = useState(A4_WIDTH);
  const [animReady, setAnimReady] = useState(false);

  // Dynamiczne skalowanie dwóch kartek w oknie
  useEffect(() => {
    function handleResize() {
      const maxW = window.innerWidth * 0.95;
      const stopkaH = 40 + 18;
      const maxH = window.innerHeight - stopkaH - 32;
      // Cała szerokość na DWA A4 + margines między nimi
      const cards = 2 * A4_WIDTH + 48;
      const byHeight = maxH * (cards / (1.5 * A4_HEIGHT));
      setPageW(Math.min(A4_WIDTH, (maxW - 48) / 2, byHeight / 2, A4_WIDTH));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const scale = pageW / A4_WIDTH;
  const pageH = pageW * (A4_HEIGHT / A4_WIDTH);

  useEffect(() => {
    const t = setTimeout(() => setAnimReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Lustrzane odbicie: linie od dołu, każda linia od końca i flipped poziomo
  const mirroredLines = [...lines];

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#f5f6f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "stretch",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          width: "100%",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 48 * scale,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: pageH
          }}
        >
          {/* Kartka A4 LEWA */}
          <div
            style={{
              background: "#3a3e41",
              border: "1.5px solid #bbb",
              borderRadius: 12 * scale,
              width: pageW,
              height: pageH,
              boxShadow: "0 6px 48px #0003",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "flex-start"
            }}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex",
                  justifyContent: "flex-end",
                  margin: `${0 * scale}px ${20 * scale}px ${12 * scale}px 0`,
                  minHeight: 96/3 * scale,
                  maxWidth: `calc(100% - ${40 * scale}px)`
                }}
              >
                {line.map((letter, j) => (
                  <img
                    key={j}
                    src={letter.img}
                    alt={letter.char}
                    width={letter.width/3 * scale}
                    height={96/3 * scale}
                    style={{ marginLeft: 0 * scale }}
                    draggable={false}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Kartka A4 PRAWA (Lustrzane odbicie) */}
          <div
            style={{
              background: "#fff",
              width: pageW,
              height: pageH,
              boxShadow: "none",
              border: "none",
              borderRadius: 0,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              transform: animReady

            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
             // transform: "scaleX(-1)", // odwraca całą zawartość poziomo
                display: "flex",  
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start"
              }}
            >
              {mirroredLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    transform: "scaleX(-1)",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex",
                    justifyContent: "flex",
                    margin: `${0 * scale}px ${20 * scale}px ${12 * scale}px 0`,
                    minHeight: 96/3 * scale,
                    filter: "invert(1)",
                    maxWidth: `calc(100% - ${40 * scale}px)`
                  }}
                >
                  {[...line].map((letter, j) => (
                    <img
                      key={j}
                      src={letter.img}
                      alt={letter.char}
                      width={letter.width/3 * scale}
                      height={96/3 * scale}
                    // style={{ filter: invert(1), }} 
                      draggable={false}

                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Przykładowy przycisk powrotu (możesz przenieść do bocznego panelu lub stopki) */}
        <button
          onClick={onBack}
          style={{
            margin: "30px auto 0 auto",
            background: "#222",
            color: "#fff",
            border: "2px solid #888",
            borderRadius: "10%",
            width: 30,
            height: 30,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: "2px 2px 8px #0002",
            outline: "none",
            display: "block"
          }}
          title="Powrót"
          aria-label="Powrót"
        >
          <span style={{ display: "inline-block", transform: "rotate(180deg) translateY(2px)" }}>
            &#8594;
          </span>
        </button>
      </div>
      {/* STOPKA */}
      <p
        style={{
          width: "100%",
          background: "#000",
          color: "#969498",
          textAlign: "center",
          fontSize: 13,
          letterSpacing: 0.2,
          fontFamily: "inherit",
          padding: "12px 0 8px 0",
          flexShrink: 0,
          marginTop: "auto",
          marginBottom: "0px",
          userSelect: "none"
        }}
      >
        <b>ZECER</b> -  {" "}
        <a
          href="https://mkalodz.pl"
          target="_blank"
          rel="noopener"
          style={{
            color: "#fafafa",
            textDecoration: "none",
            transition: "color 0.45s"
          }}
          onMouseEnter={e => (e.target.style.color = "#ff0000")}
          onMouseLeave={e => (e.target.style.color = "#969498")}
          onTouchStart={e => (e.target.style.color = "#ff0000")}
          onTouchEnd={e => (e.target.style.color = "#969498")}
        >
          Muzeum Książki Artystycznej w Łodzi
        </a>
        &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; produkcja:{" "}
        <a
          href="https://peterwolf.pl"
          target="_blank"
          rel="noopener"
          style={{
            color: "#fafafa",
            textDecoration: "none",
            transition: "color 0.45s"
          }}
          onMouseEnter={e => (e.target.style.color = "#ff0000")}
          onMouseLeave={e => (e.target.style.color = "#969498")}
          onTouchStart={e => (e.target.style.color = "#ff0000")}
          onTouchEnd={e => (e.target.style.color = "#969498")}
        >
          peterwolf.pl
        </a>
      </p>
    </div>
  );
}
