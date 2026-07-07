from django.urls import path
from . import views

urlpatterns = [
    #get all flashcard sets for the user or create a new flashcard set (GET-POST)
    path("flashcard-sets/", views.FlashCardSetCreateView.as_view(), name="flashcardset"), 
    #get a specific flashcard set by id or update it (GET-PATCH-DELETE)
    path("flashcard-sets/<flash_card_set_id>/", views.FlashCardSetDetailsView.as_view(), name="flashcardset-detail"),
    #create a new flashcard for a specific flashcard set (POST)
    path("flashcard-sets/<flash_card_set_id>/flashcards/", views.FlashCardCreateView.as_view(), name="flashcardentry-detail"),
    #delete or update a specific flashcard (DELETE-PATCH)
    path("flashcards/<flash_card_id>/", views.FlashCardUpdateView.as_view(), name="flashcarddelete-detail"),
]