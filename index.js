"use strict"
if (process.env.NODE_ENV != "production") {
  require("dotenv").config()
}

const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const app = express()

app.use(
  cors({
    origin: process.env.ALLOWED_CLIENT
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
})

// verify connection configuration
transporter.verify(function (error) {
  if (error) {
    console.log(error)
  } else {
    console.log("Server is ready to take our messages")
  }
})

app.post("/send", (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    res.status(400).send("Missing fields!")
  }

  const mail = {
    from: name,
    to: process.env.SMTP_EMAIL,
    subject: `Message from ${ name } - ${ email }`,
    text: message,
    replyTo: email
  }

  transporter.sendMail(mail, (err ) => {
    if (err) {
      console.log(err)
      res.status(500).send("Something went wrong.")
    } else {
      res.status(200).send("Email successfully sent to recipient!")
    }
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening at ${port}`)
})
