import uuid

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.common.models import TimeStampedUUIDModel

from .managers import CustomUserManager

import uuid

AUTH_PROVIDEDS = {
    "email": "email",
    "google": "google",
    "facebook": "facebook",
    "twitter": "twitter",
}

class User(AbstractBaseUser, PermissionsMixin):
    pkid = models.BigAutoField(primary_key=True, editable=False)
    id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    username = models.CharField(verbose_name=_("Username"), max_length=255, unique=True, default='')
    first_name = models.CharField(verbose_name=_("First Name"), max_length=50)
    last_name = models.CharField(verbose_name=_("Last Name"), max_length=50)
    email = models.EmailField(verbose_name=_("Email Address"), unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_guest = models.BooleanField(default=False)
    guest_identifier = models.CharField(max_length=36, null=True, blank=True, unique=True)
    date_joined = models.DateTimeField(default=timezone.now)
    password_social_set = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    last_seen = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("User")
        verbose_name_plural = _("Users")

    def save(self, *args, **kwargs):
        """
        Auto generate a username for guest users
        """

        if self.is_guest and not self.username:
            self.username = f"guest_{uuid.uuid4().hex[:6]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username or "Guest User"

    @property
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.username

class ReasonForAccountDeletion(TimeStampedUUIDModel):
    """
    Model to store reasons for account deletion.
    """
    reason = models.TextField(verbose_name=_("Reason for Deletion"))

    class Meta:
        verbose_name = _("Reason for Account Deletion")
        verbose_name_plural = _("Reasons for Account Deletion")

    def __str__(self):
        return f"Deletion Reason: {self.reason} {self.created_at.strftime(' (%Y-%m-%d)')}"