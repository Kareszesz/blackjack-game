# ♠ Blackjack ♥

Egyszerű Blackjack játék **React** + **Vite** segítségével, a [Deck of Cards API](https://deckofcardsapi.com/) felhasználásával.

## Játékszabályok

- A cél minél közelebb kerülni **21**-hez, anélkül, hogy átlépjük.
- **Hit** – új lapot kérünk a decktől.
- **Stand** – megállunk; a dealer felfedi a rejtett lapját és húz, amíg el nem éri a **17**-et.
- Ha 21-et lépsz túl → **bust**, automatikusan veszítettél.
- Az ász értéke **11**, vagy **1**, ha bust lenne.
- Képes lapok (J, Q, K) értéke **10**.

## Technológiák

| Csomag | Mire jó |
|--------|---------|
| React 18 | UI / állapotkezelés |
| Vite 5 | dev szerver, build |
| Deck of Cards API | kártyapakli, húzás |

## Futtatás

```bash
npm install
npm run dev
```

Ezután nyisd meg: [http://localhost:5173](http://localhost:5173)

## Projekt struktúra

```
blackjack-game/
├── index.html          # belépési pont
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx        # React app mountolása
    ├── App.jsx         # játéklogika + UI
    └── App.css         # stílusok
```

## API hívások összefoglalója

| Hívás | Mit csinál |
|-------|-----------|
| `GET /api/deck/new/shuffle/?deck_count=6` | Létrehoz és összekever 6 paklit |
| `GET /api/deck/:id/shuffle/` | Újrakeveri a paklit |
| `GET /api/deck/:id/draw/?count=4` | 4 lapot húz |

---

Készítette: [a neved] · 2025
