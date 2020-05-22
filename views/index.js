// Start.

const { Client, RichEmbed, Collection } = require("discord.js");
const client = new Client();
const bot = new Client();
const hero = new Client();
const fetch = require('node-fetch');
const Enmap = require("enmap")
const fs = require("fs")
const moment = require("moment")
const chalk = require('chalk');
const request = require('request');
const pretty = require('pretty-ms')
const Color = require('color')
const ms = require('ms')
const totime = require('to-time');


let botconfig = require("./jsonfiles/botconfig.json")
let prefix = botconfig.prefix
client.login(botconfig.token).catch(console.error);

	client.on('ready', () => {
    console.log(`${client.user.tag} is ready! - prefix: ${prefix}`)
		client.user.setActivity(`SBot.`, {
			type: "PLAYING"
    })
    })

    const DBL = require("dblapi.js");
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MzIxMjU5ODM2ODMzNzkyMSIsImJvdCI6dHJ1ZSwiaWF0IjoxNTYwNDU4NzU3fQ.3cskgOlYBNqJ8HUrgoxusswCnEyENPbUWIdYuRin0vw');

// Optional events
dbl.on('posted', () => {
  console.log('Server count posted!');
})

dbl.on('error', e => {
 console.log(`Oops! ${e}`);
})





const warndb = new Enmap({name : "sbotwarns"})

client.on("message", message => {
  if(message.content.startsWith(prefix + "warn")) { 
      if(message.content.startsWith(prefix + "warnings")) return;
    if(!message.member.hasPermission(8)) return;
    var args = message.content.split(" ").slice(2).join(" ");
    var men = message.mentions.members.first();
    var guild = message.guild;
    if(!men) return message.channel.send("** $warn [@member] [reason]**")
    if(men.id == message.author.id) return message.channel.send("**You can\'t warn yourself!'**")
    if(message.guild.ownerID != message.author.id && message.member.highestRole.position <= men.highestRole.position) return message.channel.send(`You can\'t warn **${men.user.tag}**.`);
    if(men.hasPermission(8)) return message.channel.send(`You can\'t warn **${men.user.tag}**.`);
    if(!args) return message.channel.send("**No reason :/**")
    warndb.ensure(`${guild.id}-${men.id}`, [])
    warndb.push(`${guild.id}-${men.id}`, args)
    message.channel.send(`Successfully warned **${men.user.tag}**.`)
    men.send(`**You\'ve been warned in ${message.guild.name} \nReason : \`${args}\`**`)
  }
  else
    if(message.content.startsWith(prefix + "removewarn")) {
    if(!message.member.hasPermission(8)) return;
    var args = message.content.split(" ").slice(2).join(" ");
    var men = message.mentions.members.first();
    var guild = message.guild;
    if(!men) return message.channel.send("**$removewarn [@member] [warn id]**")
    if(!args) return message.channel.send("**No Warn ID :/**")
    if(isNaN(args)) return message.channel.send("**Warn ID should be a number :/**")
          warndb.ensure(`${guild.id}-${men.id}`, [])

    let num = 1;
      warndb.get(`${guild.id}-${men.id}`).forEach(mm => {
     let nnumm =  num++
     if(nnumm == parseInt(args)) { warndb.remove(`${guild.id}-${men.id}`, mm) }
    })
      message.channel.send("**Done, Successfully removed this warn!**")
    }
  else
    if(message.content.startsWith(prefix + "clearwarnings")) {
    if(!message.member.hasPermission(8)) return;
    var men = message.mentions.members.first();
    var guild = message.guild;
    if(!men) return message.channel.send("** $clearwarnings [@member]**")
    if(warndb.get(`${guild.id}-${men.id}`) === undefined || warndb.get(`${guild.id}-${men.id}`).length == 0) return message.channel.send("This member has no warnings!")
    warndb.set(`${guild.id}-${men.id}`, [])
      message.channel.send("**Done , Successfully cleared the warnings.**")
    }
}); 
client.on("message", message => {
  if(message.content.startsWith(prefix + "warnings")) {
    if(!message.member.hasPermission(8)) return;
    var men = message.mentions.members.first();
    var guild = message.guild;
    if(!men) return message.channel.send("** $warnings [@member]**");
        warndb.ensure(`${guild.id}-${men.id}`, [])
    
    let embed = new RichEmbed()
    .setTitle(`${men.user.tag}\'s warnings.`)
    .setThumbnail("https://corporate.foreca.com/en/uploads/images/Weather%20data%20add-ons/Warnings-red-code.png")
    .setFooter(client.user.username, client.user.avatarURL)
    .setTimestamp();
    if(warndb.get(`${guild.id}-${men.id}`) === undefined || warndb.get(`${guild.id}-${men.id}`).length == 0) {embed.setDescription("No warnings for this member \:)")}
          let num = 1;
    warndb.get(`${guild.id}-${men.id}`).forEach(mm => {
     let nnumm =  num++
      embed.addField(`❯ Warning ${nnumm}` , `→ \`\`\`${mm}\`\`\``)
    })
    message.channel.send({embed : embed})
  }
})
  
  const db = new Enmap({ name: 'sssbbbooottt' });

  client.guilds.map(guild => {
  client.on("ready", () => {
  setInterval(() => {
                  db.get(`mutes-${guild.id}`).map(mute => {
                      if (!guild.me.hasPermission('MANAGE_ROLES')) return;
                      if (!guild.members.get(mute.user)) return;
                      let muterole = guild.roles.find(r => r.name == 'Muted');
                      if (!muterole) return;
                      if (moment().isAfter(mute.time)) {
                          guild.members.get(mute.user).removeRole(muterole, 'Mute Time Ended');
                          db.remove(`mutes-${guild.id}`, mute);
                      }
                  });
                });
  }, 5000);
  });
  
  client.on('message', async (message) => {
          let args = message.content.split(' ');
  if (args[0] == `${prefix}mute`) {
              if (!message.member.hasPermission('MUTE_MEMBERS') || !message.guild.me.hasPermission('MANAGE_ROLES')) return;
              let mem = message.mentions.members.first() || message.guild.members.get(args[1]);
              if (!args[1]) return message.channel.send(`**Usage:** ${prefix}mute [@member/id] [time] [reason]`);
              if (!mem) return message.channel.send(`I can't find this member!`);
              if (mem.user.id == message.author.id) return message.channel.send(`You can't mute yourself!`);
              if (mem.user.id == client.user.id) return message.channel.send(`I can't mute myself :rolling_eyes:.`);
              if (message.guild.ownerID != message.author.id && message.member.highestRole.position <= mem.highestRole.position) return message.channel.send(`You can't mute **${mem.user.tag}**.`);
              if (!mem.manageable) return message.channel.send(`I can't mute **${mem.user.tag}**.`);
              if(mem.hasPermission(8)) return message.channel.send(`You can't mute **${mem.user.tag}**.`)
              let num = args[2] ? args[2].replace(/٠/g, '0').replace(/١/g, '1').replace(/٢/g, '2').replace(/٣/g, '3').replace(/٤/g, '4').replace(/٥/g, '5').replace(/٦/g, '6').replace(/٧/g, '7').replace(/٨/g, '8').replace(/٩/g, '9') : '';
              let time = num;
              let reason = args.slice(3).join(' ');
              if (!args[2] || num == '0') time = 0
              else if (ms(num) == undefined) {
                  reason = args.slice(2).join(' ')
                  time = 0;
              }
              
              else if (ms(num) >= 1209600000 || ms(num) < 0) return message.channel.send(`The time should be less than 14 days.`);
              if (!reason) reason = 'No reason.';
              if (reason.length >= 600) return message.channel.send(`Reason too long!`);
              if (reason.length == 1) return message.channel.send(`Reason too short!`);
              try {
                  let muterole = message.guild.roles.find(r => r.name == 'Muted');
                  if (!muterole) {
                      muterole = await message.guild.createRole({
                          name: 'Muted'
                      });
                      message.guild.channels.filter(c => c.type == 'text').map((ch) => {
                          ch.overwritePermissions(muterole.id, {
                              ADD_REACTIONS: false,
                              SEND_MESSAGES: false
                          });
                      });
                  }
                  await mem.addRole(muterole);
                  await db.ensure(`mutes-${message.guild.id}`, []);
                  if (time != 0) {
                      let timere = ms(time) / 1000;
                      let time2 = Date.now() + totime.fromSeconds(timere).ms();
                      db.push(`mutes-${message.guild.id}`, { user: mem.user.id, guild: message.guild.id, time: time2 });
                  }
                  await message.channel.send(`Successfully muted **${mem.user.tag}**.`, new RichEmbed().setColor('BLUE').setFooter(mem.user.tag, mem.user.avatarURL).setDescription(reason));
              } catch (e) {
                  console.log(e);
                  await message.channel.send(`Error! ${e.message || 'Please contact the support.'}`);
                  
              }
              
          }
          else if (args[0] == `${prefix}unmute`) {
            if (!message.member.hasPermission('MUTE_MEMBERS') || !message.guild.me.hasPermission('MANAGE_ROLES')) return;
            let mnt = message.mentions.members.first() || message.guild.members.get(args[1]);
            if (!args[1]) return message.channel.send(`**Usage:** ${prefix}unmute [@member/id]`);
            if (!mnt) return message.channel.send(`I can't find this member!\n**Examples:**\n${prefix}unmute @iTzMurtaja \n${prefix}unmute 348143440405725184`);
            if (!message.guild.roles.find(r => r.name == 'Muted')) return message.channel.send(`I can't find \`Muted\` role!`);
            if (!mnt.roles.has(message.guild.roles.find(r => r.name == 'Muted').id)) return message.channel.send(`This member is not muted!`);
            try {
                await mnt.removeRole(message.guild.roles.find(r => r.name == 'Muted'));
                await message.channel.send(`Succesfully unmuted **${mnt.user.tag}**!`);
            } catch (e) {
                message.channel.send(`I can't unmute **${mnt.user.tag}**, check my role position / permissions.`);
            }
          }
  });
  
  client.on("channelCreate", channel => {
  try {
   let muterole = channel.guild.roles.find(r => r.name == 'Muted');
  if(!muterole) return;
  channel.overwritePermissions(muterole.id, {
                              ADD_REACTIONS: false,
                              SEND_MESSAGES: false
  })
  }
  catch (e) {
  console.error(e)
  }
  });

  let array = []
