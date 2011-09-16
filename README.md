Beandocs - documentation engine for beanpole
--------------------------------------------


Usage
-----

	beandocs -i /path/to/project -o /output/directory -t /template

Syntax
------

```javascript


 router.on({
 	
 	/**
	 * <My Super Long Description Here>
	 * @param <param name> <param description>
	 * @return <app return description>
	 * @see <ref to other documentation>
	 */

	
	'pull my/api/method/with/a/:param': function()
	{
		
	}

 })

 ````



Example:
--------

Your beanpole file:

```javascript

var router = require('beanpole').router();

router.on({
	
	/**!
	 * Says hello world to the user
	 * @param name the name of the user to say hello to
	 */

	'pull -api say/hello/:name': function()
	{
		//stuff here....
	}

});

```

(optional) in your beanpole config located in same directory as package.json: 


```javascript

{
	"title": "My Project Title",
	"descscription": "My Project Description",
	"template":"template name or template/path",
	"meta": {
		"descriptions": {
			"api": "Public to the world and over HTTP."
		},
		"public": ["api","public","http"]
	},
	"method" {
		"pull": "Makes a request for current data.",
		"push": "Called when data has changed."
	}
}

```


in your console window:
	
	beandocs -i /path/to/file