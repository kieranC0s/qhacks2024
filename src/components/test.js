import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import 'pdfjs-dist/legacy/build/pdf.worker';
import '../style.css';
import { AlignCenter, ArrowRightCircle } from 'react-bootstrap-icons';

function Test() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track whether the form is being submitted
  const [summaryKey, setSummaryKey] = useState(false); // State to force re-render the summary component
  const [answerStr,setAnswerStr] = useState("");
  const [answerVisible,setAnswerVisible] =useState(false);
  const [testMade,setTestMade] = useState(false);
    
  //quantity values for multiple choice questions, long answer questions, short answer questions, definitions, calculations
  const [mcq, setMcq] = useState(0);
  const [laq, setLaq] = useState(0);
  const [saq, setSaq] = useState(0);
  const [def, setDef] = useState(0);
  const [calc, setCalc] = useState(0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        alert('Summary copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text to clipboard', err);
      });
    };

  
  const handleNumberChange = (operation, val) => {
	//choose which valyue to chafne based on val, maxumim 10 questions minimum 0 question
	if(val === "mcq"){
		if(operation === "+" && mcq < 10){
			setMcq(mcq + 1);
		}
		else if(operation === "-" && mcq > 0){
			setMcq(mcq - 1);
		}
	}
	if(val === "laq"){
		if(operation === "+" && laq < 10){
			setLaq(laq + 1);
		}
		else if(operation === "-" && laq > 0){
			setLaq(laq - 1);
		}
	}
	if(val === "saq"){
		if(operation === "+" && saq < 10){
			setSaq(saq + 1);
		}
		else if(operation === "-" && saq > 0){
			setSaq(saq - 1);
		}
	}
	if(val === "def"){
		if(operation === "+" && def < 10){
			setDef(def + 1);
		}
		else if(operation === "-" && def >0){
			setDef(def - 1);
		}
	}
	if(val === "calc"){
		if(operation === "+" && calc < 10){
			setCalc(calc + 1);
		}
		else if(operation === "-" && calc > 0){
			setCalc(calc - 1);
		}
	}
  }

  const handleReset = () => {
	setMcq(0);
	setLaq(0);
	setSaq(0);
	setDef(0);
	setCalc(0);
	 }

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
    let allText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      allText += textContent.items.map((item) => item.str).join(" ");
    }
    return allText;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); // Function to handle summarization
    if(mcq === 0 && laq === 0 && saq === 0 && def === 0 && calc === 0){
        alert("Please enter a valid number of questions for the test");
        setIsSubmitting(false);
        return;
        }

    const summarizeText = async (text) => {
        console.log(mcq, laq, saq, def, calc);
        const prompt = `Please create a quiz with ` + mcq + ` multiple choice question(s), `+ laq + ` long answer question(s), ` + saq + ` short answer question(s), ` + def + ` definition question(s), and `
        + calc+ ` calculation question(s). It should be based on of the following information/word/topic:\n\n${text}`+ ` Make sure you list the answers after in the formatt:  ANSWER KEY: 1. A 2. B 3. C 4. B......, after the list of questions. ANSWER KEY must be all caps.`;
        console.log(prompt);
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer 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", // Replace with your actual API key
            },
            body: JSON.stringify({
              model: "gpt-4",
              messages: [{ role: "user", content: prompt }],
            }),
          }
        );
        const responseData = await response.json();
        if (response.ok) {
            //split string to keep the message and the answer key separate

       let
       splitString = responseData.choices[0].message.content.split("ANSWER KEY:");
       
       
       
              //set the test to the message
       
              console.log("test",
       splitString[0]);
       
              console.log("Answerkey",
       splitString[1]);
       
       
       
              setSummary(splitString[0]);
       
              setAnswerStr(splitString[1]);
       
          console.log(responseData.choices[0].message.content);
            setTestMade(true);

          setSummaryKey(!summaryKey);
        } else {
          console.error("Response not ok:", responseData);
          setSummary("Failed to generate summary.");
        }
      } catch (error) {
        console.error("Error sending request to OpenAI API:", error);
        setSummary("An error occurred while generating the summary.");
      }
    };
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = await extractTextFromPdf(e.target.result);
          summarizeText(text);
        } catch (error) {
          console.error("Error reading PDF:", error);
          setSummary("Error in PDF processing.");
        }
      };
      reader.onerror = (e) => {
        reader.abort();
        console.error("FileReader error:", e);
        setSummary("Error reading the file.");
      };
      reader.readAsArrayBuffer(pdfFile);
    } else if (notes.trim()) {
      summarizeText(notes);
    } else {
      setSummary("Please enter some notes or upload a PDF file to summarize.");
    }
  };

  const [displayedSummary, setDisplayedSummary] = useState("");

  useEffect(() => {
        if(summary){
      let i = 0;
      setDisplayedSummary(summary[0]);

      const intervalId = setInterval(() => {
        i++;
        if (i < summary.length - 1) {
          setDisplayedSummary((prev) => `${prev}${summary[i]}`);
          
        } else {
          clearInterval(intervalId);
          setIsSubmitting(false);
        }
      }, 5); // Adjust the interval duration as needed'
    }; // Whenever the 'summary' state changes, update the displayed summary
  }, [summaryKey]);

  const revealAnswers = () => { setAnswerVisible(!answerVisible);}

  return (
    <div id="mock-up-tests" className="notes-container">
      <div className="notes-header">
        <h1>Test Generation</h1>
        <p>Customize the test parameters and generate practice tests based on your notes.</p>
      </div>
      <div className="notes-content">
        <div className="notes-section">
          <h2>Generate instant Practice Tests</h2>
          <textarea
            className="notes-textarea"
            placeholder="Put your notes here. We'll do the rest."
            value={notes}
            onChange={handleNotesChange}
            disabled={isSubmitting}
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
        </div>
        <section className="question-container" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div>
            <div style={{ float: "left", marginTop: 10 }}>
            Multiple Choice Questions
            </div>
            <div style={{ float: "right" }}>
            <button onClick={() => handleNumberChange("-", "mcq")}>-</button>
            <input
                type="numeric"
                id="mulQs"
                min="0"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={mcq}
                onChange={handleNumberChange}
            />
            <button onClick={() => handleNumberChange("+", "mcq")}>+</button>
            </div>
        </div>

        <div>
            <div style={{ float: "left", marginTop: 10 }}>
            Short Answer Questions
            </div>
            <div style={{ float: "right" }}>
            <button onClick={() => handleNumberChange("-", "saq")}>-</button>
            <input
                type="numeric"
                id="mulQs"
                min="0"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={saq}
                onChange={handleNumberChange}
            />
            <button onClick={() => handleNumberChange("+", "saq")}>+</button>
            </div>
        </div>
        
        <div>
            <div style={{ float: "left", marginTop: 10 }}>
            Long Answer Questions
            </div>
            <div style={{ float: "right" }}>
            <button onClick={() => handleNumberChange("-", "laq")}>-</button>
            <input
                type="numeric"
                id="mulQs"
                min="0"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={laq}
                onChange={handleNumberChange}
            />
            <button onClick={() => handleNumberChange("+", "laq")}>+</button>
            </div>
        </div>
        <div>
            <div style={{ float: "left", marginTop: 10 }}>
            Definitions
            </div>
            <div style={{ float: "right" }}>
            <button onClick={() => handleNumberChange("-", "def")}>-</button>
            <input
                type="numeric"
                id="mulQs"
                min="0"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={def}
                onChange={handleNumberChange}
            />
            <button onClick={() => handleNumberChange("+", "def")}>+</button>
            </div>
        </div>
        <div>
            <div style={{ float: "left", marginTop: 10 }}>
            Calculations
            </div>
            <div style={{ float: "right" }}>
            <button onClick={() => handleNumberChange("-", "calc")}>-</button>
            <input
                type="numeric"
                id="mulQs"
                min="0"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={calc}
                onChange={handleNumberChange}
            />
            <button onClick={() => handleNumberChange("+", "calc")}>+</button>
            </div>
        </div>
        </section>
        <div className="file-input-container">
		  <button className="file-input-button" onClick={handleReset}>Reset</button>
		  <button onClick={handleSubmit} disabled={isSubmitting} className="file-input-button">
            {isSubmitting ? 'Creating Test...' : 'Generate Test'}
          </button>
          <button onClick={copyToClipboard} disabled={!summary || isSubmitting} className="file-input-button">
            Copy to Clipboard
          </button>
          </div>
        </div>
        <div className="notes-summary">
          <h3>Generated Test</h3>
          {isSubmitting ? (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div> ) : (
          <pre><textarea 
            className="summary-textarea"
            value={displayedSummary}
            readOnly
            placeholder="The generated test will appear here."
          /></pre> )}
          <div className="notes-summary">
          <pre>
             <button onClick={revealAnswers} disabled={isSubmitting || !testMade}
            className="testGen-button">
                Reveal Answers
                </button>
                {answerVisible && (
                    <pre className='answers-textarea' style ={{whiteSpace: 'pre-wrap'}}>
                    {answerStr || "Your answer key will appear here."}
            </pre>
            )}
            </pre>
           </div>
        </div>
      </div>
  );
}

export default Test;