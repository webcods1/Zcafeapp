Place your generated PWA icons and iOS splash images in this folder.

Required filenames (used by manifest and index.html):

- icon-192.png   (192x192)
- icon-512.png   (512x512)

Suggested iOS splash images (add if you want full-screen splash on iOS):
- apple-splash-640x1136.png
- apple-splash-750x1334.png
- apple-splash-1125x2436.png
- apple-splash-1242x2208.png
- apple-splash-1242x2688.png
- apple-splash-828x1792.png

You can generate icons and splash images using: https://realfavicongenerator.net/ or https://app-manifest.firebaseapp.com/

After adding the images, commit and redeploy. Vite PWA or the service worker will pick up `/icons/*` files.