client.on('guildMemberRemove' ,  m => {
    let muterole = m.roles.find(r => r.name == 'Muted');
if(!muterole) return;
 array.push(m.id)
});

client.on('guildMemberAdd',  m => {
if(!array.includes(m.id)) return;
if(array.includes(m.id)) try { m.addRole(m.guild.roles.find(r => r.name == "Muted").id) } catch(e) { console.error(e)}
function arrayRemove(arr, value) {

   return arr.filter(function(ele){
       return ele != value;
   });

}

var result = arrayRemove(array, m.id);
 array = result;
});

    client.on('guildCreate', guild => {
          guild.owner.send(`
          **شكرا لك لإضافة البوت لسيرفرك ، **

          لمعرفة أوامر / موقع البوت .. ولحل الاخطاء يجب عليك دخول سيرفر الدعم الفني : https://discord.gg/eUAWK8p
          
          
          `)
    });



    client.on("message", message => {
      var gs = require('github-scraper');
       let args = message.content.split(" ").slice(1).join(" ")
              if(message.content.startsWith(prefix + "github")) {
          if(!args) return message.channel.send("**Type username.**")
    gs(args, function(err, data) {
      let embed = new RichEmbed()
          .setTitle(`${args}\'s info.`)
          .setURL(`https://github.com/${args}`)
          .setThumbnail(data.avatar)
          .addField("Username", `\`${data.name || `None`}\``)
          .addField("Projects", `\`${data.projects || `None`}\``)
          .addField("Followers", `\`${data.followers || `None`}\``)
          .addField(`Bio`,`\`${data.bio || `None`}\``)
          .setColor("GRAY")
          .setFooter(message.author.tag, message.author.avatarURL)
          message.channel.sendEmbed(embed)
          if(err) return console.log(err)        
  
          })
      }
  });

    client.on('message' , message => {
      if(message.author.bot) return;
      if(message.content.startsWith(prefix + "help")) {
        message.react(`✅`)
      message.author.send(`**Welcome \`To\` SBot Help Menu**.
      SBot's Website - الموقع الخاص بـ اس بوت : http://s-bot.ml/
      SBot's Dashboard - لوحة التحكم الخاصة بـ اس بوت : http://s-bot.ml/dashboard
      SBot's Commands - الأوامر الخاصة بـ اس بوت : http://s-bot.ml/commands
      
      > Bot prefix : **$**

      `)
      }
    });  

