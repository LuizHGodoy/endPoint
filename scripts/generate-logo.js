const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const size = 512; // Tamanho base da imagem
const padding = 64; // Espaço ao redor do texto
const backgroundColor = { r: 0, g: 0, b: 0, alpha: 1 }; // Preto
const textColor = { r: 255, g: 255, b: 255, alpha: 1 }; // Branco

// Criar um SVG com o texto estilizado
const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <circle 
    cx="${size / 2}" 
    cy="${size / 2}" 
    r="${size / 2}"
    fill="rgb(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b})"
  />
  <g transform="translate(${size / 2}, ${size / 2}) scale(0.25)">
    <!-- E -->
    <path
      d="M-400,-250 
         L-100,-250
         L-100,-190
         L-340,-190
         L-340,-30
         L-120,-30
         L-120,30
         L-340,30
         L-340,190
         L-100,190
         L-100,250
         L-400,250
         Z"
      fill="rgb(${textColor.r},${textColor.g},${textColor.b})"
    />
    <!-- P -->
    <path
      d="M0,-250
         L300,-250
         L400,-150
         L400,0
         L300,100
         L60,100
         L60,250
         L0,250
         Z
         M60,-190
         L60,40
         L300,40
         L340,-40
         L340,-190
         Z"
      fill="rgb(${textColor.r},${textColor.g},${textColor.b})"
    />
  </g>
</svg>`;

// Caminho para salvar a logo
const outputPath = path.join(__dirname, "..", "public", "logo.png");

// Gerar a imagem PNG
sharp(Buffer.from(svg))
  .resize(size, size)
  .png()
  .toFile(outputPath)
  .then(() => {
    console.log("Logo gerada com sucesso!");
    // Executar o script de geração de ícones
    require("./generate-icons.js");
  })
  .catch((err) => {
    console.error("Erro ao gerar a logo:", err);
    process.exit(1);
  });
