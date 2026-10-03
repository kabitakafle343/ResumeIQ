const { userLogin, userLogout, userSignUp } = require("../controller/user");
const { refreshAccessToken } = require("../middleware/auth");

const routes=require("express").Router();

routes.post("/login",userLogin),
routes.post("/signup",userSignUp),
routes.post("/logout",userLogout),
routes.post("/refresh",refreshAccessToken)


module.exports=routes