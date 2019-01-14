var config = require('./config');
var SMTPServer = require('smtp-server').SMTPServer;
var DKIM = require('dkim');
var simpleParser = require('mailparser').simpleParser;
var upstream = require('./upstream');

function dkim_verify(message) {
  return new Promise(function(fullfil, reject) {
    DKIM.verify(Buffer.from(message), function(err, v) {
      if (err) {
        fullfil(false);
      }
      for (var x of v) {
        if (!x.verified) {
          fullfil(false);
          return;
        }
      }
      fullfil(true);
    });
  });
}

var server = new SMTPServer({
  authOptional: true,
  size: config.maxSize,
  onData(stream, session, callback) {
    var message = Buffer.from('');
    stream.on('data', function(data) {
      message = message + data;
    });
    stream.on('end', async function() {
      try {
        var mail = await simpleParser(message);
        var dkim = await dkim_verify(message);
        if (!dkim) {
          var e = new Error('DKIM Verify Failed');
          e.responseCode = 554;
          return callback(e);
        }

        var attachments = [];
        for (var a of mail.attachments) {
          if (a.contentType && a.contentType.match(/^image\//)) {
            attachments.push(a.content.toString('base64'));
          }
        }

        var res = await upstream.send({
          ak: config.ak,
          sender: mail.from.text,
          receiver: mail.to.text,
          subject: mail.subject,
          textcontent: mail.text,
          attachment: attachments.length > 0 ? attachments.join('|') : undefined,
        });
        if (res.showapi_res_code == 1) {
          return callback();
        } else if (res.showapi_res_error) {
          var e = new Error(res.showapi_res_error);
          e.responseCode = 554;
          return callback(e);
        } else {
          var e = new Error('Internal Error');
          e.responseCode = 554;
          return callback(e);
        }
      } catch(e) {
        console.error(e);
        var e = new Error('Internal Error');
        e.responseCode = 554;
        return callback(e);
      }
    });
  },
});

server.on('error', function(e) {
  console.error(e);
});

server.listen(25);
