var express = require('express');
var router = express.Router();
var async = require('async');
var AWS = require('aws-sdk');

// https://console.developers.google.com/project/warm-skill-823/apiui/api?authuser=0
// Google Cloud Messaging for Android

/* GET devices listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/', function(req, res) {

  var regid = req.body.regid;
  var platform = req.body.platform;

  console.log('regid : ' + regid + '   platform :' + platform);

  var sns = new AWS.SNS();

  var arn_id = 'arn:aws:sns:ap-northeast-1:521185453080:app';
  //var platform = 'APNS_SANDBOX';
  var app_id = 'jp.co.dreamarts.cordovaHello';

  //var arn = [arn_id, platform, app_id].join('/');

  /*
  var arn = 'arn:aws:sns:ap-northeast-1:521185453080:app/APNS_SANDBOX/jp.co.dreamarts.cordovaHello';
  var arn = 'arn:aws:sns:ap-northeast-1:521185453080:app/APNS/jp.co.dreamarts.cordovaHello';
  var arn = 'arn:aws:sns:ap-northeast-1:521185453080:app/GCM/jp.co.dreamarts.cordovaHello';
  var epa = 'arn:aws:sns:ap-northeast-1:521185453080:endpoint/GCM/cordova_hello/bdf3b2b3-6866-34c7-a9f0-c6fa6ecb6b62';
  */

  async.waterfall([
/*
      function(next) {
        var params = {
          PlatformApplicationArn: arn
        };
        sns.listEndpointsByPlatformApplication(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
      },
*/
      function(next) {
        var arn = [arn_id, platform, app_id].join('/');
        console.log(arn);

        var params = {
          // todo: UserDatan無しで登録。ユーザとの紐付けはアプリ側で行うように。
          // todo: ユーザがアプリにログインしたらデバイスID(Token)を送るようにする。
          // todo: Token(_id), UserId, ExpireDate(セッション有効期限)
          // todo: 有効期限切れはタイマーで削除していく
          //CustomUserData: 'STRING_VALUE'
          PlatformApplicationArn: arn, /* required */
          Token: regid /* required */
        };
        sns.createPlatformEndpoint(params, function(err, data) {
          err && console.log(err);
          console.log(JSON.stringify(data));
          next(err, data);

/*
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
*/
        });
      },

      function(data, next) {

        var title = 'I am default';
        var content = 'APNs Registered and Received Message ! ';

        var message = {
          GCM: JSON.stringify({
            data: {
              message: content
            }
          }),
          APNS_SANDBOX: JSON.stringify({
            aps: {
              sound: 'default',
              badge: 1,
              alert: content
            }
          })
        };

        console.log(JSON.stringify(message));
        var params = {
          //Message: 'APNs Registered and Received Message ! ',
          MessageStructure: 'json',
          //Message: JSON.stringify(message),
          Message: message,
          //Subject: 'TestSNS',
          TargetArn: data.EndpointArn
        };

        sns.publish(params, function(err, data) {
          err && console.log(err);
          next(err, data);
          /*
          if (err) {
            console.log('Error sending a message', err);
          } else {
            console.log('Sent message:', data.MessageId);
          }
          */
        });
      }

    ], function(err) {
      res.send('respond with a resource');
    }
  );

});

module.exports = router;

// https://github.com/evanshortiss/sns-mobile/blob/master/lib/interface.js

