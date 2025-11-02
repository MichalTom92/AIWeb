const express = require('express');
const path = require('path');
const { HfInference } = require('@huggingface/inference');
// Usunięto require('dotenv'), ponieważ Vercel zarządza zmiennymi środowiskowymi.

const app = express();
const port = 3000;

// --- KONFIGURACJA ---

// Inicjalizacja klienta Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
// Zmieniamy model na Llama-3, który jest nowszy i bardzo stabilny.
const modelName = "meta-llama/Meta-Llama-3-8B-Instruct";

// Treść z Twojego PDF
const pdfContent = `
Tutaj wklej całą treść ze swojego pliku PDF.
Na przykład: Nasza firma IT, Innovatech, specjalizuje się w trzech obszarach.
Po pierwsze, tworzymy strony internetowe w cenach od 100 do 5000 funtów.
Po drugie, wdrażamy rozwiązania AI, a koszt konsultacji to 100 funtów za godzinę.
Po trzecie, oferujemy sprzedaż sprzętu komputerowego. Instalacja systemu Windows kosztuje 30 funtów.
Nasz email kontaktowy to mikrutcn@gmail.com.
`;

// --- SERWER ---

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const lang = req.body.language;

    try {
        // Używamy funkcji 'chatCompletion', która jest stworzona do modeli konwersacyjnych.
        const result = await hf.chatCompletion({
            model: modelName,
            messages: [
                // Wiadomość systemowa definiuje rolę i zachowanie bota
                { role: "system", content: `Jesteś asystentem klienta firmy IT. Twoim jedynym źródłem wiedzy jest poniższy KONTEKST.

NAJWAŻNIEJSZA ZASADA: Zawsze odpowiadaj w języku: ${lang}.

DRUGA ZASADA: Odpowiadaj WYŁĄCZNIE na podstawie informacji znalezionych w KONTEKŚCIE. Jeśli pytanie dotyczy czegoś, o czym nie ma informacji w KONTEKŚCIE, odpowiedz grzecznie, że nie posiadasz takich informacji. Nie wymyślaj odpowiedzi.

KONTEKST: ###
${pdfContent}
###` },
                // Wiadomość od użytkownika
                { role: "user", content: userMessage }
            ],
            // Parametry muszą być na tym samym poziomie co 'model' i 'messages'
            max_tokens: 250 // Używamy 'max_tokens' dla tego endpointu
        });

        // W odpowiedzi z 'chatCompletion', tekst bota znajduje się w polu 'choices[0].message.content'
        const botResponse = result.choices[0].message.content;
        res.json({ reply: botResponse });

    } catch (error) {
        console.error("==============================================");
        console.error("WYSTĄPIŁ BŁĄD PODCZAS KOMUNIKACJI Z API HUGGING FACE:");
        console.error(error);
        console.error("==============================================");
        res.status(500).json({ reply: "Przepraszam, mam chwilowy problem z połączeniem z moją bazą wiedzy. Spróbuj ponownie za chwilę." });
    }
});

// Usuwamy app.listen(), ponieważ Vercel sam zarządza uruchamianiem serwera.
// Zamiast tego eksportujemy naszą aplikację, aby Vercel mógł jej użyć.
module.exports = app;

// Lokalnie serwer już się nie uruchomi komendą `node back/server.js`,
// ale będzie działał idealnie po wdrożeniu na Vercel.