client.on('message', message =>{
  let command = message.content.split(" ")[0];
  if (command == prefix + "unban") {
  if(!message.member.hasPermission('BAN_MEMBERS')) return;
  let args = message.content.split(" ").slice(1).join(" ");
  if(args == 'all') {message.guild.fetchBans().then(edit => {
    edit.forEach(gamdnek => {message.guild.unban(gamdnek);})});
  return message.channel.send('Unbanned all members.')}
  if(!args) return message.channel.send('Please type user ID | `$unban all` to unban all.');
  message.guild.unban(args).then(m =>{message.channel.send(`**Unbanned ${m.username}.**`);
  }).catch(stry =>{message.channel.send(`**${args} Not banned.**`)});
  }});

  client.on('message',message =>{
    if(message.content.startsWith(prefix + 'setcolor')) {
      if(message.author.bot || message.author.mys) return;
      if(!message.member.hasPermission('MANAGE_ROLES')) return;
      let color = message.content.split(" ").slice(2).join(" ");
      if(!color) return message.channel.send(`**Mention role.**`);
      let role = message.mentions.roles.first();
      if(!role) return message.channel.send(`**Mention incorrect role.**`);
      role.setColor(color).catch(mys =>{message.channel.send(`**You have some problems.**`)
      
      message.channel.send(`${role} color **changed** to: \`${color}\``)
    })
    }
  });


    client.on("message", async message => {
      if(message.author.bot) return;
      if(message.channel.type === "dm") return;
      let messageArray = message.content.split (" ");
      let args = messageArray.slice(1);
      
      if (message.content.startsWith(prefix + "8ball")) {
      
      
      if(!args[1]) return message.reply("?");
      let replies = ["Yup.", "No.", "Idk, Maybe.", "Why?"];
      
      let result = Math.floor((Math.random() * replies.length));
      let question = args.slice(1).join(" ");
      
      message.channel.sendMessage(`${replies[Math.floor(Math.random() * replies.length)]}`);
                  if (!args[0]) {
             message.edit('1')
             return;
           }
       }
      });

      const ytScraper = require("yt-scraper");
client.on('message', message => {
    if (message.content.startsWith(prefix + 'youtube')) {
      let args = message.content.split(" ").slice(1).join(" ");
      if(!args) return message.channel.send(`**Type channel link.**`)
      if(!args.includes("https://www.youtube.com/channel/")) return message.channel.send('**I Can\'t find This Channel.**')
    ytScraper.channelInfo(`${args}`).then(yt => {
        const embed = new RichEmbed()
        .setColor("#ff0000")
        .setTitle(`**${yt.name}**'s channel Info.`)
        .setThumbnail(`https://cdn.discordapp.com/attachments/584630360017469461/595057510436831252/youtube.png`)
        .addField(`Subscribers`, `\`${yt.subscribers}\``,true)
        .addField(`Views`, `\`${yt.views}\``,true)
        .addField(`About`, `\`\`\`${yt.description}\`\`\``,true)
  message.channel.send({embed});
 
    })
}
});

client.on('message', message => {
  if(message.content.startsWith(prefix + 'insta')) {
    let args = message.content.split(" ").slice(1).join(" ");
    if(!args) return message.channel.send(`** Type the username.**`)
    const ins = require('basic-instagram-user-details');
    ins(args, 'followers').then(x => { const v = x.data;
      if(v == 'Response code 404 (Not Found)') return message.channel.send(`**I can't find this username.**`)
      ins(args, 'posts').then(f => { const o = f.data;
        ins(args, 'following').then(r => { const g = r.data;
          ins(args, 'bio').then(bb => { const XX = bb.data;
            ins(args, 'private').then(fff => { const private = fff.data;
              ins(args, 'verified').then(mm => { const verified = mm.data;
    let instagram = new RichEmbed()
    .setColor('#8c0297')
    .setThumbnail('https://cdn.discordapp.com/attachments/584630360017469461/597717696901283841/instagram_PNG9.png')
    .setTitle(`**${args}**'s Info.`)
    .setURL(`https://www.instagram.com/${args}`)
    .addField(`Followers`,`\`${v}\``,true)
    .addField(`Following`,`\`${g}\``,true)
    .addField(`Posts`,`\`${o}\``,true)
    .addField(`Private`,`\`${private}\``,true)
    .addField(`Verified`,`\`${verified}\``,true)
    .addField(`Bio`,`\`${XX}\``)
message.channel.send(instagram)
}).catch(mystery => {
  message.channel.send(`**I can't find this username.**`)
})})})})})})}});


      
      
      client.on('message', message => {
      if(message.content.startsWith("$slots")) {
      let slot1 = ['🍏', '🍇', '🍒', '🍍', '🍅', '🍆', '🍑', '🍓'];
      let slot2 = ['🍏', '🍇', '🍒', '🍍', '🍅', '🍆', '🍑', '🍓'];
      let slot3 = ['🍏', '🍇', '🍒', '🍍', '🍅', '🍆', '🍑', '🍓'];
      let slots1 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
      let slots2 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
      let slots3 = `${slot1[Math.floor(Math.random() * slot1.length)]}`;
      let we;
      if(slots1 === slots2 && slots2 === slots3) {
      we = "You won! :tada:"
      } else {
      we = "You lost! :sob:"
      }
      message.channel.send(`${slots1} | ${slots2} | ${slots3} - \n${we}`)
      }
      });


        client.on('message' , message => {
            if(message.author.bot) return;
            if(message.content.startsWith(prefix + "xo")) {
            let array_of_mentions = message.mentions.users.array();
            let symbols = [':o:', ':heavy_multiplication_x:']
            var grid_message;

            if (array_of_mentions.length == 1 || array_of_mentions.length == 2) {
            let random1 = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
            let random2 = Math.abs(random1 - 1);
            if (array_of_mentions.length == 1) {
            random1 = 0;
            random2 = 0;
            }
            let player1_id = array_of_mentions[random1].id;
            let player2_id = array_of_mentions[random2].id;
            var turn_id = player1_id;
            var symbol = symbols[0];
            let initial_message = `xo **starting**: <@${player1_id}> , <@${player2_id}>.`;
            if (player1_id == player2_id) {
            initial_message += '\nWarn: **you are play with yourself**.'
            }
            message.channel.send(`${initial_message}`)
            .then(console.log("Successful tictactoe introduction"))
            .catch(console.error);
        message.channel.send(':one::two::three:' + '\n' +
                            ':four::five::six:' + '\n' +
                            ':seven::eight::nine:')
            .then((new_message) => {
            grid_message = new_message;
            })
            .then(console.log("Successful xo game initialization"))
            .catch(console.error);
            message.channel.send('**Loading**...')
            .then(async (new_message) => {
            await new_message.react('1⃣');
            await new_message.react('2⃣');
            await new_message.react('3⃣');
            await new_message.react('4⃣');
            await new_message.react('5⃣');
            await new_message.react('6⃣');
            await new_message.react('7⃣');
            await new_message.react('8⃣');
            await new_message.react('9⃣');
            await new_message.react('🆗');
            await new_message.edit(`**Your turn <@${turn_id}>** | Your tag is**${symbol}**.`)
            .then((new_new_message) => {
            require('./edited.js')(client, message, new_new_message, player1_id, player2_id, turn_id, symbol, symbols, grid_message);
            })
            .then(console.log("Successful xo listener initialization"))
            .catch(console.error);
            })
            .then(console.log("Successful xo react initialization"))
            .catch(console.error);
            }
            else {
            message.reply(`Type: **$xo @user @user**.`)
            .then(console.log("Successful error reply"))
            .catch(console.error);
            }
            }
            });



