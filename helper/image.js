const Jimp = require("jimp");

Jimp.read("tmp/cat.jpg", (err, avatar) => {
  if (err) throw err;
  avatar
    .resize(256, 256) // resize
    .write("public/avatars/avatar.jpg"); // save
});
