// The five night-market scenes. Each scene paints itself into a 560x400 picture; the same
// painter draws both panels, and `applied` (a Set of difference ids) switches the B panel's
// eight changes on. A difference is a small, fair change: a colour, a missing or extra object,
// a moved thing, a flipped word — never a whole new layout, so the two pictures stay twins.

import { FONT } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circ(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function star5(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function lantern(ctx, x, y, colour, size) {
  ctx.fillStyle = '#3a2417';
  ctx.fillRect(x - 1, y - size - 6, 2, 6);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.62, size, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.3, size * 0.92, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(x - size * 0.18, y - size * 0.2, size * 0.36, size * 0.4);
}

function bulbString(ctx, points, colours, skipIndex) {
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
  points.forEach(([x, y], i) => {
    if (i === skipIndex) return;
    ctx.fillStyle = colours[i % colours.length];
    circ(ctx, x, y + 8, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,200,0.35)';
    circ(ctx, x, y + 8, 9);
    ctx.fill();
  });
}

function smoke(ctx, x, y, n) {
  ctx.fillStyle = 'rgba(230,230,230,0.55)';
  for (let i = 0; i < n; i += 1) {
    circ(ctx, x + i * 9 - n * 4, y - i * 12, 7 + i * 1.5);
    ctx.fill();
  }
}

function nightSky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 400);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 560, 400);
}

function ground(ctx, y, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(0, y, 560, 400 - y);
}

/* ------------------------------------------------------------------ */
/* Scene 1 — Warung Sate Pakde Slamet                                  */
/* ------------------------------------------------------------------ */

