var app = require("../lib/app");

exports.accountFile = {
  "get db name for specified skype account": function(test) {
    test.strictEqual("/Users/flyerhzm/Library/Application Support/Skype/flyerhzm", app.accountFile("flyerhzm"));
    test.done();
  }
}

// I'm still a new comer for node.js, I will write more tests after I learn more about node.js
