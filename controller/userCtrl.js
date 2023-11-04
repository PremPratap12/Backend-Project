const { generateToken } = require("../config/jwtToken.js")
const User = require("../models/userModel.js")
const asyncHandler = require("express-async-handler")
const validateMongoDbId = require("../utils/validateMongodbId")
const { generateRefreshToken } = require("../config/refreshToken.js")
const jwt = require("jsonwebtoken")

// Create a User ----------------------------------------------
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        throw new Error("User Already Exists")
    }
})

//Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    //check if user exists or not
    const findUser = await User.findOne({ email })
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser?._id)
        const updatedUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true
            }
        )
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?._id,
            firstName: findUser?.firstName,
            lastName: findUser?.lastName,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id)
        })
    } else {
        throw new Error("Invalid Credentials")
    }
})

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("No Refresh token present in db or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token")
        }
        const accessToken = generateToken(user?._id)
        res.json({ accessToken })
    })
})

//logout functionality
const logout = asyncHandler(async (req, res) => {
    const cookie = req.cookies
    if (!cookie?.refreshToken) throw new Error("No refresh Token in Cookies")
    const refreshToken = cookie.refreshToken
    const user = await User.findOne({ refreshToken })
    if (!user) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
        return res.status(204) //forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: ""
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    })
    return res.sendStatus(204) //forbidden
})


//Update a user
const updatedUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    validateMongoDbId(_id)
    try {
        const updateUser = await User.findByIdAndUpdate(_id, {
            firstName: req?.body.firstName,
            lastName: req?.body.lastName,
            email: req?.body.email,
            mobile: req?.body.mobile
        },
            { new: true }
        )
        res.json(updateUser)
    } catch (error) {
        throw new Error(error)
    }
})


//Get all users
const getallUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find()
        res.json(getUsers)

    } catch (error) {
        throw new Error(error)

    }
})

//Get a single user
const getUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const getUser = await User.findById(id)
        res.json({
            getUser
        })
    } catch (error) {
        throw new Error(error)

    }
})

//Get a single user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteUser = await User.findByIdAndDelete(id)
        res.json({
            deleteUser
        })
    } catch (error) {
        throw new Error(error)

    }
})

//block user
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        },
            {
                new: true
            }
        )
        res.json({
            message: "User Blocked"
        })

    } catch (error) {
        throw new Error(error)
    }
})

//unblock user
const unblockUser = asyncHandler(async (req, res) => {
    const { id } = req.params
    validateMongoDbId(id)
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        },
            {
                new: true
            }
        )
        res.json({
            message: "User UnBlocked"
        })
    } catch (error) {
        throw new Error(error)
    }
})

module.exports = { createUser, loginUserCtrl, getallUser, getUser, deleteUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout }