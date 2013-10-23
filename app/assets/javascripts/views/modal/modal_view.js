Vine.ModalView = Vine.View.extend({
  elementId: 'vine-modal',
  templateName: 'modal/modal',
  classNameBindings: [':modal', ':fade', 'controller.modalClass'],
  attributeBindings: ['backdrop:data-backdrop'],
  backdrop: 'static'
});