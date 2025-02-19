const createError = require("../utils/createError");
const prisma = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tryCatch = require("../utils/tryCatch");

function checkEmailorMobile(identity) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10,15}$/;

  let identityKey = "";
  if (emailRegex.test(identity)) {
    identityKey = "email";
  }
  if (mobileRegex.test(identity)) {
    identityKey = "mobile";
  }
  if (!identityKey) {
    createError(400, "Only Email or Mobile Phone");
  }
  return identityKey;
}

module.exports.register = tryCatch(async (req, res, next) => {
  const { identity, firstName, lastName, password, confirmPassword } = req.body;
  // validation
  if (
    !(
      identity.trim() &&
      firstName.trim() &&
      lastName.trim() &&
      password.trim() &&
      confirmPassword.trim()
    )
  ) {
    return createError(400, "Please fill all data");
  }

  if (password !== confirmPassword) {
    return createError(400, "Please check confirm-password");
  }

  const identityKey = checkEmailorMobile(identity);

  // find user ?
  const findIdentity = await prisma.user.findUnique({
    where: { [identityKey]: identity },
  });

  if (findIdentity) {
    return createError(409, "Already have this User");
  }

  const newUser = {
    [identityKey]: identity,
    password: await bcrypt.hash(password, 10),
    firstName: firstName,
    lastName: lastName,
  };
  console.log(newUser);

  const result = await prisma.user.create({
    data: newUser,
  });
  console.log(result);
  res.json({ msg: `Register Successful`, result });
});

module.exports.login = tryCatch(async (req, res, next) => {
  const { identity, password } = req.body;

  if (!identity.trim() || !password.trim()) {
    return createError(400, "Please fill all data");
  }

  const identityKey = checkEmailorMobile(identity);

  const foundUser = await prisma.user.findUnique({
    where: { [identityKey]: identity },
  });

  if (!foundUser) {
    return createError(401, "Invalid Login");
  }

  let pwOk = await bcrypt.compare(password, foundUser.password);

  if (!pwOk) {
    return createError(401, "Invalid Login");
  }

  // create jwt token
  const payload = { id: foundUser.id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  const {password: pw, createdAt, updatedAt, ...userData } = foundUser

  res.json({
    msg: "Login successful",
    user: userData,
    token: token,
  });
});

module.exports.getMe = (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
