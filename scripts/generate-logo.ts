const { createCanvas } = require('canvas')
const fs = require('fs')

const size = 192
const canvas = createCanvas(size, size)
const ctx = canvas.getContext('2d')

// Set background
ctx.fillStyle = '#2B5335'  // Your brand green
ctx.fillRect(0, 0, size, size)

// Add text
ctx.fillStyle = '#FFFFFF'
ctx.font = 'bold 30px Inter'  // Reduced from 48px to 30px
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('CarPooly', size/2, size/2)

// Save to file
const out = fs.createWriteStream('public/logo-192.png')
const stream = canvas.createPNGStream()
stream.pipe(out) 