# Daily homepage hero workflow

The homepage hero can use manually generated ChatGPT artwork without calling an image API.

## Manual poster folder

Place generated images in:

```text
public/worldcup-assets/home/manual/
```

Supported file names, checked in this order:

```text
YYYY-MM-DD-match-MATCH_ID.png
YYYY-MM-DD-match-MATCH_ID.jpg
YYYY-MM-DD-match-MATCH_ID.jpeg
YYYY-MM-DD-match-MATCH_ID.webp
match-MATCH_ID.png
match-MATCH_ID.jpg
match-MATCH_ID.jpeg
match-MATCH_ID.webp
YYYY-MM-DD.png
YYYY-MM-DD.jpg
YYYY-MM-DD.jpeg
YYYY-MM-DD.webp
```

Example:

```text
public/worldcup-assets/home/manual/2026-06-13-match-7.png
```

## Generate the active hero

Run this after placing the manual poster:

```bash
npm run generate:daily-hero -- --date 2026-06-12
```

The date is the day whose matches have just finished. The script selects the next day's spotlight match, normalizes the manual image to `1600x1000`, writes WebP/JPG outputs, and updates both:

```text
public/worldcup-assets/home/daily-hero.json
src/data/dailyHero.json
```

If no manual poster is found, the script generates a template fallback poster so the homepage never breaks.
