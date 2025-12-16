import React, { useState } from 'react';
import { processSheetData } from '../utils/csvParser';
import { User } from '../types';

interface DataImporterProps {
  onDataLoaded: (users: User[]) => void;
  hasData?: boolean;
  onReset?: () => void;
}

export const DataImporter: React.FC<DataImporterProps> = ({ onDataLoaded, hasData = false, onReset }) => {
  const [url, setUrl] = useState('');
  const [csvPaste, setCsvPaste] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // If data is already loaded (and we are not explicitly opening the tool), show the summary state
  if (hasData && !isOpen) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg p-3 w-full animate-pop-in">
        <div className="flex items-center gap-2 text-green-700">
           <i className="fas fa-check-circle"></i>
           <span className="text-xs font-semibold">Discussion Lead Data Loaded & Fixed</span>
        </div>
        <button 
          onClick={onReset}
          className="text-xs font-bold text-red-500 hover:text-red-700 underline px-2"
        >
          Reset / Clear
        </button>
      </div>
    );
  }

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Try to detect if it's a regular Google Sheet edit URL
      // https://docs.google.com/spreadsheets/d/KEY/edit...
      let fetchUrl = url;
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      
      if (match && match[1]) {
        // Convert to export URL
        fetchUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      }

      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Failed to fetch (${response.status})`);
      
      const text = await response.text();
      const users = processSheetData(text);
      
      if (users.length === 0) {
        setError("Found the sheet, but couldn't find a 'Claimed by' column. Check headers.");
      } else {
        onDataLoaded(users);
        setIsOpen(false);
        setUrl('');
      }

    } catch (err) {
      console.error(err);
      setError("Could not read URL. Ensure the sheet is 'Published to Web' or visible to anyone with the link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const users = processSheetData(text);
      if (users.length === 0) {
        setError("Could not find 'Claimed by' column in this file.");
      } else {
        onDataLoaded(users);
        setIsOpen(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvPaste.trim()) return;
    
    const users = processSheetData(csvPaste);
    if (users.length === 0) {
      setError("Could not parse data or find 'Claimed by' column. Make sure you included headers.");
    } else {
      onDataLoaded(users);
      setIsOpen(false);
      setCsvPaste('');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-slate-500 underline hover:text-blue-600 transition-colors"
      >
        Import Discussion Lead Data
      </button>
    );
  }

  return (
    <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 w-full animate-pop-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-slate-700 text-sm">Import Discussion Lead Data</h3>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Option 1: URL */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Option A: Paste Link</label>
          <form onSubmit={handleUrlImport} className="flex gap-2">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 text-xs p-2 rounded border border-slate-300 focus:border-blue-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '...' : 'Go'}
            </button>
          </form>
          <p className="text-[10px] text-slate-400">
            * Sheet must be "Visible to anyone with link" or "Published to Web".
          </p>
        </div>

        {/* Option 2: File */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Option B: Upload CSV</label>
          <label className="flex items-center gap-2 cursor-pointer bg-white border border-slate-300 border-dashed rounded p-2 hover:bg-slate-50 transition-colors">
            <i className="fas fa-file-csv text-green-600"></i>
            <span className="text-xs text-slate-600 font-medium">Click to select .csv file</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
           <p className="text-[10px] text-slate-400">
            * File &gt; Download &gt; Comma Separated Values (.csv)
          </p>
        </div>
        
        {/* Option 3: Paste */}
        <div className="md:col-span-2 flex flex-col gap-2 border-t border-slate-200 pt-3 mt-1">
           <label className="text-xs font-semibold text-slate-500 uppercase">Option C: Paste Data (CSV)</label>
           <form onSubmit={handlePasteImport}>
             <textarea
               value={csvPaste}
               onChange={(e) => setCsvPaste(e.target.value)}
               placeholder="Claimed by, WeekID... (Paste your table content here)"
               className="w-full text-xs p-2 rounded border border-slate-300 focus:border-blue-500 outline-none h-20 font-mono"
             />
             <button 
                type="submit"
                disabled={!csvPaste.trim()}
                className="mt-2 w-full bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold py-1.5 rounded"
             >
                Load Data
             </button>
           </form>
        </div>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 text-red-600 text-xs p-2 rounded border border-red-100 flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
    </div>
  );
};