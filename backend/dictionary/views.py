from django.views import View
from .models import *
from utils.string_utility import query_classify, romaji_to_kana
from django.http import JsonResponse
from django.core.paginator import Paginator 
from django.utils.text import Truncator
from django.db.models import F,Q, Prefetch, Value
from django.db.models.functions import Replace
from rest_framework import viewsets
from rest_framework.response import Response

def _get_language(request):
    return {'en': 'en', 'eng': 'en', 'vi': 'vi', 'vie': 'vi'}.get(request.GET.get('lang', 'eng').lower(), 'en')



#class-based view for searching kanji characters
class KanjiSearchView(View):
    def get(self, request):
        #get the search query from the request
        query = request.GET.get('q','')
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        lang = _get_language(request)
        
        #return { kanji, onyomi = [], kunyomi = [], sino_vietnamese=[], radicals, strokeCount, jlptLevel, meanings = [] }
        results = []
        kanji_query_set = Kanji_entry.objects.none()
        kanji_prefetches = (
            Prefetch(
                'readings',
                queryset=Kanji_reading.objects.order_by('position', 'kanji_reading_id'),
            ),
            Prefetch(
                'meanings',
                queryset=Kanji_meaning.objects.filter(lang=lang).order_by(
                    'position', 'kanji_meaning_id'
                ),
            ),
            'sino_vietnamese',
        )

        #Recognize the query as a kanji character or a word
        query_type = query_classify(query)
        if query_type == 'kanji':
            #search for the kanji character in the database
            kanji_query_set = Kanji_entry.objects.prefetch_related(*kanji_prefetches).filter(kanji=query).order_by('kanji_id')
        elif query_type == 'kana':
            #search for the kana word in the database
            query = query.replace(".", "") 
            kanji_query_set = (
                Kanji_entry.objects
                .annotate(
                    normalized_reading=Replace(
                        F("readings__reading"), #remove dots from the readings stored in database for comparison
                        Value("."),
                        Value(""),
                    )
                )
                .filter(normalized_reading__icontains=query)
                .prefetch_related(*kanji_prefetches)
                .distinct()
                .order_by('kanji_id')
            )
        elif query_type == 'romaji':
            #search for the romaji word in the database
            kanji_query_set = Kanji_entry.objects.prefetch_related(*kanji_prefetches).filter(meanings__meaning=query, meanings__lang=lang).order_by('kanji_id')
            #if the query is not recognized as meaning of a word, try to translate the romaji to kana and search again
            if not kanji_query_set.exists():
                kana_query = romaji_to_kana(query)
                kanji_query_set = (
                    Kanji_entry.objects
                    .annotate(
                        normalized_reading=Replace(
                            F("readings__reading"), #remove dots from the readings stored in database for comparison
                            Value("."),
                            Value(""),
                        )
                    )
                    .filter(normalized_reading__icontains=kana_query)
                    .prefetch_related(*kanji_prefetches)
                    .distinct()
                    .order_by('kanji_id')
                )
        
        #append data to results
        paginator = Paginator(kanji_query_set, page_size)
        page_obj = paginator.get_page(page)
        if kanji_query_set:
            for data in page_obj:
                id = data.kanji_id
                kanji = data.kanji
                readings = list(data.readings.all())
                onyomi = [reading.reading for reading in readings if reading.reading_type == 'onyomi']
                kunyomi = [reading.reading for reading in readings if reading.reading_type == 'kunyomi']
                strokeCount = data.stroke_count
                jlptLevel = data.jlpt_level
                sino_vietnamese = [item.sino_vietnamese for item in data.sino_vietnamese.all()]
                meaning = [meaning.meaning for meaning in data.meanings.all()]
                results.append({
                    'id': id,
                    'kanji': kanji,
                    'sino_vietnamese': sino_vietnamese,
                    'radicals': data.radicals,
                    'penStroke': data.pen_stroke,
                    'onyomi': onyomi,
                    'kunyomi': kunyomi,
                    'strokeCount': strokeCount,
                    'jlptLevel': jlptLevel,
                    'meaning': meaning
                })
        else:
            kanji_query_set = Kanji_entry.objects.none()
            paginator = Paginator([], page_size)
            page_obj = paginator.get_page(page)
        return JsonResponse({
            'count' : paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'next' : page_obj.next_page_number() if page_obj.has_next() else None,
            'previous' : page_obj.previous_page_number() if page_obj.has_previous() else None,
            'results': results,
        })
    
