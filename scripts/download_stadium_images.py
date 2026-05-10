from __future__ import annotations

import ssl
import urllib.request
from shutil import copyfile
from pathlib import Path


ROOT = Path("/Users/chamcham/Documents/AI/CODEX/soccer/worldcup/2026")
TARGET_DIR = ROOT / "public" / "worldcup-assets" / "stadiums"
LOCAL_SOURCE_DIR = Path("/Users/chamcham/Documents/DOC/体育/2026worldcup/stadium")


LOCAL_SOURCES = {
    "atlanta.jpg": "atlanta_Mercedes_Benz_Stadium.jpg",
    "dallas.jpg": "dallas_AT&T_Stadium.jpg",
    "guadalajara.jpg": "guadalajara_Estadio_Akron_Stadium.jpg",
    "losangeles.jpg": "losangeles_SoFi_Stadium.jpg",
    "miami.jpg": "miami_Hard_Rock_Stadium.jpg",
    "monterrey.jpg": "Monterrey_Estadio_BBVA_Stadium.jpeg",
    "philadelphia.jpg": "philadelphia_Lincoln_Financial_Field.jpg",
    "sanfrancisco.png": "sanfrancisco_Levi's_Stadium.png",
    "seattle.jpg": "seattle_Lumen_Field_Stadium.jpg",
    "toronto.jpg": "toronto_BMO_Field_Stadium.jpg",
}


REMOTE_SOURCES = {
    "atlanta.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Mercedes-Benz_Stadium_%2839440363871%29.jpg/1280px-Mercedes-Benz_Stadium_%2839440363871%29.jpg",
    "boston.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Gillette_stadium.jpg/1280px-Gillette_stadium.jpg",
    "dallas.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/AT%26T_Stadium_Aerial.jpeg/1280px-AT%26T_Stadium_Aerial.jpeg",
    "guadalajara.jpg": "https://images.pexels.com/photos/16460736/pexels-photo-16460736.jpeg?cs=srgb&dl=pexels-carlos-reyes-16460736.jpg&fm=jpg",
    "houston.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Nrg_stadium.jpg/1280px-Nrg_stadium.jpg",
    "kansas.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Aerial_view_of_Arrowhead_Stadium_08-31-2013_crop.jpg/1280px-Aerial_view_of_Arrowhead_Stadium_08-31-2013_crop.jpg",
    "losangeles.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Aerial_view_of_SoFi_Stadium_%28July_2022%29.jpg/1280px-Aerial_view_of_SoFi_Stadium_%28July_2022%29.jpg",
    "mexicocity.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Estadio_Azteca_desde_el_aire_3.jpg/1280px-Estadio_Azteca_desde_el_aire_3.jpg",
    "monterrey.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Estadio_BBVA_Bancomer.jpg/1280px-Estadio_BBVA_Bancomer.jpg",
    "newyork.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Metlife_stadium.jpg/1280px-Metlife_stadium.jpg",
    "philadelphia.jpg": "https://upload.wikimedia.org/wikipedia/commons/7/70/Lincoln_Financial_Field.jpg",
    "seattle.jpg": "https://live.staticflickr.com/4/4886451_649751b8f7_o.jpg",
    "toronto.jpg": "https://images.pexels.com/photos/8312926/pexels-photo-8312926.jpeg?cs=srgb&dl=pexels-harrisonhaines-8312926.jpg&fm=jpg",
    "vancouver.jpg": "https://live.staticflickr.com/8868/18001120370_818b5a050f_o.jpg",
}


def download(url: str, target: Path) -> None:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) WorldCup2026Localizer/1.0"
        },
    )
    context = ssl._create_unverified_context()

    with urllib.request.urlopen(request, context=context, timeout=20) as response:
        data = response.read()

    target.write_bytes(data)


def main() -> None:
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    failures: list[str] = []

    for filename, source_name in LOCAL_SOURCES.items():
        source = LOCAL_SOURCE_DIR / source_name
        target = TARGET_DIR / filename
        if target.exists() and target.stat().st_size > 0:
            print(f"skipped {filename} -> {target}")
            continue

        if not source.exists():
            failures.append(f"{filename}: missing local source {source}")
            print(f"failed {filename}: missing local source {source}")
            continue

        copyfile(source, target)
        print(f"copied {filename} -> {target}")

    for filename, url in REMOTE_SOURCES.items():
        if filename in LOCAL_SOURCES:
            continue

        target = TARGET_DIR / filename
        if target.exists() and target.stat().st_size > 0:
            print(f"skipped {filename} -> {target}")
            continue

        try:
            download(url, target)
        except Exception as error:  # noqa: BLE001 - keep bulk downloads moving.
            failures.append(f"{filename}: {error}")
            print(f"failed {filename}: {error}")
            continue

        print(f"downloaded {filename} -> {target}")

    if failures:
        raise SystemExit("Some stadium images failed:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
