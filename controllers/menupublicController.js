/*
    defines an object which contains functions executed as callback
    when a client requests for `menu-public` paths in the server
*/
const menupublicController = {
    getMenuPublic: function (req, res) {
        res.render('menu-public');
    }
}

/*
    exports the object `menupublicController` (defined above)
    when another script exports from this file
*/
module.exports = menupublicController;