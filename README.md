# Browsercat
A recreation of Monstercat's 2014 to early 2016 visual style in-browser.

This project is one year old, but I decided to post it here as some of the things I have accomplished may help someone. 
Contributions are welcome.

All important functionality happens in **js/mnstr_visualizer.js**

# Known Bugs
- Some pictures do not work. Possibly filesize too large for base64 encoding.
- Firefox (And possibly other non-chromium browsers) do not support more than 2048 samples as the FFT Size. We need a lot to zoom in.
- Losing focus in some browsers while the song is being analyzed and loaded may cause the analyser to get confused and make the song return false values.
- Chrome has seemed to have lost performace on this app over time.

# Live Demo
I have a live demo on my site, here: http://monstercat.zenny3d.com/
