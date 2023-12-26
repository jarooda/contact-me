"use strict"
if (process.env.NODE_ENV != "production") {
  require("dotenv").config()
}

const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

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
    res.status(400).json({
      message: "Missing fields!"
    })
    return
  }

  const mail = {
    from: process.env.SMTP_EMAIL,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Message from ${name} - ${email}`,
    text: message,
    replyTo: email
  }

  transporter.sendMail(mail, (err) => {
    if (err) {
      console.log(err)
      res.status(500).json({
        message: "Something went wrong."
      })
    } else {
      console.log("Email sent!", mail)
      res.status(200).json({
        message: "Email sent!"
      })
    }
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening at ${port}`)
})
