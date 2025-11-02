"""
WSGI config for realestatehub project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'realestatehub.settings')

application = get_wsgi_application()
