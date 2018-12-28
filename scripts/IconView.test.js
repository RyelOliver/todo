const IconView = require('./IconView')

describe('Icons', () => {  
  it('Should have the material-icon class', () => {
    const iconView = new IconView()
    expect(iconView.render().$el.hasClass('material-icon')).toBeTruthy()
  })
  
  it('Should have any additional classes provided', () => {
    const iconViewWithOneExtraClass = new IconView({
      classes: 'one',
      code: 'cake'
    })
    expect(iconViewWithOneExtraClass.render().$el.hasClass('material-icon')).toBeTruthy()
    expect(iconViewWithOneExtraClass.render().$el.hasClass('one')).toBeTruthy()

    const iconViewWithTwoExtraClasses = new IconView({
      classes: 'one two',
      code: 'cake'
    })
    expect(iconViewWithTwoExtraClasses.render().$el.hasClass('material-icon')).toBeTruthy()
    expect(iconViewWithTwoExtraClasses.render().$el.hasClass('one')).toBeTruthy()
    expect(iconViewWithTwoExtraClasses.render().$el.hasClass('two')).toBeTruthy()
  })
  
  it('Should have the icon code provided', () => {
    const iconView = new IconView({
      code: 'cake'
    })
    const innerText = iconView.render().$el.html().match(/(.*?)<div.*div>/s)[1]
    expect(innerText.trim()).toBe('cake')
  })

  it('Should have a default tip', () => {
    const iconView = new IconView({
      code: 'cake'
    })
    const tip = iconView.render().$('.tool-tip')
    expect(tip.text().trim()).toBe('Add a tip for the icon')
  })

  it('Should have the tip provided', () => {
    const iconView = new IconView({
      code: 'cake',
      toolTip: 'Carrot cake'
    })
    const tip = iconView.render().$('.tool-tip')
    expect(tip.text().trim()).toBe('Carrot cake')
  })
})