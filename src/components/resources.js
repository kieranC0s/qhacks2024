import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/legacy/build/pdf.worker';
import '../style.css';
import { ArrowRightCircle } from 'react-bootstrap-icons';

function Resources() {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track whether the form is being submitted
  const [quantity, setQuantity] = useState(5);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        alert('Summary copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text to clipboard', err);
      });
    };
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handlePdfChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

    const fileInputRef = useRef();

    const handleFileButtonClick = () => {
    fileInputRef.current.click();
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
    const prompt = `Please find some resources on this information/word/topic:\n\n${text}`;
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
      }, 5); // Adjust the interval duration as needed'

        
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
    <div id="resources" className="notes-container">
      <div className="notes-header">
        <h1>Resources</h1>
        <p>Automatically Generate Resources</p>
      </div>
      <div className="notes-content">
        <div className="notes-input">
          <h2>Generate Instant Resources to Improve Your Knowledge</h2>
          <textarea
            placeholder="Put your notes here. We'll do the rest."
            value={notes}
            onChange={handleNotesChange}
            disabled={isSubmitting}
            className="summary-textarea"
          />
          <div className="file-input-container">
        <button onClick={handleFileButtonClick} className="file-input-button">
          Choose File <ArrowRightCircle size={15} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePdfChange}
          accept=".pdf"
          style={{ display: 'none' }} // Hide the actual file input
        />
      </div>
        <div className="file-input-container">
          <button onClick={handleSubmit} disabled={isSubmitting} className="file-input-button">
            {isSubmitting ? 'Generating...' : 'Start Generating Resources'}
          </button>
          <button onClick={copyToClipboard} disabled={!summary || isSubmitting} className="file-input-button">
            Copy to Clipboard
          </button>
        </div>
        </div>
        <div className="notes-summary">
          <h3>Output</h3>
          {isSubmitting ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div> ) : (
          <pre><textarea
            className="summary-textarea"
            value={displayedSummary}
            readOnly
            placeholder="Your resources will appear here."
          /></pre> )}
        </div>
      </div>
    </div>
  );
}

export default Resources;