const qs = require('querystring');

client.on('message', async message => {
  if (message.author.bot || message.channel.type === 'dm') return;
  if (message.content.startsWith(prefix + "steam")) {
      let args = message.content.split(" ");
      if (!args[1]) return;
      let i = new RichEmbed();
      i.setColor("#36393e");
      let o = await message.channel.send(`**Collecting data.. please wait**.`);
      require("steam-search").getFirstGameInfo(args.slice(1).join(" "), async function (data, err) {
          if (data !== "no") {
              i.setThumbnail(data.image);
              i.addField('• General', `→ Name: \`${data.title}\`\n→ Price: \`${data.price.includes("$") ? "$" + data.price.split("$")[1] : data.price}\`\n→ Release \`${pretty(Date.now() - new Date(data.release).getTime())}\``);
              i.setFooter("Steam | SBot.", "https://cdn.freebiesupply.com/images/large/2x/steam-logo-transparent.png");

              await o.delete().catch(e => {});
              await message.channel.send(i);
          } else {
              await o.delete().catch(e => {});
              return message.channel.send(`**Can\'t found any game with name : \`${args.slice(1).join(" ")}\`.**`);
          }
      })
  }
});

const util = require('util')
const writeFile = util.promisify(fs.writeFile)

client.on("message", (message) => {
	if (!message.guild || message.author.bot) return;
  if (message.author.bot) return;
  if (message.content.indexOf(prefix) != 0) return;
  const [commandName, ...args] = message.content.slice(prefix.length).split(/ +/g);
  if (commandName === "file") {
    var text = args.join(" ");
    writeFile("./SBotFile.txt", text)
      .then(() => {
       let embed = new RichEmbed()
       .addField(`• General`,`→ Args: ${args}\n File under this embed.`)
         message.channel.send({ files: ["./SBotFile.txt"] })
         message.channel.send(embed)
      })
  }
});


client.on('message', hi => {
  if (hi.content.startsWith(prefix +'vban')) {
if (!hi.member.hasPermission("MOVE_MEMBERS")) return;
let men = hi.mentions.users.first()
let mas = hi.author
 if(!men) return hi.channel.send(`**Mention member**.`);
 hi.guild.channels.forEach(c => {
c.overwritePermissions(men.id, {
          CONNECT: false
})
    })
client.users.get(men.id).send(`**Voice banned**.`)
hi.channel.send(`**Voice banned**.`).then(hi => {hi.delete(10000)});;
    }
})

client.on('message', past => {
  if (past.content.startsWith(prefix + 'uvban')) {
if (!past.member.hasPermission("MOVE_MEMBERS")) return;
 let men = past.mentions.users.first()
 let mas = past.author
 if(!men) return past.channel.send(`**Mention member**.`);
 past.guild.channels.forEach(c => {
 c.overwritePermissions(men.id, {
         CONNECT: true
 })
    })

client.users.get(men.id).send(`**Voice unbanned**.`)
past.channel.send(`**Voice unbanned.**`).then(past => {past.delete(15000)});;
    }
})

client.on('message', message => {
  let args = message.content.split(' ').slice(1);
  if(message.content.split(' ')[0] == `${prefix}color`){
    if    (!(message.guild.roles.find("name",`${args}`))) return message.channel.send(`I can\'t **find this color**.`);
  if(!isNaN(args) && args.length > 0)
  message.channel.send(`Changed your color to **Color: ${args}**.`);
  var a = message.guild.roles.find("name",`${args}`)
   if(!a)return;
  if (!args)return;
  setInterval(function(){})
     let count = 0;
     let ecount = 0;
  for(let x = 1; x < 201; x++){
  message.member.removeRole(message.guild.roles.find("name",`${x}`))
  }
   message.member.addRole(message.guild.roles.find("name",`${args}`));
  }
  });

    var Canvas = require('canvas');
