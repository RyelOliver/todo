const Backbone = require('backbone')

const ToDoModel = require('./ToDoModel')
const IconView = require('./IconView')
const ToDoPlaceholderView = require('./ToDoPlaceholderView')
const ToDoView = require('./ToDoView')

const ToDoCollectionView = Backbone.View.extend({
  tagName: 'div',
  className: 'to-do-list',
  
  events: {
    'click .add textarea': 'onClickAdd',
    'keydown .add textarea': 'onKeyDownAdd',
    'blur .add textarea': 'onBlurAdd',
    'click .all': 'onClickAll',
    'click .remove-done': 'onClickRemoveDone',
    'dragstart .to-do': 'onDragStart',
    'dragenter .to-do': 'onDragEnter',
    'dragover li': 'onDragOver',
    'dragend .to-do': 'onDragEnd',
    'drop li': 'onDrop',
    'drop .add textarea': function () {
      return false
    }
  },
  
  initialize: function () {
    this.listenTo(this.collection, 'add', this.added)
    this.listenTo(this.collection, 'change:done', this.changeDone)
    this.listenTo(this.collection, 'remove', this.removed)
    this.listenTo(this.collection, 'reset', this.reset)
  },

  getListItem: function (element) {
    let toDo = element
    while (toDo.tagName !== 'LI') {
      toDo = toDo.parentElement
    }
    return toDo
  },

  removePlaceholder: function () {
    const placeholder = this.$('.placeholder')
    if (placeholder) {
      placeholder.remove()
    }
  },

  onClickAdd: function () {
    this.$el.addClass('adding')
  },

  onKeyDownAdd: function(event) {
    if (event.key != 'Enter' || event.target.value.trim() === '') {
      return
    }

    const toDo = new ToDoModel({
      id: this.collection.nextId(),
      description: event.target.value,
      order: this.collection.length ? this.collection.last().get('order') + 1 : 1
    })
    this.collection.add(toDo)
    
    event.target.value = ''
    event.preventDefault()
  },
  
  onBlurAdd: function (event) {
    if (event.target.value.trim() === '') {
      event.target.value = ''
    }
    this.$el.removeClass('adding')
  },
    
  onClickAll: function() {
    const { done, total } = this.count
    const minimumToggle = done / total < 0.5
    this.collection.map((toDo) => {
      toDo.set('done', minimumToggle)
    })
  },
    
  onClickRemoveDone: function() {
    this.collection.reset(this.collection.where({ done: false }))
  },

	onDragStart: function (event) {
    const toDoElement = this.getListItem(event.target)
    const toDoId = parseInt(toDoElement.querySelector('.view input').id.match(/toDo(\d*?)Done/)[1])
    event.originalEvent.dataTransfer.setData('text/plain', toDoId)
    event.originalEvent.dataTransfer.setData(toDoId, 'id') // Hack to make the ID property accessible in the onDragEnter method
	},
  
	onDragEnter: function (event) {    
    const toDoElement = this.getListItem(event.target)
    const list = toDoElement.parentElement

    const movedToDoId = parseInt(event.originalEvent.dataTransfer.types[1])
    if (movedToDoId === parseInt(toDoElement.querySelector('.view input').id.match(/toDo(\d*?)Done/)[1])) {
      return
    }
    const movedToDo = this.collection.get(movedToDoId)

    const toDoPlaceholder = new ToDoPlaceholderView({
      description: movedToDo.get('description'),
      done: movedToDo.get('done')
    })

    this.removePlaceholder()
    list.insertBefore(toDoPlaceholder.render().el, toDoElement)
  },
  
  onDragOver: function (event) {
		event.preventDefault()
    event.originalEvent.dataTransfer.dropEffect = 'move'
    
    // [TODO] Are we dragging over the top half or bottom half?
    // event.clientY gets us the y position in the DOM
    // el.getBoundingClientRect().y gets us the y position of the element in the DOM
    // el.getBoundingClientRect().height gets us the height of the element
    // clientY - el.y / el.height > 0.5 ? placeholder should be after : placeholder should be before
	},

	onDragEnd: function (event) {
    this.removePlaceholder()
  },
  
	onDrop: function (event) {
    const movedToDoId = parseInt(event.originalEvent.dataTransfer.getData('text/plain'))
    const movedToDo = this.collection.get(movedToDoId)
    const movedToDoOrder = movedToDo.get('order')

    const targetElement = this.getListItem(event.target)
    const movedBeforeToDoElement = targetElement.classList.contains('to-do') ? targetElement : targetElement.nextSibling
    const movedBeforeToDoId = parseInt(movedBeforeToDoElement.querySelector('.view input').id.match(/toDo(\d*?)Done/)[1])
    const movedBeforeToDo = this.collection.get(movedBeforeToDoId)
    const movedBeforeToDoOrder = movedBeforeToDo.get('order')

    if (movedToDoOrder === movedBeforeToDoOrder) {
      return
    }

    const list = movedBeforeToDoElement.parentElement

    const prioritised = movedToDoOrder > movedBeforeToDoOrder
    this.collection.each((toDo) => {
      const order = toDo.get('order')
      if (prioritised) {
        if (order >= movedBeforeToDoOrder && order < movedToDoOrder) {
          toDo.set('order', order + 1)
        }
      } else {
        if (order <= movedBeforeToDoOrder && order > movedToDoOrder) {
          toDo.set('order', order - 1)
        }
      }
    })
    movedToDo.set('order', movedBeforeToDoOrder)
    this.collection.sort()

    const movedToDoElement = this.getListItem(this.$(`#toDo${movedToDoId}Done`)[0])
    movedToDoElement.remove()
    this.removePlaceholder()

    const toDoView = new ToDoView({
      model: movedToDo
    })
    list.insertBefore(toDoView.render().el, movedBeforeToDoElement)
	},
    
  added: function(toDo) {
    this.renderItem(toDo)
    this.renderSummary()
  },
    
  changeDone: function() {
    this.renderSummary()
  },

  removed: function (toDo) {
    this.renderSummary()
  },

  reset: function () {
    this.renderList()
    this.renderSummary()
  },

  renderItem: function (toDo) {
    const toDoView = new ToDoView({
      model: toDo
    })
    this.list.append(toDoView.render().el)
  },

  renderList: function () {
    this.list.empty()
    this.collection.map((toDo) => {
      this.renderItem(toDo)
    })
  },

  renderSummary: function () {
    const done = this.collection.where({ done: true }).length
    const total = this.collection.length
    this.summary.html(`
      ${done} / ${total} items done
    `)
    this.count = {
      done,
      total
    }
  },

  render: function () {    
    this.$el.html(`
      <h3>List</h3>
      <div class="controller"></div>
      <ul>
      </ul>
      <div class="add">
        <textarea placeholder="Add an item"/>
      </div>
      <span></span>
    `)

    this.controller = this.$('.controller')
    this.list = this.$('ul')
    this.summary = this.$('span')
    
    const allIcon = new IconView({
      classes: 'all',
      code: 'playlist_add_check',
      toolTip: 'Check or uncheck all the items'
    })
    this.controller.append(allIcon.render().el)
    const removeIcon = new IconView({
      classes: 'remove-done',
      code: 'delete_sweep',
      toolTip: 'Delete all the done items'
    })
    this.controller.append(removeIcon.render().el)

    this.renderList()
    this.renderSummary()

    return this
  }
})

module.exports = ToDoCollectionView