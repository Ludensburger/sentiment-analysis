import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
// --- Import Angular animation functions ---
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
// ---                                ---

// Interface for NltkScores (assuming VADER structure)
interface NltkScores {
  pos: number;
  neu: number;
  neg: number;
  compound: number;
}

// Define message structure type alias for clarity
type ChatMessage = {
  text: string;
  type: 'user' | 'bot';
  sentiment?: string;
  score?: number;
  nltk_scores?: NltkScores;
  id: number;
};

@Component({
  selector: 'app-sentiment',
  standalone: false, // Keep as false if you are using NgModules
  templateUrl: './sentiment.component.html',
  styleUrls: ['./sentiment.component.css'],
  // --- Add animations metadata ---
  animations: [
    // Animation for Chat container and Input field appearing/disappearing
    trigger('fadeSlideInOut', [
      transition(':enter', [
        // void => *
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        // * => void
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'translateY(10px)' })
        ),
      ]),
    ]),
    // Animation for individual messages entering/leaving the *ngFor list
    trigger('messageAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ opacity: 0, transform: 'scale(0.9)' })
        ),
      ]),
    ]),
  ],
  // --- End animations ---
})
export class SentimentComponent implements OnInit {
  sentence: string = '';
  messages: ChatMessage[] = []; // Use the type alias
  maxTotalMessages: number = 6;
  chatStarted: boolean = false;
  buttonText: string = 'Start';
  placeholderText: string = 'Click Start to begin';
  private nextMessageId = 0; // Counter for unique message IDs

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  /**
   * TrackBy function for *ngFor message list to improve performance.
   */
  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }

  /**
   * Handles the main interaction: starts the chat or analyzes sentiment.
   */
  startOrSend(): void {
    if (!this.chatStarted) {
      this.startChat();
    } else {
      if (this.sentence.trim()) {
        this.analyzeSentiment();
      }
    }
  }

  exitChat() {
    this.chatStarted = false;
    this.sentence = ''; // Clear input when exiting
    this.messages = []; // Clear messages if needed
    this.buttonText = 'Start';
    this.placeholderText = 'Click Start to begin';
    this.cdr.detectChanges(); // Detect changes to show container/input
    this.scrollToBottom(); // Scroll to top after clearing messages
  }

  /**
   * Initializes the chat: adds the first bot message and updates UI state.
   */
  private startChat(): void {
    this.chatStarted = true;
    this.buttonText = 'Send';
    this.placeholderText = 'Type your message...';
    this.cdr.detectChanges(); // Detect changes to show container/input

    // Add initial bot message slightly deferred
    setTimeout(() => {
      this.addMessageToList({
        id: this.nextMessageId++,
        text: 'Do you want to say something?',
        type: 'bot',
      });
      this.scrollToBottomAfterRender(); // Scroll after adding
    }, 0);
  }

  /**
   * Analyzes the sentiment of the current sentence (only called when chatStarted is true).
   */
  private analyzeSentiment() {
    const currentSentence = this.sentence.trim();
    const userMessageId = this.nextMessageId++;

    // Add user message immediately
    this.addMessageToList({
      id: userMessageId,
      text: currentSentence,
      type: 'user',
    });

    this.sentence = ''; // Clear input now
    this.scrollToBottomAfterRender(); // Scroll after adding user message

    // Call API
    this.http
      .post<{ sentiment: string; nltk_scores: NltkScores }>(
        'http://localhost:8000/api/analyze/',
        { text: currentSentence }
      )
      .subscribe({
        next: (response) => {
          let botMessageText = 'Unexpected response structure.';
          let botSentiment: string | undefined = undefined;
          let derivedScore: number | undefined = undefined;
          let originalNltkScores: NltkScores | undefined = undefined;

          if (response?.sentiment && response.nltk_scores != null) {
            botSentiment = response.sentiment.toLowerCase();
            originalNltkScores = response.nltk_scores;
            // *** Calling the FULL getFriendlyMessage implementation ***
            botMessageText = this.getFriendlyMessage(response.sentiment);

            if (typeof originalNltkScores.compound === 'number') {
              derivedScore = originalNltkScores.compound;
            } else {
              console.warn(
                "Could not find valid 'compound' score in nltk_scores:",
                originalNltkScores
              );
            }
          } else {
            console.warn(
              "API response missing 'sentiment' or 'nltk_scores' property:",
              response
            );
          }

          // Add bot response
          this.addMessageToList({
            id: this.nextMessageId++,
            text: botMessageText, // Should have the correct text now
            type: 'bot',
            sentiment: botSentiment,
            score: derivedScore,
            nltk_scores: originalNltkScores,
          });
          this.scrollToBottomAfterRender();
        },
        error: (error) => {
          console.error('API Error:', error);
          this.addMessageToList({
            id: this.nextMessageId++,
            text: "Sorry, I couldn't analyze the sentiment right now. Please try again.",
            type: 'bot',
          });
          this.scrollToBottomAfterRender();
        },
      });
  }

  /**
   * Safely adds a message and handles trimming.
   */
  private addMessageToList(message: ChatMessage) {
    this.messages.push(message);
    this.trimOldestMessageIfLimitExceeded(); // Trim *after* adding
    this.cdr.detectChanges(); // Ensure view updates before potential scroll
  }

  /**
   * Scrolls to bottom slightly deferred to allow animations to start.
   */
  private scrollToBottomAfterRender() {
    setTimeout(() => this.scrollToBottom(), 50); // Adjust delay if needed
  }

  /**
   * Generates a random friendly message based on the sentiment label.
   * --- THIS IS THE FULL IMPLEMENTATION ---
   */
  private getFriendlyMessage(sentiment: string): string {
    const positiveResponses = [
      'That sounds amazing! 🌟',
      'Positive vibes detected! 😊',
      "I'm loving the energy! ✨",
      "That's quite encouraging!",
      'Optimistic outlook! 🌈',
      'Keep up the great spirit! 🎉',
      'Such a refreshing perspective! ☀️',
      'Joyful thoughts! 😄',
      'That’s truly motivating! 💡',
      'Positivity at its finest! 🌺',
    ];
    const neutralResponses = [
      "That's alright 🤔",
      'Keeping it balanced.',
      'Middle ground detected.',
      'Neither here nor there.',
      "That's fairly neutral.",
      'A steady perspective.',
      'Neutral vibes incoming.',
      'Staying in the middle.',
      'Neither positive nor negative.',
      'A balanced outlook.',
    ];
    const negativeResponses = [
      "That doesn't sound good... 😕",
      'Not the best news. 😟',
      'That seems concerning.',
      'I sense some negativity.',
      'Hmm, that could be better. 😬',
      'Oh no, that’s unfortunate. 😔',
      'That might be tough to deal with. 😣',
      'I hope things improve soon. 🌱',
      'That’s a bit disheartening. 💔',
      "That's not nice. 😢",
    ];

    let responses: string[];
    // Use toLowerCase for case-insensitive comparison, add null check
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        responses = positiveResponses;
        break;
      case 'negative':
        responses = negativeResponses;
        break;
      default: // Covers 'neutral' and any unexpected/null values
        responses = neutralResponses;
        break;
    }

    // Basic check if somehow the arrays were empty (shouldn't happen here)
    if (!responses || responses.length === 0) {
      console.error(
        'No responses array found or array is empty for sentiment:',
        sentiment
      );
      return 'Error: Response generation failed.'; // Return error text
    }

    // Generate a random index to pick a response
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex]; // Return the actual response string
  }
  // --- END OF FULL getFriendlyMessage ---

  /**
   * Checks if the total number of messages exceeds maxTotalMessages and trims.
   * --- THIS IS THE FULL IMPLEMENTATION ---
   */
  private trimOldestMessageIfLimitExceeded() {
    if (this.messages.length > this.maxTotalMessages) {
      this.messages.shift(); // Removes the element at index 0
      console.log(`Trimmed oldest message. New count: ${this.messages.length}`); // Optional: for debugging
      // Trigger CD if needed after array modification, especially if trim happens often
      this.cdr.detectChanges();
    }
  }
  // --- END OF FULL trimOldestMessageIfLimitExceeded ---

  /**
   * Scrolls the chat container element to the bottom.
   * --- THIS IS THE FULL IMPLEMENTATION ---
   */
  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      try {
        if (this.chatContainer?.nativeElement) {
          const element = this.chatContainer.nativeElement;
          element.scrollTop = element.scrollHeight;
          // Detect changes after scroll manipulation
          this.cdr.detectChanges();
        }
      } catch (err) {
        console.error('Failed to scroll to bottom:', err);
      }
    });
    // Initial detect changes before RAF
    this.cdr.detectChanges();
  }
  // --- END OF FULL scrollToBottom ---
} // End of component class