Canvas.registerFont('fonts/jooza.ttf', {family: 'Joza'})
client.on("message", message => {
  if (message.content == "$colors") {

        var fsn = require('fs-nextra');
        fs.readdir('./colors', async (err, files) => {
            var f = files[Math.floor(Math.random()*files.length)];
            var { Canvas } = require('canvas-constructor');
            var x =0;
            var y = 0;
            if (message.guild.roles.filter(role => !isNaN(role.name)).size <= 0) return message.channel.send(`I can\'t find anycolor in **your server**.`)
            message.guild.roles.filter(role => !isNaN(role.name)).sort((b1,b2) => b1.name - b2.name).forEach(() => {
                x+=100;
                if (x > 100*12) {
                    x=100;
                    y+=80;
                }
            });
            var image = await fsn.readFile(`./colors/${f}`);
            var xd = new Canvas(100*11, y+250)
            .addBeveledImage(image, 0, 0, 100*11, y+250, 50)
            .setTextBaseline('middle')
            .setTextFont('30px Joza')
		    .setColor('black')
            .setTextSize(60)
                .addText(`Color box:`, 350, 46)
				.setTextBaseline('middle')
				.setColor('white')
				.addText(`Color box:`, 350, 44);

            x = 0;
            y = 150;
            message.guild.roles.filter(role => !isNaN(role.name)).sort((b1,b2) => b1.name - b2.name).forEach(role => {
                x+=75;
                if (x > 100*10) {
                    x=75;
                    y+=80;
                }
                xd
                .setTextBaseline('middle')
				.setTextFont('Joza')
                .setTextAlign('center')
                .setColor(role.hexColor)
                .addBeveledRect(x, y, 60, 60, 15)
                .setColor('white');
                if (`${role.name}`.length > 2) {
					xd.setTextFont('Joza')
                    xd.setTextSize(30);
                } else if (`${role.name}`.length > 1) {
					xd.setTextFont('Joza')
                    xd.setTextSize(40);
                } else {
					xd.setTextFont('Joza')
                    xd.setTextSize(50);
                }
                xd.addText(role.name, x+30, y+30);
            });
            message.channel.sendFile(xd.toBuffer());
        });
  }
})

const shorten = require('isgd');
client.on('message', message => {
    if (message.content.startsWith(prefix + 'short')) {
        let args = message.content.split(" ").slice(1);
        if (!args[0]) return message.channel.send(`**Please type link.**`)
        if (!args[1]) {
            shorten.shorten(args[0], function (res) {
                if (res.startsWith('Error:')) return message.channel.send(`**Please type link.**`);
                message.channel.send(`**Shorted link:** ${res}.`);
            })
        } else {
            shorten.custom(args[0], args[1], function (res) {
                if (res.startsWith('Error:')) return message.channel.send(`**Shorted link:** ${res}.`);
                message.channel.send(`**Shorted link:** ${res}.`);
            })
        }
    }
});


client.on('message',async message => {
  var command = message.content.toLowerCase().split(" ")[0];
   var args = message.content.toLowerCase().split(" ");
   var user = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.id === args[1]));

   if(message.content === prefix + 'top inv') {
   if(message.channel.type !== "text") return;
message.guild.fetchInvites().then(res => {
       let invs = new Collection();
       res.forEach(i => {
           if(!message.guild.member(i.inviter.id)) return;
           if(!invs.has(i.inviter.id)) invs.set(i.inviter.id, i.uses);
           else invs.set(i.inviter.id, invs.get(i.inviter.id)+i.uses);
       })
       let desc = "";


       console.log(invs.sort((a, b) => b - a))
       desc += invs.sort((a, b) => b - a).firstKey(10).map((id, index) => "#" + (index+1) + " | " + (message.guild.member(id) ? message.guild.member(id) : "``Unknown``") + " INV: `" + invs.sort((a, b) => b - a).array()[index] + "`").join("\n");
       let embed = new RichEmbed()
       .setTitle(":information_source: INVITERS SCORE")
       .setTimestamp()
   .setColor('#36393F')
       .setFooter(message.author.username, message.author.avatarURL)
       .setDescription(desc);
       message.channel.send(embed);
})
 }
   });

client.on("message", message => {
	if(message.content.startsWith(prefix + "nick")){
	if(message.author.bot || message.channel.type == "dm" || !message.member.hasPermission("MANAGE_NICKNAMES") || !message.guild.member(client.user).hasPermission("MANAGE_NICKNAMES")) return;
	var user = message.mentions.members.first();
	var args = message.content.split(" ").slice(2);
	var nick = args.join(" ");
	if(!user || !args) return message.channel.send(`Mention **member**.`);
	if(message.guild.member(user.user).highestRole.position >= message.guild.member(client.user).highestRole.position) return;
	message.guild.member(user.user).setNickname(`${nick}`).then(() => {
	message.channel.send(`Successfully change **${user.user.username}**\'s nickname to **${nick}**.`)
	}).catch(console.error);
	}
  });

 

let points = {};


