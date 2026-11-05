MOBCAST WEBSITE: ASSETS FOLDER
==============================
Every page is a single self-contained HTML file (styles and scripts are inside it). Only media lives here.

  favicon.ico, icons/            Browser tab icon (the coloured "o" from the logo) and the phone home-screen icon.
  hero-craft.mp4                 Jet clip, Customers and Contact heroes.
  hero-flow.jpg, hero-flow2.jpg  Background textures for page heroes.
  logos/                         Customer and partner logos (see logos/README.txt).
  photos/                        Product creatives, photo slots and the AI Studio time-lapse (see photos/README.txt).
  videos/                        Product videos (see videos/README.txt).
  audio/                         Voice samples for AI Studio (see audio/README.txt). No files yet.
  docs/                          Downloads, for example the security overview PDF (see docs/README.txt).
  MEDIA-GUIDE.txt                Full list of every image, video and GIF slot on every page, with sizes.

Compress video for the web first (ffmpeg), keep each clip under about 3 MB for heroes:
  ffmpeg -i in.mp4 -t 10 -an -vf "scale=1100:-2,fps=24" -c:v libx264 -crf 28 -preset slow -movflags +faststart out.mp4
Videos are not loaded on phones, with reduced motion, or on data saver.
