import threading

_user_request = threading.local()

class RequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        """
        Middleware to set the user request in a thread-local storage.
        This allows access to the request object in other parts of the application.
        """
        _user_request.value = request
        response = self.get_response(request)
        return response
    
def get_current_request():
    return getattr(_user_request, "value", None)