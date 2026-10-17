const express = require('express');
const router = express.Router();
const { getOAuth2Client } = require('../services/googleAuth');
const { saveTokens, clearTokens, getTokens } = require('../services/store');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'profile',
  'email',
];

// GET /auth/google — Redirect user to Google consent screen
router.get('/google', (req, res) => {
  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // force refresh_token every time
  });
  res.redirect(authUrl);
});

// GET /auth/google/callback — Handle OAuth callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

  if (error) {
    console.error('[Auth] OAuth error:', error);
    return res.redirect(`${clientUrl}?auth=error&reason=${error}`);
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    saveTokens(tokens);
    console.log('[Auth] Google tokens saved successfully.');
    res.redirect(`${clientUrl}?auth=success`);
  } catch (err) {
    console.error('[Auth] Token exchange failed:', err.message);
    res.redirect(`${clientUrl}?auth=error&reason=token_exchange_failed`);
  }
});

// GET /auth/status — Check if user is authenticated
router.get('/status', (req, res) => {
  const tokens = getTokens();
  res.json({ authenticated: !!tokens });
});

// POST /auth/logout — Clear stored tokens
router.post('/logout', (req, res) => {
  clearTokens();
  res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
