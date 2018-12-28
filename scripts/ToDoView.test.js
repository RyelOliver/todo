const ToDoModel = require('./ToDoModel')
const ToDoView = require('./ToDoView')

describe('To do items', () => {
  let toDo, toDoView
  beforeEach(() => {
    toDo = new ToDoModel({
      id: 1,
      description: 'One',
      order: 1
    })
    toDoView = new ToDoView({
      model: toDo
    })
    toDoView.render()
  })

  it('Should have the to-do class', () => {
    expect(toDoView.$el.hasClass('to-do')).toBeTruthy()
  })

  it('Should be draggable', () => {
    expect(toDoView.$el.attr('draggable')).toBeTruthy()
  })

  it('Should have a label with the description', () => {
    expect(toDoView.$('.view label').text()).toBe('One')
  })

  it('Should have an input with the description', () => {
    expect(toDoView.$('.edit input').val()).toBe('One')
  })

  it('Should have a remove icon', () => {
    const icon = toDoView.$('.view i')
    expect(icon.hasClass('material-icon')).toBeTruthy()
    expect(icon.hasClass('remove')).toBeTruthy()
  })

  it('Should not have the editing class', () => {
    expect(toDoView.$el.hasClass('editing')).toBeFalsy()
  })

  describe('When the label is clicked', () => {
    beforeEach(() => {
      toDoView.$('.view label').click()
    })

    it('Should have the editing class', () => {
      expect(toDoView.$el.hasClass('editing')).toBeTruthy()
    })

    it('Should focus on the input', () => {
      expect(toDoView.$('.edit input').is(':focus')).toBeTruthy()
    })

    describe('And the input is changed', () => {
      beforeEach(() => {
        toDoView.$('.edit input').val('Two')
        toDoView.$('.edit input').change()
      })

      it('Should have a label with the updated description', () => {
        expect(toDoView.$('.view label').text()).toBe('Two')
      })

      it('Should not have the editing class', () => {
        expect(toDoView.$el.hasClass('editing')).toBeFalsy()
      })
    })

    describe('And the input is blurred', () => {
      it('Should not have the editing class', () => {
        toDoView.$('.edit input').focusout() // jQuery implements the blur event as focusout
        expect(toDoView.$el.hasClass('editing')).toBeFalsy()
      })
    })
  })

  describe('When the checkbox is checked', () => {
    beforeEach(() => {
      toDoView.$('.view input').click()
    })

    it('Should have the done class', () => {
      expect(toDoView.$el.hasClass('done')).toBeTruthy()
    })

    it('Should have a checked checkbox', () => {
      expect(toDoView.$('.view input').attr('checked')).toBeTruthy()
    })
  })

  describe('When the checkbox is unchecked', () => {
    it('Should not have the done class', () => {
      expect(toDoView.$el.hasClass('done')).toBeFalsy()
    })

    it('Should have an unchecked checkbox', () => {
      expect(toDoView.$('.view input').attr('checked')).toBeFalsy()
    })
  })

  describe('When the remove icon is clicked', () => {
    it('Should remove the to do item', () => {
      const toDoDestroyed = jest.fn()
      toDo.once('destroy', toDoDestroyed) 
      toDoView.$('.remove').click()
      expect(toDoDestroyed).toHaveBeenCalled()
    })
  })
})