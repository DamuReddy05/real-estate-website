from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from jwt import PyJWKClient
import jwt
from functools import lru_cache


def _require_setting(name: str) -> str:
    value = getattr(settings, name, None)
    if not value:
        raise ImproperlyConfigured(f"Missing {name} configuration for Auth0 integration")
    return value


@lru_cache(maxsize=1)
def get_jwks_client() -> PyJWKClient:
    domain = _require_setting('AUTH0_DOMAIN')
    jwks_url = f"https://{domain}/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


def verify_auth0_token(id_token: str) -> dict:
    """
    Validate an Auth0-issued ID token.

    Auth0 can emit ID tokens whose `aud` claim is either the SPA client ID or,
    when a custom default audience is configured, the API identifier. To avoid
    false negatives we allow both values during validation.
    """
    client_id = _require_setting('AUTH0_CLIENT_ID')
    domain = _require_setting('AUTH0_DOMAIN')
    api_audience = getattr(settings, 'AUTH0_AUDIENCE', None)
    valid_audiences = [client_id]
    if api_audience and api_audience not in valid_audiences:
        valid_audiences.append(api_audience)

    jwks_client = get_jwks_client()
    signing_key = jwks_client.get_signing_key_from_jwt(id_token)
    payload = jwt.decode(
        id_token,
        signing_key.key,
        algorithms=["RS256"],
        audience=valid_audiences,
        issuer=f"https://{domain}/",
        options={"verify_at_hash": False}
    )
    return payload
