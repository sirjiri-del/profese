import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { InputForm, UserInput } from './InputForm';
import { OutputDisplay } from './OutputDisplay';
import { generateProfessionText, generateProfessionImage, generateCoatOfArmsImage } from './services/geminiService';

export interface GeneratedContent {
  title: string;
  historicalDescription: string;
  imagePrompt: string;
  imageUrl: string;
  coatOfArmsPrompt: string;
  coatOfArmsImageUrl: string;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const parseResponse = (responseText: string): Omit<GeneratedContent, 'imageUrl' | 'coatOfArmsImageUrl'> => {
    const sections: { [key: string]: string } = {};
    const keys = ["HISTORICKY_TITUL", "POPIS_HISTORICKY", "PROMPT_OBRAZEK", "PROMPT_ERB"];
    let remainingText = responseText;

    for (let i = 0; i < keys.length; i++) {
        const currentKey = keys[i];
        const nextKey = i + 1 < keys.length ? keys[i+1] : null;
        
        const keyPattern = new RegExp(`^${currentKey}:`, 'im');
        if (!keyPattern.test(remainingText.trim())) {
           continue; 
        }

        let content;
        if (nextKey) {
            const nextKeyPattern = new RegExp(`${nextKey}:`, 'im');
            const split = remainingText.split(nextKeyPattern);
            content = split[0].replace(keyPattern, '').trim();
            remainingText = nextKey + ":" + (split[1] || '');
        } else {
            content = remainingText.replace(keyPattern, '').trim();
        }
        sections[currentKey] = content;
    }

    return {
      title: sections["HISTORICKY_TITUL"] || "Titul nenalezen",
      historicalDescription: sections["POPIS_HISTORICKY"] || "Historický popis nenalezen",
      imagePrompt: sections["PROMPT_OBRAZEK"] || "Prompt pro obrázek nenalezen",
      coatOfArmsPrompt: sections["PROMPT_ERB"] || "Prompt pro erb nenalezen",
    };
  };

  const handleSubmit = useCallback(async (input: UserInput) => {
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const textResponse = await generateProfessionText(input.profession, input.activities, input.gender);
      const parsedText = parseResponse(textResponse);
      
      if (!parsedText.imagePrompt || parsedText.imagePrompt === "Prompt pro obrázek nenalezen" || !parsedText.coatOfArmsPrompt) {
        throw new Error("Nepodařilo se vygenerovat prompty pro obrázky z textové odpovědi.");
      }

      const [imageBase64, coatOfArmsBase64] = await Promise.all([
          generateProfessionImage(parsedText.imagePrompt),
          generateCoatOfArmsImage(parsedText.coatOfArmsPrompt)
      ]);

      const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
      const coatOfArmsImageUrl = `data:image/jpeg;base64,${coatOfArmsBase64}`;

      setGeneratedContent({ ...parsedText, imageUrl, coatOfArmsImageUrl });

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? `Nastala chyba: ${e.message}` : 'Došlo k neznámé chybě.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-amber-50/80 bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')]">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Header />
        <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="w-full">
            <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
          <div className="w-full">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-white/50 border border-stone-300 rounded-lg shadow-lg backdrop-blur-sm h-full min-h-[300px]">
                <svg className="animate-spin h-12 w-12 text-stone-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-stone-700 font-cinzel text-lg">Kronikář přemítá a malíř míchá barvy...</p>
              </div>
            )}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md" role="alert">
                <strong className="font-bold">Ach, běda! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {generatedContent && !isLoading && (
              <OutputDisplay content={generatedContent} />
            )}
             {!generatedContent && !isLoading && !error && (
                <div className="flex flex-col items-center justify-center p-8 bg-white/50 border border-stone-300 rounded-lg shadow-lg backdrop-blur-sm min-h-[300px]">
                    <p className="text-center text-stone-600 font-cinzel text-lg">
                        Vznešený pane či paní,<br/> svěřte mi své řemeslo a já Vám odhalím Vaše místo v análech historie!
                    </p>
                </div>
            )}
          </div>
        </div>
        <footer className="text-center mt-12 text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Cech kronikářů a písařů. Všechna práva vyhrazena.</p>
        </footer>
      </main>
    </div>
  );
};

export default App;