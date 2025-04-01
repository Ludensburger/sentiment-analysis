# Sentiment Analysis App

This is a simple Natural Language Processing (NLP) activity that determines the sentiment of a user's input. The app analyzes whether the sentiment is **positive**, **neutral**, or **negative**. This project serves as the initial foundation for building a more comprehensive application, evolving throughout the course until the finals.

## Features

- **User Input Sentiment Analysis**: Users can enter text, and the app will determine the sentiment.
- **Interactive Chat Interface**: A chat-like interface enhances user interaction.
- **Sentiment Visualization**: Uses icons and colors for clear sentiment representation.
- **Backend Integration**: A Django REST API processes sentiment analysis.
- **Frontend Framework**: Built with Angular for a dynamic and responsive UI.

## Technologies Used

### Frontend

- **Angular**: For building the user interface.
- **Tailwind CSS**: For styling.
- **Font Awesome**: For sentiment icons.

### Backend

- **Django**: Manages API requests.
- **Django REST Framework**: Enables REST API functionality.
- **NLTK (Natural Language Toolkit)**: Implements VADER Sentiment Analyzer for analysis.

## How to Run the Project

### Prerequisites

- Install **Node.js** and **npm** for the frontend.
- Install **Python** and **pip** for the backend.

### Steps to Run

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/Ludensburger/sentiment-analysis
   cd sentiment-analysis
   ```

2. **Run the Backend**:

   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py runserver
   # Alternatively, you can use the following command:
   run
   ```

3. **Run the Frontend**:

   ```bash
   cd sentiment_frontend
   npm install
   ng serve
   # Alternatively, you can use the following command:
   run
   ```

4. **Access the App**:
   Open your browser and navigate to [http://localhost:4200/](http://localhost:4200/).

## Future Plans

This project will be expanded throughout the course to include:

- **Advanced NLP Features**: Emotion detection and text summarization.
- **User Authentication**: Personalizing user experience.
- **Data Visualization**: Displaying sentiment trends over time.

## License

This project is for educational purposes and is not licensed for commercial use.
