import { google } from 'googleapis';

const scope = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

export const oauthClient = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_CALLBACK_URL,
);

export const authorizationUrl = oauthClient.generateAuthUrl({
  access_type: 'offline',
  scope: scope,
  include_granted_scopes: true,
});
