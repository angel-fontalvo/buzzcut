var express = require('express'),
    router = express.Router();

router.get('/', function (req, res, next) {
    res.render('object-detection', { title: 'Object Detection' });
});

module.exports = router;