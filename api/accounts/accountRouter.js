const express = require('express');
const router = express.Router();
const accountData = require('./accountHelperFunctions');

router.get('/', (req, res) => {
    accountData.getAccounts()
        .then(accounts => res.status(200).json(accounts))
        .catch(() => res.status(500).json({ message: 'Accounts could not be retrieved' }))
})

router.post('/' , validateAccount, (req, res) => {
    accountData.insertAccount(req.body)
        .then(newAccount => res.status(200).json(newAccount))
        .catch(err => res.status(500).json({ message: 'The account could not be inserted into the database.'}))
})

router.put('/:id', validateAccount, validateAccountId, (req, res) => {
    accountData.updateAccount(req.params.id, req.body)
        .then(() => {
            accountData.getById(req.params.id)
            .then(account => res.status(200).json(account))
            .catch(err => res.status(500).json({ message: 'The account could not be updated.'}))
        });
})

router.delete('/:id', validateAccountId, (req, res) => {
    accountData.removeAccount(req.params.id)
        .then(() => res.status(200).json({ message: 'The account has been deleted' }))
        .catch(err => res.status(500).json(err))
})

// middleware


module.exports = router;