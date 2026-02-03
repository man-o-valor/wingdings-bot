const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require("discord.js");
const { wingdingsDict, wingdingsDictEmojis } = require("../../dicts.js");

function buildReverseMap(dict) {
  const rev = {};
  for (const [k, v] of Object.entries(dict)) rev[v] = k;
  return rev;
}

function buildNormalizedReverseMap(dict) {
  const rev = {};
  for (const [k, v] of Object.entries(dict)) {
    let normalizedKey = normalizeCustomEmoji(v);
    normalizedKey = normalizedKey.replace(/<:([a-zA-Z0-9_]+)>/g, (match, name) => {
      return `<:${normalizeEmojiName(name)}>`;
    });
    rev[normalizedKey] = k;
  }
  return rev;
}

function translateFromWingdings(text, dict, useNormalizedMap = false) {
  if (!text) return "";
  const rev = useNormalizedMap ? buildNormalizedReverseMap(dict) : buildReverseMap(dict);
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
    if (!matched) {
      out += text[i];
      i += 1;
    }
  }
  return out;
}

function countMatchingChars(text, dict, useNormalizedMap = false) {
  if (!text) return 0;
  const rev = useNormalizedMap ? buildNormalizedReverseMap(dict) : buildReverseMap(dict);
  const symbols = Object.keys(rev).sort((a, b) => b.length - a.length);
  let i = 0;
  let count = 0;
  while (i < text.length) {
    let matched = false;
    for (const sym of symbols) {
      if (text.startsWith(sym, i)) {
        count += sym.length;
        i += sym.length;
        matched = true;
        break;
      }
    }
    if (!matched) i += 1;
  }
  return count;
}

function normalizeCustomEmoji(text) {
  return text.replace(/<:([a-zA-Z0-9_]+):\d+>/g, (match, name) => {
    return `<:${name}>`;
  });
}

function normalizeEmojiName(name) {
  return name.replace(/_/g, "");
}

const failmsg = "That message isn't in Wingdings!";

module.exports = {
  data: new ContextMenuCommandBuilder().setName("Translate Wingdings").setType(ApplicationCommandType.Message),
  integration_types: [0, 1, 2],
  contexts: [0, 1, 2],
  async execute(interaction) {
    let msg = interaction.targetMessage?.content ?? "";
    msg = msg.replace(/\u200b/g, "");

    if (!msg) {
      await interaction.reply({ content: failmsg, flags: MessageFlags.Ephemeral });
      return;
    }

    let normalizedMsg = normalizeCustomEmoji(msg);
    normalizedMsg = normalizedMsg.replace(/<:([a-zA-Z0-9_]+)>/g, (match, name) => {
      return `<:${normalizeEmojiName(name)}>`;
    });

    const emojiCount = countMatchingChars(normalizedMsg, wingdingsDictEmojis || {}, true);
    const normalCount = countMatchingChars(msg, wingdingsDict || {});

    const dictToUse = emojiCount >= normalCount ? wingdingsDictEmojis : wingdingsDict;
    const msgToTranslate = dictToUse === wingdingsDictEmojis ? normalizedMsg : msg;
    const useNormalized = dictToUse === wingdingsDictEmojis;
    const translated = translateFromWingdings(msgToTranslate, dictToUse, useNormalized);

    await interaction.reply({ content: translated, flags: MessageFlags.Ephemeral });
  }
};
