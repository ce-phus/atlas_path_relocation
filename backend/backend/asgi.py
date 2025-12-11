import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from apps.chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
# from apps.notifications.routing import websocket_urlpatterns as notifications_websocket_urlpatterns
from apps.chat.channels_middleware import JWTWebsocketMiddleware

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings.development')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTWebsocketMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                chat_websocket_urlpatterns # + notifications_websocket_urlpatterns
            )
        )
    )
})
