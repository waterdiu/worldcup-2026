from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/worldcup-assets/opening-match-poster.png"
OUTPUT = ROOT / "public/worldcup-assets/optimized/opening-match-poster.jpg"

FONT_CHINESE = "/System/Library/Fonts/STHeiti Medium.ttc"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def centered_text(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    text: str,
    face: ImageFont.FreeTypeFont,
    fill: str,
    stroke_width: int = 0,
    weight: int = 1,
) -> None:
    left, top, right, bottom = box
    text_box = draw.textbbox((0, 0), text, font=face)
    width = text_box[2] - text_box[0]
    height = text_box[3] - text_box[1]
    x = left + (right - left - width) / 2
    y = top + (bottom - top - height) / 2 - text_box[1]
    for offset in range(weight):
        draw.text((x + offset, y), text, font=face, fill=fill, stroke_width=stroke_width, stroke_fill=fill)


def main() -> None:
    image = Image.open(SOURCE).convert("RGB")
    draw = ImageDraw.Draw(image)

    # Keep the original artwork intact. Only replace the AI-generated Chinese text.
    paper = "#fbf7ef"
    chinese_font = FONT_CHINESE

    draw.rectangle((575, 472, 950, 522), fill=paper)
    centered_text(draw, (575, 472, 950, 522), "墨西哥 vs 南非", font(chinese_font, 38), "#111111", weight=2)

    draw.rectangle((790, 535, 895, 574), fill=paper)
    for offset in range(2):
        draw.text((765 + offset, 537), "|", font=font(chinese_font, 29), fill="#c93625")
    centered_text(draw, (790, 535, 895, 574), "揭幕战", font(chinese_font, 29), "#c93625", weight=2)

    draw.rectangle((745, 590, 930, 623), fill=paper)
    centered_text(draw, (745, 590, 930, 623), "2026年6月11日", font(chinese_font, 26), "#17241d", weight=2)

    draw.rectangle((785, 628, 970, 660), fill=paper)
    centered_text(draw, (785, 628, 970, 660), "阿兹特克体育场", font(chinese_font, 24), "#087444", weight=2)

    image.thumbnail((1400, 933), Image.Resampling.LANCZOS)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT, "JPEG", quality=82, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
