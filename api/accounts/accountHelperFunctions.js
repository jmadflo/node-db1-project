const db = require("../data/dbConfig.js")

// Db gets all the accounts from the database
function get(){
    return db('accounts')
}

function insertAccount(account){
    return db('accounts')
        .insert(account)
        .then(id => {
            // this returns an array containing the id of the posted account
            return getById(id[0])
        })
}

module.exports = {
    get,
    insert
}
