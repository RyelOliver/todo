const ToDoModel = require('./ToDoModel')
const ToDoCollection = require('./ToDoCollection')

describe('To do items list', () => {
  const toDoList = new ToDoCollection()
  beforeEach(() => {
    toDoList.reset([
      new ToDoModel({
        id: 1,
        description: 'Apple',
        order: 1
      }),
      new ToDoModel({
        id: 2,
        description: 'Orange',
        order: 3
      }),
      new ToDoModel({
        id: 3,
        description: 'Banana',
        order: 2
      })
    ])
  })
  
  it('Should sort by order', () => {
    expect(toDoList.pluck('id')).toStrictEqual([1, 3, 2])
    expect(toDoList.pluck('description')).toStrictEqual(['Apple', 'Banana', 'Orange'])
  })
  
  it('Should get the next ID', () => {
    expect(toDoList.nextId()).toBe(4)

    toDoList.reset()
    expect(toDoList.nextId()).toBe(1)
  })
})