var fs = require('fs'),
ejs = require('ejs');

var indexTpl = fs.readFileSync(__dirname + '/index.ejs','utf8'),
docTpl = fs.readFileSync(__dirname + '/doc.ejs','utf8');

exports.write = function(docs, output)
{
    
    var renderedIndex =  ejs.render(indexTpl, { locals: { docs: docs } });
    
    
    fs.writeFileSync(output + '/index.html', renderedIndex);
}