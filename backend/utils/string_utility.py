import re
import romkan2 
def query_classify(query):
    kanji_pattern = r'[\u4e00-\u9fff]'
    kana_pattern = r'[\u3040-\u309f\u30a0-\u30ff]'
    romaji_pattern = r'[a-zA-Z]'
    query = query.strip()
    if(re.search(kanji_pattern, query)):
        return 'kanji'
    elif(re.search(kana_pattern, query)):
        return 'kana'
    elif(re.search(romaji_pattern, query)):
        return 'romaji'
    else:
        return 'unknown'
    
def romaji_to_kana(romaji):
    return romkan2.to_hiragana(romaji)

def kana_to_romaji(kana):
    return romkan2.to_roma(kana)
