import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const OUTPUT_FILE = `gallery.json`;
const GALLERY_INPUT = `${__dirname}/public/gallery`;
const GALLERY_OUTPUT = `${__dirname}/public/${OUTPUT_FILE}`;

function processGallery({ inputSrc, outputSrc }) {
  fs.readdir(inputSrc, async function (err, allFiles) {
    if (err) {
      console.error(
        `💥 Could not parse gallery folder...`,
        err
      );
      process.exit(1);
    }

    console.log(` 📂 Processing gallery file(s)...`);

    /*
        "id": "{{item.id}}",
        "src": "/gallery/{{item.filename}}",
        "alt": "{{item.alt}}"
    */

    const galleryItems = allFiles.map(function (file, index) {
      console.log(`    👀 Checking file: ${file}`);

      const parts = path.parse(file);
      // this only works because the names are consistent
      // so don't copy this anywhere else, it's fragile
      const nameParts = parts.name.split('-');
      const id = nameParts[nameParts.length - 1]

      return {
        id,
        src: file,
        alt: nameParts.join(' '),
      };
    });

    console.log(`   💯 ${galleryItems.length} gallery items found!`);

    fs.writeFile(
      outputSrc,
      JSON.stringify(galleryItems),
      'utf8',
      function (err) {
        if (err) {
          throw err;
        }

        console.log(`    📇 ${OUTPUT_FILE} done ✅`);
      }
    );
  });
}

try {
  processGallery({
    inputSrc: GALLERY_INPUT,
    outputSrc: GALLERY_OUTPUT,
  });
} catch (e) {
  console.error('💥 The whole thing blew up!', e);
}

