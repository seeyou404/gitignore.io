'use strict';


var DatastoreModel = require('../../models/datastore');

module.exports = function(router) {
    /*
     * GET List of all ignore types
     */
    router.get('/list', function(req, res) {
        var format = req.query.format;
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.setHeader('Expires', new Date(Date.now()).toUTCString());
        if (format === 'json') {
            res.json(DatastoreModel.JSONObject);
            return;
        }
        res.setHeader('Content-Type', 'text/plain');
        if (format === 'lines') {
            res.send(DatastoreModel.JSONStringLines);
            return;
        }
        res.send(DatastoreModel.JSONString);
    });
    /*
     * GET API page.
     */
    router.get('/(:ignore)', function(req, res) {
        var ignoreString = req.params.ignore.toLowerCase();
        var ignoreFileList = ignoreString.split(',');
        var output = generateFile(ignoreString, ignoreFileList);
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Expires', new Date(Date.now()).toUTCString());
        res.send(output);
    });
    /*
     * POST API File
     */
    router.get('/f/(:ignore)', function(req, res) {
        var ignoreString = req.params.ignore.toLowerCase();
        var ignoreFileList = ignoreString.split(',');
        var output = generateFile(ignoreString, ignoreFileList);
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Expires', new Date(Date.now()).toUTCString());
        res.setHeader('Content-Disposition', 'attachment; filename=".gitignore"');
        res.send(output);
    });

    /*
     * GET CLI Help.
     */
    router.get('/*', function(req, res) {
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.setHeader('Expires', new Date(Date.now()).toUTCString());
        res.send('gitignore.io help:\n  list    - lists the operating systems, programming languages and IDE input types\n  :types: - creates .gitignore files for types of operating systems, programming languages or IDEs\n');

    });
};

/*
 * Helper for generating concatenated gitignore templates
 */
function generateFile(ignoreString, list) {
    var output = '\n# Created by https://www.gitignore.io/api/' + ignoreString + '\n';
    list = orderFiles(list);
    for (var file in list) {
        if (DatastoreModel.JSONObject[list[file]] === undefined) {
            output += '\n#!! ERROR: ' + list[file] + ' is undefined. Use list command to see defined gitignore types !!#\n';
        } else {
            output += '\n### ' + DatastoreModel.JSONObject[list[file]].name + ' ###\n';
            output += DatastoreModel.JSONObject[list[file]].contents + (file < list.length - 1 ? '\n' : '');
        }
    }
    return removeDuplicates(output);
}

function orderFiles(list) {
    var order = DatastoreModel.order;
    list = list.sort(function(l, r) {
        return (order[l] || 0) - (order[r] || 0);
    });
    return list;
}

function removeDuplicates(gitignore) {
    // split string into lines
    var lines = gitignore.split(/\n/);
    // eliminate duplicate lines, except blank strings or comment strings
    var seen = {};
    lines = lines.filter(
        function(line) {
            if (line !== '' && line[0] !== '#') {
                return seen.hasOwnProperty(line) ? false : (seen[line] = true);
            } else {
                return true;
            }
        }
    );
    return lines.join('\n');
}
