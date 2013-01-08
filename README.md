# README

1. Frontend

Frontend was build using http://qooxdoo.org/ framework.

To prepare frontend dependenties please run:

```bash
cd frontend/
./generate.py source
```

That will prepare code for running in browser for more details please see:
http://manual.qooxdoo.org/current/pages/tool/generator/generator_usage.html

So then u can open directly file frontend/source/index.html

But if u want to see builded production version u need to run:

```bash
cd frontend/
./generate.py build
```

Then code will be optimize and put into build directory.



2. Backend

To run node app u need to install following dependenties:
 * expressjs (npm install express)
 * libxmljs (npm install libxmljs) 

To run node app please run:

```bash
node server/app.js
```

Default port is 3000 and for changing it please look into server/config.js.
