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
        if (!dkim)
          return callback(new Error('DKIM Verify Failed'));

        var res = await upstream.send({
          ak: config.ak,
          sender: mail.from.text,
          receiver: mail.to.text,
          subject: mail.subject,
          textcontent: mail.text,
        });
        if (res.showapi_res_code == 1) {
          callback();
        } else if (res.showapi_res_error) {
          callback(new Error(res.showapi_res_error));
        } else {
          callback(new Error('Internal Error'));
        }
        callback();
      } catch(e) {
        console.error(e);
        callback(new Error('Internal Error'));
      }
    });
  },
});

server.listen(25);
