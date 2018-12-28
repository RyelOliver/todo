const ToDoPlaceholderView = require('./ToDoPlaceholderView')

describe('To do item placeholders', () => {
  let doneToDoPlaceholderView, notDoneToDoPlaceholderView
  beforeAll(() => {
    doneToDoPlaceholderView = new ToDoPlaceholderView({
      description: 'One',
      done: true
    })
    doneToDoPlaceholderView.render()

    notDoneToDoPlaceholderView = new ToDoPlaceholderView({
      description: 'Two',
      done: false
    })
    notDoneToDoPlaceholderView.render()
  })

  it('Should have the placeholder class', () => {
    expect(doneToDoPlaceholderView.$el.hasClass('placeholder')).toBeTruthy()
    expect(notDoneToDoPlaceholderView.$el.hasClass('placeholder')).toBeTruthy()
  })

  it('Should not be draggable', () => {
    expect(doneToDoPlaceholderView.$el.attr('draggable')).toBeFalsy()
    expect(notDoneToDoPlaceholderView.$el.attr('draggable')).toBeFalsy()
  })

  it('Should have a label with the description', () => {
    expect(doneToDoPlaceholderView.$('.view label').text()).toBe('One')
    expect(notDoneToDoPlaceholderView.$('.view label').text()).toBe('Two')
  })

  describe('When the to do item is done', () => {
    it('Should have the done class', () => {
      expect(doneToDoPlaceholderView.$el.hasClass('done')).toBeTruthy()
    })

    it('Should have a checked checkbox', () => {
      expect(doneToDoPlaceholderView.$('.view input').attr('checked')).toBeTruthy()
    })
  })

  describe('When the to do item is not done', () => {
    it('Should not have the done class', () => {
      expect(notDoneToDoPlaceholderView.$el.hasClass('done')).toBeFalsy()
    })

    it('Should have an unchecked checkbox', () => {
      expect(notDoneToDoPlaceholderView.$('.view input').attr('checked')).toBeFalsy()
    })
  })
})