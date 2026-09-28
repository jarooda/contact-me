"use strict"
if (process.env.NODE_ENV != "production") {
  require("dotenv").config()
}

const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const j = require("jalutils")
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

  const bodyMessage = `
  name: ${j.capitalize(name)}
message: ${message}
`

  const mail = {
    from: process.env.SMTP_EMAIL,
    to: process.env.RECIPIENT_EMAIL,
    subject: `Message from ${email}`,
    text: bodyMessage,
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

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
// location
const LAT = process.env.LAT;
const LON = process.env.LONG;

app.get("/api/weather", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`OpenWeather error: ${response.status}`);
    }

    const data = await response.json();

    if (!("refresh" in req.query)) {
      res.set(
        "Cache-Control",
        "public, s-maxage=3600, stale-while-revalidate=86400"
      );
    }

    const {
      weather,
      main,
      visibility,
      wind,
      clouds,
      sys,
    } = data

    res.json({
      weather,
      main,
      visibility,
      wind,
      clouds,
      sys
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch weather",
    });
  }
});


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App listening at ${port}`)
})