#class-based view for searching vocabulary words
class VocabularySearchView(View):
    def get(self,request):
        query = request.GET.get('q','')
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        lang = _get_language(request)

        #returns { kanji = [], kana = [], senses = [ { part_of_speech, meanings} ]
        results = []
        vocab_query_set = Vocab_entry.objects.none()
        query_type = query_classify(query)

        vocab_prefetches = (
            Prefetch(
                'writtings',
                queryset=Vocab_writting.objects.order_by('common')
            ),
            Prefetch(
                'senses',
                queryset=Vocab_sense.objects.filter(lang=lang).order_by('position').prefetch_related('meanings')
            ),

        )

        if (query_type == 'kanji'):
            vocab_query_set = Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(
                Q(senses__applied_to_kanji=query) |
                Q(senses__applied_to_kanji="*"),
                writtings__writting=query,
                senses__lang=lang,
            ).distinct().order_by('vocab_id')
        elif query_type == 'kana':
            vocab_query_set = Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(
                Q(senses__applied_to_kana=query) |
                Q(senses__applied_to_kana="*"),
                writtings__writting=query,
                senses__lang=lang,
            ).distinct().order_by('vocab_id')
        elif query_type == 'romaji':
            vocab_query_set = Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(
                senses__meanings__meaning__icontains = query,
                senses__lang=lang,
            ).distinct().order_by('vocab_id')
            if not vocab_query_set.exists():
                kana_query = romaji_to_kana(query)
                vocab_query_set = Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(
                    Q(senses__applied_to_kana=kana_query) |
                    Q(senses__applied_to_kana="*"),
                    writtings__writting=kana_query,
                    senses__lang=lang,
                ).distinct().order_by('vocab_id')

        paginator = Paginator(vocab_query_set, page_size)
        page_obj = paginator.get_page(page)

        for data in page_obj:
            writings = list(data.writtings.all())
            kanji = [item.writting for item in writings if item.writting_type == 'kanji']
            kana = [item.writting for item in writings if item.writting_type == 'kana']
            senses = [{
                'part_of_speech': sense.part_of_speech,
                'meanings': [meaning.meaning for meaning in sense.meanings.all()]
            } for sense in data.senses.all()]
            results.append({
                'id': data.vocab_id,
                'kanji': kanji,
                'kana': kana,
                'senses': senses
            })
        
        return JsonResponse({
            'count' : paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'next': page_obj.next_page_number() if page_obj.has_next() else None,
            'previous' : page_obj.previous_page_number() if page_obj.has_previous() else None,
            'results': results,
        })
    
class GrammarSearchView(View):
    def get(self,request):
        query = request.GET.get('q','')
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        lang = _get_language(request)

        results = []
        grammar_query_set = Grammar_entry.objects.none()
        grammar_prefetches = (
            Prefetch(
                "meanings",
                queryset=Grammar_meaning.objects.filter(lang=lang),
            ),
            Prefetch(
                "examples",
                queryset=Grammar_example.objects.filter(lang=lang),
            ),
        )

        query_type = query_classify(query)
        if (query_type == 'kanji') or (query_type == 'kana'):
            grammar_query_set = Grammar_entry.objects.prefetch_related(*grammar_prefetches).filter(
                Q(examples__lang = lang) &
                Q(meanings__lang = lang) &
                Q(grammar__icontains=query)
        ).order_by('grammar_id').distinct()

        elif query_type == 'romaji':
            grammar_query_set = Grammar_entry.objects.prefetch_related(*grammar_prefetches).filter(
                Q(examples__lang = lang) &
                Q(meanings__lang = lang) &
                Q(meanings__meaning__icontains=query)
            ).order_by('grammar_id').distinct()
            if not grammar_query_set.exists():
                kana_query = romaji_to_kana(query)
                grammar_query_set = Grammar_entry.objects.prefetch_related(*grammar_prefetches).filter(
                    Q(examples__lang = lang) &
                    Q(meanings__lang = lang) &
                    Q(grammar__icontains=kana_query)
                ).order_by('grammar_id').distinct()

        paginator = Paginator(grammar_query_set, page_size)
        page_obj = paginator.get_page(page)

        if grammar_query_set:
            for data in page_obj:
                id = data.grammar_id
                grammar = data.grammar
                formation = data.formation
                meaning = list(data.meanings.values_list("meaning", flat=True))
                jlptLevel = data.jlpt_level
                examples = [{
                    'example_japanese': example.example_japanese,
                    'example_romaji': example.example_romaji,
                    'example_gloss': example.example_gloss,
                } for example in data.examples.all()]
                results.append({
                    'id': id,
                    'grammar': grammar,
                    'formation': formation,
                    'meaning': meaning,
                    'jlpt_level': jlptLevel,
                    'examples': examples
                })
        else:
            grammar_query_set = Grammar_entry.objects.none()
            paginator = Paginator([], page_size)
            page_obj = paginator.get_page(page)
        
        return JsonResponse({
            'count' : paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'next': page_obj.next_page_number() if page_obj.has_next() else None,
            'previous' : page_obj.previous_page_number() if page_obj.has_previous() else None,
            'results': results,
        })

