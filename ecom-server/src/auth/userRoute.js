var express = require('express');
var router = express.Router();
const authController = require('./user.controller');

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/verifyEmail', authController.verifyEmail);
router.get('/checkEmail', authController.checkEmailExistence);
module.exports = router;
