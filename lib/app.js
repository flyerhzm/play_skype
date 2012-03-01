var sqlite3 = require('sqlite3').verbose()
  , terminal = require('color-terminal')
  , sys = require('util');

// There must be a graceful way to solve the dependencies.
function play(account_name) {
  var db = new sqlite3.Database(accountFile(account_name));
  db.all("select id, displayname from Conversations where type = 2", function(err, conversations) {
    if (err) { throw err; }
    var conversation_ids = conversations.map(function(conversation) { return conversation.id; });

    db.all("select convo_id, identity from Participants where convo_id in (" + conversation_ids + ")", function(err, participants) {
      conversations.forEach(function(conversation) {
        conversation.participants = participants.filter(function(participant) { return participant.convo_id == conversation.id });
      });
      db.all("select convo_id, author, count(id) as messages_count from Messages where convo_id in (" + conversation_ids + ") group by convo_id, author", function(err, rows) {
        conversations.forEach(function(conversation) {
          conversation.participants.forEach(function(participant) {
            var conversation_participant_row = rows.filter(function(row) { return row.convo_id == conversation.id && row.author == participant.identity; })[0]
            if (conversation_participant_row) {
              participant.messages_count = conversation_participant_row.messages_count;
            } else {
              participant.messages_count = 0;
            }
          });
        });
        db.close();
        output(conversations);
      });
    });
  });
}

function output(conversations) {
  conversations.forEach(function(conversation) {
    terminal.nl(2).color('magenta').write(conversation.displayname).nl(2).reset();
    conversation.participants.sort(function(p1, p2) { return p2.messages_count - p1.messages_count; }).forEach(function(participant) {
      terminal.tab(4).write(participant.identity + ": " + participant.messages_count).nl(1);
    });
  });
}

var accountFile = function(account_name) {
  return process.env.HOME + "/Library/Application\ Support/Skype/" + account_name + "/main.db";
}

exports.accountFile = accountFile;

if (process.argv.length > 2) {
  var account_name = process.argv[2];
  play(account_name);
} else {
  console.log("node lib/app.js [account_name]");
}
