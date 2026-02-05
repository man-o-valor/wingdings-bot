const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require("discord.js");
const { wingdingsDict } = require("../../dicts.js");

function buildMapFromDict(dictType) {
  if (Array.isArray(wingdingsDict)) {
    const map = {};
    for (const entry of wingdingsDict) {
      if (!entry || typeof entry.char === "undefined") continue;
      const val = entry.code ? entry.code[dictType] : undefined;
      if (typeof val !== "undefined") map[entry.char] = val;
    }
    return map;
  }
  return wingdingsDict;
}

function buildReverseMap(dictType) {
  const rev = {};
  const map = buildMapFromDict(dictType);
  for (const [k, v] of Object.entries(map)) rev[v] = k;
  return rev;
}

function buildNormalizedReverseMap(dictType) {
  const rev = {};
  const map = buildMapFromDict(dictType);
  for (const [k, v] of Object.entries(map)) {
    let normalizedKey = normalizeCustomEmoji(v);
    normalizedKey = normalizedKey.replace(/<:([a-zA-Z0-9_]+)>/g, (match, name) => {
      return `<:${normalizeEmojiName(name)}>`;
    });
    rev[normalizedKey] = k;
  }
  return rev;
}

function translateFromWingdings(text, dictType, useNormalizedMap = false) {
  if (!text) return "";
  const rev = useNormalizedMap ? buildNormalizedReverseMap(dictType) : buildReverseMap(dictType);
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

function countMatchingChars(text, dictType, useNormalizedMap = false) {
  if (!text) return 0;
  const rev = useNormalizedMap ? buildNormalizedReverseMap(dictType) : buildReverseMap(dictType);
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

    //const compTranslated = translateFromWingdings(normalizedMsg, "comp", false);
    const emojiTranslated = translateFromWingdings(normalizedMsg, "emoji", true);
    const originalTranslated = translateFromWingdings(emojiTranslated, "original", false);

    await interaction.reply({ content: originalTranslated, flags: MessageFlags.Ephemeral });
  }
};
