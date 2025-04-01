# sentiment_api/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import string
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# You can also import spacy if you want to do more advanced preprocessing
import spacy
try:
    nlp = spacy.load('en_core_web_sm') # Load a model if you downloaded one
except OSError:
    print("Downloading en_core_web_sm model for spaCy...")
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load('en_core_web_sm')

class SentimentAnalysisView(APIView):
    """
    API view to handle sentiment analysis requests.
    """
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Initialize the VADER sentiment analyzer once when the view is created
        # This is slightly more efficient than initializing it on every request
        try:
            self.analyzer = SentimentIntensityAnalyzer()
        except LookupError:
            print("VADER lexicon not found. Downloading...")
            nltk.download('vader_lexicon')
            self.analyzer = SentimentIntensityAnalyzer()

    def preprocess_text_lowercase(self, text):
        """1. Lowercasing"""
        return text.lower()

    def preprocess_text_remove_punctuation(self, text):
        """2. Removing punctuation"""
        return text.translate(str.maketrans('', '', string.punctuation))


    def preprocess_text_spacy_lemmatization(self, text):
        """3. Using spaCy for lemmatization"""
        doc = nlp(text)
        return " ".join([token.lemma_ for token in doc])

    def preprocess_text_nltk_stopwords(self, text):
        """4. Stop word removal (common words like 'the', 'is', 'in')"""
        stop_words = set(stopwords.words('english'))
        word_tokens = word_tokenize(text)
        filtered_sentence = [w for w in word_tokens if not w.lower() in stop_words]
        return " ".join(filtered_sentence)

    def post(self, request, format=None):
        """
        Accepts POST requests with 'text' data and returns sentiment.
        Applies all the preprocessing steps mentioned in the comments.
        **Note:** Applying all these steps might not always lead to the best accuracy with VADER.
        Experiment and choose the preprocessing steps that work best for your specific data.
        """
        text = request.data.get('text', None)

        if not text:
            return Response({"error": "No text provided"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Text Preprocessing Section ---
        processed_text = text

        # 1. Lowercasing
        processed_text = self.preprocess_text_lowercase(processed_text)

        # 2. Removing punctuation
        processed_text = self.preprocess_text_remove_punctuation(processed_text)

        # 3. Using spaCy for lemmatization
        processed_text = self.preprocess_text_spacy_lemmatization(processed_text)

        # 4. Stop word removal
        processed_text = self.preprocess_text_nltk_stopwords(processed_text)

        # --- End of Text Preprocessing Section ---

        # Perform sentiment analysis using VADER
        scores = self.analyzer.polarity_scores(processed_text)

        # --- Sentiment Interpretation Logic ---
        compound_score = scores['compound']
        if compound_score >= 0.05:
            sentiment = "Positive"
        elif compound_score <= -0.05:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        # --- End of Sentiment Interpretation Logic ---

        return Response({
            'sentiment': sentiment,
            'nltk_scores': scores,
            'processed_text': processed_text  # Return processed text for debugging/analysis
        }, status=status.HTTP_200_OK)