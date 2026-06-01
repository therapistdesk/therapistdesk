// src/utils/colors.js

const COLORS = [
  "#E3F2FD", // blue
  "#E8F5E9", // green
  "#FFF3E0", // orange
  "#F3E5F5", // purple
  "#E0F7FA", // cyan
  "#FCE4EC", // pink
];

// стабилен цвят на база ID
export function getClientColor(clientId) {
  const index = clientId % COLORS.length;
  return COLORS[index];
}

// малко по-тъмен нюанс (за border/accent)
export function darkenColor(hex, amount = 0.2) {
  const num = parseInt(hex.replace("#", ""), 16);

  let r = (num >> 16) - 255 * amount;
  let g = ((num >> 8) & 0x00ff) - 255 * amount;
  let b = (num & 0x0000ff) - 255 * amount;

  r = Math.max(0, Math.min(255, Math.round(r)));
  g = Math.max(0, Math.min(255, Math.round(g)));
  b = Math.max(0, Math.min(255, Math.round(b)));

  return `rgb(${r}, ${g}, ${b})`;
}