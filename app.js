var config = require('./config');
var SMTPServer = require('smtp-server').SMTPServer;
var DKIM = require('dkim');
var simpleParser = require('mailparser').simpleParser;

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
				mail.dkim_verified = await dkim_verify(message);
				delete mail.headers;
				delete mail.headerLines;
				console.log(mail);
				callback();
			} catch(e) {
				console.error(e);
				callback(e);
			}
		});
  },
});

server.listen(25);
