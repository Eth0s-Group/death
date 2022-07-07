let authority = { address: '8.8.8.8', port: 53, type: 'udp' };

function proxy(question, response, cb) {
  console.log('proxying', question.name);

  var request = dns.Request({
    question: question, // forwarding the question
    server: authority,  // this is the DNS server we are asking
    timeout: 1000
  });

  // when we get answers, append them to the response
  request.on('message', (err, msg) => {
    msg.answer.forEach(a => response.answer.push(a));
  });

  request.on('end', cb);
  request.send();
}
let async = require('async');

function handleRequest(request, response) {
  console.log('request from', request.address.address, 'for', request.question[0].name);

  let f = []; // array of functions

  // proxy all questions
  // since proxying is asynchronous, store all callbacks
  request.question.forEach(question => {
    f.push(cb => proxy(question, response, cb));
  });

  // do the proxying in parallel
  // when done, respond to the request by sending the response
  async.parallel(f, function() { response.send(); });
}

server.on('request', handleRequest);


let entries = [
  { domain: "^captive.apple.com", records: [ { type: "CNAME", address: "eth0sdashboard.gq", ttl: 1800 } ] },
  { domain: "^connectivitycheck.static.com" , records: [ { type: "CNAME", address: "eth0sdashboard.gq", ttl: 1800 } ] }
  ];

function handleRequest(request, response) {
  console.log('request from', request.address.address, 'for', request.question[0].name);

  let f = [];

  request.question.forEach(question => {
    let entry = entries.filter(r => new RegExp(r.domain, 'i').exec(question.name));
    if (entry.length) {
      entry[0].records.forEach(record => {
        record.name = question.name;
        record.ttl = record.ttl || 1800;
        response.answer.push(dns[record.type](record));
      });
    } else {
      f.push(cb => proxy(question, response, cb));
    }
  });

  async.parallel(f, function() { response.send(); });
}
entry[0].records.forEach(record => {
  record.name = question.name;
  record.ttl = record.ttl || 1800;
  if (record.type == 'CNAME') {
    record.data = record.address;
    f.push(cb => proxy({ name: record.data, type: dns.consts.NAME_TO_QTYPE.A, class: 1 }, response, cb));
  }
  response.answer.push(dns[record.type](record));
});


