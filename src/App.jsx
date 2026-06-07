import { useState } from 'react'

// ─── API alap URL ───────────────────────────────────────────────────────────
const API = 'https://deckofcardsapi.com/api/deck'

// Kis várakozás – a dealer húzások közt jól jön
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Kiszámolja a kéz összértékét Blackjack szerint ─────────────────────────
// Képes lapok (J, Q, K) = 10
// Ász = 11, de ha bust lenne, akkor 1
function getScore(cards) {
  let total = 0
  let aces = 0

  for (const c of cards) {
    if (['KING', 'QUEEN', 'JACK'].includes(c.value)) {
      total += 10
    } else if (c.value === 'ACE') {
      total += 11
      aces++
    } else {
      total += parseInt(c.value)
    }
  }

  // Ha 21 fölé mentünk, az ászokat vonjuk le 10-zel
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }

  return total
}

// ─── Fő komponens ────────────────────────────────────────────────────────────
export default function App() {
  const [deckId, setDeckId] = useState(null)       // a pakli azonosítója az API-ban
  const [player, setPlayer] = useState([])          // játékos lapjai
  const [dealer, setDealer] = useState([])          // dealer lapjai
  const [hidden, setHidden] = useState(true)        // a dealer második lapja takart-e
  const [phase, setPhase] = useState('idle')        // idle | playing | thinking | ended
  const [result, setResult] = useState('')          // eredmény szöveg
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 }) // győzelem/vereség/döntetlen

  // ── Új játék indítása ─────────────────────────────────────────────────────
  const newGame = async () => {
    setPhase('thinking')
    setResult('')

    let id = deckId

    if (!id) {
      // Első indítás: 6 paklis deck létrehozása (klasszikus blackjack)
      const res = await fetch(`${API}/new/shuffle/?deck_count=6`)
      const data = await res.json()
      id = data.deck_id
      setDeckId(id)
    } else {
      // Már van deck, csak újrakeverjük
      await fetch(`${API}/${id}/shuffle/`)
    }

    // 4 lapot húzunk egyszerre: játékos, dealer, játékos, dealer
    const res = await fetch(`${API}/${id}/draw/?count=4`)
    const { cards } = await res.json()

    setPlayer([cards[0], cards[2]])  // 1. és 3. lap a játékosnak
    setDealer([cards[1], cards[3]])  // 2. és 4. lap a dealernek (4. rejtett)
    setHidden(true)
    setPhase('playing')
  }

  // ── Hit: a játékos lapot kér ──────────────────────────────────────────────
  const hit = async () => {
    setPhase('thinking')

    const res = await fetch(`${API}/${deckId}/draw/?count=1`)
    const { cards } = await res.json()

    const next = [...player, cards[0]]
    setPlayer(next)

    if (getScore(next) > 21) {
      // Bust: túlléptük a 21-et → veszítettünk
      setHidden(false)
      endGame(next, dealer, 'bust')
    } else {
      setPhase('playing')
    }
  }

  // ── Stand: a játékos megáll, a dealer húz ─────────────────────────────────
  const stand = async () => {
    setHidden(false)  // a rejtett lap felfedése
    setPhase('thinking')

    let d = [...dealer]

    // A dealer addig húz, amíg el nem éri a 17-et (klasszikus szabály)
    while (getScore(d) < 17) {
      await sleep(700)  // kis késleltetés, hogy látható legyen a húzás
      const res = await fetch(`${API}/${deckId}/draw/?count=1`)
      const { cards } = await res.json()
      d = [...d, cards[0]]
      setDealer([...d])  // UI frissítése minden új lapnál
    }

    endGame(player, d)
  }

  // ── Eredmény meghatározása ────────────────────────────────────────────────
  const endGame = (p, d, why) => {
    const ps = getScore(p)
    const ds = getScore(d)
    let msg, key

    if (why === 'bust')  { msg = `Bust! (${ps}) — Veszítettél 😢`;  key = 'l' }
    else if (ds > 21)    { msg = `Dealer bust! — Nyertél! 🎉`;       key = 'w' }
    else if (ps > ds)    { msg = `${ps} vs ${ds} — Nyertél! 🎉`;     key = 'w' }
    else if (ds > ps)    { msg = `${ps} vs ${ds} — Veszítettél 😢`;  key = 'l' }
    else                 { msg = `${ps} vs ${ds} — Döntetlen 🤝`;    key = 'd' }

    setResult(msg)
    setScore((s) => ({ ...s, [key]: s[key] + 1 }))
    setPhase('ended')
  }

  // ── Aktuális pontszámok ───────────────────────────────────────────────────
  const ps = getScore(player)
  const ds = getScore(dealer)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">

      {/* Statisztika */}
      <div className="scoreboard">
        <span className="win">✓ {score.w}</span>
        <span className="draw">= {score.d}</span>
        <span className="lose">✗ {score.l}</span>
      </div>

      <h1>♠ Blackjack ♥</h1>

      {/* Dealer keze */}
      <section className="hand">
        <p className="label">DEALER{!hidden ? ` — ${ds}` : ''}</p>
        <div className="cards">
          {dealer.map((c, i) => (
            <img
              key={c.code}
              src={
                hidden && i === 1
                  ? 'https://deckofcardsapi.com/static/img/back.png'
                  : c.image
              }
              alt={c.code}
              className="card"
            />
          ))}
          {dealer.length === 0 && <div className="placeholder" />}
        </div>
      </section>

      <hr className="divider" />

      {/* Játékos keze */}
      <section className="hand">
        <p className="label">TE{player.length > 0 ? ` — ${ps}` : ''}</p>
        <div className="cards">
          {player.map((c) => (
            <img key={c.code} src={c.image} alt={c.code} className="card" />
          ))}
          {player.length === 0 && <div className="placeholder" />}
        </div>
      </section>

      {/* Eredmény */}
      {result && <p className="result">{result}</p>}

      {/* Gombok */}
      <div className="controls">
        {(phase === 'idle' || phase === 'ended') && (
          <button onClick={newGame}>
            {phase === 'idle' ? '🃏 Játék indítása' : '↩ Új kör'}
          </button>
        )}
        {phase === 'playing' && (
          <>
            <button onClick={hit}>Hit</button>
            <button onClick={stand} className="stand-btn">Stand</button>
          </>
        )}
        {phase === 'thinking' && <p className="dots">• • •</p>}
      </div>

    </div>
  )
}
