const express = require('express');
const session = require("express-session")
const passport = require('passport');
const Strategy = require('passport-discord').Strategy;
const { Canvas } = require('canvas-constructor');
const app = express();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const fs = require("fs");
const fetch = require('node-fetch');
const io = require('socket.io')(server)
botconfig = JSON.parse(fs.readFileSync('./botconfig.json','utf8'));
const Discord = require('discord.js');
// const mysql = require("mysql");
const Enmap = require('enmap');
const db = new Enmap({ name: 'sbot' });
const client = new Discord.Client();
let invites = {};
let anti = {};
const {logdb} = require("./public/db.js")

client.login(botconfig.token);

// const con = mysql.createConnection({
    // user: 'root',
    // host: 'localhost',
    // password: 'SamEr*-1',
    // database: 'fastbot'
  // });

//   let anti = JSON.parse(fs.readFileSync("./antigreff.json", "UTF8"));
//   let config = JSON.parse(fs.readFileSync("./config.json", "UTF8"));
client.on('messageDelete', message => {

    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!message.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) return;
    logdb.ensure(message.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(message.guild.id, "ch"))
    if (!logChannel) return;

    let messageDelete = new Discord.RichEmbed()
        .setTitle('**Message deleted**')
        .setColor('RED')
        .setThumbnail(message.author.avatarURL)
        .setDescription(`A message sent by <@!${message.author.id}> deleted in <#${message.channel.id}>`)
        .addField("**Message:-**", `\`\`\`\n${message}\n\`\`\``)
        .setTimestamp()
        .setFooter(message.guild.name, message.guild.iconURL)

    logChannel.send(messageDelete);
});
client.on('messageUpdate', (oldMessage, newMessage) => {

    if (oldMessage.author.bot) return;
    if (!oldMessage.channel.type === 'dm') return;
    if (!oldMessage.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!oldMessage.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) return;
    logdb.ensure(oldMessage.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(oldMessage.guild.id, "ch"))
    if (!logChannel) return;

    if (oldMessage.content.startsWith('https://')) return;

    let messageUpdate = new Discord.RichEmbed()
        .setTitle('**Message edited**')
        .setThumbnail(oldMessage.author.avatarURL)
        .setColor('BLUE')
        .setDescription(`A message sent by <@!${oldMessage.author.id}> edited in <#${oldMessage.channel.id}>`)
        .addField("**Old message:-**", `\`\`\`\n${oldMessage}\n\`\`\``)
        .addField("**New message:-**", `\`\`\`\n${newMessage}\n\`\`\``)
        .setTimestamp()
        .setFooter(oldMessage.guild.name, oldMessage.guild.iconURL)

    logChannel.send(messageUpdate);
});


