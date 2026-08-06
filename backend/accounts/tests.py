from django.test import TestCase

from .models import User


class UserManagerTests(TestCase):
    def test_email_is_used_for_users_and_superusers(self):
        user = User.objects.create_user(
            email="USER@example.com",
            password="test-password",
            name="User",
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="admin-password",
            name="Admin",
        )

        self.assertEqual(user.email, "USER@example.com")
        self.assertTrue(user.check_password("test-password"))
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
