# Binary Search For Horizontal Scrolling

## Problem Statement

Horizontal scrolling content is common on mobile. "Sliders" are similarly a common web pattern for desktop designs. Modern tablets (iPads et all) often render a desktop layout but limit interaction with the page to the desktop paradigm. I'm looking for a way to render one component that works for both desktop and mobile, supporting touchscreen scrolling along with buttons that you can use to navigate an arbitrary list of elements.

### Why is this still a problem?

Most paginated sliders need to know the exact width of all child content so that pages can be pre-measured. That usually means uniform sizes, and disabling native scrolling so that the slider can't get into an "unknown" state.

### How does this solution solve for that problem?

By registering the width and offset of all child elements, we can do "just in time" evaluation to determine what's actually on the screen *now*, and then jump to the next offscreen elements. Doing this effectively means making that evaluation *fast*, so we've implimented a binary search to find elements that fit within the boundary of the current viewport.

### Bro, that sounds complicated

Yeah it is! I've never been happy with prior solutions and I had some time to think this problem through so I decided to go for it. I'm not sure that this could be repackaged into a usable third-party module, but maybe looking at the implimentation details put forth here will give you some ideas to do this kind of thing for yourself. 😅

## Running the Demo

Clone/fork this repo, then:

`npm i && npm run dev`

This demo just uses `vite`, so setup was quick and it should be likewise easy for you to run it yourself and test things out!

If you'd like to change the images available in the demo, you can place them in `public/gallery` and run `node ./bin/createGallery.js` which will rebuild `public/gallery.json`.

*Important note:* filenames should follow a `<name>-<id>.<ext>` naming convention or the script will break 🙃 (I just wrote it for myself so it's brittle, be gentle hahaha).

Hope this helps!

