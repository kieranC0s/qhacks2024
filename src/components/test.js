import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker";
import '../style.css';

function Test() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [pdfFile, setPdfFile] = useState(null); // State to store the selected PDF file
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track whether the form is being submitted
  const [summaryKey, setSummaryKey] = useState(false); // State to force re-render the summary component
  //quantity values for multiple choice questions, long answer questions, short answer questions, definitions, calculations
  const [mcq, setMcq] = useState(0);
  const [laq, setLaq] = useState(0);
  const [saq, setSaq] = useState(0);
  const [def, setDef] = useState(0);
  const [calc, setCalc] = useState(0);

  
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
    if(mcq === 0 && laq === 0 && saq === 0 && def === 0 && calc === 0){
        alert("Please enter a valid number of questions for the test");
        setIsSubmitting(false);
        return;
        }

    const summarizeText = async (text) => {
        console.log(mcq, laq, saq, def, calc);
        const prompt = `Please create a quiz with ` + mcq + ` multiple choice question(s), `+ laq + ` long answer question(s), ` + saq + ` short answer question(s), ` + def + ` definition question(s), and `
        + calc+ ` calculation question(s). It should be based on of the following information/word/topic:\n\n${text}`;
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
          console.log(responseData.choices[0].message.content);
          setSummary(responseData.choices[0].message.content);
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
      }, 20); // Adjust the interval duration as needed'
    }; // Whenever the 'summary' state changes, update the displayed summary
  }, [summaryKey]);

  

  return (
    <div id="mock-up-tests" className="App">  
      <main className="App-main">               
        <section
          className="note-upload"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <h2>Generate Practice Tests Based Off Of Your Study Materials</h2>
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
                    <h3>Generated Test</h3>
                    
          <p>{displayedSummary || "Your summary will appear here."}</p>
                  
        </section>
              
      </main>
          
    </div>
  );
}

export default Test;