const sharp = require("sharp");
const fs = require("node:fs");
const path = require("node:path");

const LOGO_PATH = path.join(__dirname, "..", "public", "logo.png");
const PUBLIC_DIR = path.join(__dirname, "..", "public");

const ICONS = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

const MANIFEST = {
  name: "endPoint - API Testing Tool",
  short_name: "endPoint",
  icons: [
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
  theme_color: "#000000",
  background_color: "#000000",
  display: "standalone",
};

async function generateIcons() {
  if (!fs.existsSync(LOGO_PATH)) {
    console.error(
      "Logo file not found! Please place a logo.png file in the public directory."
    );
    process.exit(1);
  }

  try {
    for (const icon of ICONS) {
      await sharp(LOGO_PATH)
        .resize(icon.size, icon.size, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(PUBLIC_DIR, icon.name));

      console.log(`Generated ${icon.name}`);
    }

    fs.copyFileSync(
      path.join(PUBLIC_DIR, "favicon-32x32.png"),
      path.join(PUBLIC_DIR, "favicon.ico")
    );
    console.log("Generated favicon.ico");

    fs.writeFileSync(
      path.join(PUBLIC_DIR, "site.webmanifest"),
      JSON.stringify(MANIFEST, null, 2)
    );

    console.log("Generated site.webmanifest");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

generateIcons();
