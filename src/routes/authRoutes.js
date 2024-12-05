 import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

//Register a new user endpoint /auth/register
router.post('/register',async(req,res)=>{
    const {username,password} = req.body
    // save the username and an irreversibly encrypted password
    // save yashar@gmail.com | jvfdnddvndfvnp..vdfnklnv..;sn

    //encrypt the password
    const hashedPassword = bcrypt.hashSync(password,8)

    //save the new user and hashed passwod
    try {
            const user = await prisma.user.create({
                data:{
                    username,
                    password : hashedPassword,

                }
            })

        // now that we have a user, I want to add their first todo for them

        const defaultTodo = `Hello:) Add your first todo!`
            await prisma.todo.create({
                data:{
                    task : defaultTodo,
                    userId : user.id
                }
            })


        // create a token
        const token = jwt.sign({id:user.id},process.env.JWT_SECRET,
            {expiresIn:'24h'})
            res.json({ token })
    } catch (error) {
        console.log(error.message)
        res.sendStatus(503)
    }


})
//
router.post('/login',async(req,res)=>{
    // we get their email, and we look up the password associated with that emial in the database
    //but we get it back and see it's encrypted, which means that we cannot compaire it to the one the user just used trying to login
    //so what we have to do, is again one way encrypt the password the user just entered
    const {username,password} = req.body
     try {
        const user = await prisma.user.findUnique({
            where: {
                username : username
            }
        })
        // if we cannot find a user associated with that uaername, return out from function
        if (!user) {
            return res.status(404).send({message : "user not found"})
        }

        const passwodIsValid = bcrypt.compareSync(password,user.password)
        // if the password does not match, return out of the function
        if (!passwodIsValid) {
            return res.status(401).send({message : "Invalid Password"})
        }
        console.log(user)
        //then we have a successful authentication

        const token = jwt.sign({id: user.id},process.env.JWT_SECRET,{
            expiresIn: '24h'})
            res.json({token})

     } catch (error) {
        console.log(error.message)
        res.sendStatus(503)
     }
})

export default router
