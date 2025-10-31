from django.contrib.auth import get_user_model
from django_countries.serializer_fields import CountryField
from djoser.serializers import UserCreateSerializer, SetPasswordSerializer
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from django.utils.translation import gettext as _

from .models import ReasonForAccountDeletion
import logging
User = get_user_model()


logger = logging.getLogger(__name__)
class UserSerializer(serializers.ModelSerializer):
    gender = serializers.CharField(source="profile.gender")
    phone_number = PhoneNumberField(source="profile.phone_number")
    profile_photo = serializers.ImageField(source="profile.profile_photo")
    country = CountryField(source="profile.country")
    city = serializers.CharField(source="profile.city")
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField(source="get_full_name")

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "gender",
            "phone_number",
            "profile_photo",
            "country",
            "city",
        ]

    def get_first_name(self, obj):
        return obj.first_name.title()

    def get_last_name(self, obj):
        return obj.last_name.title()

    def get_full_name(self, obj):
        first_name = obj.first_name.title()
        last_name = obj.last_name.title()
        return f"{first_name} {last_name}"

    def to_representation(self, instance):
        representation = super(UserSerializer, self).to_representation(instance)
        if instance.is_superuser:
            representation["admin"] = True
        return representation


class CreateUserSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "password", "re_password"]

    def validate(self, data):
        required_fields = ["username", "first_name", "last_name", "email", "password", "re_password"]
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: "This field is required."})
        return data


class UserDeleteSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)



class CustomSetPasswordSerializer(SetPasswordSerializer):
    class Meta(SetPasswordSerializer):
        model=User
        new_password = serializers.CharField(write_only=True)
        re_new_password = serializers.CharField(write_only=True)
        logger.info(f'{new_password}, {re_new_password} PASSWORD')
    def validate(self, attrs):
        if attrs["current_password"]:
           raise serializers.ValidationError({
            "re":"dimps"
           })
        if attrs["new_password"] != attrs["re_new_password"]:
            raise serializers.ValidationError({
                "re_new_password": _("Passwords do not match.")
            })
        return attrs

    def save(self, **kwargs):
        user = self.context["request"].user
        user.password_social_set = True
        logger.info(f"Updated hasable...")
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user
