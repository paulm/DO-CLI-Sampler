const express = require('express');
const { exec, spawn } = require('child_process');
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
    const tagsParam = req.query.tags;
    
    if (!entryText) {
        return res.status(400).send('No entry text provided');
    }

    // Decode the URL-encoded text
    const decodedText = decodeURIComponent(entryText);
    
    // Additional logging for debugging
    console.log('Entry text:', entryText);
    console.log('Custom date:', customDate);
    console.log('Tags param:', tagsParam);
    
    // Let's try executing the command directly as a string - this may work better with the Day One CLI
    // Build the Day One CLI command
    let shellCommand = `dayone2 new "${decodedText.replace(/"/g, '\\"')}"`;
    
    // Add date option if provided
    if (customDate) {
        const date = new Date(customDate);
        const formattedDate = date.toISOString().replace('T', ' ').substring(0, 19);
        shellCommand += ` --date="${formattedDate}"`;
    }
    
    // Add journal if provided
    if (req.query.journal) {
        const journalName = decodeURIComponent(req.query.journal);
        shellCommand += ` --journal="${journalName}"`;
    }
    
    // Add starred flag if requested
    if (req.query.starred === 'true') {
        shellCommand += ' --starred';
    }
    
    // Add tags
    if (tagsParam) {
        try {
            // Parse JSON array of tags
            const tags = JSON.parse(decodeURIComponent(tagsParam));
            
            // Format tags with proper quoting
            const tagsFormatted = tags.map(tag => `"${tag}"`).join(' ');
            shellCommand += ` --tags ${tagsFormatted}`;
        } catch (error) {
            console.error('Error parsing tags:', error);
            // Fallback to default tag
            shellCommand += ` --tags "DOSampleEntry"`;
        }
    } else {
        // Fallback to default tag
        shellCommand += ` --tags "DOSampleEntry"`;
    }
    
    console.log('Using shell command:', shellCommand);
    
    // Try with exec and shell
    exec(shellCommand, { shell: '/bin/bash' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(`Error saving to Day One: ${error.message}`);
        }
        
        console.log(`stdout: ${stdout}`);
        if (stderr) console.log(`stderr: ${stderr}`);
        
        console.log('Entry saved to Day One successfully');
        return res.send('Entry saved to Day One successfully');
    });
    
    // End of exec method
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