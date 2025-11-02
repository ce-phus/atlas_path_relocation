from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _   

from apps.common.models import TimeStampedUUIDModel
from apps.profiles.models import Profile

class Appointment(TimeStampedUUIDModel):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='appointments', verbose_name=_("Profile"))
    title = models.CharField(max_length=200, verbose_name=_("Title"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    scheduled_date = models.DateTimeField(verbose_name=_("Appointment Date"))
    appointment_type = models.CharField(
        max_length=50,
        choices=[
            ('consultation', 'Consultation'),
            ('property_viewing', 'Property Viewing'),
            ('document_review', 'Document Review'),
            ('other', 'Other')
        ],
        default='consultation'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('scheduled', 'Scheduled'),
            ('completed', 'Completed'),
            ('canceled', 'Canceled'),
            ('rescheduled', 'Rescheduled')
        ],
        default='scheduled',
        verbose_name=_("Status")
    )

    class Meta:
        verbose_name = _("Appointment")
        verbose_name_plural = _("Appointments")
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"Appointment: {self.title} on {self.scheduled_date.strftime('%Y-%m-%d %H:%M')} with {self.user.get_full_name()}"
    
