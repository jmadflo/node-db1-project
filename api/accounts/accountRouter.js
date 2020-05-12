const express = require('express')
const router = express.Router()
const accountData = require('../../data/dbConfig.js')

// gets all the accounts from the database
router.get('/', (req, res) => {
    // if we have these queries, use them to alter our displayed list of accounts
    if (req.query.limit && req.query.sortby && req.query.sortdir){
        accountData('accounts').orderBy(req.query.sortby, req.query.sortdir).limit(parseInt(req.query.limit))
            .then(accounts => {
                res.status(200).json(accounts)
            }) 
            .catch (() => {
                res.status(500).json({ message: 'Accounts could not be retrieved' })
            })
    } else {
        accountData('accounts')
            .then(accounts => {
                res.status(200).json(accounts)
            }) 
            .catch (() => {
                res.status(500).json({ message: 'Accounts could not be retrieved' })
            })
    }
})

// I already got the account when I validated the id and stored it in req.account
router.get('/:id', validateAccountId, (req, res) => {
    res.status(200).json(req.account)
})

// inserts new account to the database
router.post('/' , validateAccount, verifyUniqueName, (req, res) => {
    accountData('accounts')
        .insert(req.body)
            .then(accountId => {
                // this returns an array containing the id of the posted account. I've called it accountId
                accountData('accounts').where({id: accountId[0]}).first()
                    // now I want to return the inserted account
                    .then(account => {
                        res.status(200).json(account)
                    })
                    .catch(() => {
                        res.status(500).json({ message: 'The account was inserted, but could not be returned'})
                    })
            })
            .catch(() => {
                res.status(500).json({ message: `The account with id of ${req.params.id} could not be inserted`})
            })
})

// updates account already in database
router.put('/:id', validateAccount, validateAccountId, verifyUniqueName, (req, res) => {
    accountData('accounts').where({ id: req.params.id }).update(req.body)
        .then(numberOfAccountsUpdated => {
            if (numberOfAccountsUpdated === 1) {
                // retrieve the account that was updated and return it to the client
                accountData('accounts').where({ id: req.params.id }).first()
                    .then(account => {
                        res.status(200).json(account)
                    })
                    .catch(() => {
                        res.status(500).json({ message: `The account with id of ${req.params.id} could not be retrieved after being updated`})
                    })
            } else {
                res.status(500).json({ message: `The account with id of ${req.params.id} could not be updated`})
            }
        })
        .catch(() => {
            res.status(500).json({ message: `The account with id of ${req.params.id} could not be updated`})
        })
})

// deletes an account from the database
router.delete('/:id', validateAccountId, (req, res) => {
    accountData('accounts').where({ id: req.params.id }).del()
        .then(() => res.status(200).json({ message: `The account with id of ${req.params.id} has been deleted` }))
        .catch(() => res.status(500).json({ message: `The account with id of ${req.params.id} could not be deleted`}))
})

// middleware

function validateAccountId(req, res, next) {
    // get account with the params id and assign it to req.account, otherwise return a 400 error
    accountData('accounts')
        .where({id: parseInt(req.params.id)}).first()
            .then(account => {
                    req.account = account
                    next()
            })
            .catch(() => {
                    res.status(400).json({ message: 'You requested with an invalid account id' })
            })
}

function verifyUniqueName(req, res, next) {
    // get account with the name and if there is none then that means the incoming post is unique, otherwise return a 400 error
    // this allows for name to be the same as the name of the account being updated, but no others
    accountData('accounts')
        .where({ name: req.body.name })
            .then(accountWithSameNameAsRequestBody => {
                if (accountWithSameNameAsRequestBody.length === 1 && parseInt(req.params.id) ===  accountWithSameNameAsRequestBody[0].id || accountWithSameNameAsRequestBody.length === 0) {
                    next()
                } else {
                    res.status(400).json({ message: 'The new name must be unique to this account' })
                }
            })
            .catch(() => {
                    res.status(400).json({ message: 'You requested with an invalid account id' })
            })
}
  
function validateAccount(req, res, next) {
    // send 400 error if req.body is missing, if req.body.name is missing, or if req.body.budget is missing
    if (!req.body){
        res.status(400).json({ message: 'missing account data' })
    } else if (!req.body.name){
        res.status(400).json({ message: 'missing required name field' })
    } else if (!req.body.budget){
        res.status(400).json({ message: 'missing required budget field' })
    } else {
        next()
    }
}

module.exports = router