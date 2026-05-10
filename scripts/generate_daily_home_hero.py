import argparse
import json
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
FIXTURES_PATH = ROOT / "src/data/groupFixtures.ts"
PUBLIC_HERO_JSON = ROOT / "public/worldcup-assets/home/daily-hero.json"
SRC_HERO_JSON = ROOT / "src/data/dailyHero.json"
POSTER_DIR = ROOT / "public/worldcup-assets/home/daily"
MANUAL_POSTER_DIR = ROOT / "public/worldcup-assets/home/manual"

TEAM_ZH = {
    "Australia": "澳大利亚",
    "Brazil": "巴西",
    "Haiti": "海地",
    "Morocco": "摩洛哥",
    "Qatar": "卡塔尔",
    "Scotland": "苏格兰",
    "Switzerland": "瑞士",
    "Turkiye": "土耳其",
}

VENUE_ZH = {
    "BC Place Vancouver": "温哥华 BC Place 球场",
    "Boston Stadium": "波士顿球场",
    "New York New Jersey Stadium": "纽约新泽西球场",
    "San Francisco Bay Area Stadium": "旧金山湾区球场",
}

TEAM_PRIORITY = {
    "Argentina": 100,
    "Brazil": 98,
    "France": 96,
    "England": 94,
    "Spain": 94,
    "Germany": 92,
    "Portugal": 91,
    "Netherlands": 90,
    "Mexico": 88,
    "United States": 88,
    "Canada": 84,
}

HOST_TEAMS = {"Canada", "Mexico", "United States"}


@dataclass
class Fixture:
    id: str
    date_label: str
    venue: str
    home_team: str
    away_team: str
    home_win_probability: float
    draw_probability: float
    away_win_probability: float


def parse_fixtures() -> list[Fixture]:
    source = FIXTURES_PATH.read_text(encoding="utf-8")
    objects = re.findall(r"\{ id: .*? \}", source)
    fixtures: list[Fixture] = []

    def read_string(item: str, key: str) -> str:
        match = re.search(rf"{key}: (['\"])(.*?)\1", item)
        if not match:
            raise KeyError(key)
        return match.group(2)

    for item in objects:
        numeric = {
            key: float(value)
            for key, value in re.findall(r"(\w+): ([0-9.]+)", item)
        }
        fixtures.append(
            Fixture(
                id=read_string(item, "id"),
                date_label=read_string(item, "dateLabel"),
                venue=read_string(item, "venue"),
                home_team=read_string(item, "homeTeam"),
                away_team=read_string(item, "awayTeam"),
                home_win_probability=numeric["homeWinProbability"],
                draw_probability=numeric["drawProbability"],
                away_win_probability=numeric["awayWinProbability"],
            )
        )

    return fixtures


def fixture_date(fixture: Fixture) -> datetime:
    return datetime.strptime(fixture.date_label, "%a %d %b %Y").replace(tzinfo=timezone.utc)


def editorial_score(fixture: Fixture) -> float:
    teams = [fixture.home_team, fixture.away_team]
    team_score = max(TEAM_PRIORITY.get(team, 50) for team in teams)
    host_bonus = 16 if any(team in HOST_TEAMS for team in teams) else 0
    balance_bonus = (1 - abs(fixture.home_win_probability - fixture.away_win_probability)) * 12
    favorite_bonus = max(fixture.home_win_probability, fixture.away_win_probability) * 8
    return team_score + host_bonus + balance_bonus + favorite_bonus