client.on('roleCreate', role => {

    if (!role.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!role.guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(role.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(role.guild.id, "ch"))
    if (!logChannel) return;

    role.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        let roleCreate = new Discord.RichEmbed()
            .setTitle('**Role created**')
            .setThumbnail(userAvatar)
            .setDescription(`A new role created by <@!${userID}>`)
            .addField(`**Role:-**`, `<@&${role.id}>`)
            .setColor('GREEN')
            .setTimestamp()
            .setFooter(role.guild.name, role.guild.iconURL)
        logChannel.send(roleCreate);
    })
});
client.on('roleDelete', role => {

    if (!role.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!role.guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(role.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(role.guild.id, "ch"))
    if (!logChannel) return;

    role.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        let roleDelete = new Discord.RichEmbed()
            .setTitle('**Role deleted**')
            .setThumbnail(userAvatar)
            .setDescription(`A role has been deleted by <@!${userID}>`)
            .addField("**Role name:-**", `${role.name}`)
            .setColor('RED')
            .setTimestamp()
            .setFooter(role.guild.name, role.guild.iconURL)

        logChannel.send(roleDelete);
    })
});
client.on('roleUpdate', (oldRole, newRole) => {

    if (!oldRole.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!oldRole.guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(oldRole.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(oldRole.guild.id, "ch"))
    if (!logChannel) return;

    oldRole.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        if (oldRole.name !== newRole.name) {
          if (logdb.status == false) return;
          let roleUpdateName = new Discord.RichEmbed()
                .setTitle('**Role updated**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`<@!${userID}> changed the name of the role <@&${newRole.id}>`)
                .addField("**Old name:-**", `${oldRole.name}`)
                .addField("**New name:-**", `${newRole.name}`)
                .setTimestamp()
                .setFooter(oldRole.guild.name, oldRole.guild.iconURL)

            logChannel.send(roleUpdateName);
        }
        if (oldRole.hexColor !== newRole.hexColor) {
            if (oldRole.hexColor === '#000000') {
                var oldColor = 'Default';
            } else {
                var oldColor = oldRole.hexColor;
            }
            if (newRole.hexColor === '#000000') {
                var newColor = 'Default';
            } else {
                var newColor = newRole.hexColor;
            }
            if (logdb.status == false) return;
            let roleUpdateColor = new Discord.RichEmbed()
                .setTitle('**Role Updated**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`<@!${userID}> changed the color of the role <@&${newRole.id}>`)
                .addField("**Old color:-**", `${oldColor}`)
                .addField("**New color:-**", `${newColor}`)
                .setTimestamp()
                .setFooter(oldRole.guild.name, oldRole.guild.iconURL)

            logChannel.send(roleUpdateColor);
        }
    })
});

client.on('channelCreate', channel => {

    if (!channel.guild) return;
    if (!channel.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!channel.guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(channel.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(channel.guild.id, "ch"))
    if (!logChannel) return;

    if (channel.type === 'text') {
        var roomType = 'text channel';
        var roomTypee = 'Channel';
    } else
        if (channel.type === 'voice') {
            var roomType = 'voice channel';
            var roomTypee = 'Channel';
        } else
            if (channel.type === 'category') {
                var roomType = 'category';
                var roomTypee = 'Category';
            }

    channel.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        let channelCreate = new Discord.RichEmbed()
            .setTitle('**Channel created**')
            .setThumbnail(userAvatar)
            .setDescription(`A ${roomType} has been created by <@!${userID}>`)
            .addField(`**${roomTypee} name:-**`, channel.name)
            .setColor('GREEN')
            .setTimestamp()
            .setFooter(channel.guild.name, channel.guild.iconURL)

        logChannel.send(channelCreate);
    })
});
client.on('channelDelete', channel => {
    if (!channel.guild) return;
    if (!channel.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!channel.guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(channel.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(channel.guild.id, "ch"))
    if (!logChannel) return;

    if (channel.type === 'text') {
      var roomType = 'text channel';
      var roomTypee = 'Channel';
  } else
      if (channel.type === 'voice') {
          var roomType = 'voice channel';
          var roomTypee = 'Channel';
      } else
          if (channel.type === 'category') {
              var roomType = 'category';
              var roomTypee = 'Category';
          }

    channel.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        let channelDelete = new Discord.RichEmbed()
            .setTitle('**Channel deleted**')
            .setThumbnail(userAvatar)
            .setDescription(`A ${roomType} deleted by <@!${userID}>`)
            .addField(`**${roomTypee} name:-**`, channel.name)
            .setColor('RED')
            .setTimestamp()
            .setFooter(channel.guild.name, channel.guild.iconURL)

        logChannel.send(channelDelete);
    })
});

client.on('channelUpdate', (oldChannel, newChannel) => {
    if (!oldChannel.guild) return;
    logdb.ensure(oldChannel.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(oldChannel.guild.id, "ch"))
    if (!logChannel) return;

    if (oldChannel.type === 'text') {
      var roomType = 'text channel';
      var roomTypee = 'Channel';
  } else
      if (oldChannel.type === 'voice') {
          var roomType = 'voice channel';
          var roomTypee = 'Channel';
      } else
          if (oldChannel.type === 'category') {
              var roomType = 'category';
              var roomTypee = 'Category';
          }
    oldChannel.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        if (oldChannel.name !== newChannel.name) {
            let newName = new Discord.RichEmbed()
                .setTitle('**Channel updated**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`<#${oldChannel.id}> name updated by <@!${userID}>`)
                .addField("**Old name:-**", oldChannel.name)
                .addField("**New name:-**", newChannel.name)
                .setTimestamp()
                .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL)

           return logChannel.send(newName);
        }
        if (oldChannel.topic !== newChannel.topic) {
          if(oldChannel.topic == null && newChannel.topic == null || oldChannel.topic == "" && newChannel.topic == "") return;
          if (logdb.status == false) return;
          let newTopic = new Discord.RichEmbed()
                .setTitle('**Channel updated**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`<#${newChannel.id}> topic updated by <@!${userID}>`)
                .addField("**Old topic:-**", oldChannel.topic || "None.")
                .addField("**New topic:-**", newChannel.topic || "None.")
                .setTimestamp()
                .setFooter(oldChannel.guild.name, oldChannel.guild.iconURL)
            logChannel.send(newTopic);
        }
    })
});


