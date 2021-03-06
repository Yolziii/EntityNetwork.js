# EntityNetwork.js
EntityNetwork.js is a small experimental framework to work with semantic data like [RDF](https://www.ietf.org/rfc/rfc3870.txt) in terms of triplet subject-predicate-object where each of it's part is entity. You can use it as a Node.js module and as JS-library in browser. [Here](https://www.npmjs.com/package/entity-network) you can find its code repository. Feel free to ask me any questions by email [yolziii@gmail.com](mailto:yolziii@gmail.com?subject=EntityNetwork.js)

### Development status
This project is not active for now, so you can use it as is.

### How to install

To install it in your Node.js project, use this command:
```
npm install entity-network
```

You can find all [useful] versions for browser in this [folder of repository](https://github.com/Yolziii/EntityNetwork.js/tree/master/builds).
Or you can build it by yourself from sources by using this gulp-script:
```
gulp --gulpfile gulp_web_deploy.js
```

## How to use it

This framework shares two classes: 

### Entity
Use it to directly create entities and find them:
```javascript
var cardEntity = Entity.create('card');
var intEntity = Entity.get(CoreId.INT);
```

### EntityLoader
Use this to load entities from JSON file or create entities from any object:
```javascript
var dataObject = JSON.parse(dataJSON);
EntityLoader.proceedDocumentObject(dataObject);
```

EntityNetwork.js implements data structure that I called (surprise!) "entity network" which similar to "neural network", because this data structure implements something similar on concept of [neuron of grandmother](https://www.google.com.ua/search?q=Christof+Koch+Biophysics+of+Computation%3A+Information+Processing+in+Single+Neurons). 

In simple words this means the following. Each significant part of data is represented by unique entity, like this:
```json
{
  "my_grandmother": {"is": "entity"}
}
```
In this example JSON document defines entity with unique identifier "my_grandmother" that inherit root entity with ID "entity". On this diagram this "is" relation is shown by black arrow with triangle.

![my_mother-1](https://user-images.githubusercontent.com/16403393/33738075-e9d45504-dba0-11e7-9008-57deac23900d.png)

Root entity "entity" is using by default, so you can rewrite previous JSON code to create the same grandmother entity:

```json
{
    "my_grandmother": {}
}
```
 
When you load this file via EntityLoader, you can find this entity via Entity.get() method:
```javascript
var grandma = Entity.get('my_grandmother');
```


Each entity in network connected to other entities via properties and inherit relation. For example:
```json
{
  "my_grandmother": {
    "age": 85,
    "first_name": "Anna"
  },
  
  "age" : {"is": "int"},
  "first_name" : {"is": "string", "min_length": 1}
}
```
This diagram shows relations and properties between entities:
![my_mother-2](https://user-images.githubusercontent.com/16403393/33738076-e9ed06e4-dba0-11e7-9622-6e1079a7d54b.png)

### Relation "is"

In entity network data structure there is an one type of relation and it calls "is". This relation defines ralations between parents and children. Each child inherit all properties and relations from it's parent, like as classes inherit their behaviour from their super classes in OOP paradigm.
