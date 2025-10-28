import React, { useRef, useEffect, useState } from 'react';
import type { GeneratedContent } from '../App';

interface OutputDisplayProps {
  content: GeneratedContent;
}

// Helper function to wrap text on the canvas
const wrapText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number => {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line.trim(), x, currentY);
  return currentY;
};


export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [posterUrl, setPosterUrl] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState<boolean>(true);

    useEffect(() => {
        if (!content?.imageUrl || !content?.coatOfArmsImageUrl) return;

        setIsRendering(true);
        setPosterUrl(null);
        
        const createPoster = async () => {
            await document.fonts.ready;

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (!canvas || !ctx) return;

            const POSTER_WIDTH = 1000;
            const POSTER_HEIGHT = 1700;
            const PADDING = 60;
            const BG_COLOR = '#FFFBEB';
            const TEXT_COLOR = '#44403c';
            const BORDER_COLOR = '#d6d3d1';

            canvas.width = POSTER_WIDTH;
            canvas.height = POSTER_HEIGHT;

            ctx.fillStyle = BG_COLOR;
            ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

            const mainImage = new Image();
            mainImage.src = content.imageUrl;

            const coaImage = new Image();
            coaImage.src = content.coatOfArmsImageUrl;

            try {
                await Promise.all([
                    new Promise((resolve, reject) => { mainImage.onload = resolve; mainImage.onerror = reject; }),
                    new Promise((resolve, reject) => { coaImage.onload = resolve; coaImage.onerror = reject; }),
                ]);

                // Draw Main Image
                const imageWidth = POSTER_WIDTH - PADDING * 2;
                const imageHeight = imageWidth * (9 / 16);
                const imageX = PADDING;
                const imageY = PADDING;

                ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                ctx.shadowBlur = 20;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 10;
                ctx.drawImage(mainImage, imageX, imageY, imageWidth, imageHeight);
                ctx.strokeStyle = BORDER_COLOR;
                ctx.lineWidth = 2;
                ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                
                // Draw Text
                ctx.fillStyle = TEXT_COLOR;
                ctx.textAlign = 'center';
                const contentWidth = POSTER_WIDTH - PADDING * 2;
                let currentY = imageY + imageHeight + 100;
                
                ctx.font = 'bold 60px Cinzel';
                currentY = wrapText(ctx, content.title, POSTER_WIDTH / 2, currentY, contentWidth, 70) + 50;
                
                ctx.font = '24px Inter';
                currentY = wrapText(ctx, content.historicalDescription, POSTER_WIDTH / 2, currentY, contentWidth, 38) + 80;

                // Draw Coat of Arms
                const coaSize = 250;
                const coaX = (POSTER_WIDTH - coaSize) / 2;
                const coaY = currentY;
                ctx.drawImage(coaImage, coaX, coaY, coaSize, coaSize);

                // Draw Footer
                ctx.font = '18px Inter';
                ctx.fillStyle = '#a8a29e';
                ctx.fillText('Vygenerováno Kronikářem profesí', POSTER_WIDTH / 2, POSTER_HEIGHT - PADDING / 1.5);
                
                setPosterUrl(canvas.toDataURL('image/png'));
            } catch (error) {
                console.error("Failed to load images for canvas.", error);
            } finally {
                setIsRendering(false);
            }
        };

        createPoster();
    }, [content]);

    const handleDownload = () => {
        if (!posterUrl) return;
        const link = document.createElement('a');
        link.href = posterUrl;
        link.download = 'kronikar-profesi-plakat.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white/60 border border-stone-300 rounded-lg shadow-xl backdrop-blur-sm overflow-hidden animate-fade-in">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            <div className="w-full bg-stone-100 flex items-center justify-center">
                {isRendering && (
                    <div className="text-center p-4 aspect-[10/17]">
                        <svg className="animate-spin h-8 w-8 text-stone-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-stone-600 font-cinzel text-sm">Malíř dokončuje dílo...</p>
                    </div>
                )}
                {posterUrl && !isRendering && (
                    <img 
                        src={posterUrl} 
                        alt="Vygenerovaný plakát povolání" 
                        className="w-full h-full object-contain max-h-[70vh]"
                    />
                )}
            </div>
            
            {posterUrl && !isRendering && (
                <div className="p-4 bg-stone-50/70 border-t border-stone-200">
                    <button
                        onClick={handleDownload}
                        className="w-full flex justify-center items-center px-4 py-3 bg-stone-800 text-white font-bold font-cinzel rounded-md shadow-lg hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors duration-200"
                    >
                        Stáhnout plakát
                    </button>
                </div>
            )}
        </div>
    );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);