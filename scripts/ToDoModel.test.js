const ToDoModel = require('./ToDoModel')

describe('To do items', () => {
  let toDo
  beforeEach(() => {
    toDo = new ToDoModel({
      id: 1,
      description: 'One',
      order: 1
    })
  })
  
  it('Should default to not done', () => {
    expect(toDo.get('done')).toBeFalsy()
  })
  
  it('Should be set to done when toggled from not done and not done when toggled from done', () => {
    toDo.toggle()
    expect(toDo.get('done')).toBeTruthy()
    
    toDo.toggle()
    expect(toDo.get('done')).toBeFalsy()
  })

  it('Should have a changed description when edited', () => {
    toDo.editDescription('Two')
    expect(toDo.get('description')).toBe('Two')
  })
  
  describe('When validated', () => {
    it('Requires an ID', () => {
      toDo.set('id', undefined)
      expect(() => {
        toDo.isValid()
      }).toThrowError('ID is required')
    })
    
    it('Requires a description', () => {
      toDo.set('description', undefined)
      expect(() => {
        toDo.isValid()
      }).toThrowError('Description is required')
    })

    it('Requires a description to be more than whitespace', () => {
      toDo.set('description', ' ')
      expect(() => {
        toDo.isValid()
      }).toThrowError('Description is required')
    })
    
    it('Requires a done boolean', () => {
      toDo.set('done', undefined)
      expect(() => {
        toDo.isValid()
      }).toThrowError('Done boolean is required')
    })
    
    it('Requires an order', () => {
      toDo.set('order', undefined)
      expect(() => {
        toDo.isValid()
      }).toThrowError('Order is required')
    })
  })
})