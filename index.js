const express = require('express')
const morgan = require('morgan')
const app = express()

const cors = require('cors')

app.use(cors())

app.use(express.json())

morgan.token('postReqObj', (req, res) => {
    return JSON.stringify(req.body)
})

app.use(morgan(function (tokens, req, res) {
    var logObj = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms '
    ].join(' ')

    if(tokens.method(req, res).localeCompare('POST') === 0) {
        logObj = logObj.concat(tokens.postReqObj(req, res))
    }
    return logObj
}))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Homepage</h1>')
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/info', (req, res) => {
    var dateTime = new Date()
    
    res.send(`
        Phonebook has info for ${persons.length} people
        <br /><br />
        ${dateTime.toDateString()}  ${dateTime.toTimeString()}
    `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

const generateId = () => {
    const getRandomInt = (mx) => {
        return Math.floor(Math.random() * mx)
    }

    return getRandomInt(persons.length * 1000)
}

app.post('/api/persons', (request, response) => {
    const body = request.body

    if(!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    } else if(!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    if(persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        }) 
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})