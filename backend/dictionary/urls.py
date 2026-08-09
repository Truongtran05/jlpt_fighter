from . import views
from django.urls import path

urlpatterns = [
    path("stats/", views.DictionaryStatsView.as_view({"get": "get_dictionary_stats"}), name="dictionary_stats"),
    path("stats/kanji/", views.DictionaryStatsView.as_view({"get": "get_jlpt_kanji"}), name="jlpt_kanji_stats"),
    path("stats/vocab/", views.DictionaryStatsView.as_view({"get": "get_jlpt_vocab"}), name="jlpt_vocab_stats"),
    path("stats/grammar/", views.DictionaryStatsView.as_view({"get": "get_jlpt_grammar"}), name="jlpt_grammar_stats"),
    path("related/kanji/", views.FetchRelatedView.as_view({"get": "get_related_kanji"}), name="related_kanji"),
    path("related/vocab/", views.FetchRelatedView.as_view({"get": "get_related_vocab"}), name="related_vocab"),
    path("kanji/", views.KanjiSearchView.as_view(), name="kanji_search"),
    path("vocab/", views.VocabularySearchView.as_view(), name="vocab_search"),
    path("grammar/", views.GrammarSearchView.as_view(), name="grammar_search"),
    path("suggestions/", views.SuggestionsView.as_view(), name="suggestions"),
]
