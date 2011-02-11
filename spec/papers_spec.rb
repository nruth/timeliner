require File.dirname(__FILE__) + '/spec_helper'

set :environment, :test

describe '/papers/watermarking' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  it "queries YQL mendeley for watermarking"
  it "fetches multiple pages"
end
