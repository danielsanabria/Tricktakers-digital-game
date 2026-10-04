const fs = require('fs');

const faviconSvg = fs.readFileSync('public/assets/logo/favicon.svg', 'utf8');
const innerPaths = faviconSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '').trim();

function makeIconSvg(size, padding) {
  const innerSize = size - padding * 2;
  const scale = (innerSize / 90).toFixed(4);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#1e293b"/>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="url(#grad)" fill-opacity="0.25"/>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#14b8a6"/>
      <stop offset="1" stop-color="#0f766e"/>
    </linearGradient>
  </defs>
  <g transform="translate(${padding + Math.round((innerSize - 77 * (innerSize / 90)) / 2)}, ${padding}) scale(${scale})">
    ${innerPaths}
  </g>
</svg>`;
}

fs.writeFileSync('public/assets/logo/icon-192.svg', makeIconSvg(192, 28));
fs.writeFileSync('public/assets/logo/icon-512.svg', makeIconSvg(512, 75));
fs.writeFileSync('public/assets/logo/apple-touch-icon.svg', makeIconSvg(180, 26));

console.log('App icons generated successfully');
