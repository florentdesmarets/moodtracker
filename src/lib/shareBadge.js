import QRCode from 'qrcode'

const APP_URL = 'https://florentdesmarets.github.io/moodtracker/'

// Arrondi des coins compatible tous navigateurs
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// Texte avec retour à la ligne automatique
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' '
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, curY)
      line = words[n] + ' '
      curY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, curY)
}

// Génère le canvas et partage (ou télécharge en fallback)
export async function shareBadge({ emoji, labelFull, desc, lang }) {
  const W = 400, H = 560, DPR = 2
  const canvas = document.createElement('canvas')
  canvas.width  = W * DPR
  canvas.height = H * DPR
  const ctx = canvas.getContext('2d')
  ctx.scale(DPR, DPR)

  // ── Fond dégradé (même palette que l'app) ───────────────────────
  const bg = ctx.createLinearGradient(W * 0.6, 0, 0, H)
  bg.addColorStop(0, '#FFD07A')
  bg.addColorStop(1, '#FF8C5A')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Blobs décoratifs (comme BgBlobs)
  ;[
    { x: 340, y: 90,  r: 120, a: 0.10 },
    { x: 55,  y: 440, r: 95,  a: 0.07 },
    { x: 200, y: 530, r: 55,  a: 0.05 },
  ].forEach(({ x, y, r, a }) => {
    ctx.fillStyle = `rgba(255,255,255,${a})`
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  })

  // ── Carte blanche avec ombre ─────────────────────────────────────
  ctx.save()
  ctx.shadowColor    = 'rgba(180,60,0,0.18)'
  ctx.shadowBlur     = 40
  ctx.shadowOffsetY  = 14
  ctx.fillStyle      = 'white'
  roundRect(ctx, 28, 44, W - 56, 368, 28)
  ctx.fill()
  ctx.restore()

  // ── Bandeau "Badge débloqué" (haut de carte) ─────────────────────
  const bannerGrad = ctx.createLinearGradient(28, 0, W - 28, 0)
  bannerGrad.addColorStop(0, '#FFB347')
  bannerGrad.addColorStop(1, '#FF7040')
  ctx.fillStyle = bannerGrad
  roundRect(ctx, 28, 44, W - 56, 52, 28)
  ctx.fill()
  ctx.fillRect(28, 68, W - 56, 28)   // coins bas carrés

  ctx.font         = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle    = 'white'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(lang === 'fr' ? '🏅  Badge débloqué !' : '🏅  Badge unlocked!', W / 2, 70)

  // ── Grand emoji ──────────────────────────────────────────────────
  ctx.font         = '78px serif'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(emoji, W / 2, 200)

  // ── Nom du badge (sans l'emoji préfixe) ──────────────────────────
  const cleanLabel = labelFull.replace(/^\S+\s+/, '').trim()  // "🌱 Débutant·e" → "Débutant·e"
  ctx.font      = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#FF7040'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(cleanLabel, W / 2, 252)

  // ── Description ──────────────────────────────────────────────────
  ctx.font      = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#aaa'
  ctx.textAlign = 'center'
  wrapText(ctx, desc, W / 2, 278, 300, 20)

  // ── Séparateur ───────────────────────────────────────────────────
  ctx.strokeStyle = '#f0e8e0'
  ctx.lineWidth   = 1
  ctx.beginPath()
  ctx.moveTo(60, 330); ctx.lineTo(W - 60, 330); ctx.stroke()

  ctx.font      = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ccc'
  ctx.textAlign = 'center'
  ctx.fillText(
    lang === 'fr' ? 'Suivi émotionnel quotidien' : 'Daily emotional tracking',
    W / 2, 352
  )

  // ── QR code ──────────────────────────────────────────────────────
  const qrSize = 88
  try {
    const qrUrl = await QRCode.toDataURL(APP_URL, {
      width:  qrSize * DPR,
      margin: 1,
      color:  { dark: '#FF7040', light: '#00000000' },
    })
    const qrImg = new Image()
    await new Promise((res, rej) => { qrImg.onload = res; qrImg.onerror = rej; qrImg.src = qrUrl })

    // Fond blanc derrière le QR
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    roundRect(ctx, (W - qrSize - 20) / 2, 386, qrSize + 20, qrSize + 20, 16)
    ctx.fill()
    ctx.drawImage(qrImg, (W - qrSize) / 2, 396, qrSize, qrSize)
  } catch { /* QR optionnel */ }

  // ── Branding bas de page ─────────────────────────────────────────
  ctx.font         = 'bold 19px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle    = 'white'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('🩷 MoodTracker', W / 2, 502)

  ctx.font      = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText(
    lang === 'fr' ? 'Scanne le QR code pour rejoindre' : 'Scan the QR code to join',
    W / 2, 522
  )

  // ── Partage ou téléchargement fallback ───────────────────────────
  return new Promise(resolve => {
    canvas.toBlob(async blob => {
      if (!blob) { resolve(false); return }
      const file = new File([blob], 'badge-moodtracker.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'MoodTracker' })
          resolve(true)
        } catch (e) {
          if (e.name !== 'AbortError') downloadBlob(blob)
          resolve(false)
        }
      } else {
        downloadBlob(blob)
        resolve(true)
      }
    }, 'image/png')
  })
}

function downloadBlob(blob) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url; a.download = 'badge-moodtracker.png'
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}