client.on('message', async message => {


	if(message.channel.type !== 'text') return;


	var command = message.content.toLowerCase().split(" ")[0];
	var args = message.content.toLowerCase().split(" ");
	var userM = message.guild.member(message.mentions.users.first() || message.guild.members.find(m => m.id == args[1]));
	  const embed  = new RichEmbed()
.setDescription(`
No points **here**.


**Commands**.
**-** ${prefix}points ${message.author} 1 **Change points for anyone**.
**-** ${prefix}points ${message.author} +1 **Add 1 point for user**.
**-** ${prefix}points ${message.author} -1 **Remove 1 point for user**.
**-** ${prefix}points ${message.author} 0 **Reset points for user**.
**-** ${prefix}points reset **Reset all points**.
`)
.setFooter('Requested by '+message.author.username, message.author.avatarURL)
.setColor(`GOLD`)
  const error  = new RichEmbed()
.setDescription(`
Type **correct commands**.


**Commands**.
**-** ${prefix}points ${message.author} 1 **Change points for anyone**.
**-** ${prefix}points ${message.author} +1 **Add 1 point for user**.
**-** ${prefix}points ${message.author} -1 **Remove 1 point for user**.
**-** ${prefix}points ${message.author} 0 **Reset points for user**.
**-** ${prefix}points reset **Reset all points**.`)
.setFooter('Requested by '+message.author.username, message.author.avatarURL)
.setColor(`GOLD`)
if(command == prefix + 'points') {

		if(!message.guild.member(client.user).hasPermission('EMBED_LINKS')) return;
		if(!args[1]) {
			if(!points) return message.channel.send(embed);
			var members = Object.values(points);
			var memb = members.filter(m => m.points >= 1);
			if(memb.length == 0) return message.channel.send(embed);
			var x = 1;
			let pointsTop = new RichEmbed()
			.setAuthor('Points:')
			.setColor('#FBFBFB')
			.setDescription(memb.sort((second, first) => first.points > second.points).slice(0, 10).map(m => `**-** <@${m.id}> **${m.points}**`).join('n'))
			.setFooter(`Requested by ${message.author.username}`, message.author.avatarURL);
			message.channel.send({
				embed: pointsTop
			});
		}else if(args[1] == 'reset') {
			let pointsReset = new RichEmbed()
			.setDescription('Reset **points**. :white_check_mark:')
			.setFooter('Requested by '+message.author.username, message.author.avatarURL)
			if(!message.member.hasPermission('MANAGE_GUILD')) return;
			if(!points) return message.channel.send(pointsReset);
			var members = Object.values(points);
			var memb = members.filter(m => m.points >= 1);
			if(memb.length == 0) return message.channel.send(pointsReset);
			points = {};
			message.channel.send(pointsReset);
		}else if(userM) {
			if(!message.member.hasPermission('MANAGE_GUILD')) return;
			if(!points[userM.user.id]) points[userM.user.id] = {
				points: 0,
				id: userM.user.id
			};
			if(!args[2]) {
				if(points[userM.user.id].points == 0) return message.channel.send( `**${userM.user.username}** Not have any points.`);
				var userPoints = new RichEmbed()
				.setColor('#d3c325')
				.setAuthor(`${userM.user.username} have ${points[userM.user.id].points} points.`);
				message.channel.send({
					embed: userPoints
				});
			}else if(args[2] == 'reset') {
				if(points[userM.user.id].points == 0) return message.channel.send(error);
				points[userM.user.id].points = 0;
				message.channel.send(`Successfully reset **${userM.user.username}** points.`);
			}else if(args[2].startsWith('+')) {
				args[2] = args[2].slice(1);
				args[2] = parseInt(Math.floor(args[2]));
				if(points[userM.user.id].points == 1000000) return message.channel.send(error);
				if(!args[2]) return message.channel.send(error);
				if(isNaN(args[2])) return message.channel.send(error);
				if(args[2] > 1000000) return message.channel.send(error);
				if(args[2] < 1) return message.channel.send(error);
				if((points[userM.user.id].points + args[2]) > 1000000) args[2] = 1000000 - points[userM.user.id].points;
				points[userM.user.id].points += args[2];
				let add = new RichEmbed()
				.setDescription(`**-** <@${userM.id}> **${points[userM.user.id].points}**`)
				.setAuthor('Points:')
				.setColor('#FBFBFB')
				.setFooter('Requested by' + message.author.username, message.author.avatarURL)
				message.channel.send(add);
			}else if(args[2].startsWith('-')) {
				args[2] = args[2].slice(1);
				args[2] = parseInt(Math.floor(args[2]));
				if(points[userM.user.id].points == 0) return message.channel.send(error);
				if(!args[2]) return message.channel.send(error);
				if(isNaN(args[2])) return message.channel.send(error);
				if(args[2] > 1000000) return message.channel.send(error);
				if(args[2] < 1) return message.channel.send(error);
				if((points[userM.user.id].points - args[2]) < 0) args[2] = points[userM.user.id].points;
				points[userM.user.id].points -= args[2];
					let rem = new RichEmbed()
				.setDescription(`**-** <@${userM.id}> **${points[userM.user.id].points}**`)
				.setAuthor('Points:')
				.setColor('#FBFBFB')
				.setFooter('Requested by' + message.author.username, message.author.avatarURL)
				message.channel.send(rem);
			}else if(!args[2].startsWith('+') || !args[2].startsWith('-')) {
				args[2] = parseInt(Math.floor(args[2]));
				if(isNaN(args[2])) return message.channel.send(error);
				if(args[2] > 1000000) return message.channel.send(error);
				if(args[2] < 1) return message.channel.send(error);
				if(points[userM.user.id].points == args[2]) return message.channel.send(`**${userM.user.username}** points is already ${args[2]}.`);
				points[userM.user.id].points = args[2];
					let set = new RichEmbed()
				.setDescription(`**-** <@${userM.id}> **${points[userM.user.id].points}**`)
				.setAuthor('Points:')
				.setColor('#FBFBFB')
				.setFooter('Requested by' + message.author.username, message.author.avatarURL)
				message.channel.send(set);
			}
			}
			}

});


client.on('message', message => {
  if (message.content.startsWith(prefix + `inv`,`invite`)) {
    message.react(`✅`)
      message.author.send(`:link: يمكنك دعوة البوت من خلال **الرابط**ء: **https://discordapp.com/api/oauth2/authorize?client_id=553212598368337921&permissions=8&scope=bot **`)
  }
});

// Other.



