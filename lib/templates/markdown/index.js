var fs = require('fs'),
path = require('path'),
nodefs = require('node-fs');


function fileExists(file)
{
    try
    {
        return !!fs.lstatSync(file);
    }
    catch(e)
    {
    }
    
    return false;
}


exports.write = function(docs, output)
{
    var byCollection = {};
    
    
    
    docs.forEach(function(doc)
    {
        //if(!doc.
        //if(!byCollection[
        
        var props = doc.comment.props, stack;
        
        for(var i = props.length; i--;)
        {
            if(props[i].type == 'collection')
            {
                collection = props[i].text;
                if(!byCollection[collection]) byCollection[collection] = [];
                byCollection[collection].push(doc);
                break;
            }
        }
        
        
        if(!stack) return;
        
        
    });
    
    
    
    for(var collection in byCollection)
    {
        
        var buffer = ['## API'],
        dir = output + '/' + collection,
        copiedMd;
        
        
        nodefs.mkdirSync(dir, 0777, true);
        
        byCollection[collection].sort(function(a, b)
        {
            return a.channel.length > b.channel.length;
        });

        
        byCollection[collection].forEach(function(doc)
        {
            buffer.push('### ' + (doc.meta.method || 'GET') +' ' + doc.channel + '\n');
            
            buffer.push(doc.comment.description + '\n\n');
            
            
            var originDir = path.dirname(doc.path),
            originMd = originDir + '/' + collection + '.md';
            
                
            
           if(!copiedMd && fileExists(originMd))
           {
                copiedMd = true;

                buffer.unshift(fs.readFileSync(originMd, 'utf8') + '\n\n\n');
                buffer.unshift('## Introduction\n\n');
           }
        });


        copiedMd = false;
        
        
        
        
        
        fs.writeFileSync(dir + '/README.md', buffer.join('\n'));
        
    }
}