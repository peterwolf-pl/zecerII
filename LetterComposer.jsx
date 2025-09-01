import React, { useRef, useState, useEffect } from "react";

const KASZTA_WIDTH = 1618;
const KASZTA_HEIGHT = 1080;
const SLOTS_COUNT = 20;

function getImageWidth(src) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve(img.width);
    img.src = src;
  });
}

export default function LetterComposer({ onMoveLineToPage }) {
  const [letterFields, setLetterFields] = useState([]);
  const [slots, setSlots] = useState(Array(SLOTS_COUNT).fill(null));
  const [activeLetter, setActiveLetter] = useState(null);
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0, visible: false });
  const [isDragging, setIsDragging] = useState(false);
  const [pickupAnim, setPickupAnim] = useState(false);
  const kasztaRef = useRef();
  const wierszownikRef = useRef();
  const [kasztaW, setKasztaW] = useState(KASZTA_WIDTH);

  // BLOKUJ SCROLL strony
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = oldOverflow; };
  }, []);

  // Responsywna szerokość kaszty i dopasowanie do ekranu
  useEffect(() => {
    function handleResize() {
      const vw = window.innerWidth * 0.95;
      const footerH = 38 + 20; // wysokość stopki + margines
      const wierszownikMinH = 140;
      const gap = 16 + 16;
      const maxH = window.innerHeight - footerH - wierszownikMinH - gap;
      const kasztaWbyH = maxH * (KASZTA_WIDTH / KASZTA_HEIGHT);
      setKasztaW(Math.min(KASZTA_WIDTH, vw, kasztaWbyH));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch('/poz.json')
      .then(res => res.json())
      .then(setLetterFields)
      .catch(() => setLetterFields([]));
  }, []);


  // DRAG START (mouse/touch na field)
  const handleFieldDragStart = async (field, e) => {
    e.preventDefault();
    const width = await getImageWidth(field.img);
    setActiveLetter({ ...field, width });
    setPickupAnim(true);
    setTimeout(() => setPickupAnim(false), 300);
    let x = 0, y = 0;
    if (e.touches && e.touches[0]) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else if (e.clientX && e.clientY) {
      x = e.clientX;
      y = e.clientY;
    }
    setGhostPos({ x, y, visible: true });
    setIsDragging(true);
  };

  // DRAG MOVE & DROP (document-level, działa na iOS)
  useEffect(() => {
    if (!isDragging) return;
    const moveGhost = (e) => {
      setGhostPos({
        x: e.clientX,
        y: e.clientY,
        visible: true
      });
    };
    const moveGhostTouch = (e) => {
      if (e.touches && e.touches[0]) {
        setGhostPos({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          visible: true
        });
      }
    };
    const handleDrop = (e) => {
      let x = 0, y = 0;
      if (e.changedTouches && e.changedTouches[0]) {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
      } else if (e.clientX && e.clientY) {
        x = e.clientX;
        y = e.clientY;
      }
      if (wierszownikRef.current) {
        const rect = wierszownikRef.current.getBoundingClientRect();
        if (
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom
        ) {
          placeLetter();
        } else {
          setActiveLetter(null);
          setGhostPos({ x: 0, y: 0, visible: false });
        }
      }
      setIsDragging(false);
    };
    document.addEventListener("mousemove", moveGhost);
    document.addEventListener("touchmove", moveGhostTouch, { passive: false });
    document.addEventListener("mouseup", handleDrop);
    document.addEventListener("touchend", handleDrop, { passive: false });
    return () => {
      document.removeEventListener("mousemove", moveGhost);
      document.removeEventListener("touchmove", moveGhostTouch);
      document.removeEventListener("mouseup", handleDrop);
      document.removeEventListener("touchend", handleDrop);
    };
    // eslint-disable-next-line
  }, [isDragging]);

  // Umieszcza literę na wierszowniku
  function placeLetter() {
    let idx = slots.lastIndexOf(null);
    if (idx === -1) idx = 0;
    const newLetter = {
      ...activeLetter,
      id: Math.random().toString(36),
      animate: true,
    };
    const updatedSlots = [...slots];
    updatedSlots[idx] = newLetter;
    setSlots(updatedSlots);
    setActiveLetter(null);
    setGhostPos({ x: 0, y: 0, visible: false });
    setIsDragging(false);
    // Remove animation flag after animation ends
    setTimeout(() => {
      setSlots((cur) => {
        const copy = [...cur];
        const s = copy[idx];
        if (s && s.id === newLetter.id) copy[idx] = { ...s, animate: false };
        return copy;
      });
    }, 300);
  }

  // Kaszta – klik/tap poza polem kaszty anuluje ghosta
  function handleKasztaBackgroundClick(e) {
    setActiveLetter(null);
    setGhostPos({ x: 0, y: 0, visible: false });
    setIsDragging(false);
  }

  // Usuwanie liter z wierszownika
  const removeLetterFromSlot = (i) => {
    const updatedSlots = [...slots];
    updatedSlots[i] = null;
    setSlots(updatedSlots);
  };


  const scale = kasztaW / KASZTA_WIDTH;
  const kasztaH = kasztaW * (KASZTA_HEIGHT / KASZTA_WIDTH);
  const lineW = kasztaW * 0.8; // WIERSZOWNIK 80% kaszty

  function renderLettersOnLine() {
    let right = 0;
    let visibleSlots = [];
    for (let i = slots.length - 1; i >= 0; i--) {
      const slot = slots[i];
      if (!slot) continue;
      right += slot.width * scale;
      visibleSlots.push(
        <div
          key={slot.id}
          style={{
            position: "absolute",
            left: lineW - right,
            top: `${16 * scale}px`,
            width: slot.width * scale,
            height: 96 * scale,
            zIndex: 3,
            cursor: "pointer",
            animation: slot.animate ? "letter-pop 0.3s ease-out forwards" : undefined
          }}
          onClick={() => removeLetterFromSlot(i)}
          title="Kliknij, aby usunąć literę z wierszownika"
        >
          <img
            src={slot.img}
            alt={slot.char}
            width={slot.width * scale}
            height={96 * scale}
            draggable={false}
            style={{ display: "block" }}
          />
        </div>
      );
    }
    return visibleSlots.reverse();
  }

  // Ghost litera
  const renderGhostLetter = () => {
    if (!activeLetter || !ghostPos.visible) return null;
    return (
      <img
        src={activeLetter.img}
        alt={activeLetter.char}
        style={{
          position: "fixed",
          left: ghostPos.x - (activeLetter.width * scale) / 2,
          top: ghostPos.y - (96 * scale),
          width: activeLetter.width * scale,
          height: 96 * scale,
          pointerEvents: "none",
          zIndex: 1000,
          opacity: 1,
          filter: "drop-shadow(2px 2px 2px #999)",
          animation: pickupAnim ? "letter-pop 0.3s ease-out forwards" : undefined
        }}
      />
    );
  };

  // --- RENDER ---
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f6f8",
        alignItems: "center",
        justifyContent: "stretch",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      {/* GŁÓWNY BLOK */}
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
        {/* Kaszta */}
        <div
          ref={kasztaRef}
          style={{
            position: "relative",
            width: kasztaW,
            height: kasztaH,
            margin: "0 auto",
            border: "0px solid #d1d5db",
            borderRadius: 8,
            overflow: "hidden",
            background: "none",
            touchAction: "none",
            flexShrink: 0
          }}
        >
          {/* Tło łapiące kliknięcie na kaszcie */}
          <div
            onClick={handleKasztaBackgroundClick}
            onTouchEnd={handleKasztaBackgroundClick}
            style={{
              position: "absolute",
              left: 0, top: 0, width: "100%", height: "100%",
              zIndex: 1, background: "transparent"
            }}
          />
          <img
            src="/assets/kaszta.png"
            alt="Kaszta zecerska"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              pointerEvents: "none"
            }}
          />
          {/* Fieldy na kaszcie – tylko drag start */}
          {letterFields.map(field => (
            <button
              key={field.char + field.x1 + field.y1 + field.x2 + field.y2}
              onMouseDown={e => handleFieldDragStart(field, e)}
              onTouchStart={e => handleFieldDragStart(field, e)}
              aria-label="Wybierz czcionkę"
              style={{
                position: "absolute",
                left: Math.min(field.x1, field.x2) * scale,
                top: Math.min(field.y1, field.y2) * scale,
                width: Math.abs(field.x2 - field.x1) * scale,
                height: Math.abs(field.y2 - field.y1) * scale,
                border: "0px solid #2563eb",
                background: "rgba(96,165,250,0.0)",
                borderRadius: "10px",
                cursor: "pointer",
                zIndex: 2,
                boxSizing: "border-box",
                outline: "none",
                userSelect: "none",
                touchAction: "none"
              }}
            />
          ))}
        </div>
        {/* Wierszownik + GUZIK PO PRAWEJ */}
        <div style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          justifyContent: "center",
          marginTop: 0
        }}>
          <div
            ref={wierszownikRef}
            style={{
              position: "relative",
              width: lineW,
              minHeight: 116 * scale,
              margin: "1px auto 0px auto",
              borderRadius: 8 * scale,
              background: "#a6a3a8",
              touchAction: "none",
              flexShrink: 0,
              boxSizing: "border-box"
            }}
          >
            <div
              style={{
                position: "absolute",
                left: -5 * scale,
                top: 96 * scale + 16 * scale,
                width: lineW + (10 * scale),
                height: 8 * scale,
                background: "#111",
                borderRadius: 8 * scale,
                zIndex: 1
              }}
            />
            <div
              style={{
                position: "absolute",
                right: -4 * scale,
                top: 0,
                width: 8 * scale,
                height: 116 * scale + 3,
                background: "#111",
                borderRadius: 8 * scale,
                zIndex: 1
              }}
            />
            {renderLettersOnLine()}
          </div>
          {/* GUZIK PRZENIESIENIA LINII */}
          <button
            style={{
              
              marginRight: 10,
              height: 30,
              width: 30,
              borderRadius: "15%",
              background: "#222",
              border: "2px solid #888",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "1px 2px 8px #0002",
              transition: "background 0.15s",
              outline: "none"
            }}
        onClick={() => {
  const line = slots.filter(Boolean);
  if (typeof onMoveLineToPage === "function") {
    onMoveLineToPage(line); // nawet jak pusty
    setSlots(Array(SLOTS_COUNT).fill(null));
  }
}}

            title="Przenieś linię na stronę"
            aria-label="Przenieś linię na stronę"
          >
            <span style={{ display: "inline-block", transform: "translateY(0px)" }}>&#8594;</span>
          </button>
        </div>
        {renderGhostLetter()}
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
        <b>ZECER</b> - gra edukacyjna dla <a href="https://mkalodz.pl" target="_blank" rel="noopener" style={{ color: "#fafafa", textDecoration: "none", transition: "color 0.45s" }}
          onMouseEnter={e => e.target.style.color = "#ff0000"} onMouseLeave={e => e.target.style.color = "#969498"}
          onTouchStart={e => e.target.style.color = "#ff0000"}
          onTouchEnd={e => e.target.style.color = "#969498"} > Muzeum Książki Artystycznej w Łodzi</a> &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;  &nbsp; &nbsp; &nbsp;  produkcja: <a href="https://peterwolf.pl" target="_blank" rel="noopener" style={{ color: "#fafafa", textDecoration: "none", transition: "color 0.45s" }}
            onMouseEnter={e => e.target.style.color = "#ff0000"}
            onMouseLeave={e => e.target.style.color = "#969498"}
            onTouchStart={e => e.target.style.color = "#ff0000"}
            onTouchEnd={e => e.target.style.color = "#969498"} >peterwolf.pl</a>
      </p>
    </div>
  );
}