client.on('message', message => {
  if (message.content.toLowerCase().startsWith(prefix + `top-servers`)) {

      const top = client.guilds.sort((a, b) => a.memberCount - b.memberCount).array().reverse()
      message.channel.send(`**\`⊃ Top 25 Servers\`: **\n1. **${top[0].name}**: ${top[0].memberCount} \n2. **${top[1].name}**: ${top[1].memberCount}.\n3. **${top[2].name}**: ${top[2].memberCount}.\n4. **${top[3].name}**: ${top[3].memberCount}.\n5. **${top[4].name}**: ${top[4].memberCount}.\n6. **${top[5].name}**: ${top[5].memberCount}.\n7. **${top[6].name}**: ${top[6].memberCount}.\n8. **${top[7].name}**: ${top[7].memberCount}.\n9. **${top[8].name}**: ${top[8].memberCount}.\n10. **${top[9].name}**: ${top[9].memberCount} .\n11. **${top[10].name}**: ${top[10].memberCount} .\n12. **${top[11].name}**: ${top[11].memberCount} .\n13. **${top[12].name}**: ${top[12].memberCount} .\n14. **${top[13].name}**: ${top[13].memberCount} .\n15. **${top[14].name}**: ${top[14].memberCount} .\n16. **${top[15].name}**: ${top[15].memberCount} .\n17. **${top[16].name}**: ${top[16].memberCount} .\n18. **${top[17].name}**: ${top[17].memberCount} .\n19. **${top[18].name}**: ${top[18].memberCount} .\n20. **${top[19].name}**: ${top[19].memberCount} .\n21. **${top[20].name}**: ${top[20].memberCount} .\n22. **${top[21].name}**: ${top[21].memberCount} .\n23. **${top[22].name}**: ${top[22].memberCount} .\n24. **${top[23].name}**: ${top[23].memberCount} .\n25. **${top[24].name}**: ${top[24].memberCount} .`)
  }
});


// Top Code.
let spaces = "                      "
client.on("message", msg => {
    if(msg.content.startsWith(prefix + "roles")) {
        const roles = []
            msg.guild.roles.forEach(c => {
            roles.push(c.name+spaces.substring(c.name.length)+c.members.size+" members");
        });
        msg.channel.send("\`\`\`"+roles.join("\n")+"\`\`\`");
    }
})



  client.on("message", message => {
    let args = message.content.split(' ');
    if(args[0].toLowerCase() === (prefix + 'calc')){
        const math = require("mathjs");
        const ssff = message.content.split(' ').slice(1).join(' ');
        const responsee = math.eval(ssff);
        if(!ssff){
            return message.channel.send(`**Type true calculation.**`);
        }
        let embed = new RichEmbed();
        embed.setTitle(`⊃ Calculation.`);
        embed.setThumbnail(message.author.displayAvatarURL);
        embed.setTimestamp();
        embed.setFooter(message.author.tag,message.author.displayAvatarURL);
        embed.setColor(`#ffb3b3`);
        embed.addField(`⊃ Issue:`,`→ **${ssff}**.`);
        embed.addField(`⊃ Result :`,`→**${responsee}**.`);
        embed.setFooter(`warn: * = عملية الضرب I / = عملية القسمة.`)
        message.channel.send(embed);
    }
    });

    client.on('message', message => {
      var args = message.content.split(' ').slice(1);
      var argresult = args.join(' ');
           if (message.content === prefix + ("avatar")) {
               var mentionned = message.mentions.users.first();
        var edited;
          if(mentionned){
              var edited = mentionned;
          } else {
              var edited = message.author;
             
          }
          let edit = new RichEmbed()
          .setTitle('User Avatar Link')
          .setURL(message.author.avatarURL)
          .setImage(edited.avatarURL)
          .setFooter(`Requested by: ${message.author.username}`, message.author.avatarURL)
          message.channel.send(edit)
          }

    });



  client.on('message', message => {
    if(message.content === "$avatar server") {
        const embed = new RichEmbed()
        .setTitle("Server Avatar Link")
        .setURL(message.guild.iconURL)
        .setImage(message.guild.iconURL)
        .setFooter(`Requested by: ${message.author.username}`, message.author.avatarURL)
        message.channel.send(embed);
    }
});

client.on('message', function(tizi) {
  if(!tizi.channel.guild) return;
  if (tizi.author.bot) return;
  if (tizi.author.id === client.user.id) return;
  if (tizi.author.equals(client.user)) return;
  if (!tizi.content.startsWith(prefix)) return;

  var args = tizi.content.substring(prefix.length).split(' ');
  switch (args[0].toLocaleLowerCase()) {
  case "clear" :
  tizi.delete()
  if(!tizi.channel.guild) return
  if(tizi.member.hasPermissions(0x2000)){ if (!args[1]) {
    tizi.channel.fetchMessages()
  .then(messages => {
    tizi.channel.bulkDelete(messages);
  var messagesDeleted = messages.array().length;
  tizi.channel.sendMessage(`Cleared: **${messagesDeleted}**.`).then(m => m.delete(5000));
  })
  } else {
  let messagecount = parseInt(args[1]);
  tizi.channel.fetchMessages({limit: messagecount}).then(messages => tizi.channel.bulkDelete(messages));
  tizi.channel.sendMessage(`Cleared: **${args[1]}**.`).then(m => m.delete(5000));
  tizi.delete(60000);
  }
  } else {
    tizi.channel.send(`**no perms.**`)
  return;
  }
  }
  });

    client.on('message', message => {
    if (!message.content.startsWith(prefix)) return;

    let command = message.content.split(" ")[0];
    command = command.slice(prefix.length);

    let args = message.content.split(" ").slice(1);

    if (command == "ban") {
                 if(!message.channel.guild) return;

    if(!message.guild.member(message.author).hasPermission("BAN_MEMBERS")) return;
    if(!message.guild.member(client.user).hasPermission("BAN_MEMBERS")) return;
    let user = message.mentions.users.first();
    let reason = message.content.split(" ").slice(2).join(" ");
    if (message.mentions.users.size < 1) return message.channel.send(`You have **problem**.\n :link: https://i.imgur.com/TwbzS3F.png`);
    if(!reason) return message.channel.send(`You have **problem**.\n :link: https://i.imgur.com/TwbzS3F.png`);
    if (!message.guild.member(user)
    .bannable) return message.reply(`**I Can\'t ban this member.**`);

    message.guild.member(user).ban(7, user);
   //

    message.channel.send(`**banned.**`)

  }
  });
  

  client.on('message', message => {
    if (!message.content.startsWith(prefix)) return;

    let command = message.content.split(" ")[0];
    command = command.slice(prefix.length);

    let args = message.content.split(" ").slice(1);

    if (command == "kick") {
                 if(!message.channel.guild) return;

    if(!message.guild.member(message.author).hasPermission("KICK_MEMBERS")) return;
    if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")) return;
    let user = message.mentions.users.first();
    let reason = message.content.split(" ").slice(2).join(" ");
    if (message.mentions.users.size < 1) return message.channel.send(`You have **problem**.\n :link: https://i.imgur.com/RWUhjwe.png`);
    if(!reason) return message.channel.send(`You have **problem**.\n :link: https://i.imgur.com/RWUhjwe.png`);
    if (!message.guild.member(user)
    .kick) return message.reply(`**I Can\'t ban this member.**`);

    message.guild.member(user).kick(7, user);


    message.channel.send(`**kicked.**`)

  }
  });


  client.on('message' , kosmk => {
    if(kosmk.author.bot) return;
    if(kosmk.content.startsWith(prefix + "ping")) {
      kosmk.channel.send('**Pong**..').then((kos) => {
  var A7A = `${Date.now() - kos.createdTimestamp}`
  var Tezi = `${Math.round(client.ping)}`
  kos.edit(`Time taken: **${A7A}ms**.\nDiscord API: **${Tezi}ms**.`);
   })
    }
   });

