const express = require('express');
const { exec, spawn } = require('child_process');
const path = require('path');
const http = require('http');

const app = express();
const server = http.createServer(app);

// For parsing JSON in request bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Route to handle saving to Day One - POST method for direct command execution
app.post('/save-to-dayone', (req, res) => {
    // Extract the command from the request body
    const { command } = req.body;
    
    if (!command) {
        return res.status(400).json({ 
            success: false,
            message: 'No command provided'
        });
    }
    
    console.log('Executing command directly:', command);
    
    // Execute the provided command directly
    exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({
                success: false,
                message: `Error executing command: ${error.message}`
            });
        }
        
        console.log(`stdout: ${stdout}`);
        if (stderr) console.log(`stderr: ${stderr}`);
        
        // Extract the UUID from the output
        let entryUuid = null;
        const uuidMatch = stdout.match(/uuid: ([0-9A-F]{32})/i);
        if (uuidMatch && uuidMatch[1]) {
            entryUuid = uuidMatch[1];
            console.log(`Extracted entry UUID: ${entryUuid}`);
        }
        
        console.log('Entry saved to Day One successfully');
        
        // Return the UUID so the frontend can create the dayone:// URL
        if (entryUuid) {
            return res.json({
                success: true,
                message: 'Entry saved to Day One successfully',
                uuid: entryUuid,
                openUrl: `dayone://view?entryId=${entryUuid}`
            });
        } else {
            return res.json({
                success: true,
                message: 'Entry saved to Day One successfully but could not extract UUID'
            });
        }
    });
});

// Legacy GET route (keeping for backward compatibility)
app.get('/save-to-dayone', (req, res) => {
    const entryText = req.query.text;
    const customDate = req.query.date;
    const tagsParam = req.query.tags;
    const timezone = req.query.timezone;
    
    // Log all received parameters for debugging
    console.log('Received parameters:', {
        text: entryText ? 'present' : 'missing',
        date: customDate || 'not set',
        tags: tagsParam || 'not set',
        timezone: timezone || 'not set',
        journal: req.query.journal || 'not set',
        starred: req.query.starred || 'not set'
    });
    
    if (!entryText) {
        return res.status(400).send('No entry text provided');
    }

    // Decode the URL-encoded text
    const decodedText = decodeURIComponent(entryText);
    
    // Build the Day One CLI command
    let shellCommand = `dayone2 new "${decodedText.replace(/"/g, '\\"')}"`;
    
    // Add date and timezone together for proper time handling
    if (customDate) {
        try {
            // Format as "month/day/year hour:minute AM/PM" which Day One CLI seems to handle best
            const dateObj = new Date(customDate);
            const month = dateObj.getMonth() + 1; // getMonth() is 0-indexed
            const day = dateObj.getDate();
            const year = dateObj.getFullYear();
            
            // Use locale string to get AM/PM format
            const timeStr = dateObj.toLocaleTimeString('en-US', { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true 
            });
            
            const formattedDate = `${month}/${day}/${year} ${timeStr}`;
            shellCommand += ` --date="${formattedDate}"`;
            
            console.log('Formatted date for CLI:', formattedDate);
        } catch (error) {
            console.error('Error formatting date:', error);
            // Fallback to original format if there's an error
            shellCommand += ` --date="${customDate.replace('T', ' ')}"`;
        }
    }
    
    // IMPORTANT: Add timezone immediately after date for proper time handling
    // The timezone parameter MUST be included when custom date is used
    if (timezone) {
        const decodedTimezone = decodeURIComponent(timezone);
        shellCommand += ` -z "${decodedTimezone}"`;
        console.log('Using timezone:', decodedTimezone);
    } else if (customDate) {
        // Default to a reasonable timezone if date is provided but timezone isn't
        shellCommand += ` -z "America/Los_Angeles"`;
        console.log('No timezone provided, defaulting to America/Los_Angeles');
    } else {
        console.log('No timezone or date provided in request');
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
    
    // Add tags only if explicitly provided in the request
    // This ensures we don't try to parse tags when none were sent
    if (tagsParam && tagsParam.trim() !== '') {
        try {
            // Parse JSON array of tags
            const tags = JSON.parse(decodeURIComponent(tagsParam));
            
            // Only add tags parameter if there are any tags selected
            if (tags && Array.isArray(tags) && tags.length > 0) {
                // Format tags with proper quoting
                const tagsFormatted = tags.map(tag => `"${tag}"`).join(' ');
                shellCommand += ` --tags ${tagsFormatted}`;
            }
        } catch (error) {
            console.error('Error parsing tags:', error);
        }
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
        
        // Extract the UUID from the output
        let entryUuid = null;
        const uuidMatch = stdout.match(/uuid: ([0-9A-F]{32})/i);
        if (uuidMatch && uuidMatch[1]) {
            entryUuid = uuidMatch[1];
            console.log(`Extracted entry UUID: ${entryUuid}`);
        }
        
        console.log('Entry saved to Day One successfully');
        
        // Return the UUID so the frontend can create the dayone:// URL
        if (entryUuid) {
            return res.json({
                success: true,
                message: 'Entry saved to Day One successfully',
                uuid: entryUuid,
                openUrl: `dayone://view?entryId=${entryUuid}`
            });
        } else {
            return res.json({
                success: true,
                message: 'Entry saved to Day One successfully but could not extract UUID'
            });
        }
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