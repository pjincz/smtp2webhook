var config = require('./config');
var URLSearchParams = require('url-search-params');
var fetch = require('node-fetch');

exports.send = async function(body) {
  var form = new URLSearchParams();
  for (var key in body) {
    if (body.hasOwnProperty(key) && body[key] !== undefined) {
      form.append(key, body[key]);
    }
  }
  form.append('data', new Date().toISOString());

  if (config.debug)
    console.log(form);

  var res = await fetch(config.upstream, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!res.ok) {
    throw new Error('upstream error');
  }

  var json = await res.json();
  if (config.debug)
    console.log(json);

  return json;
}

/*
exports.send({
  ak: "e8562670b6c840688f34044309b0fdd0",
  sender: "pjincz@gmail.com",
  receiver: "test@jcz.onl",
  subject: "test+mail",
  textcontent: "awef awef awef",
}).then(console.log);
*/
