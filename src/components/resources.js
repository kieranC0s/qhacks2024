import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/legacy/build/pdf.worker';
import '../style.css';

function Resources() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track whether the form is being submitted
  const [quantity, setQuantity] = useState(5);

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
    const prompt = `Please create a quiz out of the following information/word/topic:\n\n${text}`;
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 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', // Replace with your actual API key
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "system", content: prompt }]
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
  }, [summary]);

const handleNumberChange = (value) => {

}


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
            <h2>Test Formatting</h2>
                <p align="left">Multiple Choice</p>
                <div className="number">
					<style>
						input[type=number]::-webkit-inner-spin-button,
						input[type=number]::-webkit-outer-spin-button -webkit-appearance: none;
					</style>
			<button onClick={() => handleNumberChange(-1)}>-</button>
          	<input
            className="quantity"
            min="0"
            name="quantity"
            value={quantity}
            type="number"
            onChange={(e) => handleNumberChange(e.target.value)}
          />
          <button onClick={() => handleNumberChange(1)}>+</button>
        </div>
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

export default Resources;