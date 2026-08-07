require("dotenv").config();

const { Bot, InlineKeyboard } = require("grammy");

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard().webApp(
    "⚡ Открыть Vova Gym",
    "https://majddj.github.io/gymvova/"
  );

  await ctx.reply(
    `⚡ Добро пожаловать в Vova Gym!

Твой личный журнал тренировок.

🏋️ Записывай тренировки
🎯 Ставь цели
📊 Следи за прогрессом
🔥 Развивай результат`,
    {
      reply_markup: keyboard,
    }
  );
});

bot.start();

console.log("Vova Gym Bot запущен");