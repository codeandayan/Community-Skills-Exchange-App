module.exports = {
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: "codesparksoffice@gmail.com",
          pass: "ysmzxlpqauvdbvsg",
        },
      },
      settings: {
        defaultFrom: "codesparksoffice@gmail.com",
        defaultReplyTo: "codesparksoffice@gmail.com",
      },
    },
  },

  upload: {
    config: {
      sizeLimit: 250 * 1024 * 1024,
    },
  },
};
