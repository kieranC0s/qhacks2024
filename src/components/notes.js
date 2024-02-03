import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/legacy/build/pdf.worker';
import './App.css';

function App() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
const [isSubmitting, setIsSubmitting] = useState(false); // State to track whether the form is being submitted

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handlePdfChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const extractTextFromPdf = async (pdfData) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    let allText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      allText += textContent.items.map(item => item.str).join(' ');
    }
    return allText;
  };



  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Function to handle summarization
    const summarizeText = async (text) => {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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', // Replace with your actual API key
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: text }]
          }),
        });
  
        const responseData = await response.json();
  
        if (response.ok) {
          setSummary(responseData.choices[0].message.content);
        } else {
          console.error('Response not ok:', responseData);
          setSummary('Failed to generate summary.');
        }
      } catch (error) {
        console.error('Error sending request to OpenAI API:', error);
        setSummary('An error occurred while generating the summary.');
      }
    };
  
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = await extractTextFromPdf(e.target.result);
          summarizeText(text);
        } catch (error) {
          console.error('Error reading PDF:', error);
          setSummary('Error in PDF processing.');
        }
      };
  
      reader.onerror = (e) => {
        reader.abort();
        console.error('FileReader error:', e);
        setSummary('Error reading the file.');
      };
  
      reader.readAsArrayBuffer(pdfFile);
    } else if (notes.trim()) {
      summarizeText(notes);
    } else {
      setSummary('Please enter some notes or upload a PDF file to summarize.');
    }
    
  };

  const [displayedSummary, setDisplayedSummary] = useState('');

  useEffect(() => {
    const updateDisplayedSummary = () => {
      const summaryArray = summary.split('');
      let i = 0;

      setDisplayedSummary(summaryArray[0]);      

      const intervalId = setInterval(() => {
        if(i<summaryArray.length-1){
          setDisplayedSummary(prev => prev + summaryArray[i]);
          console.log('submitting', isSubmitting);
          console.log('i', i);
          console.log('summaryArray.length', summaryArray.length);
          i++;
      }else{ 
          clearInterval(intervalId);
        }
    if(i===summaryArray.length-2){
    setIsSubmitting(false);
    console.log('submitting', isSubmitting);
    }   
      }, 30); // Adjust the interval duration as needed'

        
   };

    

    // Whenever the 'summary' state changes, update the displayed summary
    if (summary) {
      setDisplayedSummary('');
      updateDisplayedSummary();
    }
    console.log('submitting', isSubmitting);
  }, [summary]);



  return (
    <div className="App">
      <header className="App-header">
        <h1>iLearn</h1>
        <p>Enhanced by AI</p>
      </header>
      <main className="App-main">
        <section className="note-upload">
          <h2>Generate instant study materials</h2>
          <textarea
            placeholder="Put your notes here. We'll do the rest."
            value={notes}
            onChange={handleNotesChange}
            disabled={isSubmitting}
          />
          <input
            type="file"
            onChange={handlePdfChange}
            accept=".pdf"
            disabled={isSubmitting}
          />
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Transforming...' : 'Start Transforming'}
          </button>
        </section>
        <aside className="note-options">
          {/* Your existing code for note options */}
        </aside>
        <section className="note-summary">
          <h3>Summary</h3>
          <p>{displayedSummary || 'Your summary will appear here.'}</p>
        </section>
      </main>
    </div>
  );
}


export default App;