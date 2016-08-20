# Browsercat
A recreation of Monstercat's 2014 to early 2016 visual style in-browser.

This project is one year old, but I decided to post it here as some of the things I have accomplished may help someone. 
Contributions are welcome.

All important functionality happens in **js/mnstr_visualizer.js**

# Known Bugs
- Some pictures do not work. Possibly filesize too large for base64 encoding.
- Firefox (And possibly other non-chromium browsers) does not support more than 2048 samples as the FFT Size. We need a lot to zoom in, but could possibly make up for it using some math and scaling it.
- Losing focus in some browsers while the song is being analyzed and loaded may cause the analyser to get confused and make the song return false values.
- Chrome has seemed to have lost performace on this app over time.
- Sometimes no picture still causes the photo slot to spin and think there is one.
- Checking for Featured Artists is incomplete.
- Sometimes looping may not work correctly.

# Live Demo
I have a live demo on my site, here: http://monstercat.zenny3d.com/
