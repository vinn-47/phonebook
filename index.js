require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
const cors = require('cors')

app.use(cors())

app.use(express.static('build'))

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

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformed id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }

    next(error)
}

// let persons = [
//     { 
//       "id": 1,
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": 2,
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": 3,
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": 4,
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     }
// ]

app.get('/', (req, res) => {
    res.send('<h1>Homepage</h1>')
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (req, res) => {
    var dateTime = new Date()
    const len = Person.length
    res.send(`
        Phonebook has info for ${len} people
        <br /><br />
        ${dateTime.toDateString()}  ${dateTime.toTimeString()}
    `)
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

// const generateId = () => {
//     const getRandomInt = (mx) => {
//         return Math.floor(Math.random() * mx)
//     }

//     return getRandomInt(persons.length * 1000)
// }

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Person.findByIdAndUpdate(request.params.id, 
            { name, numeber }, 
            { new: true, runValidators: true, context: 'query' }
        )
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if(persons.find(person => person.name === body.name)) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     }) 
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    })
    
    person.save()
    .then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})