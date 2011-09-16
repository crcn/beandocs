var Parser = require('./parser'),
fs = require('fs'),
findit = require('findit'),
RouteCollection = require('beanpole/lib/core/concrete/collection'),
sys = require('sys'),
Structr = require('structr');



var Beandocs = function()
{
    var self = this;
    
    this.parseFile = function(file)
    {
        return Parser.parse(fs.readFileSync(file,'utf8'));
    }
    
    this.parseDir = function(dir)
    {
        
    }
    
    
    function mkdirr(target)
    {
        var cpath = [],
        parts = target.split('/');
        
        for(var i = 0, n = parts.length; i < n; i++)
        {
            cpath.push(parts[i]);
            
            try
            {
                fs.mkdirSync(cpath.join('/'), 0777);
            }
            catch(e)
            {
            }
        } 
        
        return target;
    }
    
    function flattenCollection(start)
    {
        var flattened = [];
        
        if(prop)
        {
            console.log(prop);
        }
        
        for(var prop in start)
        {
            var tg = start[prop];
            
            if(tg._route)
            {
                flattened = flattened.concat(flattenCollection(tg._route));
            }
            
            if(tg.listeners)
            {
                for(var i = tg.listeners.length; i--;)
                {
                    // console.log(tg)
                    var listener = tg.listeners[i];
                    
                    if(!listener.meta.docs) continue;

                    var info = {
                        docs: listener.meta.docs,
                        source: listener.meta.source,
                        meta: listener.meta,
                        type: (listener.meta.source || '').split(' ').shift()
                    }

                    delete listener.meta['docs'];
                    delete listener.meta['source'];

                    var pt = [];


                    for(var j = listener.path.length; j--;)
                    {
                        var part = listener.path[j];

                        pt.unshift((part.param ? ':' : '') + part.name);
                    }

                    info.path = pt.join('/');

                    flattened.unshift(info);
                }

            }
        }
        
        return flattened;
    }    
    
    this.getDocs = function(ops, callback)
    {
        
        var finder = findit.find(ops.input),
        collection = new RouteCollection(),
        allDocs = [];
        
        
        finder.on('file', function(file)
        {
            if((file.split('.').pop() != 'js') || file.indexOf('node_modules') > -1) return;
            
            
            //docs.push(self.parseFile(file));
            self.parseFile(file).forEach(function(doc)
            {
                doc.path = file;

                allDocs.push(doc);
                // collection.add(route);
            });
        });
        
        
        finder.on('end', function()
        {
            callback(allDocs);
            // callback(flattenCollection(collection._routes._route));
        });
    }
    
    this.generate = function(ops, output)
    {
        ops.output = output;
        
        var writer = {
            end: function(docs)
            {
                var tpl = require(ops.template && ops.template.indexOf('/') > -1 ? ops.template :  __dirname + '/templates/' + (ops.template || 'default'));
                
                tpl.write(docs, ops.output);
            }
            
        };
        
        
        
        self.getDocs(ops, function(docs)
        {
            writer.end(docs);
        });
    }
}


module.exports = new Beandocs();

/*var beanpole = require('beanpole'),
router = beanpole.router(),
vine = require('vine'),
docs;


bd.getDocs(__dirname + '/examples/todo', function(d)
{
    docs = d;
});


router.on({
    
    'pull -api docs': function()
    {
        return vine.list(docs).end();
    }
});


router.params({
    'http.gateway': {
        'http': {
            port: 9032
        }
    }
});

router.require(['http.gateway','http.server']);

router.push('init');*/


