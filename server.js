const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

// Serve static files
app.use(express.static(__dirname));

// Route to handle saving to Day One
app.get('/save-to-dayone', (req, res) => {
    const entryText = req.query.text;
    const customDate = req.query.date;
    
    if (!entryText) {
        return res.status(400).send('No entry text provided');
    }

    // Decode the URL-encoded text
    const decodedText = decodeURIComponent(entryText);
    
    // Build the Day One CLI command
    let command = `dayone2`;
    
    // Add date option if provided
    if (customDate) {
        const date = new Date(customDate);
        const formattedDate = date.toISOString().replace('T', ' ').substring(0, 19);
        command += ` --date="${formattedDate}"`;
    }
    
    // Add the new entry command and text
    command += ` new "${decodedText.replace(/"/g, '\\"')}"`;
    
    console.log(`Executing command: ${command}`);
    
    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            return res.status(500).send(`Error saving to Day One: ${error.message}`);
        }
        
        console.log('Entry saved to Day One successfully');
        res.send('Entry saved to Day One successfully');
    });
});

// Try ports from 3000 to 3050
function findAvailablePort(startPort, maxPort, callback) {
    let port = startPort;
    
    function tryPort() {
        if (port > maxPort) {
            return callback(new Error("No available ports found"));
        }
        
        const tempServer = http.createServer();
        tempServer.listen(port, () => {
            tempServer.close(() => {
                callback(null, port);
            });
        });
        
        tempServer.on('error', () => {
            port++;
            tryPort();
        });
    }
    
    tryPort();
}

// Find an available port and start the server
findAvailablePort(3000, 3050, (err, port) => {
    if (err) {
        console.error("Failed to find an available port:", err);
        process.exit(1);
    }
    
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`Open your browser to http://localhost:${port} to use the app`);
    });
});