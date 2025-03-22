const sourceLanguageSelect = document.getElementById('sourceLanguage');
const targetLanguageSelect = document.getElementById('targetLanguage');
const toggleTranscriptionButton = document.getElementById('toggleTranscription');
const transcriptDiv = document.getElementById('transcript');
const translationDiv = document.getElementById('translation');
const playTranslationButton = document.getElementById('playTranslation');

// Placeholder for languages
const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'zh', name: 'Chinese (Mandarin)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' }
];

// Populate language dropdowns
function populateLanguageDropdowns() {
    languages.forEach(language => {
        const sourceOption = document.createElement('option');
        sourceOption.value = language.code;
        sourceOption.textContent = language.name;
        sourceLanguageSelect.appendChild(sourceOption);

        const targetOption = document.createElement('option');
        targetOption.value = language.code;
        targetOption.textContent = language.name;
        targetLanguageSelect.appendChild(targetOption);
    });
}

let recognition;

// Transcription functionality
function startTranscription() {
    console.log('Transcription started...');
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = sourceLanguageSelect.value;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        transcriptDiv.textContent = finalTranscript + interimTranscript;

        // Translate the text
        if (finalTranscript) {
            const translatedText = translateText(finalTranscript, sourceLanguageSelect.value, targetLanguageSelect.value);
            translationDiv.textContent = translatedText;
        }
    };

     recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        transcriptDiv.textContent = 'Error occurred during transcription.';
        toggleTranscriptionButton.textContent = 'Start Transcription';

    }
    recognition.onend = () => {
      console.log("on end");
      if(toggleTranscriptionButton.textContent === 'Stop Transcription'){
        startTranscription();
      }
    }

    recognition.start();
}

function stopTranscription() {
    console.log('Transcription stopped.');
    if (recognition) {
        recognition.stop();
    }
}

// Translation functionality
async function translateText(text, sourceLanguage, targetLanguage) {
    console.log(`Translating "${text}" from ${sourceLanguage} to ${targetLanguage}...`);
    // In a real application, this would be a call to a secure translation API.
    try {
        const response = await fetch('http://127.0.0.1:5000/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLanguage,
                target_lang: targetLanguage
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            translationDiv.textContent = data.translation;
            playBtn.disabled = false;
        } else {
            translationDiv.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        console.error('Translation error:', error);
    }
}

// Audio playback functionality
function playTranslatedText(text) {
    console.log(`Playing translated text: ${text}`);
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLanguageSelect.value;
        speechSynthesis.speak(utterance);
    } else {
        console.error('Speech synthesis not supported.');
        alert('Speech synthesis is not supported in your browser.');
    }
}

// Event Listeners
toggleTranscriptionButton.addEventListener('click', () => {
  if (toggleTranscriptionButton.textContent === 'Start Transcription') {
    startTranscription();
    toggleTranscriptionButton.textContent = 'Stop Transcription';
  } else {
    stopTranscription();
    toggleTranscriptionButton.textContent = 'Start Transcription';
  }
});

playTranslationButton.addEventListener('click', () => {
    const translatedText = translationDiv.textContent;
    if (translatedText) {
        playTranslatedText(translatedText);
    }
});

// Initialize
populateLanguageDropdowns();