"""Draws the Poreia app icons (assets/*.png).

Concept "C": a gold three-bar Orthodox cross standing at the end of a road that narrows
towards it (poreia = journey), on wine red. Run: python scripts/make-icons.py

Android adaptive icons only show the central ~66% of the canvas, so the artwork is drawn
inside a circle of radius ~330 px on a 1024 px canvas and the legacy icon scales it up.
"""

import math
import os

from PIL import Image, ImageDraw

SIZE = 1024
SS = 4  # supersampling factor for smooth edges
WINE = (122, 31, 43, 255)  # same wine red as the app accent
GOLD = (217, 179, 95, 255)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets")


def art(color, scale=1.0):
    """The cross and road as an RGBA layer on a transparent canvas."""
    big = SIZE * SS
    layer = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx = big / 2

    def p(x, y):
        # scale around the canvas centre
        return (cx + (x - 512) * scale * SS, cx + (y - 512) * scale * SS)

    def rect(x0, y0, x1, y1):
        d.rectangle([*p(x0, y0), *p(x1, y1)], fill=color)

    # vertical beam, short top bar, main bar
    rect(488, 215, 536, 650)
    rect(436, 258, 588, 292)
    rect(372, 346, 652, 390)

    # slanted foot bar as a rotated rectangle
    # Christ's right side (the viewer's left) is the raised one, toward the penitent thief.
    angle = math.radians(14)
    half_len, half_th = 80, 15
    corners = []
    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        x = sx * half_len
        y = sy * half_th
        corners.append(
            p(
                512 + x * math.cos(angle) - y * math.sin(angle),
                566 + x * math.sin(angle) + y * math.cos(angle),
            )
        )
    d.polygon(corners, fill=color)

    # the road: two edges that thicken towards the viewer, and dashes down the middle
    # that shrink with distance. No fill, so it does not read as a hill.
    top_y, bottom_y = 664, 850
    for sign in (-1, 1):
        d.polygon(
            [
                p(512 + sign * 8, top_y),
                p(512 + sign * 12, top_y),
                p(512 + sign * 158, bottom_y),
                p(512 + sign * 142, bottom_y),
            ],
            fill=color,
        )
    for y0, y1, w in ((842, 806, 18), (790, 764, 14), (750, 732, 10), (720, 708, 7), (698, 689, 5)):
        d.polygon(
            [p(512 - w / 2, y0), p(512 + w / 2, y0), p(512 + w / 3, y1), p(512 - w / 3, y1)],
            fill=color,
        )

    return layer.resize((SIZE, SIZE), Image.LANCZOS)


def save(img, name):
    path = os.path.join(ROOT, name)
    img.save(path, optimize=True)
    print(name, img.size)


def on_wine(layer):
    base = Image.new("RGBA", (SIZE, SIZE), WINE)
    base.alpha_composite(layer)
    return base


# Legacy / store icon: full-bleed wine square, artwork scaled up (no safe zone to respect).
save(on_wine(art(GOLD, scale=1.2)), "icon.png")

# Adaptive icon: foreground on transparent, plain wine background, white silhouette for themed icons.
save(art(GOLD, scale=0.82), "android-icon-foreground.png")
save(Image.new("RGBA", (SIZE, SIZE), WINE), "android-icon-background.png")
save(art((255, 255, 255, 255), scale=0.82), "android-icon-monochrome.png")
