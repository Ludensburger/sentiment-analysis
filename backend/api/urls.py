# sentiment_api/urls.py
from django.urls import path
from api.views.sentimentAnalysisView import SentimentAnalysisView

urlpatterns = [
    path('analyze/', SentimentAnalysisView.as_view(), name='analyze-sentiment'),
]