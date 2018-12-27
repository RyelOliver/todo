const Backbone = require('backbone')

const ToDoModel = require('./ToDoModel')
const ToDoCollection = require('./ToDoCollection')
const ToDoCollectionView = require('./ToDoCollectionView')

const toDoList = new ToDoCollection()
const toDoListView = new ToDoCollectionView({
  collection: toDoList
})

document.querySelector('#toDoList').append(toDoListView.render().el)

toDoList.reset([
  new ToDoModel({
    id: 1,
    description: 'One, two',
    order: 1
  }),
  new ToDoModel({
    id: 2,
    description: 'Skip a few',
    order: 2
  }),
  new ToDoModel({
    id: 3,
    description: 'Banana',
    order: 4
  }),
  new ToDoModel({
    id: 4,
    description: 'Ninety nine',
    order: 3
  })
])