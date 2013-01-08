/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(consilience/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "consilience"
 */


qx.Class.define("consilience.Application",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     */
    main : function() {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Person constructor
      var Person = function () {
        this.isNew = true;
      };

      // Getters for properties
      Person.prototype.getFname = function () {
        return this.fname || "";
      };
      Person.prototype.getLname = function () {
        return this.lname || "";
      };
      Person.prototype.getDob = function () {
        return new Date(+this.dob || 0);
      };
      Person.prototype.getWage = function () {
        return (this.wage || "").toString();
      };
      Person.prototype.getLocation = function () {
        return this.location || "US";
      };

      // Load data from backend
      Person.prototype.fetch = function (id) {
        var url = "/person/" + id + ".json";
        var req = new qx.io.remote.Request(url, "GET", "application/json");
        req.addListener("completed", this.onFetchCompleted, this);
        req.send();
      };

      // Listener on loading data from service 
      Person.prototype.onFetchCompleted = function (response) {
        var result = response.getContent();

        this.isNew = false;

        for (var key in result) {
          if (result.hasOwnProperty(key)) {
            this[key] = result[key];
          }
        }

        // Dummy event driven support, should be done with more generic way
        this.onFetch && this.onFetch(result);
      };

      // Save entry data to backend
      Person.prototype.save = function () {
        if (this.isNew) {
          var url = "/person";
          var method = "POST";
        } else {
          var url = "/person/" + this.id;
          var method = "PUT";
        }

        var req = new qx.io.remote.Request(url, method, "application/json");
        req.setRequestHeader("Content-Type", "application/json");
        req.setData(this.toJSON());
        req.addListener("completed", this.onSaveCompleted, this);
        req.send();
      };

      // Listener on saving data to service
      Person.prototype.onSaveCompleted = function (response) {
        var result = response.getContent();
        if (result) {
          this.id = result.id;
        }

        // Dummy event driven support, should be done with more generic way
        this.onSave && this.onSave(result);
      };

      // Returns serialized JSON string
      Person.prototype.toJSON = function () {
        return JSON.stringify({
          id: this.id || "",
          fname: this.getFname(),
          lname: this.getLname(),
          dob: this.dob || 0,
          wage: this.getWage(),
          location: this.getLocation()
        });
      };

      // Returns serialized XML string
      Person.prototype.toXML = function () {
        return "<person>" +
        "<id>" + this.id + "</id>"+
        "<fname>" + this.fname + "</fname>"+
        "<lname>" + this.lname + "</lname>"+
        "<dob>" + this.dob + "</dob>"+
        "<wage>" + this.wage + "</wage>"+
        "<location>" + this.location + "</location>"+
        "</person>";
      };

      // Fetches all entry
      Person.fetchAll = function (callback) {
        var url = "/person";
        var req = new qx.io.remote.Request(url, "GET", "application/json");
        req.addListener("completed", function (response) {
          var result = response.getContent();
          callback(result);
        }, this);
        req.send();
      };

      // Document is the application root
      var root = this.getRoot();
      // Container
      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));
      root.add(container, {left: 20, top: 20});

      // Buttons
      var createButton = new qx.ui.form.Button("Create");
      createButton.addListener("execute", function() {
        var model = new Person();
        this.createWindow("Create", this.createForm(model));
      }, this);
      container.add(createButton);

      var loadButton = new qx.ui.form.Button("Load");
      loadButton.addListener("execute", function() {
        var model = new Person();
        this.createWindow("Edit", this.createForm(model, true));
      }, this);
      container.add(loadButton);

      var listButton = new qx.ui.form.Button("List");
      listButton.addListener("execute", function() {
        var that = this;

        Person.fetchAll(function (models) {
          that.createWindow("List", that.createTable(models));
        });

      }, this);
      container.add(listButton);
     },

     /**
      * Creates form for model.
      *
      * @param {Person} model Person instance for which form is created.
      * @param {Boolean} load Flag if form should be rendered in "load" mode.
      * @return {qx.ui.form.renderer.Single} Output widget to be placed somewhere.
      */
     createForm: function (model, load) {
       // Create form object
       var form = new qx.ui.form.Form();

       form.addGroupHeader("Person");
       var idField = new qx.ui.form.TextField();
       var fnameField = new qx.ui.form.TextField();
       var lnameField = new qx.ui.form.TextField();
       var dateField = new qx.ui.form.DateField();

       var format = {
         "US": new qx.util.format.DateFormat("MM/dd/yyyy"),
         "UK": new qx.util.format.DateFormat("dd/MM/yyyy"),
         "AU": new qx.util.format.DateFormat("dd-MM-yyyy")
       };

       dateField.setDateFormat(format[model.getLocation()]);

       var wageField = new qx.ui.form.TextField();
       var locationBox = new qx.ui.form.SelectBox();

       var select = {
         "US": new qx.ui.form.ListItem("US"),
         "UK": new qx.ui.form.ListItem("UK"),
         "AU": new qx.ui.form.ListItem("AU")
       };

       locationBox.add(select["US"]);
       locationBox.add(select["UK"]);
       locationBox.add(select["AU"]);

       locationBox.addListener("changeSelection", function (e) {
         var value = locationBox.getSelection()[0].getLabel();
         dateField.setDateFormat(format[value]);
       });

       form.add(idField, 'id');
       form.add(fnameField, 'fname');
       form.add(lnameField, 'lname');
       form.add(dateField, 'date');
       form.add(wageField, 'wage');
       form.add(locationBox, 'location');

       var updateModel = function () {
         model.fname = fnameField.getValue();
         model.lname = lnameField.getValue();
         model.wage = wageField.getValue();
         if (dateField.getValue()) {
           model.dob = dateField.getValue().getTime();
         }
         model.location = locationBox.getSelection()[0].getLabel();
       };

       var xmlButton = new qx.ui.form.Button("Show XML");
       xmlButton.addListener("execute", function() {
         updateModel();
         this.createWindow('XML',new qx.ui.basic.Label(model.toXML()));
       }, this);
       form.addButton(xmlButton);

       var jsonButton = new qx.ui.form.Button("Show JSON");
       jsonButton.addListener("execute", function() {
         updateModel();
         this.createWindow('JSON', new qx.ui.basic.Label(model.toJSON()));
       }, this);
       form.addButton(jsonButton);

       var saveButton = new qx.ui.form.Button("Save");
       saveButton.addListener("execute", function() {
         if (form.validate()) {
           updateModel();
           model.onSave = function () {
             idField.setValue(model.id);
           };
           model.save();
         }
       }, this);
       form.addButton(saveButton);

       if (load) {
         var loadButton = new qx.ui.form.Button("Load");
         loadButton.addListener("execute", function() {
           // Event Listener fired after fetch is completed
           model.onFetch = function (result) {
             if (typeof result === "string") {
               alert(result);
               return;
             }

             // Make proper fields enabled/disabled
             idField.setEnabled(false);
             fnameField.setEnabled(true);
             lnameField.setEnabled(true);
             dateField.setEnabled(true);
             wageField.setEnabled(true);
             locationBox.setEnabled(true);

             xmlButton.setEnabled(true);
             jsonButton.setEnabled(true);
             saveButton.setEnabled(true);
             // Set values taken from service
             fnameField.setValue(model.getFname());
             lnameField.setValue(model.getLname());
             dateField.setValue(model.getDob());
             wageField.setValue(model.getWage());
             locationBox.setSelection([select[model.getLocation()]]);
           };

           model.fetch(idField.getValue());
         }, this);
         form.addButton(loadButton);
       } else {
         var resetButton = new qx.ui.form.Button("Reset");
         resetButton.addListener("execute", function() {
           form.reset();
         }, this);
         form.addButton(resetButton);
       }

       if (load) {
         idField.setEnabled(true);
         fnameField.setEnabled(false);
         lnameField.setEnabled(false);
         dateField.setEnabled(false);
         wageField.setEnabled(false);
         locationBox.setEnabled(false);

         xmlButton.setEnabled(false);
         jsonButton.setEnabled(false);
         saveButton.setEnabled(false);
       } else {
         idField.setEnabled(false);
       }

       var widget = new qx.ui.form.renderer.Single(form);
       return widget;
     },

     /**
      * Creates table for given models Array.
      *
      * @param {Object[]} models Collection of person objects.
      */
     createTable: function (models) {
       var format = {
         "US": new qx.util.format.DateFormat("MM/dd/yyyy"),
         "UK": new qx.util.format.DateFormat("dd/MM/yyyy"),
         "AU": new qx.util.format.DateFormat("dd-MM-yyyy")
       };

       var data = models.map(function (item) {
         var date = format[item.location || "US"].format(new Date(item.dob));
         return [
           item.id,
           item.fname,
           item.lname,
           date,
           item.wage,
           item.location
         ]
       }); 
       // table model
       var tableModel = new qx.ui.table.model.Simple();
       tableModel.setColumns(["id", "fname", "lname", "DOB", "wage", "location"]);
       tableModel.setData(data);

       var table = new qx.ui.table.Table(tableModel);

       return table;
     },

     /**
      * Creates fancy blue window.
      *
      * @param {String} title Window title.
      * @param {qx.ui.core.Widget} content Widget which will be placed inside window.
      */
     createWindow: function (title, content) {
       var win = new qx.ui.window.Window(title);
       win.setLayout(new qx.ui.layout.Canvas());
       win.add(content, {left: 0, top: 10});
       win.open();
       this.getRoot().add(win, {left: 10, top: 10});
     }
  }
});
