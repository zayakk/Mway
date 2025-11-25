from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "user", "created_at")
    search_fields = ("full_name", "user__username", "user__email")
    ordering = ("-created_at",)