class SuggestionsView(View):
    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return JsonResponse({'suggestions': []})

        lang = _get_language(request)
        query_type = query_classify(query)
        suggestions = []
        vocab_prefetches = (
            Prefetch(
                "writtings",
                queryset=Vocab_writting.objects.order_by('-common', 'vocab_writting_id'),
            ),
            Prefetch(
                "senses",
                queryset=Vocab_sense.objects.filter(lang=lang).prefetch_related("meanings"),
            ),
        )
        kanji_prefetches = (
            Prefetch(
                "meanings",
                queryset=Kanji_meaning.objects.filter(lang=lang),
            ),
        )
        grammar_prefetches = (
                    Prefetch(
                        "meanings",
                        queryset=Grammar_meaning.objects.filter(lang=lang),
                    ),
                )

        def add_kanji(query_set):
            suggestions.extend({
                'type': 'kanji',
                'id': data.kanji_id,
                'text': data.kanji,
                'meaning' : [meaning.meaning for meaning in data.meanings.all()],
            } for data in query_set)

        def add_vocab(query_set):
            for data in query_set:
                text = [writing.writting for writing in data.writtings.all() ]
                suggestions.append({
                    'type': 'vocab',
                    'id': data.vocab_id,
                    'text': text,
                    'meaning': [
                        meaning.meaning
                        for sense in data.senses.all()
                        for meaning in sense.meanings.all()
                    ],
                })

        def add_grammar(query_set):
            suggestions.extend({
                'type': 'grammar',
                'id': data.grammar_id,
                'text': data.grammar,
                'meaning': [meaning.meaning for meaning in data.meanings.all()],
            } for data in query_set)

        if query_type == 'kanji':
            add_kanji(Kanji_entry.objects.prefetch_related(*kanji_prefetches).filter(kanji__startswith=query)[:10])
            add_vocab(Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(writtings__writting__startswith=query).distinct()[:10])
            add_grammar(Grammar_entry.objects.prefetch_related(*grammar_prefetches).filter(grammar__icontains=query).distinct()[:10])

        elif query_type == 'kana':
            kana_query = query.replace(".", "")
            add_kanji(Kanji_entry.objects.annotate(
                normalized_reading=Replace(F("readings__reading"), Value("."), Value("")),
            ).prefetch_related(*kanji_prefetches).filter(normalized_reading__startswith=kana_query).distinct()[:10])
            add_vocab(Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(writtings__writting__startswith=query).distinct()[:10])
            add_grammar(Grammar_entry.objects.prefetch_related(*grammar_prefetches).filter(grammar__icontains=query).distinct()[:10])
        elif query_type == 'romaji':
            kana_query = romaji_to_kana(query)
            add_kanji(Kanji_entry.objects.annotate(
                normalized_reading=Replace(F("readings__reading"), Value("."), Value("")),
            ).prefetch_related(*kanji_prefetches).filter(
                Q(normalized_reading__startswith=kana_query) |
                Q(meanings__lang=lang, meanings__meaning__icontains=query)
            ).distinct()[:10])
            add_vocab(Vocab_entry.objects.prefetch_related(*vocab_prefetches).filter(
                Q(writtings__writting__startswith=kana_query) |
                Q(senses__lang=lang, senses__meanings__meaning__icontains=query)
            ).distinct()[:10])
            add_grammar(Grammar_entry.objects.prefetch_related(*grammar_prefetches).filter(
                Q(grammar__icontains=kana_query) |
                Q(meanings__lang=lang, meanings__meaning__icontains=query)
            ).distinct()[:10])

        return JsonResponse({'suggestions': list(suggestions)})

