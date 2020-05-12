const db = require("../../data/dbConfig.js")

// gets all the accounts from the database
function getAccounts(){
    return db('accounts')
}

// gets an account by id
function getAccountById(id){
    return db('accounts')
        .where({ id })
        .first()
}

// inserts new account to the database
function insertAccount(account){
    return db('accounts')
        .insert(account)
        .then(id => {
            // this returns an array containing the id of the posted account
            return getById(id[0])
        })
}

// updates account already in database
function updateAccount(id, changes){
    return db('accounts')
        .where({id})
        .update(changes)
}

// deletes an account from the database
function removeAccount(id){
    return db('accounts')
        .where('id', id)
        .del()
}

module.exports = {
    getAccounts,
    insertAccount,
    getAccountById,
    updateAccount,
    removeAccount
}
