var assert = require('assert')
const { bot, router } = require('../build/app.js')

describe('App',() => {
    context('Bot', () => {
        it('token should exist', () => {
            assert.notEqual(typeof process.env.YKSTEST_TOKEN, undefined)
        })
        it('bot should exist', () => {
            assert.notEqual(bot,null)
        })
    })
})