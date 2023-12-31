const asyncHandler = require("express-async-handler")
const Product = require("../models/productModel")
const { default: slugify } = require("slugify")

const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body)
        res.json(newProduct)
    } catch (error) {
        throw new Error(error)
    }
})

const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const updateProduct = await Product.findOneAndUpdate(id, req.body, { new: true })
        res.json(updateProduct)
    } catch (error) {
        throw new Error(error)
    }
})

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteProduct = await Product.findByIdAndDelete(id)
        res.json(deleteProduct)
    } catch (error) {
        throw new Error(error)
    }
})

const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const findProduct = await Product.findById(id)
        res.json(findProduct)

    } catch (error) {
        throw new Error(error)
    }
})

const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // const getAllProduct = await Product.find()
        // res.json(getAllProduct)

        // Filtering
        const queryObj = { ...req.query }
        const excludeFields = ["page", "sort", "limit", "fields"]
        excludeFields.forEach(el => delete queryObj[el])
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `${match}`)

        let query = Product.find(JSON.parse(queryStr))

        // Sorting 
        if (req.query.sort) {
            const sortBy = req.query.sort.spilt(",").join("")
            query = query.sort(sortBy)
        } else {
            query = query.sort("-createdAt")
        }

        // limiting the fields

        if (req.query.fields) {
            const fields = req.query.fields.split(",").join("")
            query = query.select(fields)
        } else {
            query = query.select("-__v")
        }

        // Pagination
        const page = req.query.page
        const limit = req.query.limit
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)
        if (req.query.page) {
            const productCount = Product.countDocuments()
            if (skip >= productCount) throw new Error("This Page does not exists")
        }

        console.log(page, limit, skip);

        // const getallProducts = await Product.where("category").equals(
        //     req.query.category
        // )
        // res.json(getallProducts)

        const product = await query
        res.json(product)

    } catch (error) {
        throw new Error(error)
    }
})

module.exports = { createProduct, getProduct, getAllProduct, updateProduct, deleteProduct }