from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTWebsocketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()

        query_string = scope.get("query_string", b"").decode("utf-8")
        query_parameters = {}

        # Safely split the query string into key-value pairs
        for qp in query_string.split("&"):
            if "=" in qp:  # Only split if there is an '='
                key, value = qp.split("=", 1)
                query_parameters[key] = value
            else:
                # Optionally log malformed query parameters for debugging
                print(f"Skipping malformed query parameter: {qp}")

        token = query_parameters.get("token", None)

        if token is None:
            await send({
                "type": "websocket.close",
                "code": 4000  # Close connection if no token
            })
            return
        
        authentication = JWTAuthentication()

        try:
            validated_token = authentication.get_validated_token(token)
            user = await database_sync_to_async(authentication.get_user)(validated_token)
            scope['user'] = user

            return await super().__call__(scope, receive, send)
        except AuthenticationFailed:
            await send({
                "type": "websocket.close",
                "code": 4002  
            })
