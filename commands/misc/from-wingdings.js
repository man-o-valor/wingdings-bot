const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require("discord.js");
const { wingdingsDict, wingdingsDictEmojis } = require("../../dicts.js");

function buildReverseMap(dict) {
  const rev = {};
  for (const [k, v] of Object.entries(dict)) rev[v] = k;
  return rev;
}

function translateFromWingdings(text, dict) {
  if (!text) return "";
  const rev = buildReverseMap(dict);
  const symbols = Object.keys(rev).sort((a, b) => b.length - a.length);
  let i = 0;
  let out = "";
  while (i < text.length) {
    let matched = false;
    for (const sym of symbols) {
      if (text.startsWith(sym, i)) {
        out += rev[sym];
        i += sym.length;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1;
  }
  return out;
}

const failmsg = "That message isn't in Wingdings!";

module.exports = {
  data: new ContextMenuCommandBuilder().setName("Translate Wingdings").setType(ApplicationCommandType.Message),
  integration_types: [0, 1, 2],
  contexts: [0, 1, 2],
  async execute(interaction) {
    const msg = interaction.targetMessage?.content ?? "";
    const tryEmoji = translateFromWingdings(msg, wingdingsDictEmojis || {});
    const tryNormal = translateFromWingdings(msg, wingdingsDict || {});
    const translated =
      tryEmoji && /[A-Z]/i.test(tryEmoji) ? tryEmoji : tryNormal && /[A-Z]/i.test(tryNormal) ? tryNormal : "";

    await interaction.reply({ content: translated || failmsg, flags: MessageFlags.Ephemeral });
  }
};
