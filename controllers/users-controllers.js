const express = require("express");
const HttpError = require("../models/http-error.js");
const { v4: uuid } = require("uuid");

const dummyData = [
  {
    uid: 1,
    userName: "briwarus",
    email: "warusbrian@gmail.com",
    password: "spike1234",
    overall: { totalGames: 14, wins: 13 },
    opponents: [
      { oid: 2, total: 10, wins: 10 },
      { oid: 3, total: 4, wins: 3 },
    ],
  },
  {
    uid: 2,
    userName: "ruoyann",
    password: "ruoyannie",
    email: "ruoyan@hehe.com",
    overall: { totalGames: 14, wins: 4 },
    opponents: [
      { oid: 1, total: 10, wins: 0 },
      { oid: 3, total: 4, wins: 4 },
    ],
  },
  {
    uid: 3,
    userName: "spike",
    password: "fluffydog",
    email: "cutespike15@gmail.com",
    overall: { totalGames: 14, wins: 80 },
    opponents: [
      { oid: 2, total: 4, wins: 0 },
      { oid: 1, total: 4, wins: 1 },
    ],
  },
];

function getStatsByUid(req, res, next) {
  const userId = req.params.uid;

  console.log("GET request at users userId is: " + userId);
  const user = dummyData.find((u) => u.uid == userId);

  // cannot find user with user id :(
  if (!user) {
    console.log("error cannot find user");
    return next(new HttpError("Could not find user for the user id", 404));
  }

  res.json({ overall: user.overall, opponents: user.opponents });
}

function signup(req, res, next) {
  console.log("POST request at users signup");
  const { userName, email, password } = req.body;
  const id = uuid();
  console.log(id);
  const user = {
    id: id,
    userName: userName,
    email: email,
    password: password,
  };
  res.status(200).json(user);
}

function login(req, res, next) {
  console.log("POST request at users signup");
  const { userName, password } = req.body;
  const identifiedUser = dummyData.find((u) => u.userName === userName);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not find user, credentials seem to be wrong.",
      404
    );
  }
  res.status(200).json(identifiedUser);
}

exports.getStatsByUid = getStatsByUid;
exports.signup = signup;
exports.login = login;
