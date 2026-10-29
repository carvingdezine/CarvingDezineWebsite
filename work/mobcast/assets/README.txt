Hero videos for customers.html and contact.html
================================================
Put these four files in this folder (same names):

  hero-bg.mp4      hero-bg.webm      background loop (space / galaxies)
  hero-craft.mp4   hero-craft.webm   aircraft / shuttle clip

Source clips (Pixabay Content License):
  Background: https://pixabay.com/videos/space-travel-nasa-galaxies-5/
  Aircraft:   https://pixabay.com/videos/space-shuttle-rocket-launch-nasa-23882/
Note: the Pixabay pages say commercial use of NASA footage may require permission from NASA.

Compress them for the web first (ffmpeg). Keep each clip under about 3 MB:

  ffmpeg -i in-bg.mp4 -t 12 -an -vf "scale=1600:-2,fps=24" -c:v libx264 -crf 29 -preset slow -movflags +faststart hero-bg.mp4
  ffmpeg -i in-bg.mp4 -t 12 -an -vf "scale=1600:-2,fps=24" -c:v libvpx-vp9 -crf 36 -b:v 0 hero-bg.webm

  ffmpeg -i in-craft.mp4 -t 10 -an -vf "scale=1100:-2,fps=24" -c:v libx264 -crf 28 -preset slow -movflags +faststart hero-craft.mp4
  ffmpeg -i in-craft.mp4 -t 10 -an -vf "scale=1100:-2,fps=24" -c:v libvpx-vp9 -crf 35 -b:v 0 hero-craft.webm

Until the files exist, the pages show the built-in light-trail animation instead.
Videos are not loaded on phones, with reduced-motion, or on data-saver.
