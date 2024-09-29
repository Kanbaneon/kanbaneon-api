const fs = require("fs");
const handlebars = require("handlebars");

const readHTMLFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    });
  });
};

const fillTemplate = (html, replacements) => {
  return handlebars.compile(html)(replacements);
};

module.exports = {
  readHTMLFile,
  fillTemplate,
};
