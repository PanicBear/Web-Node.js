//var template = {
module.exports={
    // body 중간에 a태그 생성(글 생성용 create)
        html: function (title, list, body, control) {
            return `
        <!doctype html>
        <html>
        <head>
          <title>WEB2 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB2</a></h1>
          ${list}
          ${control}
          ${body}
        </body>
        </html>
        `;}, 
        list(filelist) {
            var list = '<ul>';
            var i = 0;
        
            while (i < filelist.length) {
                list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i].slice(0, -4)}</a></li>`;
                i = i + 1;
            }
            list = list + '</ul>';
            return list;
        }
    }

    //module.exports = template;