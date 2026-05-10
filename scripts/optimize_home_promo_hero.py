from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/worldcup-assets/optimized/home-promo-hero.jpg"
WEBP_OUTPUT = ROOT / "public/worldcup-assets/optimized/home-promo-hero.webp"
JPEG_OUTPUT = ROOT / "public/worldcup-assets/optimized/home-promo-hero-small.jpg"


def resize_for_hero(image: Image.Image, target_width: int = 1500) -> Image.Image:
    if image.width <= target_width:
        return image.copy()
    target_height = round(image.height * target_width / image.width)
    return image.resize((target_width, target_height), Image.Resampling.LANCZOS)


def main() -> None:
    with Image.open(SOURCE) as original:
        image = resize_for_hero(original.convert("RGB"))
        image.save(WEBP_OUTPUT, "WEBP", quality=72, method=6)
        image.save(
            JPEG_OUTPUT,
            "JPEG",
            quality=72,
            optimize=True,
            progressive=True,
        )

    for output in (WEBP_OUTPUT, JPEG_OUTPUT):
        print(f"{output.relative_to(ROOT)} {output.stat().st_size} bytes")


if __name__ == "__main__":
    main()
