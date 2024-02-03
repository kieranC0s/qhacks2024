import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker";
import "./App.css";

function App() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track whether the form is being submitted
  //quantity values for multiple choice questions, long answer questions, short answer questions, definitions, calculations
  const [mcq, setMcq] = useState(5);
  const [laq, setLaq] = useState(2);
  const [saq, setSaq] = useState(3);
  const [def, setDef] = useState(3);
  const [calc, setCalc] = useState(1);

  
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

   const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContents = document.querySelector('.note-summary').innerHTML;
    printWindow.document.body.innerHTML = printContents;
    printWindow.print();
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handlePdfChange = (event) => {
    setPdfFile(event.target.files[0]);
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
    const summarizeText = async (text) => {
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
              messages: [{ role: "user", content: text }],
            }),
          }
        );
        const responseData = await response.json();
        if (response.ok) {
          setSummary(responseData.choices[0].message.content);
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
    const updateDisplayedSummary = () => {
      const summaryArray = summary.split("");
      let i = 0;

      setDisplayedSummary(summaryArray[0]);
      const intervalId = setInterval(() => {
        if (i < summaryArray.length - 1) {
          setDisplayedSummary((prev) => prev + summaryArray[i]);
          i++;
        } else {
          clearInterval(intervalId);
        }
        if (i === summaryArray.length - 2) {
          setIsSubmitting(false);
          console.log("submitting", isSubmitting);
        }
      }, 20); // Adjust the interval duration as needed'
    }; // Whenever the 'summary' state changes, update the displayed summary

    if (summary) {
      setDisplayedSummary("");
      updateDisplayedSummary();
    }
  }, [summary]);

  

  return (
    <div className="App">
            
      <header className="App-header">
                <h1>iLearn</h1>
                <p>Enhanced by AI</p>
              
      </header>
            
      <main className="App-main">
                
        <section
          className="note-upload"
          style={{ display: "flex", flexDirection: "column" }}
        >
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
          

          <h3>Test Formatting</h3>

          <p>
            <div style={{ float: "left", marginTop: 25 }}>
              Multiple Choice Questions
            </div>
            <div style={{ float: "right" }}>
              <button onClick={() => handleNumberChange("-","mcq")}>-</button>
              <input
                type="numeric"
                id="mulQs"
                min="1"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={mcq}
                onChange={handleNumberChange}
              />
              <button onClick={() => handleNumberChange("+","mcq")}>+</button>
            </div>
          </p>

          <p>
            <div style={{ float: "left", marginTop: 25 }}>
              Short Answer Questions
            </div>
            <div style={{ float: "right" }}>
              <button onClick={() => handleNumberChange("-","saq")}>-</button>
              <input
                type="numeric"
                id="mulQs"
                min="1"
                max="10"
                style={{ width: 60, height: 28, textAlign: "center" }}
                value={saq}
                onChange={handleNumberChange}
              />
              <button onClick={() => handleNumberChange("+","saq")}>+</button>
            </div>
          </p>

		  <p>
			<div style={{ float: "left", marginTop: 25 }}>
			 Long Answer Questions
			</div>
			<div style={{ float: "right" }}>
			  <button onClick={() => handleNumberChange("-","laq")}>-</button>
			  <input
				type="numeric"
				id="mulQs"
				min="1"
				max="10"
				style={{ width: 60, height: 28, textAlign: "center" }}
				value={laq}
				onChange={handleNumberChange}
			  />
			  <button onClick={() => handleNumberChange("+","laq")}>+</button>
			</div>
		  </p>

		  <p>
			<div style={{ float: "left", marginTop: 25 }}>
			  Definitions
			</div>
			<div style={{ float: "right" }}>
			  <button onClick={() => handleNumberChange("-","def")}>-</button>
			  <input
			  type="numeric"
			  id="mulQs"
			  min="1"
			  max="10"
			  style={{ width: 60, height: 28, textAlign: "center" }}
			  value={def}
			  onChange={handleNumberChange}
			  />
			  <button onClick={() => handleNumberChange("+","def")}>+</button>
			</div>
		  </p>	
		  <p>
			<div style={{ float: "left", marginTop: 25 }}>
			  Calculations
			</div>
			<div style={{ float: "right" }}>
			  <button onClick={() => handleNumberChange("-","calc")}>-</button>
			  <input
			  type="numeric"
			  id="mulQs"
			  min="1"
			  max="10"
			  style={{ width: 60, height: 28, textAlign: "center" }}
			  value={calc}
			  onChange={handleNumberChange}
			  />
			  <button onClick={() => handleNumberChange("+","calc")}>+</button>
			</div>
		  </p>
		  
		  <p>
		  <button style={{maxWidth:"100px",margin:"0 auto", display: "block", backgroundColor: "#808080"}} onClick={handleReset}>Reset</button>
		  <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Transforming..." : "Start Transforming"}
      </button>

      <button onClick={handlePrint} disabled={!summary||isSubmitting} className="print-button">
            Print Summary
      </button>
		  </p>
        </section>
                
        <aside className="note-options">
                    {/* Your existing code for note options */}          
        </aside>
                

        <section className="note-summary">
                    <h3>Summary</h3>
                    
          <p>{displayedSummary || "Your summary will appear here."}</p>
                  
        </section>
              
      </main>
          
    </div>
  );
}

export default App;
