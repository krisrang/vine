class ExceptionsController < ApplicationController
  skip_before_filter :check_xhr, :preload_json

  def not_found
    raise Vine::NotFound
  end
end