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

        var message = 'APNs Registered and Received Message ! ';
        var data = {
          data: {
            message: message
          },
          aps: {
            alert: message
          }
        };

        var params = {
          //Message: 'APNs Registered and Received Message ! ',
          MessageStructure: 'json',
          Message: JSON.stringify(data),
          //Subject: 'TestSNS',
          TargetArn: data.EndpointArn
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

// https://github.com/evanshortiss/sns-mobile/blob/master/lib/interface.js

/**
 * Convert a provided message to GCM format
 * @param   {String/Object} message
 * @return  {String}
 */

Interface.prototype.convertToGcmFormat = function(message, callback) {
  // GCM format expected by amazon for messages
  // {
  //   GCM: JSON.stringify({
  //     data: {
  //       message:"<message>"
  //     }
  //   })
  // }

  var container = {}
    , key = (this.platform === SUPPORTED_PLATFORMS.ANDROID) ? 'GCM' : 'ADM';

  if (typeof message === 'string') {
    try {
      container[key] = JSON.stringify({
        data: {
          message: message
        }
      });

      callback(null, container);
    } catch (e) {
      callback(e, null);
    }
  } else if (message != null && typeof message === 'object') {
    if(message.GCM || message.ADM || message.default) {
      callback(null, message);
    } else {
      try {
        container[key] = JSON.stringify(message);

        callback(null, container);
      } catch (e) {
        callback(e, null);
      }
    }
  } else {
    var e = new Error('Unable to convert message to ADM/GCM format. Message ' +
    'must be String/Object.');

    callback(e, null);
  }
};


/**
 * Convert a message to APNS format
 * @param   {String/Object} message
 * @return  {String}
 */

Interface.prototype.convertToApnsFormat = function (message, callback) {
  // APNS format expected by amazon for messages
  // {
  //   APNS: JSON.stringify({
  //     "aps": {
  //       "alert": "<message>"
  //     }
  //   })
  // }

  var APNS = this.sandbox ? 'APNS_SANDBOX' : 'APNS'
    , messageContainer = {};

  if (typeof message === 'string') {
    try {
      messageContainer[APNS] = JSON.stringify({
        aps: {
          alert: message
        }
      });

      callback(null, messageContainer);
    } catch (e) {
      callback(e, null);
    }
  } else if (message !== null && typeof message === 'object') {
    if (message['APNS_SANDBOX'] || message['APNS']) {
      callback(null, message);
    } else {
      try {
        messageContainer[APNS] = JSON.stringify(message);
        callback(null, messageContainer);
      } catch (e) {
        callback(e, null);
      }
    }
  } else {
    var e = new Error('Unable to convert message to APNS format. Message' +
    ' must be String/Object.');

    callback(e, null);
  }
};
