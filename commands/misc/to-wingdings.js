const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { wingdingsDict } = require("../../dicts.js");

function buildMapFromDict(dictType) {
  const map = {};
  for (const entry of wingdingsDict) {
    if (!entry || typeof entry.char === "undefined") continue;
    const val = entry.code ? entry.code[dictType] : undefined;
    if (typeof val !== "undefined") map[entry.char] = val;
  }
  return map;
}

function translateToWingdings(text, dictType) {
  if (!text) return "";
  const map = buildMapFromDict(dictType);
  return text
    .split("")
    .map((ch) => (Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch))
    .join("");
}

const failmsg =
  "☠️🏳️☠️👈 🏳️👉 ❄️👇👈 ☝🖐<:shadowed_cross:1468052208829595659>👈☠️ 👍👇✌️☀️✌️👍❄️👈☀️💧 👇✌️<:shadowed_cross:1468052208829595659>👈 <:celtic_cross:1468052217947750411>🖐☠️☝👎🖐☠️☝💧 <:shadowed_cross:1468052208829595659>👈☀️💧🖐🏳️☠️💧✏️";

const dictTypes = ["comp", "emoji", "original"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("to-wingdings")
    .setDescription("Translate text to Wingdings.")
    .addStringOption((option) => option.setName("message").setDescription("The message to translate").setRequired(true))
    .addBooleanOption((option) =>
      option
        .setName("secret")
        .setDescription("Whether the response should be secret (defaults to true)")
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName("type")
        .setDescription("What type of Wingdings to use (defaults to Compatability)")
        .addChoices(
          //{ name: "Compatability", value: 0 },
          { name: "Emoji", value: 1 },
          { name: "Symbol", value: 2 }
        )
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const secret = interaction.options.getBoolean("secret") ?? true;
    const dictType = dictTypes[interaction.options.getInteger("type") ?? 0];
    const translated = translateToWingdings(message, dictType);
    await interaction.reply({
      content: "\u200b" + (translated || failmsg),
      flags: secret ? MessageFlags.Ephemeral : undefined
    });
  }
};