class FetchRelatedView(viewsets.ModelViewSet):
    http_method_names = ["get", "head", "options"]

    def get_related_kanji(self, request):
        query = request.query_params.get("q", "").strip()
        if not query:
            return Response({"results": []})

        entries = Kanji_entry.objects.prefetch_related(Prefetch(
            "meanings",
            queryset=Kanji_meaning.objects.filter(
                lang=_get_language(request)
            ).order_by("position", "kanji_meaning_id"),
            to_attr="localized_meanings",
        )).filter(kanji__in=set(query))
        entries_by_kanji = {entry.kanji: entry for entry in entries}

        return Response({"results": [
            {
                "kanji_id": entry.kanji_id,
                "kanji": entry.kanji,
                "meaning": [meaning.meaning for meaning in entry.localized_meanings],
            }
            for character in dict.fromkeys(query)
            if (entry := entries_by_kanji.get(character))
        ]})

    def get_related_vocab(self, request):
        query = request.query_params.get("q", "").strip()
        if not query or query_classify(query) != "kanji":
            return Response({"results": []})

        queryset = Vocab_entry.objects.filter(
            writtings__writting_type="kanji",
            writtings__writting__contains=query,
        ).prefetch_related(
            Prefetch(
                "writtings",
                queryset=Vocab_writting.objects.filter(
                    writting_type="kanji",
                    writting__contains=query,
                ).order_by("-common", "vocab_writting_id"),
                to_attr="matching_writings",
            ),
            Prefetch(
                "senses",
                queryset=Vocab_sense.objects.filter(
                    lang=_get_language(request)
                ).order_by("position").prefetch_related(Prefetch(
                    "meanings",
                    queryset=Vocab_meaning.objects.order_by("vocab_meaning_id"),
                )),
                to_attr="localized_senses",
            ),
        ).distinct().order_by("vocab_id")

        page = self.paginate_queryset(queryset)
        entries = page if page is not None else queryset
        results = []
        for entry in entries:
            writing = entry.matching_writings[0].writting
            meanings = (
                meaning.meaning
                for sense in entry.localized_senses
                if sense.applied_to_kanji == "*"
                or writing in sense.applied_to_kanji.split(",")
                for meaning in sense.meanings.all()
                if meaning.meaning
            )
            results.append({
                "vocab_id": entry.vocab_id,
                "writting": writing,
                "meaning": Truncator(next(meanings, "")).chars(20),
            })

        return self.get_paginated_response(results) if page is not None else Response({"results": results})

class DictionaryStatsView(viewsets.ViewSet):
    http_method_names = ["get", "head", "options"]

    def get_dictionary_stats(self, request):
        return JsonResponse({
            'vocabulary': Vocab_entry.objects.count(),
            'kanji': Kanji_entry.objects.count(),
            'grammar': Grammar_entry.objects.count(),
        })

    
    def get_jlpt_kanji(self, request):
        N1_kanji = Kanji_entry.objects.filter(jlpt_level=1)
        N2_kanji = Kanji_entry.objects.filter(jlpt_level=2)
        N3_kanji = Kanji_entry.objects.filter(jlpt_level=3)
        N4_kanji = Kanji_entry.objects.filter(jlpt_level=4)
        N5_kanji = Kanji_entry.objects.filter(jlpt_level=5)

        return JsonResponse({
            'N1': list(N1_kanji.values_list('kanji', flat=True)),
            'N2': list(N2_kanji.values_list('kanji', flat=True)),
            'N3': list(N3_kanji.values_list('kanji', flat=True)),
            'N4': list(N4_kanji.values_list('kanji', flat=True)),
            'N5': list(N5_kanji.values_list('kanji', flat=True)),
        })
    def get_jlpt_vocab(self, request):
        N1_vocab = Vocab_entry.objects.prefetch_related('writtings').filter(jlpt_level=1, writtings__writting_type='kanji')
        N2_vocab = Vocab_entry.objects.prefetch_related('writtings').filter(jlpt_level=2, writtings__writting_type='kanji')
        N3_vocab = Vocab_entry.objects.prefetch_related('writtings').filter(jlpt_level=3, writtings__writting_type='kanji')
        N4_vocab = Vocab_entry.objects.prefetch_related('writtings').filter(jlpt_level=4, writtings__writting_type='kanji')
        N5_vocab = Vocab_entry.objects.prefetch_related('writtings').filter(jlpt_level=5, writtings__writting_type='kanji')

        return JsonResponse({
            'N1': list(N1_vocab.values_list('writtings__writting', flat=True)),
            'N2': list(N2_vocab.values_list('writtings__writting', flat=True)),
            'N3': list(N3_vocab.values_list('writtings__writting', flat=True)),
            'N4': list(N4_vocab.values_list('writtings__writting', flat=True)),
            'N5': list(N5_vocab.values_list('writtings__writting', flat=True)),
        })

    def get_jlpt_grammar(self, request):
        N1_grammar = Grammar_entry.objects.filter(jlpt_level=1)
        N2_grammar = Grammar_entry.objects.filter(jlpt_level=2)
        N3_grammar = Grammar_entry.objects.filter(jlpt_level=3)
        N4_grammar = Grammar_entry.objects.filter(jlpt_level=4)
        N5_grammar = Grammar_entry.objects.filter(jlpt_level=5)

        return JsonResponse({
            'N1': list(N1_grammar.values_list('grammar', flat=True)),
            'N2': list(N2_grammar.values_list('grammar', flat=True)),
            'N3': list(N3_grammar.values_list('grammar', flat=True)),
            'N4': list(N4_grammar.values_list('grammar', flat=True)),
            'N5': list(N5_grammar.values_list('grammar', flat=True)),
        })