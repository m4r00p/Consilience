/**
 * @fileOverview The file contains unit tests for Person service.
 */


/**
 * Constructor of fake HTTP request object used to unit test services without actual server calls
 * @constructor
 * @private
 */
function FakeRequest() {
    this.params = {};
}

/**
 * Constructor of fake HTTP response object used to unit test services without actual server calls
 * @constructor
 * @private
 */
function FakeResponse() {
    this.headers = {};
    this.content = null;
}

FakeResponse.prototype = {
    constructor: FakeResponse,
    set: function(name, value) {
        this.headers[name] = value;
    },
    send: function(value) {
        this.content = value; 
    }
};


module.exports = {

    setUp: function (callback) {
        this.person = require("../person");
        this.request = new FakeRequest();
        this.response = new FakeResponse();
        callback();
    },

    tearDown: function (callback) {
        delete this.person;
        delete this.request;
        delete this.response;
        callback();
    },

    "test person.list": function (test) {
        test.strictEqual(typeof this.person.list, 'function', 'person.list must be a function');
        this.person.list(this.request, this.response);
        test.ok(Array.isArray(this.response.content));
        test.strictEqual(this.response.headers["Content-Type"], "application/json");
        test.done();
    },

    "test person.read (XML)": function (test) {
        this.request.params.id = 1;
        this.request.params.format = "xml";

        test.strictEqual(typeof this.person.read, 'function', 'person.read must be a function');
        
        this.person.read(this.request, this.response);
        test.strictEqual(typeof this.response.content, 'string');
        test.strictEqual(this.response.headers["Content-Type"], "application/xml");

        test.done();
    },

    "test person.read (JSON)": function (test) {
        this.request.params.id = 1;
        this.request.params.format = "json";

        test.strictEqual(typeof this.person.read, 'function', 'person.read must be a function');
        
        this.person.read(this.request, this.response);
        test.strictEqual(typeof this.response.content, 'object');
        test.strictEqual(this.response.headers["Content-Type"], "application/json");

        test.done();
    },

    "test person.read (wrong format)": function (test) {
        this.request.params.id = 1;
        this.request.params.format = "png";

        this.person.read(this.request, this.response);
        test.ok(this.response.content.indexOf("ERROR") > -1);
        test.strictEqual(this.response.headers["Content-Type"], "text/plain");

        test.done();
    }
};