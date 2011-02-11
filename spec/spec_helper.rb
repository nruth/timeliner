require File.join(File.dirname(__FILE__), '..', 'timeline.rb')

require 'rubygems'
require 'sinatra'
require 'rack/test'
require 'rspec'

set :environment, :test

Rspec.configure do |config|

end