import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const searchUrl = "https://imgflip.com/memesearch?q=cat&nsfw=on";

async function main() {
  // 1. Récupérer la page de recherche
  const res = await fetch(searchUrl);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) throw new Error("Impossible de parser la page");

  // 2. Récupérer tous les liens de mèmes
  const memeLinks = [];
  doc.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("/meme/")) {
      const fullLink = "https://imgflip.com" + href;
      if (!memeLinks.includes(fullLink)) memeLinks.push(fullLink);
    }
  });

  console.log(`Nombre de mèmes trouvés: ${memeLinks.length}`);

  // 3. Pour chaque lien, récupérer le titre et les images Blank Meme Template
  const memes = [];

  for (const link of memeLinks) {
    try {
      const resMeme = await fetch(link);
      const htmlMeme = await resMeme.text();
      const docMeme = new DOMParser().parseFromString(htmlMeme, "text/html");
      if (!docMeme) continue;

      // Titre de la page
      const titleEl = docMeme.querySelector("title");
      const title = titleEl ? titleEl.textContent.split(" - ")[0].trim() : "Unknown";

      // Récupérer toutes les images dans <a class="meme-link"> contenant "Blank Meme Template"
      const blankImgs = [];
      docMeme.querySelectorAll("a.meme-link").forEach((a) => {
        const titleAttr = a.getAttribute("title");
        if (titleAttr && titleAttr.includes("Blank Meme Template")) {
          const imgEl = a.querySelector("img");
          if (imgEl) {
            let src = imgEl.getAttribute("src");
            if (src) {
              if (src.startsWith("//")) src = "https:" + src;
              blankImgs.push(src);
            }
          }
        }
      });

       // Si pas d'images, chercher des vidéos
      if (blankImgs.length === 0) {
        const source = docMeme.querySelector("video source");
        if (source) {
          let src = source.getAttribute("src");
          if (src) {
            if (src.startsWith("//")) src = "https:" + src;
            blankImgs.push(src);
          }
        }
      }


      memes.push({ title, memeUrl: link, blankImgs });
      console.log(`Traitement: ${title} => ${blankImgs.length} image(s) trouvée(s)`);
    } catch (err) {
      console.error("Erreur sur le lien", link, err);
    }
  }

  console.log("\n--- Résultat final ---");
  console.log(memes);
  console.log(`Total mèmes traités: ${memes.length}`);
}

main();