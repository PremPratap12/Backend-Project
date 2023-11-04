const express = require("express")
const { createUser, loginUserCtrl, getallUser, getUser, deleteUser, updatedUser, blockUser, unblockUser, handleRefreshToken, logout } = require("../controller/userCtrl")
const router = express.Router()
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")

router.post("/register", createUser)
router.post("/login", loginUserCtrl)
router.get("/all-users", getallUser)
router.get("/refresh", handleRefreshToken)
router.get("/logout", logout)

router.get("/:id", authMiddleware, isAdmin, getUser)
router.delete("/:id", deleteUser)
router.put("/edit-user", authMiddleware, updatedUser)
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser)
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser)

module.exports = router