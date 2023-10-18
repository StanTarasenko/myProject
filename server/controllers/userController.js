const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

const generateJwt = (id, email, role) => {
  return jwt.sign(
    { id, email, role }, 
    process.env.SECRET_KEY, 
    { expiresIn: '24h' }
  )
}

class UserController {
  async registration(req, res, next) {
    const { email, password, role } = req.body
    if (!email || !password) {
      next(ApiError.badRequest('Email and password are require!'))
    }
    const candidate = await User.findOne({ where: { email }})
    if (candidate) {
      next(ApiError.badRequest('This email already in use!'))
    }
    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({ email, role, password: hashPassword })
    const jsonwebtoken = generateJwt(user.id, user.email, user.role)
    return res.json({ jsonwebtoken })  
  }

  async login(req, res) {

  }
  async check(req, res, next) {
    const { id } = req.query
    if (!id) {
      return next(ApiError.badRequest('No ID'))
    }
    res.json(id)
  }
};

module.exports = new UserController();
