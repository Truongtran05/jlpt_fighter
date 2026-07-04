from . import views
from django.urls import path

urlpatterns = [
    path("kanji/", views.KanjiSearchView.as_view(), name="kanji_search"),
    path("vocab/", views.VocabularySearchView.as_view(), name="vocab_search"),
    path("grammar/", views.GrammarSearchView.as_view(), name="grammar_search"),
]