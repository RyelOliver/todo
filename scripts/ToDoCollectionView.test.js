const jQuery = require('jquery')

const ToDoModel = require('./ToDoModel')
const ToDoCollection = require('./ToDoCollection')
const ToDoView = require('./ToDoView')
const ToDoCollectionView = require('./ToDoCollectionView')

describe('To do items list', () => {
  let toDoList, toDoListView
  const summaryRegex = /(\d*) \/ (\d*) items done/
  const event = {
      keydown: (key) => {
      return jQuery.Event('keydown', { key })
    }
  }
  beforeEach(() => {
    toDoList = new ToDoCollection([
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
    toDoListView = new ToDoCollectionView({
      collection: toDoList
    })
    toDoListView.render()
  })

  it('Should have the to-do-list class', () => {
    expect(toDoListView.$el.hasClass('to-do-list')).toBeTruthy()
  })

  it('Should have a check all icon', () => {
    const icon = toDoListView.$('.controller .all')
    expect(icon.hasClass('material-icon')).toBeTruthy()
  })

  it('Should have a remove done icon', () => {
    const icon = toDoListView.$('.controller .remove-done')
    expect(icon.hasClass('material-icon')).toBeTruthy()
  })

  it('Should have a textarea', () => {
    expect(toDoListView.$('.add textarea').attr('placeholder')).toBe('Add an item')
  })

  it('Should have a summary', () => {
    const summary = toDoListView.$('span').text().trim().match(summaryRegex)
    expect(summary[0]).toMatch(/\d* \/ \d* items done/)
    expect(summary[1]).toBe('0')
    expect(summary[2]).toBe('3')
  })

  it('Should not have the adding class', () => {
    expect(toDoListView.$el.hasClass('adding')).toBeFalsy()
  })

  describe('When the check all icon is clicked', () => {
    beforeEach(() => {
      toDoListView.$('.controller .all').click()
    })

    it('Should check all to do items', () => {
      expect(toDoListView.collection.where({done: true}).length).toBe(3)
    })

    it('Should uncheck all to do items', () => {
      toDoListView.$('.controller .all').click()
      expect(toDoListView.collection.where({done: true}).length).toBe(0)
    })

    it('Should have an updated summary', () => {
      let summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('3')
      expect(summary[2]).toBe('3')

      toDoListView.$('.controller .all').click()
      summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('0')
      expect(summary[2]).toBe('3')
    })
  })

  describe('When the remove done icon is clicked', () => {
    beforeEach(() => {
      toDoListView.$('.controller .remove-done').click()
    })

    it('Should remove all to do items that are done', () => {
      expect(toDoListView.collection.length).toBe(3)
      
      toDoListView.$('.controller .all').click()
      toDoListView.$('.controller .remove-done').click()
      expect(toDoListView.collection.length).toBe(0)
    })
    
    it('Should have an updated summary', () => {
      let summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('0')
      expect(summary[2]).toBe('3')

      toDoListView.$('.controller .all').click()
      toDoListView.$('.controller .remove-done').click()
      summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('0')
      expect(summary[2]).toBe('0')
    })
  })

  describe('When the add textarea is clicked', () => {
    beforeEach(() => {
      toDoListView.$('.add textarea').click()
    })

    it('Should have the adding class', () => {
      expect(toDoListView.$el.hasClass('adding')).toBeTruthy()
    })

    describe('And a key other than enter is pressed in the textarea', () => {      
      it('Should do nothing', () => {
        toDoListView.$('.add textarea').val('Mango')
        toDoListView.$('.add textarea').trigger(event.keydown('s'))
        expect(toDoListView.$('.add textarea').val()).toBe('Mango')
        expect(toDoListView.collection.length).toBe(3)
      })
    })

    describe('And enter is pressed in the textarea', () => {
      it('Should do nothing if the textarea is empty', () => {
        toDoListView.$('.add textarea').val(' ')
        toDoListView.$('.add textarea').trigger(event.keydown('Enter'))
        expect(toDoListView.$('.add textarea').val()).toBe(' ')
        expect(toDoListView.collection.length).toBe(3)
      })

      it('Should add a to do item', () => {
        toDoListView.$('.add textarea').val('Mango')
        toDoListView.$('.add textarea').trigger(event.keydown('Enter'))
        expect(toDoListView.collection.length).toBe(4)
      })
    })

    describe('And the textarea is blurred', () => {
      it('Should not have the adding class', () => {
        toDoListView.$('.add textarea').focusout() // jQuery implements the blur event as focusout
        expect(toDoListView.$el.hasClass('adding')).toBeFalsy()
      })
    })
  })

  describe('When a to do item is checked or unchecked', () => {
    it('Should have an updated summary', () => {
      const toDo = toDoListView.collection.get(1)
      toDo.toggle()
      let summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('1')
      expect(summary[2]).toBe('3')

      toDo.toggle()
      summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('0')
      expect(summary[2]).toBe('3')
    })
  })

  describe('When a to do item is removed', () => {
    beforeEach(() => {
      const toDo = toDoListView.collection.get(1)
      toDo.trigger('destroy', toDo)
    })

    it('Should remove the to do item', () => {
      expect(toDoListView.collection.length).toBe(2)
    })
    
    it('Should have an updated summary', () => {
      let summary = toDoListView.$('span').text().trim().match(summaryRegex)
      expect(summary[1]).toBe('0')
      expect(summary[2]).toBe('2')
    })
  })
})