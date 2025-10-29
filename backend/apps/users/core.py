# apps/users/core.py
import logging

from djoser import email

logger = logging.getLogger(__name__)

from apps.common.middleware import get_current_request

class CustomActivationEmail(email.ActivationEmail):
    template_name = 'account/email/activation.html'  # Correct relative path

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        logger.info(f"Initializing CustomActivationEmail with template: {self.template_name}")

    def get_context_data(self, **kwargs): 
        context = super().get_context_data(**kwargs) 
        logger.info(f"Context data before modification: {context}") 
        context['site_name'] = 'localhost:8080' 
        context['domain'] = 'localhost:8080' 
        request = kwargs.get('request') 
        if request and request.is_secure(): 
            context['protocol'] = 'https' 
        else: 
           context['protocol'] = 'http' 
           logger.info(f"Context data after modification: {context}") 
        return context

class CustomConfirmationEmail(email.ConfirmationEmail):
    template_name = 'account/email/confirmation.html'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['site_name'] = 'localhost:8080'
        context['domain'] = 'localhost:8080'
        request = kwargs.get('request')
        if request and request.is_secure():
            context['protocol'] = 'https'
        else:
            context['protocol'] = 'http'
        return context

class CustomPasswordResetEmail(email.PasswordResetEmail):
    template_name = 'account/email/password_reset.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        request = get_current_request()

        source = request.headers.get("X-Source", "web") if request else "web"

        if source == "mobile":
            context["url"] = f"myapp://reset/{context['uid']}/{context['token']}"
        else:
            context["url"] = f"http://localhost:8080/password/reset/confirm/{context['uid']}/{context['token']}"

        context['site_name'] = 'localhost:8080'
        context['domain'] = 'localhost:8080'
        context['protocol'] = 'https'
        return context


class CustomPasswordChangedConfirmationEmail(email.PasswordChangedConfirmationEmail):
    template_name = 'account/email/password_change_confirm.html'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['site_name'] = 'localhost:8080'
        context['domain'] = 'localhost:8080'
        request = kwargs.get('request')
        if request and request.is_secure():
            context['protocol'] = 'https'
        else:
            context['protocol'] = 'http'
        return context


