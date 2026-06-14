from __future__ import annotations

import base64
from typing import Any


def decode_base64_image(image_payload: str) -> dict[str, Any]:
    payload = image_payload.split(",", 1)[-1]
    image_bytes = base64.b64decode(payload)
    return {
        "raw_bytes": image_bytes,
        "payload": payload,
        "mime_type": image_payload.split(";", 1)[0].replace("data:", "") if image_payload.startswith("data:") else "image/jpeg",
    }


def normalize_rgb(image: Any) -> Any:
    return image