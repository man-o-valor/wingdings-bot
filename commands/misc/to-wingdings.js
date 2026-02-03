const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { wingdingsDict, wingdingsDictEmojis } = require("../../dicts.js");

function translateToWingdings(text, dict = wingdingsDict) {
  if (!text) return "";
  return text
    .split("")
    .map((ch) => (Object.prototype.hasOwnProperty.call(dict, ch) ? dict[ch] : ch))
    .join("");
}

const failmsg = "☠️🏳️☠️👈 🏳️👉 ❄️👇👈 ☝🖐<:shadowed_cross:1468052208829595659>👈☠️ 👍👇✌️☀️✌️👍❄️👈☀️💧 👇✌️<:shadowed_cross:1468052208829595659>👈 <:celtic_cross:1468052217947750411>🖐☠️☝👎🖐☠️☝💧 <:shadowed_cross:1468052208829595659>👈☀️💧🖐🏳️☠️💧✏️"

module.exports = {
  data: new SlashCommandBuilder()
    .setName("to-wingdings")
    .setDescription("Translate text to Wingdings.")
    .addStringOption((option) =>
      option.setName("message").setDescription("The message to translate").setRequired(true)
    ).addBooleanOption((option) =>
      option.setName("secret").setDescription("Whether the response should be secret (defaults to true)").setRequired(false)
    ).addBooleanOption((option) =>
      option.setName("emoji").setDescription("Whether the response should use custom emojis instead of symbols (defaults to false)").setRequired(false)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message");
    const secret = interaction.options.getBoolean("secret") ?? true;
    const useEmoji = interaction.options.getBoolean("emoji") ?? false;
    const dict = useEmoji ? wingdingsDictEmojis : wingdingsDict;
    const translated = translateToWingdings(message, dict);
    await interaction.reply({ content: "​" + translated || failmsg, flags: secret ? MessageFlags.Ephemeral : undefined });
  }
};
