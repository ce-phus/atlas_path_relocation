from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Profile, Consultant, Task
from django.db.models.signals import m2m_changed, pre_save

User = get_user_model() 

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

@receiver(post_save, sender=Consultant)
def update_consultant_user_permissions(sender, instance, created, **kwargs):
    """
    Set appropriate permimssions when a Consultant is created.
    """

    if created:
        user = instance.user
        user.is_staff = True
        user.save()

@receiver(post_save, sender=Task)
def update_profile_progress_on_task_change(sender, instance, **kwargs):
    """
    Update profile progress when tasks are completed/added.
    """
    profile = instance.profile
    total_tasks = profile.tasks.count()
    completed_tasks = profile.tasks.filter(is_completed=True).count()
    
    if total_tasks > 0:
        profile.overall_progress = int((completed_tasks / total_tasks) * 100)
        profile.save()

@receiver(pre_save, sender=Profile)
def update_progress_based_on_tasks(sender, instance, **kwargs):
    """
    Auto calculate progress based on completed tasks.
    """
    if instance.pk: #Only for existing profiles
        total_tasks = instance.tasks.count()
        completed_tasks = instance.tasks.filter(is_completed=True).count()
        
        if total_tasks > 0:
            instance.overall_progress = int((completed_tasks / total_tasks) * 100)
def create_default_tasks(profile):
    default_tasks = [
        # Initial Consultation
        {'stage': 'initial_consultation', 'title': 'Complete initial consultation form', 'order': 1},
        {'stage': 'initial_consultation', 'title': 'Discuss relocation goals and timeline', 'order': 2},
        
        # Document Collection
        {'stage': 'document_collection', 'title': 'Submit passport copies', 'order': 1},
        {'stage': 'document_collection', 'title': 'Provide proof of income', 'order': 2},
        {'stage': 'document_collection', 'title': 'Submit educational certificates', 'order': 3},
        
        # Visa Processing
        {'stage': 'visa_processing', 'title': 'Complete visa application', 'order': 1},
        {'stage': 'visa_processing', 'title': 'Schedule visa interview', 'order': 2},
        {'stage': 'visa_processing', 'title': 'Submit medical examination results', 'order': 3},
        
        # Housing Search
        {'stage': 'housing_search', 'title': 'Define housing preferences', 'order': 1},
        {'stage': 'housing_search', 'title': 'Research neighborhoods', 'order': 2},
        {'stage': 'housing_search', 'title': 'Schedule property viewings', 'order': 3},
        
        # School Enrollment
        {'stage': 'school_enrollment', 'title': 'Research schools in area', 'order': 1},
        {'stage': 'school_enrollment', 'title': 'Submit school applications', 'order': 2},
        {'stage': 'school_enrollment', 'title': 'Complete enrollment paperwork', 'order': 3},
        
        # Final Relocation
        {'stage': 'final_relocation', 'title': 'Book moving services', 'order': 1},
        {'stage': 'final_relocation', 'title': 'Arrange temporary accommodation', 'order': 2},
        {'stage': 'final_relocation', 'title': 'Confirm travel arrangements', 'order': 3},
    ]
    
    for task_data in default_tasks:
        Task.objects.create(profile=profile, **task_data)