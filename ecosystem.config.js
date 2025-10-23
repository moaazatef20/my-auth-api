module.exports = {
  apps: [
    {
      name: "my-auth-api",
      script: "index.js",
      env: {
        NODE_ENV: "development",
      },
      // السطر ده هو اللي هيجبره يقرأ .env
      // (لو بتستخدم dotenv)
      // بس الطريقة الأضمن هي إننا نثبت مكتبة مساعدة
    },
  ],
};
