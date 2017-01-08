<?php
// Functions to talk directly with the google calendar
require_once(dirname(__FILE__) . '/../googlecalendar/vendor/autoload.php');

        
/**
 * Returns an authorized API client.
 * @return Google_Client the authorized client object
 */
function getClient($calendar_app_name, $calendar_app_scopes, 
                    $calendar_app_secret_path, $calendar_app_credential_path) 
{
    $client = new Google_Client();
    $client->setApplicationName($calendar_app_name);
    $client->setScopes($calendar_app_scopes);
    $client->setAuthConfig($calendar_app_secret_path);
    $client->setAccessType('offline');
    
    // Load previously authorized credentials from a file.
    if (file_exists($calendar_app_credential_path)) {
        $accessToken = json_decode(file_get_contents($calendar_app_credential_path), true);
    } else {
        // Request authorization from the user.
        $authUrl = $client->createAuthUrl();
        printf("Open the following link in your browser:\n%s\n", $authUrl);
        print 'Enter verification code: ';
        $authCode = trim(fgets(STDIN));

        // Exchange authorization code for an access token.
        $accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
        print_r($accessToken);
        print("\n");

        // Store the credentials to disk.
        if(!file_exists(dirname($calendar_app_credential_path))) {
            mkdir(dirname($calendar_app_credential_path), 0700, true);
        }
        file_put_contents($calendar_app_credential_path, json_encode($accessToken));
        printf("Credentials saved to %s\n", $calendar_app_credential_path);
    }
    $client->setAccessToken($accessToken);

    // Refresh the token if it's expired.
    // EDIT BY CPM: we have to re-save the refresh token since for some reason
    //    it's not passed back??
    if ($client->isAccessTokenExpired()) {
        $refresh_token = $client->getRefreshToken();
        $client->fetchAccessTokenWithRefreshToken($refresh_token);

        $accessTokenArr = $client->getAccessToken();
        $accessTokenArr['refresh_token'] = $refresh_token;
        //$accessToken = json_encode($client->getAccessToken());
        $accessToken = json_encode($accessTokenArr);

        file_put_contents($calendar_app_credential_path, $accessToken);
    }
    return $client;
}

// Get a Google_Service_Calendar object
function get_google_calendar_service($calendar_app_name, $calendar_app_secret_path, 
                    $calendar_app_credential_path, $readwrite_access=true)
{
    if ($readwrite_access) {
        $scopes = implode(' ', array(Google_Service_Calendar::CALENDAR));
    } else {
        $scopes = implode(' ', array(Google_Service_Calendar::CALENDAR_READONLY));
    }
    
    
    $client = getClient($calendar_app_name, $scopes, 
                $calendar_app_secret_path, $calendar_app_credential_path);
    $service = new Google_Service_Calendar($client);

    return $service;
}