function paintWarungSate(ctx, applied) {
  const b = (id) => applied.has(id);
  nightSky(ctx, '#2a1740', '#ff9a5c');
  ground(ctx, 300, '#3a2417');
  ctx.fillStyle = '#2c1a12';
  ctx.fillRect(0, 300, 560, 12);
  // String lights across the top.
  bulbString(ctx, [[10, 26], [140, 44], [280, 48], [420, 40], [550, 24]], ['#ffd76a', '#ff8fb0', '#8fd8ff'], -1);
  // Awning: red and white stripes; one stripe turns blue in the B picture.
  for (let i = 0; i < 8; i += 1) {
    ctx.fillStyle = i === 2 && b('payung-garis') ? '#4d8dff' : i % 2 === 0 ? '#d93838' : '#fff3e0';
    ctx.fillRect(60 + i * 55, 58, 55, 34);
    ctx.beginPath();
    ctx.arc(60 + i * 55 + 27, 92, 27, 0, Math.PI);
    ctx.fill();
  }
  // Hanging lanterns; the left one changes colour.
  lantern(ctx, 90, 128, b('lampion-warna') ? '#59d867' : '#ff4d4d', 18);
  lantern(ctx, 470, 122, '#ffb03a', 16);
  // Sign board with the dish and its price.
  ctx.fillStyle = '#5b3a1e';
  rr(ctx, 170, 132, 220, 62, 8);
  ctx.fill();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `bold 26px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(b('papan-terbalik') ? 'ETAS' : 'SATE', 280, 162);
  ctx.font = `bold 17px ${FONT}`;
  ctx.fillStyle = '#ffb03a';
  ctx.fillText(b('harga-ubah') ? 'AYAM  Rp18rb' : 'AYAM  Rp15rb', 280, 184);
  // Stall counter, grill and skewers; one skewer goes missing.
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(70, 258, 420, 82);
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(70, 258, 420, 10);
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(120, 232, 190, 28);
  ctx.fillStyle = '#ff7a3c';
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(150 + i * 55, 232);
    ctx.lineTo(158 + i * 55, 210);
    ctx.lineTo(166 + i * 55, 232);
    ctx.closePath();
    ctx.fill();
  }
  smoke(ctx, 340, 210, 3);
  if (b('asap-tambah')) smoke(ctx, 395, 200, 2);
  for (let i = 0; i < 5; i += 1) {
    if (i === 2 && b('sate-hilang')) continue;
    const x = 140 + i * 32;
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 226);
    ctx.lineTo(x, 244);
    ctx.stroke();
    ctx.fillStyle = '#8a5a2b';
    for (let j = 0; j < 3; j += 1) {
      circ(ctx, x, 230 + j * 5, 4);
      ctx.fill();
    }
  }
  // Bowls on the counter; one extra bowl appears.
  ctx.fillStyle = '#e8f0ff';
  ctx.beginPath();
  ctx.arc(395, 282, 13, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#ffcf5c';
  circ(ctx, 395, 278, 6);
  ctx.fill();
  if (b('mangkuk-tambah')) {
    ctx.fillStyle = '#ffd0dd';
    ctx.beginPath();
    ctx.arc(440, 282, 13, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#7be495';
    circ(ctx, 440, 278, 6);
    ctx.fill();
  }
  // The stall cat, asleep by the counter leg.
  if (!b('kucing-hilang')) {
    ctx.fillStyle = '#f2a541';
    ctx.beginPath();
    ctx.ellipse(505, 352, 22, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    circ(ctx, 522, 338, 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(516, 330);
    ctx.lineTo(519, 320);
    ctx.lineTo(523, 330);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(524, 330);
    ctx.lineTo(528, 321);
    ctx.lineTo(531, 331);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c97e1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(505, 352, 16, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
  // Peanuts scattered on the counter, plus a sauce bottle and a basket of limes.
  ctx.fillStyle = '#d9b380';
  for (const [x, y] of [[100, 268], [120, 272], [470, 270], [455, 266]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, 4, 2.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#c22e2e';
  rr(ctx, 88, 296, 16, 40, 4);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(92, 288, 8, 10);
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.ellipse(350, 330, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7be495';
  for (const [x, y] of [[338, 324], [350, 320], [362, 324]]) {
    circ(ctx, x, y, 6);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Scene 2 — Bianglala Senja (ferris wheel)                            */
/* ------------------------------------------------------------------ */

function paintBianglala(ctx, applied) {
  const b = (id) => applied.has(id);
  nightSky(ctx, '#1d2a5e', '#ff7e5f');
  // Stars; one extra star appears.
  ctx.fillStyle = '#fff';
  for (const [x, y, r] of [[40, 40, 2], [120, 90, 1.5], [200, 30, 2], [330, 55, 1.5], [520, 120, 2], [90, 150, 1.5], [450, 30, 1.5]]) {
    circ(ctx, x, y, r);
    ctx.fill();
  }
  if (b('bintang-tambah')) {
    star5(ctx, 70, 60, 7, '#ffe14d');
  }
  // The moon: full in A, a crescent in B.
  ctx.fillStyle = '#fff3c4';
  circ(ctx, 480, 55, 26);
  ctx.fill();
  if (b('bulan-fase')) {
    ctx.fillStyle = '#1d2a5e';
    circ(ctx, 492, 48, 22);
    ctx.fill();
  }
  ground(ctx, 320, '#241a2e');
  // Ticket booth with a flag and a price sign.
  ctx.fillStyle = '#8a4b2d';
  ctx.fillRect(40, 288, 150, 92);
  ctx.fillStyle = '#d93838';
  ctx.beginPath();
  ctx.moveTo(40, 288);
  ctx.lineTo(115, 258);
  ctx.lineTo(190, 288);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  rr(ctx, 55, 306, 120, 34, 5);
  ctx.fill();
  ctx.fillStyle = '#2a1600';
  ctx.font = `bold 15px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('TIKET', 115, 322);
  ctx.font = `bold 13px ${FONT}`;
  ctx.fillText(b('papan-tiket') ? 'Rp12rb' : 'Rp10rb', 115, 336);
  ctx.strokeStyle = '#c9b8e8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(115, 258);
  ctx.lineTo(115, 232);
  ctx.stroke();
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath();
  if (b('bendera-arah')) {
    ctx.moveTo(115, 232);
    ctx.lineTo(88, 240);
    ctx.lineTo(115, 248);
  } else {
    ctx.moveTo(115, 232);
    ctx.lineTo(142, 240);
    ctx.lineTo(115, 248);
  }
  ctx.closePath();
  ctx.fill();
  // Ferris wheel: rim, spokes, cabins. One spoke and one bulb go dark.
  const cx = 300;
  const cy = 185;
  const R = 125;
  ctx.strokeStyle = '#e8e0f5';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i += 1) {
    if (i === 5 && b('jeruji-hilang')) continue;
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.stroke();
  }
  // Rim bulbs; one is out in B.
  for (let i = 0; i < 12; i += 1) {
    const a = (i * Math.PI) / 6;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    ctx.fillStyle = i === 3 && b('lampu-mati') ? '#4a3a5c' : '#ffe14d';
    circ(ctx, x, y, 5);
    ctx.fill();
  }
  // Cabins around the rim.
  const cabinColours = ['#ff5d73', '#ffb03a', '#7be495', '#4d8dff', '#ff8fb0', '#59d867', '#ffd76a', '#c99aff'];
  for (let i = 0; i < 8; i += 1) {
    if (i === 0 && b('kabin-hilang')) continue;
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const x = cx + Math.cos(a) * R;
    const y = cy + Math.sin(a) * R;
    let colour = cabinColours[i];
    if (i === 2 && b('kabin-warna')) colour = '#ff7ad9';
    ctx.fillStyle = '#3a2a4a';
    ctx.fillRect(x - 3, y, 6, 14);
    ctx.fillStyle = colour;
    rr(ctx, x - 16, y + 12, 32, 22, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(x - 10, y + 18, 20, 8);
  }
  // Hub and support legs.
  ctx.fillStyle = '#ffd76a';
  circ(ctx, cx, cy, 12);
  ctx.fill();
  ctx.strokeStyle = '#e8e0f5';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 55, 380);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + 55, 380);
  ctx.stroke();
  // String lights along the ground.
  bulbString(ctx, [[210, 352], [300, 344], [390, 350], [480, 358], [545, 366]], ['#ffd76a', '#ff8fb0', '#8fd8ff'], -1);
}