client.on('guildBanAdd', (guild, user) => {

    if (!guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(guild.id, "ch"))
    if (!logChannel) return;
    guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;
        if (userID === client.user.id) return;
        let banInfo = new Discord.RichEmbed()
            .setTitle('**Member banned**')
            .setThumbnail(userAvatar)
            .setColor('DARK_RED')
            .setDescription(`**\n**<@!${userID}> banned <@!${user.id}> from the server.`)
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL)
        logChannel.send(banInfo);
    })
});
client.on('guildBanRemove', (guild, user) => {
    if (!guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(guild.id, "ch"))
    if (!logChannel) return;
    guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;

        if (userID === client.user.id) return;

        let unBanInfo = new Discord.RichEmbed()
            .setTitle('**Member unbanned**')
            .setThumbnail(userAvatar)
            .setColor('GREEN')
            .setDescription(`**\n**<@!${userID}> unbanned <@!${user.id}> from the server.`)
            .setTimestamp()
            .setFooter(guild.name, guild.iconURL)

        logChannel.send(unBanInfo);
    })
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (!oldMember.guild) return;
    logdb.ensure(oldMember.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(oldMember.guild.id, "ch"))
    if (!logChannel) return;

    oldMember.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userAvatar = logs.entries.first().executor.avatarURL;
        var userTag = logs.entries.first().executor.tag;

        if (oldMember.nickname !== newMember.nickname) {
            if (oldMember.nickname === null) {
                var oldNM = 'None.';
            } else {
                var oldNM = oldMember.nickname;
            }
            if (newMember.nickname === null) {
                var newNM = 'None.';
            } else {
                var newNM = newMember.nickname;
            }
            if(userID == newMember.id) {
              var actioner = `<@!${newMember.id}> changed his nickname`
            } else {
              var actioner = `<@!${userID}> changed <@!${newMember.id}>'s nickname.`
            }
            
            let updateNickname = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail(userAvatar)
                .setColor('BLUE')
                .setDescription(`${actioner}`)
                .addField("**Old nickname:-**", oldNM)
                .addField("**New nickname:-**", newNM)
                .setTimestamp()
                .setFooter(oldMember.guild.name, oldMember.guild.iconURL)

            logChannel.send(updateNickname);
        }
        if (oldMember.roles.size < newMember.roles.size) {
            let role = newMember.roles.filter(r => !oldMember.roles.has(r.id)).first();
            logdb.ensure(oldMember.guild.id, { ch: null, status: false })
            if (logdb.status == false) return;
            if(userID == newMember.id) {
              var actioner = `<@!${newMember.id}> changed his roles`
            } else {
              var actioner = `<@!${userID}> added a role to <@!${newMember.id}>`
            }
            let roleAdded = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail(userAvatar)
                .setColor('GREEN')
                .setDescription(`${actioner}`)
                .addField("**Role:-**", `<@&${role.id}>`)
                .setTimestamp()
                .setFooter(oldMember.guild.name, oldMember.guild.iconURL)

            logChannel.send(roleAdded);
        }
        if (oldMember.roles.size > newMember.roles.size) {
            let role = oldMember.roles.filter(r => !newMember.roles.has(r.id)).first();
            logdb.ensure(oldMember.guild.id, { ch: null, status: false })
            if (logdb.status == false) return;
            if(userID == newMember.id) {
              var actioner = `<@!${newMember.id}> changed his roles`
            } else {
              var actioner = `<@!${userID}> removed a role from <@!${newMember.id}>`
            }
            let roleRemoved = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail(userAvatar)
                .setColor('RED')
                .setDescription(`${actioner}`)
                .addField("**Role:-**", `<@&${role.id}>`)
                .setTimestamp()
                .setFooter(oldMember.guild.name, oldMember.guild.iconURL)

            logChannel.send(roleRemoved);
        }
    })
    if (oldMember.guild.owner.id !== newMember.guild.owner.id) {
      logdb.ensure(oldMember.guild.id, { ch: null, status: false })
      if (logdb.status == false) return;
        let newOwner = new Discord.RichEmbed()
            .setTitle('**Guild updated**')
            .setThumbnail(oldMember.guild.iconURL)
            .setColor('GREEN')
            .setDescription(`The guild ownership transfered.`)
            .addField("**Old ownership:-**", `<@!${oldMember.id}>`)
            .addField("**New ownership:-**", `<@!${newMember.id}>`)
            .setTimestamp()
            .setFooter(oldMember.guild.name, oldMember.guild.iconURL)
        logChannel.send(newOwner);
    }
});


