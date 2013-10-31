require 'vine_iife'

Rails.application.assets.register_preprocessor('application/javascript', VineIIFE)