/********************************************************************************
*  WEB422 – Assignment 1
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: ________John Wu_______ Student ID: _____186922233_________ Date: ______5/19________
*
*  Published URL on Render:  
*
********************************************************************************/


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const SitesDB = require("./modules/sitesDB");
const db = new SitesDB();

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "API Listening",
        term: "Summer 2025",
        student: "John Wu"
    });
});



// POST /api/sites
app.post("/api/sites", (req, res) => {
    const newData = req.body;

    db.addNewSite(newData)
        .then(newSite => {
            res.status(201).json(newSite); // 201 Created
        })
        .catch(err => {
            res.status(500).json({ "message": err.message }); // 500 Server Error
        });
});

// GET /api/sites
app.get("/api/sites", (req, res) => {
    const page = parseInt(req.query.page);
    const perPage = parseInt(req.query.perPage);
    const name = req.query.name;
    const region = req.query.region;
    const provinceOrTerritoryName = req.query.provinceOrTerritory;

    db.getAllSites(page, perPage, name, region, provinceOrTerritoryName)
        .then(sites => {
            if (sites && sites.length > 0) {
                res.json(sites);
            } else if (sites && sites.length === 0) {
                res.status(200).json([]); // Or, we could send 404 if you prefer no results to be an error
            }
        })
        .catch(err => {
            if (err.message === 'page and perPage query parameters must be valid numbers') {
                res.status(400).json({ "message": err.message }); // 400 Bad Request
            } else {
                res.status(500).json({ "message": err.message }); // 500 Server Error (or err if you don't want to expose the message)
            }
        });
});

// GET /api/sites/:id
app.get("/api/sites/:id", (req, res) => {
    const id = req.params.id;

    db.getSiteById(id)
        .then(site => {
            if (site) {
                res.json(site);
            } else {
                res.status(404).json({ "message": "Site not found" }); // no found 
            }
        })
        .catch(err => {
            res.status(500).json({ "message": err.message }); //server error
        });
});

// PUT /api/sites/:id
app.put("/api/sites/:id", (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;

    db.updateSiteById(updatedData, id)
        .then(updateResult => {
            if (updateResult && updateResult.modifiedCount > 0) {
                return db.getSiteById(id); // Fetch the updated document
            } else {
                res.status(404).json({ "message": "Site not found" }); //no found
            }
        })
        .then(updatedSite => {
            if (updatedSite) {
                res.json(updatedSite);
            }
        })
        .catch(err => {
            res.status(500).json({ "message": err.message }); //Server Error
        });
});

// DELETE /api/sites/:id
app.delete("/api/sites/:id", (req, res) => {
    const id = req.params.id;

    db.deleteSiteById(id)
        .then(deleteResult => {
            if (deleteResult && deleteResult.deletedCount > 0) {
                res.status(204).send();  // 204 No Content (successful delete)
            } else {
                res.status(404).json({ "message": "Site not found" }); //no found
            }
        })
        .catch(err => {
            res.status(500).json({ "message": err.message }); //Server Error
        });
});


db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err) => {
    console.log("MongoDB connection error:", err);
});



// // START SERVER (only after DB initialized — we’ll add that later)
// app.listen(HTTP_PORT, () => {
//     console.log(`Server listening on port ${HTTP_PORT}`);
// });
