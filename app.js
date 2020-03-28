console.log("h");

const Youtube = require("youtube-api")
  , fs = require("fs")
  , readJson = require("r-json")
  , Lien = require("lien")
  , Logger = require("bug-killer")
  , opn = require("opn")
  , prettyBytes = require("pretty-bytes") 
  ;

// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`${__dirname}/client_secret_latest.json`);

// Init lien server
let server = new Lien({
  host: "localhost"
  , port: 5000
});

// Authenticate
// You can access the Youtube resources via OAuth2 only.
// https://developers.google.com/youtube/v3/guides/moving_to_oauth#service_accounts
let oauth = Youtube.authenticate({
  type: "oauth"
  , client_id: CREDENTIALS.web.client_id
  , client_secret: CREDENTIALS.web.client_secret
  , redirect_url: CREDENTIALS.web.redirect_uris[0]
});

opn(oauth.generateAuthUrl({
  access_type: "offline"
  , scope: ["https://www.googleapis.com/auth/youtube.upload"]
}));

// Handle oauth2 callback
server.addPage("/callback", lien => {
  Logger.log("Trying to get the token using the following code: " + lien.query.code);
  // postChannelBulletin();
  // return
  oauth.getToken(lien.query.code, (err, tokens) => {
    if (err) {
      lien.lien(err, 400);
      return Logger.log(err);
    }

    Logger.log("Got the tokens.");
    oauth.setCredentials(tokens);
    lien.end("The video is being uploaded. Check out the logs in the terminal.");

    var req = Youtube.videos.insert({

      // // manzoor.alam@thinktac.com
      // onBehalfOfContentOwner: "Md manzoor Alam",
      // onBehalfOfContentOwnerChannel: "UCSOYBPQMQambaF-61enlfGA", 

      // manzoor1996alam@gmail.com
      // channel name= "Manzoor Alam"
      // userId="uf4HUGG3F2GbekIkvlDOnA"
      // Channel ID= "UCuf4HUGG3F2GbekIkvlDOnA"
      // onBehalfOfContentOwner: "Md Manzoor Alam",
      // onBehalfOfContentOwnerChannel: "UCSOYBPQMQambaF-61enlfGA",
      id:'2',
      resource: { 
        snippet: {
          channelId:"UCSOYBPQMQambaF-61enlfGA",
          channelTitle:"Md Manzoor Alam",
          // categoryId :12,
          title: "Testing YoutTube API NodeJS module",
          description: "Test video upload via YouTube API",
        }
        , status: {
          privacyStatus: "public"
        }
      }
      // This is for the callback function
      , part: "snippet,status"
      // Create the readable stream to upload the video
      , media: {
        body: fs.createReadStream("videos2.mp4")
      }
    }, (err, data) => {
      if(err) { 
        console.log("Errors : " +err);
        return lien.end(err, 400);
      }
      console.log("data: " + JSON.stringify(data));
      console.log("Done.");
      process.exit();
    });
    setInterval(function () {
      Logger.log(`${prettyBytes(req.req.connection._bytesDispatched)} bytes uploaded.`);
    }, 250);
  });
});


// function http() {
//   var request = require('request');
//   var options = {
//     'method': 'POST',
//     'url': 'https://www.googleapis.com/youtube/v3/videos?part=snippet%2Cstatus&key="BigsSJx3qFV1VBtRESEYYrO-"',
//     'headers': {
//       'Authorization': '',
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ "snippet": { "categoryId": "22", "description": "Description of uploaded video.", "title": "Test video upload." }, "status": { "privacyStatus": "private" } })
//   };
//   request(options, function (error, response) {
//     if (error) throw new Error(error);
//     console.log(response.body);
//   });
// }


// function postChannelBulletin() {
//   var message = 'Thanks for subscribing to my channel!  This posting is from Google Apps Script';
//   var videoId = 'tQL7_T9-fkM';
//   var resource = {
//     "channelId": "UCSOYBPQMQambaF-61enlfGA",
//     snippet: {
//       description: message
//     },
//     contentDetails: {
//       bulletin: {
//         resourceId: {
//           kind: 'youtube#video',
//           videoId: videoId
//         }
//       }
//     }
//   };
//   var response = Youtube.Activities.insert(resource, 'snippet,contentDetails');
//   Logger.log(response);
// }