const fs = require('fs').promises;
const path = require('path');
const exifParser = require('exif-parser');

const photoDir = path.join(__dirname, 'images', 'wedding website');
const outputFile = path.join(__dirname, 'official-photos.json');

async function generatePhotoList() {
  console.log(`Scanning directory: ${photoDir}`);
  let photoData = [];

  try {
    const files = await fs.readdir(photoDir);
    console.log(`Found ${files.length} files.`);

    for (const file of files) {
      const filePath = path.join(photoDir, file);
      const fileExt = path.extname(file).toLowerCase();

      // Process only JPG/JPEG/PNG files (EXIF is typically in these)
      if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
        try {
          const buffer = await fs.readFile(filePath);
          const parser = exifParser.create(buffer);
          const result = parser.parse();

          let dateTaken = null;
          // EXIF date fields: DateTimeOriginal (36867) or CreateDate (36868)
          // The parser returns these as seconds since epoch
          if (result.tags && (result.tags.DateTimeOriginal || result.tags.CreateDate)) {
            const epochSeconds = result.tags.DateTimeOriginal || result.tags.CreateDate;
            dateTaken = new Date(epochSeconds * 1000); // Convert seconds to milliseconds
          } else {
             console.warn(`WARN: No EXIF date found for ${file}.`);
          }

          // Use relative path for the website
          const relativePath = path.join('images', 'wedding website', file).replace(/\\/g, '/');

          photoData.push({
            url: relativePath,
            caption: '', // Placeholder for caption
            date: dateTaken // Store Date object or null
          });

        } catch (err) {
          console.error(`Error processing file ${file}: ${err.message}`);
          // Still add the photo even if EXIF fails, but without a date
           const relativePath = path.join('images', 'wedding website', file).replace(/\\/g, '/');
           photoData.push({ url: relativePath, caption: '', date: null });
        }
      } else {
         // console.log(`Skipping non-image file: ${file}`);
      }
    }

    // Sort photos by date (ascending). Photos without dates go to the end.
    photoData.sort((a, b) => {
      if (a.date && b.date) {
        return a.date - b.date; // Sort by date if both exist
      } else if (a.date) {
        return -1; // a has date, b doesn't -> a comes first
      } else if (b.date) {
        return 1; // b has date, a doesn't -> b comes first
      } else {
        // Neither has a date, sort by filename as fallback
        return a.url.localeCompare(b.url);
      }
    });

    // We only need url and caption in the final JSON for the website
    const outputData = photoData.map(p => ({ url: p.url, caption: p.caption }));

    await fs.writeFile(outputFile, JSON.stringify(outputData, null, 2));
    console.log(`Successfully generated sorted photo list: ${outputFile}`);

  } catch (err) {
    console.error(`Error generating photo list: ${err}`);
  }
}

generatePhotoList();