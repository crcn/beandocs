var Parser = require('./parser'),
fs = require('fs'),
findit = require('findit'),
RouteCollection = require('beanpole/lib/core/concrete/collection'),
sys = require('sys');



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
                    var listener = tg.listeners[i],

                    info = {
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
    
    this.write = function(opsOrInput, output)
    {
        var ops = { output: mkdirr(output) },
        writer = {
            end: function(docs)
            {
                var tpl = require(ops.template || __dirname + '/templates/default');
                
                tpl.write(docs, ops.output);
            }
            
        };
        
        if(typeof opsOrInput == 'string')
        {
            ops.input = opsOrInput;
        }
        else
        {
            Structr.copy(opsOrInput, ops, true);
        }
        
        
        
        
        var finder = findit.find(ops.input),
        collection = new RouteCollection();
        
        
        finder.on('file', function(file)
        {
            if((file.split('.').pop() != 'js') || file.indexOf('node_modules') > -1) return;
            
            //docs.push(self.parseFile(file));
            self.parseFile(file).forEach(function(route)
            {
                collection.add(route);
            });
        });
        
        
        finder.on('end', function()
        {
            writer.end(flattenCollection(collection._routes._route));
        });
    }
}

var bd = new Beandocs();

bd.write(__dirname + '/examples/todo', __dirname + '/examples/todo/docs');
