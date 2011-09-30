//hack job

var fs = require('fs'),
path = require('path'),
nodefs = require('node-fs'),
jstoxml = require('jstoxml');


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

function pathsToTemplate(doc)
{       
	var uri = [],  
	channel = [],
	params = [],
	paths = doc.target.channels[0].paths;
	
	for(var i = 0, n = paths.length; i < n; i++)
	{
		var path = paths[i];
		
		if(path.param)
		{
			uri.push('{' + path.name + '}');    
			params.push(path.name);
		}
		else
		{
			uri.push(path.name);         
		}          
		
		
		channel.push((path.param ? ':' : '') + path.name);
	}          
	
	return { uri: uri.join('/'), displayName: channel.join('/'),  params: params };
}


exports.write = function(docs, output)
{
    var byCollection = {},
	_idCount = 0;      
	
	console.log('Writing WADL');
    
    
    
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
      
    var resources = [],     
	wadl = {
		_name: 'application',
		_attrs: {                                               
			'xmlns': 'http://wadl.dev.java.net/2009/02',
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'xmlns:apigee': 'http://api.apigee.com/wadl/2010/07/',
			'xmlns:schemaLocation': 'http://wadl.dev.java.net/2009/02 http://apigee.com/schemas/wadl-schema.xsd http://api.apigee.com/wadl/2010/07/ http://apigee.com/schemas/apigee-wadl-extensions.xsd'
		},
		_content: [ 
			{
				_name: 'resources',
				_attrs: {         

					//todo
					'base': 'http://cliqly.spice.io'
				},
				_content: resources
			}
		]
	};  
	                          
	docs.forEach(function(doc)
	{       
		var tpl = pathsToTemplate(doc),     
		
		//@collection, @param, @optional, etc.
		properties = doc.comment.props,
		propsByType = {}; 
		
		for(var i = properties.length; i--;)
		{  
			var property = properties[i];
			
			if(!propsByType[property.type]) propsByType[property.type] = [];
			
			propsByType[property.type].push(property);	
		}  
		
		
		
		method = {
			_name: 'method',
			_attrs: {
				'name': doc.meta.method,
				'id': 'channel_' + (_idCount++),
				'apigee:displayName': propsByType.displayName ? propsByType.displayName[0].text : tpl.displayName, 
			}, 
			
			_content: []
		};
		                      
		
		params = [],
		
		format = {
			_name: 'param',
			_attrs: {
				'type': 'xsd:string',
				'style': 'template',
				'required': false,
				'default': 'json',   
				'name': 'format'
			},
			_content: [                                             
				{
					_name: 'option',
					_attrs: {
						'value': 'json',
						'mediaType': 'application/json'
					}
				}
			]
		}     
		                        
		resource = {
			_name: 'resource',
			_attrs: {
				'path': tpl.uri
			},
			_content: [
				format, 
				params,
				method
			] 
		};            
		                
		
		                                            
		  
		                                                                
		if(!propsByType.collection) return console.warn('cannot include "%s" because no @collection is provided', tpl.uri);  
		if(!propsByType.example)
		{
			console.warn('Warning: No example given for "%s"', tpl.uri);  
			propsByType.example = [           
				{
					text: tpl.uri
				}
			]
		}      
		
		
		         
		resources.push(resource)
		                                              
		  
		           
		var allParams = (propsByType.param || []).concat(propsByType.optional || []); 
		
	   allParams.forEach(function(property)
		{
			params.push({
				_name: 'param',
				_attrs: {
					'name': property.name,
					'required': property.type == 'param',
					'type': 'xsd:string',
					'style': tpl.params.indexOf(property.name) > -1 ? 'template' : 'query',    
					'default': property.value
				}
			});
		});   
		   
		
		var tags = [];  
		method._content.push({
			_name: 'apigee:tags',
			_content: tags 
		});
		        
		propsByType.collection.forEach(function(property, index)
		{
			tags.push({
				_name: 'apigee:tag',
				_attrs: {
					'primary': !index
				},
				_content: property.text
			});
		});
		         
		method._content.push({
			_name: 'apigee:authentication',
			_attrs: {                                                    
				'required': (propsByType.auth || propsByType.authentication || [{ text: 'false' }])[0].text.indexOf('true') > -1
			}
		});     
		
		method._content.push({
			_name: 'apigee:example',
			_attrs: {                                                  
				'url': (propsByType.example || [{ text:'' }])[0].text
			}
		}); 
		
		method._content.push({
			_name: 'doc',
			_attrs: {                                                   
				'title': '',
				'apigee:url': '', //DOC URL HERE! 
			},	
			_content: '<![CDATA[ ' + doc.comment.description.replace(/[\s\n\r\t]+/g,' ') + ']]>'
		});  
		
		               
	});                                                  
	
	var buffer = '<?xml version="1.0" encoding="UTF-8"?>\n';
	
	buffer += jstoxml.toXML(wadl, false, '\t'); 
	                              
	                    
	fs.writeFileSync(output + '/api-wadl.xml', buffer);
      
}