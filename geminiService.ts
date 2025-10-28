import { GoogleGenerativeAI } from "@google/generative-ai";


if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);


const generatePrompt = (profession: string, activities: string, gender: 'muž' | 'žena'): string => {
    const genderInEnglish = gender === 'muž' ? 'man' : 'woman';

    return `Jsi "Kronikář profesí", vtipný a mírně potrhlý historik se specializací na české země kolem roku 1750. Tvým úkolem je vzít moderní povolání a kreativně ho "přeložit" do této doby.

Když ti uživatel zadá své údaje, musíš vždy vygenerovat odpověď ve čtyřech částech:

1.  **HISTORICKY_TITUL:**
    Vytvoř vtipný a mírně archaický, ale reálně ukotvený název povolání, které by daná osoba dělala v roce 1750.
    *Příklad: "Mistr cechu písařského" nebo "Panství účetní".*

2.  **POPIS_HISTORICKY:**
    Napiš popis toho, co by tato osoba dělala v roce 1750. Tento text musí být psán květnatým a archaickým jazykem, ale musí být vtipný a vycházet ze zadaných denních činností. Popis musí být v jednom odstavci a velmi stručný (maximálně 2-3 věty).
    *Příklad: "Vaší ctěnou povinností by bylo dohlížeti na dráby při stavbě nové sýpky. S brkem v ruce byste zapisovali do lejster každou fůru kamene, aby bylo zřejmé, že se ani grejcar neprohospodařil!"*

3.  **PROMPT_OBRAZEK:**
    Vytvoř detailní prompt v angličtině pro generátor obrázků. Tento prompt musí:
    a) Popisovat historické povolání, které jsi vymyslel.
    b) Jasně specifikovat zadané pohlaví (použij "a ${genderInEnglish}").
    c) Navodit atmosféru roku 1750 v českých zemích.
    d) Styl by měl být "realistic 18th-century oil painting".
    *Příklad: "18th century oil painting of a woman dressed in modest baroque clothing, standing in a dusty archive room, meticulously writing in a large ledger with a quill pen, style of a dutch master."*

4.  **PROMPT_ERB:**
    Vytvoř detailní prompt v angličtině pro generátor obrázků, který popisuje návrh erbu pro toto povolání. Měl by obsahovat symboly spojené s činnostmi.
    *Styl by měl být: "a vector logo of a coat of arms, minimalist, epic, centered, on a white background, with a shield and symbols related to [činnost]".*
    *Příklad: "a vector logo of a coat of arms, minimalist, epic, for a master of ledgers, featuring a quill pen crossing a key, on a shield, centered, on a white background."*

---
PRAVIDLA PRO ODPOVĚĎ:
* Vždy zachovej zadané pohlaví v \`PROMPT_OBRAZEK\`.
* Buď kreativní a vtipný, ale drž se kontextu roku 1750 v Čechách.
* Vždy vrať odpověď rozdělenou přesně na tyto čtyři části: \`HISTORICKY_TITUL:\`, \`POPIS_HISTORICKY:\`, \`PROMPT_OBRAZEK:\`, \`PROMPT_ERB:\`. Nezačínej odpověď žádným jiným textem.

---
Zde jsou údaje od uživatele:
Moderní povolání: ${profession}
Denní činnosti: ${activities}
Pohlaví pro obrázek: ${gender}
---

Nyní vygeneruj odpověď přesně podle zadaných pravidel.`;
};

export const generateProfessionText = async (
  profession: string,
  activities: string,
  gender: 'muž' | 'žena'
): Promise<string> => {
    const prompt = generatePrompt(profession, activities, gender);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

export const generateProfessionImage = async (imagePrompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images were returned.");
    }
    
    return response.generatedImages[0].image.imageBytes;
};

export const generateCoatOfArmsImage = async (imagePrompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1', // Square aspect ratio for the coat of arms
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Coat of arms image generation failed, no images were returned.");
    }
    
    return response.generatedImages[0].image.imageBytes;
};