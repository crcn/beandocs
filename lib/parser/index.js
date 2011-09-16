var Lexer = require('./lexer'),
Structr = require('structr'),
RouteParser = require('beanpole/lib/core/concrete/parser');


module.exports =  Structr.fh(function()
{
	var ret,
    current,
    Tokens = Lexer.Tokens;
    
    function commentExpr()
    {   
        while(!eof() && nextTokenType() != Tokens.START);
        
        while(!eof() && nextTokenType() != Tokens.END)
        {
            var cexpr = descExpr(true), props = [];
            
            
            while(prop = propsExpr())
            {
                props.push(prop);
            }
            
            return { description: cexpr.text, props: props };
        }
        
    }
    
    function descExpr(keepWhite)
    {   
        var buffer = [];
                
        if(current && current.type == Tokens.END) return { text: '' };
        
        do
        {
            if(current && current.value != '*')
            {
                buffer.push(current.value);
            }


            /*if(current && current.value == '*')
            {

                while(nextToken() && !current.value.match(/\s\r\n/))
                {
                    buffer.push(current.value);
                }
            }*/
            
        } while(!eof() && nextTokenType() != Tokens.PROP && current.type != Tokens.END);
                
        

        var str = buffer.join('');

        if(!keepWhite)
        {
            str = str.replace(/[\r\n\t\s]+/g,' ').replace(/^\s+|\s+$/g,'');
        }
        else
        {
            str = str.replace(/[\s\t]+(.*?)(\n+|$)/g,'$1\n\n')
        }

        //remove extra whitespace, and trim.
        return { text: str }
    }
    
    function propsExpr()
    {
        
        if(current && current.type == Tokens.PROP)
        {
            var type = current.value;
            
            switch(type)
            {
                /*case 'copyright': 
                    nextToken();
                    return { 
                        type: 'copyright', 
                        text: descExpr().text 
                    };*/
                
                case 'test':
                    nextToken();
                    return {
                        type: type,
                        channel: RouteParser.parse(descExpr().text)
                    };
                    
                case 'optional':
                case 'param': 
                
                    skipWhite();
                    nextToken();
                    skipWhite();
                
                    var name = current.value;
                    
                    nextToken();
                    
                    var value = valueExpr();

                    return { 
                        type: type, 
                        name: name,
                        value: value,
                        text: descExpr().text
                    };
                    
                default:    
                    nextToken();
                    return {
                        type: type,
                        text: descExpr().text
                    };
                
            }
        }
    }
    
    
    function valueExpr()
    {
        skipWhite();
        
       return block('(',')').buffer;
    }
    
    function block(start, end)
    {
        skipWhite();
        
        var startPos = Lexer.pos, stopPos;
        
        
        if(current && current.value == start)
        {
            while(nextToken())
            {
                if(current.value == start)
                {
                    block(start, end);
                }
                
                if(current.value == end)
                {
                    stopPos = Lexer.pos-current.value.length;
                    nextToken();
                    break;
                }
            }
        }
        
        return { buffer: Lexer.source().substr(startPos, stopPos-startPos) }
    }
    
    
    function targetExpr()
    {
        var paren = /^['"]$/;
        
        while(!eof() && !nextToken().value.match(paren));
            
        nextToken();
        
        var buffer = '';
        
        while(current && !current.value.match(paren))
        {
            buffer += current.value;
            
            nextToken();
        }
        return buffer.replace(/[\r\n\t\s]+/g,' ');
    }


    function getChannelStr(target)
    {
        if(!target) return null;

        var firstPath = target.channels[0].paths,
        n = firstPath.length;

        var paths = [];

        for(var i = 0; i < n; i++)
        {
            var part = firstPath[i];

            paths.push((part.param ? ':' : '') + part.name );    
        }

        return paths.join('/');
    }
    


	function parse()
	{
        var exprs = [];
        
        while(!eof())
        {
            var comment = commentExpr(),
            target = targetExpr();
            if(!comment) break;

            var channelExpr = target ? RouteParser.parse(target) : null
            
            exprs.push({
                comment: comment,
                target: channelExpr,
                source: target,
                meta: channelExpr ? channelExpr.meta : null,
                channel: getChannelStr(channelExpr)
            });
        }

        return exprs;
	}
    
    function eof()
    {
        return Lexer.eof();
    }
    
    function skipWhite()
    {
        while(current.type == Tokens.WS && nextToken());
        return current;
    }
    
    function nextToken()
    {
        return current = Lexer.nextToken();
    }
    
    
    function nextTokenType()
    {
        var tok = nextToken();
        
        return tok ? tok.type : 0;
    }


	return ret = {
        add: function()
        {
        },
		parse: function(source)
		{
            Lexer.source(source);

            return parse();
		}
	};
});



