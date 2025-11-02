document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('chatbot-input-form');
    const input = document.getElementById('user-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    let selectedLanguage = null;

    // Obiekt z tłumaczeniami dla interfejsu
    const translations = {
        pl: {
            navHome: 'Start',
            navAbout: 'O nas',
            navContact: 'Kontakt',
            chatbotTitle: 'Asystent AI',
            inputPlaceholder: 'Napisz swoją wiadomość...',
            sendButton: 'Wyślij',
            welcomeMessage: 'Witaj! Wybrałeś język polski. Jak mogę Ci pomóc?',
            defaultResponse: 'Niestety, nie rozumiem pytania. Czy możesz je sformułować inaczej? Możesz pytać o Web Development, AI lub Hardware.'
        },
        en: {
            navHome: 'Home',
            navAbout: 'About',
            navContact: 'Contact',
            chatbotTitle: 'AI Assistant',
            inputPlaceholder: 'Type your message here...',
            sendButton: 'Send',
            welcomeMessage: 'Welcome! You have selected English. How can I help you?',
            defaultResponse: "I'm sorry, I don't understand. Could you rephrase your question? You can ask about Web Development, AI, or Hardware."
        },
        suggestions: {
            pl: ['Czym się zajmujecie?', 'Jaki jest koszt instalacji Windowsa?', 'Jak się skontaktować?'],
            en: ['What do you do?', 'What is the price for a Windows installation?', 'How can I contact you?']
        }
    };

    function displayLanguageSelector() {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot-message');

        const p = document.createElement('p');
        p.textContent = 'Proszę wybrać język / Please select a language:';
        messageElement.appendChild(p);

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('language-options');

        const btnPl = document.createElement('button');
        btnPl.textContent = 'Polski';
        btnPl.classList.add('lang-btn');
        btnPl.onclick = () => selectLanguage('pl');

        const btnEn = document.createElement('button');
        btnEn.textContent = 'English';
        btnEn.classList.add('lang-btn');
        btnEn.onclick = () => selectLanguage('en');

        optionsDiv.appendChild(btnPl);
        optionsDiv.appendChild(btnEn);
        messageElement.appendChild(optionsDiv);

        messagesContainer.appendChild(messageElement);
    }

    function selectLanguage(lang) {
        selectedLanguage = lang;
        
        messagesContainer.innerHTML = '';

        document.getElementById('nav-home').textContent = translations[lang].navHome;
        document.getElementById('nav-about').textContent = translations[lang].navAbout;
        document.getElementById('nav-contact').textContent = translations[lang].navContact;
        document.getElementById('chatbot-title').textContent = translations[lang].chatbotTitle;
        document.getElementById('user-input').placeholder = translations[lang].inputPlaceholder;
        document.getElementById('send-button').textContent = translations[lang].sendButton;

        input.disabled = false;
        input.focus();

        addMessage(translations[lang].welcomeMessage, 'bot');
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const userInput = input.value.trim();

        if (userInput) {
            addMessage(userInput, 'user');
            input.value = '';
            handleBotResponse(userInput);
        }
    });

    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageElement.appendChild(paragraph);

        if (sender === 'user') {
            messageElement.classList.add('user-message');
        } else {
            messageElement.classList.add('bot-message');
        }

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function handleBotResponse(userInput) {
        showTypingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userInput,
                    language: selectedLanguage 
                }),
            });

            const data = await response.json();

            // Jeśli odpowiedź z serwera nie jest OK (np. status 500), rzuć błąd z wiadomością od serwera
            if (!response.ok) {
                throw new Error(data.reply || 'Błąd serwera');
            }

            hideTypingIndicator();
            addMessage(data.reply, 'bot');
        } catch (error) {
            console.error('Błąd po stronie frontendu:', error);
            hideTypingIndicator();
            // Wyświetl błąd, który przyszedł z serwera lub domyślną wiadomość
            addMessage(error.message || translations[selectedLanguage].defaultResponse, 'bot');
        }
    }

    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.classList.add('message', 'bot-message');

        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';

        typingElement.appendChild(indicator);
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function showSuggestionChips(lang) {
        const chipsContainer = document.createElement('div');
        chipsContainer.classList.add('suggestion-chips');

        const suggestions = translations.suggestions[lang];

        suggestions.forEach(suggestionText => {
            const chip = document.createElement('button');
            chip.classList.add('chip-btn');
            chip.textContent = suggestionText;
            chip.onclick = () => {
                // Symuluj wpisanie i wysłanie wiadomości przez użytkownika
                addMessage(suggestionText, 'user');
                handleBotResponse(suggestionText);
                // Usuń przyciski po kliknięciu
                const existingChips = messagesContainer.querySelector('.suggestion-chips');
                if (existingChips) existingChips.remove();
            };
            chipsContainer.appendChild(chip);
        });

        messagesContainer.appendChild(chipsContainer);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Inicjalizacja chatbota - wyświetlenie wyboru języka
    displayLanguageSelector();
});