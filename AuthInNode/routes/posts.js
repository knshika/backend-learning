const router = require('express').Router();
const token = require('./verifyToken');

router.get('/',token,(req,res)=>{
    //res.send(req.user);
    res.json({
        posts:{
            title:"Not a title",
            description:"Nothing"
        }
       
    })
})

module.exports = router;