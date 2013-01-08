/**
 * @fileOverview A module file providing functionality for person operations (person service)
 * @module person
 * @requires libxmljs
 */


//--------------------------------------------------------------
// PRIVATE API

var 

  /**
   * libxmljs module instance
   * @name libxml
   * @type {object}
   * @private
   * @see https://github.com/polotek/libxmljs
   */
  libxml = require('libxmljs'),

  /**
   * Dummy data storage for person resources.
   * in Array storage should be more reasonable obviously with some external tool/system
   * @name persons
   * @type {Array}
   * @private
   */
  persons = [], 

  /**
   * Parses xml string to JSON object.
   * @name parseXML
   * @function
   * @private
   * @param {string} xml XML input
   * @return {object}
   */
  parseXML = function (xml) {
    var json = {},
        doc = libxml.parseXmlString(xml),
        root = doc.root(),
        childNodes = root.childNodes();

    for (var i = 0, leni = childNodes.length, node; i < leni; ++i) {
      node = childNodes[i]; 
      // omit text nodes
      if (node.name() !== 'text') {
        json[node.name()] = node.text();
      }
    }

    return json;
  }

;


//--------------------------------------------------------------
// PUBLIC API


/**
 * Returns all person entries as JSON object.
 * Intended service call: GET /person
 * @name list
 * @function
 * @public
 * @param {http.ServerRequest} req HTTP request
 * @param {http.SercerResponse} res HTTP response
 */
exports.list = function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send(persons);
};


/**
 * Returns person by id in a xml or JSON format - depends on 'format' parameter
 * of request object. If format not specifed or different than 'xml' or 'json'
 * the service call will respond with an error. 
 * Intended service call: GET /person/{id}.{format}
 * @name read
 * @function
 * @public
 * @param {http.ServerRequest} req HTTP request
 * @param {http.SercerResponse} res HTTP response 
 */
exports.read = function (req, res) {
  var doc, person, keys, root,
      id = req.params.id.toString(),
      format = req.params.format;

  // Check if format is supported
  if (format !== 'xml' && format !== 'json') {
    res.set('Content-Type', 'text/plain');
    res.send('ERROR: Unknown output format.');
    return;
  }

  // That fancy/convinient way could be replace with std for loop for performace improvment
  person = persons.filter(function (item) { return item.id === id; }).first();

  // Check if entry of given id exists
  if (typeof person !== 'object') {
    res.set('Content-Type', 'text/plain');
    res.send('ERROR: No such entry for: GET /person/' +id+ '.:format?');
    return;
  }

  if (format === 'xml') {
    doc = new libxml.Document();
    root = doc.node('person'); // <person></person>

    // Adds person properties to xml root element. 
    // <id>1</id>
    // <fname>Joe</fname>
    // <lname>Brown</lname>
    // <DOB>1987-03-04</DOB>  <!-- date of birth -->
    // <wage>100</wage>
    // <location>US</local>  <!-- one of three values: (US = United States, UK = United Kingdom, AU = Australia) -->
    keys = Object.keys(person);
    for (var i = 0, leni = keys.length, key; i < leni; ++i) {
      key = keys[i];
      root.node(key, person[key]);
    }

    res.set('Content-Type', 'application/xml');
    res.send(doc.toString());
  } else if (format === 'json') {
    res.set('Content-Type', 'application/json');
    res.send(person);
  } 
};


/**
 * Creates new person entry from upcomming data
 * Intended service call: POST /person
 * @name create
 * @function
 * @public
 * @param {http.ServerRequest} req HTTP request
 * @param {http.SercerResponse} res HTTP response
 */
exports.create = function(req, res){
  var person = null,
      contentType = req.get('content-type');

  // Check for proper content type
  if (contentType !== 'application/json' && contentType !== 'application/xml') {
    res.set('Content-Type', 'text/plain');
    res.send('ERROR: Request need to have proper Content-Type: [application/json | application/xml].');
    return;
  }

  if (contentType === 'application/json') {
    person = req.body;
  } else {
    person = parseXML(req.rawBody);
  } 

  person.id = (persons.length + 1).toString();
  persons.push(person);

  res.set('Content-Type', 'application/json');
  res.send(person);
};


/**
 * Updates entry of given id with given data
 * Intended service call: PUT /person/{id}
 * @name update
 * @function
 * @public
 * @param {http.ServerRequest} req HTTP request
 * @param {http.SercerResponse} res HTTP response 
 */
exports.update = function(req, res){
  var id = req.params.id.toString(),
      data = null,
      person = null,
      contentType = req.get('content-type');

  // Check for proper content type
  if (contentType !== 'application/json' && contentType !== 'application/xml') {
    res.set('Content-Type', 'text/plain');
    res.send('ERROR: Request need to have proper Content-Type: [application/json | application/xml].');
    return;
  }

  // That fancy/convinient way could be replace with std for loop for performace improvment
  person = persons.filter(function (item) { return item.id === id; }).first();

  // Check if entry of given id exists
  if (typeof person !== 'object') {
    res.set('Content-Type', 'text/plain');
    res.send('ERROR: Not such entry for: GET /person/' +id+ '.:format?');
    return;
  }

  if (contentType === 'application/json') {
    data = req.body;
  } else {
    data = parseXML(req.rawBody);
  } 

  for (var key in data) {
    person[key] = data[key];
  }

  res.set('Content-Type', 'application/json');
  res.send(person);
};



/**
 * Removes entry of given id
 * Intended service call: DELETE /person/{id}
 * @name delete
 * @function
 * @public
 * @param {http.ServerRequest} req HTTP request
 * @param {http.SercerResponse} res HTTP response
 */
exports.delete = function (req, res) {
  var id = req.params.id.toString(),
      index = null;

  res.set('Content-Type', 'text/plain');

  for (var i = 0, leni = persons.length, person; i < leni; ++i) {
    person = persons[i];
    if (person.id === id) {
      index = i;
      break;
    }
  }

  if (typeof index === 'number') {
    persons.splice(index, 1);
    res.send('OK');
  } else {
    res.send('ERROR: Not such entry for: DELETE /person/' +id);
  }
};



//--------------------------------------------------------------
// MODULE INITIALIZATION

(function() {

   // Add initial/test data
  persons.push({ 
    "id": "1",
    "fname": "Joe",
    "lname": "Brown",
    "dob": "1987-03-04",
    "wage": "100",
    "location": "US"
  });

  // extend Array's prototype with a new method - first
  Array.prototype.first = function () {
    return this[0];
  };

})();
