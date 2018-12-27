const IconView = require('./IconView')

describe('Icons', () => {  
  it('Should have the material-icon class', () => {
    const icon = new IconView()
    expect(icon.render().$el.hasClass('material-icon')).toBeTruthy()
  })
  
  it('Should have any additional classes provided', () => {
    const iconWithOneExtraClass = new IconView({
      classes: 'one',
      code: 'cake'
    })
    expect(iconWithOneExtraClass.render().$el.hasClass('material-icon')).toBeTruthy()
    expect(iconWithOneExtraClass.render().$el.hasClass('one')).toBeTruthy()

    const iconWithTwoExtraClasses = new IconView({
      classes: 'one two',
      code: 'cake'
    })
    expect(iconWithTwoExtraClasses.render().$el.hasClass('material-icon')).toBeTruthy()
    expect(iconWithTwoExtraClasses.render().$el.hasClass('one')).toBeTruthy()
    expect(iconWithTwoExtraClasses.render().$el.hasClass('two')).toBeTruthy()
  })
  
  it('Should have the icon code provided', () => {
    const icon = new IconView({
      code: 'cake'
    })
    const innerText = icon.render().$el.html().match(/(.*?)<div.*div>/s)[1]
    expect(innerText.trim()).toBe('cake')
  })

  it('Should have a default tip', () => {
    const icon = new IconView({
      code: 'cake'
    })
    const tip = icon.render().$('.tool-tip')
    expect(tip.text().trim()).toBe('Add a tip for the icon')
  })

  it('Should have the tip provided', () => {
    const icon = new IconView({
      code: 'cake',
      toolTip: 'Carrot cake'
    })
    const tip = icon.render().$('.tool-tip')
    expect(tip.text().trim()).toBe('Carrot cake')
  })
})