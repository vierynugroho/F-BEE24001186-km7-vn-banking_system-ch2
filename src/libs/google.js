import { google } from 'googleapis';

const googleSecret = {
  clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  callback_url: process.env.GOOGLE_OAUTH_CALLBACK_URL,
};

const scope = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const oauthClient = new google.auth.OAuth2(...googleSecret);

export const authorizationUrl = oauthClient.generateAuthUrl({
  access_type: 'offline',
  scope: scope,
  include_granted_scopes: true,
});
