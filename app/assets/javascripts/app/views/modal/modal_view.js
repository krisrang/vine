Vine.ModalView = Vine.View.extend({
  elementId: 'vine-modal',
  templateName: 'modal/modal',
  classNameBindings: [':modal', ':fade', 'controller.modalClass'],
  attributeBindings: ['backdrop:data-backdrop'],
  backdrop: 'static',

  click: function(e) {
    if (e.target !== e.currentTarget) return;
      
    e.stopPropagation();
    e.preventDefault();

    return this.get('controller').send('closeModal');
  }
});