var router = require('beanpole').router(),
db = require('gumbo').db(),
vine = require('vine');


var todos = db.collection('todo'),
tokens = db.collection('tokens');


router.on({
    
    /**!
     * Creates a new access token
     */
     
    'pull -api -method=POST (token or token/create)': function(request)
    {
        tokens.insert({ key: tokens.idGen.random(), createdAt: new Date(), expires: new Date(Date.now()+360000) }, function(err, items)
        {
            vine.result(items[0]).end(request);
        });
    },
    
    
    /**!
     * Returns information about the given token
     * @param key(currentToken.key) the secret key of the token 
     */
     
    'pull -api -method=GET (token/:key or token or token/get)': function(request)
    {
        tokens.findOne({ key: request.data.accessKey || request.data.key }, function(err, item)
        {
            if(!item) 
            {   
                return vine.error('Token does not exist.').end(request);
            }
            
            request.token = item;
        
            if(!request.next()) return vine.result(item).end(request);
        });
    },
    
    /**!
     * Refreshes the access token
     * @test -method=UPDATE token/:id
     * @param key(currentToken.key) the secret key of the token to update
     */
     
    'pull -api -method=UPDATE token/get -> (token/:key or token/:key/update)': function()
    {
        return vine.error('Not implemented.').end();
    }
});

router.on({

    /**!
     * Returns all the todo items
     * @test -method=GET token -> todos
     */
     
     
    'pull -api -method=GET token/get -> /todos': function(request)
    {
        todos.find({ token: request.token._id }, function(err, items)
        {
            vine.list(items).end(request);
        });
    },
    
    /**!
     * Adds a todo item
     *
     * @test -method=POST token -> todos
     * @param title("test title!") the title of the todo
     * @param description("Some Desc") The description of the item
     * @param completionDate(Date.now()+36000) the date the todo should be done at
     */
     
    'pull -api -method=POST token/get -> (todos or todos/create)': function(request)
    {
        var d = request.data,
        title = d.title,
        desc = d.description;
        
        if(!title || !desc) return vine.error('Some parameters are missing').end();
        
        todos.insert({ token: request.token._id, title: title, description: desc, createdAt: new Date() }, function(err, items)
        {
            vine.result(items[0]).end(request);
        });
    },
    
    /**!
     * Returns an existing todo item
     * @test -method=GET token -> todos/:id
     */
    
    'pull -api -method=GET token/get -> todos/:id': function(request)
    {
        todos.findOne({ token: request.token._id, _id: request.data._id }, function(err, item)
        {
            if(!item) return vine.error('Todo item does not exist');
            
            vine.result(item).end(request);
        });
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

router.push('init');
