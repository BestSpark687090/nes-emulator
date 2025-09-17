const fs = require("fs");
const http = require("http");
http.createServer(function (req, res) {
  try {
    if (req.url.includes("/urls")){
      // quick hack to access data htmls
      res.write(`<script src="https://cdn.jsdelivr.net/npm/eruda"></script><script>eruda.init();</script>`)
      res.write(fs.readFileSync("."+req.url.replaceAll("%20"," "), {encoding: 'binary'}))
      return res.end()
    }
    if (req.url.includes(".js") && (!req.url.includes("n64.js")&&!req.url.includes("ds.js"))) {
      throw new Error(req.url);
    }else if (req.url.includes(".js")){
    }
    // i have the replace %20 just in case that the rom name contains a space
    res.write(fs.readFileSync("./nes" + req.url.replaceAll("%20", " ")));
  } catch (e) {
    if(req.url=="/me.png"||req.url=="/favicon.ico"){
      res.write(fs.readFileSync("./me.png"))
    } else if (req.url == "/nes-embedv2.js") {
      res.writeHead(200, { "Content-Type": "text/javascript" });
      res.write(fs.readFileSync("./nes/nes-embedv2.js"));
    } else if (req.url == "/list") {
      const index = fs.readFileSync("list-index.html").toString();
      const template = fs.readFileSync("./template.html");
      let replaced;
      let files = fs.readdirSync("./nes/roms/").filter((x) => x.endsWith(".nes"));
      files.forEach(function (e) {
        let templateCopy = template.toString();
        replaced += templateCopy.replaceAll("ROMN", e);
      });
      replaced = index.replaceAll("<!--replace-->", replaced);
      res.write(replaced);
    } else if (req.url == "/listall") {
      const index = fs.readFileSync("listall.html").toString();
      const template = fs.readFileSync("./template.html");
      let replaced;
      let files = fs.readdirSync("./nes/roms/");
      files.forEach(function (e) {
        let templateCopy = template.toString();
        replaced += templateCopy.replaceAll("ROMN", e);
      });
      replaced = index.replaceAll("<!-- REPLACE -->", replaced);
      res.write(replaced);
    }else if(req.url == "/about"){
      res.write(fs.readFileSync("./about.html"));
    } else if (!req.url.includes("?rom=")&&!req.url.includes("/urls")) {
      res.writeHead(301, { Location: "/list" });
      res.write("<a href='/list'>redirect</a>");
    } else {
      res.write(fs.readFileSync("./nes/nes-embed.html"));
    }
  }
  return res.end();
}).listen(8080);