client.on('voiceStateUpdate', (voiceOld, voiceNew) => {

    if (!voiceOld.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
    if (!voiceOld.guild.member(client.user).hasPermission('VIEW_AUDIT_LOG')) return;
    logdb.ensure(voiceOld.guild.id, { ch: null, status: false })
    if (logdb.status == false) return;
    var logChannel = client.channels.get(logdb.get(voiceOld.guild.id, "ch"))
    if (!logChannel) return;

    voiceOld.guild.fetchAuditLogs().then(logs => {
        var userID = logs.entries.first().executor.id;
        var userTag = logs.entries.first().executor.tag;
        var userAvatar = logs.entries.first().executor.avatarURL;

        if (voiceOld.serverMute === false && voiceNew.serverMute === true) {
          if(userID == voiceNew.id) {
            var actioner = `<@!${voiceNew.id}> muted himself`
          } else {
            var actioner = `<@!${userID}> muted <@!${voiceNew.id}>`
          }
            let serverMutev = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail('https://images-ext-1.discordapp.net/external/pWQaw076OHwVIFZyeFoLXvweo0T_fDz6U5C9RBlw_fQ/https/cdn.pg.sa/UosmjqDNgS.png')
                .setColor('RED')
                .setDescription(`${actioner}`)
                .setTimestamp()
                .setFooter(voiceOld.guild.name, voiceOld.guild.iconURL)

            logChannel.send(serverMutev);
        }
        if (voiceOld.serverMute === true && voiceNew.serverMute === false) {
          logdb.ensure(voiceOld.guild.id, { ch: null, status: false })
          if (logdb.status == false) return;
          if(userID == voiceNew.id) {
            var actioner = `<@!${voiceNew.id}> unmuted himself`
          } else {
            var actioner = `<@!${userID}> unmuted <@!${voiceNew.id}>`
          }
            let serverUnmutev = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail('https://images-ext-1.discordapp.net/external/u2JNOTOc1IVJGEb1uCKRdQHXIj5-r8aHa3tSap6SjqM/https/cdn.pg.sa/Iy4t8H4T7n.png')
                .setColor('GREEN')
                .setDescription(`${actioner}`)
                .setTimestamp()
                .setFooter(voiceOld.guild.name, voiceOld.guild.iconURL)

            logChannel.send(serverUnmutev);
        }
        if (voiceOld.serverDeaf === false && voiceNew.serverDeaf === true) {
          logdb.ensure(voiceOld.guild.id, { ch: null, status: false })
          if (logdb.status == false) return;
          if(userID == voiceNew.id) {
            var actioner = `<@!${voiceNew.id}> defeaned himself`
          } else {
            var actioner = `<@!${userID}> defeaned <@!${voiceNew.id}>`
          }
            let serverDeafv = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail('https://images-ext-1.discordapp.net/external/7ENt2ldbD-3L3wRoDBhKHb9FfImkjFxYR6DbLYRjhjA/https/cdn.pg.sa/auWd5b95AV.png')
                .setColor('RED')
                .setDescription(`${actioner}`)
                .setTimestamp()
                .setFooter(voiceOld.guild.name, voiceOld.guild.iconURL)

            logChannel.send(serverDeafv);
        }
        if (voiceOld.serverDeaf === true && voiceNew.serverDeaf === false) {
          logdb.ensure(voiceOld.guild.id, { ch: null, status: false })
          if (logdb.status == false) return;
          if(userID == voiceNew.id) {
            var actioner = `<@!${voiceNew.id}> undefeaned himself`
          } else {
            var actioner = `<@!${userID}> undefeaned <@!${voiceNew.id}>`
          }
            let serverUndeafv = new Discord.RichEmbed()
                .setTitle('**Member updated**')
                .setThumbnail('https://images-ext-2.discordapp.net/external/s_abcfAlNdxl3uYVXnA2evSKBTpU6Ou3oimkejx3fiQ/https/cdn.pg.sa/i7fC8qnbRF.png')
                .setColor('GREEN')
                .setDescription(`${actioner}`)
                .setTimestamp()
                .setFooter(voiceOld.guild.name, voiceOld.guild.iconURL)

            logChannel.send(serverUndeafv);
        }
    })

});

  client.on("channelDelete", async channel => {
	  db.ensure(`pro-${channel.guild.id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
      let d = db.get(`pro-${channel.guild.id}`);
      if (d.isEnabled != "true") return;
      const entry1 = await channel.guild.fetchAuditLogs({
		type: 'CHANNEL_DELETE'
      }).then(audit => audit.entries.first())
      const entry = entry1.executor;

        if (!anti[channel.guild.id + entry.id]) {
            anti[channel.guild.id + entry.id] = {
                actions: 1
            }
            setTimeout(() => {
                anti[channel.guild.id + entry.id].actions = 0;
            }, d.coolTime * 60000)
        } else {
            anti[channel.guild.id + entry.id].actions = Math.floor(anti[channel.guild.id + entry.id].actions + 1)
            setTimeout(() => {
                anti[channel.guild.id + entry.id].actions = "0"
            }, d.coolTime * 60000)
            if (anti[channel.guild.id + entry.id].actions >= d.chaDelLimit) {
                channel.guild.members.get(entry.id).removeRoles(channel.guild.members.get(entry.id).roles).catch(e => channel.guild.owner.send(`**⇏ | ${entry.username} قام بمسح الكثير من الرومات **`))
                anti[channel.guild.id + entry.id].actions = "0"

            }
        }

  });

  client.on("roleDelete", async channel => {
    db.ensure(`pro-${channel.guild.id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
    let d = db.get(`pro-${channel.guild.id}`);
        if (d.isEnabled != "true") return;
        const entry1 = await channel.guild.fetchAuditLogs({
            type: 'ROLE_DELETE'
        }).then(audit => audit.entries.first())
        const entry = entry1.executor
        if (!anti[channel.guild.id + entry.id]) {
            anti[channel.guild.id + entry.id] = {
                actions: 1
            }
            setTimeout(() => {
                anti[channel.guild.id + entry.id].actions = "0"
            }, d.coolTime * 60000)
        } else {
            anti[channel.guild.id + entry.id].actions = Math.floor(anti[channel.guild.id + entry.id].actions + 1)
            setTimeout(() => {
                anti[channel.guild.id + entry.id].actions = "0"
            }, d.coolTime * 60000)
            if (anti[channel.guild.id + entry.id].actions >= d.roleDelLimit) {
                channel.guild.members.get(entry.id).removeRoles(channel.guild.members.get(entry.id).roles).catch(e => channel.guild.owner.send(`**⇏ | ${entry.username} قام بمسح الكثير من الرتب **`))
                anti[channel.guild.id + entry.id].actions = "0";
            }
        }

  });

  client.on("roleCreate", async channel => {

    db.ensure(`pro-${channel.guild.id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
      let d = db.get(`pro-${channel.guild.id}`);
        if (d.isEnabled != "true") return;
        const entry1 = await channel.guild.fetchAuditLogs({
            type: 'ROLE_CREATE'
        }).then(audit => audit.entries.first())
        const entry = entry1.executor
        if (!anti[channel.guild.id + entry.id]) {
            anti[channel.guild.id + entry.id] = {
                actions: 1
            }
            setTimeout(() => {
                anti[channel.guild.id + entry.id].actions = "0"
            }, d.coolTime * 60000)
        } else {
            anti[channel.guild.id + entry.id].actions = Math.floor(anti[channel.guild.id + entry.id].actions + 1)
            setTimeout(() => {
                anti[channel.guild.id + entry.id].actions = "0"
            }, d.coolTime * 60000)
            if (anti[channel.guild.id + entry.id].actions >= d.roleCrLimits) {
                channel.guild.members.get(entry.id).removeRoles(channel.guild.members.get(entry.id).roles).catch(e => channel.guild.owner.send(`**⇏ | ${entry.username} قام بأنشاء الكثير من الرتب **`))
                anti[channel.guild.id + entry.id].actions = "0"
            }
        }
  });

  client.on("guildBanAdd", async (guild, user) => {
    db.ensure(`pro-${guild.id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
      let d = db.get(`pro-${guild.id}`);
        if (d.isEnabled != "true") return;
        const entry1 = await guild.fetchAuditLogs({
            type: 'MEMBER_BAN_ADD'
        }).then(audit => audit.entries.first())
        const entry = entry1.executor;
        if (!anti[guild.id + entry.id]) {
            anti[guild.id + entry.id] = {
                actions: 1
            }
            setTimeout(() => {
                anti[guild.id + entry.id].actions = "0"
            }, d.coolTime * 60000)
        } else {
            anti[guild.id + entry.id].actions = Math.floor(anti[guild.id + entry.id].actions + 1)
            console.log("TETS");
            setTimeout(() => {
                anti[guild.id + entry.id].actions = "0"
            }, d.coolTime * 1000)
            if (anti[guild.id + entry.id].actions >= d.banLimit) {
              channel.guild.members.get(entry.id).removeRoles(channel.guild.members.get(entry.id).roles).catch(e => channel.owner.send(`**⇏ | ${entry.username} حاول حظر جميع الأعضاء **`))
                anti[guild.id + entry.id].actions = "0"
            }
        }
  });


  client.on("guildMemberRemove", async member => {
    db.ensure(`pro-${member.guild.id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
      let d = db.get(`pro-${member.guild.id}`);
        if (d.isEnabled != "true") return;
        const entry1 = await member.guild.fetchAuditLogs().then(audit => audit.entries.first())
        if (entry1.action === "MEMBER_KICK") {
            const entry2 = await member.guild.fetchAuditLogs({
                type: "MEMBER_KICK"
            }).then(audit => audit.entries.first())
            const entry = entry2.executor;
            if (!d) d = {
                banLimit: 3,
                chaDelLimit: 3,
                roleDelLimit: 3,
                kickLimits: 3,
                roleCrLimits: 3
            }
            if (!anti[member.guild.id + entry.id]) {
                anti[member.guild.id + entry.id] = {
                    actions: 1
                }
                setTimeout(() => {
                    anti[member.guild.id + entry.id].actions = "0"
                }, d.coolTime * 1000)
            } else {
                anti[member.guild.id + entry.id].actions = Math.floor(anti[member.guild.id + entry.id].actions + 1)
                console.log("TETS");
                setTimeout(() => {
                    anti[member.guild.id + entry.id].actions = "0"
                }, d.coolTime * 1000)
                if (anti[member.guild.id + entry.id].actions >= d.kickLimits) {
                  channel.guild.members.get(entry.id).removeRoles(channel.guild.members.get(entry.id).roles).catch(e => member.owner.send(`**⇏ | ${entry.username} حاول حظر جميع الأعضاء **`))
                    anti[member.guild.id + entry.id].actions = "0"

                }
            }
        }
  })

client.on('voiceStateUpdate',async (om, nm) => {
	db.ensure(`vc-${nm.guild.id}`, { channelID: null, channelTEXT: null });
    let r = db.get(`vc-${nm.guild.id}`);
	if (r.channelID == null || r.channelTEXT == null) return;
    let guild = nm.guild;
    if (guild.channels.get(r.channelID)) {
        if (!guild.me.hasPermission("MANAGE_CHANNELS")) return;
        let channel = guild.channels.get(r.channelID);
        channel.setName(`${r.channelTEXT}`.replace("00", `${guild.members.filter(m => m.voiceChannel).size}`))
    }
});

client.on('guildMemberAdd', async member => {
    if (member.bot) return;
    let r = db.get(`wlc-${member.guild.id}`);
	if (!r) return;
	let m = r.welcomeMsg;
            if (r.welcomeEnabel == 'true') {
                if (!member.guild.me.hasPermission("MANAGE_GUILD")) return;
                    member.guild.fetchInvites().then( async guildInvites => {

                    let msgtosend = m.replace(/\[user\]/g, member).replace(/\[server\]/g, member.guild.name);
                    if (r.withEmbed == "true") {
                        let  millis = new Date().getTime() - member.user.createdAt.getTime();
                        let now = new Date();
                        let createdAt = millis / 1000 / 60 / 60 / 24;
                        let embed = new Discord.RichEmbed()
                        .setColor("black")
                        .setDescription(`**Joined** to discord since:\n**${createdAt.toFixed(0)}** Days.`)
                        .setAuthor(member.user.tag, member.user.avatarURL)
                        .setThumbnail(member.user.avatarURL);
                        await client.channels.get(r.roomID).send(embed);
                     }
                    await client.channels.get(r.roomID).send(msgtosend);
                    if (r.roleID != "None") {
                        if (member.guild.me.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) {
                            member.addRole(r.roleID);
                        };
                    };
            });

            }
   

});

client.on("message",async (message) => {
	if (!message.guild) return;
	db.ensure(`ar-${message.guild.id}`, []);
	let r = db.get(`ar-${message.guild.id}`);
	if (r.map((e) => e.msg).includes(message.content)) {
		if (r.botsabel == 'true') {
			message.channel.send(`${r.reply.replace(/\[user\]/g, message.author)}`);
		} else {
			if (!message.author.bot) {
				message.channel.send(`${r.reply.replace(/\[user\]/g, message.author)}`);
            };
		}
	}
});

client.on('ready',async () => {
    console.clear();
    console.log('Ready!');
    client.guilds.forEach(g => {
        if (!g.me.hasPermission("MANAGE_GUILD")) return;
        g.fetchInvites().then(guildInvites => {
                invites[g.id] = guildInvites;
        })
    })
	client.guilds.map((g) => {
		let r = db.get(`vc-${g.id}`);
		if (!r) return;
		if (r.channelID == null || r.channelTEXT == null) return;
		let ch = g.channels.get(r.channelID);
		if (!ch) return;
		if (!g.me.hasPermission("MANAGE_CHANNELS")) return;
		ch.setName(`${r.channelTEXT}`.replace("00", `${guild.members.filter(m => m.voiceChannel).size}`))
	});

passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

var scopes = ['identify', 'guilds', 'guilds.join'];

passport.use(new Strategy({
    clientID: botconfig.clientID,
    clientSecret: botconfig.clientSecret,
    callbackURL: 'http://k-d.io/callback',
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    process.nextTick(function() {//164.132.74.224
        return done(null, profile);
    });
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('./public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    try {
        res.render('index.ejs', {
            client: client
        });
    } catch (error) {
        res.render('error.ejs');
    }
})

app.get('/auth', passport.authenticate('discord', { scope: scopes }), function (req, res) {});

app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('/dashboard') }
)

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/dashboard', checkAuth, async (req, res) => {
    //var guilds = [];
    /*const myGuildsRes = await fetch('https://discordapp.com/api/v6/users/@me/guilds', {
        method: 'GET',
        'content-Type': 'x-www-form-urlencoded',
        headers: {
            Authorization: `Bearer ${req.user.accessToken}`
        }
    })

    let myGuilds = await myGuildsRes.json();

    const botGuildsRes = await fetch('https://discordapp.com/api/v6/users/@me/guilds', {
        method: 'GET',
        'content-Type': 'x-www-form-urlencoded',
        headers: {
            Authorization: `Bot ${botconfig.token}`
        }
    })

    let botGuilds = await botGuildsRes.json();

    for(var This in myGuilds) {
        if(myGuilds[this].permissions == 2146958847) {
            let thisGuild = myGuilds[This];
            let notMatch = await botGuilds.find(guild => {
                return guild.id != thisGuild.id;
            })
            if(notMatch) thisGuild.match = false;
            let match = await botGuilds.find(guild => {
                return guild.id == thisGuild.id;
            })
            if(notMatch) thisGuild.match = true;
            guilds.push(thisGuild);
        }
    }
*/
try {
  let guilds = [];
    let userGuilds = req.user.guilds;
    let botGuilds = client.guilds;

    for(var t in userGuilds) {
        let thisGuild = userGuilds[t];
        let perms = new Discord.Permissions(thisGuild.permissions);
            if(perms.has("MANAGE_GUILD")) {
            let notMatch = await botGuilds.find(guild => {
                return guild.id != thisGuild.id;
            })
            if(notMatch) thisGuild.match = false;
            let match = await botGuilds.find(guild => {
                return guild.id == thisGuild.id;
            })
            if(match) thisGuild.match = true;
            let guild = client.guilds.get(thisGuild.id);
            thisGuild.a = nameAcronym(thisGuild.name);
            guilds.push(thisGuild);
        }
    }

    res.render('cp.ejs', {
        client: client,
        user: req.user,
        guilds: guilds
    });
} catch (error) {
    res.render('error.ejs');
}
})

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/auth");
}

/*app.get('/info', (req, res) => {
    let arr = [client.guilds.size, client.users.size, client.ping];
    res.send(arr)
})

app.get('/developers', (req, res) => {
    let mems = [];
    let devs = client.guilds.get('522904523455594496').roles.find(role => role.name.toLowerCase().includes('developers')).members.forEach(member => {
        mems.push({username: member.user.username, displayAvatarURL: member.user.displayAvatarURL});
    });
    res.send(mems);
})*/

app.get('/manage/:id', checkGuild,async (req, res) => {
    try {

        let id = req.params.id;
        let checked = check(id, req.user.id);
        if(!checked) return res.redirect('/dashboard')
        let guild = client.guilds.get(id);
        let data = {};

        let rows1 = db.get(`ar-${guild.id}`);
		if (!rows1) data['allReplys'] = []
		else data['allReplys'] = rows1;
        let rows2 = db.get(`wlc-${guild.id}`);
        if (!rows2) data["welcomeSittings"] = []
		else data["welcomeSittings"] = rows2;
        let rows3 = db.get(`vc-${guild.id}`);
        if (!rows3) data["voiceonlinesittings"] = []
		else data["voiceonlinesittings"] = rows3;
        //con.query(`select * from guilds_leveling_roles_settings where guildID="${guild.id}"`, (er4r, rows4) => {
        //  if (er4r || rows4.length == 0) data["levelingSittingsRoles"] = []; else data["levelingSittingsRoles"] = rows4;
        //con.query(`select * from guilds_leveling_settings where guildID="${guild.id}"`, (er5r, rows5) => {
        //  if (er5r || rows5.length == 0) data["levelingSittings"] = []; else data["levelingSittings"] = rows5;
        db.ensure(`pro-${guild.id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
        let rows6 = db.get(`pro-${guild.id}`);
        if (!rows6) data["protectionSittings"] = []
		else data["protectionSittings"] = rows6;
        console.log(data);
        res.render('manage.ejs', {
			client: client,
            guild: guild,
            data: data,
            user: req.user,
            logdb: logdb
        });
        // });
        // });
    } catch (error) {
        res.render('error.ejs');
    }
})

app.get('/return',async (req, res) => {
    try {
        res.redirect('/manage/'+req.query.guild_id);

    } catch (error) {
        res.render('error.ejs');
    }

})

app.get('/commands',async (req, res) => {
	res.render('commands.ejs');
	}) 

app.post('/manage/:id/saveVoiceSettings', bodyParser.json(),async (req, res) => {
    try {


        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if(checked) {
            res.status(200).send(req.query.picID);
			db.ensure(`vc-${guild.id}`, { channelID: null, channelTEXT: null });
			let d = db.get(`vc-${id}`);
            db.set(`vc-${id}`, { channelTEXT: req.query.channelTEXT, channelID: req.query.picID });
          
        } else {
            res.status(404);
        }
    } catch (error) {
        res.render('error.ejs');
    }
})

app.post('/manage/:id/showAllReplys', bodyParser.json(),async (req, res) => {
    try {


        let id = req.param.id;
        let checked = check(id, req.user.id);
        if(checked) {
            res.status(200).send();
        } else {
            res.status(404);
        }
    } catch (error) {
        res.render('error.ejs');
    }
})

app.post('/manage/:id/addReply', bodyParser.json(),async (req, res) => {
    try {


        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if(checked) {
            res.status(200).send(req.query);
            // con.query(`	INSERT INTO replys_system (guildID,msg, reply, botsabel) VALUES ("${guild.id}","${req.query.msg}", "${req.query.reply}", "${req.query.botsabel}");`);
			db.ensure(`ar-${guild.id}`, []);
			db.push(`ar-${guild.id}` ({ msg: req.query.msg, reply: req.query.reply, botsabel: req.query.botsabel }));
		} else {
            res.status(404);
        }
    } catch (error) {
        res.render('error.ejs');
    }
})

app.post('/manage/:id/editReply', bodyParser.json(),async (req, res) => {
    try {


        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if(checked) {
            res.status(200).send(req.query);
			let ars = db.get(`ar-${id}`);
			db.set(`ar-${id}`, []);
			await ars.map((r) => {
				if (r.msg == req.query.msg) {
					db.push(`ar-${id}`, { msg: req.query.msg, reply: req.query.reply, botsabel: req.query.botsabel });
				} else {
					db.push(`ar-${id}`, r);
				}
			});
        } else {
            res.status(404);
        }
    } catch (error) {
        res.render('error.ejs');
    }
})

app.post('/manage/:id/delReply', bodyParser.json(),async (req, res) => {
    try {


        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if(checked) {
            res.status(200).send(req.query);
            let ars = db.get(`ar-${id}`);
			db.set(`ar-${id}`, []);
			await ars.filter(s => s.msg != req.query.msg).map((r) => {
				db.push(`ar-${id}`, r);
			});
        } else {
            res.status(404);
        }
    } catch (error) {
        res.render('error.ejs');
    }
})

app.post('/manage/:id/delAllReply', bodyParser.json(),async (req, res) => {
    try {

        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if(checked) {
            res.status(200).send(req.query);
            db.set(`ar-${guild.id}`, []);
        } else {
            res.status(404);
        }
    } catch (error) {
        res.render('error.ejs');
    }

})

app.post('/manage/:id/savewelcomesittings', bodyParser.json(),async (req, res) => {
    try {
        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if (!checked) return res.status(404);
        res.status(200).send(req.query);
		let d = db.get(`wlc-${id}`);
        db.set(`wlc-${id}`, { welcomeEnabel: req.query.welcomeEnabel, roomID:req.query.selectTextroom, welcomeMsg: req.query.welcomeMSG, withEmbed: req.query.withEmbebd, roleID: req.query.roleID });
        // con.query(`update welcome_system set welcomeEnabel='${req.query.welcomeEnabel}', roomID='${req.query.selectTextroom}', welcomeMsg='${req.query.welcomeMSG}', withEmbed='${req.query.withEmbed}', roleID='${req.query.roleID}' where guildID='${guild.id}';`);
    } catch (error) {
        res.render('error.ejs');
    }
});

app.post('/manage/:id/saveprotectionchanges', bodyParser.json(),async (req, res) => {
    try {
        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if (!checked) return res.status(404);
        res.status(200).send(req.query);
        console.log(req.query);
        db.ensure(`pro-${id}`, { isEnabled: 'false', banLimit: 0, chaDelLimit: 0, roleDelLimit: 0, kickLimits: 0, roleCrLimits: 0, coolTime: 1 });
      let d = db.get(`pro-${id}`);
            db.set(`pro-${id}`, { isEnabled: req.query.protectionEnabel, banLimit:req.query.banL, chaDelLimit: req.query.channelsdeleteL, roleDelLimit: req.query.roledeleteL, kickLimits: req.query.kickL, roleCrLimits: req.query.rolecreateL, coolTime: req.query.Ltime });
    } catch (error) {
        res.render('error.ejs');
    }
});

app.post('/manage/:id/savelogs', bodyParser.json(),async (req, res) => {
    try {
        let id = req.params.id;
        let guild = client.guilds.get(`${id}`);
        let member = guild.members.get(req.user.id);
        let checked = check(guild.id, member.id);
        if (!checked) return res.status(404);
        res.status(200).send(req.query);
        console.log(req.query);
        logdb.set(guild.id, req.query.st, "status")
        logdb.set(guild.id, req.query.ch, "ch")
    } catch (error) {
        res.render('error.ejs');
    }
});

app.get('*',async (req, res) =>{
    res.render('error.ejs');
})

function nameAcronym(nam) {
    return nam.replace(/\w+/g, name => name[0]).replace(/\s/g, '');
}

function checkGuild(req, res, next) {
    if(client.guilds.get(req.params.id)) return next();
    else if(!req.isAuthenticated()) return res.redirect('/auth');
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=553212598368337921&guild_id=${req.path.split('/')[2]}&permissions=8&redirect_uri=https%3A%2F%2Fs-bot.ml%2Fcallback&scope=bot`)
}
//
function check(id, user) {
    return client.guilds.get(id).members.find("id", user).hasPermission("MANAGE_GUILD");
}

server.listen(80);
console.log("http://164.132.74.224");
});
