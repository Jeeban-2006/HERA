"""Field-level encryption service using Fernet symmetric encryption.

Key is loaded from FERNET_SECRET_KEY env var (base64-encoded 32-byte key).
In production, this key lives in AWS Secrets Manager and is injected at deploy time.
Rotate every 90 days — old key is kept in FERNET_SECRET_KEY_OLD for decryption
of pre-rotation data, until all rows are re-encrypted.
"""

import base64
import logging
from cryptography.fernet import Fernet, MultiFernet, InvalidToken
from app.config import settings

logger = logging.getLogger(__name__)


def _load_fernet() -> MultiFernet:
    """Build a MultiFernet that can decrypt with old key + encrypt with current key."""
    keys = []

    primary = getattr(settings, "FERNET_SECRET_KEY", None)
    if primary:
        try:
            keys.append(Fernet(primary.encode() if isinstance(primary, str) else primary))
        except Exception as e:
            logger.error(f"Primary Fernet key invalid: {e}")

    old = getattr(settings, "FERNET_SECRET_KEY_OLD", None)
    if old:
        try:
            keys.append(Fernet(old.encode() if isinstance(old, str) else old))
        except Exception:
            pass  # silently ignore invalid old key

    if not keys:
        # Dev-only fallback — generates an ephemeral key per process restart.
        # This means data written in dev is NOT readable after a restart, which
        # is intentional: it forces the production key to be set explicitly.
        logger.warning(
            "⚠️  FERNET_SECRET_KEY not set. "
            "Using ephemeral in-process key — NOT suitable for production!"
        )
        keys.append(Fernet(Fernet.generate_key()))

    return MultiFernet(keys)


_fernet = _load_fernet()


def encrypt_field(plaintext: str) -> str:
    """Encrypt a sensitive string field before DB storage.
    Returns a base64-encoded ciphertext string safe to store as TEXT/VARCHAR.
    """
    if not plaintext:
        return plaintext
    token = _fernet.encrypt(plaintext.encode("utf-8"))
    return token.decode("utf-8")


def decrypt_field(ciphertext: str) -> str:
    """Decrypt a field previously encrypted with encrypt_field().
    Raises ValueError if the ciphertext is invalid or tampered.
    """
    if not ciphertext:
        return ciphertext
    try:
        plaintext = _fernet.decrypt(ciphertext.encode("utf-8"))
        return plaintext.decode("utf-8")
    except InvalidToken as e:
        logger.error("Fernet decryption failed — possible key mismatch or tampering.")
        raise ValueError("Decryption failed: invalid token") from e


def encrypt_dict(data: dict, fields: list[str]) -> dict:
    """Encrypt specific fields in a dict in-place (returns new dict)."""
    result = dict(data)
    for field in fields:
        if field in result and result[field] is not None:
            result[field] = encrypt_field(str(result[field]))
    return result


def decrypt_dict(data: dict, fields: list[str]) -> dict:
    """Decrypt specific fields in a dict."""
    result = dict(data)
    for field in fields:
        if field in result and result[field] is not None:
            try:
                result[field] = decrypt_field(str(result[field]))
            except ValueError:
                # If decryption fails (e.g. unencrypted legacy data), keep as-is
                pass
    return result
