/*
    defines an object which contains functions executed as callback
    when a client requests for `index` paths in the server
*/
const controller = {
    /*
        executed when the client sends an HTTP GET request `/`
        as defined in `../routes/routes.js`
    */
    getIndex: function (req, res) {
        // render `../views/index.hbs`
        res.render('index',{active:'index', position:'Guest'});
    },

    userIndex: async function (req, res) {
        if (req.session.position === 'Customer') {
            // Redirect to login page if not authenticated
            var details = {
                active:'index',
                position: req.session.position
            };
            
            res.render('index',details);
        }
        else{
            res.redirect('/');
        }
    }
}

/*
    exports the object `controller` (defined above)
    when another script exports from this file
*/
module.exports = controller;