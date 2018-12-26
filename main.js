const ToDo = Backbone.Model.extend({
  defaults: {
    'done': false
  },

  toggle: function () {
    this.set('done', !this.get('done'))
  },

  editDescription: function (description) {
    this.set('description', description)
  },

  validate: function (attributes) {
    const { id, description, done, order } = attributes

    if (id === undefined) {
      throw Error('ID is required.')
    }
    if (description === undefined || description.trim() === '') {
      throw Error('Description is required.')
    }
    if (done === undefined) {
      throw Error('Done is required.')
    }
    if (order === undefined) {
      throw Error('Order is required.')
    }
  }
})

// [TODO] Sync with local storage
// Use an existing library? Nah ...
const ToDoList = Backbone.Collection.extend({
  model: ToDo,
  comparator: 'order',

  nextId: function () {
    return this.length ? this.reduce((maxId, toDo) => {
      const id = toDo.get('id')
      return id > maxId ? id : maxId
    }, 1) + 1 : 1
  }
})

const IconView = Backbone.View.extend({
  tagName: 'i',
  className: 'material-icon',

  initialize: function (props) {
    this.props = props
  },

  render: function () {
    const { classes, code, toolTip } = this.props
    this.$el.html(`
      ${code}
      <div class="tool-tip">
        <span>${toolTip ? toolTip : 'Add a tip for the icon'}</span>
      </div>
    `)
    this.$el.addClass(classes)
    return this
  }
})

const ToDoPlaceholderView = Backbone.View.extend({
  tagName: 'li',
  className: 'placeholder',

  initialize: function (props) {
    this.props = props
  },

  render: function () {
    const { description, done } = this.props
    this.$el.html(`
      <div class="${done ? 'view done' : 'view'}">
        <input type="checkbox" ${done ? 'checked' : ''}/>
        <label>${description}</label>
      </div>
    `)
    return this
  }
})

const ToDoView = Backbone.View.extend({
  tagName: 'li',
  className: 'to-do',
  attributes: {
    draggable: true
  },
  
  events: {
    'click .view input': 'onClickDone',
    'click .view label': 'onClickEdit',
    'change .edit input': 'onChange',
    'blur .edit input': 'onBlurEdit',
    // [TODO] Need to think about the scope of the blur event
    // Currently it's possible to edit one item and the click to edit another without ending the initial edit
    'click .remove': 'onClickRemove'
  },

  initialize: function () {
    this.listenTo(this.model, 'change', this.render)
    this.listenTo(this.model, 'destroy', this.removed)
  },

  onClickDone: function() {
    this.model.toggle()
  },

  editing: false,
  
  onClickEdit: function(event) {
    if (this.editing) {
      return
    } else {
      this.editing = true
      this.$el.addClass('editing')
      this.$('.edit input').focus()
    }
  },

  onChange: function(event) {
    this.model.editDescription(event.target.value)
  },
  
  onBlurEdit: function(event) {    
    if (!this.editing) {
      return
    } else {
      this.editing = false
      this.$el.removeClass('editing')
    }
  },

  onClickRemove: function() {
    this.model.trigger('destroy', this.model)
  },

  removed: function() {
    this.remove()
  },

  render: function () {
    const id = this.model.get('id')
    const description = this.model.escape('description')
    const done = this.model.get('done')

    this.$el.html(`
      <div class="view">
        <input id="toDo${id}Done" type="checkbox" ${done ? 'checked' : ''}/>
        <label>${description}</label>
      </div>
      <div class="edit">
        <input id="toDo${id}Description" type="text" value="${description}">
      </div>
    `)

    if (done) {
      this.$el.addClass('done')
    } else {    
      this.$el.removeClass('done')
    }

    const removeIcon = new IconView({
      classes: 'remove',
      code: 'clear',
      toolTip: 'Delete the item'
    })
    this.$('.view').append(removeIcon.render().el)

    return this
  }
})

const ToDoListView = Backbone.View.extend({
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
    'drop li': 'onDrop'
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

    const toDo = new ToDo({
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

const toDoList = new ToDoList()
const toDoListView = new ToDoListView({
  collection: toDoList
})

document.querySelector('#toDoList').append(toDoListView.render().el)

toDoList.reset([
  new ToDo({
    id: 1,
    description: 'One, two',
    order: 1
  }),
  new ToDo({
    id: 2,
    description: 'Skip a few',
    order: 2
  }),
  new ToDo({
    id: 3,
    description: 'Banana',
    order: 4
  }),
  new ToDo({
    id: 4,
    description: 'Ninety nine',
    order: 3
  })
])