const Discord = require("discord.js")
const fs = require("fs")

const removeById = (arr, id) => {
  const requiredIndex = arr.findIndex(el => {
    return el.code === String(id);
  });
  if (requiredIndex === -1) {
    return false;
  };
  return !!arr.splice(requiredIndex, 1);
};

module.exports = (client) => {

  client.user.setPresence({

    status: 'online',
    activity: {
      name: `amo a robi <3 - bam`,
      type: `WATCHING`,
    }

  })

  setInterval(() => {

    let jsonInput = fs.readFileSync('database.json') // Read Database

    if (!jsonInput) return console.log("NO DATABASE FOUND")

    var db = JSON.parse(jsonInput)

    var remindersArray = db.reminders

    // reminders

    if (remindersArray.length > 0) {

      remindersArray.forEach(async r => {

        if (Date.now() > r.endTime) {

          let channel = client.channels.cache.get(r.channelID)

          const embed = new Discord.MessageEmbed()

            .setColor(process.env.EMBEDCOLOR)
            .setTitle(`Alarm Code: ${r.code}`)
            .addField("Message", `[\`឵ ឵ ឵឵ ឵ ឵💬 ឵ ឵ ឵ ឵\`](${r.messageURL})`, false)
            .setDescription(r.descriptionText || '...')

          console.log(`Reminder acabou ${r.code}`)

          removeById(remindersArray, r.code)

          var json = JSON.stringify(db, null, 2)

          // writing database

          fs.writeFileSync('database.json', json);

          // voice

          let voiceChannel = client.channels.cache.get('1088583857693012008'),
            userAsMember = voiceChannel.guild.members.cache.find(m => m.id == r.memberID)

          if (voiceChannel && userAsMember) {

            try {

              let voiceMember = await voiceChannel.members.has(userAsMember.id)

              if (voiceMember) {

                userAsMember.voice.setChannel(null)
                embed.setFooter("DISCONNECTED FROM VOICE CHANNEL")

              } else embed.setFooter("NOT CONNECTED TO VOICE CHANNEL")

            } catch (err) { console.log(err) }

          }

          if (channel) await channel.send(`<@!${r.memberID}>`, embed)

        }

      })

    } else return

  }, 20 * 1000)

  console.log(`BOT: ${client.user.tag} ONLINE!`)

} 
