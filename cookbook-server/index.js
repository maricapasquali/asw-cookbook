const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const {Hosting} = require("../modules/hosting")
const {port_server, client_origin} = require("../modules/hosting/variables")

app.use(express.json());
app.use(cors({ origin: client_origin })) //used to enable HTTPS requests from a different source

/**
 * DATABASE CONNECTION
 */
require("./database").connect()

/**
 * ROUTES
 */
require('./routes')(app)

/**
 * SHOW REST API DOCUMENTATIONS
 */
const YAML = require("yamljs")
const swaggerUi = require('swagger-ui-express');
const swaggerCookbookAPI = YAML.load(path.join(__dirname, 'api-docs/api-documentations.yaml'));
app.use('/api-docs', swaggerUi.serveFiles(swaggerCookbookAPI, {}), swaggerUi.setup(swaggerCookbookAPI));

/**
 * ROUTE NOT FOUND
 */
app.use(function (req, res) {
    res.status(404).json({ error: { description: req.originalUrl + " not found" } });
});

/**
 * SERVER INIT
 */
new Hosting(app)
    .setHttpsOptions(() => {
        return {
            key: fs.readFileSync(path.join(__dirname,"sslcert", "privatekey.pem")),
            cert: fs.readFileSync(path.join(__dirname,"sslcert", "cert.pem"))
        }
    })
    .setPort(port_server)
    .build()
    .listen((server) => {
        console.log(`Server running at ${server.protocol}://${server.hostname}:${server.port}/api-docs`);
    });
