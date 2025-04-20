# nlp_processor.py
import spacy
import numpy as np
from typing import List, Dict, Any
import logging

class NLPProcessor:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logging.warning("Downloading spaCy model...")
            import os
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
        
    def process_text(self, text: str) -> Dict[str, Any]:
        doc = self.nlp(text)
        
        # Extract entities
        entities = [{
            'text': ent.text,
            'label': ent.label_,
            'start': ent.start_char,
            'end': ent.end_char
        } for ent in doc.ents]
        
        # Extract key phrases (noun chunks)
        key_phrases = [chunk.text for chunk in doc.noun_chunks]
        
        # Extract potential tags
        important_pos = {'NOUN', 'VERB', 'ADJ'}
        tags = list(set(token.lemma_ for token in doc if token.pos_ in important_pos))
        
        return {
            'entities': entities,
            'key_phrases': key_phrases,
            'tags': tags
        }

    def find_relationships(self, text1: str, text2: str) -> Dict[str, Any]:
        doc1 = self.nlp(text1)
        doc2 = self.nlp(text2)
        
        # Get shared entities
        entities1 = {(ent.text, ent.label_) for ent in doc1.ents}
        entities2 = {(ent.text, ent.label_) for ent in doc2.ents}
        shared_entities = [
            {'text': text, 'label': label}
            for text, label in entities1 & entities2
        ]
        
        # Calculate basic similarity using spaCy
        similarity = doc1.similarity(doc2)
        
        # Determine relationship type
        if similarity > 0.8:
            relationship_type = 'very_similar'
        elif similarity > 0.6:
            relationship_type = 'related'
        else:
            relationship_type = 'somewhat_related'
        
        return {
            'similarity': float(similarity),
            'relationship_type': relationship_type,
            'shared_entities': shared_entities
        }