// Join / Leave Code.

  client.on('guildCreate', guild => {
    guild.channels.filter(v => v.type == "text").first().createInvite({temporary: false, maxAge: 0, maxUses: 0}).then(inv => {
      const embed = new RichEmbed()
          .setAuthor(`SBot join new server.`)
          .addField(`Server name:`,`${guild.name}`)
          .addField(`Server ID:`,`${guild.id}`)
          .addField(`Server owner:`,`${guild.owner}`)
          .addField(`Member count:`,`${guild.memberCount}`)
          .addField(`Server invite:`,`https://discord.gg/${inv.code}/`)
          .addField(`Servers Counter:`,`${client.guilds.size}`)
          .setColor("#f3ae10")
      client.channels.get("572050758149603348").send({
          embed
      });
    })
    })

client.on('guildDelete', guild => {
  const embed = new RichEmbed()
      .setAuthor(`SBot leave from server.`)
      .addField(`Server name:`,`${guild.name}`)
      .addField(`Server ID:`,`${guild.id}`)
      .addField(`Server owner:`,`${guild.owner}`)
      .addField(`Member count:`,`${guild.memberCount}`)
      .addField(`Servers Counter:`,`${client.guilds.size}`)
      .setColor("#f3ae10")
  client.channels.get("572050758149603348").send({embed});
});
// Join / Leave Code.

// Tickets Code.



// Tickets Code.

// code don't touch
client.on("message", msg => {
  let devs = ["418715344614588428","516618898850709504"]
  let args = msg.content.split(" ").slice(1).join(" ");

  if(msg.content.startsWith(prefix + 'leave')){
    if (!devs.includes(msg.author.id)) return;
    msg.guild.leave()

  }
})

client.on('message', message => {
  if (!message.guild) return;
  var args = message.content.split(" ").slice(1).join(" ");
  var channel = message.content.split(" ").slice(2).join(" ");

  if (message.content.startsWith(prefix + "lionk")) {
    let devs = ["418715344614588428","516618898850709504"]
    if (!devs.includes(message.author.id)) return;
    client.channels.get(args).createInvite({
      thing: true,
      maxUses: 5,
      maxAge: 86400
  }).then(invite =>
    message.channel.send(invite.url)
  )

  }
});
// code don't touch


client.on('message', message => { 

  if(message.content.startsWith(prefix + "server")){  
  if(!message.channel.guild) return;
  const millis = new Date().getTime() - message.guild.createdAt.getTime();
  const now = new Date();
  let i = 1;
  const botssize = message.guild.members.filter(m=>m.user.bot).map(m=>`${i++} - <@${m.id}>`);
  const verificationLevels = ['None', 'Low', 'Medium', 'Insane', 'Extreme'];
  const days = millis / 1000 / 60 / 60 / 24;
  var embed  = new RichEmbed()
  .setAuthor(message.guild.name, message.guild.iconURL)
  .addField("Server ID", `\`${message.guild.id}\``,true)
  .addField("Created", `\`${message.guild.createdAt.toLocaleString()}\``,true)
  .addField("Owner",`\`${message.guild.owner.user.username}#${message.guild.owner.user.discriminator}\``)
  .addField("Members",`\`${message.guild.memberCount}\``,true)
  .addField('Channels',`\`${message.guild.channels.filter(m => m.type === 'text').size}\`` + ' Text | Voice  '+ `\`${message.guild.channels.filter(m => m.type === 'voice').size}\` `,true)
  .addField("Region" , `\`${message.guild.region}\``,true)
  .addField(`Roles **${message.guild.roles.size}**`, `More?: **${prefix}roles**`)
  .addField(`Bots **${message.guild.members.filter(m=>m.user.bot).size}**`,`${botssize.join('\n')}`,true)
  .addField(`Boosts`,`\`${message.guild.premiumSubscriptionCount}\``,true)
  .setColor("BLACK") 
  message.channel.sendEmbed(embed)
   
  }
  });

  client.on('message', message => {
    if (message.content.startsWith(prefix + "user")) {
var args = message.content.split(" ").slice(1);
let user = message.mentions.users.first();
var men = message.mentions.users.first();
 var heg;
 if(men) {
     heg = men
 } else {
     heg = message.author
 }
var mentionned = message.mentions.members.first();
  var h;
 if(mentionned) {
     h = mentionned
 } else {
     h = message.member
 }
        moment.locale('ar-TN');
var id = new RichEmbed()
.setAuthor(message.author.username, message.author.avatarURL)
.setColor("#707070")
.addField('تاريخ الدخول للديسكورد', `${moment(heg.createdTimestamp).format('YYYY/M/D HH:mm:ss')} **\n** \`${moment(heg.createdTimestamp).fromNow()}\`` ,true)
.addField('تاريخ الدخول للسيرفر :', `${moment(h.joinedAt).format('YYYY/M/D HH:mm:ss')} \n \`${moment(h.joinedAt).fromNow()}\``, true)
.addField('اللعبة الذي يلعبها :',`${message.author.presence.game === null ? "لا يلعب" : message.author.presence.game.name}`)

.setThumbnail(heg.avatarURL);
message.channel.send(id)
}       });

module.exports = {
  Client: require('./client/Client.js')
}
