const sharp = require("sharp");
const fs = require("fs");

async function convertSvgToPng() {
    try {
        // Convert SVG to PNG with 32x32 size
        await sharp("public/favicon-round.svg")
            .resize(32, 32)
            .png()
            .toFile("public/favicon.png");

        console.log("Favicon PNG créé avec succès!");

        // Also create a 16x16 version
        await sharp("public/favicon-round.svg")
            .resize(16, 16)
            .png()
            .toFile("public/favicon-16.png");

        console.log("Favicon 16x16 créé avec succès!");
    } catch (error) {
        console.error("Erreur lors de la conversion:", error);
    }
}

convertSvgToPng();
