"""Draws the Android notification icon (assets/notification-icon.png): the three-bar Orthodox
cross, white on transparent, 96x96. Android tints it and drops the colours, so it must be a
plain silhouette. Geometry matches scripts/make-icons.py. Run: python scripts/make-notification-icon.py
"""

import math
import os

from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "notification-icon.png")
SIZE = 96
SS = 8
WHITE = (255, 255, 255, 255)
PAD = 9  # px of empty space around the cross

# cross in the 1024-px design space of make-icons.py; bounds of all four bars
X0, X1, Y0, Y1 = 372, 652, 215, 595

scale = (SIZE - 2 * PAD) * SS / (Y1 - Y0)
ox = (SIZE * SS - (X1 - X0) * scale) / 2 - X0 * scale
oy = (SIZE * SS - (Y1 - Y0) * scale) / 2 - Y0 * scale


def p(x, y):
    return (ox + x * scale, oy + y * scale)


img = Image.new("RGBA", (SIZE * SS, SIZE * SS), (0, 0, 0, 0))
d = ImageDraw.Draw(img)


def rect(x0, y0, x1, y1):
    d.rectangle([*p(x0, y0), *p(x1, y1)], fill=WHITE)


rect(488, 215, 536, 575)  # beam ends inside the foot bar
rect(436, 258, 588, 292)
rect(372, 346, 652, 390)
angle = math.radians(14)
corners = []
for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
    x, y = sx * 80, sy * 15
    corners.append(p(512 + x * math.cos(angle) - y * math.sin(angle), 566 + x * math.sin(angle) + y * math.cos(angle)))
d.polygon(corners, fill=WHITE)

img.resize((SIZE, SIZE), Image.LANCZOS).save(OUT, optimize=True)
print(OUT)
