var Structr = require('structr');


var Lexer = Structr(function()
{

    function isAlpha(c)
    {
        return isAZ(c) || isNumber(c) || c == 95;
    }

    function isWhite(c)
    {
        return c == 32 || c == 9 || c == 10; 
    }

    function isNumber(c)
    {
        return c > 47 && c < 58;
    }

    function isAZ(c)
    {
        return (c > 96 && c < 123) || (c > 64 && c < 91);
    }



    return ret = {

        /**
         */

        'token': function(value, type, igSkip)
        {
            if(!igSkip) this.nextChar();

            return { value: value, type: type };
        },
    
        /**
         */
         
        
        'source': function(src)
        {
            if(!arguments.length) return this._source;
            
            this.pos = 0;
            this.length = src.length;
            
            return this._source = src;
        },
        
        /**
         */
         
        'prevChar': function()
        {
            return this._source[this.pos-1];
        },
        
        /**
         */
         
        'rewind': function(steps)
        {
            this.pos -= (steps || 1);
        },
        
        /**
         */
         
        'skip': function(steps)
        {
            this.pos += (steps || 1);
            return true;//!this.eof();
        },
        
        /**
         */
         
        'currentChar': function()
        {
            return this._source[this.pos];
        },
        
        /**
         */

        'currentCharCode': function()
        {
            return this.currentChar().charCodeAt(0);
        },

        /**
         */
         
        'nextChar': function()
        {
            return this._source[this.pos++];
        },

        /**
         */

        'peek': function(length)
        {
            return this._source.substr(this.pos, length || 1);
        },
        
        /**
         */
         
        'eof': function()
        {
            return this.pos > this.length-1;
        },
        
        /**
         */
        
        'skipWhite': function()
        {
            var end = false;

            while(!(end = !this.eof()))
            {
                if(!isWhite(this.currentCharCode())) break;

                nextChar();
            }

            return !end;
        },

        /**
         */

        'isWhite': isWhite,
        'isAlpha': isAlpha,
        'isNumber': isNumber,
        'isAZ': isAZ
        
    };
});




/**
 * <Description>
 * @<name> <tokens>

 */

var CommentLexer = Lexer.extend(function()
{
     var Tokens = {

          /**
           */

          ALPHA: 1 << 2,

          /**
           * @prop
           */

          PROP: 1 << 3,

          /**
           */

          // LP: 1 << 4,


          /**
           */

          // RP: 1 << 5,


          /**
           */
            
          WS: 1 << 6,
          
          /**
           */
           
          START: 1 << 7,
          
          /**
           */
           
          END: 1 << 8
    };
   


    return ret = {

        'Tokens': Tokens,


        /**
         */


        'nextToken': function()
        {
            if(this.eof()) return null;

            var c = this.currentChar(),
            code = c.charCodeAt(0);
            
            if(c == '*' && this.peek(2) == '*/' && this.skip(2)) return this.token('*/', Tokens.END);
            if(c == '/' && this.peek(4) == '/**!' && this.skip(3)) return this.token('/**!', Tokens.START);
            if(c == '@' && this.isAlpha(this.peek(2).charCodeAt(1)) && this.skip()) return this._bufferedToken(Tokens.PROP, this.isAlpha);
            if(this.isWhite(code)) return this._bufferedToken(Tokens.WS, this.isWhite);
            if(this.isAlpha(code)) return this._bufferedToken(Tokens.ALPHA, this.isAlpha);

            return this.token(c, 0);
        },

        /**
         */

        '_bufferedToken': function(type, test)
        {
            var buffer = this.nextChar();

            while(!this.eof() && test(this.currentCharCode()))
            {
                buffer += this.currentChar();

                this.nextChar();
            }

            this.rewind();

            return this.token(buffer, type);
        }
        
    };
});


module.exports = new CommentLexer();