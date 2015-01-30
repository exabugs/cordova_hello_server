var express = require('express');
var router = express.Router();
var async = require('async');
var AWS = require('aws-sdk');

/* GET devices listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/', function(req, res) {

  var regid = req.body.regid;

  var sns = new AWS.SNS();

  var arn = 'arn:aws:sns:ap-northeast-1:521185453080:app/APNS_SANDBOX/jp.co.dreamarts.cordovaHello';

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
          next(err, data);
/*
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
*/
        });
      },

      function(data, next) {

        var params = {
          TargetArn: data.EndpointArn,
          Message: 'APNs Registered and Received Message ! ',
          Subject: 'TestSNS'
        };

        sns.publish(params, function(err, data) {
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