def select_spotlight_fixture(fixtures: list[Fixture], reference_date: str) -> tuple[str, Fixture]:
    reference = datetime.strptime(reference_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    target = reference + timedelta(days=1)
    target_iso = target.date().isoformat()
    next_day = [fixture for fixture in fixtures if fixture_date(fixture).date().isoformat() == target_iso]

    if not next_day:
        raise ValueError(f"No fixtures found for {target_iso}")

    return target_iso, max(next_day, key=editorial_score)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/STHeiti Medium.ttc" if bold else "/System/Library/Fonts/STHeiti Light.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        path = Path(candidate)
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


def draw_centered(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, text_font, fill) -> None:
    bbox = draw.textbbox((0, 0), text, font=text_font)
    draw.text((xy[0] - (bbox[2] - bbox[0]) / 2, xy[1]), text, font=text_font, fill=fill)


def poster_paths(target_iso: str, fixture: Fixture) -> tuple[Path, Path, str, str]:
    POSTER_DIR.mkdir(parents=True, exist_ok=True)
    base_name = f"{target_iso}-match-{fixture.id}"
    webp_path = POSTER_DIR / f"{base_name}.webp"
    jpg_path = POSTER_DIR / f"{base_name}.jpg"
    return (
        webp_path,
        jpg_path,
        f"/worldcup-assets/home/daily/{base_name}.webp",
        f"/worldcup-assets/home/daily/{base_name}.jpg",
    )


def find_manual_poster(fixture: Fixture, target_iso: str, manual_dir: Path = MANUAL_POSTER_DIR) -> Path | None:
    base_names = [
        f"{target_iso}-match-{fixture.id}",
        f"match-{fixture.id}",
        target_iso,
    ]
    extensions = [".png", ".jpg", ".jpeg", ".webp"]

    for base_name in base_names:
        for extension in extensions:
            candidate = manual_dir / f"{base_name}{extension}"
            if candidate.exists():
                return candidate
    return None


def normalize_manual_poster(source: Path, fixture: Fixture, target_iso: str) -> tuple[str, str]:
    webp_path, jpg_path, webp_url, jpg_url = poster_paths(target_iso, fixture)
    with Image.open(source) as original:
        image = ImageOps.fit(
            original.convert("RGB"),
            (1600, 1000),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
        image.save(webp_path, "WEBP", quality=82, method=6)
        image.save(jpg_path, "JPEG", quality=82, optimize=True, progressive=True)
    return webp_url, jpg_url


def render_template_poster(fixture: Fixture, target_iso: str) -> tuple[str, str]:
    POSTER_DIR.mkdir(parents=True, exist_ok=True)
    width, height = 1600, 1000
    image = Image.new("RGB", (width, height), "#08121f")
    draw = ImageDraw.Draw(image, "RGBA")

    for y in range(height):
        mix = y / height
        red = int(8 + 18 * mix)
        green = int(18 + 72 * mix)
        blue = int(31 + 68 * (1 - mix))
        draw.line([(0, y), (width, y)], fill=(red, green, blue, 255))

    draw.ellipse((-320, 120, 520, 960), fill=(15, 205, 160, 70))
    draw.ellipse((1080, -120, 1840, 620), fill=(255, 116, 67, 72))
    draw.ellipse((310, 290, 1290, 1180), outline=(255, 255, 255, 32), width=5)
    draw.rectangle((0, 700, width, height), fill=(4, 12, 22, 120))

    title_font = font(64, bold=True)
    matchup_font = font(112, bold=True)
    meta_font = font(38, bold=False)
    small_font = font(30, bold=False)

    home_zh = TEAM_ZH.get(fixture.home_team, fixture.home_team)
    away_zh = TEAM_ZH.get(fixture.away_team, fixture.away_team)
    venue_zh = VENUE_ZH.get(fixture.venue, fixture.venue)

    draw.rounded_rectangle((150, 120, 1450, 860), radius=42, fill=(4, 12, 22, 128), outline=(255, 255, 255, 46), width=2)
    draw_centered(draw, (width // 2, 185), "明日焦点战", title_font, (238, 255, 244, 255))
    draw_centered(draw, (width // 2, 355), f"{home_zh}  vs  {away_zh}", matchup_font, (255, 255, 255, 255))
    draw_centered(draw, (width // 2, 525), f"2026年{int(target_iso[5:7])}月{int(target_iso[8:10])}日", meta_font, (206, 247, 226, 255))
    draw_centered(draw, (width // 2, 590), venue_zh, meta_font, (206, 247, 226, 235))
    draw_centered(draw, (width // 2, 735), "FIFA WORLD CUP 2026", small_font, (255, 255, 255, 190))

    webp_path, jpg_path, webp_url, jpg_url = poster_paths(target_iso, fixture)
    image.save(webp_path, "WEBP", quality=78, method=6)
    image.save(jpg_path, "JPEG", quality=78, optimize=True, progressive=True)
    return webp_url, jpg_url


def write_daily_hero(reference_date: str, manual_dir: Path = MANUAL_POSTER_DIR) -> dict:
    target_iso, fixture = select_spotlight_fixture(parse_fixtures(), reference_date)
    manual_poster = find_manual_poster(fixture, target_iso, manual_dir)
    if manual_poster:
        poster, fallback = normalize_manual_poster(manual_poster, fixture, target_iso)
        poster_source = "manual"
    else:
        poster, fallback = render_template_poster(fixture, target_iso)
        poster_source = "template"

    payload = {
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "referenceDate": reference_date,
        "date": target_iso,
        "matchId": fixture.id,
        "title": "明日焦点战",
        "homeTeam": fixture.home_team,
        "awayTeam": fixture.away_team,
        "kickoff": f"{target_iso}T12:00:00Z",
        "venue": fixture.venue,
        "poster": poster,
        "fallbackPoster": fallback,
        "posterSource": poster_source,
        "reason": "Selected by host-team, marquee-team, and matchup-balance editorial priority.",
    }

    PUBLIC_HERO_JSON.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_HERO_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SRC_HERO_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.now(timezone.utc).date().isoformat())
    parser.add_argument("--manual-dir", default=str(MANUAL_POSTER_DIR))
    args = parser.parse_args()
    payload = write_daily_hero(args.date, Path(args.manual_dir))
    print(json.dumps(payload, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
