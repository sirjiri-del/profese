
import React, { useState } from 'react';

export interface UserInput {
  profession: string;
  activities: string;
  gender: 'muž' | 'žena';
}

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [profession, setProfession] = useState('');
  const [activities, setActivities] = useState('');
  const [gender, setGender] = useState<'muž' | 'žena'>('muž');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profession.trim() || !activities.trim()) {
      setFormError('Prosím, vyplňte všechna pole, Vaše ctihodnosti.');
      return;
    }
    setFormError(null);
    onSubmit({ profession, activities, gender });
  };

  return (
    <div className="p-6 bg-white/60 border border-stone-300 rounded-lg shadow-xl backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="profession" className="block text-sm font-bold font-cinzel text-stone-700 mb-1">
            Moderní Povolání
          </label>
          <input
            id="profession"
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="např. Projektový manažer, UI/UX Designer..."
            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="activities" className="block text-sm font-bold font-cinzel text-stone-700 mb-1">
            Vaše denní činnosti
          </label>
          <textarea
            id="activities"
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
            rows={5}
            placeholder="Popište stručně, co každý den děláte. Např. 'Vedu porady, vytvářím grafy, komunikuji s klienty, píšu reporty...'"
            className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
            disabled={isLoading}
          />
        </div>

        <div>
          <span className="block text-sm font-bold font-cinzel text-stone-700 mb-2">
            Pohlaví (pro Váš portrét)
          </span>
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="muž"
                checked={gender === 'muž'}
                onChange={() => setGender('muž')}
                className="h-4 w-4 text-amber-600 border-stone-400 focus:ring-amber-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-stone-700">Muž</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="žena"
                checked={gender === 'žena'}
                onChange={() => setGender('žena')}
                className="h-4 w-4 text-amber-600 border-stone-400 focus:ring-amber-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-stone-700">Žena</span>
            </label>
          </div>
        </div>
        
        {formError && <p className="text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 bg-stone-800 text-white font-bold font-cinzel rounded-md shadow-lg hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 transition-colors duration-200 disabled:bg-stone-400 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Zapisuji do kroniky...
            </>
          ) : (
            'Odhalit historické povolání'
          )}
        </button>
      </form>
    </div>
  );
};
