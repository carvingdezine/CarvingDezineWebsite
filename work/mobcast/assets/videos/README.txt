MOBCAST VIDEOS
==============
Drop files here with the exact names below. The Customers page picks them up
automatically, no code change needed.

sud-life-amitabh-kumar.mp4   Portrait video testimonial (Mr Amitabh Kumar, SUD Life)
                             Poster image: assets/photos/video-1.jpg

The original file is 142 MB, which is too heavy for a web page.
Compress it first (about 10-15 MB, 720p, captions stay burned in):

  ffmpeg -i "Mr Amitabh Kumar - SUD Life. Client testimonial - 1 (with captions).mp4" \
    -vf "scale=-2:1280" -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k \
    -movflags +faststart sud-life-amitabh-kumar.mp4

The landscape video is a YouTube link (Tmi8D4tXKGE) and needs no file.
It plays inline on http(s) and opens YouTube in a new tab when viewed from file://.