/* ------------------------------------------------------------------ */
/* Scene 3 — Lorong Lampion (lantern alley)                            */
/* ------------------------------------------------------------------ */

function paintLorongLampion(ctx, applied) {
  const b = (id) => applied.has(id);
  nightSky(ctx, '#14102e', '#5b2a6e');
  // Buildings on both sides of the alley.
  ctx.fillStyle = '#241a38';
  ctx.fillRect(0, 0, 110, 400);
  ctx.fillRect(450, 0, 110, 400);
  ctx.fillStyle = '#31244d';
  ctx.fillRect(110, 60, 60, 340);
  ctx.fillRect(390, 40, 60, 360);
  // Windows; one goes dark in B.
  const windows = [[20, 90], [20, 190], [470, 110], [470, 210], [125, 130], [405, 170]];
  windows.forEach(([x, y], i) => {
    ctx.fillStyle = i === 1 && b('jendela-gelap') ? '#171226' : '#ffd76a';
    ctx.fillRect(x, y, 34, 44);
    ctx.strokeStyle = '#171226';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 34, 44);
    ctx.beginPath();
    ctx.moveTo(x + 17, y);
    ctx.lineTo(x + 17, y + 44);
    ctx.stroke();
  });
  // Roof tiles and a cat that appears on the right roof.
  ctx.fillStyle = '#1a1226';
  ctx.beginPath();
  ctx.moveTo(450, 60);
  ctx.lineTo(560, 60);
  ctx.lineTo(560, 0);
  ctx.lineTo(505, 0);
  ctx.closePath();
  ctx.fill();
  if (b('kucing-atap')) {
    ctx.fillStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.ellipse(500, 52, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    circ(ctx, 513, 42, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(508, 36);
    ctx.lineTo(510, 28);
    ctx.lineTo(514, 36);
    ctx.closePath();
    ctx.fill();
  }
  // Banner across the alley; one letter changes.
  ctx.fillStyle = '#d93838';
  ctx.fillRect(150, 26, 260, 36);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = `bold 20px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(b('spanduk-huruf') ? 'PASAR MALAN' : 'PASAR MALAM', 280, 51);
  // Lantern rows; one lantern vanishes, another changes colour.
  const row1 = [[180, 100], [280, 92], [380, 100]];
  const row2 = [[150, 170], [250, 178], [350, 170], [430, 160]];
  row1.forEach(([x, y], i) => {
    if (i === 1 && b('lampion-hilang')) return;
    lantern(ctx, x, y, i === 0 && b('lampion-warna') ? '#4d8dff' : '#ff7a3c', 20);
  });
  row2.forEach(([x, y]) => lantern(ctx, x, y, '#ff4d6d', 15));
  ctx.strokeStyle = '#1c1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(110, 78);
  ctx.lineTo(450, 78);
  ctx.moveTo(110, 152);
  ctx.lineTo(450, 152);
  ctx.stroke();
  // Paper cranes on a line; one extra crane appears.
  ctx.strokeStyle = '#c9b8e8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(170, 240);
  ctx.lineTo(390, 240);
  ctx.stroke();
  const crane = (x, y) => {
    ctx.fillStyle = '#fff3e0';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 16, y - 8);
    ctx.lineTo(x + 8, y + 6);
    ctx.lineTo(x + 20, y + 12);
    ctx.lineTo(x, y + 4);
    ctx.closePath();
    ctx.fill();
  };
  crane(210, 246);
  crane(300, 248);
  if (b('bangau-tambah')) crane(420, 244);
  // Flower pot by the left wall; it gains a flower.
  ctx.fillStyle = '#a85c2e';
  ctx.beginPath();
  ctx.moveTo(55, 330);
  ctx.lineTo(95, 330);
  ctx.lineTo(88, 368);
  ctx.lineTo(62, 368);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2f7d32';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(75, 330);
  ctx.lineTo(75, 306);
  ctx.stroke();
  ctx.fillStyle = '#ff5d73';
  circ(ctx, 75, 300, 8);
  ctx.fill();
  if (b('pot-bunga')) {
    ctx.beginPath();
    ctx.moveTo(88, 330);
    ctx.lineTo(88, 312);
    ctx.stroke();
    ctx.fillStyle = '#ffd76a';
    circ(ctx, 88, 306, 7);
    ctx.fill();
  }
  // Puddle on the stones; its lantern reflection disappears in B.
  ctx.fillStyle = '#3d2b5c';
  ctx.beginPath();
  ctx.ellipse(280, 362, 110, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!b('genangan')) {
    ctx.fillStyle = 'rgba(255,122,60,0.5)';
    ctx.beginPath();
    ctx.ellipse(250, 360, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,77,109,0.5)';
    ctx.beginPath();
    ctx.ellipse(320, 364, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Cobblestones.
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  for (let y = 300; y < 400; y += 24) {
    ctx.beginPath();
    ctx.moveTo(110, y);
    ctx.lineTo(450, y);
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/* Scene 4 — Kios Mainan Ceria (toy stall)                             */
/* ------------------------------------------------------------------ */

function paintKiosMainan(ctx, applied) {
  const b = (id) => applied.has(id);
  nightSky(ctx, '#1a2a4a', '#7a4a8a');
  ground(ctx, 300, '#33241a');
  // Balloons above the stall; one changes colour.
  const balloon = (x, y, colour) => {
    ctx.strokeStyle = '#c9b8e8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 22);
    ctx.lineTo(x + 8, y + 60);
    ctx.stroke();
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(x - 7, y - 8, 5, 8, -0.4, 0, Math.PI * 2);
    ctx.fill();
  };
  balloon(90, 70, b('balon-warna') ? '#4d8dff' : '#ff4d4d');
  balloon(160, 56, '#ffd76a');
  balloon(470, 66, '#7be495');
  // Stall frame and three shelves.
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(60, 110, 440, 14);
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(60, 110, 14, 230);
  ctx.fillRect(486, 110, 14, 230);
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(74, 124, 412, 216);
  for (const y of [180, 240, 300]) {
    ctx.fillStyle = '#a8763e';
    ctx.fillRect(74, y, 412, 10);
  }
  // Top shelf: teddies; one goes missing.
  const teddy = (x, y, colour) => {
    ctx.fillStyle = colour;
    circ(ctx, x - 10, y + 12, 8);
    ctx.fill();
    circ(ctx, x + 10, y + 12, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y + 14, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    circ(ctx, x, y, 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 9);
    ctx.lineTo(x - 6, y - 18);
    ctx.lineTo(x - 1, y - 10);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 9, y - 9);
    ctx.lineTo(x + 6, y - 18);
    ctx.lineTo(x + 1, y - 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a1600';
    circ(ctx, x - 4, y - 2, 1.8);
    ctx.fill();
    circ(ctx, x + 4, y - 2, 1.8);
    ctx.fill();
  };
  teddy(130, 150, '#b08954');
  if (!b('boneka-hilang')) teddy(210, 150, '#8a5a2b');
  teddy(290, 150, '#d9a06a');
  // Middle shelf: a doll that winks, and a kite that appears.
  ctx.fillStyle = '#ff8fb0';
  ctx.beginPath();
  ctx.ellipse(350, 214, 13, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe0b8';
  circ(ctx, 350, 190, 11);
  ctx.fill();
  ctx.fillStyle = '#2a1600';
  if (b('boneka-mata')) {
    ctx.beginPath();
    ctx.arc(346, 190, 3, Math.PI, 0);
    ctx.stroke();
    circ(ctx, 354, 190, 1.8);
    ctx.fill();
  } else {
    circ(ctx, 346, 190, 1.8);
    ctx.fill();
    circ(ctx, 354, 190, 1.8);
    ctx.fill();
  }
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath();
  ctx.arc(350, 196, 3, 0, Math.PI);
  ctx.fill();
  // Balls on the middle shelf.
  for (const [x, c] of [[130, '#ff4d4d'], [170, '#4d8dff'], [430, '#ffd76a']]) {
    ctx.fillStyle = c;
    circ(ctx, x, 222, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, 222, 14, -0.6, 0.6);
    ctx.stroke();
  }
  if (b('layang-tambah')) {
    ctx.fillStyle = '#59d867';
    ctx.beginPath();
    ctx.moveTo(472, 132);
    ctx.lineTo(492, 152);
    ctx.lineTo(472, 172);
    ctx.lineTo(452, 152);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9b8e8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(472, 172);
    ctx.lineTo(466, 196);
    ctx.stroke();
  }
  // Toy blocks on the bottom shelf.
  for (const [x, c, letter] of [[130, '#ff5d73', 'A'], [160, '#4d8dff', 'B'], [190, '#ffd76a', 'C'], [220, '#7be495', 'D']]) {
    ctx.fillStyle = c;
    ctx.fillRect(x, 268, 22, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `bold 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(letter, x + 11, 284);
  }
  // Counter: spinning tops, a box, and a price tag.
  ctx.fillStyle = '#7a4a26';
  ctx.fillRect(60, 310, 440, 40);
  const top = (x, lean) => {
    ctx.fillStyle = '#4d8dff';
    ctx.beginPath();
    ctx.moveTo(x - 12, 318);
    ctx.lineTo(x + 12, 318);
    ctx.lineTo(x + lean, 338);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#c9b8e8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + lean, 338);
    ctx.lineTo(x + lean, 344);
    ctx.stroke();
  };
  top(150, b('gasing-arah') ? -6 : 6);
  top(190, 4);
  ctx.fillStyle = '#b08954';
  rr(ctx, 330, 316, 60, 30, 4);
  ctx.fill();
  if (b('kotak-buka')) {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.moveTo(330, 316);
    ctx.lineTo(360, 296);
    ctx.lineTo(390, 316);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ff8fb0';
    circ(ctx, 360, 306, 7);
    ctx.fill();
    ctx.fillStyle = '#2a1600';
    circ(ctx, 357, 305, 1.5);
    ctx.fill();
    circ(ctx, 363, 305, 1.5);
    ctx.fill();
  }
  ctx.fillStyle = '#fff3e0';
  rr(ctx, 420, 318, 56, 22, 4);
  ctx.fill();
  ctx.fillStyle = '#2a1600';
  ctx.font = `bold 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(b('harga-tag') ? '25rb' : '20rb', 448, 333);
  // One bulb missing from the stall's light string.
  bulbString(ctx, [[80, 108], [180, 116], [280, 118], [380, 114], [480, 106]], ['#ffd76a', '#ff8fb0', '#8fd8ff'], b('lampu-hitung') ? 2 : -1);
}

/* ------------------------------------------------------------------ */
/* Scene 5 — Panggung Dangdut (stage)                                  */
/* ------------------------------------------------------------------ */

function paintPanggung(ctx, applied) {
  const b = (id) => applied.has(id);
  nightSky(ctx, '#1c0f33', '#4a1a4d');
  // Curtains on both sides.
  ctx.fillStyle = '#a02040';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(70, 0);
  ctx.lineTo(50, 400);
  ctx.lineTo(0, 400);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(560, 0);
  ctx.lineTo(490, 0);
  ctx.lineTo(510, 400);
  ctx.lineTo(560, 400);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2;
  for (let y = 20; y < 400; y += 34) {
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(58, y + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(552, y);
    ctx.lineTo(502, y + 8);
    ctx.stroke();
  }
  // Banner; one star on it goes missing.
  ctx.fillStyle = '#ffd76a';
  rr(ctx, 150, 22, 260, 44, 8);
  ctx.fill();
  ctx.fillStyle = '#7a1030';
  ctx.font = `bold 24px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('DANGDUT', 280, 52);
  star5(ctx, 170, 44, 9, '#a02040');
  if (!b('bintang-spanduk')) star5(ctx, 390, 44, 9, '#a02040');
  // Spotlights: beams from the top corners; the left beam changes colour.
  const beam = (x, colour) => {
    ctx.fillStyle = colour;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(x, 70);
    ctx.lineTo(x - 60, 320);
    ctx.lineTo(x + 60, 320);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff3e0';
    circ(ctx, x, 74, 10);
    ctx.fill();
  };
  beam(150, b('lampu-sorot') ? 'rgba(123,228,149,0.9)' : 'rgba(255,93,115,0.9)');
  beam(410, 'rgba(255,209,118,0.9)');
  // Stage floor.
  ctx.fillStyle = '#4a2c1a';
  ctx.fillRect(60, 300, 440, 100);
  ctx.fillStyle = '#5b3a1e';
  ctx.fillRect(60, 300, 440, 8);
  // Drum kit on the left; the floor tom disappears in B.
  ctx.fillStyle = '#c9b8e8';
  ctx.beginPath();
  ctx.arc(130, 250, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ff5d73';
  ctx.beginPath();
  ctx.arc(130, 250, 26, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  circ(ctx, 130, 250, 20);
  ctx.fill();
  if (!b('drum-hilang')) {
    ctx.fillStyle = '#4d8dff';
    rr(ctx, 92, 272, 34, 30, 5);
    ctx.fill();
    ctx.fillStyle = '#e8f0ff';
    ctx.fillRect(92, 272, 34, 6);
  }
  ctx.strokeStyle = '#c9b8e8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(118, 236);
  ctx.lineTo(104, 214);
  ctx.moveTo(142, 236);
  ctx.lineTo(156, 214);
  ctx.stroke();
  // Singer in the middle with a microphone that changes colour.
  ctx.fillStyle = '#ff8fb0';
  ctx.beginPath();
  ctx.ellipse(280, 250, 26, 44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe0b8';
  circ(ctx, 280, 190, 16);
  ctx.fill();
  ctx.fillStyle = '#2a1600';
  ctx.beginPath();
  ctx.arc(280, 182, 17, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#ffe0b8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(296, 232);
  ctx.lineTo(312, 206);
  ctx.stroke();
  ctx.fillStyle = b('mic-warna') ? '#ffd76a' : '#c9c9c9';
  circ(ctx, 314, 200, 8);
  ctx.fill();
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(308, 197 + i * 3);
    ctx.lineTo(320, 197 + i * 3);
    ctx.stroke();
  }
  // Guitarist on the right; the guitar loses strings in B.
  ctx.fillStyle = '#7be495';
  ctx.beginPath();
  ctx.ellipse(410, 252, 24, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffe0b8';
  circ(ctx, 410, 196, 15);
  ctx.fill();
  ctx.fillStyle = '#2a1600';
  ctx.beginPath();
  ctx.arc(410, 188, 16, Math.PI, 0);
  ctx.fill();
  // The dancer's arm: up in A, down in B.
  ctx.strokeStyle = '#ffe0b8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(432, 232);
  if (b('pose-penari')) ctx.lineTo(448, 268);
  else ctx.lineTo(446, 196);
  ctx.stroke();
  // Guitar body and strings.
  ctx.fillStyle = '#b08954';
  ctx.beginPath();
  ctx.ellipse(428, 262, 20, 26, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a1600';
  circ(ctx, 428, 262, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1;
  const strings = b('gitar-senar') ? 4 : 6;
  for (let i = 0; i < strings; i += 1) {
    ctx.beginPath();
    ctx.moveTo(418 + i * 3, 240);
    ctx.lineTo(436 + i * 2, 288);
    ctx.stroke();
  }
  // Speakers; one extra speaker appears.
  const speaker = (x) => {
    ctx.fillStyle = '#2b2b2b';
    rr(ctx, x, 296, 44, 84, 5);
    ctx.fill();
    ctx.fillStyle = '#444';
    circ(ctx, x + 22, 322, 13);
    ctx.fill();
    circ(ctx, x + 22, 356, 8);
    ctx.fill();
  };
  speaker(64);
  if (b('speaker-tambah')) speaker(452);
  // The crowd's raised hands; one more hand joins in B.
  ctx.fillStyle = '#ffe0b8';
  for (const [x, y] of [[120, 372], [170, 380], [330, 378], [380, 372], [440, 380]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, 7, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (b('tangan-penonton')) {
    ctx.beginPath();
    ctx.ellipse(240, 366, 7, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* The scene table: name, painter, and the eight differences each.     */
/* ------------------------------------------------------------------ */

export const SCENES = [
  {
    name: 'Warung Sate Pakde Slamet',
    paint: paintWarungSate,
    diffs: [
      { id: 'lampion-warna', label: 'Lampion berubah warna', x: 90, y: 128, r: 30 },
      { id: 'sate-hilang', label: 'Satu tusuk sate hilang', x: 300, y: 236, r: 28 },
      { id: 'mangkuk-tambah', label: 'Mangkuk tambahan', x: 440, y: 282, r: 28 },
      { id: 'papan-terbalik', label: 'Tulisan papan terbalik', x: 280, y: 156, r: 32 },
      { id: 'kucing-hilang', label: 'Kucingnya hilang', x: 505, y: 348, r: 30 },
      { id: 'asap-tambah', label: 'Asap tambahan', x: 398, y: 196, r: 26 },
      { id: 'harga-ubah', label: 'Harga berubah', x: 250, y: 178, r: 26 },
      { id: 'payung-garis', label: 'Garis payung berubah warna', x: 198, y: 76, r: 26 },
    ],
  },
  {
    name: 'Bianglala Senja',
    paint: paintBianglala,
    diffs: [
      { id: 'kabin-hilang', label: 'Kabin paling atas hilang', x: 300, y: 72, r: 30 },
      { id: 'kabin-warna', label: 'Kabin berubah warna', x: 425, y: 197, r: 30 },
      { id: 'bintang-tambah', label: 'Bintang tambahan', x: 70, y: 60, r: 26 },
      { id: 'bulan-fase', label: 'Bulan jadi sabit', x: 480, y: 55, r: 30 },
      { id: 'bendera-arah', label: 'Bendera berbalik arah', x: 115, y: 240, r: 26 },
      { id: 'lampu-mati', label: 'Satu lampu mati', x: 380, y: 92, r: 24 },
      { id: 'papan-tiket', label: 'Harga tiket berubah', x: 115, y: 328, r: 26 },
      { id: 'jeruji-hilang', label: 'Satu jeruji hilang', x: 232, y: 118, r: 26 },
    ],
  },
  {
    name: 'Lorong Lampion',
    paint: paintLorongLampion,
    diffs: [
      { id: 'lampion-hilang', label: 'Satu lampion hilang', x: 280, y: 92, r: 30 },
      { id: 'lampion-warna', label: 'Lampion berubah warna', x: 180, y: 100, r: 28 },
      { id: 'bangau-tambah', label: 'Bangau kertas tambahan', x: 420, y: 248, r: 26 },
      { id: 'jendela-gelap', label: 'Jendela jadi gelap', x: 37, y: 212, r: 26 },
      { id: 'kucing-atap', label: 'Kucing muncul di atap', x: 500, y: 46, r: 26 },
      { id: 'spanduk-huruf', label: 'Satu huruf spanduk berubah', x: 280, y: 44, r: 30 },
      { id: 'genangan', label: 'Pantulan genangan hilang', x: 280, y: 362, r: 30 },
      { id: 'pot-bunga', label: 'Bunga tambahan di pot', x: 88, y: 310, r: 26 },
    ],
  },
  {
    name: 'Kios Mainan Ceria',
    paint: paintKiosMainan,
    diffs: [
      { id: 'balon-warna', label: 'Balon berubah warna', x: 90, y: 70, r: 30 },
      { id: 'boneka-hilang', label: 'Satu boneka hilang', x: 210, y: 160, r: 30 },
      { id: 'layang-tambah', label: 'Layang-layang tambahan', x: 470, y: 155, r: 28 },
      { id: 'boneka-mata', label: 'Boneka mengedip', x: 350, y: 190, r: 26 },
      { id: 'harga-tag', label: 'Harga mainan berubah', x: 448, y: 329, r: 26 },
      { id: 'gasing-arah', label: 'Gasing miring ke arah lain', x: 150, y: 330, r: 26 },
      { id: 'kotak-buka', label: 'Kotak terbuka', x: 360, y: 306, r: 28 },
      { id: 'lampu-hitung', label: 'Satu lampu hilang', x: 280, y: 124, r: 24 },
    ],
  },
  {
    name: 'Panggung Dangdut',
    paint: paintPanggung,
    diffs: [
      { id: 'lampu-sorot', label: 'Sorotan berubah warna', x: 150, y: 90, r: 30 },
      { id: 'drum-hilang', label: 'Drum hilang', x: 109, y: 287, r: 28 },
      { id: 'speaker-tambah', label: 'Speaker tambahan', x: 474, y: 338, r: 28 },
      { id: 'mic-warna', label: 'Mikrofon berubah warna', x: 314, y: 200, r: 26 },
      { id: 'bintang-spanduk', label: 'Bintang spanduk hilang', x: 390, y: 44, r: 26 },
      { id: 'pose-penari', label: 'Lengan penari turun', x: 440, y: 220, r: 28 },
      { id: 'gitar-senar', label: 'Senar gitar berkurang', x: 428, y: 262, r: 26 },
      { id: 'tangan-penonton', label: 'Tangan penonton tambahan', x: 240, y: 372, r: 26 },
    ],
  },
];
