from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.db import close_old_connections
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


# channels_middleware.py
class JWTWebsocketMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        close_old_connections()

        # Debug logging
        print(f"🔧 MIDDLEWARE: Path = {scope.get('path')}")
        print(f"🔧 MIDDLEWARE: Type = {scope.get('type')}")
        
        query_string = scope.get("query_string", b"").decode("utf-8")
        print(f"🔧 MIDDLEWARE: Query string = '{query_string}'")
        
        # Parse query parameters
        query_params = {}
        for param in query_string.split("&"):
            if param and "=" in param:
                key, value = param.split("=", 1)
                query_params[key] = value
        
        token = query_params.get("token")
        print(f"🔧 MIDDLEWARE: Token extracted = {'YES' if token else 'NO'}")
        
        if not token:
            print("MIDDLEWARE: No token provided!")
            await send({
                "type": "websocket.close",
                "code": 4000
            })
            return
        
        print(f"🔧 MIDDLEWARE: Token = {token[:20]}...") 
        
        authentication = JWTAuthentication()

        try:
            # Try to validate the token
            validated_token = authentication.get_validated_token(token)
            print(f"MIDDLEWARE: Token validated successfully")
            
            # Get user from token
            user = await database_sync_to_async(authentication.get_user)(validated_token)
            print(f"MIDDLEWARE: User found = {user.username} (ID: {user.id})")
            
            # Set user in scope
            scope['user'] = user
            
            # Continue to consumer
            return await super().__call__(scope, receive, send)
            
        except AuthenticationFailed as e:
            print(f"MIDDLEWARE: Authentication failed: {e}")
            await send({
                "type": "websocket.close",
                "code": 4002
            })
        except Exception as e:
            print(f"MIDDLEWARE: Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            await send({
                "type": "websocket.close",
                "code": 4003
            })