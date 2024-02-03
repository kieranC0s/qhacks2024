import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import OpenAI from "openai";
import fs from "fs";
import readline from 'readline'; // Node.js module to read files line by line


const app = express();
const port = 3000;


// Initialize OpenAI client with your API key
const openai = new OpenAI({
    apiKey: "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",
});

// Set up multer for file storage
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());

// CORS headers for local development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Adjust in production
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        console.log("Received message:", message);

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: message }],
        });
        
        console.log("OpenAI API Response:", response); // Log the full response object

        console.log("Reply:", response.choices[0].message);

        const reply = response.choices[0].message;

        //split the object of reply to a string thats in btween the second set of quotes
        const replyString = JSON.stringify(reply);
        const splitString = replyString.split('"');
        const finalReply = splitString[7];
        console.log(finalReply);

        //make the final reply into a json object and send it to the client
        res.send({ reply: finalReply });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Failed to fetch response from OpenAI.' });
    }
});


//Endpoint to handle file uploads
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'Please upload a file.' });
    }

    console.log("Uploaded file:", req.file.path);


    // Process the uploaded file here
    // read the file content and send it to the OpenAI API
    
    // Placeholder for response after processing the file
    res.send({ reply: 'File uploaded successfully.', filePath: req.file.path });
}); 


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
