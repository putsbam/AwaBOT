const Discord = require("discord.js")
var { DateTime } = require("luxon");
const ms = require("ms");
const fs = require("fs")

let modulos = require('scripts/main.js');
let removeById = modulos.removeById,
  functionInvertDateAndTranslate = modulos.invertDateAndTranslate

function makeid(length) {

  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

}

module.exports = {

  name: "remind",
  category: "misc",
  description: "...",

  run: async (client, message, args, prefix, database) => {

    // Get mentioned member (if specified) or author data

    let member = message.guild.member(message.member.id)

    var remindersArray = database.reminders

    //let userData = remindersArray.find(u => u.id == member.id)

    //if (!userData) return message.channel.send("No Results Found!")

    // -------------------------------------- remind no args

    if (!args[0]) {

      const embedNoArgs = new Discord.MessageEmbed()

        //.setColor(process.env.EMBEDCOLOR)
        .addField('options.list', '`remind` + `<list | l>`', false)
        .addField('options.info', '`remind` + `<info | i>` + `<code>`', false)
        .addField('options.delete', '`remind` + `<delete | del>` + `<code | all>`', false)

      message.reply(embedNoArgs)

    }

    // -------------------------------------- remind list

    else if (args[0].toLowerCase() == 'list' || args[0].toLowerCase() == 'l') {

      const embed = new Discord.MessageEmbed()

        .setColor(process.env.EMBEDCOLOR)
        .setFooter(`${prefix}remind + info/i + code`)

      let remindCounter = 0

      remindersArray.forEach(doc => {

        if (doc.memberID !== member.id) return

        remindCounter++

        var descTxt = doc.descriptionText

        if (!descTxt || descTxt == '') descTxt = '¯\\_(ツ)_/¯'

        embed.addField(`Code \`${doc.code}\`:`, `Desc: \`${descTxt.length > 30 ? descTxt.substring(0, 27) + '...' : descTxt}\``)

      })

      embed.setTitle(`Seus Lembretes no Servidor (${remindCounter}):`)

      message.reply(embed)

    }

    // -------------------------------------- remind info

    else if (args[0].toLowerCase() == 'info' || args[0].toLowerCase() == 'i') {

      let code = args[1]

      if (!code) return message.reply(`Especifique um código! Use \`${prefix}remind list\` para ver os seus códigos válidos.`)

      let reminderCode = remindersArray.find(r => r.code == code)

      if (!reminderCode) return message.reply(`Não consegui encontrar nenhum lembrete com esse código. Use \`${prefix}remind list\` para ver os seus códigos válidos.`)

      // ====== formating data process :p

      var remindEndTime = new Date(reminderCode.endTime)

      var endTimeISO = remindEndTime.toISOString()

      var dtEndTime = DateTime.fromISO(endTimeISO)

      let opt = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, timeZoneName: 'short', timeZone: 'America/Belem' }

      // vai sair no formato mês(0) dia(1) ano(2), pronto pra jogar na function

      let formatedEndTime = dtEndTime.toLocaleString(opt).replace(',', '').split(' ')

      let guildCheck = true

      const finalEndDate = functionInvertDateAndTranslate(guildCheck, formatedEndTime[1], formatedEndTime[0], formatedEndTime[2])

      // ==================================

      const embedRemindInfo = new Discord.MessageEmbed()

        .setColor(process.env.EMBEDCOLOR)
        .setTitle(`Info \`${reminderCode.code}\`:`)
        .addField(`End Time:`, `\`${finalEndDate} ${formatedEndTime[3]} ${formatedEndTime[4]}\``)
        .setDescription(`${reminderCode.descriptionText}`)

      message.reply(embedRemindInfo)
    }

    // -------------------------------------- remind delete

    else if (args[0].toLowerCase() == 'delete' || args[0].toLowerCase() == 'del') {

      let code = args[1]

      if (!code) return message.reply("Especifique um código!")

      if (code.toLowerCase() == 'all') {
        remindersArray.forEach(r => { removeById(remindersArray, member.id) })
          .then(() => message.reply("Todos os lembretes foram deletados!"))
      }

      let reminder = remindersArray.find(r => r.code == code)

      if (!reminder) return message.reply(`Não consegui encontrar nenhum lembrete com esse código. Use \`${prefix}remind list\` para ver os seus códigos válidos.`)

      removeById(remindersArray, code).then(() => message.reply(`Código \`${code}\` deletado com sucesso!`))

    }

    // -------------------------------------- o comando de remind de fato      

    else {

      let time = args[0];

      let text = args.slice(1).join(' ')

      if (!time) return message.reply("Especifique um tempo!")

      const timeRegExp = /^[0-9]{1,3}(\.[0-9]{1,2}?)?[smhd]{1}$/ // 1m, 10s, 10d, 10.50d

      let endTime

      if (time.match(timeRegExp)) {

        if (ms(time) == 0) return message.reply("Especifique um tempo válido!")

        endTime = Date.now() + ms(time)

      } else return message.reply("Ocorreu um erro ao fazer seu lembrete, veja se está tudo certo e tente de novo!")

      const randomString = makeid(5) // codigo reminder

      // checar se ja tem reminder no doc

      var counter = 0

      remindersArray.forEach(doc => {

        if (doc && doc.memberID == member) counter++

        // pra prevenir de aparecer o mesmo codigo em cada reminder
        if (doc && doc.code == randomString) randomString = makeid(6)

      })

      if (counter >= 5) return message.reply("Você já atingiu o limite de `lembretes` (5)!")


      //if (remindersArray.some(u => u.memberID == member.id)) {

      let json = {

        code: randomString,
        endTime: endTime,
        voiceChannelID: member.voice.channel === null ? null : member.voice.channel.id,
        channelID: message.channel.id,
        memberID: member.id,
        messageURL: message.url,
        descriptionText: text

      }

      remindersArray.push(json)

      json = JSON.stringify(database, null, 2)

      // writing database

      fs.writeFileSync('database.json', json);

      const embed = new Discord.MessageEmbed()

        .setColor(process.env.EMBEDCOLOR)
        .setTitle(`Lembrete definido para **${(time)}**!`)
        .setDescription(`${text}`)
        .setFooter(`código: ${randomString}`)

      message.reply(embed)

      // }
    }
  }
}