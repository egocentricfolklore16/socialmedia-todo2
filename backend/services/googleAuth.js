const { google } = require('googleapis');

/**
 * Creates and returns a configured OAuth2 client.
 */
function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Creates an OAuth2 client pre-loaded with the user's stored tokens.
 * @param {object} tokens - { access_token, refresh_token, expiry_date }
 */
function getAuthenticatedClient(tokens) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

module.exports = { getOAuth2Client, getAuthenticatedClient };
