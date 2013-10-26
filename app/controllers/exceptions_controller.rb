class ExceptionsController < ApplicationController
  skip_before_filter :preload_json

  def not_found
    raise Vine::NotFound
  end
end