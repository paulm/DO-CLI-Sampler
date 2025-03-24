# Day One Journal Entry Creator

A simple web app that creates random journal entries with user bio information and saves them to Day One using the Day One CLI.

## Setup

1. Make sure you have Node.js installed
2. Make sure the Day One CLI is installed and accessible
3. Run these commands to start the app:

```bash
npm install
npm start
```

4. Open your browser to the URL shown in the console (the server will find an available port)

## Usage

1. Select a user bio from the dropdown
2. Click "Create Entry" to generate a random journal entry combined with the selected bio
3. Edit the entry text if desired
4. Click "Save to Day One" to save the entry to your Day One journal using the CLI

## Files

- `index.html` - The web interface
- `server.js` - Simple Express server to handle Day One CLI commands
- `sample-bio.json` - User bio data
- `sample-entries.json` - Sample journal entry texts
- `docli-documentation.md` - Documentation for the Day One CLI