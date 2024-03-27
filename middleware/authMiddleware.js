import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next)=>{
    const authHeader = req.headers.authorization
    if(authHeader === null || authHeader === undefined){
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const token = authHeader.split(" ")[1];
    // console.log(token)

    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err){
            return res.status(300).json({
                success: false,
                message: "Unauthorized"
            })
        }

       req.user = user;
       next();
    })
}

export default authMiddleware;