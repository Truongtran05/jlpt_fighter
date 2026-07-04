from django.views import View
from .models import Kanji_entry,Vocab_entry, Grammar_entry
from utils.string_utility import query_classify, romaji_to_kana
from django.http import JsonResponse
from django.core.paginator import Paginator 
from django.db.models import F, Value
from django.db.models.functions import Replace

#class-based view for searching kanji characters
class KanjiSearchView(View):
    def get(self, request):
        #get the search query from the request
        query = request.GET.get('q','')
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)
        
        #return { kanji, onyomi = [], kunyomi = [], strokeCount, jlptLevel, meaning = [] }
        results = []
        kanji_query_set = Kanji_entry.objects.none()

        #Recognize the query as a kanji character or a word
        query_type = query_classify(query)
        if query_type == 'kanji':
            #search for the kanji character in the database
            kanji_query_set = Kanji_entry.objects.prefetch_related('readings', 'meanings').filter(kanji=query).order_by('kanji_id')
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
                .prefetch_related("readings", "meanings")
                .distinct()
                .order_by('kanji_id')
            )
        elif query_type == 'romaji':
            #search for the romaji word in the database
            kanji_query_set = Kanji_entry.objects.prefetch_related('readings', 'meanings').filter(meanings__meaning=query).order_by('kanji_id')
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
                    .prefetch_related("readings", "meanings")
                    .distinct()
                )
        
        #append data to results
        paginator = Paginator(kanji_query_set, page_size)
        page_obj = paginator.get_page(page)
        if kanji_query_set:
            for data in page_obj:
                id = data.kanji_id
                kanji = data.kanji
                onyomi = [reading.reading for reading in data.readings.filter(reading_type='onyomi')]
                kunyomi = [reading.reading for reading in data.readings.filter(reading_type='kunyomi')]
                strokeCount = data.stroke_count
                jlptLevel = data.jlpt_level
                meaning = [meaning.meaning for meaning in data.meanings.all()]
                results.append({
                    'id': id,
                    'kanji': kanji,
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

        #returns { kanji = [], kana = [], meaning = []}
        results = []
        vocab_query_set = Vocab_entry.objects.none()

        query_type = query_classify(query)
        if (query_type == 'kanji') or (query_type == 'kana'):
            vocab_query_set = Vocab_entry.objects.prefetch_related('writtings','meanings').filter(writtings__writting = query).order_by('vocab_id')
        elif query_type == 'romaji':
            vocab_query_set = Vocab_entry.objects.prefetch_related('writtings','meanings').filter(meanings__meaning = query).order_by('vocab_id')
            if not vocab_query_set.exists():
                kana_query = romaji_to_kana(query)
                vocab_query_set = Vocab_entry.objects.prefetch_related('writtings','meanings').filter(writtings__writting = kana_query).order_by('vocab_id')

        paginator = Paginator(vocab_query_set, page_size)
        page_obj = paginator.get_page(page)

        if vocab_query_set:
            for data in page_obj:
                id = data.vocab_id
                kanji = [writting.writting for writting in data.writtings.filter(writting_type = 'kanji')]
                kana = [writting.writting for writting in data.writtings.filter(writting_type = 'kana')]
                meaning = [meaning.meaning for meaning in data.meanings.all()]
                results.append({
                    'id': id,
                    'kanji': kanji,
                    'kana': kana,
                    'meaning': meaning
                })
        else:
            vocab_query_set = Vocab_entry.objects.none()
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
    
class GrammarSearchView(View):
    def get(self,request):
        query = request.GET.get('q','')
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 20)

        results = []
        grammar_query_set = Grammar_entry.objects.none()

        query_type = query_classify(query)
        if (query_type == 'kanji') or (query_type == 'kana'):
            grammar_query_set = Grammar_entry.objects.prefetch_related('examples').filter(grammar__icontains=query).order_by('grammar_id')
        elif query_type == 'romaji':
            grammar_query_set = Grammar_entry.objects.prefetch_related('examples').filter(meaning__icontains=query).order_by('grammar_id')
            if not grammar_query_set.exists():
                kana_query = romaji_to_kana(query)
                grammar_query_set = Grammar_entry.objects.prefetch_related('examples').filter(grammar__icontains=kana_query).order_by('grammar_id')

        paginator = Paginator(grammar_query_set, page_size)
        page_obj = paginator.get_page(page)

        if grammar_query_set:
            for data in page_obj:
                id = data.grammar_id
                grammar = data.grammar
                formation = data.formation
                meaning = data.meaning
                jlptLevel = data.jlpt_level
                examples = [{
                    'example_japanese': example.example_japanese,
                    'example_romaji': example.example_romaji,
                    'example_english': example.example_english
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