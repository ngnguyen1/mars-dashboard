require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

app.get('/rovers/:name', async (req, res) => {
  try {
    const { name: roverName } = req.params
    if (!['curiosity', 'opportunity', 'spirit', 'perseverance'].includes(roverName.toLowerCase())) {
      return res.status(404).send('Rover not found');
    }
    let response = await fetch(`${process.env.API_URL}/mars-photos/api/v1/rovers/${roverName}/latest_photos?api_key=${process.env.API_KEY}`)
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let images = await response.json()
    res.status(200).send(images); 
  } catch (err) {
    console.error('Error fetching rover data:', err);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/apod', async (req, res) => {
  try {
    let image = await fetch(`${process.env.API_URL}/planetary/apod?api_key=${process.env.API_KEY}`)
      .then(res => res.json())
    res.send({ image })
  } catch (err) {
    console.log('error:', err);
  }
})

app.listen(port, () => console.log(`Mars Dasboard app listening on port ${port}!`))